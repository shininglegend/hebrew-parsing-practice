export type ParseFields = {
  pos?: string;      // Part of speech (noun, verb, adjective, etc.)
  state?: string;    // Noun state (absolute, construct, determined)
  gender?: string;   // Masculine, feminine, common
  number?: string;   // Singular, plural, dual
  person?: string;   // 1st, 2nd, 3rd person
  stem?: string;     // Verb stem/binyan (qal, niphal, piel, etc.)
  tense?: string;    // Verb tense (perfect, imperfect, imperative, etc.)
};

export type Word = {
  surface: string;     // e.g., "בְּרֵאשִׁית"
  lemma?: string;      // e.g., "H7225"
  parse?: ParseFields; // normalized fields
  id: string;          // stable key
  afterSpace?: boolean; // true if this word should have space before it (false for compound parts)
};

export type Verse = {
  ref: string;         // "Jn 1:1"
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
