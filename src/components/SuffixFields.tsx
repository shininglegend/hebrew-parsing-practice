import type { DrillAnswer, ParseFields, Word } from "../types";
import { FIELD_SPECS, normalizeMissing } from "../utils";

interface SuffixFieldsProps {
  word: Word;
  answer?: DrillAnswer;
  onChange: (id: string, key: string, val: string) => void;
  disabled?: boolean;
}

const SUFFIX_KEYS: (keyof ParseFields)[] = [
  "suffix",
  "suffixPerson",
  "suffixGender",
  "suffixNumber",
];

export function SuffixFields({ word, answer, onChange, disabled }: SuffixFieldsProps) {
  const goldSuffix = normalizeMissing(word.parse?.suffix);
  if (!goldSuffix) return null;

  const getFieldStatus = (key: keyof ParseFields): "correct" | "incorrect" | "neutral" => {
    const user = normalizeMissing(answer?.[key]);
    const raw = word.parse?.[key];
    const gold = normalizeMissing(typeof raw === "string" ? raw : undefined);
    if (user === undefined || gold === undefined) return "neutral";
    return user === gold ? "correct" : "incorrect";
  };

  const isSuffixCorrect = normalizeMissing(answer?.suffix) === goldSuffix;

  const visibleFields = FIELD_SPECS.filter((f) => SUFFIX_KEYS.includes(f.key)).filter((f) => {
    if (f.key === "suffix") return true;
    // Person, gender, and number appear once the suffix type is right, and only if the gold has them
    if (!isSuffixCorrect) return false;
    const raw = word.parse?.[f.key];
    return normalizeMissing(typeof raw === "string" ? raw : undefined) !== undefined;
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {visibleFields.map((f) => {
        const status = getFieldStatus(f.key);
        let selectClassName = "select";
        if (status === "correct") selectClassName += " !border-green-500 !bg-green-50";
        else if (status === "incorrect") selectClassName += " !border-red-500 !bg-red-50";
        return (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">{f.label}</span>
            <select
              className={selectClassName}
              disabled={disabled}
              onChange={(e) => onChange(word.id, f.key, e.target.value)}
              value={answer?.[f.key] ?? ""}
            >
              <option value="">— choose —</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
}
