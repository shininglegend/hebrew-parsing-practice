import { englishFor, findCue, plainSurface } from "./signals";
import type { Word } from "./types";
import { FIELD_KEYS, goldValue } from "./utils";

export type ChecklistLine = {
  wordId: string;
  surface: string;
  text: string;
};

/** What the gold parse commits the English to. Not a grade of the user's sentence. */
export function buildChecklist(words: Word[]): ChecklistLine[] {
  const lines: ChecklistLine[] = [];
  for (const word of words) {
    if (!word.parse) continue;
    const surface = plainSurface(word.surface);
    for (const field of FIELD_KEYS) {
      const gold = goldValue(word.parse, field);
      if (!gold) continue;
      const cue = field === "state" ? findCue(words, word, field) : undefined;
      const english = englishFor(field, gold, cue);
      lines.push({
        wordId: word.id,
        surface: word.surface,
        text: `${surface}, ${gold}: ${english}`,
      });
    }
  }
  return lines;
}
