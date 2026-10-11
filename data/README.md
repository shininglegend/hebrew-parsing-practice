# OSHB corrections

`public/hebrew-data/` is vendored Open Scriptures Hebrew Bible data. Do not edit it: a refresh would overwrite the edit. Fix a wrong tag here instead.

## `oshb-corrections.json`

Each entry retags one word:

| Field | Meaning |
| --- | --- |
| `id` | OSHB `<w id>` in morphhb's `wlc/*.xml`, for the audit and the upstream report |
| `ref` | OSIS reference, `Josh.3.7` |
| `index` | 0-based position of the word in that verse of the app's chapter file. The word id the app shows and saves is `joshua-3-7-19`; `index` is the last number |
| `word` | The surface exactly as the chapter file has it, `/` dividers included |
| `oshb_morph` | The tag OSHB has, with its language letter, `HR/Sp2fs` |
| `corrected_morph` | The tag to use instead, `HR/Sp2ms` |
| `reason` | Why, in a few words |

The chapter files carry no OSHB ids, so the app finds a word by `ref` + `index`. The `id` is kept as well, so the entry can be traced upstream.

`src/corrections.ts` applies the file where a chapter is fetched (`fetchChapter` in `src/api.ts`). Everything downstream sees the corrected tag: the answer key, the signal cards, the tutor prompt, and the attempts that feed weak spots.

If the word at `index` is not `word`, or its tag is not `oshb_morph`, the entry is skipped and the browser console logs a warning. That means the data was refreshed and the word moved, or upstream changed the tag. `npm test` checks every entry against the chapter files, so CI fails before a stale entry ships.

### Adding an entry

1. Find the word in `audit-pausal-2fs.csv`, or in morphhb's XML. The CSV's `app_word_id` column gives `index`.
2. Copy `word` from the chapter file, not from a browser or an editor. Hebrew points can be stored in more than one order, and the check compares exact text.
3. Run `npm test`.
4. Saved attempts keep the gold value they were graded against. To regrade old attempts on that word, add a migration like `migrations/0003_oshb_pausal_2ms.sql`.

## `audit-pausal-2fs.csv`

Output of `scripts/audit_pausal_2fs.py`. It lists every OSHB word tagged `Sp2fs` that is spelled like a pausal 2ms suffix (qamats + final kaf + sheva). It is a review list, not a list of errors. Many rows are correct 2fs: a woman, Zion, Jerusalem, or a city is addressed. A row is a mistag only when the addressee is masculine.

To regenerate it against current morphhb:

```bash
git clone --depth 1 https://github.com/openscriptures/morphhb /tmp/morphhb
npm run audit:pausal -- /tmp/morphhb/wlc
```

The script also warns when a correction's `id` is gone upstream, or when its upstream tag no longer equals `oshb_morph`.

Tests: `npm run test:audit` runs them against a three-verse fixture. With `OSHB_WLC=/tmp/morphhb/wlc` set, they also run against the whole corpus.
