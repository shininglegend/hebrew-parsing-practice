export function Help() {
  return (
    <div className="prose prose-slate max-w-none">
      <h3 className="text-2xl font-bold mb-4 text-slate-800">How to Use This Site</h3>

      <div className="space-y-4 text-slate-700">
        <section>
          <h4 className="font-semibold text-lg text-slate-800">Getting Started</h4>
          <p>
            Pick a book, chapter, and verse and press <strong>Load</strong>, or leave the chapter or
            verse field and the verse loads on its own. The verse appears in Hebrew, right to left,
            with every word ready to parse. Chapter and verse numbers follow the English numbering.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-lg text-slate-800">Study</h4>
          <p>
            Tap a word, then choose its features. Prefixes come first (tick every prefix on the
            word), then the part of speech, then the rest. A miss opens a signal card: the contrast,
            the spelling in the word that points at the right answer (a וַ, a dagesh, a preformative
            letter, the next word in a construct chain), and what that parse does in English. When
            every selected word is parsed, write an English rendering and compare it with a parse
            checklist and up to five of ten public-domain English versions. The app does not grade
            your English. A longer tutor note is available on an approved account.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-lg text-slate-800">Weak spots</h4>
          <p>
            Every graded field is remembered: in this browser for a guest, on the account once you
            sign in. The weak spots page counts repeated misses by form and links back to the verses
            they happened in.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-lg text-slate-800">Reverse Parser Mode</h4>
          <p>
            Given the parse and the Strong's number, type the Hebrew surface form into the box.
            Options let you ignore vowel points (niqqud), cantillation marks (te'amim), and the
            dagesh and shin/sin dots. Correct answers show with green borders. Click{" "}
            <strong>Reveal Verse</strong> to see all correct forms.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-lg text-slate-800">Additional Resources</h4>
          <p>
            The <strong>Grammar Guide</strong> defines every term used in parsing: prefixes, state,
            the binyanim, the conjugations, and suffixes. <strong>Morphology Charts</strong> holds
            the paradigm tables: the article, noun endings, pronouns, pronominal suffixes, the
            strong verb in each stem, and the wayyiqtol and weqatal forms. A signal card opens the
            chart its form belongs to.
          </p>
        </section>
      </div>
    </div>
  );
}
