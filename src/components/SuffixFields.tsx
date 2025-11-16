import { FIELD_SPECS, normalizeMissing } from "../utils";
import type { DrillAnswer, ParseFields, Word } from "../types";

interface SuffixFieldsProps {
  word: Word;
  answer?: DrillAnswer;
  onChange: (id: string, key: string, val: string) => void;
  disabled?: boolean;
}

export function SuffixFields({ 
  word, 
  answer, 
  onChange, 
  disabled
}: SuffixFieldsProps) {
  // Check if gold parsing has a suffix value
  const goldSuffix = typeof word.parse?.suffix === 'string' ? normalizeMissing(word.parse.suffix) : undefined;
  if (!goldSuffix) return null;

  // Helper to determine field status
  const getFieldStatus = (key: keyof ParseFields): "correct" | "incorrect" | "neutral" => {
    const userValue = answer?.[key];
    const goldValue = word.parse?.[key];
    
    const normalizedUser = normalizeMissing(typeof userValue === 'string' ? userValue : undefined);
    const normalizedGold = normalizeMissing(typeof goldValue === 'string' ? goldValue : undefined);
    
    if (normalizedUser === undefined) return "neutral";
    if (normalizedGold === undefined) return "neutral";
    return normalizedUser === normalizedGold ? "correct" : "incorrect";
  };

  const suffixFieldSpecs = FIELD_SPECS.filter(f => 
    f.key === 'suffix' || f.key === 'suffixPerson' || f.key === 'suffixGender' || f.key === 'suffixNumber'
  );

  // Check if the basic suffix field is answered correctly
  const userSuffix = typeof answer?.suffix === 'string' ? normalizeMissing(answer.suffix) : undefined;
  const isSuffixCorrect = userSuffix === goldSuffix;

  const visibleFields = suffixFieldSpecs.filter(f => {
    // Always show the basic suffix field
    if (f.key === 'suffix') return true;
    
    // Only show other suffix fields if basic suffix is correct and gold has a value for them
    if (!isSuffixCorrect) return false;
    
    const goldValue = word.parse?.[f.key];
    if (goldValue === undefined || (typeof goldValue === 'string' && normalizeMissing(goldValue) === undefined)) {
      return false;
    }
    
    return true;
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {visibleFields.map(f => {
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
              onChange={e => onChange(word.id, f.key, e.target.value)}
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
  );
}
