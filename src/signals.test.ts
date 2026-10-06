import { describe, expect, it } from "vitest";
import { buildChecklist } from "./checklist";
import {
  explainCorrect,
  explainMiss,
  fieldsToExplain,
  findCue,
  foldHebrew,
  grammarFor,
  plainSurface,
} from "./signals";
import type { Word } from "./types";

describe("foldHebrew", () => {
  it("strips points, accents, dividers, and final forms", () => {
    expect(foldHebrew("בְּ/רֵאשִׁ֖ית")).toBe("בראשית");
    expect(foldHebrew("הַ/שָּׁמַ֖יִם")).toBe("השמימ");
    expect(foldHebrew("מֶּ֖לֶךְ")).toBe("מלכ");
  });

  it("keeps the points but drops the dividers for display", () => {
    expect(plainSurface("בְּ/רֵאשִׁ֖ית")).toBe("בְּרֵאשִׁ֖ית");
  });
});

// Genesis 1:1–4 and Daniel 2:4, as the data gives them
const verse: Word[] = [
  {
    id: "1",
    surface: "וַ/יֹּ֥אמֶר",
    lemma: "H559",
    parse: {
      prefix: ["ו (and)"],
      pos: "verb",
      stem: "qal",
      tense: "sequential imperfect",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
  },
  {
    id: "2",
    surface: "אֱלֹהִ֑ים",
    lemma: "H430",
    parse: { pos: "noun (common)", gender: "masculine", number: "plural", state: "absolute" },
  },
  {
    id: "3",
    surface: "פְּנֵ֣י",
    lemma: "H6440",
    parse: { pos: "noun (common)", gender: "common", number: "plural", state: "construct" },
  },
  {
    id: "4",
    surface: "תְה֑וֹם",
    lemma: "H8415",
    parse: { pos: "noun (common)", gender: "common", number: "singular", state: "absolute" },
  },
  {
    id: "5",
    surface: "לַ/מֶּ֖לֶךְ",
    lemma: "H4428",
    parse: {
      prefix: ["ל (to/for)", "ה (the)"],
      pos: "noun (common)",
      gender: "masculine",
      number: "singular",
      state: "absolute",
    },
  },
  {
    id: "6",
    surface: "מְרַחֶ֖פֶת",
    lemma: "H7363",
    parse: {
      pos: "verb",
      stem: "piel",
      tense: "participle active",
      gender: "feminine",
      number: "singular",
      state: "absolute",
    },
  },
  {
    id: "7",
    surface: "לְ/עַבְדָ֖/ךְ",
    lemma: "H5649",
    parse: {
      prefix: ["ל (to/for)"],
      pos: "noun (common)",
      gender: "masculine",
      number: "singular",
      state: "construct",
      suffix: "pronominal suffix",
      suffixPerson: "second",
      suffixGender: "masculine",
      suffixNumber: "singular",
    },
  },
  {
    id: "8",
    surface: "הָיְתָ֥ה",
    lemma: "H1961",
    parse: {
      pos: "verb",
      stem: "qal",
      tense: "perfect (qatal)",
      person: "third",
      gender: "feminine",
      number: "singular",
    },
  },
  {
    id: "9",
    surface: "וַ/יַּבְדֵּ֣ל",
    lemma: "H914",
    parse: {
      prefix: ["ו (and)"],
      pos: "verb",
      stem: "hiphil",
      tense: "sequential imperfect",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
  },
  {
    id: "10",
    surface: "הַ/שָּׁמַ֖יִם",
    lemma: "H8064",
    parse: {
      prefix: ["ה (the)"],
      pos: "noun (common)",
      gender: "masculine",
      number: "dual",
      state: "absolute",
    },
  },
  {
    id: "11",
    surface: "הֲ/שֹׁמֵ֥ר",
    lemma: "H8104",
    parse: {
      prefix: ["interrogative ה"],
      pos: "verb",
      stem: "qal",
      tense: "participle active",
      gender: "masculine",
      number: "singular",
      state: "absolute",
    },
  },
];

const byId = (id: string) => verse.find((word) => word.id === id) as Word;

describe("findCue", () => {
  it("marks וַ for a wayyiqtol", () => {
    const cue = findCue(verse, byId("1"), "tense");
    expect(cue?.display).toBe("וַ");
    expect(cue?.note).toContain("wayyiqtol");
  });

  it("points a construct at the next word", () => {
    const cue = findCue(verse, byId("3"), "state");
    expect(cue?.display).toBe("תְה֑וֹם");
    expect(cue?.wordId).toBe("4");
  });

  it("sees the article swallowed by a preposition", () => {
    const cue = findCue(verse, byId("5"), "prefix");
    expect(cue?.display).toBe("לַ");
    expect(cue?.note).toContain("הַ");
  });

  it("sees the article on its own", () => {
    expect(findCue(verse, byId("10"), "prefix")?.display).toBe("הַ");
    expect(findCue(verse, byId("10"), "state")).toBeUndefined();
  });

  it("tells the interrogative ה from the article", () => {
    expect(findCue(verse, byId("11"), "prefix")?.display).toBe("הֲ");
  });

  it("reads the piel participle from its מְ", () => {
    expect(findCue(verse, byId("6"), "tense")?.display).toBe("מְ");
    expect(findCue(verse, byId("6"), "stem")?.display).toBe("מְ");
  });

  it("reads a pronominal suffix from its spelling", () => {
    const cue = findCue(verse, byId("7"), "suffixPerson");
    expect(cue?.display).toBe("ךְ");
    expect(cue?.note).toContain("second");
  });

  it("marks the dual ending", () => {
    expect(findCue(verse, byId("10"), "number")?.display).toBe("ַיִם");
  });

  it("finds the hiphil pattern in a shortened wayyiqtol", () => {
    expect(findCue(verse, byId("9"), "stem")?.display).toBe("יַ");
  });

  it("finds the hiphil prefix and hireq-yod", () => {
    const perfect: Word = {
      id: "h",
      surface: "הִבְדִּ֣יל",
      parse: { pos: "verb", stem: "hiphil", tense: "perfect (qatal)", person: "third" },
    };
    expect(findCue([perfect], perfect, "stem")?.display).toBe("הִ");
    const imperfect: Word = {
      id: "i",
      surface: "יַבְדִּ֣יל",
      parse: { pos: "verb", stem: "hiphil", tense: "imperfect (yiqtol)", person: "third" },
    };
    expect(findCue([imperfect], imperfect, "stem")?.display).toBe("ִי");
  });

  it("returns nothing for a word without a parse", () => {
    expect(findCue(verse, { surface: "x" }, "tense")).toBeUndefined();
  });
});

describe("explainMiss", () => {
  it("explains an imperfect guessed for a wayyiqtol", () => {
    const word = byId("1");
    const note = explainMiss({
      surface: word.surface,
      lemma: word.lemma,
      wordId: word.id,
      field: "tense",
      guess: "imperfect (yiqtol)",
      gold: "sequential imperfect",
      parse: word.parse,
      verseWords: verse,
    });
    expect(note.title).toBe("Tense/Aspect: sequential imperfect");
    expect(note.cue).toBe("וַ");
    expect(note.contrast).toContain("imperfect (yiqtol)");
    expect(note.evidence[0]).toContain("wayyiqtol");
    expect(note.evidence.some((line) => line.includes("Both are prefix conjugations"))).toBe(true);
    expect(note.english).toContain("and then");
    expect(note.grammar?.term).toBe("Wayyiqtol (Sequential Imperfect)");
    expect(note.chartKey).toBeUndefined();
  });

  it("explains a missed prefix pair in English, one clause per prefix", () => {
    const word = byId("5");
    const note = explainMiss({
      surface: word.surface,
      lemma: word.lemma,
      wordId: word.id,
      field: "prefix",
      guess: "ל (to/for)",
      gold: "ל (to/for) + ה (the)",
      parse: word.parse,
      verseWords: verse,
    });
    expect(note.cue).toBe("לַ");
    expect(note.english).toContain("“the”");
    expect(note.english).toContain("“to,”");
    expect(
      note.evidence.some((line) => line.includes("The article hides inside a preposition"))
    ).toBe(true);
  });

  it("flags a weak root by its Strong's id", () => {
    const word = byId("8");
    const note = explainMiss({
      surface: word.surface,
      lemma: word.lemma,
      field: "tense",
      guess: "imperfect (yiqtol)",
      gold: "perfect (qatal)",
      parse: word.parse,
      verseWords: verse,
    });
    expect(note.irregular).toBe(true);
    expect(note.evidence.some((line) => line.includes("weak root"))).toBe(true);
  });

  it("explains a participle guessed as a perfect without asking for a person", () => {
    const word = byId("6");
    const note = explainMiss({
      surface: word.surface,
      lemma: word.lemma,
      field: "tense",
      guess: "perfect (qatal)",
      gold: "participle active",
      parse: word.parse,
      verseWords: verse,
    });
    expect(note.cue).toBe("מְ");
    expect(note.evidence.some((line) => line.includes("no person"))).toBe(true);
    expect(note.grammar?.term).toBe("Participle");
  });

  it("falls back to a paradigm comparison when nothing else applies", () => {
    const note = explainMiss({
      surface: "אֱלֹהִ֑ים",
      lemma: "H430",
      field: "gender",
      guess: "common",
      gold: "masculine",
      parse: byId("2").parse,
      verseWords: verse,
    });
    expect(note.evidence).toEqual([
      "Compare this form with the masculine paradigm, not the common one.",
    ]);
  });
});

describe("explainCorrect", () => {
  it("keeps the cue and drops the contrast", () => {
    const word = byId("3");
    const note = explainCorrect({
      surface: word.surface,
      lemma: word.lemma,
      wordId: word.id,
      field: "state",
      gold: "construct",
      parse: word.parse,
      verseWords: verse,
    });
    expect(note.contrast).toBe("This form is construct.");
    expect(note.cue).toBe("תְה֑וֹם");
    expect(note.english).toContain("of תְה֑וֹם");
  });
});

describe("grammarFor", () => {
  it("maps gold values onto the grammar guide's terms", () => {
    expect(grammarFor("pos", "noun (common)")?.term).toBe("Noun");
    expect(grammarFor("stem", "other (rare)")?.term).toBe("Other Rare Stems");
    expect(grammarFor("stem", "peal")?.term).toBe("Qal");
    expect(grammarFor("prefix", "ה (the)")?.term).toBe("Definite Article ה");
    expect(grammarFor("suffix", "directional he")?.term).toBe("Directional ה (He Locale)");
    expect(grammarFor("suffixPerson", "third")?.term).toBe("Third Person");
    expect(grammarFor("tense", "jussive")?.term).toBe("Cohortative and Jussive");
    expect(grammarFor("state", "determined")?.term).toBe("Determined / Definite");
  });
});

describe("buildChecklist", () => {
  it("turns prefixes, state, and a wayyiqtol into English jobs", () => {
    const lines = buildChecklist([byId("1"), byId("3"), byId("4")]).map((line) => line.text);
    expect(lines).toContain("וַיֹּ֥אמֶר, ו (and): “and,” “but,” or “then” — the clause joiner");
    expect(lines.some((line) => line.startsWith("וַיֹּ֥אמֶר, sequential imperfect:"))).toBe(true);
    expect(lines).toContain(
      "פְּנֵ֣י, construct: “… of תְה֑וֹם” — bound to the next word, which decides whether the pair is definite"
    );
    expect(lines.some((line) => line.includes("article"))).toBe(false);
  });

  it("writes one line for a prefix pair", () => {
    const lines = buildChecklist([byId("5")]).map((line) => line.text);
    const prefixLine = lines.find((line) => line.includes("ל (to/for) + ה (the)"));
    expect(prefixLine).toContain("“the”");
    expect(lines.filter((line) => line.includes("(the)")).length).toBe(1);
  });
});

describe("fieldsToExplain", () => {
  it("explains the latest correct field until all are right", () => {
    const visible = ["pos", "stem", "tense"];
    expect(fieldsToExplain(visible, (field) => field === "pos")).toEqual(["pos"]);
    expect(fieldsToExplain(visible, (field) => field !== "tense")).toEqual(["stem"]);
    expect(fieldsToExplain(visible, () => true)).toEqual(visible);
    expect(fieldsToExplain(visible, () => false)).toEqual([]);
  });
});
