# Hebrew Parsing Practice

An educational web application for practicing Biblical Hebrew morphological parsing. Load a verse, parse each word by selecting its grammatical properties, and receive immediate feedback on your accuracy.

## Features

- Parse one word at a time. Prefixes first, then the part of speech, then the rest. A miss explains the contrast, the spelling in the word that points at the answer (a וַ, a dagesh, a preformative letter, the next word of a construct chain), and what that parse does in English
- After the verse is parsed, write an English rendering and compare a parse checklist and up to five of ten public-domain English versions from bible-api.com
- Weak spots count repeated misses by form, with the word and each wrong guess
- An approved account can ask for a longer tutor note. Every query and reply is stored for `/admin`
- The Open Scriptures Hebrew Bible is the grader. The model never overrides a parse
- Aramaic (Daniel, Ezra, Jeremiah 10:11, Genesis 31:47) is decoded with its own stems: peal, pael, haphel, and the rest

## Tech Stack

- React 19 + TypeScript
- Vite and a Cloudflare Worker (static assets plus `/api`)
- Tailwind CSS for styling
- D1 for accounts, parse attempts, and the tutor log
- KV for cached tutor replies
- Rate limiting bindings for tutor calls, saved attempts, and sign-in emails

## Run it locally

```bash
npm install
npm run dev
```

That applies `migrations/` to a local D1 database under `.wrangler/` and serves the app at `http://localhost:5173`, including `/api`. Parsing, signal cards, weak spots, and the public-domain English versions work without a Cloudflare account. Sign-in stays off until `EMAIL_FROM` is set. The tutor stays off until an account is approved.

Workers AI still calls Cloudflare's remote models during local dev and can spend tokens. Leave the tutor alone unless you mean to.

Checks before a commit:

```bash
npm run lint       # Biome lint + format check
npm run lint:fix   # apply safe fixes and format
npm run typecheck  # tsc -b across app, worker, and config
npm test
```

Biome handles both linting and formatting. TypeScript 7 dropped the JavaScript compiler API, so typescript-eslint cannot run against this project. Hook dependency, array-index key, `any`, and most a11y rules report as warnings for now, so they show up without blocking a commit.

## Static data

Everything the parser reads ships with the app from `public/`, so a preview branch sees its own data and nothing depends on GitHub at runtime:

- `public/hebrew-data/bible-books/{book}/chapter_{N}.json` is the Open Scriptures Hebrew Bible morphology, one file per chapter, in English chapter and verse numbering. Each word is `[surface, strongs, morph]`, for example `["בְּ/רֵאשִׁ֖ית", "Hb/H7225", "R/Ncfsa"]`. The `/` separates the morphemes OSHB tagged. `hebrewMorphCodes.html` documents the codes; `src/api.ts` decodes them.
- `public/lexicon/tbesh-glosses.json` is the brief gloss shown under each word: the Gloss column of the Translators Brief lexicon of Extended Strongs for Hebrew (TBESH) from STEPBible.org (CC BY 4.0, see `public/lexicon/LICENSE-tbesh.txt`), keyed by Strong's number. Strong's own KJV lists are alphabetical, so taking their first word gives "angels" for אֱלֹהִים; TBESH gives one curated gloss per number. `npm run build:glosses` downloads the current TBESH and rebuilds the file (`node scripts/build-glosses.mjs path/to/tbesh.txt` works from a local copy).
- `public/lexicon/strongs-hebrew.json` is Strong's Hebrew dictionary in the Open Scriptures edition (CC-BY-SA, see `public/lexicon/LICENSE-strongs.txt`), trimmed to the fields the app shows. It is the full definition popup, and the brief fallback for any number TBESH lacks. To regenerate it:

```bash
curl -sSo /tmp/strongs.js https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js
python3 - <<'PY'
import json
src = open('/tmp/strongs.js', encoding='utf-8').read()
data = json.loads(src[src.index('{'):src.rindex('}') + 1])
keep = ('lemma', 'xlit', 'pron', 'derivation', 'strongs_def', 'kjv_def')
out = {k: {f: v[f] for f in keep if v.get(f)} for k, v in data.items()}
json.dump(out, open('public/lexicon/strongs-hebrew.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
PY
```

The Worker serves `public/` as assets. Its `not_found_handling` is `single-page-application`, so a chapter that does not exist comes back as `index.html`; `src/api.ts` checks the content type and reports "not in the data" instead of a blank verse.

## Put it on Cloudflare

Log in once:

```bash
npx wrangler login
```

The Worker reads two bindings by name. The names are not optional:

| Binding | Resource | What it stores |
| --- | --- | --- |
| `DB` | D1 database `hebrewparser` | Accounts, sessions, attempts, tutor log. Guests have no rows; their attempts stay in the browser until they sign in |
| `CACHE` | KV namespace | Cached tutor replies |

`wrangler d1 migrations apply` takes the **binding** name, `DB`, not the database name.

### 1. Database

```bash
npx wrangler d1 create hebrewparser
```

The command prints a `database_id`. If you let Wrangler edit the config, it **appends a second** `d1_databases` entry and leaves the original one alone. The app only reads `env.DB`, and that entry is the one with `"migrations_dir": "migrations"`.

Copy the printed id onto the `DB` entry and delete the extra entry. You want one database:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "hebrewparser",
    "database_id": "<id printed by d1 create>",
    "migrations_dir": "migrations"
  }
]
```

Then create the tables on that remote database:

```bash
npx wrangler d1 migrations apply DB --remote
```

`--remote` writes to Cloudflare. `npm run dev` already applies the same SQL locally and does not need this command.

If apply fails with `database 00000000-0000-0000-0000-000000000001 could not be found`, the `DB` entry still has the placeholder id from the repo. The id Wrangler appended on the other binding is the real one. Move it, as above, and run apply again.

### 2. Cache

```bash
npx wrangler kv namespace create CACHE
```

Put the printed id on the existing `CACHE` binding. Keep the binding name `CACHE`:

```jsonc
"kv_namespaces": [
  { "binding": "CACHE", "id": "<id printed by kv namespace create>" }
]
```

### 3. Admin and mail

In `wrangler.jsonc` under `vars`:

- `ADMIN_EMAILS` is the allowlist. A comma-separated string or a list of addresses both work. The first time one of those addresses opens a magic link, that account is created as `admin` and `approved`. Any other address is `pending` until you approve it at `/admin`. An address already signed in is promoted on the next request.
- `EMAIL_FROM` is the From address, and its domain has to be onboarded for Email Sending:

```bash
npx wrangler email sending enable example.com
```

Then set `EMAIL_FROM` to something like `hebrew@example.com`. While it is empty, sign-in returns 503 and the rest of the app still works.

`npm run dev` sends that mail for real, because the `EMAIL` binding has `"remote": true`. Without that flag, Wrangler only prints the link in the terminal. The link points at `localhost`, so open it on this machine.

The `routes` entry in `wrangler.jsonc` names the custom domain. Change it to the hostname you own, or remove the entry to use the `workers.dev` address.

### 4. Tutor

Tutor calls go through the `AI` binding and an [AI Gateway](https://developers.cloudflare.com/ai-gateway/get-started/). `AI_GATEWAY_ID` is `hebrewparser`. A gateway with any name other than `default` has to exist before the first call: in the dashboard, open **AI** > **AI Gateway** and create one named `hebrewparser`. Only the name `default` is created automatically.

`AI_MODEL` picks the model for word explanations and `AI_TRANSLATION_MODEL` picks the one for translation reviews. A Workers AI id such as `@cf/meta/llama-3.3-70b-instruct-fp8-fast` is billed in Neurons on the account. An Anthropic id such as `anthropic/claude-sonnet-5` or `anthropic/claude-opus-5` uses the same binding and needs [Unified Billing](https://developers.cloudflare.com/ai-gateway/features/unified-billing/) credits loaded on the gateway. Changing the var and redeploying is the whole switch.

Neither call asks the model to reason before answering. The translation review used to run Kimi K2.6 in reasoning mode, and the trace regularly used up the whole output allowance before the two sections were written, so the student got a truncated or empty review. The review now gets 1,536 output tokens and Kimi's reasoning mode is off for every Kimi id.

To move the review to Anthropic, load Unified Billing credits on the gateway and set `AI_TRANSLATION_MODEL`:

- `anthropic/claude-opus-5-5` is the strongest reviewer for Biblical Hebrew. Opus and Sonnet 5 and later always think before answering, so the request sends `output_config.effort: low` to keep the trace short and adds 2,048 tokens of room for it on top of the answer. That extra room is charged against the student's cap up front and corrected to real usage afterwards.
- `anthropic/claude-sonnet-5-5` gets the same treatment at about half the price.
- `anthropic/claude-haiku-4-5` does not think and rejects the effort setting, so it gets the plain 1,536-token allowance. Cheapest, and still well ahead of the Workers AI catalog on Hebrew.

Pointed Hebrew tokenizes badly: each letter, vowel point, and accent tends to be its own token. The up-front charge counts Hebrew code points at 2.5 tokens each and the rest at three characters per token, then the row is corrected to the usage the model reports. At a 20,000-token monthly cap, even Opus costs well under a dollar per student per month. Send one review through the gateway before pointing students at a new model: the `output_config` field has not been exercised through this gateway yet. Guests and pending accounts cannot call it. Each approved account has a monthly cap of 20,000 tokens. A call is charged before the model runs, at the prompt estimate plus the full output allowance, then corrected to the reported usage. If the model reports no usage, the charge stands. The `TUTOR_LIMIT` binding also caps one account at 12 calls a minute, so a burst cannot outrun the cap check. Set a spend budget on the AI Gateway as well; it is the backstop when the app is wrong.

Turnstile is optional and guards only the sign-in flow (sending the magic link and confirming it). Tutor calls skip it: an approved, signed-in account is already vetted and token-capped. A Turnstile widget is bound to its hostnames, so create one for this app's domain, set its site key as `TURNSTILE_SITE_KEY` in `vars`, then:

```bash
npx wrangler secret put TURNSTILE_SECRET
```

For local checks, copy `.dev.vars.example` to `.dev.vars`. If the secret is unset, the widget is skipped.

### 5. Deploy

```bash
npm run deploy
```

After you change bindings, refresh the generated Worker types:

```bash
npm run cf-typegen
```

## Syncing from the Greek app

This app is a port of [greek-parsing-practice](https://github.com/shininglegend/greek-parsing-practice), which keeps getting features. The two repos share history and the same file layout, module names, and export names, so a Greek commit usually cherry-picks across. Language-specific content stays in the same files it lives in over there (`src/api.ts`, `src/utils.ts`, `src/signals.ts`, `src/lexicon.ts`, `src/translations.ts`, `src/data/`), so a Greek change to one of those files will conflict and needs a hand-merge; everything else (Worker, session, attempts, translate step, weak spots, admin, tooling) applies as is.

```bash
git remote add greek https://github.com/shininglegend/greek-parsing-practice.git
git fetch greek
git log --oneline 907d6c3..greek/main      # what Hebrew has not seen yet
git cherry-pick <sha>                       # one Greek commit at a time
```

Last synced Greek commit: `907d6c3` (2026-10-06, "Grow the English field to fit the translation."). Update this line when you sync.

Things that differ on purpose, so a cherry-pick that touches them needs a look:

- `prefix` is the one list-valued gold field. Outside the gold parse it travels as one string joined with `" + "` in `FIELD_SPECS` order (`joinPrefixes` / `splitPrefixes` / `goldValue` in `src/utils.ts`), so answers, attempts, the Worker, and weak spots stay string-only like Greek.
- There is no article pairing (`src/articlePairs.ts` was dropped); the article is a prefix here. `src/signals.ts` has a field-aware `findCue` instead of Greek's subjunctive cues.
- `FIELD_KEYS` in `src/utils.ts` is the single field list on the client; `worker/index.ts` keeps a literal copy and `src/utils.test.ts` pins them equal.
- The translate-step request body key is `hebrew`, not `greek`.

## How It Works

1. Load a verse and tap one word at a time
2. Choose its features. A miss shows why: the contrast, a cue in the word or the verse when there is one, and what that parse does in English
3. When the selected words are answered, write an English rendering and compare a parse checklist and up to five public-domain English versions from bible-api.com
4. Weak spots count repeated misses. An approved account can ask for a longer tutor note; every query and reply is stored for the admin dashboard

## Project Structure

- `src/App.tsx` - Routes for study, reverse parsing, weak spots, and admin
- `src/api.ts` - OSHB chapter loading and the morphology decoder
- `src/signals.ts` - Cues and explanations for misses
- `src/lexicon.ts` - TBESH glosses and Strong's definitions
- `worker/` - Session, tutor, and admin API
- `src/types.ts` - TypeScript definitions for words, verses, and parse fields
- `src/utils.ts` - Field specs, scoring, book list, prefix helpers

## Data Sources

Morphology is from the [Open Scriptures Hebrew Bible](https://github.com/openscriptures/morphhb). If a parse is wrong, open an issue there. Brief glosses are from the [Translators Brief lexicon of Extended Strongs for Hebrew](https://github.com/STEPBible/STEPBible-Data) by STEPBible.org and Tyndale House (CC BY 4.0). Full definitions are from Strong's Hebrew dictionary in the [Open Scriptures edition](https://github.com/openscriptures/strongs) (CC-BY-SA). English versions come from [bible-api.com](https://bible-api.com).
