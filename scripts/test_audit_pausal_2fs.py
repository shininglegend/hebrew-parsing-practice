"""Tests for audit_pausal_2fs.py. Run: python3 -m unittest discover -s scripts

The fixture is Joshua 2:3, 2:14, and 3:7 copied from OSHB (CC BY 4.0). Set OSHB_WLC to a
morphhb wlc/ directory to also run the audit over the whole corpus.
"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import audit_pausal_2fs as audit_mod  # noqa: E402

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
FIXTURE = HERE / "fixtures" / "wlc"
CORRECTIONS = REPO / "data" / "oshb-corrections.json"
APP_DATA = REPO / "public" / "hebrew-data" / "bible-books"


def by_ref(rows):
    return {row["ref"]: row for row in rows}


class NormalizeTest(unittest.TestCase):
    def test_strips_dividers_cantillation_and_meteg(self):
        self.assertEqual(audit_mod.normalize("עִמָּֽ/ךְ"), "עִמָּךְ")
        self.assertEqual(audit_mod.normalize("לָּ/ךְ֙"), "לָּךְ")

    def test_flags_qamats_kaf_sheva_only(self):
        self.assertTrue(audit_mod.is_candidate("עִמָּֽ/ךְ", "HR/Sp2fs"))
        self.assertTrue(audit_mod.is_candidate("לָ֑/ךְ", "HR/Sp2fs"))
        # A dagesh after the qamats (NFD order) is accepted too
        self.assertTrue(audit_mod.is_candidate("לָּ/ךְ", "HR/Sp2fs"))
        # Ordinary 2fs spelling, and a 2ms tag, are not candidates
        self.assertFalse(audit_mod.is_candidate("אֵלַ֨יִ/ךְ֙", "HR/Sp2fs"))
        self.assertFalse(audit_mod.is_candidate("עִמָּֽ/ךְ", "HR/Sp2ms"))

    def test_names_accents(self):
        self.assertEqual(audit_mod.accents("עִמָּֽ/ךְ", verse_final=True), "silluq")
        self.assertEqual(audit_mod.accents("עִמָּֽ/ךְ", verse_final=False), "")
        self.assertEqual(audit_mod.accents("לָ֑/ךְ", verse_final=False), "atnach")
        self.assertEqual(audit_mod.accents("עִמָּ֔/ךְ", verse_final=False), "zaqef qatan")
        self.assertEqual(audit_mod.accents("לָּ/ךְ֙", verse_final=False), "pashta")


class FixtureAuditTest(unittest.TestCase):
    def setUp(self):
        self.rows, self.counts, _, self.scanned = audit_mod.audit(
            FIXTURE, CORRECTIONS, APP_DATA, books=["Josh"]
        )
        self.rows = by_ref(self.rows)

    def test_flags_joshua_3_7_and_marks_it_corrected(self):
        row = self.rows["Josh.3.7"]
        self.assertEqual(row["id"], "06965")
        self.assertEqual(row["morph"], "HR/Sp2fs")
        self.assertEqual(row["accent"], "silluq")
        self.assertEqual(row["already_corrected"], "yes")
        self.assertEqual(row["app_word_id"], "joshua-3-7-19")
        self.assertTrue(row["full_verse_hebrew"].endswith(row["word"].replace("/", "") + "\u05c3"))

    def test_flags_rahabs_joshua_2_14_and_leaves_it_uncorrected(self):
        row = self.rows["Josh.2.14"]
        self.assertEqual(row["id"], "0683E")
        self.assertEqual(row["already_corrected"], "no")
        self.assertEqual(row["app_word_id"], "joshua-2-14-19")

    def test_skips_ordinary_2fs_spellings(self):
        # Joshua 2:3 has two Sp2fs words, neither spelled qamats + kaf + sheva
        self.assertNotIn("Josh.2.3", self.rows)
        self.assertEqual(self.scanned, 4)
        self.assertEqual(self.counts["Josh"], 2)

    def test_writes_the_header_note_then_the_columns(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "audit.csv"
            audit_mod.write_csv(list(self.rows.values()), out, "fixture")
            lines = out.read_text(encoding="utf-8").splitlines()
        notes = [line for line in lines if line.startswith("# ")]
        self.assertTrue(any("addressee is masculine" in line for line in notes))
        self.assertEqual(lines[len(notes)], ",".join(audit_mod.COLUMNS))


class CorrectionCheckTest(unittest.TestCase):
    def test_warns_when_upstream_tag_changed_or_id_vanished(self):
        words = {"06965": audit_mod.Word("Josh.3.7", "06965", "עִמָּֽ/ךְ", "HR/Sp2ms")}
        corrections = [
            {"id": "06965", "ref": "Josh.3.7", "oshb_morph": "HR/Sp2fs"},
            {"id": "zzzzz", "ref": "Josh.1.1", "oshb_morph": "HR/Sp2fs"},
        ]
        warnings = audit_mod.check_corrections(corrections, words)
        self.assertEqual(len(warnings), 2)
        self.assertIn("upstream may have fixed it", warnings[0])
        self.assertIn("not found", warnings[1])


@unittest.skipUnless(os.environ.get("OSHB_WLC"), "set OSHB_WLC to a morphhb wlc/ directory")
class CorpusAuditTest(unittest.TestCase):
    def test_full_corpus(self):
        rows, _, warnings, _ = audit_mod.audit(Path(os.environ["OSHB_WLC"]), CORRECTIONS, APP_DATA)
        rows = by_ref(rows)
        self.assertEqual(warnings, [])
        self.assertEqual(rows["Josh.3.7"]["already_corrected"], "yes")
        self.assertEqual(rows["Josh.2.14"]["already_corrected"], "no")
        corrected = {r["id"] for r in rows.values() if r["already_corrected"] == "yes"}
        self.assertEqual(corrected, {"06n5f", "06JZq", "06965", "06gSo", "06jkK", "06L1P"})


if __name__ == "__main__":
    unittest.main()
