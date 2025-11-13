import type { Verse, Word, ParseFields } from "./types";

// Hebrew morphology code decoder
// Format: Position-based codes like "Ncfsa" (Noun, common, feminine, singular, absolute)
// or "Vqp3ms" (Verb, qal, perfect, 3rd person, masculine, singular)

/**
 * Decode Hebrew morphology code into ParseFields
 * 
 * Format examples:
 * - Noun: N + type + gender + number + state (e.g., "Ncfsa" = common noun, fem, sing, abs)
 * - Verb: V + stem + tense + person + gender + number (e.g., "Vqp3ms" = qal, perfect, 3rd, masc, sing)
 * - Others: Simple codes like "R" (preposition), "C" (conjunction), "D" (adverb)
 */
function decodeHebrewMorphology(code: string): Partial<ParseFields> {
  const fields: Partial<ParseFields> = {};
  
  if (!code || code.length === 0) return fields;
  
  const firstChar = code[0].toUpperCase();
  
  // Part of Speech (first character)
  switch (firstChar) {
    case 'N': // Noun
      fields.pos = 'noun';
      if (code.length >= 5) {
        // Position 1: noun type (c=common, p=proper, g=gentilic)
        // Position 2: gender (m=masc, f=fem, b=both/common)
        const gender = code[2];
        if (gender === 'm') fields.gender = 'masculine';
        else if (gender === 'f') fields.gender = 'feminine';
        else if (gender === 'b' || gender === 'c') fields.gender = 'common';
        
        // Position 3: number (s=singular, p=plural, d=dual)
        const number = code[3];
        if (number === 's') fields.number = 'singular';
        else if (number === 'p') fields.number = 'plural';
        else if (number === 'd') fields.number = 'dual';
        
        // Position 4: state (a=absolute, c=construct, d=determined)
        const state = code[4];
        if (state === 'a') fields.state = 'absolute';
        else if (state === 'c') fields.state = 'construct';
        else if (state === 'd') fields.state = 'determined';
      }
      break;
      
    case 'V': // Verb
      fields.pos = 'verb';
      if (code.length >= 2) {
        // Position 1: stem/binyan
        const stem = code[1];
        if (stem === 'q') fields.stem = 'qal';
        else if (stem === 'N' || stem === 'n') fields.stem = 'niphal';
        else if (stem === 'p') fields.stem = 'piel';
        else if (stem === 'P') fields.stem = 'pual';
        else if (stem === 'h') fields.stem = 'hiphil';
        else if (stem === 'H') fields.stem = 'hophal';
        else if (stem === 't') fields.stem = 'hithpael';
      }
      if (code.length >= 3) {
        // Position 2: tense/aspect
        const tense = code[2];
        if (tense === 'p') fields.tense = 'perfect';
        else if (tense === 'i') fields.tense = 'imperfect';
        else if (tense === 'v') fields.tense = 'imperative';
        else if (tense === 'c' || tense === 'a') fields.tense = 'infinitive';
        else if (tense === 'r') fields.tense = 'participle';
      }
      if (code.length >= 4 && fields.tense !== 'infinitive') {
        // Position 3: person (1/2/3) - not for infinitives
        const person = code[3];
        if (person === '1') fields.person = 'first';
        else if (person === '2') fields.person = 'second';
        else if (person === '3') fields.person = 'third';
      }
      if (code.length >= 5) {
        // Position 4: gender (m/f/b/c)
        const gender = code[4];
        if (gender === 'm') fields.gender = 'masculine';
        else if (gender === 'f') fields.gender = 'feminine';
        else if (gender === 'b' || gender === 'c') fields.gender = 'common';
      }
      if (code.length >= 6) {
        // Position 5: number (s/p/d)
        const number = code[5];
        if (number === 's') fields.number = 'singular';
        else if (number === 'p') fields.number = 'plural';
        else if (number === 'd') fields.number = 'dual';
      }
      break;
      
    case 'A': // Adjective
      fields.pos = 'adjective';
      if (code.length >= 4) {
        // Similar to noun: gender, number, state
        const gender = code[1];
        if (gender === 'm') fields.gender = 'masculine';
        else if (gender === 'f') fields.gender = 'feminine';
        else if (gender === 'b' || gender === 'c') fields.gender = 'common';
        
        const number = code[2];
        if (number === 's') fields.number = 'singular';
        else if (number === 'p') fields.number = 'plural';
        else if (number === 'd') fields.number = 'dual';
        
        const state = code[3];
        if (state === 'a') fields.state = 'absolute';
        else if (state === 'c') fields.state = 'construct';
        else if (state === 'd') fields.state = 'determined';
      }
      break;
      
    case 'R': // Preposition
      fields.pos = 'preposition';
      break;
      
    case 'P': // Pronoun
      fields.pos = 'pronoun';
      if (code.length >= 2) {
        // Pronoun types and inflections vary
        // Often: P + type + person + gender + number
        if (code.length >= 4) {
          const person = code[2];
          if (person === '1') fields.person = 'first';
          else if (person === '2') fields.person = 'second';
          else if (person === '3') fields.person = 'third';
          
          const gender = code[3];
          if (gender === 'm') fields.gender = 'masculine';
          else if (gender === 'f') fields.gender = 'feminine';
          else if (gender === 'b' || gender === 'c') fields.gender = 'common';
          
          if (code.length >= 5) {
            const number = code[4];
            if (number === 's') fields.number = 'singular';
            else if (number === 'p') fields.number = 'plural';
            else if (number === 'd') fields.number = 'dual';
          }
        }
      }
      break;
      
    case 'C': // Conjunction
      fields.pos = 'conjunction';
      break;
      
    case 'D': // Adverb
      fields.pos = 'adverb';
      break;
      
    case 'T': // Particle
      fields.pos = 'particle';
      break;
      
    case 'I': // Interjection
      fields.pos = 'interjection';
      break;
      
    default:
      // Unknown - try to infer
      break;
  }
  
  return fields;
}

/**
 * Placeholder function for loading Hebrew verse data
 * This will be replaced when we integrate the local hebrew-data/*.json files
 * For now, returns a demo verse from Genesis 1:1
 */
export async function loadVerse(_ref: string): Promise<Verse> {
  // TODO: Replace this with actual hebrew-data loader
  // Demo fallback: Genesis 1:1
  console.warn("Using demo data - hebrew-data integration pending", _ref);
  
  const demoWords: Array<[string, string, string]> = [
    ["בְּ/רֵאשִׁ֖ית", "Hb/H7225", "R/Ncfsa"],
    ["בָּרָ֣א", "H1254", "Vqp3ms"],
    ["אֱלֹהִ֑ים", "H430", "Ncmpa"],
    ["אֵ֥ת", "H853", "To"],
    ["הַ/שָּׁמַ֖יִם", "Hd/H8064", "Td/Ncmpa"],
    ["וְ/אֵ֥ת", "Hc/H853", "C/To"],
    ["הָ/אָֽרֶץ", "Hd/H776", "Td/Ncfsa"]
  ];
  
  const words: Word[] = [];
  
  demoWords.forEach((w, i) => {
    const [surface, strongs, morphCode] = w;
    
    // Check if this is a compound word (preposition/article attached)
    const surfaceParts = surface.split('/');
    const strongsParts = strongs.split('/');
    const morphParts = morphCode.split('/');
    
    // If there are multiple parts, create separate words for each
    if (surfaceParts.length > 1 && morphParts.length > 1) {
      surfaceParts.forEach((surf, partIdx) => {
        const partStrongs = strongsParts[partIdx] || strongsParts[0];
        const partMorph = morphParts[partIdx] || morphParts[0];
        
        words.push({
          surface: surf,
          lemma: partStrongs,
          parse: decodeHebrewMorphology(partMorph),
          id: `gen-1-1-${i}-${partIdx}`,
          afterSpace: partIdx === 0 // Only first part of compound gets space before it
        });
      });
    } else {
      // Single word, no compounds
      words.push({
        surface,
        lemma: strongs,
        parse: decodeHebrewMorphology(morphCode),
        id: `gen-1-1-${i}`,
        afterSpace: true // Normal words always have space before them
      });
    }
  });
  
  return {
    ref: "Genesis 1:1",
    words
  };
}
