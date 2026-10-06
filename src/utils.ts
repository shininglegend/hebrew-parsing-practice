import confetti from "canvas-confetti";
import type { FieldSpec, ParseFields } from "./types";

export const FIELD_SPECS: FieldSpec[] = [
  {
    key: "pos",
    label: "Part of Speech",
    options: [
      "noun (common)",
      "noun (proper)",
      "noun (gentilic)",
      "verb",
      "adjective",
      "numeral",
      "preposition",
      "pronoun",
      "conjunction",
      "particle",
      "adverb",
      "interjection",
      "—",
    ],
  },
  {
    key: "prefix",
    label: "Prefix",
    options: [
      "ו (and)",
      "ב (in/with)",
      "ל (to/for)",
      "כ (like/as)",
      "מ (from)",
      "ה (the)",
      "ש (that/which)",
      "interrogative ה",
      "—",
    ],
  },
  { key: "state", label: "State", options: ["absolute", "construct", "determined", "—"] },
  { key: "gender", label: "Gender", options: ["masculine", "feminine", "common", "—"] },
  { key: "number", label: "Number", options: ["singular", "plural", "dual", "—"] },
  { key: "person", label: "Person", options: ["first", "second", "third", "—"] },
  {
    key: "stem",
    label: "Stem/Binyan",
    options: [
      "qal",
      "qal passive",
      "niphal",
      "piel",
      "pual",
      "hiphil",
      "hophal",
      "hithpael",
      "polel",
      "hithpolel",
      "poel",
      "pilpel",
      // Aramaic (Daniel, Ezra, Jeremiah 10:11, Genesis 31:47)
      "peal",
      "peil",
      "pael",
      "haphel",
      "aphel",
      "hithpeel",
      "hithpaal",
      "other (rare)",
      "—",
    ],
  },
  {
    key: "tense",
    label: "Tense/Aspect",
    options: [
      "perfect (qatal)",
      "imperfect (yiqtol)",
      "sequential perfect",
      "sequential imperfect",
      "cohortative",
      "jussive",
      "imperative",
      "infinitive absolute",
      "infinitive construct",
      "participle active",
      "participle passive",
      "—",
    ],
  },
  {
    key: "suffix",
    label: "Suffix",
    options: ["pronominal suffix", "directional he", "paragogic he", "paragogic nun", "—"],
  },
  { key: "suffixPerson", label: "Suffix Person", options: ["first", "second", "third", "—"] },
  {
    key: "suffixGender",
    label: "Suffix Gender",
    options: ["masculine", "feminine", "common", "—"],
  },
  { key: "suffixNumber", label: "Suffix Number", options: ["singular", "plural", "dual", "—"] },
];

/** Field keys in drill order. The Worker keeps its own copy in worker/index.ts; a test pins them equal. */
export const FIELD_KEYS: string[] = FIELD_SPECS.map((spec) => spec.key);

export const FIELD_LABEL: Record<string, string> = Object.fromEntries(
  FIELD_SPECS.map((spec) => [spec.key, spec.label])
);

// Map short forms to long forms (for display/comparison)
// Note: Hebrew morphology decoding is context-dependent and happens in api.ts
const VALUE_NORMALIZATION: Record<string, string> = {
  abs: "absolute",
  const: "construct",
  det: "determined",
  masc: "masculine",
  fem: "feminine",
  com: "common",
  sing: "singular",
  plur: "plural",
  perf: "perfect (qatal)",
  perfect: "perfect (qatal)",
  imperf: "imperfect (yiqtol)",
  imperfect: "imperfect (yiqtol)",
  imper: "imperative",
  inf: "infinitive construct",
  infinitive: "infinitive construct",
  part: "participle active",
  participle: "participle active",
  adj: "adjective",
  prep: "preposition",
  pron: "pronoun",
  conj: "conjunction",
  adv: "adverb",
  num: "numeral",
  "1": "first",
  "2": "second",
  "3": "third",
};

export function normalizeMissing(v?: string): string | undefined {
  if (!v) return undefined;
  const s = v.trim().toLowerCase();
  if (["", "-", "—", "na", "none"].includes(s)) return undefined;
  // Normalize short forms to long forms
  return VALUE_NORMALIZATION[s] || s;
}

/**
 * Prefixes are the one list-valued field. Everywhere outside the gold parse (answers, saved
 * progress, attempts, the Worker, weak spots) they travel as one string: the options in
 * FIELD_SPECS order, joined with PREFIX_JOIN. "ו (and) + ה (the)" is one value.
 */
export const PREFIX_JOIN = " + ";

const PREFIX_ORDER: string[] = FIELD_SPECS.find((spec) => spec.key === "prefix")?.options ?? [];

export function joinPrefixes(list: readonly string[] | undefined): string | undefined {
  if (!list) return undefined;
  const seen = new Set<string>();
  for (const item of list) {
    const value = normalizeMissing(item);
    if (value) seen.add(value);
  }
  if (seen.size === 0) return undefined;
  const ordered = Array.from(seen).sort((a, b) => {
    const ia = PREFIX_ORDER.indexOf(a);
    const ib = PREFIX_ORDER.indexOf(b);
    return (ia === -1 ? PREFIX_ORDER.length : ia) - (ib === -1 ? PREFIX_ORDER.length : ib);
  });
  return ordered.join(PREFIX_JOIN);
}

export function splitPrefixes(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(PREFIX_JOIN)
    .map((item) => normalizeMissing(item))
    .filter((item): item is string => Boolean(item));
}

/** The gold value of one field as the string the rest of the app compares against. */
export function goldValue(parse: ParseFields | undefined, key: string): string | undefined {
  if (!parse) return undefined;
  if (key === "prefix") return joinPrefixes(parse.prefix);
  const raw = parse[key as keyof ParseFields];
  return normalizeMissing(typeof raw === "string" ? raw : undefined);
}

export function scoreParse(
  gold: ParseFields | undefined,
  guess: Partial<ParseFields> | Record<string, string | string[] | undefined>
) {
  let total = 0;
  let correct = 0;
  const details: { key: keyof ParseFields; ok: boolean; gold?: string; guess?: string }[] = [];
  FIELD_SPECS.forEach((f) => {
    const g = goldValue(gold, f.key);
    if (g === undefined) return; // field not provided → ignore
    const raw = (guess as Record<string, string | string[] | undefined>)[f.key];
    const u = Array.isArray(raw) ? joinPrefixes(raw) : normalizeMissing(raw);
    total += 1;
    let ok: boolean;
    if (f.key === "prefix") {
      // Order never matters; compare as sets
      const goldSet = new Set(splitPrefixes(g));
      const guessSet = new Set(splitPrefixes(u));
      ok =
        goldSet.size === guessSet.size && Array.from(goldSet).every((item) => guessSet.has(item));
    } else {
      ok = g === u;
    }
    if (ok) correct += 1;
    details.push({ key: f.key, ok, gold: g, guess: u });
  });
  return { correct, total, details };
}

export type BookEntry = { name: string; abbrev: string; filename: string };

// Old Testament books in canonical order (English Bible order; the data uses English versification)
export const OT_BOOKS: BookEntry[] = [
  // Torah / Pentateuch
  { name: "Genesis", abbrev: "Gen", filename: "genesis" },
  { name: "Exodus", abbrev: "Exod", filename: "exodus" },
  { name: "Leviticus", abbrev: "Lev", filename: "leviticus" },
  { name: "Numbers", abbrev: "Num", filename: "numbers" },
  { name: "Deuteronomy", abbrev: "Deut", filename: "deuteronomy" },
  // Historical Books
  { name: "Joshua", abbrev: "Josh", filename: "joshua" },
  { name: "Judges", abbrev: "Judg", filename: "judges" },
  { name: "Ruth", abbrev: "Ruth", filename: "ruth" },
  { name: "1 Samuel", abbrev: "1Sam", filename: "isamuel" },
  { name: "2 Samuel", abbrev: "2Sam", filename: "iisamuel" },
  { name: "1 Kings", abbrev: "1Kgs", filename: "ikings" },
  { name: "2 Kings", abbrev: "2Kgs", filename: "iikings" },
  { name: "1 Chronicles", abbrev: "1Chr", filename: "ichronicles" },
  { name: "2 Chronicles", abbrev: "2Chr", filename: "iichronicles" },
  { name: "Ezra", abbrev: "Ezra", filename: "ezra" },
  { name: "Nehemiah", abbrev: "Neh", filename: "nehemiah" },
  { name: "Esther", abbrev: "Esth", filename: "esther" },
  // Wisdom Literature
  { name: "Job", abbrev: "Job", filename: "job" },
  { name: "Psalms", abbrev: "Ps", filename: "psalms" },
  { name: "Proverbs", abbrev: "Prov", filename: "proverbs" },
  { name: "Ecclesiastes", abbrev: "Eccl", filename: "ecclesiastes" },
  { name: "Song of Solomon", abbrev: "Song", filename: "songofsolomon" },
  // Major Prophets
  { name: "Isaiah", abbrev: "Isa", filename: "isaiah" },
  { name: "Jeremiah", abbrev: "Jer", filename: "jeremiah" },
  { name: "Lamentations", abbrev: "Lam", filename: "lamentations" },
  { name: "Ezekiel", abbrev: "Ezek", filename: "ezekiel" },
  { name: "Daniel", abbrev: "Dan", filename: "daniel" },
  // Minor Prophets
  { name: "Hosea", abbrev: "Hos", filename: "hosea" },
  { name: "Joel", abbrev: "Joel", filename: "joel" },
  { name: "Amos", abbrev: "Amos", filename: "amos" },
  { name: "Obadiah", abbrev: "Obad", filename: "obadiah" },
  { name: "Jonah", abbrev: "Jonah", filename: "jonah" },
  { name: "Micah", abbrev: "Mic", filename: "micah" },
  { name: "Nahum", abbrev: "Nah", filename: "nahum" },
  { name: "Habakkuk", abbrev: "Hab", filename: "habakkuk" },
  { name: "Zephaniah", abbrev: "Zeph", filename: "zephaniah" },
  { name: "Haggai", abbrev: "Hag", filename: "haggai" },
  { name: "Zechariah", abbrev: "Zech", filename: "zechariah" },
  { name: "Malachi", abbrev: "Mal", filename: "malachi" },
];

const BOOK_INDEX = new Map<string, BookEntry>();
for (const book of OT_BOOKS) {
  for (const key of [book.name, book.abbrev, book.filename]) {
    BOOK_INDEX.set(key.toLowerCase().replace(/\s+/g, ""), book);
  }
}
// Names that students type and the data does not use
for (const [alias, name] of [
  ["Song of Songs", "Song of Solomon"],
  ["Canticles", "Song of Solomon"],
  ["Psalm", "Psalms"],
  ["Qoheleth", "Ecclesiastes"],
]) {
  const book = OT_BOOKS.find((entry) => entry.name === name);
  if (book) BOOK_INDEX.set(alias.toLowerCase().replace(/\s+/g, ""), book);
}

/** Resolve a display name, abbreviation, or data filename to its book, in any case. */
export function bookEntry(input: string | undefined): BookEntry | undefined {
  if (!input) return undefined;
  return BOOK_INDEX.get(input.trim().toLowerCase().replace(/\s+/g, ""));
}

// Books with only one chapter (chapter is always 1)
const SINGLE_CHAPTER_BOOKS = ["obadiah"];

export function formatRef(book: string, chapter: string, verse: string): string {
  const entry = bookEntry(book);
  const bookName = entry?.name ?? book.trim();
  let chap = chapter.trim();
  const v = verse.trim();

  // For single-chapter books, force chapter to be "1"
  if (entry && SINGLE_CHAPTER_BOOKS.includes(entry.filename)) {
    chap = "1";
  }

  return `${bookName} ${chap}:${v}`;
}

// Define which fields are relevant for each part of speech in Hebrew
type FieldKey = keyof ParseFields;

export const RELEVANT_FIELDS: Record<string, FieldKey[]> = {
  "noun (common)": ["state", "gender", "number"],
  "noun (proper)": ["state", "gender", "number"],
  "noun (gentilic)": ["state", "gender", "number"],
  verb: ["stem", "tense", "person", "gender", "number", "state"],
  adjective: ["state", "gender", "number"],
  numeral: ["state", "gender", "number"],
  pronoun: ["person", "gender", "number"],
  preposition: [],
  conjunction: [],
  adverb: [],
  particle: [],
  interjection: [],
};

const SUFFIX_FIELDS: FieldKey[] = ["suffix", "suffixPerson", "suffixGender", "suffixNumber"];

export function isFieldRelevant(
  pos: string | undefined,
  field: FieldKey,
  parseFields?: ParseFields
): boolean {
  // Prefixes and suffixes hang on any part of speech; only the gold decides
  if (field === "prefix") {
    return (parseFields?.prefix?.length ?? 0) > 0;
  }
  if (SUFFIX_FIELDS.includes(field)) {
    if (!parseFields?.suffix) return false;
    if (field === "suffix") return true;
    // Only pronominal suffixes carry person, gender, and number
    return parseFields.suffix === "pronominal suffix";
  }

  if (!pos) return true; // Show all fields if no POS selected
  const normalized = normalizeMissing(pos);
  if (!normalized) return true;

  // Get base relevant fields for this POS
  const relevantFields = RELEVANT_FIELDS[normalized];
  if (!relevantFields) return true; // Unknown POS, show all

  // Base check: is this field in the relevant list?
  if (!relevantFields.includes(field)) return false;

  // Additional context-sensitive rules based on other parse fields
  if (parseFields && normalized === "verb") {
    const tense = normalizeMissing(parseFields.tense);
    // Infinitives: no person, gender, number, or state
    if (tense === "infinitive absolute" || tense === "infinitive construct") {
      if (["person", "gender", "number", "state"].includes(field)) return false;
    }
    // Participles: gender, number, and state, but no person
    if (tense === "participle active" || tense === "participle passive") {
      if (field === "person") return false;
    } else if (field === "state") {
      // Only participles carry state
      return false;
    }
  }

  return true;
}

// Trigger confetti celebration
export function celebrateWithConfetti() {
  const particleCount = 200;

  // From the left
  confetti({
    particleCount,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    startVelocity: 55,
    ticks: 350,
    zIndex: 2000,
  });

  // From the right
  confetti({
    particleCount,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    startVelocity: 55,
    ticks: 350,
    zIndex: 2000,
  });

  // From the top
  confetti({
    particleCount: particleCount * 1.5,
    spread: 100,
    origin: { x: 0.5, y: 1 },
    startVelocity: 65,
    gravity: 0.8,
    ticks: 500,
    zIndex: 2000,
  });
}
