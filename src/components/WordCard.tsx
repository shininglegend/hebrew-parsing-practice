import { useState } from "react";
import { FIELD_SPECS, normalizeMissing, isFieldRelevant } from "../utils";
import type { DrillAnswer, ParseFields, Word } from "../types";
import { PrefixField } from "./PrefixField";
import { SuffixFields } from "./SuffixFields";

interface WordCardProps {
  w: Word;
  answer?: DrillAnswer;
  onChange: (id: string, key: string, val: string | string[]) => void;
  disabled?: boolean;
}

export function WordCard({ w, answer, onChange, disabled }: WordCardProps) {
  const [open, setOpen] = useState(false);
  
  // Check if this word has any gold answers at all
  const hasAnyGoldAnswers = w.parse && FIELD_SPECS.some(f => {
    const val = w.parse?.[f.key];
    if (Array.isArray(val)) {
      return val.some(v => normalizeMissing(v) !== undefined);
    }
    return normalizeMissing(val) !== undefined;
  });
  
  // Helper to determine field status (for non-prefix/suffix fields)
  const getFieldStatus = (key: keyof ParseFields): "correct" | "incorrect" | "neutral" => {
    const userValue = answer?.[key];
    const goldValue = w.parse?.[key];
    
    const normalizedUser = normalizeMissing(typeof userValue === 'string' ? userValue : undefined);
    const normalizedGold = normalizeMissing(typeof goldValue === 'string' ? goldValue : undefined);
    
    if (normalizedUser === undefined) return "neutral";
    if (normalizedGold === undefined) return "neutral";
    return normalizedUser === normalizedGold ? "correct" : "incorrect";
  };

  const selectedPos = typeof answer?.pos === 'string' ? answer.pos : undefined;
  const goldPos = typeof w.parse?.pos === 'string' ? normalizeMissing(w.parse.pos) : undefined;
  const isPosCorrect = !!(selectedPos && goldPos && normalizeMissing(selectedPos) === goldPos);
  
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
        <div className="space-y-3">
          {/* Render prefix field first, horizontally */}
          <PrefixField 
            word={w}
            answer={answer}
            onChange={onChange}
            disabled={disabled}
            options={FIELD_SPECS.find(f => f.key === "prefix")?.options ?? []}
          />
          
          {/* Render POS and other main fields in grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FIELD_SPECS.filter(f => {
            const isSuffixField = f.key === 'suffix' || f.key === 'suffixPerson' || f.key === 'suffixGender' || f.key === 'suffixNumber';
            return f.key !== "prefix" && !isSuffixField;
          }).map(f => {
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
            // Only show fields after POS is correct
            if (!isPosCorrect) return null;
            
            // Build a ParseFields object from the current answer for context
            const currentParse: ParseFields = {
              pos: typeof answer?.pos === 'string' ? answer.pos : undefined,
              prefix: Array.isArray(answer?.prefix) ? answer.prefix : undefined,
              state: typeof answer?.state === 'string' ? answer.state : undefined,
              gender: typeof answer?.gender === 'string' ? answer.gender : undefined,
              number: typeof answer?.number === 'string' ? answer.number : undefined,
              person: typeof answer?.person === 'string' ? answer.person : undefined,
              stem: typeof answer?.stem === 'string' ? answer.stem : undefined,
              tense: typeof answer?.tense === 'string' ? answer.tense : undefined,
              suffix: typeof answer?.suffix === 'string' ? answer.suffix : undefined,
              suffixPerson: typeof answer?.suffixPerson === 'string' ? answer.suffixPerson : undefined,
              suffixGender: typeof answer?.suffixGender === 'string' ? answer.suffixGender : undefined,
              suffixNumber: typeof answer?.suffixNumber === 'string' ? answer.suffixNumber : undefined,
            };
            
            const relevant = isFieldRelevant(selectedPos, f.key, currentParse);
            
            // Don't render irrelevant fields at all
            if (!relevant) return null;
            
            // If gold answers exist for this word, hide fields with no gold answer
            if (hasAnyGoldAnswers) {
              const goldValue = w.parse?.[f.key];
              if (goldValue === undefined || (typeof goldValue === 'string' && normalizeMissing(goldValue) === undefined)) {
                return null;
              }
            }
            
            const status = getFieldStatus(f.key);
            let selectClassName = "select";
            if (status === "correct") {
              selectClassName += " !border-green-500 !bg-green-50";
            } else if (status === "incorrect") {
              selectClassName += " !border-red-500 !bg-red-50";
            }
            
            const userValue = typeof answer?.[f.key] === 'string' ? answer[f.key] as string : '';
            
            return (
              <label key={f.key} className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">{f.label}</span>
                <select
                  className={selectClassName}
                  disabled={disabled}
                  onChange={e => onChange(w.id, f.key, e.target.value)}
                  value={userValue}
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
          
          {/* Render suffix fields in their own row if they exist */}
          <SuffixFields
            word={w}
            answer={answer}
            onChange={onChange}
            disabled={disabled}
            hasAnyGoldAnswers={!!hasAnyGoldAnswers}
            isPosCorrect={isPosCorrect}
          />
        </div>
      )}
    </div>
  );
}
