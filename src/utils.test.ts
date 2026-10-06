import { describe, expect, it } from "vitest";
import {
  bookEntry,
  FIELD_KEYS,
  formatRef,
  goldValue,
  isFieldRelevant,
  joinPrefixes,
  scoreParse,
  splitPrefixes,
} from "./utils";

describe("prefix strings", () => {
  it("joins in FIELD_SPECS order and drops repeats", () => {
    expect(joinPrefixes(["ה (the)", "ו (and)", "ה (the)"])).toBe("ו (and) + ה (the)");
    expect(joinPrefixes([])).toBeUndefined();
    expect(joinPrefixes(["—"])).toBeUndefined();
  });

  it("splits back to the list", () => {
    expect(splitPrefixes("ו (and) + ה (the)")).toEqual(["ו (and)", "ה (the)"]);
    expect(splitPrefixes(undefined)).toEqual([]);
  });

  it("reads gold as a joined string", () => {
    expect(goldValue({ prefix: ["ה (the)", "ב (in/with)"] }, "prefix")).toBe(
      "ב (in/with) + ה (the)"
    );
    expect(goldValue({ pos: "verb" }, "pos")).toBe("verb");
    expect(goldValue({ pos: "verb" }, "prefix")).toBeUndefined();
  });
});

describe("scoreParse", () => {
  it("grades prefixes as a set", () => {
    const gold = { pos: "noun (common)", prefix: ["ו (and)", "ה (the)"] };
    const right = scoreParse(gold, { pos: "noun (common)", prefix: "ה (the) + ו (and)" });
    expect(right.correct).toBe(2);
    const partial = scoreParse(gold, { pos: "noun (common)", prefix: "ה (the)" });
    expect(partial.correct).toBe(1);
    expect(partial.details.find((d) => d.key === "prefix")?.gold).toBe("ו (and) + ה (the)");
  });

  it("ignores fields the gold does not have", () => {
    expect(scoreParse({ pos: "adverb" }, { pos: "adverb", gender: "masculine" }).total).toBe(1);
  });
});

describe("books", () => {
  it("resolves any spelling", () => {
    expect(bookEntry("1 Samuel")?.filename).toBe("isamuel");
    expect(bookEntry("1sam")?.name).toBe("1 Samuel");
    expect(bookEntry("ISAMUEL")?.name).toBe("1 Samuel");
    expect(bookEntry("Nowhere")).toBeUndefined();
  });

  it("forces Obadiah to chapter 1 and prints the display name", () => {
    expect(formatRef("obadiah", "3", "1")).toBe("Obadiah 1:1");
    expect(formatRef("Obad", "3", "2")).toBe("Obadiah 1:2");
    expect(formatRef("Gen", "1", "1")).toBe("Genesis 1:1");
  });
});

describe("isFieldRelevant", () => {
  it("shows prefix and suffix fields only when the gold has them", () => {
    expect(isFieldRelevant("verb", "prefix", { prefix: ["ו (and)"] })).toBe(true);
    expect(isFieldRelevant("verb", "prefix", {})).toBe(false);
    expect(isFieldRelevant("noun (common)", "suffixPerson", { suffix: "pronominal suffix" })).toBe(
      true
    );
    expect(isFieldRelevant("noun (common)", "suffixPerson", { suffix: "directional he" })).toBe(
      false
    );
  });

  it("gives participles state and no person", () => {
    const participle = { pos: "verb", tense: "participle active" };
    expect(isFieldRelevant("verb", "state", participle)).toBe(true);
    expect(isFieldRelevant("verb", "person", participle)).toBe(false);
    const finite = { pos: "verb", tense: "perfect (qatal)" };
    expect(isFieldRelevant("verb", "state", finite)).toBe(false);
    expect(isFieldRelevant("verb", "person", finite)).toBe(true);
  });
});

describe("FIELD_KEYS", () => {
  it("matches the Worker's allowlist in worker/index.ts", () => {
    expect(FIELD_KEYS).toEqual([
      "pos",
      "prefix",
      "state",
      "gender",
      "number",
      "person",
      "stem",
      "tense",
      "suffix",
      "suffixPerson",
      "suffixGender",
      "suffixNumber",
    ]);
  });
});
