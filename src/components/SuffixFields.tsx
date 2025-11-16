import { FIELD_SPECS, normalizeMissing, isFieldRelevant } from "../utils";
import type { DrillAnswer, ParseFields, Word } from "../types";

interface SuffixFieldsProps {
  word: Word;
  answer?: DrillAnswer;
  onChange: (id: string, key: string, val: string) => void;
  disabled?: boolean;
  hasAnyGoldAnswers: boolean;
  isPosCorrect: boolean;
}

export function SuffixFields({ 
  word, 
  answer, 
  onChange, 
  disabled, 
  hasAnyGoldAnswers, 
  isPosCorrect 
}: SuffixFieldsProps) {
  if (!isPosCorrect) return null;

  const selectedPos = typeof answer?.pos === 'string' ? answer.pos : undefined;
  
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

  const visibleFields = suffixFieldSpecs.filter(f => {
    // For suffix fields, pass the gold parse data to check if they exist
    const parseForRelevance = { 
      ...currentParse, 
      suffix: typeof word.parse?.suffix === 'string' ? word.parse.suffix : undefined 
    };
    const relevant = isFieldRelevant(selectedPos, f.key, parseForRelevance);
    
    if (!relevant) return false;
    
    // If gold answers exist for this word, hide fields with no gold answer
    if (hasAnyGoldAnswers) {
      const goldValue = word.parse?.[f.key];
      if (goldValue === undefined || (typeof goldValue === 'string' && normalizeMissing(goldValue) === undefined)) {
        return false;
      }
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
