import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { loadVerse } from "../api";
import { prefetchLemmas } from "../lexicon";
import { plainSurface } from "../signals";
import type { Verse, Word } from "../types";
import { celebrateWithConfetti, FIELD_SPECS, formatRef, goldValue } from "../utils";
import { Footer, Header, VerseSelector } from "./";

type State =
  | { kind: "idle" }
  | { kind: "loading"; ref: string }
  | { kind: "loaded"; verse: Verse }
  | { kind: "error"; msg: string };

type CompareOptions = { ignoreVowels: boolean; ignoreAccents: boolean; ignoreDots: boolean };

export function normalizeForComparison(text: string, options: CompareOptions): string {
  // Decompose so every point and accent is its own code point
  let normalized = text.normalize("NFD");

  if (options.ignoreAccents) {
    // Cantillation marks (te'amim) and meteg
    normalized = normalized.replace(/[\u0591-\u05AF\u05BD]/g, "");
  }
  if (options.ignoreVowels) {
    // Vowel points (niqqud), including hataf vowels, holam for vav, and qamats qatan
    normalized = normalized.replace(/[\u05B0-\u05BB\u05C7]/g, "");
  }
  if (options.ignoreDots) {
    // Dagesh, rafe, and the shin/sin dots
    normalized = normalized.replace(/[\u05BC\u05BF\u05C1\u05C2]/g, "");
  }

  // The data's morpheme dividers, maqaf, sof pasuq, paseq, and ordinary punctuation never count
  normalized = normalized.replace(/[/\u05BE\u05C0\u05C3\u05C6.,;:!?·—\-\s]/g, "");

  return normalized.normalize("NFC");
}

function matchesSurface(word: Word, input: string | undefined, options: CompareOptions): boolean {
  const typed = input?.trim() || "";
  if (!typed) return false;
  return normalizeForComparison(typed, options) === normalizeForComparison(word.surface, options);
}

export function ReverseParser() {
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [chapter, setChapter] = useState("1");
  const [verse, setVerse] = useState("1");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [ignoreVowels, setIgnoreVowels] = useState(false);
  const [ignoreAccents, setIgnoreAccents] = useState(true);
  const [ignoreDots, setIgnoreDots] = useState(false);
  const [lexiconLoaded, setLexiconLoaded] = useState(false);
  const [loadingLexicon, setLoadingLexicon] = useState(false);
  const verseData = state.kind === "loaded" ? state.verse : undefined;
  // Set once the whole verse has been celebrated; cleared whenever a verse starts loading.
  const confettiTriggered = useRef(false);

  async function load() {
    const formatted = formatRef(selectedBook, chapter, verse);
    setState({ kind: "loading", ref: formatted });
    confettiTriggered.current = false;
    setUserInputs({});
    setRevealed(false);
    setLexiconLoaded(false);
    try {
      const v = await loadVerse(formatted);
      setState({ kind: "loaded", verse: v });
    } catch (e) {
      setState({ kind: "error", msg: e instanceof Error ? e.message : "error" });
    }
  }

  async function handleNavigate(direction: "prev" | "next") {
    const currentVerse = parseInt(verse, 10);
    if (Number.isNaN(currentVerse)) return;

    const newVerse = direction === "prev" ? currentVerse - 1 : currentVerse + 1;
    if (newVerse < 1) return;

    setVerse(newVerse.toString());
    const formatted = formatRef(selectedBook, chapter, newVerse.toString());
    setState({ kind: "loading", ref: formatted });
    confettiTriggered.current = false;
    setUserInputs({});
    setRevealed(false);
    setLexiconLoaded(false);
    try {
      const v = await loadVerse(formatted);
      setState({ kind: "loaded", verse: v });
    } catch (e) {
      setState({ kind: "error", msg: e instanceof Error ? e.message : "error" });
    }
  }

  async function loadLexiconForCurrentVerse() {
    if (!verseData || lexiconLoaded || loadingLexicon) return;

    setLoadingLexicon(true);
    try {
      const lemmas = verseData.words.map((w) => w.lemma).filter(Boolean) as string[];
      const lexiconMap = await prefetchLemmas(lemmas);

      // Update verse data with definitions
      const updatedVerse = {
        ...verseData,
        words: verseData.words.map((w) => {
          if (w.lemma) {
            const entry = lexiconMap.get(w.lemma);
            if (entry) {
              return {
                ...w,
                definition: {
                  brief: entry.definitions.find((d) => d.role === "brief")?.text,
                  full: entry.definitions.find((d) => d.role === "full")?.text,
                },
              };
            }
          }
          return w;
        }),
      };

      setState({ kind: "loaded", verse: updatedVerse });
      setLexiconLoaded(true);
    } catch (e) {
      console.error("Failed to load lexicon:", e);
    } finally {
      setLoadingLexicon(false);
    }
  }

  // Load the starting verse once on mount. Later loads go through the selector.
  const loadInitial = useEffectEvent(() => {
    load();
  });
  useEffect(() => {
    loadInitial();
  }, []);

  const surfaceLine = useMemo(
    () => verseData?.words.map((w) => plainSurface(w.surface)).join(" ") ?? "",
    [verseData]
  );

  // Round the letter count up to the nearest multiple of 3 to prevent guessing
  function getBoxWidth(word: Word): number {
    const len = word.surface.normalize("NFD").replace(/[^\u05D0-\u05EA]/g, "").length;
    return Math.max(3, Math.ceil(len / 3) * 3);
  }

  function handleInputChange(wordId: string, value: string) {
    setUserInputs((prev) => ({ ...prev, [wordId]: value }));
  }

  const compareOptions = useMemo<CompareOptions>(
    () => ({ ignoreVowels, ignoreAccents, ignoreDots }),
    [ignoreVowels, ignoreAccents, ignoreDots]
  );

  function isCorrect(word: Word): boolean {
    return matchesSurface(word, userInputs[word.id], compareOptions);
  }

  function getInputClassName(word: Word): string {
    const input = userInputs[word.id]?.trim() || "";
    if (!input) return "input text-center";
    if (isCorrect(word)) return "input text-center !border-green-500 !bg-green-50";
    return "input text-center";
  }

  // Get all parse fields to display for a word
  function getDisplayFields(word: Word) {
    const fields: { label: string; value: string }[] = [];

    FIELD_SPECS.forEach((spec) => {
      const value = goldValue(word.parse, spec.key);
      if (value !== undefined) {
        fields.push({ label: spec.label, value });
      }
    });

    return fields;
  }

  // Check if all words are correctly typed
  useEffect(() => {
    if (!verseData || verseData.words.length === 0 || confettiTriggered.current || revealed) return;

    // Check if all words are correct
    const allCorrect = verseData.words.every((w) =>
      matchesSurface(w, userInputs[w.id], compareOptions)
    );

    if (allCorrect) {
      celebrateWithConfetti();
      confettiTriggered.current = true;
    }
  }, [userInputs, verseData, revealed, compareOptions]);

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl p-4 space-y-4">
        <VerseSelector
          selectedBook={selectedBook}
          chapter={chapter}
          verse={verse}
          onBookChange={setSelectedBook}
          onChapterChange={setChapter}
          onVerseChange={setVerse}
          onLoad={load}
          surfaceLine={surfaceLine}
          loading={state.kind === "loading"}
          error={state.kind === "error" ? state.msg : undefined}
          hideVerse={true}
          onNavigate={handleNavigate}
          lexiconLoaded={lexiconLoaded}
          onLoadLexicon={loadLexiconForCurrentVerse}
          loadingLexicon={loadingLexicon}
        />

        {/* Toggles for ignoring diacritics */}
        <div className="card">
          <div className="flex gap-4 items-center flex-wrap">
            <span className="text-sm font-medium text-slate-700">Options:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreAccents}
                onChange={(e) => setIgnoreAccents(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Ignore cantillation (te'amim)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreVowels}
                onChange={(e) => setIgnoreVowels(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Ignore vowel points (niqqud)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreDots}
                onChange={(e) => setIgnoreDots(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Ignore dagesh and shin/sin dots</span>
            </label>
          </div>
        </div>

        {verseData && (
          <div className="space-y-4">
            {/* Progress indicator */}
            {(() => {
              const totalWords = verseData.words.length;
              const correctWords = verseData.words.filter((w) => isCorrect(w)).length;
              const percentage = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

              return (
                <div className="card">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">Progress:</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-500 h-full transition-all duration-300 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 min-w-[4rem]">
                      {correctWords} / {totalWords}
                    </span>
                    <span className="text-sm text-slate-600">({percentage}%)</span>
                  </div>
                </div>
              );
            })()}

            {/* Row 1: Revealed verse text */}
            <div className="card">
              <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-medium">
                  {revealed ? (
                    <span className="text-green-700 font-hebrew" dir="rtl">
                      {surfaceLine}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">
                      Type the words below or reveal to see the verse
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setRevealed(true)}
                  disabled={revealed}
                >
                  {revealed ? "Revealed" : "Reveal Verse"}
                </button>
              </div>
            </div>

            {/* Row 2+: Word input boxes with morphology below */}
            <div className="overflow-x-auto">
              <div className="flex pb-4" style={{ minWidth: "max-content" }} dir="rtl">
                {verseData.words.map((word) => {
                  const boxWidth = getBoxWidth(word);
                  const displayFields = getDisplayFields(word);
                  const correct = isCorrect(word);

                  return (
                    <div
                      key={word.id}
                      className="flex flex-col gap-1 border-s border-slate-300 px-1 first:ps-0 first:border-s-0"
                      style={{ minWidth: `${boxWidth * 0.75}rem` }}
                    >
                      {/* Input box for the word */}
                      <input
                        type="text"
                        className={`${getInputClassName(word)} font-hebrew`}
                        dir="rtl"
                        lang="he"
                        value={userInputs[word.id] || ""}
                        onChange={(e) => handleInputChange(word.id, e.target.value)}
                        placeholder="..."
                        style={{ width: "100%" }}
                        disabled={revealed}
                      />

                      {/* Show checkmark if correct */}
                      {correct && (
                        <div className="text-center text-green-600 font-bold text-sm">✓</div>
                      )}

                      {/* Lemma */}
                      {word.lemma && (
                        <div className="text-center">
                          <div className="text-xs font-semibold text-slate-700 break-words">
                            {word.lemma}
                          </div>
                        </div>
                      )}

                      {/* Parse fields */}
                      <div className="space-y-0.5" dir="ltr">
                        {displayFields.map((field) => (
                          <div
                            key={field.label}
                            className="text-xs text-center p-0.5 bg-slate-100 rounded-sm"
                          >
                            <div className="font-medium text-slate-600 text-[10px] leading-tight">
                              {field.label}
                            </div>
                            <div className="text-slate-900 text-[11px] leading-tight break-words">
                              {field.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              <p>
                <strong>How to use:</strong> Type the Hebrew word in each box. When correct, the box
                turns green. Use the parse below each box to build the form from the Strong's entry.
                Cantillation is ignored by default; turn off the other marks too if you are typing
                without points.
              </p>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}
