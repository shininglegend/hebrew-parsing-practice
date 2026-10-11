#!/usr/bin/env python3
"""List OSHB words tagged 2fs (Sp2fs) that are spelled like the pausal 2ms suffix.

In pause the 2ms suffix -ְךָ often becomes -ָךְ, which is spelled like the 2fs, and OSHB tags
many of those 2fs even when the addressee is male (Josh 3:7 עִמָּךְ, said to Joshua). This
script finds the candidates for a person to review. It never changes data/oshb-corrections.json.

Usage:
    git clone --depth 1 https://github.com/openscriptures/morphhb /tmp/morphhb
    python3 scripts/audit_pausal_2fs.py /tmp/morphhb/wlc

It writes data/audit-pausal-2fs.csv and prints counts by book. It also warns about any
correction whose OSHB id is gone, or whose upstream tag no longer equals its oshb_morph.

Python 3.9+, standard library only.
"""

from __future__ import annotations

import argparse
import csv
import difflib
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OSIS = "{http://www.bibletechnologies.net/2003/OSIS/namespace}"

# OSIS book name -> the app's data folder under public/hebrew-data/bible-books (src/utils.ts)
BOOKS = {
    "Gen": "genesis", "Exod": "exodus", "Lev": "leviticus", "Num": "numbers",
    "Deut": "deuteronomy", "Josh": "joshua", "Judg": "judges", "Ruth": "ruth",
    "1Sam": "isamuel", "2Sam": "iisamuel", "1Kgs": "ikings", "2Kgs": "iikings",
    "1Chr": "ichronicles", "2Chr": "iichronicles", "Ezra": "ezra", "Neh": "nehemiah",
    "Esth": "esther", "Job": "job", "Ps": "psalms", "Prov": "proverbs",
    "Eccl": "ecclesiastes", "Song": "songofsolomon", "Isa": "isaiah", "Jer": "jeremiah",
    "Lam": "lamentations", "Ezek": "ezekiel", "Dan": "daniel", "Hos": "hosea",
    "Joel": "joel", "Amos": "amos", "Obad": "obadiah", "Jonah": "jonah", "Mic": "micah",
    "Nah": "nahum", "Hab": "habakkuk", "Zeph": "zephaniah", "Hag": "haggai",
    "Zech": "zechariah", "Mal": "malachi",
}

CANTILLATION = re.compile("[֑-֯]")
METEG = "ֽ"
SOF_PASUQ = "׃"
# qamats + final kaf + sheva at the end, with a dagesh allowed on the letter before the kaf.
# OSHB writes the dagesh before the vowel; NFD writes it after. Accept either order.
PAUSAL_ENDING = re.compile("ּ?ָּ?ךְ$")

ACCENTS = [
    ("֑", "atnach"),
    ("֔", "zaqef qatan"),
    ("֕", "zaqef gadol"),
    ("֒", "segolta"),
    ("֙", "pashta"),
]

COLUMNS = [
    "ref", "id", "word", "morph", "accent", "full_verse_hebrew", "already_corrected",
    "app_word_id",
]

HEADER_NOTE = [
    "Candidates for pausal 2ms suffixes that OSHB tags as 2fs (Sp2fs). Review by hand; nothing here is applied.",
    "Many hits are correct 2fs: addressed to a woman, Zion, Jerusalem, a city, or a land.",
    "A row is a mistag only when the addressee is masculine. Add confirmed rows to data/oshb-corrections.json.",
    "accent names silluq, atnach, zaqef, segolta, or pashta on the word (prose accent names; poetic books use another system).",
    "app_word_id is book-chapter-verse-index in the app's chapter files; index is the overlay's index. Blank if the word did not align.",
]


def normalize(text: str) -> str:
    """Drop morpheme dividers, cantillation, and meteg; keep letters, vowels, and dagesh."""
    return CANTILLATION.sub("", text.replace("/", "")).replace(METEG, "")


def is_candidate(text: str, morph: str) -> bool:
    return "Sp2fs" in morph and bool(PAUSAL_ENDING.search(normalize(text)))


def accents(text: str, verse_final: bool) -> str:
    names = []
    if verse_final and METEG in text:
        names.append("silluq")
    names += [name for mark, name in ACCENTS if mark in text]
    return "; ".join(names)


@dataclass
class Word:
    ref: str
    id: str
    text: str
    morph: str
    verse_final: bool = False


@dataclass
class Verse:
    ref: str
    hebrew: str
    words: list[Word] = field(default_factory=list)


def read_book(path: Path) -> list[Verse]:
    verses = []
    for verse in ET.parse(path).iter(f"{OSIS}verse"):
        ref = verse.get("osisID", "")
        words = [
            Word(ref, w.get("id", ""), w.text or "", w.get("morph", ""))
            for w in verse.iter(f"{OSIS}w")
        ]
        has_sof_pasuq = any(
            s.get("type") == "x-sof-pasuq" for s in verse.iter(f"{OSIS}seg")
        )
        if words and has_sof_pasuq:
            # The last <w> in document order: the verse's final word, or the qere of a final ketiv
            words[-1].verse_final = True
        verses.append(Verse(ref, verse_text(verse), words))
    return verses


def verse_text(verse: ET.Element) -> str:
    """The verse as one line: maqqef and sof pasuq join, a qere follows its ketiv in brackets."""
    out = ""
    for child in verse:
        tag = child.tag.replace(OSIS, "")
        if tag == "w":
            out += ("" if out.endswith("־") or not out else " ") + (child.text or "")
        elif tag == "seg":
            kind = child.get("type")
            if kind in ("x-maqqef", "x-sof-pasuq"):
                out += child.text or ""
            elif kind == "x-paseq":
                out += " " + (child.text or "")
        elif tag == "note":
            qere = [w.text or "" for w in child.iter(f"{OSIS}w")]
            if qere:
                out += " [" + " ".join(qere) + "]"
    return out.replace("/", "").strip()


def app_word_ids(osis: str, verses: list[Verse], app_dir: Path | None) -> dict[str, str]:
    """OSHB id -> the app's word id, by aligning the book's surfaces in order.

    The app's chapter files are an older OSHB snapshot in English versification with no ids,
    so position is the only link. Most books line up word for word; a few differ by a handful
    of words, and the alignment leaves those unmatched rather than guessing.
    """
    if app_dir is None:
        return {}
    folder = app_dir / BOOKS[osis]
    if not folder.is_dir():
        return {}
    app: list[tuple[str, str]] = []
    chapter = 1
    while (folder / f"chapter_{chapter}.json").exists():
        data = json.loads((folder / f"chapter_{chapter}.json").read_text(encoding="utf-8"))
        for v, words in enumerate(data, start=1):
            for i, word in enumerate(words):
                app.append((word[0], f"{BOOKS[osis]}-{chapter}-{v}-{i}"))
        chapter += 1
    oshb = [w for verse in verses for w in verse.words]
    matcher = difflib.SequenceMatcher(
        None, [w.text for w in oshb], [s for s, _ in app], autojunk=False
    )
    found = {}
    for block in matcher.get_matching_blocks():
        for k in range(block.size):
            found[oshb[block.a + k].id] = app[block.b + k][1]
    return found


def load_corrections(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else []


def check_corrections(corrections: list[dict], words: dict[str, Word]) -> list[str]:
    warnings = []
    for c in corrections:
        word = words.get(c["id"])
        if word is None:
            warnings.append(f"correction {c['id']} ({c['ref']}): id not found upstream")
        elif word.morph != c["oshb_morph"]:
            warnings.append(
                f"correction {c['id']} ({c['ref']}): upstream tag is {word.morph}, "
                f"not {c['oshb_morph']}; upstream may have fixed it"
            )
    return warnings


def audit(wlc: Path, corrections_path: Path, app_dir: Path | None, books=None):
    """Return (rows, counts by book, correction warnings, Sp2fs words scanned)."""
    corrections = load_corrections(corrections_path)
    corrected = {c["id"] for c in corrections}
    rows, counts, scanned, all_words = [], Counter(), 0, {}
    for osis in books or BOOKS:
        path = wlc / f"{osis}.xml"
        if not path.exists():
            continue
        verses = read_book(path)
        ids = app_word_ids(osis, verses, app_dir)
        for verse in verses:
            for word in verse.words:
                all_words[word.id] = word
                if "Sp2fs" not in word.morph:
                    continue
                scanned += 1
                if not is_candidate(word.text, word.morph):
                    continue
                counts[osis] += 1
                rows.append({
                    "ref": word.ref,
                    "id": word.id,
                    "word": word.text,
                    "morph": word.morph,
                    "accent": accents(word.text, word.verse_final),
                    "full_verse_hebrew": verse.hebrew,
                    "already_corrected": "yes" if word.id in corrected else "no",
                    "app_word_id": ids.get(word.id, ""),
                })
    warnings = check_corrections(corrections, all_words) if books is None else []
    return rows, counts, warnings, scanned


def source_label(wlc: Path) -> str:
    try:
        sha = subprocess.run(
            ["git", "-C", str(wlc), "rev-parse", "HEAD"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
        return f"openscriptures/morphhb@{sha}"
    except (OSError, subprocess.CalledProcessError):
        return str(wlc)


def write_csv(rows: list[dict], out: Path, source: str) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8", newline="") as f:
        for line in HEADER_NOTE + [f"Source: {source}"]:
            f.write(f"# {line}\n")
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("wlc", type=Path, help="morphhb's wlc/ directory (one OSIS XML per book)")
    parser.add_argument("--corrections", type=Path, default=REPO / "data" / "oshb-corrections.json")
    parser.add_argument("--app-data", type=Path, default=REPO / "public" / "hebrew-data" / "bible-books")
    parser.add_argument("--out", type=Path, default=REPO / "data" / "audit-pausal-2fs.csv")
    args = parser.parse_args(argv)

    if not (args.wlc / "Gen.xml").exists():
        parser.error(f"{args.wlc} has no Gen.xml; pass morphhb's wlc/ directory")
    app_dir = args.app_data if args.app_data.is_dir() else None
    rows, counts, warnings, scanned = audit(args.wlc, args.corrections, app_dir)
    write_csv(rows, args.out, source_label(args.wlc))

    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)
    corrected = sum(r["already_corrected"] == "yes" for r in rows)
    print(f"{scanned} words tagged Sp2fs; {len(rows)} spelled like a pausal 2ms suffix.")
    print(f"{corrected} already corrected, {len(rows) - corrected} left to review.\n")
    for osis in BOOKS:
        if counts[osis]:
            done = sum(r["already_corrected"] == "yes" and r["ref"].startswith(f"{osis}.") for r in rows)
            print(f"  {osis:<6}{counts[osis]:>5}" + (f"  ({done} corrected)" if done else ""))
    print(f"\nWrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
