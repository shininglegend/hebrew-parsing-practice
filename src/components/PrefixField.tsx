import { normalizeMissing } from "../utils";
import type { DrillAnswer, Word } from "../types";

interface PrefixFieldProps {
  word: Word;
  answer?: DrillAnswer;
  onChange: (id: string, key: string, val: string[]) => void;
  disabled?: boolean;
  options: string[];
}

export function PrefixField({ word, answer, onChange, disabled, options }: PrefixFieldProps) {
  // Check if prefix field is relevant
  const goldPrefixes = word.parse?.prefix;
  if (!goldPrefixes || (Array.isArray(goldPrefixes) && goldPrefixes.length === 0)) {
    return null;
  }

  const userPrefixes = Array.isArray(answer?.prefix) ? answer.prefix : [];
  
  // Determine field status
  const getFieldStatus = (): "correct" | "incorrect" | "neutral" => {
    if (userPrefixes.length === 0) return "neutral";
    
    const goldPrefixArray = Array.isArray(goldPrefixes) ? goldPrefixes : (goldPrefixes ? [goldPrefixes] : []);
    if (goldPrefixArray.length === 0) return "neutral";
    
    // Normalize and create sets
    const userSet = new Set(userPrefixes.map(p => normalizeMissing(p)).filter(Boolean));
    const goldSet = new Set(goldPrefixArray.map(p => normalizeMissing(p)).filter(Boolean));
    
    // If any wrong answer is selected, red
    for (const item of userSet) {
      if (!goldSet.has(item)) return "incorrect";
    }
    
    // If all right answers are selected, green
    if (userSet.size === goldSet.size) return "correct";
    
    // Otherwise (some correct but not all), no color
    return "neutral";
  };

  const status = getFieldStatus();
  let containerClassName = "flex flex-col gap-2 p-2 border rounded";
  if (status === "correct") {
    containerClassName += " border-green-500 bg-green-50";
  } else if (status === "incorrect") {
    containerClassName += " border-red-500 bg-red-50";
  } else {
    containerClassName += " border-gray-300";
  }
  
  return (
    <div className={containerClassName}>
      <span className="text-xs text-slate-600 font-semibold">Prefix</span>
      <div className="flex flex-wrap gap-3">
        {options.filter(o => o !== "—").map(option => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={userPrefixes.includes(option)}
              onChange={e => {
                const newPrefixes = e.target.checked
                  ? [...userPrefixes, option]
                  : userPrefixes.filter(p => p !== option);
                onChange(word.id, "prefix", newPrefixes);
              }}
              className="rounded"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
