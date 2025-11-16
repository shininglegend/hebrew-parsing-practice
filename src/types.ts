export type ParseFields = {
  pos?: string;      // Part of speech (noun, verb, adjective, etc.)
  state?: string;    // Noun state (absolute, construct, determined)
  gender?: string;   // Masculine, feminine, common
  number?: string;   // Singular, plural, dual
  person?: string;   // 1st, 2nd, 3rd person
  stem?: string;     // Verb stem/binyan (qal, niphal, piel, etc.)
  tense?: string;    // Verb tense (perfect, imperfect, imperative, etc.)
  
  // Additional Hebrew-specific fields
  prefix?: string[];   // Prefixes like ב, ל, כ, מ, ו, ה, ש (can have multiple)
  suffix?: string;   // Suffix type (pronominal, directional, etc.)
  suffixPerson?: string;  // Person of pronominal suffix
  suffixGender?: string;  // Gender of pronominal suffix
  suffixNumber?: string;  // Number of pronominal suffix
  
  // Additional grammatical features
  nounType?: string;      // Common, proper, gentilic
  pronounType?: string;   // Personal, demonstrative, relative, interrogative
  particleType?: string;  // Definite article, negative, interrogative, etc.
  numeralType?: string;   // Cardinal, ordinal
  adjectiveType?: string; // Attributive, predicative
};

export type Word = {
  surface: string;     // e.g., "בְּרֵאשִׁית"
  lemma?: string;      // e.g., "H7225"
  parse?: ParseFields; // normalized fields
  id: string;          // stable key
  afterSpace?: boolean; // true if this word should have space before it (false for compound parts)
};

export type Verse = {
  ref: string;         // "Gen 1:1"
  words: Word[];
};

export type DrillAnswer = {
  [k: string]: string | string[] | undefined;
};

export type FieldSpec = {
  key: keyof ParseFields;
  label: string;
  options: string[];
};
