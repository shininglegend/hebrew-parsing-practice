export type ParseFields = {
  pos?: string; // Part of speech (noun, verb, adjective, etc.)
  state?: string; // Noun state (absolute, construct, determined)
  gender?: string; // Masculine, feminine, common
  number?: string; // Singular, plural, dual
  person?: string; // 1st, 2nd, 3rd person
  stem?: string; // Verb stem/binyan (qal, niphal, piel, etc.)
  tense?: string; // Verb tense/aspect (perfect, imperfect, imperative, etc.)

  // Prefixes like ב, ל, כ, מ, ו, ה, ש. The gold parse keeps them as a list;
  // answers, attempts, and the Worker see them joined (see joinPrefixes in utils.ts).
  prefix?: string[];
  suffix?: string; // Suffix type (pronominal, directional, etc.)
  suffixPerson?: string; // Person of pronominal suffix
  suffixGender?: string; // Gender of pronominal suffix
  suffixNumber?: string; // Number of pronominal suffix

  // Decoded but not drilled
  nounType?: string; // Common, proper, gentilic
  pronounType?: string; // Personal, demonstrative, relative, interrogative
  particleType?: string; // Definite article, negative, interrogative, etc.
  numeralType?: string; // Cardinal, ordinal
  adjectiveType?: string; // Attributive, predicative
};

export type Word = {
  surface: string; // e.g., "בְּ/רֵאשִׁ֖ית" — "/" separates the morphemes OSHB tagged
  lemma?: string; // main Strong's id, e.g., "H7225"
  strongs?: string; // the full Strong's string, e.g., "Hb/H7225"
  parse?: ParseFields; // normalized fields
  id: string; // stable key
  afterSpace?: boolean; // true if this word should have a space before it
  definition?: {
    // optional lexicon data
    brief?: string;
    full?: string;
  };
};

export type Verse = {
  ref: string; // "Genesis 1:1"
  words: Word[];
};

export type DrillAnswer = {
  [k: string]: string | undefined;
};

export type FieldSpec = {
  key: keyof ParseFields;
  label: string;
  options: string[];
};
