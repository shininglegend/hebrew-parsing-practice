-- data/oshb-corrections.json retags six pausal 2ms suffixes in Joshua that OSHB tags 2fs.
-- Attempts saved before the fix graded them against "feminine", so a correct "masculine"
-- counted as a miss in weak spots. Regrade those rows. Word ids are `book-chapter-verse-index`.
UPDATE attempts
SET gold = 'masculine'
WHERE field = 'suffixGender'
  AND gold = 'feminine'
  AND word_id IN (
    'joshua-1-5-12',
    'joshua-1-17-12',
    'joshua-3-7-19',
    'joshua-7-10-5',
    'joshua-17-17-13',
    'joshua-17-18-3'
  );
