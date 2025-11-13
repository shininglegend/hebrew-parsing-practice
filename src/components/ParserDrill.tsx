import { useEffect, useMemo, useState, useRef } from "react";
import { loadVerse } from "../api";
import { formatRef, scoreParse, celebrateWithConfetti } from "../utils";
import {
  Footer,
  Header,
  Results,
  VerseSelector,
  WordCard,
} from "./";
import type { DrillAnswer, Verse } from "../types";

type State =
  | { kind: "idle" }
  | { kind: "loading"; ref: string }
  | { kind: "loaded"; verse: Verse }
  | { kind: "error"; msg: string };

export function ParserDrill() {
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [chapter, setChapter] = useState("1");
  const [verse, setVerse] = useState("1");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [answers, setAnswers] = useState<Record<string, DrillAnswer>>({});
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(
    new Set()
  );
  const verseData = state.kind === "loaded" ? state.verse : undefined;

  function load() {
    const formatted = formatRef(selectedBook, chapter, verse);
    setState({ kind: "loading", ref: formatted });
    setAnswers({});
    loadVerse(formatted)
      .then((v) => {
        setState({ kind: "loaded", verse: v });
        // Initially select all words
        setSelectedWordIds(new Set(v.words.map((w) => w.id)));
      })
      .catch((e) => setState({ kind: "error", msg: e.message || "error" }));
  }

  function handleNavigate(direction: 'prev' | 'next') {
    const currentVerse = parseInt(verse);
    if (isNaN(currentVerse)) return;
    
    const newVerse = direction === 'prev' ? currentVerse - 1 : currentVerse + 1;
    if (newVerse < 1) return;
    
    setVerse(newVerse.toString());
    const formatted = formatRef(selectedBook, chapter, newVerse.toString());
    setState({ kind: "loading", ref: formatted });
    setAnswers({});
    loadVerse(formatted)
      .then((v) => {
        setState({ kind: "loaded", verse: v });
        // Initially select all words
        setSelectedWordIds(new Set(v.words.map((w) => w.id)));
      })
      .catch((e) => setState({ kind: "error", msg: e.message || "error" }));
  }

  useEffect(() => {
    load(); /* initial load */
  }, []);

  const surfaceLine = useMemo(
    () => verseData?.words.map((w) => w.surface).join(" ") ?? "",
    [verseData]
  );

  function setAnswer(id: string, key: string, val: string) {
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], [key]: val } }));
  }

  function toggleWord(wordId: string) {
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  }

  // Filter words to only show selected ones
  const wordsToShow =
    verseData?.words.filter((w) => selectedWordIds.has(w.id)) ?? [];

  // Track if confetti has been triggered for this verse
  const confettiTriggered = useRef(false);

  // Check if all selected words are correctly parsed
  useEffect(() => {
    if (!verseData || wordsToShow.length === 0 || confettiTriggered.current) return;

    // Check if all selected words have been answered and all are correct
    const allAnswered = wordsToShow.every((w) => {
      const answer = answers[w.id];
      if (!answer) return false;
      // Check if at least one field has been filled
      return Object.values(answer).some((val) => val && val.trim() !== "");
    });

    if (!allAnswered) return;

    // Check if all answers are correct
    const allCorrect = wordsToShow.every((w) => {
      const answer = answers[w.id];
      const score = scoreParse(w.parse, answer || {});
      return score.total > 0 && score.correct === score.total;
    });

    if (allCorrect) {
      celebrateWithConfetti();
      confettiTriggered.current = true;
    }
  }, [answers, verseData, wordsToShow]);

  // Reset confetti trigger when verse changes
  useEffect(() => {
    confettiTriggered.current = false;
  }, [verseData]);

  return (
    <>
      <Header currentMode="drill" />
      <div className="mx-auto max-w-5xl p-4 space-y-4">
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
        words={verseData?.words}
        selectedWordIds={selectedWordIds}
        onWordToggle={toggleWord}
        onNavigate={handleNavigate}
      />

      {verseData && wordsToShow.length > 0 && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {wordsToShow.map((w) => (
              <WordCard
                key={w.id}
                w={w}
                answer={answers[w.id]}
                onChange={setAnswer}
              />
            ))}
          </div>
          <Results
            verse={{ ...verseData, words: wordsToShow }}
            answers={answers}
          />
          <Footer />
        </>
      )}
      </div>
    </>
  );
}
