// GRAMMAR DEFINITIONS DATA STRUCTURE
//
// This file contains Hebrew grammar definitions organized by grammatical category.
// Each category follows this structure:
//
// categoryKey: {
//   title: "Category Title",
//   items: [
//     {
//       term: "Grammar Term",
//       definition: "Detailed explanation of the term",
//       example: "Hebrew examples with transliteration and translation"
//     }
//   ]
// }
//
// Categories to include (ordered by parsing workflow):
// - generalGuide: General parsing guide (how prefixes/suffixes attach, word structure, parsing strategy)
// - partOfSpeech: Parts of speech (noun, verb, adjective, numeral, preposition, pronoun, conjunction, particle, adverb, interjection)
// - prefix: Prefixes (ב, ל, כ, מ, ו, ה, ש, interrogative ה)
// - state: Noun states (absolute, construct, determined)
// - stem: Verb stems/binyanim (Qal, Niphal, Piel, Pual, Hiphil, Hophal, Hithpael, etc.)
// - tense: Verb conjugations/tense-aspect (perfect, imperfect, imperative, infinitive, participle, etc.)
// - person: Person (first, second, third)
// - gender: Gender (masculine, feminine, common)
// - number: Number (singular, plural, dual)
// - suffix: Suffixes (pronominal suffixes, directional he, paragogic endings)

export const GRAMMAR_DEFINITIONS: Record<
  string,
  {
    title: string;
    items: Array<{
      term: string;
      definition: string;
      example: string;
    }>;
  }
> = {
  generalGuide: {
    title: "General Parsing Guide",
    items: [
      {
        term: "Word Structure",
        definition:
          "A Hebrew word can contain attached prefixes, a main root-based word (noun/verb/etc.), and sometimes attached suffixes. When parsing, mentally separate these layers before identifying morphology.",
        example:
          "וּבְבֵיתוֹ (u-vveito) = ו (and) + בְּ (in) + בֵּית (house, construct) + וֹ (his) → 'and in his house'",
      },
      {
        term: "Parsing Order",
        definition:
          "A practical order for parsing is: (1) identify any attached prefixes, (2) identify the part of speech of the main word, (3) determine state (for nouns/adjectives), (4) determine stem/binyan (for verbs), (5) determine tense/aspect, person, gender, and number, and (6) identify any suffixes.",
        example:
          "וַיֹּאמֶר (vayomer): וַ (sequential imperfect prefix) + יֹּאמֶר (3ms Qal imperfect of אמר) → verb, Qal, imperfect, 3ms",
      },
      {
        term: "Prefixes and Suffixes",
        definition:
          "Many common prepositions, conjunctions, and the article are attached as prefixes, and pronominal endings attach as suffixes. These often affect the definiteness or relationships of the word but do not change its lexical root.",
        example:
          "בַּסֵּפֶר (bas-sefer) = ב + ה + סֵפֶר → 'in the book'; סִפְרוֹ (sifro) = סֵפֶר + וֹ → 'his book'",
      },
      {
        term: "Construct Chains",
        definition:
          "When a noun is in construct state, its meaning is completed by the following noun phrase. Do not try to add 'of' to the Hebrew word itself; instead, recognize the relationship between the two nouns.",
        example:
          "דְּבַר יְהוָה (devar Adonai) = 'the word of the LORD'; רֹאשׁ הָעִיר (rosh ha-ir) = 'the head of the city'",
      },
      {
        term: "Verb Spotlight",
        definition:
          "For verbs, focus on identifying the stem/binyan from consonant patterns and prefixes, then the tense/aspect and person/gender/number from prefixes and suffixes. Context will help you decide between possible English tense translations.",
        example:
          "נִשְׁמַר (nishmar) → Niphal perfect 3ms of שׁמר, 'he was kept / he was guarded'",
      },
    ],
  },
  partOfSpeech: {
    title: "Parts of Speech",
    items: [
      {
        term: "Noun",
        definition:
          "A word that names a person, place, thing, or concept. Nouns inflect for state, number, and gender and may take pronominal suffixes.",
        example: "מֶלֶךְ (melekh) - king; סֵפֶר (sefer) - book",
      },
      {
        term: "Verb",
        definition:
          "A word that expresses action or state of being. Verbs inflect for stem/binyan, tense/aspect, person, gender, and number, and may take pronominal suffixes.",
        example:
          "כָּתַב (katav) - he wrote; יִכְתֹּב (yikhtov) - he will write / he writes",
      },
      {
        term: "Adjective",
        definition:
          "A word that describes or qualifies a noun. Adjectives normally agree with the nouns they modify in state, number, and gender.",
        example: "טוֹב (tov) - good; גָּדוֹל (gadol) - great",
      },
      {
        term: "Numeral",
        definition:
          "A word expressing number or order. Many Hebrew numerals have gender and sometimes irregular agreement patterns.",
        example:
          "שְׁנֵי (shnei) - two (construct masc.); שָׁלֹשׁ (shalosh) - three (fem.)",
      },
      {
        term: "Preposition",
        definition:
          "A word that shows relationship (place, time, means, etc.) between its object and another word. Many prepositions appear as inseparable prefixes.",
        example: "בְּ (be-) - in, with; לְ (le-) - to, for; מִן (min) - from",
      },
      {
        term: "Pronoun",
        definition:
          "A word that stands in for a noun. Pronouns may be independent forms or suffixed to nouns, prepositions, and verbs.",
        example: "הוּא (hu) - he; הִיא (hi) - she; לֹו (lo) - to him",
      },
      {
        term: "Conjunction",
        definition:
          "A word that joins words, phrases, or clauses. The most common conjunction is the prefixed ו (vav).",
        example: "וְ (ve-/u-) - and; כִּי (ki) - because, that, for",
      },
      {
        term: "Particle",
        definition:
          "A small word with specialized grammatical function or emphasis. Many particles do not inflect and can be tricky but very important for interpretation.",
        example:
          "אֶת (et) - direct object marker; הִנֵּה (hinneh) - behold; אַךְ (akh) - surely / only",
      },
      {
        term: "Adverb",
        definition:
          "A word that modifies a verb, adjective, or another adverb, expressing manner, degree, time, or place.",
        example: "מְאֹד (meod) - very; שָׁם (sham) - there",
      },
      {
        term: "Interjection",
        definition:
          "An exclamatory form expressing emotion, calling attention, or marking a discourse boundary.",
        example:
          "אוֹי (oy) - woe!; הוֹי (hoy) - alas!; הִנֵּה (hinneh) - behold!",
      },
    ],
  },
  prefix: {
    title: "Prefixes",
    items: [
      {
        term: "Prepositional Prefixes",
        definition:
          "Common prepositions that attach directly to a following word. They often combine with the article and may cause vowel and consonant changes.",
        example:
          "בְּבַיִת (be-vayit) - in a house; לַמֶּלֶךְ (la-melekh) = ל + ה + מֶלֶךְ → 'to the king'",
      },
      {
        term: "Conjunctive ו",
        definition:
          "The conjunction ו (vav) meaning 'and' typically attaches to the beginning of a word and may change its vowel depending on the following consonant.",
        example: "וְאִישׁ (ve-ish) - and a man; וּבֵן (u-ven) - and a son",
      },
      {
        term: "Definite Article ה",
        definition:
          "The article ה (ha-) is prefixed to definite nouns and adjectives. It often lengthens the following vowel and may cause doubling (dagesh forte) in the next consonant when possible.",
        example:
          "הַמֶּלֶךְ (ha-melekh) - the king; הַסֵּפֶר (ha-sefer) - the book",
      },
      {
        term: "Relative ש",
        definition:
          "The particle שֶׁ (she-) can function like a relative pronoun meaning 'who/that/which' and is often prefixed to a clause or phrase.",
        example: "הָאִישׁ שֶׁרָאָה (ha-ish she-ra'ah) - the man who saw",
      },
      {
        term: "Interrogative ה",
        definition:
          "The interrogative particle ה (ha-) attaches to the beginning of a word to mark a yes/no question. It is distinct from the article by context and vocalization.",
        example:
          "הֲתֵדְעוּ (ha-ted'u) - do you know?; הֲשָׁמַעְתָּ (ha-sham'ata) - have you heard?",
      },
    ],
  },
  state: {
    title: "Noun State",
    items: [
      {
        term: "Absolute State",
        definition:
          "The basic standalone form of a noun, not bound to another noun and not inherently definite except by context or accompanying article.",
        example: "מֶלֶךְ (melekh) - a king; סֵפֶר (sefer) - a book",
      },
      {
        term: "Construct State",
        definition:
          "A form used when a noun is bound to a following noun phrase in a genitive ('of') relationship. The construct noun usually does not take the article directly.",
        example:
          "מֶלֶךְ יִשְׂרָאֵל (melekh yisrael) - king of Israel; בֵּית הַמֶּלֶךְ (beit ha-melekh) - the house of the king",
      },
      {
        term: "Determined / Definite",
        definition:
          "A noun made definite by the article, a pronominal suffix, a proper name, or by being the first noun in a construct chain whose second noun is definite.",
        example:
          "הַמֶּלֶךְ (ha-melekh) - the king; סִפְרוֹ (sifro) - his book; דְּבַר יְהוָה (devar Adonai) - the word of the LORD",
      },
    ],
  },
  stem: {
    title: "Verb Stems (Binyanim)",
    items: [
      {
        term: "Qal",
        definition:
          "The basic simple active stem, often expressing simple action without special nuance. Many verbs appear primarily in Qal.",
        example: "כָּתַב (katav) - he wrote; שָׁמַר (shamar) - he kept/guarded",
      },
      {
        term: "Niphal",
        definition:
          "Usually the passive or reflexive counterpart of Qal, sometimes with middle or tolerative nuance.",
        example:
          "נִשְׁמַר (nishmar) - he was kept/guarded; נִכְתַּב (nikhtav) - it was written",
      },
      {
        term: "Piel",
        definition:
          "An intensive or factitive stem, often expressing repeated, intensive, or causative-like action compared to Qal.",
        example:
          "דִּבֵּר (dibber) - he spoke (intensively); קִדֵּשׁ (kiddesh) - he sanctified",
      },
      {
        term: "Pual",
        definition:
          "The passive of Piel, expressing passive intensive or factitive action.",
        example:
          "קֻדַּשׁ (kuddash) - he/it was sanctified; שֻׁמַּר (shummar) - he/it was carefully kept",
      },
      {
        term: "Hiphil",
        definition:
          "Typically causative, expressing causing someone or something to do the Qal action. Sometimes it has declarative or permissive nuances.",
        example:
          "הִכְתִּיב (hikhtiv) - he caused to write / dictated; הֶעֱמִיד (he'emid) - he caused to stand",
      },
      {
        term: "Hophal",
        definition:
          "The passive of Hiphil, expressing being caused to do or to be something.",
        example:
          "הָקְטַל (hoqtal) (pattern) - he was caused to be killed; הָעֳמַד (ho'amad) - he was caused to stand",
      },
      {
        term: "Hithpael",
        definition:
          "A reflexive or reciprocal stem, sometimes iterative or emphasizing action done to or for oneself.",
        example:
          "הִתְפַּלֵּל (hitpallel) - he prayed (literally 'he judged himself'); הִתְהַלֵּךְ (hithallekh) - he walked about",
      },
      {
        term: "Other Rare Stems",
        definition:
          "Less common binyanim (Poel, Polel, Pilpel, Hithpolel, etc.) that follow similar patterns of intensity or iteration. In parsing, note that they often resemble Piel/Hithpael patterns.",
        example:
          "פִּרְפֵּר (pirper) - he fluttered (Pilpel); מְפֹרָר (meforar) - crumbled (Poel/Pual pattern)",
      },
    ],
  },
  tense: {
    title: "Verb Conjugations (Tense/Aspect)",
    items: [
      {
        term: "Perfect (Qatal)",
        definition:
          "Suffix conjugation, often expressing completed action (frequently past), or a state viewed as complete. Context can give present or future nuances.",
        example:
          "כָּתַב (katav) - he wrote / has written; שָׁמַר (shamar) - he kept",
      },
      {
        term: "Imperfect (Yiqtol)",
        definition:
          "Prefix conjugation, often expressing incomplete, ongoing, habitual, or future action. Context determines whether it is future, present, or modal.",
        example:
          "יִכְתֹּב (yikhtov) - he will write / he writes; יִשְׁמֹר (yishmor) - he will keep",
      },
      {
        term: "Wayyiqtol (Sequential Imperfect)",
        definition:
          "Imperfect form prefixed with וַ (vav-consecutive), frequently used in narrative to advance past-time events in sequence.",
        example:
          "וַיֹּאמֶר (vayomer) - and he said; וַיֵּלֶךְ (vayelekh) - and he went",
      },
      {
        term: "Weqatal (Sequential Perfect)",
        definition:
          "Perfect form joined with וְ (vav) functioning in sequences (especially after imperatives, jussives, or in prophetic style) with future or modal force.",
        example:
          "וְכָתַבְתָּ (ve-khatavta) - and you shall write; וְהָיָה (ve-hayah) - and it shall be",
      },
      {
        term: "Imperative",
        definition:
          "A command form used with second person only. Often related in form to the imperfect without preformatives.",
        example: "כְּתֹב (ketov) - write! (ms); שְׁמֹר (shemor) - guard! (ms)",
      },
      {
        term: "Cohortative and Jussive",
        definition:
          "Special modal forms of the imperfect expressing desire, wish, or mild command. Cohortative is first person; jussive is usually third (and sometimes second) person.",
        example:
          "אֶכְתְּבָה (echt'vah) - let me write; יִכְתֹּב (yikhtov) in jussive context - let him write",
      },
      {
        term: "Infinitive Construct and Absolute",
        definition:
          "Verbal noun forms. The construct form behaves like a noun and often follows prepositions; the absolute form can intensify or emphasize an accompanying finite verb.",
        example:
          "לִכְתֹּב (likhtov) - to write; כָּתוֹב תִּכְתֹּב (katov tikhtov) - you shall surely write",
      },
      {
        term: "Participle",
        definition:
          "A verbal adjective functioning as an adjective, noun, or verb expressing ongoing or habitual action. Participles inflect for gender and number.",
        example:
          "כֹּתֵב (kotev) - writing, one who writes; שֹׁמֵר (shomer) - guarding, one who guards",
      },
    ],
  },
  person: {
    title: "Person",
    items: [
      {
        term: "First Person",
        definition:
          "Refers to the speaker or speakers: 'I' (singular) or 'we' (plural). In verbs and pronouns, forms labeled first person indicate the subject is speaking.",
        example:
          "כָּתַבְתִּי (katavti) - I wrote; כָּתַבְנוּ (katavnu) - we wrote",
      },
      {
        term: "Second Person",
        definition:
          "Refers to the person or people addressed: 'you' (singular or plural, masculine or feminine). Second person forms mark direct address.",
        example:
          "כָּתַבְתָּ (katavta) - you wrote (ms); כְּתֹב (ketov) - write! (ms)",
      },
      {
        term: "Third Person",
        definition:
          "Refers to the person or thing being spoken about: 'he', 'she', 'it', or 'they'. Third person forms are very common in narrative.",
        example:
          "כָּתַב (katav) - he wrote; כָּתְבָה (katvah) - she wrote; כָּתְבוּ (katvu) - they wrote",
      },
    ],
  },
  gender: {
    title: "Gender",
    items: [
      {
        term: "Masculine",
        definition:
          "Grammatical gender used for many nouns, pronouns, and verb forms, often but not always referring to male beings or grammatically masculine nouns.",
        example:
          "מֶלֶךְ (melekh) - king; טוֹב (tov) - good (ms); כָּתַב (katav) - he wrote",
      },
      {
        term: "Feminine",
        definition:
          "Grammatical gender used for many nouns, pronouns, and verb forms, often but not always referring to female beings. Many feminine nouns end in ־ה or ־ת, but there are many exceptions.",
        example:
          "מַלְכָּה (malkah) - queen; טוֹבָה (tovah) - good (fs); כָּתְבָה (katvah) - she wrote",
      },
      {
        term: "Common",
        definition:
          "A form that can function for either masculine or feminine, especially in some pronouns, participles, and numerals. Context clarifies the actual referent.",
        example:
          "אֲנִי (ani) - I (common); כֹּתֵב (kotev) used generically - one who writes",
      },
    ],
  },
  number: {
    title: "Number",
    items: [
      {
        term: "Singular",
        definition:
          "Refers to one person, thing, or collective entity. Most dictionary forms are singular.",
        example: "מֶלֶךְ (melekh) - a king; כָּתַב (katav) - he wrote",
      },
      {
        term: "Plural",
        definition:
          "Refers to more than one person or thing. Plural nouns and verbs often use characteristic endings, though many patterns exist.",
        example: "מְלָכִים (melakhim) - kings; כָּתְבוּ (katvu) - they wrote",
      },
      {
        term: "Dual",
        definition:
          "A special number primarily used for naturally paired items and some measures of time. It is often marked by the ending ־ַיִם.",
        example:
          "יָדַיִם (yadayim) - (two) hands; יוֹמַיִם (yomayim) - (two) days",
      },
    ],
  },
  suffix: {
    title: "Suffixes",
    items: [
      {
        term: "Pronominal Suffixes on Nouns",
        definition:
          "Pronoun endings attached to nouns to express possession or close relationship (my, your, his, etc.). These make the noun definite and count as a form of determination.",
        example:
          "סִפְרוֹ (sifro) - his book; סִפְרֵנוּ (sifrenu) - our book; סִפְרְכֶם (sifrekhem) - your (mp) book",
      },
      {
        term: "Pronominal Suffixes on Prepositions",
        definition:
          "Pronoun endings attached to prepositions expressing the object of the preposition (to me, in you, with them, etc.).",
        example:
          "לִי (li) - to me; בְּךָ (bekha) - in you (ms); עֲלֵיהֶם (aleihem) - upon them (mp)",
      },
      {
        term: "Pronominal Suffixes on Verbs",
        definition:
          "Pronoun endings attached to verbs typically express a direct object (him, her, them) or sometimes an indirect object, depending on the verb and construction.",
        example:
          "כְּתָבָם (ketavam) - he wrote them; שְׁמָרָם (shemaram) - he guarded them",
      },
      {
        term: "Directional ה (He Locale)",
        definition:
          "A final ה added to some place names and nouns indicating motion toward (to, toward) that place. It does not change the basic lexical meaning but adds directional nuance.",
        example:
          "יִרְמָה (yirmāh) pattern: צִיּוֹנָה (Tziyyonah) - to Zion; הָעִירָה (ha-irah) - to the city",
      },
      {
        term: "Paragogic Endings",
        definition:
          "Final letters (often נ or ה) added to some verb forms without changing basic person/number/gender, sometimes adding emphasis, stylistic elevation, or poetic flavor.",
        example:
          "כְּתֹבְנָה (ketovnah) - they (f.) shall write / write! (with paragogic nun-he); עֲשֶׂה (aseh) vs. עֲשֵׂה (aseh with paragogic nuance)",
      },
    ],
  },
};
