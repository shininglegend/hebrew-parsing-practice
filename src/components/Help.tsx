export function Help() {
  return (
    <div className="prose prose-slate max-w-none">
      <h3 className="text-2xl font-bold mb-4 text-slate-800">
        How to Use This Site
      </h3>

      <div className="space-y-4 text-slate-700">
        <section>
          <h4 className="font-semibold text-lg text-slate-800">
            Getting Started
          </h4>
          <p>
            Select a Bible verse using the book, chapter, and verse dropdowns,
            then click <strong>Load Verse</strong>. The verse will appear in
            Greek with each word ready for parsing practice.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-lg text-slate-800">
            Parser Drill Mode
          </h4>
          <p>
            For each Greek word, expand the section using the + icon, then
            select the correct grammatical features from the dropdown menus
            (part of speech, case, number, etc.). Your selections are checked in
            real-time—correct answers show green borders, incorrect ones remain
            white. Toggle words on/off using the checkboxes in the verse display
            to focus on specific words. Your score appears below showing how
            many fields you got correct.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-lg text-slate-800">
            Reverse Parser Mode
          </h4>
          <p>
            Given the grammatical information and lemma, type the correct Greek
            surface form into the input box. You can toggle options to ignore
            accents, breathing marks, or case sensitivity. Correct answers show
            with green borders. Click <strong>Reveal Answers</strong> to see all
            correct forms.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-lg text-slate-800">
            Additional Resources
          </h4>
          <p>
            Use the <strong>Morphology Charts</strong> button to view noun
            declension and verb conjugation paradigms. The{" "}
            <strong>Grammar Guide</strong> button provides definitions and
            examples for all grammatical terms used in parsing.
          </p>
        </section>
      </div>
    </div>
  );
}
