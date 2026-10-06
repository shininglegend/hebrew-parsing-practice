import { describe, expect, it } from "vitest";
import { decodeHebrewMorphology, decodeWord, parseVerseRef } from "./api";

const word = (surface: string, strongs: string, morph: string) =>
  decodeWord([surface, strongs, morph], "t").parse ?? {};

describe("decodeHebrewMorphology", () => {
  it("reads a finite verb", () => {
    expect(decodeHebrewMorphology("Vqp3ms")).toMatchObject({
      pos: "verb",
      stem: "qal",
      tense: "perfect (qatal)",
      person: "third",
      gender: "masculine",
      number: "singular",
    });
  });

  it("reads a participle as gender, number, state with no person", () => {
    const parse = decodeHebrewMorphology("Vprfsa");
    expect(parse).toMatchObject({
      pos: "verb",
      stem: "piel",
      tense: "participle active",
      gender: "feminine",
      number: "singular",
      state: "absolute",
    });
    expect(parse.person).toBeUndefined();
  });

  it("reads an infinitive with no agreement", () => {
    const parse = decodeHebrewMorphology("Vqc");
    expect(parse).toMatchObject({ pos: "verb", stem: "qal", tense: "infinitive construct" });
    expect(parse.person).toBeUndefined();
    expect(parse.gender).toBeUndefined();
  });

  it("uses the Aramaic stem table after a leading A", () => {
    expect(decodeHebrewMorphology("AVqv2ms")).toMatchObject({
      pos: "verb",
      stem: "peal",
      tense: "imperative",
      person: "second",
      gender: "masculine",
      number: "singular",
    });
    expect(decodeHebrewMorphology("AVpi1cp").stem).toBe("pael");
    expect(decodeHebrewMorphology("ANcmsd")).toMatchObject({
      pos: "noun (common)",
      gender: "masculine",
      number: "singular",
      state: "determined",
    });
  });

  it("maps rare stems to other (rare)", () => {
    expect(decodeHebrewMorphology("Vfp3ms").stem).toBe("other (rare)");
  });

  it("reads nominals, pronouns, and particles", () => {
    expect(decodeHebrewMorphology("Ncbpc")).toMatchObject({
      pos: "noun (common)",
      gender: "common",
      number: "plural",
      state: "construct",
    });
    expect(decodeHebrewMorphology("Ngmpa").pos).toBe("noun (gentilic)");
    expect(decodeHebrewMorphology("Np").pos).toBe("noun (proper)");
    expect(decodeHebrewMorphology("Aamsa").pos).toBe("adjective");
    expect(decodeHebrewMorphology("Acmsa")).toMatchObject({
      pos: "numeral",
      numeralType: "cardinal",
    });
    expect(decodeHebrewMorphology("Pp3mp")).toMatchObject({
      pos: "pronoun",
      person: "third",
      gender: "masculine",
      number: "plural",
    });
    expect(decodeHebrewMorphology("To")).toMatchObject({
      pos: "particle",
      particleType: "direct object marker",
    });
    expect(decodeHebrewMorphology("Sp2ms")).toMatchObject({
      suffix: "pronominal suffix",
      suffixPerson: "second",
      suffixGender: "masculine",
      suffixNumber: "singular",
    });
    expect(decodeHebrewMorphology("Sd").suffix).toBe("directional he");
  });
});

describe("decodeWord", () => {
  it("decodes Genesis 1:1 בראשית with its prefix", () => {
    const parse = word("בְּ/רֵאשִׁ֖ית", "Hb/H7225", "R/Ncfsa");
    expect(parse).toMatchObject({
      prefix: ["ב (in/with)"],
      pos: "noun (common)",
      gender: "feminine",
      number: "singular",
      state: "absolute",
    });
  });

  it("keeps the main Strong's id as the lemma", () => {
    const decoded = decodeWord(["בְּ/רֵאשִׁ֖ית", "Hb/H7225", "R/Ncfsa"], "t");
    expect(decoded.lemma).toBe("H7225");
    expect(decoded.strongs).toBe("Hb/H7225");
  });

  it("keeps two prefixes in a stable order", () => {
    expect(word("וְ/הָ/אָ֗רֶץ", "Hc/Hd/H776", "C/Td/Ncbsa").prefix).toEqual(["ו (and)", "ה (the)"]);
  });

  it("reads Rd as a preposition that swallowed the article", () => {
    expect(word("לַ/מֶּ֖לֶךְ", "Hl/H4428", "Rd/Ncmsa").prefix).toEqual(["ל (to/for)", "ה (the)"]);
    expect(word("בַּ/יָּמִ֖ים", "Hb/H3117", "Rd/Ncmpa").prefix).toEqual(["ב (in/with)", "ה (the)"]);
  });

  it("labels interrogative and relative prefixes by their Strong's marker", () => {
    expect(word("הֲ/שֹׁמֵ֥ר", "Hi/H8104", "Ti/Vqrmsa").prefix).toEqual(["interrogative ה"]);
    expect(word("שֶׁ/אָהֲבָה", "Hs/H157", "Tr/Vqp3fs").prefix).toEqual(["ש (that/which)"]);
  });

  it("treats a preposition with only a suffix as the word, not a prefix", () => {
    const parse = word("לְ/ךָ֛", "Hl", "R/Sp2ms");
    expect(parse.prefix).toBeUndefined();
    expect(parse).toMatchObject({
      pos: "preposition",
      suffix: "pronominal suffix",
      suffixPerson: "second",
      suffixGender: "masculine",
      suffixNumber: "singular",
    });
  });

  it("reads a prefixed noun with a suffix", () => {
    expect(word("מֵ/אַרְצְ/ךָ֥", "Hm/H776", "R/Ncbsc/Sp2ms")).toMatchObject({
      prefix: ["מ (from)"],
      pos: "noun (common)",
      state: "construct",
      suffix: "pronominal suffix",
      suffixPerson: "second",
    });
  });

  it("does not let an Aramaic emphatic ending overwrite the noun", () => {
    const parse = word("מַלְכָּ/א֙", "H4430", "ANcmsd/Td");
    expect(parse.pos).toBe("noun (common)");
    expect(parse.state).toBe("determined");
    expect(parse.particleType).toBeUndefined();
  });

  it("decodes Aramaic words with prefixes and suffixes", () => {
    expect(word("לְ/עַבְדָ֖/ךְ", "Hl/H5649", "AR/Ncmsc/Sp2ms")).toMatchObject({
      prefix: ["ל (to/for)"],
      pos: "noun (common)",
      state: "construct",
      suffixPerson: "second",
      suffixGender: "masculine",
    });
    expect(word("וּ/פִשְׁרָ֥/א", "Hc/H6591", "AC/Ncmsd/Td")).toMatchObject({
      prefix: ["ו (and)"],
      pos: "noun (common)",
      state: "determined",
    });
    expect(word("חֱיִ֔י", "H2418", "AVqv2ms")).toMatchObject({ stem: "peal", tense: "imperative" });
  });

  it("reads a prefixed infinitive construct", () => {
    expect(word("כְּ/שֶׁ֣בֶת", "Hk/H3427", "R/Vqc")).toMatchObject({
      prefix: ["כ (like/as)"],
      pos: "verb",
      tense: "infinitive construct",
    });
  });
});

describe("parseVerseRef", () => {
  it("accepts names, abbreviations, and filenames in any case", () => {
    expect(parseVerseRef("Genesis 1:1")).toEqual({
      filename: "genesis",
      name: "Genesis",
      chapter: 1,
      verse: 1,
    });
    expect(parseVerseRef("Gen 1.1")?.filename).toBe("genesis");
    expect(parseVerseRef("1 Samuel 3:4")?.filename).toBe("isamuel");
    expect(parseVerseRef("1Sam 3:4")?.name).toBe("1 Samuel");
    expect(parseVerseRef("songofsolomon 2:1")?.name).toBe("Song of Solomon");
    expect(parseVerseRef("Song of Songs 2:1")?.name).toBe("Song of Solomon");
    expect(parseVerseRef("obadiah 1:1")?.name).toBe("Obadiah");
  });

  it("rejects unknown books and malformed refs", () => {
    expect(parseVerseRef("John 1:1")).toBeNull();
    expect(parseVerseRef("Genesis 1")).toBeNull();
  });
});
