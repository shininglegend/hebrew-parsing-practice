// Two files, each fetched once when the first verse loads, then answered from memory:
//  - Tyndale Brief lexicon of Extended Strongs for Hebrew (TBESH, STEPBible.org, CC BY 4.0):
//    one curated gloss per Strong's number. This is the brief definition.
//  - Strong's Hebrew dictionary (openscriptures/strongs, CC-BY-SA): the full definition,
//    and the brief fallback for any number TBESH lacks.

export type LexiconDefinition = {
  role: "brief" | "full";
  text: string;
};

export type LexiconEntry = {
  n: string;
  orth: string;
  definitions: LexiconDefinition[];
};

type StrongsEntry = {
  lemma?: string;
  xlit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
};

const STRONGS_URL = "/lexicon/strongs-hebrew.json";
const GLOSSES_URL = "/lexicon/tbesh-glosses.json";

let dictionary: Promise<Record<string, StrongsEntry>> | null = null;
let glosses: Promise<Record<string, string>> | null = null;

function fetchJson<T>(url: string, label: string, onFail: () => void): Promise<T> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to fetch ${label}: ${response.statusText}`);
      return response.json() as Promise<T>;
    })
    .catch((error) => {
      console.error(`Error fetching ${label}:`, error);
      onFail();
      return {} as T;
    });
}

function loadDictionary(): Promise<Record<string, StrongsEntry>> {
  if (!dictionary) {
    dictionary = fetchJson(STRONGS_URL, "the Hebrew lexicon", () => {
      dictionary = null;
    });
  }
  return dictionary;
}

function loadGlosses(): Promise<Record<string, string>> {
  if (!glosses) {
    glosses = fetchJson(GLOSSES_URL, "the Hebrew glosses", () => {
      glosses = null;
    });
  }
  return glosses;
}

/**
 * Fallback when TBESH has no gloss: the first clause of Strong's definition, or failing
 * that the first KJV rendering. Strong's KJV list is alphabetical, not by frequency
 * (H430 אֱלֹהִים starts "angels, ..."), so the definition text is the better guess.
 */
export function briefGloss(entry: StrongsEntry): string | undefined {
  const source = entry.strongs_def?.trim() || entry.kjv_def?.trim();
  if (!source) return undefined;
  const first = source
    .split(/[,;:]/)[0]
    ?.replace(/^(\[(idiom|phrase)\]|×)\s*/, "")
    .trim();
  return first || undefined;
}

export function fullGloss(entry: StrongsEntry): string | undefined {
  const pieces: string[] = [];
  if (entry.strongs_def) pieces.push(entry.strongs_def.trim());
  if (entry.kjv_def) pieces.push(`KJV: ${entry.kjv_def.trim()}`);
  if (entry.derivation) pieces.push(entry.derivation.trim());
  const said = [entry.xlit, entry.pron].filter(Boolean).join(", ");
  if (said) pieces.push(`[${said}]`);
  return pieces.length > 0 ? pieces.join(" — ") : undefined;
}

export function toLexiconEntry(
  id: string,
  entry: StrongsEntry | undefined,
  gloss: string | undefined
): LexiconEntry {
  const definitions: LexiconDefinition[] = [];
  const brief = gloss?.trim() || (entry ? briefGloss(entry) : undefined);
  const full = entry ? fullGloss(entry) : undefined;
  if (brief) definitions.push({ role: "brief", text: brief });
  if (full) definitions.push({ role: "full", text: full });
  return { n: id, orth: entry?.lemma ?? id, definitions };
}

/**
 * Look up a Strong's id such as "H7225".
 * Returns the entry with brief and full definitions, or undefined if neither source knows it.
 */
export async function lookupLemma(lemma: string): Promise<LexiconEntry | undefined> {
  if (!lemma) return undefined;
  const id = lemma.match(/^H\d+/)?.[0];
  if (!id) return undefined;
  const [entries, glossMap] = await Promise.all([loadDictionary(), loadGlosses()]);
  const entry = entries[id];
  const gloss = glossMap[id];
  return entry || gloss ? toLexiconEntry(id, entry, gloss) : undefined;
}

/**
 * Get just the brief definition text for a lemma
 */
export async function getBriefDefinition(lemma: string): Promise<string | undefined> {
  const entry = await lookupLemma(lemma);
  return entry?.definitions.find((d) => d.role === "brief")?.text;
}

/**
 * Get just the full definition text for a lemma
 */
export async function getFullDefinition(lemma: string): Promise<string | undefined> {
  const entry = await lookupLemma(lemma);
  return entry?.definitions.find((d) => d.role === "full")?.text;
}

/**
 * Prefetch lexicon data for all lemmas in a list
 * Returns a map of lemma -> entry for quick lookup
 */
export async function prefetchLemmas(lemmas: string[]): Promise<Map<string, LexiconEntry>> {
  await Promise.all([loadDictionary(), loadGlosses()]);
  const result = new Map<string, LexiconEntry>();
  for (const lemma of lemmas) {
    const entry = await lookupLemma(lemma);
    if (entry) result.set(lemma, entry);
  }
  return result;
}
