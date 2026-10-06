import type { ParseFields, Verse, Word } from "./types";
import { bookEntry, joinPrefixes, splitPrefixes } from "./utils";

/**
 * Open Scriptures Hebrew Bible morphology, served from this app's own assets.
 *
 * Each chapter file holds `verses[] → words[] → [surface, strongs, morph]`, for example
 * `["בְּ/רֵאשִׁ֖ית", "Hb/H7225", "R/Ncfsa"]`. The "/" in all three strings separates the
 * morphemes OSHB tagged: prefixes first, then the main word, then any suffix.
 *
 * Codes (see hebrewMorphCodes.html for the full table):
 * - Noun: N + type + gender + number + state ("Ncfsa")
 * - Verb, finite: V + stem + tense + person + gender + number ("Vqp3ms")
 * - Verb, participle: V + stem + r|s + gender + number + state ("Vqrmsa")
 * - Verb, infinitive: V + stem + a|c ("Vqc")
 * - Adjective / numeral: A + a|c|o|g + gender + number + state ("Aamsa")
 * - Pronoun: P + type + person + gender + number ("Pp3ms")
 * - Preposition R (Rd = with the article), conjunction C, adverb D, interjection I
 * - Particle: T + type ("Td" article, "Ti" interrogative, "Tn" negative, "Tr" relative, "To" object marker)
 * - Suffix: S + p + person + gender + number ("Sp3ms"), or Sd / Sh / Sn
 * - A leading "A" on a part marks Aramaic ("AVqp3ms"); Hebrew parts carry no language letter.
 *
 * Which parts are prefixes is decided by the Strong's string: "Hb Hl Hk Hm Hc Hd Hs Hi" name
 * the prefix, and the morph part beside it only says how OSHB tagged it ("R", "Rd", "C", "Td", "Ti").
 */

const HEBREW_STEMS: Record<string, string> = {
  q: "qal",
  N: "niphal",
  p: "piel",
  P: "pual",
  h: "hiphil",
  H: "hophal",
  t: "hithpael",
  o: "polel",
  r: "hithpolel",
  m: "poel",
  Q: "qal passive",
  l: "pilpel",
};

const ARAMAIC_STEMS: Record<string, string> = {
  q: "peal",
  Q: "peil",
  p: "pael",
  h: "haphel",
  a: "aphel",
  u: "hithpeel",
  M: "hithpaal",
  H: "hophal",
  o: "polel",
  r: "hithpolel",
  m: "poel",
};

const TENSES: Record<string, string> = {
  p: "perfect (qatal)",
  q: "sequential perfect",
  i: "imperfect (yiqtol)",
  w: "sequential imperfect",
  h: "cohortative",
  j: "jussive",
  v: "imperative",
  r: "participle active",
  s: "participle passive",
  a: "infinitive absolute",
  c: "infinitive construct",
};

const PERSON: Record<string, string> = { "1": "first", "2": "second", "3": "third" };
const GENDER: Record<string, string> = { m: "masculine", f: "feminine", b: "common", c: "common" };
const NUMBER: Record<string, string> = { s: "singular", p: "plural", d: "dual" };
const STATE: Record<string, string> = { a: "absolute", c: "construct", d: "determined" };

/** Strong's prefix markers → the drill's prefix labels */
const PREFIX_BY_STRONGS: Record<string, string> = {
  Hb: "ב (in/with)",
  Hl: "ל (to/for)",
  Hk: "כ (like/as)",
  Hm: "מ (from)",
  Hc: "ו (and)",
  Hd: "ה (the)",
  Hs: "ש (that/which)",
  Hi: "interrogative ה",
};

const PRONOUN_TYPES: Record<string, string> = {
  p: "personal",
  d: "demonstrative",
  i: "interrogative",
  f: "indefinite",
  r: "relative",
};

const PARTICLE_TYPES: Record<string, string> = {
  d: "definite article",
  i: "interrogative",
  n: "negative",
  r: "relative",
  a: "affirmation",
  o: "direct object marker",
  m: "demonstrative",
  e: "exhortation",
  j: "interjection",
};

const LANGUAGE_SPLIT = /^(A?)([A-Z].*)$/;

function nominal(fields: Partial<ParseFields>, code: string, from: number) {
  const gender = GENDER[code[from]];
  const number = NUMBER[code[from + 1]];
  const state = STATE[code[from + 2]];
  if (gender) fields.gender = gender;
  if (number) fields.number = number;
  if (state) fields.state = state;
}

/**
 * Decode one morph part. `Hx` prefix markers and `S…` suffixes decode too, so a part can
 * be read on its own; `decodeWord` decides which parts are prefixes.
 */
export function decodeHebrewMorphology(code: string): Partial<ParseFields> {
  const fields: Partial<ParseFields> = {};
  if (!code) return fields;

  // Strong's-style prefix markers (Hb, Hl, …) sometimes show up as morph codes too
  if (/^H[a-z]$/.test(code)) {
    const prefix = PREFIX_BY_STRONGS[code];
    if (prefix) fields.prefix = [prefix];
    return fields;
  }

  const split = LANGUAGE_SPLIT.exec(code);
  if (!split) return fields;
  const aramaic = split[1] === "A";
  const core = split[2];
  const kind = core[0];

  switch (kind) {
    case "S": {
      const type = core[1];
      if (type === "p") {
        fields.suffix = "pronominal suffix";
        const person = PERSON[core[2]];
        const gender = GENDER[core[3]];
        const number = NUMBER[core[4]];
        if (person) fields.suffixPerson = person;
        if (gender) fields.suffixGender = gender;
        if (number) fields.suffixNumber = number;
      } else if (type === "d") fields.suffix = "directional he";
      else if (type === "h") fields.suffix = "paragogic he";
      else if (type === "n") fields.suffix = "paragogic nun";
      return fields;
    }
    case "N": {
      const type = core[1];
      fields.pos =
        type === "p" ? "noun (proper)" : type === "g" ? "noun (gentilic)" : "noun (common)";
      fields.nounType = type === "p" ? "proper" : type === "g" ? "gentilic" : "common";
      nominal(fields, core, 2);
      return fields;
    }
    case "V": {
      fields.pos = "verb";
      const stem = (aramaic ? ARAMAIC_STEMS : HEBREW_STEMS)[core[1]];
      fields.stem = stem ?? (core.length > 1 ? "other (rare)" : undefined);
      const tense = TENSES[core[2]];
      if (tense) fields.tense = tense;
      const tenseCode = core[2];
      if (tenseCode === "r" || tenseCode === "s") {
        // Participles agree like nominals: gender, number, state. No person.
        nominal(fields, core, 3);
      } else if (tenseCode !== "a" && tenseCode !== "c") {
        // Finite forms: person, gender, number
        const person = PERSON[core[3]];
        const gender = GENDER[core[4]];
        const number = NUMBER[core[5]];
        if (person) fields.person = person;
        if (gender) fields.gender = gender;
        if (number) fields.number = number;
      }
      return fields;
    }
    case "A": {
      const type = core[1];
      if (type === "c" || type === "o") {
        fields.pos = "numeral";
        fields.numeralType = type === "c" ? "cardinal" : "ordinal";
      } else {
        fields.pos = "adjective";
        if (type === "g") fields.adjectiveType = "gentilic";
      }
      nominal(fields, core, 2);
      return fields;
    }
    case "P": {
      fields.pos = "pronoun";
      const type = PRONOUN_TYPES[core[1]];
      if (type) fields.pronounType = type;
      const person = PERSON[core[2]];
      const gender = GENDER[core[3]];
      const number = NUMBER[core[4]];
      if (person) fields.person = person;
      if (gender) fields.gender = gender;
      if (number) fields.number = number;
      return fields;
    }
    case "R":
      fields.pos = "preposition";
      if (core[1] === "d") fields.particleType = "definite article";
      return fields;
    case "C":
      fields.pos = "conjunction";
      return fields;
    case "D":
      fields.pos = "adverb";
      return fields;
    case "T": {
      fields.pos = "particle";
      const type = PARTICLE_TYPES[core[1]];
      if (type) fields.particleType = type;
      return fields;
    }
    case "I":
      fields.pos = "interjection";
      return fields;
    default:
      return fields;
  }
}

export type RawWord = [surface: string, strongs: string, morph: string];

const MAIN_STRONGS = /^H\d+/;

/** One OSHB record → the gold parse the drill grades against. */
export function decodeWord(raw: RawWord, id: string): Word {
  const [surface, strongs, morphCode] = raw;
  const morphParts = morphCode.split("/");
  const strongsParts = strongs.split("/");

  const parse: Partial<ParseFields> = {};
  const prefixes: string[] = [];
  let lemma: string | undefined;
  let sawMain = false;

  for (let i = 0; i < morphParts.length; i++) {
    const part = morphParts[i];
    if (!part) continue;
    const strong = strongsParts[i] ?? "";
    const prefix = PREFIX_BY_STRONGS[strong];

    // "לְ/ךָ" is Hl + "R/Sp2ms": a preposition carrying a suffix, not a prefix on nothing.
    const restIsSuffix = morphParts.slice(i + 1).every((rest) => /^A?S/.test(rest));
    if (prefix && !sawMain && i < morphParts.length - 1 && !restIsSuffix) {
      // A prefix. "Rd" is a preposition that has swallowed the article: two prefixes in one part.
      prefixes.push(prefix);
      if (/^A?Rd$/.test(part) && prefix !== "ה (the)") prefixes.push("ה (the)");
      continue;
    }

    const decoded = decodeHebrewMorphology(part);
    if (decoded.suffix) {
      // Suffix parts have no Strong's entry; they come after the main word
      Object.assign(parse, decoded);
      continue;
    }
    if (sawMain && /^A?T[a-z]$/.test(part)) {
      // Aramaic emphatic ending tagged as a trailing article ("ANcmsd/Td"). The state already says determined.
      continue;
    }
    if (decoded.prefix && !decoded.pos) {
      prefixes.push(...decoded.prefix);
      continue;
    }
    Object.assign(parse, decoded);
    if (decoded.pos) {
      sawMain = true;
      if (!lemma && MAIN_STRONGS.test(strong)) lemma = strong.match(MAIN_STRONGS)?.[0];
    }
  }

  if (!lemma) {
    lemma = strongsParts.map((part) => part.match(MAIN_STRONGS)?.[0]).find(Boolean);
  }

  const joined = joinPrefixes(prefixes);
  if (joined) parse.prefix = splitPrefixes(joined);

  return {
    surface,
    lemma,
    strongs,
    parse,
    id,
    afterSpace: true,
  };
}

/**
 * Parse a verse reference like "Genesis 1:1", "Gen 1:1", or "1 Samuel 3:4"
 * Returns the book's data filename, display name, and 1-based chapter and verse, or null if invalid
 */
export function parseVerseRef(
  ref: string
): { filename: string; name: string; chapter: number; verse: number } | null {
  const match = ref.trim().match(/^(.+?)\s+(\d+)[:.](\d+)$/);
  if (!match) return null;
  const book = bookEntry(match[1]);
  const chapter = Number.parseInt(match[2], 10);
  const verse = Number.parseInt(match[3], 10);
  if (!book || Number.isNaN(chapter) || Number.isNaN(verse) || chapter < 1 || verse < 1) {
    return null;
  }
  return { filename: book.filename, name: book.name, chapter, verse };
}

/** Served from public/ by Vite in dev and as Worker assets in production */
const DATA_BASE = "/hebrew-data/bible-books";

// Cache for loaded chapter data to avoid repeated fetches
const chapterCache = new Map<string, Promise<unknown>>();

async function fetchChapter(filename: string, chapter: number, name: string): Promise<unknown> {
  const url = `${DATA_BASE}/${filename}/chapter_${chapter}.json`;
  const response = await fetch(url);
  // The Worker answers unknown paths with index.html for the SPA, so a missing chapter is a 200 of HTML
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.includes("json")) {
    throw new Error(`${name} ${chapter} is not in the data.`);
  }
  return response.json();
}

function loadChapterData(filename: string, chapter: number, name: string): Promise<unknown> {
  const cacheKey = `${filename}-${chapter}`;
  let pending = chapterCache.get(cacheKey);
  if (!pending) {
    pending = fetchChapter(filename, chapter, name).catch((error) => {
      chapterCache.delete(cacheKey);
      throw error;
    });
    chapterCache.set(cacheKey, pending);
  }
  return pending;
}

/**
 * Load a verse from the Hebrew Bible data files
 * @param ref Verse reference in format "Book Chapter:Verse" (e.g., "Genesis 1:1", "Obadiah 1:15")
 */
export async function loadVerse(ref: string): Promise<Verse> {
  const parsed = parseVerseRef(ref);
  if (!parsed) {
    throw new Error(`Invalid verse reference: ${ref}`);
  }
  const { filename, name, chapter, verse } = parsed;
  const chapterData = await loadChapterData(filename, chapter, name);
  const verses = chapterData as unknown[];

  if (!Array.isArray(verses) || verses.length === 0) {
    throw new Error(`${name} ${chapter} is not in the data.`);
  }
  if (verse > verses.length) {
    throw new Error(`${name} ${chapter} has ${verses.length} verses.`);
  }
  const verseData = verses[verse - 1];
  if (!Array.isArray(verseData)) {
    throw new Error(`Invalid verse data for ${ref}`);
  }

  const words: Word[] = [];
  verseData.forEach((wordData: unknown, index: number) => {
    if (!Array.isArray(wordData) || wordData.length < 3) return;
    const raw = wordData as RawWord;
    words.push(decodeWord(raw, `${filename}-${chapter}-${verse}-${index}`));
  });

  return { ref: `${name} ${chapter}:${verse}`, words };
}
