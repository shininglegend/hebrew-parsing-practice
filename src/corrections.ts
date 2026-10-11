import list from "../data/oshb-corrections.json";
import { bookEntry } from "./utils";

/**
 * Local fixes to OSHB tags, kept apart from the vendored chapter files so a data refresh
 * cannot overwrite them. See data/README.md.
 *
 * The chapter files carry no OSHB word id, so an entry is located by its OSIS `ref` and
 * `index`, the word's 0-based position in that verse of the chapter file (the same position
 * `loadVerse` puts in the word id, `joshua-3-7-19`). `id` is the OSHB `<w id>`, kept for the
 * audit script and the upstream report. `word` and `oshb_morph` must still match the chapter
 * file, or the entry is skipped with a warning: upstream may have fixed or changed the tag.
 */
export type Correction = {
  id: string;
  ref: string;
  index: number;
  word: string;
  oshb_morph: string;
  corrected_morph: string;
  reason: string;
};

export const CORRECTIONS: Correction[] = list;

/** OSHB marks the language on the first part ("HR/Sp2fs"); the chapter files drop the Hebrew "H". */
export function dataMorph(oshb: string): string {
  return oshb.replace(/^H/, "");
}

type Located = { correction: Correction; verse: number };

function locate(correction: Correction, filename: string, chapter: number): Located | null {
  const match = /^(.+)\.(\d+)\.(\d+)$/.exec(correction.ref);
  if (!match) return null;
  if (bookEntry(match[1])?.filename !== filename) return null;
  if (Number(match[2]) !== chapter) return null;
  return { correction, verse: Number(match[3]) };
}

/**
 * Apply the corrections for one chapter file (`verses[] → words[] → [surface, strongs, morph]`).
 * Returns a corrected copy; the input is not changed. This runs where the chapter is loaded,
 * so the answer key, the signal cards, the tutor prompt, and saved attempts all see the fix.
 */
export function applyCorrections(
  verses: unknown,
  filename: string,
  chapter: number,
  corrections: Correction[] = CORRECTIONS,
  warn: (message: string) => void = console.warn
): unknown {
  if (!Array.isArray(verses)) return verses;
  const here = corrections
    .map((correction) => locate(correction, filename, chapter))
    .filter((found): found is Located => found !== null);
  if (here.length === 0) return verses;

  const out = verses.map((verse) => (Array.isArray(verse) ? [...verse] : verse));
  for (const { correction, verse } of here) {
    const words = out[verse - 1];
    const word = Array.isArray(words) ? words[correction.index] : undefined;
    const skip = (why: string) =>
      warn(`OSHB correction ${correction.id} (${correction.ref}) skipped: ${why}`);
    if (!Array.isArray(word) || word.length < 3) {
      skip(`no word at index ${correction.index}`);
      continue;
    }
    // Editors may reorder combining marks; compare the same normalization of both
    if (String(word[0]).normalize("NFC") !== correction.word.normalize("NFC")) {
      skip(`expected ${correction.word} at index ${correction.index}, found ${word[0]}`);
      continue;
    }
    if (word[2] !== dataMorph(correction.oshb_morph)) {
      skip(
        `source morph is ${word[2]}, not ${dataMorph(correction.oshb_morph)}; upstream may have changed the tag`
      );
      continue;
    }
    const fixed = [...word];
    fixed[2] = dataMorph(correction.corrected_morph);
    (words as unknown[])[correction.index] = fixed;
  }
  return out;
}
