import { GRAMMAR_DEFINITIONS } from "./data/grammarDefinitions";
import type { MORPHOLOGY_CHARTS } from "./data/morphologyCharts";
import type { ParseFields } from "./types";
import { FIELD_LABEL, goldValue, splitPrefixes } from "./utils";

export type ChartKey = keyof typeof MORPHOLOGY_CHARTS;

export type SignalExplanation = {
  title: string;
  contrast: string;
  evidence: string[];
  english: string;
  grammar?: { term: string; definition: string; example?: string };
  chartKey?: ChartKey;
  chartLabel?: string;
  cue?: string;
  irregular: boolean;
};

/** A spelling in this word, or a neighbour, that points at the gold value. */
export type Cue = {
  /** Short, shown on the signal card and stored with the attempt (≤ 40 characters). */
  display: string;
  note: string;
  /** The verse word that carries the cue, when it is not the word being parsed. */
  wordId?: string;
};

type VerseWord = { id?: string; surface: string; parse?: ParseFields };

/** Weak roots whose forms drop or change a root letter. Keyed by Strong's id. */
const IRREGULAR_LEMMAS = new Set([
  "H1961", // היה be
  "H3212", // הלך go
  "H5414", // נתן give
  "H3947", // לקח take
  "H935", // בוא come
  "H7760", // שׂים put
  "H6965", // קום rise
  "H7725", // שׁוב return
  "H4191", // מות die
  "H3381", // ירד go down
  "H3427", // ישׁב sit, dwell
  "H3318", // יצא go out
  "H5375", // נשׂא lift
]);

const GRAMMAR_SECTION: Record<string, keyof typeof GRAMMAR_DEFINITIONS> = {
  pos: "partOfSpeech",
  prefix: "prefix",
  state: "state",
  gender: "gender",
  number: "number",
  person: "person",
  stem: "stem",
  tense: "tense",
  suffix: "suffix",
  suffixPerson: "person",
  suffixGender: "gender",
  suffixNumber: "number",
};

/** Gold values whose grammar-guide term is spelled differently. */
const GRAMMAR_TERM_ALIAS: Record<string, Record<string, string>> = {
  pos: {
    "noun (common)": "Noun",
    "noun (proper)": "Noun",
    "noun (gentilic)": "Noun",
  },
  prefix: {
    "ב (in/with)": "Prepositional Prefixes",
    "ל (to/for)": "Prepositional Prefixes",
    "כ (like/as)": "Prepositional Prefixes",
    "מ (from)": "Prepositional Prefixes",
    "ו (and)": "Conjunctive ו",
    "ה (the)": "Definite Article ה",
    "ש (that/which)": "Relative ש",
    "interrogative ה": "Interrogative ה",
  },
  state: {
    absolute: "Absolute State",
    construct: "Construct State",
    determined: "Determined / Definite",
  },
  stem: {
    "qal passive": "Qal",
    polel: "Other Rare Stems",
    hithpolel: "Other Rare Stems",
    poel: "Other Rare Stems",
    pilpel: "Other Rare Stems",
    "other (rare)": "Other Rare Stems",
    peal: "Qal",
    peil: "Qal",
    pael: "Piel",
    haphel: "Hiphil",
    aphel: "Hiphil",
    hithpeel: "Hithpael",
    hithpaal: "Hithpael",
  },
  tense: {
    "perfect (qatal)": "Perfect (Qatal)",
    "imperfect (yiqtol)": "Imperfect (Yiqtol)",
    "sequential imperfect": "Wayyiqtol (Sequential Imperfect)",
    "sequential perfect": "Weqatal (Sequential Perfect)",
    cohortative: "Cohortative and Jussive",
    jussive: "Cohortative and Jussive",
    "infinitive absolute": "Infinitive Construct and Absolute",
    "infinitive construct": "Infinitive Construct and Absolute",
    "participle active": "Participle",
    "participle passive": "Participle",
  },
  person: { first: "First Person", second: "Second Person", third: "Third Person" },
  suffixPerson: { first: "First Person", second: "Second Person", third: "Third Person" },
  suffix: {
    "pronominal suffix": "Pronominal Suffixes on Nouns",
    "directional he": "Directional ה (He Locale)",
    "paragogic he": "Paragogic Endings",
    "paragogic nun": "Paragogic Endings",
  },
};

const PERSON_ENGLISH: Record<string, string> = {
  first: "“I” or “we”",
  second: "“you”",
  third: "“he,” “she,” “it,” or “they”",
};

const GENDER_ENGLISH: Record<string, string> = {
  masculine: "masculine; English usually drops this unless it is “he” or “his”",
  feminine: "feminine; English usually drops this unless it is “she” or “her”",
  common: "either gender; the form does not say",
};

const NUMBER_ENGLISH: Record<string, string> = {
  singular: "one",
  plural: "more than one",
  dual: "two, a pair — hands, eyes, days in “two days”",
};

/** English job of a parse value. Shown on misses and on the translation checklist. */
export const ENGLISH_CONSEQUENCE: Record<string, Record<string, string>> = {
  pos: {
    "noun (common)": "a person, place, thing, or idea",
    "noun (proper)": "a name; English keeps it as a name",
    "noun (gentilic)": "a people or place-of-origin word, like “Hebrew” or “Egyptian”",
    verb: "an action or state; the stem and conjugation set its English",
    adjective: "describes a noun and agrees with it in gender, number, and definiteness",
    numeral: "a number; cardinals count, ordinals order",
    preposition: "relates a noun to the clause — in, to, from, like, on, with",
    pronoun: "stands in for a noun, or points at one",
    conjunction: "connects words or clauses — and, but, or, that, because",
    particle: "a small uninflected word — the object marker, a negative, “behold”",
    adverb: "modifies a verb or clause; usually uninflected",
    interjection: "an exclamation",
  },
  prefix: {
    "ו (and)": "“and,” “but,” or “then” — the clause joiner",
    "ב (in/with)": "“in,” “with,” “by,” or “at”",
    "ל (to/for)": "“to,” “for,” or “belonging to”; with an infinitive, “to …”",
    "כ (like/as)": "“like,” “as,” or “according to”; with an infinitive, “when …”",
    "מ (from)": "“from,” “out of,” or “than” in a comparison",
    "ה (the)": "“the” — this word is definite",
    "ש (that/which)": "“that,” “which,” or “who” — a relative clause follows",
    "interrogative ה": "a yes/no question marker; English fronts a helping verb",
  },
  state: {
    absolute: "stands on its own; it is not bound to the next word",
    construct: "“… of …” — bound to the word after it, which supplies its definiteness",
    determined: "definite, “the”; in Aramaic the ending does the article's job",
  },
  gender: GENDER_ENGLISH,
  number: NUMBER_ENGLISH,
  person: PERSON_ENGLISH,
  stem: {
    qal: "the simple active: “he wrote”",
    "qal passive": "the simple passive: “it was written”",
    niphal: "passive or reflexive of the simple idea: “it was written,” “he hid himself”",
    piel: "intensive or factitive: “he shattered,” “he made holy”",
    pual: "passive of the piel: “it was shattered”",
    hiphil: "causative: “he caused to …,” “he brought,” “he made … do”",
    hophal: "passive of the hiphil: “he was brought,” “it was made to …”",
    hithpael: "reflexive or reciprocal: “he … himself,” “they … one another”",
    polel: "an intensive from a hollow or geminate root; read it like a piel",
    hithpolel: "a reflexive from a hollow or geminate root; read it like a hithpael",
    poel: "an intensive from a hollow root; read it like a piel",
    pilpel: "an intensive with a doubled root; read it like a piel",
    "other (rare)": "a rare stem; find its usual sense in a lexicon",
    peal: "the Aramaic simple active, like the Hebrew qal",
    peil: "the Aramaic simple passive",
    pael: "the Aramaic intensive, like the Hebrew piel",
    haphel: "the Aramaic causative, like the Hebrew hiphil",
    aphel: "the Aramaic causative, like the Hebrew hiphil",
    hithpeel: "the Aramaic reflexive or passive of the simple stem",
    hithpaal: "the Aramaic reflexive of the intensive stem",
  },
  tense: {
    "perfect (qatal)": "a whole, completed action — usually a simple past, or a settled state",
    "imperfect (yiqtol)": "incomplete, habitual, or future — often “will,” “would,” or “may”",
    "sequential imperfect": "the next step in a story: “and then he …,” a past in sequence",
    "sequential perfect":
      "“and he will …” or “and you shall …” — carries a future or command forward",
    cohortative: "“let me …,” “let us …” — the speaker's resolve",
    jussive: "“let him …,” “may she …” — a wish or a mild command about someone else",
    imperative: "a command: “go,” “say”",
    "infinitive absolute":
      "emphasis beside a finite verb: “you will surely …”; or stands for a command",
    "infinitive construct": "“to …,” “…-ing,” or with a preposition “when he …,” “in order to …”",
    "participle active": "“…-ing” — ongoing action, or “the one who …”",
    "participle passive": "“…-ed” — a state, or “the one who is …”",
  },
  suffix: {
    "pronominal suffix":
      "a pronoun glued on: “his,” “my,” “their” on a noun; “him,” “me,” “them” on a verb or preposition",
    "directional he": "“toward …,” “to …” — direction, added to the end",
    "paragogic he": "an older or heightened ending; the meaning does not change",
    "paragogic nun": "an older or heightened ending; the meaning does not change",
  },
  suffixPerson: PERSON_ENGLISH,
  suffixGender: GENDER_ENGLISH,
  suffixNumber: NUMBER_ENGLISH,
};

const FINAL_LETTERS: Record<string, string> = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

/** Letters only: no vowels, accents, dagesh, dividers, or final forms. For matching words. */
export function foldHebrew(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[֑-ׇ]/g, "")
    .replace(/\//g, "")
    .replace(/[ךםןףץ]/g, (letter) => FINAL_LETTERS[letter] ?? letter)
    .trim();
}

/** The surface without the "/" morpheme dividers, for display. */
export function plainSurface(surface: string): string {
  return surface.replace(/\//g, "");
}

/** Vowels and dagesh kept, cantillation dropped, so a spelling can be tested. */
function pointed(value: string): string {
  return value.normalize("NFD").replace(/[֑-ֽֿ֯]/g, "");
}

const LETTER = "[א-ת]";
const DAGESH = "ּ";
const SHEVA = "ְ";
const HATAF_PATAH = "ֲ";
const HIRIQ = "ִ";
const TSERE = "\u05B5";
const SEGOL = "ֶ";
const PATAH = "ַ";
const QAMATS = "ָ";
const HOLAM = "ֹ";
const QUBUTS = "ֻ";
const SHIN_DOT = "ׁ";
const SIN_DOT = "ׂ";

type Parts = { prefixes: string; main: string; suffix: string };

/** Split "וְ/הָ/אָרֶץ" into its prefix letters, main word, and suffix, using the gold parse. */
function parts(surface: string, parse: ParseFields | undefined): Parts {
  const segments = pointed(surface).split("/");
  const hasSuffix = Boolean(parse?.suffix);
  const suffix = hasSuffix && segments.length > 1 ? (segments.pop() ?? "") : "";
  const main = segments.pop() ?? "";
  return { prefixes: segments.join(""), main, suffix };
}

// After NFD a letter's marks come in canonical order: vowel point, then dagesh, then shin/sin dot
const VOWEL = "[\u05B0-\u05BB\u05C7]";
const NOT_LETTER = "[^\u05D0-\u05EA]";

/** Does the main word open with one of these letters carrying this vowel? */
function opens(main: string, letters: string, vowel: string): boolean {
  return new RegExp(`^[${letters}]${vowel}`).test(main);
}

function firstRootDagesh(main: string): boolean {
  return new RegExp(`^${LETTER}${VOWEL}*${DAGESH}`).test(main);
}

/** A dagesh in the second consonant of the main word. */
function middleDagesh(main: string): boolean {
  return new RegExp(`^${LETTER}${NOT_LETTER}*${LETTER}${VOWEL}*${DAGESH}`).test(main);
}

/** Gutturals and resh never take a dagesh, so a doubling stem leaves no mark on them. */
function middleCannotDouble(main: string): boolean {
  const letters = main.replace(new RegExp(NOT_LETTER, "g"), "");
  return /[אהחער]/.test(letters[1] ?? "");
}

function has(text: string, pattern: string): boolean {
  return new RegExp(pattern).test(text);
}

const SUFFIX_SPELLINGS: { test: RegExp; display: string; who: string }[] = [
  { test: /ִי$/, display: "ִי", who: "first singular, “my” or “me”" },
  { test: /נוּ?$/, display: "נוּ", who: "first plural, “our” or “us”" },
  { test: /ךָ$/, display: "ךָ", who: "second masculine singular, “your”" },
  { test: /ךְ?$/, display: "ךְ", who: "second feminine singular, “your”" },
  { test: /כֶם$/, display: "כֶם", who: "second masculine plural, “your”" },
  { test: /כֶן$/, display: "כֶן", who: "second feminine plural, “your”" },
  { test: /הוּ$/, display: "הוּ", who: "third masculine singular, “his” or “him”" },
  { test: /וֹ?$|וּ$/, display: "וֹ", who: "third masculine singular, “his” or “him”" },
  { test: /הּ$/, display: "הּ", who: "third feminine singular, “her”" },
  { test: /הֶם$|ָם$|מוּ$/, display: "ָם / הֶם", who: "third masculine plural, “their” or “them”" },
  { test: /הֶן$|ָן$/, display: "ָן / הֶן", who: "third feminine plural, “their”" },
];

function suffixSpelling(suffix: string) {
  return SUFFIX_SPELLINGS.find((entry) => entry.test.test(suffix));
}

function tenseCue(gold: string, p: Parts): Cue | undefined {
  const { prefixes, main } = p;
  switch (gold) {
    case "sequential imperfect": {
      if (has(prefixes, `ו${PATAH}`) && (firstRootDagesh(main) || has(main, `^י${SHEVA}`))) {
        return {
          display: "וַ",
          note: "וַ with patach, and a dagesh in the next letter (a yod with sheva does without it), is the wayyiqtol marker. A plain “and” before an imperfect is וְ with sheva.",
        };
      }
      return undefined;
    }
    case "sequential perfect": {
      if (has(prefixes, `ו[${SHEVA}ּ]`)) {
        return {
          display: "וְ",
          note: "וְ joined to a perfect form carries the sequence forward: after an imperfect or a command it reads as future or as another instruction.",
        };
      }
      return undefined;
    }
    case "imperfect (yiqtol)":
    case "jussive":
    case "cohortative": {
      const match = main.match(/^([אתינ])/);
      if (match) {
        return {
          display: match[1],
          note: `The form opens with ${match[1]}, a preformative. Prefix conjugations (imperfect, jussive, cohortative) put the person in front; the perfect puts it in the ending.`,
        };
      }
      return undefined;
    }
    case "participle active": {
      if (
        has(main, `^${LETTER}[${SHIN_DOT}${SIN_DOT}]?${HOLAM}`) ||
        has(main, `^${LETTER}[${SHIN_DOT}${SIN_DOT}]?ו${HOLAM}`)
      ) {
        return {
          display: "ֹ",
          note: "The ō vowel (holem) after the first root letter is the qal active participle pattern, qōtēl.",
        };
      }
      if (has(main, `^מ[${SHEVA}${PATAH}${HIRIQ}]`)) {
        return {
          display: "מְ",
          note: "A מ in front of the root marks the participle of every stem but qal: piel מְקַטֵּל, hiphil מַקְטִיל, hithpael מִתְקַטֵּל.",
        };
      }
      return undefined;
    }
    case "participle passive": {
      if (has(main, `וּ`)) {
        return {
          display: "וּ",
          note: "The û vowel (shureq) between the second and third root letters is the qal passive participle pattern, qātûl.",
        };
      }
      return undefined;
    }
    case "infinitive construct": {
      if (has(prefixes, `ל`)) {
        return {
          display: "לְ",
          note: "ל in front of an infinitive construct reads “to …” or “in order to …”. ב or כ in front reads “when …”.",
        };
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

function stateCue(words: VerseWord[], word: VerseWord, gold: string, p: Parts): Cue | undefined {
  if (gold === "construct") {
    const index = words.findIndex((item) => (word.id ? item.id === word.id : item === word));
    const next = index >= 0 ? words[index + 1] : undefined;
    if (next) {
      return {
        display: plainSurface(next.surface),
        note: `A construct form leans on the word after it: “… of ${plainSurface(next.surface)}”. The next word carries the definiteness for both.`,
        wordId: next.id,
      };
    }
    return undefined;
  }
  if (gold === "determined" && p.prefixes && has(p.prefixes, `ה[${PATAH}${QAMATS}${SEGOL}]`)) {
    return {
      display: "הַ",
      note: "הַ with a dagesh in the next letter is the article, so the word is determined.",
    };
  }
  return undefined;
}

function prefixCue(gold: string, p: Parts): Cue | undefined {
  const list = splitPrefixes(gold);
  const { prefixes, main } = p;
  if (list.includes("ה (the)")) {
    const swallowed = prefixes.match(new RegExp(`([בכל])[${PATAH}${QAMATS}${SEGOL}]`));
    if (swallowed && !has(prefixes, "ה")) {
      const letter = `${swallowed[1]}${PATAH}`;
      return {
        display: letter,
        note: `${letter} is the preposition plus the article: ${swallowed[1]}ְ + הַ. The preposition took the article's vowel and the dagesh moved into the next letter.`,
      };
    }
    if (has(prefixes, `ה[${PATAH}${QAMATS}${SEGOL}]`)) {
      return {
        display: "הַ",
        note: firstRootDagesh(main)
          ? "הַ with a dagesh in the following letter is the article “the”."
          : "הַ (or הָ before a guttural, which cannot take the dagesh) is the article “the”.",
      };
    }
  }
  if (list.includes("interrogative ה") && has(prefixes, `ה${HATAF_PATAH}`)) {
    return {
      display: "הֲ",
      note: "הֲ with hataf patach and no dagesh after it asks a yes/no question. The article is הַ with a dagesh.",
    };
  }
  if (list.includes("מ (from)") && has(prefixes, "מ")) {
    return {
      display: "מִ",
      note: "מִ with a dagesh in the next letter is מִן “from” with its נ assimilated; before a guttural it lengthens to מֵ.",
    };
  }
  if (list.includes("ש (that/which)") && has(prefixes, "ש")) {
    return {
      display: "שֶׁ",
      note: "שֶׁ with a dagesh in the next letter is the short relative, the same job as אֲשֶׁר.",
    };
  }
  if (list.includes("ו (and)") && has(prefixes, "ו")) {
    const form = has(prefixes, `ו${PATAH}`) ? "וַ" : has(prefixes, "וּ") ? "וּ" : "וְ";
    return {
      display: form,
      note:
        form === "וּ"
          ? "וּ is “and” before a labial (ב, מ, פ) or a sheva."
          : form === "וַ"
            ? "וַ before an imperfect is the wayyiqtol “and then”."
            : "וְ is the plain conjunction “and”.",
    };
  }
  const prep = list.find((item) => /^[בלכ] /.test(item));
  if (prep && has(prefixes, `[בלכ]`)) {
    return {
      display: `${prep[0]}ְ`,
      note: `${prep[0]} with sheva is the inseparable preposition. With patach or qamats and a dagesh after it, the article is in there too.`,
    };
  }
  return undefined;
}

function stemCue(gold: string, p: Parts): Cue | undefined {
  const { main } = p;
  switch (gold) {
    case "niphal":
      if (opens(main, "נ", HIRIQ)) {
        return {
          display: "נִ",
          note: "A נִ in front of the root is the niphal perfect and participle.",
        };
      }
      if (has(main, `^[יתאנ]${HIRIQ}${LETTER}[${SHIN_DOT}${SIN_DOT}]?${DAGESH}${QAMATS}`)) {
        return {
          display: "יִקָּ",
          note: "In the niphal imperfect the נ assimilates: hireq under the preformative, dagesh in the first root letter, qamats after it.",
        };
      }
      return undefined;
    case "hiphil":
      if (opens(main, "ה", HIRIQ) || opens(main, "ה", SEGOL)) {
        return {
          display: "הִ",
          note: "הִ in front of the root is the hiphil perfect; the hireq-yod after the second root letter confirms it.",
        };
      }
      if (has(main, `${HIRIQ}${DAGESH}?\u05D9${LETTER}`)) {
        return {
          display: "ִי",
          note: "A hireq-yod between the second and third root letters is the hiphil vowel.",
        };
      }
      if (has(main, `^[\u05D9\u05EA\u05D0\u05E0]${PATAH}${DAGESH}?${LETTER}${SHEVA}`)) {
        return {
          display: "יַ",
          note: "Patach under the preformative and a silent sheva under the first root letter is the hiphil prefix conjugation (yaqtîl; the wayyiqtol shortens it to yaqtēl). Qal has hireq or a vocal sheva there.",
        };
      }
      if (opens(main, "מ", PATAH)) {
        return { display: "מַ", note: "מַ in front of the root is the hiphil participle." };
      }
      return undefined;
    case "hophal":
      if (opens(main, "ה", QAMATS) || opens(main, "ה", QUBUTS)) {
        return {
          display: "הָ",
          note: "הָ or הֻ in front of the root is the hophal, the passive of the hiphil.",
        };
      }
      return undefined;
    case "hithpael":
      if (has(main, `^[היתאנמ]${HIRIQ}ת${SHEVA}`)) {
        return {
          display: "הִתְ",
          note: "The תְ infix after the preformative (הִתְ, יִתְ, מִתְ) is the hithpael.",
        };
      }
      return undefined;
    case "piel":
      if (opens(main, "\u05DE", SHEVA) && (middleDagesh(main) || middleCannotDouble(main))) {
        return {
          display: "מְ",
          note: middleDagesh(main)
            ? "מְ in front of the root plus a dagesh in the middle root letter is the piel participle."
            : "מְ in front of the root is the piel participle. The middle root letter is a guttural or resh, so it cannot show the dagesh.",
        };
      }
      if (middleDagesh(main)) {
        return {
          display: "ּ",
          note: "A dagesh forte in the middle root letter doubles it: the mark of the piel, pual, and hithpael.",
        };
      }
      if (middleCannotDouble(main) && has(main, `^${LETTER}[${HIRIQ}${TSERE}]`)) {
        return {
          display: "ֵ",
          note: "The middle root letter is a guttural or resh and cannot take the piel dagesh; the lengthened vowel under the first root letter stands in for it.",
        };
      }
      return undefined;
    case "pual":
      if (middleDagesh(main) && has(main, `^${LETTER}[${SHIN_DOT}${SIN_DOT}]?${QUBUTS}`)) {
        return {
          display: "ֻ",
          note: "Qibbuts under the first root letter plus a dagesh in the second is the pual.",
        };
      }
      return undefined;
    case "qal":
      if (!middleDagesh(main) && !has(main, `^[הנמ][${HIRIQ}${PATAH}${QAMATS}${SEGOL}${SHEVA}]`)) {
        return {
          display: "qal",
          note: "No stem letter in front and no dagesh in the middle root letter: the simple stem.",
        };
      }
      return undefined;
    default:
      return undefined;
  }
}

function suffixCue(field: string, p: Parts): Cue | undefined {
  if (!p.suffix) return undefined;
  const spelling = suffixSpelling(p.suffix);
  if (!spelling) return undefined;
  if (field === "suffix") {
    return {
      display: spelling.display,
      note: `The ending ${spelling.display} is a pronominal suffix: ${spelling.who}.`,
    };
  }
  return { display: spelling.display, note: `The ending ${spelling.display} is ${spelling.who}.` };
}

function numberCue(gold: string, p: Parts): Cue | undefined {
  if (gold === "dual" && has(p.main, `${PATAH}י${HIRIQ}ם$`)) {
    return { display: "ַיִם", note: "The ending ־ַיִם is the dual: two of them." };
  }
  if (gold === "plural" && has(p.main, `${HIRIQ}ים$`)) {
    return { display: "ִים", note: "The ending ־ִים is the masculine plural absolute." };
  }
  if (gold === "plural" && has(p.main, `וֹ?ת$`)) {
    return { display: "וֹת", note: "The ending ־וֹת is the feminine plural." };
  }
  return undefined;
}

/**
 * The spelling that points at this word's gold value for `field`. The word's own prefixes,
 * vowels, and ending carry most Hebrew cues; a construct form points at the next word.
 */
export function findCue(
  words: VerseWord[],
  word: VerseWord | undefined,
  field: string
): Cue | undefined {
  if (!word?.parse) return undefined;
  const gold = goldValue(word.parse, field);
  if (!gold) return undefined;
  const p = parts(word.surface, word.parse);
  switch (field) {
    case "tense":
      return tenseCue(gold, p);
    case "state":
      return stateCue(words, word, gold, p);
    case "prefix":
      return prefixCue(gold, p);
    case "stem":
      return stemCue(gold, p);
    case "suffix":
    case "suffixPerson":
    case "suffixGender":
    case "suffixNumber":
      return suffixCue(field, p);
    case "number":
      return numberCue(gold, p);
    default:
      return undefined;
  }
}

export function englishFor(field: string, gold: string, cue?: Cue): string {
  if (field === "prefix") {
    const list = splitPrefixes(gold);
    if (list.length > 1) {
      return list.map((item) => ENGLISH_CONSEQUENCE.prefix[item] ?? item).join("; ");
    }
  }
  if (field === "state" && gold === "construct" && cue?.wordId) {
    return `“… of ${cue.display}” — bound to the next word, which decides whether the pair is definite`;
  }
  return ENGLISH_CONSEQUENCE[field]?.[gold] ?? `This value is ${gold}.`;
}

export function grammarFor(field: string, gold: string) {
  const sectionKey = GRAMMAR_SECTION[field];
  if (!sectionKey) return undefined;
  const section = GRAMMAR_DEFINITIONS[sectionKey];
  if (!section) return undefined;
  const alias = GRAMMAR_TERM_ALIAS[field]?.[gold];
  const goldKey = (alias ?? gold).toLowerCase();
  const item = section.items.find((entry) => {
    const term = entry.term.toLowerCase();
    return term === goldKey || term.startsWith(`${goldKey} `);
  });
  if (!item) return undefined;
  return { term: item.term, definition: item.definition, example: item.example };
}

/**
 * Paradigm chart for this value. The Hebrew charts in data/morphologyCharts.ts are still
 * empty, so no card offers one yet; wire the keys here once the tables exist.
 */
function chartFor(
  _field: string,
  _gold: string,
  _parse: ParseFields | undefined
): { key: ChartKey; label: string } | undefined {
  return undefined;
}

const PREFIX_CONJUGATIONS = new Set([
  "imperfect (yiqtol)",
  "sequential imperfect",
  "jussive",
  "cohortative",
]);
const PARTICIPLES = new Set(["participle active", "participle passive"]);
const INFINITIVES = new Set(["infinitive absolute", "infinitive construct"]);
const DOUBLING_STEMS = new Set(["piel", "pual", "hithpael", "pael", "hithpaal"]);
const CAUSATIVE_STEMS = new Set(["hiphil", "hophal", "haphel", "aphel"]);

function pairEvidence(
  field: string,
  guess: string,
  gold: string,
  _surface: string,
  parse: ParseFields | undefined
): string[] {
  const lines: string[] = [];
  const both = (a: string, b: string) => (guess === a && gold === b) || (guess === b && gold === a);

  if (field === "tense") {
    if (both("perfect (qatal)", "imperfect (yiqtol)")) {
      lines.push(
        "The perfect carries its person in the ending (־תִּי, ־תָּ, ־וּ). The imperfect carries it in a preformative (א, ת, י, נ) and may add an ending."
      );
    }
    if (both("imperfect (yiqtol)", "sequential imperfect")) {
      lines.push(
        "Both are prefix conjugations. The wayyiqtol adds וַ with a dagesh in the preformative and often shortens the form; it narrates the next past event, not a future one."
      );
    }
    if (both("perfect (qatal)", "sequential perfect")) {
      lines.push(
        "Same perfect form. The וְ in front, in a chain after an imperfect or a command, turns it forward: future or instruction instead of past."
      );
    }
    if (PARTICIPLES.has(gold) !== PARTICIPLES.has(guess)) {
      lines.push(
        "A participle agrees like an adjective — gender, number, state — and has no person. A finite verb has person and can be the main verb of the clause."
      );
    }
    if (INFINITIVES.has(gold) !== INFINITIVES.has(guess)) {
      lines.push(
        "An infinitive takes no person, gender, or number. The construct takes prefixes and suffixes (“to …,” “when he …”); the absolute stands bare beside a finite verb for emphasis."
      );
    }
    if (both("infinitive construct", "infinitive absolute")) {
      lines.push(
        "The infinitive absolute usually has a holem after the first root letter (קָטוֹל) and takes no prefix or suffix. The construct (קְטֹל) takes both."
      );
    }
    if (both("imperative", "imperfect (yiqtol)") || both("imperative", "jussive")) {
      lines.push(
        "The imperative has no preformative; it looks like the imperfect with the preformative cut off. A jussive keeps the preformative."
      );
    }
    if (both("jussive", "imperfect (yiqtol)")) {
      lines.push(
        "The jussive is the imperfect used as a wish or a third-person command, often shortened (יְהִי for יִהְיֶה) and often after אַל."
      );
    }
    if (both("cohortative", "imperfect (yiqtol)")) {
      lines.push("The cohortative is a first-person imperfect with ־ָה added: “let me,” “let us.”");
    }
  }

  if (field === "stem") {
    if (DOUBLING_STEMS.has(gold) || DOUBLING_STEMS.has(guess)) {
      lines.push(
        "Piel, pual, and hithpael double the middle root letter with a dagesh forte. Qal, niphal, hiphil, and hophal do not."
      );
    }
    if (CAUSATIVE_STEMS.has(gold) || CAUSATIVE_STEMS.has(guess)) {
      lines.push(
        "Hiphil puts ה in front of the perfect (הִקְטִיל) and a hireq-yod between the second and third root letters; the hophal is the same with הָ or הֻ."
      );
    }
    if (gold === "niphal" || guess === "niphal") {
      lines.push(
        "Niphal puts נ in front of the root (נִקְטַל); in the imperfect that נ assimilates into a dagesh in the first root letter (יִקָּטֵל)."
      );
    }
    if (both("qal", "qal passive")) {
      lines.push(
        "The qal passive is spelled like a pual or hophal but belongs to a root that has no piel or hiphil in use."
      );
    }
    if (parse?.tense && PARTICIPLES.has(parse.tense)) {
      lines.push("This is a participle: qal has no מ in front; every other stem does.");
    }
  }

  if (field === "state") {
    if (both("absolute", "construct")) {
      lines.push(
        "A construct noun is bound to the next word and often shortened: masculine plural ־ִים becomes ־ֵי, feminine singular ־ָה becomes ־ַת, and the vowels reduce. It never takes the article itself."
      );
    }
    if (gold === "determined" || guess === "determined") {
      lines.push(
        "Determined is the state OSHB gives a noun with the article prefix, and the Aramaic emphatic ending ־ָא. A construct noun is never determined on its own."
      );
    }
  }

  if (field === "prefix") {
    const goldList = splitPrefixes(gold);
    const guessList = splitPrefixes(guess);
    if (goldList.includes("ה (the)") && !guessList.includes("ה (the)")) {
      lines.push(
        "The article hides inside a preposition: בַּ, לַ, כַּ (patach plus a dagesh after) are בְּ, לְ, כְּ with הַ absorbed. Plain בְּ, לְ, כְּ have sheva and no dagesh."
      );
    }
    if (
      both("ה (the)", "interrogative ה") ||
      goldList.includes("interrogative ה") !== guessList.includes("interrogative ה")
    ) {
      lines.push(
        "The article is הַ with a dagesh after it; the question marker is הֲ with hataf patach and no dagesh."
      );
    }
    if (goldList.includes("ו (and)") !== guessList.includes("ו (and)")) {
      lines.push("A ו prefix is spelled וְ, וּ before ב מ פ or a sheva, or וַ on a wayyiqtol.");
    }
    if (goldList.includes("מ (from)") !== guessList.includes("מ (from)")) {
      lines.push(
        "מִ with a dagesh after it is “from” (מִן with the נ assimilated); מֵ before gutturals."
      );
    }
  }

  if (field === "number" && both("plural", "dual")) {
    lines.push(
      "The dual ends in ־ַיִם (patach, yod, hireq, final mem); the masculine plural ends in ־ִים."
    );
  }

  if (field === "gender" && both("masculine", "feminine")) {
    lines.push(
      "Most feminine singulars end in ־ָה or ־ת and feminine plurals in ־וֹת; masculine plurals end in ־ִים. Body parts in pairs and some nouns without an ending are feminine anyway."
    );
  }

  if (field === "person" || field === "suffixPerson") {
    if (parse?.tense && PREFIX_CONJUGATIONS.has(parse.tense) && field === "person") {
      lines.push(
        "In a prefix conjugation the preformative sets the person: א first singular, נ first plural, ת second (and third feminine), י third."
      );
    }
    if (parse?.tense === "perfect (qatal)" || parse?.tense === "sequential perfect") {
      lines.push(
        "In the perfect the ending sets the person: ־תִּי I, ־תָּ you (m), ־תְּ you (f), ־ָה she, ־וּ they, ־נוּ we, ־תֶּם you (pl)."
      );
    }
  }

  return lines;
}

export function explainMiss(input: {
  surface: string;
  lemma?: string;
  wordId?: string;
  field: keyof ParseFields;
  guess: string;
  gold: string;
  parse?: ParseFields;
  verseWords: VerseWord[];
}): SignalExplanation {
  const { surface, lemma, wordId, field, guess, gold, parse, verseWords } = input;
  const goldParse: ParseFields = {
    ...parse,
    [field]: field === "prefix" ? splitPrefixes(gold) : gold,
  };
  const self: VerseWord = { id: wordId, surface, parse: goldParse };
  const cue = findCue(verseWords, self, field);
  const irregular = lemma ? IRREGULAR_LEMMAS.has(lemma) : false;
  const label = FIELD_LABEL[field] ?? field;
  const evidence = pairEvidence(field, guess, gold, surface, goldParse);
  if (cue) evidence.unshift(cue.note);
  if (irregular) {
    evidence.push(
      "This is a weak root: a root letter drops or changes, so the regular paradigm will not match letter for letter. The parse still stands."
    );
  }
  if (evidence.length === 0) {
    evidence.push(`Compare this form with the ${gold} paradigm, not the ${guess} one.`);
  }

  const chart = chartFor(field, gold, parse);
  return {
    title: `${label}: ${gold}`,
    contrast: `You chose ${guess}. This form is ${gold}.`,
    evidence,
    english: englishFor(field, gold, cue),
    grammar: grammarFor(field, gold),
    chartKey: chart?.key,
    chartLabel: chart?.label,
    cue: cue?.display,
    irregular,
  };
}

/** Same teaching note for a correct field, without the contrast of a wrong guess. */
export function explainCorrect(input: {
  surface: string;
  lemma?: string;
  wordId?: string;
  field: keyof ParseFields;
  gold: string;
  parse?: ParseFields;
  verseWords: VerseWord[];
}): SignalExplanation {
  const note = explainMiss({ ...input, guess: input.gold });
  const evidence = note.evidence.filter((line) => !line.startsWith("Compare this form with the"));
  return {
    ...note,
    contrast: `This form is ${input.gold}.`,
    evidence:
      evidence.length > 0 ? evidence : ["The form and the clause around it are the signal."],
  };
}

/** While a form is still incomplete, explain only the latest correct field.
 *  Once every visible field is right, explain each one. */
export function fieldsToExplain<T>(visible: T[], correct: (field: T) => boolean): T[] {
  const done = visible.filter(correct);
  if (done.length === 0) return [];
  if (done.length === visible.length) return done;
  return done.slice(-1);
}
