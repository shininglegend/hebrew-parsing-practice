import { afterEach, describe, expect, it, vi } from "vitest";
import { loadVerse } from "./api";
import { applyCorrections, CORRECTIONS, type Correction, dataMorph } from "./corrections";
import { findCue } from "./signals";
import { bookEntry } from "./utils";

// The vendored chapter files, loaded on demand
const CHAPTERS = import.meta.glob<unknown[]>("../public/hebrew-data/bible-books/*/chapter_*.json", {
  import: "default",
});

async function chapterFile(filename: string, chapter: number): Promise<unknown[]> {
  const load = CHAPTERS[`../public/hebrew-data/bible-books/${filename}/chapter_${chapter}.json`];
  if (!load) throw new Error(`no chapter file for ${filename} ${chapter}`);
  // A deep copy, so a test that changes it cannot leak into another
  return structuredClone(await load());
}

// loadVerse fetches from the app's assets; serve the vendored files instead
function serveDataFromDisk() {
  vi.stubGlobal("fetch", async (url: string) => {
    const [, filename, chapter] = /\/([^/]+)\/chapter_(\d+)\.json$/.exec(url) ?? [];
    return new Response(JSON.stringify(await chapterFile(filename, Number(chapter))), {
      headers: { "content-type": "application/json" },
    });
  });
}

function entry(ref: string): Correction {
  const found = CORRECTIONS.find((c) => c.ref === ref);
  if (!found) throw new Error(`no correction for ${ref}`);
  return found;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function suffixWord(words: Awaited<ReturnType<typeof loadVerse>>["words"], id: string) {
  const word = words.find((w) => w.id === id);
  if (!word) throw new Error(`no word ${id}`);
  return word;
}

describe("OSHB corrections overlay", () => {
  it("grades Joshua 3:7 עִמָּךְ as second masculine singular", async () => {
    serveDataFromDisk();
    const verse = await loadVerse("Joshua 3:7");
    const word = suffixWord(verse.words, "joshua-3-7-19");
    expect(word.surface).toBe("עִמָּֽ/ךְ");
    expect(word.parse).toMatchObject({
      suffixPerson: "second",
      suffixGender: "masculine",
      suffixNumber: "singular",
    });
  });

  it("leaves Rahab's עִמָּךְ in Joshua 2:14 second feminine singular", async () => {
    serveDataFromDisk();
    const verse = await loadVerse("Joshua 2:14");
    const word = suffixWord(verse.words, "joshua-2-14-19");
    expect(word.surface).toBe("עִמָּ֖/ךְ");
    expect(word.parse).toMatchObject({
      suffixPerson: "second",
      suffixGender: "feminine",
      suffixNumber: "singular",
    });
  });

  it("explains the corrected suffix as pausal 2ms, and Rahab's as 2fs", async () => {
    serveDataFromDisk();
    const josh37 = await loadVerse("Joshua 3:7");
    const fixed = findCue(josh37.words, suffixWord(josh37.words, "joshua-3-7-19"), "suffixGender");
    expect(fixed?.note).toContain("second masculine singular");
    expect(fixed?.note).toContain("in pause");

    const josh214 = await loadVerse("Joshua 2:14");
    const rahab = findCue(
      josh214.words,
      suffixWord(josh214.words, "joshua-2-14-19"),
      "suffixGender"
    );
    expect(rahab?.note).toContain("second feminine singular");
  });

  it("warns and skips an entry whose oshb_morph no longer matches the source", async () => {
    const stale: Correction = {
      ...entry("Josh.3.7"),
      oshb_morph: "HR/Sp3fs",
    };
    const warn = vi.fn();
    const verses = await chapterFile("joshua", 3);
    const out = applyCorrections(verses, "joshua", 3, [stale], warn) as unknown[][][];
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("06965");
    expect(warn.mock.calls[0][0]).toContain("skipped");
    expect(out[6][19][2]).toBe("R/Sp2fs");
  });

  it("warns and skips an entry whose word is not at its index", async () => {
    const moved: Correction = { ...entry("Josh.3.7"), index: 18 };
    const warn = vi.fn();
    const out = applyCorrections(
      await chapterFile("joshua", 3),
      "joshua",
      3,
      [moved],
      warn
    ) as unknown[][][];
    expect(warn).toHaveBeenCalledTimes(1);
    expect(out[6][18][2]).not.toBe("R/Sp2ms");
  });

  it("does not change the chapter it was given", async () => {
    const verses = (await chapterFile("joshua", 3)) as unknown[][][];
    applyCorrections(verses, "joshua", 3, CORRECTIONS, vi.fn());
    expect(verses[6][19][2]).toBe("R/Sp2fs");
  });

  // Fails when a data refresh moves or retags a corrected word, so the overlay is rechecked
  it("still matches the vendored chapter files, entry by entry", async () => {
    for (const c of CORRECTIONS) {
      const [, book, chapter, verse] = /^(.+)\.(\d+)\.(\d+)$/.exec(c.ref) ?? [];
      const filename = bookEntry(book)?.filename ?? `unknown book in ${c.ref}`;
      const word = ((await chapterFile(filename, Number(chapter))) as unknown[][][])[
        Number(verse) - 1
      ][c.index];
      expect(word[0], c.id).toBe(c.word);
      expect(word[2], c.id).toBe(dataMorph(c.oshb_morph));
      expect(c.corrected_morph, c.id).not.toBe(c.oshb_morph);
    }
    expect(new Set(CORRECTIONS.map((c) => c.id)).size).toBe(CORRECTIONS.length);
  });
});
