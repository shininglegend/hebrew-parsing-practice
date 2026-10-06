import { useState } from "react";
import { plainSurface } from "../signals";
import type { DrillAnswer, ParseFields, Word } from "../types";
import { FIELD_SPECS, goldValue, isFieldRelevant, normalizeMissing, splitPrefixes } from "../utils";
import { Modal } from "./Modal";
import { PrefixField } from "./PrefixField";
import { SuffixFields } from "./SuffixFields";

interface WordCardProps {
  w: Word;
  answer?: DrillAnswer;
  onChange: (id: string, key: string, val: string) => void;
  disabled?: boolean;
}

const SUFFIX_KEYS = new Set(["suffix", "suffixPerson", "suffixGender", "suffixNumber"]);

export function WordCard({ w, answer, onChange, disabled }: WordCardProps) {
  const [open, setOpen] = useState(false);
  const [showFullDefinition, setShowFullDefinition] = useState(false);

  // Check if this word has any gold answers at all
  const hasAnyGoldAnswers = FIELD_SPECS.some((f) => goldValue(w.parse, f.key) !== undefined);

  const getFieldStatus = (key: keyof ParseFields): "correct" | "incorrect" | "neutral" => {
    const userValue = normalizeMissing(answer?.[key]);
    const gold = goldValue(w.parse, key);
    if (userValue === undefined || gold === undefined) return "neutral";
    return userValue === gold ? "correct" : "incorrect";
  };

  const selectedPos = answer?.pos;
  const goldPos = goldValue(w.parse, "pos");
  const isPosCorrect = Boolean(selectedPos && goldPos && normalizeMissing(selectedPos) === goldPos);

  // The answer so far, in the shape isFieldRelevant reads
  const currentParse: ParseFields = {
    ...Object.fromEntries(
      FIELD_SPECS.filter((f) => f.key !== "prefix").map((f) => [f.key, answer?.[f.key]])
    ),
    prefix: splitPrefixes(answer?.prefix),
  };

  return (
    <div className="card space-y-2" dir="ltr">
      <div className="flex items-center gap-3">
        <button className="badge" onClick={() => setOpen(!open)} type="button">
          {open ? "−" : "+"}
        </button>
        <div className="text-xl font-semibold font-hebrew" dir="rtl">
          {plainSurface(w.surface)}
        </div>
        {w.lemma && (
          <button
            type="button"
            className="badge cursor-pointer hover:bg-slate-200 transition-colors relative group"
            onClick={() => setShowFullDefinition(true)}
            title={w.definition?.brief || "Strong's number"}
          >
            {w.lemma}
            {w.definition?.brief && (
              <span className="absolute left-0 top-full mt-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded-sm px-2 py-1 whitespace-normal max-w-xs z-10 shadow-lg text-left">
                {w.definition.brief}
              </span>
            )}
          </button>
        )}
      </div>
      {open && (
        <div className="space-y-3">
          <PrefixField
            word={w}
            value={answer?.prefix}
            onChange={onChange}
            disabled={disabled}
            variant="checkboxes"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {FIELD_SPECS.filter((f) => f.key !== "prefix" && !SUFFIX_KEYS.has(f.key)).map((f) => {
              if (f.key === "pos") {
                if (!goldPos) return null;
              } else {
                // Other fields wait for the part of speech
                if (!isPosCorrect) return null;
                if (!isFieldRelevant(selectedPos, f.key, { ...currentParse, ...w.parse }))
                  return null;
                if (hasAnyGoldAnswers && goldValue(w.parse, f.key) === undefined) return null;
              }

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
                    onChange={(e) => onChange(w.id, f.key, e.target.value)}
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

          <SuffixFields word={w} answer={answer} onChange={onChange} disabled={disabled} />
        </div>
      )}

      {w.definition?.full && (
        <Modal
          isOpen={showFullDefinition}
          onClose={() => setShowFullDefinition(false)}
          title={`${w.lemma} - Full Definition`}
        >
          <div className="text-sm leading-relaxed">{w.definition.full}</div>
        </Modal>
      )}
    </div>
  );
}
