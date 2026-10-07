// Build public/lexicon/tbesh-glosses.json from the Tyndale Brief lexicon of Extended Strongs
// for Hebrew (TBESH, STEPBible.org, CC BY 4.0). Only the Gloss column is taken; the Meaning
// column is abridged BDB owned by Online Bible and is not ours to redistribute.
//
//   node scripts/build-glosses.mjs            # downloads the current TBESH and rebuilds
//   node scripts/build-glosses.mjs tbesh.txt  # rebuilds from a local copy

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const TBESH_URL =
  "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESH%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Hebrew%20-%20STEPBible.org%20CC%20BY.txt";

const OUT = new URL("../public/lexicon/tbesh-glosses.json", import.meta.url);

/** "H0430" → "H430", the form OSHB uses. A BDB split such as "H7652a" keeps its letter. */
export function plainId(eStrong) {
  const m = eStrong.match(/^H0*(\d+)([a-z]?)$/);
  return m ? `H${m[1]}${m[2]}` : undefined;
}

/**
 * One eStrong number can have several rows: the common word, then names and
 * compounds that share the number. The common word carries the dStrong suffix "G"
 * (or no suffix at all when the number is not split); names come later in the alphabet.
 */
function rank(dStrong) {
  const letter = dStrong.match(/^H\d+([A-Z]?)/)?.[1] ?? "";
  if (letter === "G") return 0;
  if (letter === "") return 1;
  return 2 + letter.charCodeAt(0);
}

/** Parse the TBESH tab-separated text into { "H430": "God", ... }. */
export function parseTbesh(text) {
  const best = new Map(); // id -> { rank, gloss }
  for (const line of text.split("\n")) {
    if (!/^H\d{4}/.test(line)) continue;
    const [eStrong, dStrong, , , , , gloss] = line.split("\t");
    const id = plainId(eStrong.trim());
    const cleaned = gloss?.trim();
    if (!id || !cleaned) continue;
    const r = rank(dStrong.trim());
    const have = best.get(id);
    if (!have || r < have.rank) best.set(id, { rank: r, gloss: cleaned });
  }

  // OSHB does not carry BDB's letter splits: "H7652" in the text may be TBESH's "H7652a".
  // Where no plain number exists, the first split stands in for it.
  const out = {};
  for (const [id, { gloss }] of best) out[id] = gloss;
  for (const id of Object.keys(out)) {
    const base = id.replace(/[a-z]$/, "");
    if (base !== id && !(base in out)) out[base] = out[id];
  }
  return Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }))
  );
}

async function main() {
  const source = process.argv[2];
  const text = source
    ? await readFile(source, "utf-8")
    : await fetch(TBESH_URL).then((r) => {
        if (!r.ok) throw new Error(`TBESH download failed: ${r.status} ${r.statusText}`);
        return r.text();
      });
  const glosses = parseTbesh(text);
  await writeFile(OUT, JSON.stringify(glosses));
  console.log(`${Object.keys(glosses).length} glosses → ${fileURLToPath(OUT)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
