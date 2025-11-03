import type { FieldSpec, ParseFields } from "./types";

export const FIELD_SPECS: FieldSpec[] = [
  { key: "pos",    label: "Part of Speech", options: ["noun","verb","adjective","adverb","preposition","pronoun","conjunction","particle","article"] },
  { key: "case",   label: "Case",           options: ["nominative","genitive","dative","accusative","vocative","—"] },
  { key: "number", label: "Number",         options: ["singular","plural","—"] },
  { key: "gender", label: "Gender",         options: ["masculine","feminine","neuter","—"] },
  { key: "tense",  label: "Tense",          options: ["present","imperfect","future","aorist","perfect","pluperfect","—"] },
  { key: "voice",  label: "Voice",          options: ["active","middle","passive","middle/passive","—"] },
  { key: "mood",   label: "Mood",           options: ["indicative","imperative","subjunctive","optative","infinitive","participle","—"] },
  { key: "person", label: "Person",         options: ["first","second","third","—"] },
];

// Map short forms (from API) to long forms (for display/comparison)
const VALUE_NORMALIZATION: Record<string, string> = {
  // Part of speech
  'adj': 'adjective',
  'adv': 'adverb',
  'prep': 'preposition',
  'pron': 'pronoun',
  'conj': 'conjunction',
  'part': 'particle',
  // Case
  'nom': 'nominative',
  'gen': 'genitive',
  'dat': 'dative',
  'acc': 'accusative',
  'voc': 'vocative',
  // Number
  'sg': 'singular',
  'pl': 'plural',
  // Gender
  'masc': 'masculine',
  'fem': 'feminine',
  'neut': 'neuter',
  // Tense
  'pres': 'present',
  'impf': 'imperfect',
  'fut': 'future',
  'aor': 'aorist',
  'perf': 'perfect',
  'plup': 'pluperfect',
  // Voice
  'act': 'active',
  'mid': 'middle',
  'pass': 'passive',
  'mp': 'middle/passive',
  // Mood
  'ind': 'indicative',
  'impv': 'imperative',
  'subj': 'subjunctive',
  'opt': 'optative',
  'inf': 'infinitive',
  // Person
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

export function formatRef(input: string) {
  return input.trim().replace(/\s+/g, " ");
}
