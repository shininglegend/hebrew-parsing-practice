import type { Word } from "../types";
import { FIELD_SPECS, joinPrefixes, splitPrefixes } from "../utils";

const OPTIONS = (FIELD_SPECS.find((spec) => spec.key === "prefix")?.options ?? []).filter(
  (option) => option !== "—"
);

export type PrefixStatus = "correct" | "incorrect" | "partial" | "neutral";

/** Red as soon as a wrong prefix is ticked, green when the set matches, otherwise neutral. */
export function prefixStatus(gold: string[] | undefined, value: string | undefined): PrefixStatus {
  const chosen = splitPrefixes(value);
  if (chosen.length === 0) return "neutral";
  const goldSet = new Set(splitPrefixes(joinPrefixes(gold)));
  if (goldSet.size === 0) return "neutral";
  if (chosen.some((item) => !goldSet.has(item))) return "incorrect";
  return chosen.length === goldSet.size ? "correct" : "partial";
}

interface PrefixFieldProps {
  word: Word;
  /** The joined prefix string, as stored in the answer. */
  value?: string;
  onChange: (id: string, key: "prefix", value: string) => void;
  disabled?: boolean;
  /** Pill buttons (study screen) or checkboxes (the card drill). */
  variant?: "pills" | "checkboxes";
}

export function PrefixField({
  word,
  value,
  onChange,
  disabled,
  variant = "pills",
}: PrefixFieldProps) {
  const gold = word.parse?.prefix;
  if (!gold || gold.length === 0) return null;

  const chosen = splitPrefixes(value);
  const status = prefixStatus(gold, value);

  function toggle(option: string) {
    const next = chosen.includes(option)
      ? chosen.filter((item) => item !== option)
      : [...chosen, option];
    onChange(word.id, "prefix", joinPrefixes(next) ?? "");
  }

  if (variant === "checkboxes") {
    const border =
      status === "correct"
        ? "border-green-500 bg-green-50"
        : status === "incorrect"
          ? "border-red-500 bg-red-50"
          : "border-gray-300";
    return (
      <div className={`flex flex-col gap-2 p-2 border rounded-sm ${border}`}>
        <span className="text-xs text-slate-600 font-semibold">
          Prefix{gold.length > 1 ? ` (${gold.length})` : ""}
        </span>
        <div className="flex flex-wrap gap-3">
          {OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={disabled}
                checked={chosen.includes(option)}
                onChange={() => toggle(option)}
                className="rounded-sm"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="text-xs text-slate-600 mb-1">
        Prefix{gold.length > 1 ? ` — choose ${gold.length}` : ""}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((option) => {
          const pressed = chosen.includes(option);
          const tone = !pressed
            ? "bg-white border-slate-300"
            : status === "correct"
              ? "bg-green-100 border-green-600"
              : status === "incorrect"
                ? "bg-red-100 border-red-600"
                : "bg-slate-900 text-white border-slate-900";
          return (
            <button
              key={option}
              type="button"
              aria-pressed={pressed}
              disabled={disabled}
              onClick={() => toggle(option)}
              className={`min-h-9 px-2.5 py-1 rounded-md border text-sm ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
