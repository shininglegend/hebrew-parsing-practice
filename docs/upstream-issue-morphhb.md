<!-- Draft for https://github.com/openscriptures/morphhb/issues/new. Not filed. -->

# Pausal 2ms suffix ‑ָךְ systematically tagged as 2fs (Sp2fs)

## Summary

In pause, the second person masculine singular suffix ‑ְךָ often becomes ‑ָךְ (qamats under the preceding letter, final kaf with sheva). That spelling is the same as the 2fs suffix. OSHB appears to tag the spelling instead of the form. These words get `Sp2fs` even when the addressee is clearly male.

## Confirmed examples (Joshua)

All six should be `HR/Sp2ms`. Checked against morphhb `3d15126fb1ef74867fc1434be1942e837932691f`.

| Ref | id | Word | Current | Accent | Addressee |
| --- | --- | --- | --- | --- | --- |
| Josh 1:5 | `06n5f` | עִמָּ֔/ךְ | `HR/Sp2fs` | zaqef qatan | Joshua: "as I was with Moses, I will be with you" |
| Josh 1:17 | `06JZq` | עִמָּ֔/ךְ | `HR/Sp2fs` | zaqef qatan | Joshua: "may the LORD your God be with you" |
| Josh 3:7 | `06965` | עִמָּֽ/ךְ | `HR/Sp2fs` | silluq | Joshua: "as I was with Moses, I will be with you" |
| Josh 7:10 | `06gSo` | לָ֑/ךְ | `HR/Sp2fs` | atnach | Joshua: קֻם לָךְ, "get up" |
| Josh 17:17 | `06jkK` | לָ֔/ךְ | `HR/Sp2fs` | zaqef qatan | The house of Joseph |
| Josh 17:18 | `06L1P` | לָּ/ךְ֙ | `HR/Sp2fs` | pashta | The house of Joseph |

Correct 2fs tags with the same spelling, for contrast: Josh 2:14 עִמָּ֖ךְ (`0683E`), 2:19 אִתָּךְ֙ (`06AXU`), and 15:18 לָּֽךְ (`06BHc`). The first two are said to Rahab and the last to Achsah. Those should stay `Sp2fs`.

## Why

The 2ms suffix on a preposition or noun is normally ‑ְךָ (עִמְּךָ, לְךָ). At a major pause (silluq, atnach, and often zaqef), the vowels shift and the form becomes ‑ָךְ (עִמָּךְ, לָךְ). The consonants and the final vowel then match the 2fs. Only the addressee tells them apart. Josh 1:5 and 3:7 repeat the same promise to Joshua, and both have the pausal spelling.

## Scope beyond Joshua

An audit script flagged every `<w>` whose morph contains `Sp2fs` and whose text ends in qamats + final kaf + sheva, ignoring accents and meteg. Across the corpus it found **682** such words out of 1,762 tagged `Sp2fs`. That is **676** beyond the six above. By accent: 206 silluq, 157 atnach, 148 zaqef qatan, 40 pashta, 7 segolta, and 124 with none of those.

Many of the 676 are correct 2fs, said to a woman, Zion, Jerusalem, or a city, so this is a review list, not a list of errors. Spot checks in Genesis turned up several male addressees right away:

| Ref | id | Word | Addressee |
| --- | --- | --- | --- |
| Gen 3:18 | `01YJk` | לָ֑/ךְ | Adam |
| Gen 4:6 | `01MnD` | לָ֔/ךְ | Cain |
| Gen 4:12 | `01fZr` | לָ֑/ךְ | Cain |
| Gen 6:18 | `014Zw` | אִתָּ֑/ךְ | Noah |

Gen 3:16 בָּֽךְ (`01YU5`, to Eve) is a correct 2fs from the same list.

The full candidate list (ref, id, word, morph, accent, verse), and the script that produces it, can be shared on request.

## Suggested fix

Review each candidate's addressee and retag the masculine ones `Sp2ms`. A rule that tags by spelling alone will repeat the error. Pause makes the 2ms and 2fs identical, so the tag has to come from context.
