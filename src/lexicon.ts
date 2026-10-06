// Strong's Hebrew dictionary (openscriptures/strongs), served from this app's assets.
// One file, fetched once when the first verse loads, then answered from memory.

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

const LEXICON_URL = "/lexicon/strongs-hebrew.json";

let dictionary: Promise<Record<string, StrongsEntry>> | null = null;

function loadDictionary(): Promise<Record<string, StrongsEntry>> {
  if (!dictionary) {
    dictionary = fetch(LEXICON_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch the lexicon: ${response.statusText}`);
        return response.json() as Promise<Record<string, StrongsEntry>>;
      })
      .catch((error) => {
        console.error("Error fetching the Hebrew lexicon:", error);
        dictionary = null;
        return {};
      });
  }
  return dictionary;
}

/** The first KJV rendering, or the first clause of Strong's definition. */
export function briefGloss(entry: StrongsEntry): string | undefined {
  const source = entry.kjv_def?.trim() || entry.strongs_def?.trim();
  if (!source) return undefined;
  const first = source.split(/[,;:]/)[0]?.replace(/^×\s*/, "").trim();
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

export function toLexiconEntry(id: string, entry: StrongsEntry): LexiconEntry {
  const definitions: LexiconDefinition[] = [];
  const brief = briefGloss(entry);
  const full = fullGloss(entry);
  if (brief) definitions.push({ role: "brief", text: brief });
  if (full) definitions.push({ role: "full", text: full });
  return { n: id, orth: entry.lemma ?? id, definitions };
}

/**
 * Look up a Strong's id such as "H7225".
 * Returns the entry with brief and full definitions, or undefined if not found
 */
export async function lookupLemma(lemma: string): Promise<LexiconEntry | undefined> {
  if (!lemma) return undefined;
  const id = lemma.match(/^H\d+/)?.[0];
  if (!id) return undefined;
  const entries = await loadDictionary();
  const entry = entries[id];
  return entry ? toLexiconEntry(id, entry) : undefined;
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
  await loadDictionary();
  const result = new Map<string, LexiconEntry>();
  for (const lemma of lemmas) {
    const entry = await lookupLemma(lemma);
    if (entry) result.set(lemma, entry);
  }
  return result;
}
