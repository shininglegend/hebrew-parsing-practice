# Hebrew Parsing Practice - AI Agent Guidelines

## IMPORTANT NOTES
- Do NOT make any testing files or documentation unless explicitly requested
- Summaries should ONLY be executive style or skipped unless explicitly requested

## Project Overview
Educational web app for Biblical Hebrew morphological parsing practice, using Open Scriptures Hebrew Bible morphology. It is a port of `shininglegend/greek-parsing-practice` and keeps that repo's file layout, module names, and exports so Greek commits cherry-pick across (see "Syncing from the Greek app" in README.md).

## Architecture
- React 19 + Vite 8 + Tailwind 4, Biome for lint/format, vitest for tests, TypeScript 7 (`tsc -b`).
- A Cloudflare Worker (`worker/`) serves the built app as assets and `/api` (sessions, attempts, weak spots, tutor, admin). D1 migrations live in `migrations/`.
- Routes (`src/App.tsx`, react-router): `/` study (`VerseSession`), `/reverse` (`ReverseParser`), `/weak-spots`, `/admin`. `ParserDrill` (card drill) is kept but not routed.

### Data
- `public/hebrew-data/bible-books/{book}/chapter_{N}.json`, served as assets. Each word is `[surface, strongs, morph]`, e.g. `["בְּ/רֵאשִׁ֖ית", "Hb/H7225", "R/Ncfsa"]`. `/` separates the morphemes OSHB tagged. English chapter/verse numbering.
- `src/api.ts`: `loadVerse`, `decodeWord`, `decodeHebrewMorphology`. Prefixes are decided by the Strong's marker (`Hb Hl Hk Hm Hc Hd Hs Hi`); `Rd` adds the article; a leading `A` on a morph part means Aramaic and selects the Aramaic stem table; participles are `V<stem>(r|s)<gender><number><state>`; a trailing `/Td` on an Aramaic noun is skipped. `hebrewMorphCodes.html` is the code reference.
- `public/lexicon/strongs-hebrew.json`: Strong's glosses keyed by `H####`, loaded once by `src/lexicon.ts`.

### Fields
- `FIELD_SPECS` in `src/utils.ts` is the single source of field keys/labels/options; `FIELD_KEYS` and `FIELD_LABEL` derive from it. `worker/index.ts` keeps a literal copy of the keys and `src/utils.test.ts` pins them equal.
- `prefix` is the ONLY list-valued gold field (`ParseFields.prefix: string[]`). Everywhere else it is one string: options joined with `" + "` in `FIELD_SPECS` order. Use `joinPrefixes`, `splitPrefixes`, and `goldValue(parse, key)` rather than reading `parse.prefix` directly. `DrillAnswer` values are `string | undefined`.
- `isFieldRelevant` shows prefix/suffix fields only when the gold has them; participles get state and no person; infinitives get no agreement.

### Signals
- `src/signals.ts`: `findCue(words, word, field)` reads the word's own prefixes, vowels, dagesh, and ending (or the next word for a construct) and returns `{display, note, wordId?}`. `explainMiss`/`explainCorrect` build the signal card; `GRAMMAR_TERM_ALIAS` maps gold values onto `src/data/grammarDefinitions.ts` terms; `chartFor` returns nothing until `src/data/morphologyCharts.ts` has tables.
- Hebrew text is compared after NFD. Combining marks come in canonical order: vowel point, dagesh, shin/sin dot, then accents. Gutturals and resh never take a dagesh.

## Conventions
- State unions `idle | loading | loaded | error` in the drill components.
- Word ids are `${book}-${chapter}-${verse}-${index}`; never key on the array index alone.
- Reset answers and `confettiTriggered` when the verse changes.
- Display surfaces through `plainSurface()` (drops the `/`); keep the raw surface on `Word.surface` so cues can see morpheme boundaries. Hebrew runs `dir="rtl"` with the `font-hebrew` class.
- Export components from `components/index.ts`.
- Run `npm run lint`, `npm run typecheck`, and `npm test` before committing.

## Known Issues & TODOs
See `TODO.md`. Strike items through when they are done.
