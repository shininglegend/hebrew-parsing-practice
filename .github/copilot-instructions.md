# Hebrew Parsing Practice - AI Agent Guidelines

## IMPORTANT NOTES
- Do NOT make any testing files or documentation unless explicitly requested
- Summaries should ONLY be executive style or skipped unless explicitly requested

## Project Overview
Educational web app for Biblical Hebrew morphological parsing practice using real linguistic data from Open Scriptures Hebrew Bible.

**MIGRATION STATUS**: ✅ **Complete** - App now uses local Hebrew data from `hebrew-data/bible-books/`. The migration from Greek (MorphGNT API) to Hebrew is functionally complete. Any remaining Greek references in comments/docs are legacy artifacts to clean up.

## Architecture

### Two-Mode Application
1. **Parser Drill** (`ParserDrill.tsx`): User selects morphological properties for each word via dropdowns
2. **Reverse Parser** (`ReverseParser.tsx`): User types Hebrew words matching displayed morphological properties

Navigation uses hash-based routing (`#/` and `#/reverse`) without react-router - see `App.tsx` for implementation.

### Data Flow
- **Data Source**: Hebrew Bible data loaded from GitHub via `loadVerse()` in `api.ts`
  - Base URL: `https://raw.githubusercontent.com/shininglegend/hebrew-parsing-practice/refs/heads/main/hebrew-data/bible-books`
  - Data format: `hebrew-data/bible-books/{book}/chapter_{N}.json`
  - Structure: `[[[word, strongs, morphology], ...]]` (nested: chapters → verses → words)
  - Example word: `["בְּ/רֵאשִׁ֖ית", "Hb/H7225", "R/Ncfsa"]` (surface text, Strong's number, morphology code)
  - In-memory caching via `chapterCache` object to avoid repeated fetches
- **Morphology Decoder**: `decodeHebrewMorphology()` in `api.ts` converts positional codes to structured `ParseFields`
  - Handles prefixes (Hb, Hl, Hk, Hm, Hc, Hd, Hs), suffixes (Sp...), and main words
  - Reference: `hebrewMorphCodes.html` documents the complete morphology code system
  - Compound words (with `/` separators) are parsed into prefix arrays + main word fields + suffix/suffix fields. (Any one or all of the three parts may be missing - ie, sometimes there is just a main word, sometimes there's just a prefix and suffix, etc.)
- **Type System** (`types.ts`): Core types are `Word`, `Verse`, `ParseFields`, `DrillAnswer`, `FieldSpec`
- **Scoring** (`utils.ts`): Field-by-field comparison with `normalizeMissing()` for handling `undefined`/`"—"`/`"na"`

### Key Components
- `WordCard.tsx`: Expandable card with dropdowns for morphological selection
  - Uses `PrefixField.tsx` for multi-select prefix checkboxes (handles arrays)
  - Uses `SuffixFields.tsx` for suffix-related fields (conditional rendering)
  - Color-codes fields: green (correct), red (incorrect), neutral (unanswered)
  - Conditionally shows fields based on `isFieldRelevant()` and POS selection
- `VerseSelector.tsx`: Book/chapter/verse picker with "Previous"/"Next" verse navigation buttons
- `Header.tsx`/`Footer.tsx`: Navigation between modes and external links
- `GrammarGuide.tsx`, `MorphologyCharts.tsx`, `Help.tsx`: Reference materials in modals (using `Modal.tsx`)
- `Results.tsx`: Score display with field-by-field breakdown showing gold vs. user answers

## Critical Conventions

### State Machine Pattern
Both drill modes use explicit state unions:
```typescript
type State = 
  | { kind: "idle" }
  | { kind: "loading"; ref: string }
  | { kind: "loaded"; verse: Verse }
  | { kind: "error"; msg: string }
```

### Morphology Field Handling
- Fields are defined in `FIELD_SPECS` array in `utils.ts`
- Missing/irrelevant fields use `undefined`, not empty string
- Normalization strips `"-"`, `"—"`, `"na"`, `"none"` to `undefined`
- Some fields don't apply to certain parts of speech (e.g., verbs lack case)

### Word Identification
Words use stable IDs from API (`word["@id"]`) or fallback to `${verse}-${index}`. Never use array index alone as it breaks when filtering words.

### Confetti Celebration
Both modes trigger `celebrateWithConfetti()` on completion using `canvas-confetti`. Uses `useRef` to prevent repeated triggers: `confettiTriggered.current = true`.

## Development Patterns

### Component Structure
- Export from `components/index.ts` for clean imports
- Co-locate modal components with their trigger buttons
- Use Tailwind classes via `index.css` custom components (`.card`, `.input`, `.btn`)

### State Updates
- Answers stored as `Record<string, DrillAnswer>` keyed by word ID
- Use functional updates for nested state: `setAnswers(prev => ({ ...prev, [id]: { ...prev[id], [key]: val } }))`
- Reset answers/inputs when verse changes
- Confetti trigger uses `useRef` to track completion: `confettiTriggered.current` resets on verse change

### Prefix Field Pattern (CRITICAL)
`prefix` is the ONLY field stored as `string[]` array - all other fields are `string | undefined`. Special handling:
- **In WordCard.tsx**: Uses `PrefixField.tsx` component with multi-select checkboxes
- **In scoring (utils.ts)**: Array comparison with set equality (order-independent)
- **Example gold**: `prefix: ["ב (in/with)", "ה (the)"]` for word with both prefixes
- When checking user input, normalize both arrays before comparing

### Unicode Handling (Reverse Parser)
**[LEGACY - Greek-specific]** Three normalization toggles for text comparison:
1. `ignoreAccents`: Strip accent marks (΄ ` ῀)
2. `ignoreBreathing`: Strip breathing marks (᾿ ῾)  
3. `ignoreCase`: Case-insensitive matching

Custom `normalizeForComparison()` function handles diacritic removal. These will need adaptation for Hebrew diacritics (vowel points, cantillation marks, etc.).

### Field Relevance Logic
Fields conditionally shown based on part of speech (see `isFieldRelevant()` in `utils.ts`):
- Nouns: state, gender, number (no tense/stem/person)
- Verbs: stem, tense, person, gender, number (no state)
- Adjectives: state, gender, number (like nouns)
- Particles/prepositions: typically no inflection fields
- Suffix fields only shown when `suffix` field has a value

## Known Issues & TODOs

### Active Issues
See `TODO.md` for current priorities. Update using strikethrough if asked to work on an issue there. 

## Build & Deploy
- Vite + React 18 + TypeScript
- Tailwind CSS for styling
- Deploy: `npm run deploy` builds and pushes to `gh-pages` with `.nojekyll` file
- Base path: `/` (not scoped to subdirectory)

## Common Mistakes to Avoid
1. Don't use array indices as word keys - use word IDs (crucial for word filtering)
2. Don't check for empty string `""` in morphology - check `undefined`
3. Don't forget to reset `confettiTriggered.current` when verse changes
4. Don't modify `FIELD_SPECS` without updating scoring logic in `utils.ts`
5. `prefix` field is an array (`string[]`) - all other fields are `string | undefined`
6. When comparing prefixes in scoring, use set equality (order-independent)
7. Hebrew morphology codes are positional - see `hebrewMorphCodes.html` for reference

## Workflow When Encountering Greek Code
1. **Complete your assigned task first** using existing code
2. **After completion**, report: "I noticed these Greek-related items: [list]. Should I update these to Hebrew?"
3. Wait for explicit instruction before making Greek→Hebrew changes
4. When migrating, test thoroughly - morphology systems differ significantly
