import confetti from "canvas-confetti";
import type { FieldSpec, ParseFields } from "./types";

export const FIELD_SPECS: FieldSpec[] = [
  { key: "pos",    label: "Part of Speech", options: ["noun","verb","adjective","preposition","pronoun","conjunction","particle","adverb","article","interjection"] },
  { key: "state",  label: "State",          options: ["absolute","construct","determined","—"] },
  { key: "gender", label: "Gender",         options: ["masculine","feminine","common","—"] },
  { key: "number", label: "Number",         options: ["singular","plural","dual","—"] },
  { key: "person", label: "Person",         options: ["first","second","third","—"] },
  { key: "stem",   label: "Stem",           options: ["qal","niphal","piel","pual","hiphil","hophal","hithpael","—"] },
  { key: "tense",  label: "Tense",          options: ["perfect","imperfect","imperative","infinitive","participle","—"] },
];

// Map short forms to long forms (for display/comparison)
// Note: Hebrew morphology decoding is context-dependent and happens in api.ts
const VALUE_NORMALIZATION: Record<string, string> = {
  // These are the normalized full names that come from api.ts
  // Just providing common abbreviations that might be used
  'abs': 'absolute',
  'const': 'construct',
  'det': 'determined',
  'masc': 'masculine',
  'fem': 'feminine',
  'com': 'common',
  'sing': 'singular',
  'plur': 'plural',
  'perf': 'perfect',
  'imperf': 'imperfect',
  'imper': 'imperative',
  'inf': 'infinitive',
  'part': 'participle',
  'adj': 'adjective',
  'prep': 'preposition',
  'pron': 'pronoun',
  'conj': 'conjunction',
  'adv': 'adverb',
  '1': 'first',
  '2': 'second',
  '3': 'third',
};

export function normalizeMissing(v?: string): string | undefined {
  if (!v) return undefined;
  const s = v.trim().toLowerCase();
  if (["", "-", "—", "na", "none"].includes(s)) return undefined;
  // Normalize short forms to long forms
  return VALUE_NORMALIZATION[s] || s;
}

export function scoreParse(
  gold: ParseFields | undefined,
  guess: Partial<ParseFields>
) {
  let total = 0, correct = 0;
  const details: { key: keyof ParseFields; ok: boolean; gold?: string; guess?: string }[] = [];
  FIELD_SPECS.forEach(f => {
    const g = normalizeMissing(gold?.[f.key]);
    const u = normalizeMissing(guess[f.key]);
    if (g === undefined) return; // field not provided → ignore
    total += 1;
    const ok = g === u;
    if (ok) correct += 1;
    details.push({ key: f.key, ok, gold: g, guess: u });
  });
  return { correct, total, details };
}

// Old Testament books in canonical order (Hebrew Bible / Tanakh)
export const OT_BOOKS = [
  // Torah / Pentateuch
  { name: "Genesis", abbrev: "Gen" },
  { name: "Exodus", abbrev: "Exod" },
  { name: "Leviticus", abbrev: "Lev" },
  { name: "Numbers", abbrev: "Num" },
  { name: "Deuteronomy", abbrev: "Deut" },
  // Historical Books
  { name: "Joshua", abbrev: "Josh" },
  { name: "Judges", abbrev: "Judg" },
  { name: "Ruth", abbrev: "Ruth" },
  { name: "1 Samuel", abbrev: "1Sam" },
  { name: "2 Samuel", abbrev: "2Sam" },
  { name: "1 Kings", abbrev: "1Kgs" },
  { name: "2 Kings", abbrev: "2Kgs" },
  { name: "1 Chronicles", abbrev: "1Chr" },
  { name: "2 Chronicles", abbrev: "2Chr" },
  { name: "Ezra", abbrev: "Ezra" },
  { name: "Nehemiah", abbrev: "Neh" },
  { name: "Esther", abbrev: "Esth" },
  // Wisdom Literature
  { name: "Job", abbrev: "Job" },
  { name: "Psalms", abbrev: "Ps" },
  { name: "Proverbs", abbrev: "Prov" },
  { name: "Ecclesiastes", abbrev: "Eccl" },
  { name: "Song of Solomon", abbrev: "Song" },
  // Major Prophets
  { name: "Isaiah", abbrev: "Isa" },
  { name: "Jeremiah", abbrev: "Jer" },
  { name: "Lamentations", abbrev: "Lam" },
  { name: "Ezekiel", abbrev: "Ezek" },
  { name: "Daniel", abbrev: "Dan" },
  // Minor Prophets
  { name: "Hosea", abbrev: "Hos" },
  { name: "Joel", abbrev: "Joel" },
  { name: "Amos", abbrev: "Amos" },
  { name: "Obadiah", abbrev: "Obad" },
  { name: "Jonah", abbrev: "Jonah" },
  { name: "Micah", abbrev: "Mic" },
  { name: "Nahum", abbrev: "Nah" },
  { name: "Habakkuk", abbrev: "Hab" },
  { name: "Zephaniah", abbrev: "Zeph" },
  { name: "Haggai", abbrev: "Hag" },
  { name: "Zechariah", abbrev: "Zech" },
  { name: "Malachi", abbrev: "Mal" }
];

// Books with only one chapter (need to hardcode chapter 1)
const SINGLE_CHAPTER_BOOKS = ["Obad"];

export function formatRef(book: string, chapter: string, verse: string): string {
  const bookAbbrev = book.trim();
  let chap = chapter.trim();
  const v = verse.trim();
  
  // For single-chapter books, force chapter to be "1"
  if (SINGLE_CHAPTER_BOOKS.includes(bookAbbrev)) {
    chap = "1";
  }
  
  return `${bookAbbrev} ${chap}:${v}`;
}

// Define which fields are relevant for each part of speech in Hebrew
type FieldKey = keyof ParseFields;

export const RELEVANT_FIELDS: Record<string, FieldKey[]> = {
  noun: ["state", "gender", "number"],
  verb: ["stem", "tense", "person", "gender", "number"],
  adjective: ["state", "gender", "number"],
  pronoun: ["person", "gender", "number"],
  article: ["state", "gender", "number"],
  preposition: [],
  conjunction: [],
  adverb: [],
  particle: [],
  interjection: [],
};

export function isFieldRelevant(
  pos: string | undefined, 
  field: FieldKey,
  parseFields?: ParseFields
): boolean {
  if (!pos) return true; // Show all fields if no POS selected
  const normalized = normalizeMissing(pos);
  if (!normalized) return true;
  
  // Get base relevant fields for this POS
  const relevantFields = RELEVANT_FIELDS[normalized];
  if (!relevantFields) return true; // Unknown POS, show all
  
  // Base check: is this field in the relevant list?
  if (!relevantFields.includes(field)) return false;
  
  // Additional context-sensitive rules based on other parse fields
  if (parseFields) {
    const tense = normalizeMissing(parseFields.tense);
    
    // Hebrew verbs: infinitives and participles have special rules
    if (normalized === "verb") {
      // Infinitives: no person (infinitive construct/absolute)
      if (tense === "infinitive") {
        if (field === "person") return false;
        // Infinitives typically don't have gender/number either
        if (field === "gender" || field === "number") return false;
      }
      // Participles: have gender and number, may have person in some forms
      if (tense === "participle") {
        // Participles inflect like adjectives
        if (field === "person") return false;
      }
    }
    
    // Particles, adverbs, prepositions, conjunctions, interjections: only POS
    if (["particle", "adverb", "preposition", "conjunction", "interjection"].includes(normalized)) {
      return false; // No inflectional fields
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
    ticks: 350
  });
  
  // From the right
  confetti({
    particleCount,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    startVelocity: 55,
    ticks: 350
  });
  
  // From the top
  confetti({
    particleCount: particleCount * 1.5,
    spread: 100,
    origin: { x: 0.5, y: 1 },
    startVelocity: 65,
    gravity: 0.8,
    ticks: 500
  });
}
