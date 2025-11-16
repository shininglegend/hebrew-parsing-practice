import { useState } from "react";
import { GRAMMAR_DEFINITIONS } from "../data/grammarDefinitions";

export function GrammarGuide() {
  const [activeSection, setActiveSection] = useState<string>("generalGuide");

  const sections: Array<{ key: string; label: string }> = [
    { key: "generalGuide", label: "General Guide" },
    { key: "partOfSpeech", label: "Parts of Speech" },
    { key: "prefix", label: "Prefixes" },
    { key: "suffix", label: "Suffixes" },
    { key: "state", label: "Noun State" },
    { key: "stem", label: "Verb Stems" },
    { key: "tense", label: "Tense/Aspect" },
    { key: "person", label: "Person" },
    { key: "gender", label: "Gender" },
    { key: "number", label: "Number" },
  ];

  const currentSection = GRAMMAR_DEFINITIONS[activeSection];

  return (
    <div className="flex gap-3">
      {/* Sidebar navigation */}
      <nav className="w-32 flex-shrink-0">
        <ul className="space-y-1">
          {sections.map(section => (
            <li key={section.key}>
              <button
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  activeSection === section.key
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {currentSection ? (
          <>
            <h3 className="text-2xl font-bold mb-6 text-slate-800">{currentSection.title}</h3>
            <div className="space-y-6">
              {currentSection.items.map((item, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">{item.term}</h4>
                  <p className="text-slate-700 mb-2">{item.definition}</p>
                  <p className="text-sm text-slate-600 italic">
                    <strong>Example:</strong> {item.example}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-slate-600">No grammar definitions available. Please add definitions to grammarDefinitions.ts</p>
        )}
      </div>
    </div>
  );
}
