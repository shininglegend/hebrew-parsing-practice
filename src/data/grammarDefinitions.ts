export const GRAMMAR_DEFINITIONS = {
  partOfSpeech: {
    title: "Parts of Speech",
    items: [
      {
        term: "Noun",
        definition:
          "A word that names a person, place, thing, or idea. In Biblical Hebrew, nouns are inflected for state, number, and gender.",
        example: "אָדָם (adam) - man, human; מֶלֶךְ (melekh) - king",
      },
      {
        term: "Verb",
        definition:
          "A word that expresses action or state of being. Hebrew verbs are inflected for stem (binyan), tense/aspect, person, gender, and number.",
        example: "כָּתַב (katav) - he wrote; יִכְתֹּב (yikhtov) - he will write",
      },
      {
        term: "Adjective",
        definition:
          "A word that modifies or describes a noun. Hebrew adjectives agree with the nouns they modify in state, number, and gender.",
        example: "טוֹב (tov) - good; גָּדוֹל (gadol) - great",
      },
      {
        term: "Adverb",
        definition:
          "A word that modifies a verb, adjective, or another adverb. Hebrew adverbs are typically invariable.",
        example: "מְאֹד (meod) - very, much",
      },
      {
        term: "Preposition",
        definition:
          "A word that shows the relationship between a noun (or pronoun) and other words in a sentence. Many Hebrew prepositions are prefixed directly to words.",
        example: "בְּ (be-) - in, with; לְ (le-) - to, for; מִן (min) - from",
      },
      {
        term: "Pronoun",
        definition:
          "A word that takes the place of a noun. Hebrew pronouns can be independent, suffixed, or demonstrative.",
        example: "אֲנִי (ani) - I; הוּא (hu) - he; זֶה (zeh) - this",
      },
      {
        term: "Conjunction",
        definition:
          "A word that connects words, phrases, or clauses. The most common is the prefix vav (וְ).",
        example: "וְ (ve-) - and; כִּי (ki) - because, that, for",
      },
      {
        term: "Particle",
        definition:
          "A small word that adds nuance, emphasis, or grammatical function to a sentence.",
        example: "אֶת (et) - direct object marker; הֲ (ha-) - interrogative particle",
      },
      {
        term: "Article",
        definition:
          "The definite article in Hebrew, always prefixed as ה (ha-). There is no indefinite article.",
        example: "הַמֶּלֶךְ (ha-melekh) - the king",
      },
      {
        term: "Interjection",
        definition:
          "An exclamatory word expressing emotion or calling attention.",
        example: "הִנֵּה (hinneh) - behold!; אוֹי (oy) - woe!",
      },
    ],
  },
  state: {
    title: "Noun States",
    items: [
      {
        term: "Absolute",
        definition:
          "The basic, standalone form of a noun. Used when the noun is not in a construct relationship or definiteness.",
        example: "מֶלֶךְ (melekh) - a king",
      },
      {
        term: "Construct",
        definition:
          "A shortened form used in a bound relationship with another noun, showing possession, relationship, or specification. Often translated with 'of'.",
        example: "מֶלֶךְ יִשְׂרָאֵל (melekh yisrael) - king of Israel",
      },
      {
        term: "Determined",
        definition:
          "A noun made definite by the article ה (ha-), a possessive suffix, or being in construct with a determined noun.",
        example: "הַמֶּלֶךְ (ha-melekh) - the king",
      },
    ],
  },
  number: {
    title: "Number",
    items: [
      {
        term: "Singular",
        definition: "Refers to one person or thing.",
        example: "מֶלֶךְ (melekh) - a king (one)",
      },
      {
        term: "Plural",
        definition: "Refers to more than one person or thing.",
        example: "מְלָכִים (melakhim) - kings (more than one)",
      },
      {
        term: "Dual",
        definition: "Refers to two of something, especially paired body parts and measures of time.",
        example: "יָדַיִם (yadayim) - two hands; יוֹמַיִם (yomayim) - two days",
      },
    ],
  },
  gender: {
    title: "Gender",
    items: [
      {
        term: "Masculine",
        definition:
          "Grammatical gender typically (but not always) used for male persons and certain nouns. Most Hebrew nouns are masculine.",
        example: "אָב (av) - father; יוֹם (yom) - day",
      },
      {
        term: "Feminine",
        definition:
          "Grammatical gender typically (but not always) used for female persons and certain nouns. Often (but not always) ends in ה- or ת-.",
        example: "אֵם (em) - mother; תּוֹרָה (torah) - law, instruction",
      },
      {
        term: "Common",
        definition:
          "A gender that can be either masculine or feminine, typically used for certain pronouns and numbers.",
        example: "אַתָּה/אַתְּ (atah/at) - you (m/f); שְׁנַיִם (shnayim) - two",
      },
    ],
  },
  stem: {
    title: "Verb Stems (Binyanim)",
    items: [
      {
        term: "Qal",
        definition:
          "The simple, active stem. The basic, unmarked form of the verb expressing simple action.",
        example: "כָּתַב (katav) - he wrote; שָׁמַר (shamar) - he kept/guarded",
      },
      {
        term: "Niphal",
        definition:
          "Often passive or reflexive of Qal. Can also express middle voice or tolerative meanings.",
        example: "נִכְתַּב (nikhtav) - it was written; נִשְׁמַר (nishmar) - he was kept/guarded",
      },
      {
        term: "Piel",
        definition:
          "Often intensifies or makes the action causative. Can express repeated or extensive action.",
        example: "כִּתֵּב (kittev) - he inscribed (intensive writing)",
      },
      {
        term: "Pual",
        definition:
          "The passive of Piel. Expresses passive intensive or causative action.",
        example: "כֻּתַּב (kuttav) - it was inscribed (passive intensive)",
      },
      {
        term: "Hiphil",
        definition:
          "The causative stem. Expresses causing someone or something to do the action.",
        example: "הִכְתִּיב (hikhtiv) - he caused to write, he dictated",
      },
      {
        term: "Hophal",
        definition:
          "The passive of Hiphil. Expresses being caused to do the action.",
        example: "הָכְתַּב (hokhtav) - it was caused to be written",
      },
      {
        term: "Hithpael",
        definition:
          "Reflexive or reciprocal stem. Can express iterative or habitual action.",
        example: "הִתְכַּתֵּב (hitkattev) - he corresponded (reflexive/reciprocal)",
      },
    ],
  },
  tense: {
    title: "Verb Conjugations (Tense/Aspect)",
    items: [
      {
        term: "Perfect",
        definition:
          "Expresses completed action, often in the past. Emphasizes the state resulting from a completed action. Sometimes called 'suffix conjugation' (qatal).",
        example: "כָּתַב (katav) - he wrote, he has written",
      },
      {
        term: "Imperfect",
        definition:
          "Expresses incomplete, ongoing, or future action. Can indicate habitual, repeated, or potential action. Sometimes called 'prefix conjugation' (yiqtol).",
        example: "יִכְתֹּב (yikhtov) - he will write, he writes, he was writing",
      },
      {
        term: "Imperative",
        definition:
          "Expresses direct commands. Used for second person only (you/you all).",
        example: "כְּתֹב (ketov) - write! (masculine singular)",
      },
      {
        term: "Infinitive",
        definition:
          "Verbal noun forms. Two types: infinitive construct (לִכְתֹּב) and infinitive absolute (כָּתוֹב). Used in various syntactic constructions.",
        example: "לִכְתֹּב (likhtov) - to write; כָּתוֹב (katov) - writing (absolute)",
      },
      {
        term: "Participle",
        definition:
          "Verbal adjective that can function as a noun, adjective, or express ongoing action. Inflects for gender and number.",
        example: "כֹּתֵב (kotev) - writing, one who writes (masc. sing.)",
      },
    ],
  },
  person: {
    title: "Person",
    items: [
      {
        term: "First Person",
        definition: "The speaker or writer. 'I' (singular) or 'we' (plural).",
        example: "כָּתַבְתִּי (katavti) - I wrote; כָּתַבְנוּ (katavnu) - we wrote",
      },
      {
        term: "Second Person",
        definition:
          "The person(s) being addressed. 'You' (masculine/feminine, singular/plural).",
        example: "כָּתַבְתָּ (katavta) - you wrote (m.); כָּתַבְתְּ (katavt) - you wrote (f.)",
      },
      {
        term: "Third Person",
        definition:
          "The person(s) or thing(s) being spoken about. 'He/she/it' (singular) or 'they' (plural).",
        example: "כָּתַב (katav) - he wrote; כָּתְבָה (katva) - she wrote",
      },
    ],
  },
};
