import confetti from "canvas-confetti";
import type { FieldSpec, ParseFields } from "./types";

export const FIELD_SPECS: FieldSpec[] = [
  { key: "pos",    label: "Part of Speech", options: ["noun (common)","noun (proper)","noun (gentilic)","verb","adjective","numeral","preposition","pronoun","conjunction","particle","adverb","interjection","—"] },
  { key: "state",  label: "State",          options: ["absolute","construct","determined","—"] },
  { key: "gender", label: "Gender",         options: ["masculine","feminine","common","—"] },
  { key: "number", label: "Number",         options: ["singular","plural","dual","—"] },
  { key: "person", label: "Person",         options: ["first","second","third","—"] },
  { key: "stem",   label: "Stem/Binyan",    options: ["qal","qal passive","niphal","piel","pual","hiphil","hophal","hithpael","polel","hithpolel","poel","pilpel","other (rare)","—"] },
  { key: "tense",  label: "Tense/Aspect",   options: ["perfect (qatal)","imperfect (yiqtol)","sequential perfect","sequential imperfect","cohortative","jussive","imperative","infinitive absolute","infinitive construct","participle active","participle passive","—"] },
  { key: "suffix", label: "Suffix",         options: ["pronominal suffix","directional he","paragogic he","paragogic nun","—"] },
  { key: "suffixPerson", label: "Suffix Person", options: ["first","second","third","—"] },
  { key: "suffixGender", label: "Suffix Gender", options: ["masculine","feminine","common","—"] },
  { key: "suffixNumber", label: "Suffix Number", options: ["singular","plural","dual","—"] },
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
  'perfect': 'perfect (qatal)',
  'imperf': 'imperfect',
  'imperfect': 'imperfect (yiqtol)',
  'imper': 'imperative',
  'inf': 'infinitive',
  'infinitive': 'infinitive construct',
  'part': 'participle',
  'participle': 'participle active',
  'adj': 'adjective',
  'prep': 'preposition',
  'pron': 'pronoun',
  'conj': 'conjunction',
  'adv': 'adverb',
  'num': 'numeral',
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
// See also: Book list in api.ts 
export const OT_BOOKS = [
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
  { name: "Malachi", abbrev: "Mal", filename: "malachi" }
];

// Books with only one chapter (need to hardcode chapter 1)
const SINGLE_CHAPTER_BOOKS = ["Obadiah", "Obad"];

export function formatRef(book: string, chapter: string, verse: string): string {
  const bookName = book.trim();
  let chap = chapter.trim();
  const v = verse.trim();
  
  // For single-chapter books, force chapter to be "1"
  if (SINGLE_CHAPTER_BOOKS.includes(bookName)) {
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
  "verb": ["stem", "tense", "person", "gender", "number"],
  "adjective": ["state", "gender", "number"],
  "numeral": ["state", "gender", "number"],
  "pronoun": ["person", "gender", "number"],
  "preposition": [],
  "conjunction": [],
  "adverb": [],
  "particle": [],
  "interjection": [],
};

export function isFieldRelevant(
  pos: string | undefined, 
  field: FieldKey,
  parseFields?: ParseFields
): boolean {
  if (!pos) return true; // Show all fields if no POS selected
  const normalized = normalizeMissing(pos);
  if (!normalized) return true;
  
  // Handle suffix fields separately
  if (field === 'suffix' || field === 'suffixPerson' || field === 'suffixGender' || field === 'suffixNumber') {
    // Only show suffix fields if there's a suffix present
    if (!parseFields?.suffix) return false;
    
    // Show suffix type always if suffix exists
    if (field === 'suffix') return true;
    
    // Only show person/gender/number for pronominal suffixes
    if (parseFields.suffix === 'pronominal suffix') {
      return field === 'suffixPerson' || field === 'suffixGender' || field === 'suffixNumber';
    }
    
    // Other suffix types don't have person/gender/number
    return false;
  }
  
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
      // Infinitives: no person, gender, or number
      if (tense === "infinitive absolute" || tense === "infinitive construct") {
        if (field === "person" || field === "gender" || field === "number") return false;
      }
      // Participles: have gender and number, but no person
      if (tense === "participle active" || tense === "participle passive") {
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
