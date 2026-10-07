import { describe, expect, it } from "vitest";
import { parseTbesh, plainId } from "../scripts/build-glosses.mjs";
import { briefGloss, toLexiconEntry } from "./lexicon";

const elohim = {
  lemma: "אֱלֹהִים",
  strongs_def:
    "gods in the ordinary sense; but specifically used (in the plural thus, especially with the article) of the supreme God",
  kjv_def:
    "angels, [idiom] exceeding, God (gods) (-dess, -ly), [idiom] (very) great, judges, [idiom] mighty.",
};

describe("toLexiconEntry", () => {
  it("uses the TBESH gloss as the brief definition", () => {
    const entry = toLexiconEntry("H430", elohim, "God");
    expect(entry.definitions.find((d) => d.role === "brief")?.text).toBe("God");
    expect(entry.definitions.find((d) => d.role === "full")?.text).toContain("KJV: angels");
  });

  it("falls back to Strong's definition, not the alphabetical KJV list", () => {
    const entry = toLexiconEntry("H430", elohim, undefined);
    expect(entry.definitions.find((d) => d.role === "brief")?.text).toBe(
      "gods in the ordinary sense"
    );
  });

  it("stands on the gloss alone when Strong's lacks the number", () => {
    const entry = toLexiconEntry("H9999", undefined, "something");
    expect(entry.orth).toBe("H9999");
    expect(entry.definitions).toEqual([{ role: "brief", text: "something" }]);
  });
});

describe("briefGloss", () => {
  it("strips the idiom marker from a KJV-only entry", () => {
    expect(briefGloss({ kjv_def: "[idiom] common, country, earth" })).toBe("common");
  });
});

describe("parseTbesh", () => {
  const row = (eStrong: string, dStrong: string, gloss: string) =>
    [eStrong, dStrong, "", "", "", "", gloss, "meaning"].join("\t");

  it("maps zero-padded eStrongs to OSHB ids", () => {
    expect(plainId("H0430")).toBe("H430");
    expect(plainId("H7652a")).toBe("H7652a");
    expect(plainId("H9001")).toBe("H9001");
  });

  it("prefers the G row (the common word) over names sharing the number", () => {
    const text = [
      "header line",
      row("H0430", "H0430H = a Part of", "(LORD)-Elohe"),
      row("H0430", "H0430G = a Name of", "God"),
      row("H0430", "H0430I = a Part of", "(Gibeath)-elohim"),
    ].join("\n");
    expect(parseTbesh(text)).toEqual({ H430: "God" });
  });

  it("lets the first BDB split stand in for a number OSHB does not split", () => {
    const text = [row("H7652a", "H7652A =", "Sheba"), row("H7652b", "H7652B =", "seven")].join(
      "\n"
    );
    expect(parseTbesh(text)).toEqual({ H7652: "Sheba", H7652a: "Sheba", H7652b: "seven" });
  });

  it("keeps an unsuffixed row when there is no G row", () => {
    const text = [row("H1961", "H1961 =", "to be")].join("\n");
    expect(parseTbesh(text)).toEqual({ H1961: "to be" });
  });
});
