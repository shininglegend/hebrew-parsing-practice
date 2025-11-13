import type { Verse, Word, ParseFields } from "./types";
import { OT_BOOKS } from "./utils";

// Hebrew morphology code decoder
// Format: Position-based codes like "Ncfsa" (Noun, common, feminine, singular, absolute)
// or "Vqp3ms" (Verb, qal, perfect, 3rd person, masculine, singular)

/**
 * Hebrew morphology code decoder
 * 
 * Comprehensive decoder for all Hebrew morphology codes from ETCBC/OpenScriptures
 * 
 * Format examples:
 * - Noun: N + type + gender + number + state (e.g., "Ncfsa" = common noun, fem, sing, abs)
 * - Verb: V + stem + tense/conjugation + person + gender + number (e.g., "Vqp3ms" = qal, perfect, 3rd, masc, sing)
 * - Adjective: A + gender + number + state (e.g., "Aamsa" = adjective, masc, sing, abs)
 * - Pronoun: P + type + person + gender + number (e.g., "Pp3ms" = personal pronoun, 3rd, masc, sing)
 * - Preposition: R (may have suffixes)
 * - Conjunction: C
 * - Adverb: D
 * - Particle: T + subtype (e.g., "Td" = definite article, "Ti" = interrogative, "Tn" = negative)
 * - Interjection: I
 * - Numeral: A (cardinal/ordinal)
 * 
 * Special prefixes (often separated by /):
 * - Hb = ב prefix (in/with)
 * - Hl = ל prefix (to/for)
 * - Hk = כ prefix (like/as)
 * - Hm = מ prefix (from)
 * - Hc = ו conjunction prefix (and)
 * - Hd = ה definite article prefix
 * - Hs = ש prefix (that/which)
 * 
 * Suffixes (e.g., Sp1cs):
 * - S = suffix
 * - p = pronominal
 * - person + gender + number (e.g., 1cs = 1st common singular, 3ms = 3rd masc singular)
 */
function decodeHebrewMorphology(code: string): Partial<ParseFields> {
  const fields: Partial<ParseFields> = {};
  
  if (!code || code.length === 0) return fields;
  
  const firstChar = code[0].toUpperCase();
  
  // Handle special prefix codes (H + letter)
  if (firstChar === 'H' && code.length >= 2) {
    const prefixType = code[1];
    switch (prefixType) {
      case 'b': fields.prefix = 'ב (in/with)'; break;
      case 'l': fields.prefix = 'ל (to/for)'; break;
      case 'k': fields.prefix = 'כ (like/as)'; break;
      case 'm': fields.prefix = 'מ (from)'; break;
      case 'c': fields.prefix = 'ו (and)'; break;
      case 'd': fields.prefix = 'ה (the)'; break;
      case 's': fields.prefix = 'ש (that/which)'; break;
      case 'i': fields.prefix = 'interrogative ה'; break;
    }
    // These are just prefixes, not the main word
    return fields;
  }
  
  // Handle suffix codes (S + type + person/gender/number)
  if (firstChar === 'S') {
    fields.suffix = 'pronominal suffix';
    if (code.length >= 2) {
      const suffixType = code[1];
      if (suffixType === 'p') {
        fields.suffix = 'pronominal suffix';
        // Parse person/gender/number from remaining characters
        if (code.length >= 4) {
          const person = code[2];
          if (person === '1') fields.suffixPerson = 'first';
          else if (person === '2') fields.suffixPerson = 'second';
          else if (person === '3') fields.suffixPerson = 'third';
          
          const gender = code[3];
          if (gender === 'm') fields.suffixGender = 'masculine';
          else if (gender === 'f') fields.suffixGender = 'feminine';
          else if (gender === 'c' || gender === 'b') fields.suffixGender = 'common';
          
          if (code.length >= 5) {
            const number = code[4];
            if (number === 's') fields.suffixNumber = 'singular';
            else if (number === 'p') fields.suffixNumber = 'plural';
            else if (number === 'd') fields.suffixNumber = 'dual';
          }
        }
      }
    }
    return fields;
  }
  
  // Part of Speech (first character)
  switch (firstChar) {
    case 'N': // Noun
      if (code.length >= 2) {
        const nounType = code[1];
        if (nounType === 'c') fields.pos = 'noun (common)';
        else if (nounType === 'p') fields.pos = 'noun (proper)';
        else if (nounType === 'g') fields.pos = 'noun (gentilic)';
        else fields.pos = 'noun';
      } else {
        fields.pos = 'noun';
      }
      
      if (code.length >= 5) {
        // Position 2: gender (m=masc, f=fem, b=both/common, c=common)
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
        else if (stem === 'o') fields.stem = 'polel';
        else if (stem === 'O') fields.stem = 'polal';
        else if (stem === 'r') fields.stem = 'hithpolel';
        else if (stem === 'm') fields.stem = 'poel';
        else if (stem === 'M') fields.stem = 'poal';
        else if (stem === 'k') fields.stem = 'palel';
        else if (stem === 'K') fields.stem = 'pulal';
        else if (stem === 'Q') fields.stem = 'qal passive';
        else if (stem === 'l') fields.stem = 'pilpel';
        else if (stem === 'L') fields.stem = 'polpal';
        else if (stem === 'f') fields.stem = 'hithpalpel';
        else if (stem === 'D') fields.stem = 'nithpael';
        else if (stem === 'j') fields.stem = 'pealal';
        else if (stem === 'i') fields.stem = 'pilel';
        else if (stem === 'u') fields.stem = 'hothpaal';
        else if (stem === 'c') fields.stem = 'tiphil';
        else if (stem === 'v') fields.stem = 'hishtaphel';
        else if (stem === 'w') fields.stem = 'nithpalel';
        else if (stem === 'y') fields.stem = 'nithpoel';
        else if (stem === 'z') fields.stem = 'hithpoel';
      }
      if (code.length >= 3) {
        // Position 2: tense/conjugation
        const tense = code[2];
        if (tense === 'p') fields.tense = 'perfect (qatal)';
        else if (tense === 'q') fields.tense = 'sequential perfect';
        else if (tense === 'i') fields.tense = 'imperfect (yiqtol)';
        else if (tense === 'w') fields.tense = 'sequential imperfect';
        else if (tense === 'h') fields.tense = 'cohortative';
        else if (tense === 'j') fields.tense = 'jussive';
        else if (tense === 'v') fields.tense = 'imperative';
        else if (tense === 'r') fields.tense = 'participle active';
        else if (tense === 's') fields.tense = 'participle passive';
        else if (tense === 'a') fields.tense = 'infinitive absolute';
        else if (tense === 'c') fields.tense = 'infinitive construct';
      }
      if (code.length >= 4 && !['a', 'c'].includes(code[2])) {
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
      
    case 'A': // Adjective or Numeral
      if (code.length >= 2) {
        const subtype = code[1];
        if (subtype === 'a') {
          fields.pos = 'adjective';
          // Position 2: gender
          if (code.length >= 3) {
            const gender = code[2];
            if (gender === 'm') fields.gender = 'masculine';
            else if (gender === 'f') fields.gender = 'feminine';
            else if (gender === 'b' || gender === 'c') fields.gender = 'common';
          }
          // Position 3: number
          if (code.length >= 4) {
            const number = code[3];
            if (number === 's') fields.number = 'singular';
            else if (number === 'p') fields.number = 'plural';
            else if (number === 'd') fields.number = 'dual';
          }
          // Position 4: state
          if (code.length >= 5) {
            const state = code[4];
            if (state === 'a') fields.state = 'absolute';
            else if (state === 'c') fields.state = 'construct';
            else if (state === 'd') fields.state = 'determined';
          }
        } else if (subtype === 'c' || subtype === 'o') {
          fields.pos = 'numeral';
          fields.numeralType = subtype === 'c' ? 'cardinal' : 'ordinal';
          // Similar structure to adjectives for gender/number/state
          if (code.length >= 3) {
            const gender = code[2];
            if (gender === 'm') fields.gender = 'masculine';
            else if (gender === 'f') fields.gender = 'feminine';
            else if (gender === 'b' || gender === 'c') fields.gender = 'common';
          }
          if (code.length >= 4) {
            const number = code[3];
            if (number === 's') fields.number = 'singular';
            else if (number === 'p') fields.number = 'plural';
            else if (number === 'd') fields.number = 'dual';
          }
          if (code.length >= 5) {
            const state = code[4];
            if (state === 'a') fields.state = 'absolute';
            else if (state === 'c') fields.state = 'construct';
            else if (state === 'd') fields.state = 'determined';
          }
        }
      } else {
        fields.pos = 'adjective';
      }
      break;
      
    case 'R': // Preposition
      fields.pos = 'preposition';
      break;
      
    case 'P': // Pronoun
      if (code.length >= 2) {
        const pronounType = code[1];
        if (pronounType === 'p') {
          fields.pos = 'pronoun';
          fields.pronounType = 'personal';
        } else if (pronounType === 'd') {
          fields.pos = 'pronoun';
          fields.pronounType = 'demonstrative';
        } else if (pronounType === 'i') {
          fields.pos = 'pronoun';
          fields.pronounType = 'interrogative';
        } else if (pronounType === 'f') {
          fields.pos = 'pronoun';
          fields.pronounType = 'indefinite';
        } else {
          fields.pos = 'pronoun';
        }
        
        // Parse person, gender, number if present
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
      } else {
        fields.pos = 'pronoun';
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
      if (code.length >= 2) {
        const particleType = code[1];
        if (particleType === 'd') {
          fields.particleType = 'definite article';
        } else if (particleType === 'i') {
          fields.particleType = 'interrogative';
        } else if (particleType === 'n') {
          fields.particleType = 'negative';
        } else if (particleType === 'r') {
          fields.particleType = 'relative';
        } else if (particleType === 'a') {
          fields.particleType = 'affirmation';
        } else if (particleType === 'o') {
          fields.particleType = 'direct object marker';
        } else if (particleType === 'm') {
          fields.particleType = 'demonstrative';
        } else if (particleType === 'e') {
          fields.particleType = 'exhortation';
        } else if (particleType === 'j') {
          fields.particleType = 'interjection';
        }
      }
      break;
      
    case 'I': // Interjection
      fields.pos = 'interjection';
      break;
      
    default:
      // Unknown - leave fields minimal
      break;
  }
  
  return fields;
}

/**
 * Parse a verse reference like "Genesis 1:1" or "Obadiah 1:15"
 * Returns [bookFile, chapterIndex, verseIndex] or null if invalid
 */
function parseVerseRef(ref: string): [string, number, number] | null {
  // Match patterns like "Genesis 1:1" or "1 Samuel 3:4"
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  
  const bookName = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = parseInt(match[3], 10);
  
  if (isNaN(chapter) || isNaN(verse) || chapter < 1 || verse < 1) {
    return null;
  }
  
  return [bookName, chapter - 1, verse - 1]; // Convert to 0-indexed
}

// GitHub repository URL for Hebrew data files
const GITHUB_DATA_BASE_URL = 'https://raw.githubusercontent.com/shininglegend/hebrew-parsing-practice/refs/heads/main/hebrew-data/bible-books';

// Cache for loaded book data to avoid repeated fetches
const bookCache: Record<string, unknown> = {};

/**
 * Load a book's data from GitHub (with caching)
 */
async function loadBookData(bookFile: string): Promise<unknown> {
  // Check cache first
  if (bookCache[bookFile]) {
    return bookCache[bookFile];
  }
  
  // Fetch from GitHub
  const url = `${GITHUB_DATA_BASE_URL}/${bookFile}.json`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${bookFile} from GitHub: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the data
  bookCache[bookFile] = data;
  
  return data;
}

/**
 * Load a verse from the Hebrew Bible data files
 * @param ref Verse reference in format "Book Chapter:Verse" (e.g., "Genesis 1:1", "Obadiah 1:15")
 * @returns Promise<Verse> with parsed Hebrew words
 */
export async function loadVerse(ref: string): Promise<Verse> {
  const parsed = parseVerseRef(ref);
  if (!parsed) {
    throw new Error(`Invalid verse reference: ${ref}`);
  }
  
  const [bookFile, chapterIdx, verseIdx] = parsed;
  
  try {
    // Load the book data from GitHub
    const bookData = await loadBookData(bookFile);
    
    const chapters = bookData as unknown[];
    
    // Validate indices
    if (!Array.isArray(chapters) || chapterIdx >= chapters.length) {
      throw new Error(`Chapter ${chapterIdx + 1} not found in ${bookFile}`);
    }
    
    const verses = chapters[chapterIdx];
    if (!Array.isArray(verses) || verseIdx >= verses.length) {
      throw new Error(`Verse ${verseIdx + 1} not found in chapter ${chapterIdx + 1} of ${bookFile}`);
    }
    
    const verseData = verses[verseIdx];
    if (!Array.isArray(verseData)) {
      throw new Error(`Invalid verse data for ${ref}`);
    }
    
    // Parse words from the verse data
    // Format: [[surface, strongs, morphology], ...]
    const words: Word[] = [];
    
    verseData.forEach((wordData: string[], wordIdx: number) => {
      if (!Array.isArray(wordData) || wordData.length < 3) return;
      
      const [surface, strongs, morphCode] = wordData;
      
      // Check if this is a compound word (prefix/suffix attached with /)
      const surfaceParts = surface.split('/');
      const strongsParts = strongs.split('/');
      const morphParts = morphCode.split('/');
      
      // If there are multiple parts, create separate Word entries for each
      if (surfaceParts.length > 1 && morphParts.length > 1) {
        surfaceParts.forEach((surf, partIdx) => {
          const partStrongs = strongsParts[partIdx] || strongsParts[strongsParts.length - 1];
          const partMorph = morphParts[partIdx] || morphParts[morphParts.length - 1];
          
          words.push({
            surface: surf,
            lemma: partStrongs,
            parse: decodeHebrewMorphology(partMorph),
            id: `${bookFile}-${chapterIdx + 1}-${verseIdx + 1}-${wordIdx}-${partIdx}`,
            afterSpace: partIdx === 0 // Only first part gets space before it
          });
        });
      } else {
        // Single word, no compounds
        words.push({
          surface,
          lemma: strongs,
          parse: decodeHebrewMorphology(morphCode),
          id: `${bookFile}-${chapterIdx + 1}-${verseIdx + 1}-${wordIdx}`,
          afterSpace: true // Normal spacing
        });
      }
    });
    
    return {
      ref,
      words
    };
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load ${ref}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get list of available books
 */
export function getAvailableBooks(): string[] {
  return OT_BOOKS.map(book => book.name);
}