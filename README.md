# Hebrew Parsing Practice

An educational web application for practicing Biblical Hebrew morphological parsing. Load Bible verses, parse each word by selecting its grammatical properties, and receive immediate feedback on your accuracy.

## Features

- **Interactive drill interface**: Load any verse and parse words one by one
- **Comprehensive morphology**: Parse 8 grammatical fields per word:
  - Part of speech
  - Case
  - Number
  - Gender
  - Tense
  - Voice
  - Mood
  - Person
- **Instant feedback**: Color-coded scoring shows correct/incorrect answers
- **Real linguistic data**: Uses for gold-standard morphological analysis

## Tech Stack

- React 18 + TypeScript
- Vite for fast development and building
- Tailwind CSS for styling

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How It Works

1. Select a Bible verse
2. Each word appears as an expandable card
3. Select morphological properties from dropdowns
4. Submit to see your score
5. Review correct answers highlighted in green, incorrect in red

## Project Structure

- `src/App.tsx` - Main component with state machine and drill interface
- `src/api.ts` - Data fetching and API integration layer
- `src/types.ts` - TypeScript definitions for words, verses, and parse fields
- `src/utils.ts` - Scoring logic and field specifications
- `src/index.css` - Tailwind configuration and custom component styles

## Data Sources

The author of this project is grateful for the Open Scriptures hebrew bible for providing the morphology data.

### Attribution

Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb
