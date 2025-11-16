// MORPHOLOGY CHARTS DATA STRUCTURE
//
// This file contains Hebrew morphology reference charts organized by grammatical category.
// Each chart follows this structure:
//
// chartKey: {
//   title: "Chart Title",
//   tables: [
//     {
//       subtitle?: "Optional subtitle for this table",
//       headers: ["Column1", "Column2", ...],
//       rows: [
//         ["Row1Col1", "Row1Col2", ...],
//         ["Row2Col1", "Row2Col2", ...],
//       ]
//     }
//   ]
// }
//
// Charts to include:
// - article: Definite article patterns
// - masculineNoun: Masculine noun declensions
// - feminineNoun: Feminine noun declensions
// - dualNouns: Dual number forms
// - qalPerfect: Qal perfect conjugations
// - qalImperfect: Qal imperfect conjugations
// - qalImperative: Qal imperative forms
// - niphalPerfect: Niphal perfect conjugations
// - pielPerfect: Piel perfect conjugations
// - hiphilPerfect: Hiphil perfect conjugations
// - pronouns: Independent personal pronouns

export const MORPHOLOGY_CHARTS: Record<string, {
  title: string;
  tables: Array<{
    subtitle?: string;
    headers: string[];
    rows: string[][];
  }>;
}> = {
  // Add chart data here following the structure above
};
