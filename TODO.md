# Working on List:

Note: This list is ordered top-to-bottom by priority. Submit an issue if you want your features added!

### Bugfixes

- ~~Check and fix grammar charts~~
- ~~Write the morphology charts (`src/data/morphologyCharts.ts` is empty, so the Morphology Charts modal says so and signal cards offer no paradigm link; wire `chartFor` in `src/signals.ts` once tables exist)~~
- Weak-verb paradigms for the morphology charts (I-nun, I-yod, hollow, III-he, geminate); the strong verb and the nominal charts are done
- Stop the card drill's score (`Results.tsx` via `scoreParse`) from showing the gold prefixes before any prefix has been ticked
- Reverse parser: box width still hints at length; typing without points works only with the toggles on; no per-word reveal
- ~~Participles decoded as person/gender/number, so gender, number, and state were lost~~
- ~~`Rd` (preposition + article) prefixes dropped; interrogative and relative prefixes labeled as the article~~
- ~~Aramaic codes read with the Hebrew stem table, and the emphatic `/Td` ending overwrote the noun~~
- ~~Obadiah's single chapter was not forced to 1 because of a case mismatch~~

### Future stuff

- If lookup failed, add better error handling
- Construct-chain and noun–adjective agreement hints (the Greek app pairs articles with their nouns; the Hebrew analog would be construct chains)
- Hebrew-to-English versification notes where the data's English numbering differs from a printed Hebrew Bible (Psalm titles, Joel 3–4, Malachi 3–4)
