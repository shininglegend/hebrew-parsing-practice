import { describe, expect, it } from "vitest";
import { progressForVerse, readProgress, type VerseProgress, writeProgress } from "./verseProgress";

function memory(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

const saved: VerseProgress = {
  phase: "translate",
  answers: { a: { pos: "verb", prefix: "ו (and)" }, gone: { pos: "noun (common)" } },
  selectedWordIds: ["a"],
  activeId: "a",
  english: "in the beginning",
  translateWordIds: ["a", "b"],
  showCompare: true,
};

describe("verse progress", () => {
  it("keeps each verse in the same window store", () => {
    const storage = memory();
    writeProgress("Genesis 1:1", saved, storage);
    writeProgress("Genesis 1:2", { ...saved, english: "and the earth", phase: "parse" }, storage);
    expect(readProgress("Genesis 1:1", storage)?.english).toBe("in the beginning");
    expect(readProgress("Genesis 1:2", storage)?.phase).toBe("parse");
    expect(readProgress("Genesis 3:16", storage)).toBeNull();
  });

  it("ignores a broken record", () => {
    const storage = memory();
    storage.setItem("hebrewparser.progress", "{");
    expect(readProgress("Genesis 1:1", storage)).toBeNull();
    storage.setItem(
      "hebrewparser.progress",
      JSON.stringify({ "Genesis 1:1": { phase: "elsewhere" } })
    );
    expect(readProgress("Genesis 1:1", storage)).toBeNull();
  });

  it("keeps a joined prefix string and drops a prefix saved as a list", () => {
    const storage = memory();
    storage.setItem(
      "hebrewparser.progress",
      JSON.stringify({
        "Genesis 1:1": {
          ...saved,
          answers: { a: { prefix: ["ו (and)"], pos: "verb" }, b: { prefix: "ו (and) + ה (the)" } },
        },
      })
    );
    expect(readProgress("Genesis 1:1", storage)?.answers).toEqual({
      a: { pos: "verb" },
      b: { prefix: "ו (and) + ה (the)" },
    });
  });

  it("restores a verse and drops word ids that are no longer in it", () => {
    const progress = progressForVerse(saved, ["a", "b"]);
    expect(progress.phase).toBe("translate");
    expect(progress.answers).toEqual({ a: { pos: "verb", prefix: "ו (and)" } });
    expect(progress.selectedWordIds).toEqual(["a"]);
    expect(progress.english).toBe("in the beginning");
    expect(progress.showCompare).toBe(true);
  });

  it("keeps an explicit empty selection", () => {
    const progress = progressForVerse({ ...saved, selectedWordIds: [], translateWordIds: [] }, [
      "a",
      "b",
    ]);
    expect(progress.selectedWordIds).toEqual([]);
    expect(progress.translateWordIds).toEqual([]);
    expect(progress.activeId).toBeNull();
  });

  it("starts over when every saved word id is stale", () => {
    const progress = progressForVerse(saved, ["x", "y"]);
    expect(progress.selectedWordIds).toEqual(["x", "y"]);
    expect(progress.translateWordIds).toEqual(["x", "y"]);
    expect(progress.answers).toEqual({});
    expect(progress.activeId).toBe("x");
  });

  it("starts a verse that has no saved progress on the first word", () => {
    expect(progressForVerse(null, ["a", "b"])).toMatchObject({
      phase: "parse",
      selectedWordIds: ["a", "b"],
      activeId: "a",
      english: "",
      showCompare: false,
    });
  });
});
