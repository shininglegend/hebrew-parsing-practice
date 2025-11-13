import { useState } from "react";
import { FIELD_SPECS, normalizeMissing, isFieldRelevant } from "../utils";
import type { DrillAnswer, ParseFields, Word } from "../types";

interface WordCardProps {
  w: Word;
  answer?: DrillAnswer;
  onChange: (id: string, key: string, val: string) => void;
  disabled?: boolean;
}

export function WordCard({ w, answer, onChange, disabled }: WordCardProps) {
  const [open, setOpen] = useState(false);
  
  // Check if this word has any gold answers at all
  const hasAnyGoldAnswers = w.parse && FIELD_SPECS.some(f => 
    normalizeMissing(w.parse?.[f.key]) !== undefined
  );
  
  // Helper to determine field status
  const getFieldStatus = (key: keyof ParseFields): "correct" | "incorrect" | "neutral" => {
    const userValue = normalizeMissing(answer?.[key]);
    const goldValue = normalizeMissing(w.parse?.[key]);
    
    // If no answer yet, neutral
    if (userValue === undefined) return "neutral";
    // If no gold value (field not applicable), neutral
    if (goldValue === undefined) return "neutral";
    // Compare values
    return userValue === goldValue ? "correct" : "incorrect";
  };
  
  return (
    <div className="card space-y-2">
      <div className="flex items-center gap-3">
        <button className="badge" onClick={() => setOpen(!open)} type="button">
          {open ? "−" : "+"}
        </button>
        <div className="text-xl font-semibold">{w.surface}</div>
        {w.lemma && <div className="badge">lemma: {w.lemma}</div>}
      </div>
      {open && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FIELD_SPECS.map(f => {
            // Always show POS field
            if (f.key === "pos") {
              const status = getFieldStatus(f.key);
              let selectClassName = "select";
              if (status === "correct") {
                selectClassName += " !border-green-500 !bg-green-50";
              } else if (status === "incorrect") {
                selectClassName += " !border-red-500 !bg-red-50";
              }
              
              return (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600">{f.label}</span>
                  <select
                    className={selectClassName}
                    disabled={disabled}
                    onChange={e => onChange(w.id, f.key, e.target.value)}
                    value={answer?.[f.key] ?? ""}
                  >
                    <option value="">— choose —</option>
                    {f.options.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
              );
            }
            
            // For all other fields: only show them if POS is correct
            const selectedPos = answer?.pos;
            const goldPos = normalizeMissing(w.parse?.pos);
            const isPosCorrect = selectedPos && goldPos && normalizeMissing(selectedPos) === goldPos;
            
            // Suffix fields have different visibility rules
            const isSuffixField = f.key === 'suffix' || f.key === 'suffixPerson' || f.key === 'suffixGender' || f.key === 'suffixNumber';
            
            // Hide non-suffix fields until POS is correct
            if (!isSuffixField && !isPosCorrect) return null;
            
            // Build a ParseFields object from the current answer for context
            const currentParse: ParseFields = {
              pos: answer?.pos,
              state: answer?.state,
              gender: answer?.gender,
              number: answer?.number,
              person: answer?.person,
              stem: answer?.stem,
              tense: answer?.tense,
              suffix: answer?.suffix,
              suffixPerson: answer?.suffixPerson,
              suffixGender: answer?.suffixGender,
              suffixNumber: answer?.suffixNumber,
            };
            
            // For suffix fields, also pass the gold parse data to check if suffix exists
            const parseForRelevance = isSuffixField ? { ...currentParse, suffix: w.parse?.suffix } : currentParse;
            const relevant = isFieldRelevant(selectedPos, f.key, parseForRelevance);
            
            // Don't render irrelevant fields at all
            if (!relevant) return null;
            
            // If gold answers exist for this word, hide fields with no gold answer
            if (hasAnyGoldAnswers) {
              const goldValue = normalizeMissing(w.parse?.[f.key]);
              if (goldValue === undefined) return null;
            }
            
            const status = getFieldStatus(f.key);
            let selectClassName = "select";
            if (status === "correct") {
              selectClassName += " !border-green-500 !bg-green-50";
            } else if (status === "incorrect") {
              selectClassName += " !border-red-500 !bg-red-50";
            }
            
            return (
              <label key={f.key} className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">{f.label}</span>
                <select
                  className={selectClassName}
                  disabled={disabled}
                  onChange={e => onChange(w.id, f.key, e.target.value)}
                  value={answer?.[f.key] ?? ""}
                >
                  <option value="">— choose —</option>
                  {f.options.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
