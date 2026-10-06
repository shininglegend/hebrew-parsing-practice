import { describe, expect, it } from "vitest";
import { type Attempt, groupWeakSpots, priorMisses, weakSpotsFrom } from "./attempts";

const miss = (field: string, gold: string, verseRef: string, createdAt: string): Attempt => ({
  verseRef,
  wordId: "w",
  field,
  guess: "wrong",
  gold,
  createdAt,
});

describe("priorMisses", () => {
  it("counts earlier misses of the same gold value and cue", () => {
    const list: Attempt[] = [
      miss("state", "construct", "Genesis 1:1", "2026-01-01"),
      { ...miss("state", "construct", "Genesis 1:2", "2026-01-02"), guess: "construct" },
      { ...miss("state", "construct", "Genesis 1:3", "2026-01-03"), cue: "הַ" },
    ];
    expect(
      priorMisses(list, {
        verseRef: "Genesis 1:4",
        wordId: "w",
        field: "state",
        guess: "x",
        gold: "construct",
      })
    ).toBe(1);
    expect(
      priorMisses(list, {
        verseRef: "Genesis 1:4",
        wordId: "w",
        field: "state",
        guess: "x",
        gold: "construct",
        cue: "הַ",
      })
    ).toBe(1);
  });
});

describe("weakSpotsFrom", () => {
  it("groups by field and gold, most missed first, with the latest verse", () => {
    const list: Attempt[] = [
      miss("state", "construct", "Genesis 1:1", "2026-01-01"),
      miss("state", "construct", "Genesis 1:5", "2026-01-05"),
      { ...miss("state", "construct", "Genesis 1:6", "2026-01-06"), guess: "construct" },
      miss("tense", "sequential imperfect", "Genesis 3:16", "2026-01-02"),
      { ...miss("stem", "qal", "Genesis 1:1", "2026-01-01"), guess: "qal" },
    ];
    const blank = {
      surface: null,
      lemma: null,
      cue: null,
      guesses: [{ guess: "wrong", count: 1 }],
    };
    expect(weakSpotsFrom(list)).toEqual([
      {
        field: "state",
        gold: "construct",
        misses: 2,
        total: 3,
        recent: [
          { verseRef: "Genesis 1:5", ...blank },
          { verseRef: "Genesis 1:1", ...blank },
        ],
      },
      {
        field: "tense",
        gold: "sequential imperfect",
        misses: 1,
        total: 1,
        recent: [{ verseRef: "Genesis 3:16", ...blank }],
      },
    ]);
  });

  it("keeps the word, the wrong guess, and the cue, newest first", () => {
    const list: Attempt[] = [
      {
        ...miss("stem", "hiphil", "Genesis 1:4", "2026-01-01"),
        wordId: "a",
        surface: "וַ/יַּבְדֵּ֣ל",
        lemma: "H914",
        guess: "piel",
      },
      {
        ...miss("stem", "hiphil", "Genesis 1:4", "2026-01-02"),
        wordId: "b",
        surface: "הָ/אֽוֹר",
        lemma: "H216",
        guess: "qal",
      },
      {
        ...miss("stem", "hiphil", "Genesis 1:4", "2026-01-03"),
        wordId: "a",
        surface: "וַ/יַּבְדֵּ֣ל",
        lemma: "H914",
        guess: "piel",
      },
      {
        ...miss("tense", "sequential imperfect", "Genesis 1:3", "2026-01-04"),
        surface: "וַ/יֹּ֥אמֶר",
        lemma: "H559",
        guess: "imperfect (yiqtol)",
        cue: "וַ",
      },
    ];
    expect(weakSpotsFrom(list)).toEqual([
      {
        field: "stem",
        gold: "hiphil",
        misses: 3,
        total: 3,
        recent: [
          {
            verseRef: "Genesis 1:4",
            surface: "וַ/יַּבְדֵּ֣ל",
            lemma: "H914",
            cue: null,
            guesses: [{ guess: "piel", count: 2 }],
          },
          {
            verseRef: "Genesis 1:4",
            surface: "הָ/אֽוֹר",
            lemma: "H216",
            cue: null,
            guesses: [{ guess: "qal", count: 1 }],
          },
        ],
      },
      {
        field: "tense",
        gold: "sequential imperfect",
        misses: 1,
        total: 1,
        recent: [
          {
            verseRef: "Genesis 1:3",
            surface: "וַ/יֹּ֥אמֶר",
            lemma: "H559",
            cue: "וַ",
            guesses: [{ guess: "imperfect (yiqtol)", count: 1 }],
          },
        ],
      },
    ]);
  });

  it("lists every wrong guess for one word, most frequent first", () => {
    const list: Attempt[] = [
      {
        ...miss("stem", "hiphil", "Genesis 1:4", "2026-01-01"),
        wordId: "a",
        surface: "וַ/יַּבְדֵּ֣ל",
        guess: "piel",
      },
      {
        ...miss("stem", "hiphil", "Genesis 1:4", "2026-01-02"),
        wordId: "a",
        surface: "וַ/יַּבְדֵּ֣ל",
        guess: "qal",
      },
      {
        ...miss("stem", "hiphil", "Genesis 1:4", "2026-01-03"),
        wordId: "a",
        surface: "וַ/יַּבְדֵּ֣ל",
        guess: "piel",
      },
      {
        ...miss("stem", "hiphil", "Genesis 1:4", "2026-01-04"),
        wordId: "a",
        surface: "וַ/יַּבְדֵּ֣ל",
        guess: "piel",
      },
    ];
    expect(weakSpotsFrom(list)[0]?.recent).toEqual([
      {
        verseRef: "Genesis 1:4",
        surface: "וַ/יַּבְדֵּ֣ל",
        lemma: null,
        cue: null,
        guesses: [
          { guess: "piel", count: 3 },
          { guess: "qal", count: 1 },
        ],
      },
    ]);
  });

  it("keeps five distinct verses, newest miss first", () => {
    const list: Attempt[] = [
      miss("state", "construct", "v1", "2026-01-01"),
      miss("state", "construct", "v2", "2026-01-02"),
      miss("state", "construct", "v3", "2026-01-03"),
      miss("state", "construct", "v4", "2026-01-04"),
      miss("state", "construct", "v5", "2026-01-05"),
      miss("state", "construct", "v6", "2026-01-06"),
      miss("state", "construct", "v7", "2026-01-07"),
      miss("state", "construct", "v1", "2026-01-08"),
    ];
    expect(weakSpotsFrom(list)[0]?.recent.map((item) => item.verseRef)).toEqual([
      "v1",
      "v7",
      "v6",
      "v5",
      "v4",
    ]);
  });
});

describe("groupWeakSpots", () => {
  it("follows field order and sorts each field by miss rate", () => {
    const groups = groupWeakSpots([
      { field: "state", gold: "construct", misses: 6, total: 12, recent: [] },
      { field: "state", gold: "absolute", misses: 10, total: 18, recent: [] },
      { field: "number", gold: "plural", misses: 7, total: 19, recent: [] },
      { field: "pos", gold: "adverb", misses: 1, total: 2, recent: [] },
      { field: "pos", gold: "preposition", misses: 2, total: 4, recent: [] },
      { field: "dialect", gold: "aramaic", misses: 3, total: 3, recent: [] },
    ]);
    expect(groups.map((group) => group.field)).toEqual(["pos", "state", "number", "dialect"]);
    expect(groups[0]?.spots.map((spot) => spot.gold)).toEqual(["preposition", "adverb"]);
    expect(groups[1]?.spots.map((spot) => spot.gold)).toEqual(["absolute", "construct"]);
  });
});
