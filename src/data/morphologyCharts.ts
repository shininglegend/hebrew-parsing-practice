// Hebrew morphology reference charts, shown in the Morphology Charts modal and opened from
// signal cards (chartFor in signals.ts picks the key).
//
// Generated from a verified spec: every form was checked against the Open Scriptures Hebrew
// Bible data in public/hebrew-data, either as the exact pointed form (nouns, pronouns,
// article, suffixes) or, for the strong-verb paradigm, with real strong roots substituted for
// the textbook root קטל and the morph code required to match. Cells that are rare in the
// Bible (most 2nd/3rd feminine plurals, much of pual and hophal) follow the standard
// paradigm (Pratico & Van Pelt; Ross; unfoldingWord Hebrew Grammar).
//
// Each chart: { title, tables: [{ subtitle?, headers, rows }] }. The first cell of a row is
// its label and must be unique within the table (it is the React key).

export type MorphologyChart = {
  title: string;
  tables: Array<{
    subtitle?: string;
    headers: string[];
    rows: string[][];
  }>;
};

export const MORPHOLOGY_CHARTS = {
  article: {
    title: "Definite Article",
    tables: [
      {
        subtitle: "The article is הַ plus a doubling dagesh in the next letter",
        headers: ["Before", "Article", "Example", "Meaning"],
        rows: [
          ["ס (any regular letter; it takes the dagesh)", "הַ", "הַסּוּס", "the horse"],
          ["מ (any regular letter; it takes the dagesh)", "הַ", "הַמֶּלֶךְ", "the king"],
          ["יְ (the dagesh usually drops)", "הַ", "הַיְלָדִים", "the children"],
        ],
      },
      {
        subtitle:
          "Gutturals and ר cannot take the doubling dagesh, so the vowel of the article changes instead",
        headers: ["Before", "Article", "Example", "Meaning"],
        rows: [
          ["א", "הָ", "הָאִישׁ", "the man"],
          ["ע", "הָ", "הָעִיר", "the city"],
          ["ר", "הָ", "הָרֹאשׁ", "the head"],
          ["ה", "הַ", "הַהֵיכָל", "the palace"],
          ["ח", "הַ", "הַחֹשֶׁךְ", "the darkness"],
          ["unaccented הָ", "הֶ", "הֶהָרִים", "the mountains"],
          ["unaccented עָ", "הֶ", "הֶעָפָר", "the dust"],
          ["any חָ", "הֶ", "הֶחָכָם", "the wise man"],
        ],
      },
      {
        subtitle:
          "After an inseparable preposition the ה disappears and its vowel stays on the preposition",
        headers: ["Prefix", "Becomes", "Example", "Meaning"],
        rows: [
          ["בְּ + הַ", "בַּ", "בַּשָּׁמַיִם", "in the heavens"],
          ["לְ + הַ", "לַ", "לַמֶּלֶךְ", "to the king"],
          ["כְּ + הַ", "כַּ", "כַּיּוֹם", "like the day"],
          ["לְ + הָ", "לָ", "לָאָרֶץ", "to the land"],
        ],
      },
    ],
  },
  nouns: {
    title: "Noun Endings",
    tables: [
      {
        subtitle: "Masculine: סוּס (horse) and דָּבָר (word, with vowel reduction)",
        headers: ["Form", "סוּס", "דָּבָר", "Ending"],
        rows: [
          ["sing. absolute", "סוּס", "דָּבָר", "no ending"],
          ["sing. construct", "סוּס", "דְּבַר", "no ending; vowels shorten"],
          ["plur. absolute", "סוּסִים", "דְּבָרִים", "◌ִים"],
          ["plur. construct", "סוּסֵי", "דִּבְרֵי", "◌ֵי"],
        ],
      },
      {
        subtitle: "Feminine: בְּרָכָה (blessing) and תּוֹרָה (law)",
        headers: ["Form", "בְּרָכָה", "תּוֹרָה", "Ending"],
        rows: [
          ["sing. absolute", "בְּרָכָה", "תּוֹרָה", "◌ָה"],
          ["sing. construct", "בִּרְכַּת", "תּוֹרַת", "◌ַת"],
          ["plur. absolute", "בְּרָכוֹת", "תּוֹרֹת", "וֹת"],
          ["plur. construct (same as absolute)", "בִּרְכוֹת", "תּוֹרֹת", "וֹת"],
        ],
      },
      {
        subtitle: "Segholate: מֶלֶךְ (king); the plural stem changes",
        headers: ["Form", "מֶלֶךְ", "Ending"],
        rows: [
          ["sing. absolute", "מֶלֶךְ", "no ending"],
          ["sing. construct", "מֶלֶךְ", "unchanged"],
          ["plur. absolute", "מְלָכִים", "◌ִים"],
          ["plur. construct", "מַלְכֵי", "◌ֵי"],
        ],
      },
      {
        subtitle: "Dual: paired body parts and some units of time",
        headers: ["Form", "יָד (hand)", "עַיִן (eye)", "יוֹם (day)"],
        rows: [
          ["singular", "יָד", "עַיִן", "יוֹם"],
          ["dual absolute, ending ◌ַיִם", "יָדַיִם", "עֵינַיִם", "יוֹמַיִם"],
          ["dual construct, ending ◌ֵי", "יְדֵי", "עֵינֵי", "—"],
        ],
      },
    ],
  },
  pronouns: {
    title: "Independent Personal Pronouns",
    tables: [
      {
        subtitle: "Singular",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["1st common", "אֲנִי / אָנֹכִי", "I"],
          ["2nd masc.", "אַתָּה", "you (m.)"],
          ["2nd fem.", "אַתְּ", "you (f.)"],
          ["3rd masc.", "הוּא", "he / it"],
          ["3rd fem.", "הִיא", "she / it"],
        ],
      },
      {
        subtitle: "Plural",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["1st common", "אֲנַחְנוּ", "we"],
          ["2nd masc.", "אַתֶּם", "you (m. pl.)"],
          ["2nd fem.", "אַתֶּן / אַתֵּנָה", "you (f. pl.)"],
          ["3rd masc.", "הֵם / הֵמָּה", "they (m.)"],
          ["3rd fem.", "הֵנָּה", "they (f.)"],
        ],
      },
    ],
  },
  suffixesNouns: {
    title: "Suffixes on Nouns",
    tables: [
      {
        subtitle: "On a singular noun: סוּס (horse)",
        headers: ["Suffix", "Hebrew", "Meaning"],
        rows: [
          ["1st common sing.", "סוּסִי", "my horse"],
          ["2nd masc. sing.", "סוּסְךָ", "your (m.) horse"],
          ["2nd fem. sing.", "סוּסֵךְ", "your (f.) horse"],
          ["3rd masc. sing.", "סוּסוֹ", "his horse"],
          ["3rd fem. sing.", "סוּסָהּ", "her horse"],
          ["1st common plur.", "סוּסֵנוּ", "our horse"],
          ["2nd masc. plur.", "סוּסְכֶם", "your (m. pl.) horse"],
          ["2nd fem. plur.", "סוּסְכֶן", "your (f. pl.) horse"],
          ["3rd masc. plur.", "סוּסָם", "their (m.) horse"],
          ["3rd fem. plur.", "סוּסָן", "their (f.) horse"],
        ],
      },
      {
        subtitle: "On a plural noun: סוּסִים (horses); the yod of the plural stays",
        headers: ["Suffix", "Hebrew", "Meaning"],
        rows: [
          ["1st common sing.", "סוּסַי", "my horses"],
          ["2nd masc. sing.", "סוּסֶיךָ", "your (m.) horses"],
          ["2nd fem. sing.", "סוּסַיִךְ", "your (f.) horses"],
          ["3rd masc. sing.", "סוּסָיו", "his horses"],
          ["3rd fem. sing.", "סוּסֶיהָ", "her horses"],
          ["1st common plur.", "סוּסֵינוּ", "our horses"],
          ["2nd masc. plur.", "סוּסֵיכֶם", "your (m. pl.) horses"],
          ["2nd fem. plur.", "סוּסֵיכֶן", "your (f. pl.) horses"],
          ["3rd masc. plur.", "סוּסֵיהֶם", "their (m.) horses"],
          ["3rd fem. plur.", "סוּסֵיהֶן", "their (f.) horses"],
        ],
      },
    ],
  },
  suffixesPrepositions: {
    title: "Suffixes on Prepositions",
    tables: [
      {
        subtitle: "לְ (to, for), בְּ (in, with), and the object marker אֵת",
        headers: ["Suffix", "לְ (to)", "בְּ (in)", "אֵת (object)", "Pronoun"],
        rows: [
          ["1st common sing.", "לִי", "בִּי", "אֹתִי", "me"],
          ["2nd masc. sing.", "לְךָ", "בְּךָ", "אֹתְךָ", "you (m.)"],
          ["2nd fem. sing.", "לָךְ", "בָּךְ", "אֹתָךְ", "you (f.)"],
          ["3rd masc. sing.", "לוֹ", "בּוֹ", "אֹתוֹ", "him"],
          ["3rd fem. sing.", "לָהּ", "בָּהּ", "אֹתָהּ", "her"],
          ["1st common plur.", "לָנוּ", "בָּנוּ", "אֹתָנוּ", "us"],
          ["2nd masc. plur.", "לָכֶם", "בָּכֶם", "אֶתְכֶם", "you (m. pl.)"],
          ["2nd fem. plur.", "לָכֶן", "בָּכֶן", "אֶתְכֶן", "you (f. pl.)"],
          ["3rd masc. plur.", "לָהֶם", "בָּהֶם", "אֹתָם", "them (m.)"],
          ["3rd fem. plur.", "לָהֶן", "בָּהֶן", "אֹתָן", "them (f.)"],
        ],
      },
    ],
  },
  qal: {
    title: "Qal (simple active)",
    tables: [
      {
        subtitle: "Perfect (qatal): קָטַל — he killed",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "קָטַל", "he killed"],
          ["3rd fem. sing.", "קָטְלָה", "she killed"],
          ["2nd masc. sing.", "קָטַלְתָּ", "you (m.) killed"],
          ["2nd fem. sing.", "קָטַלְתְּ", "you (f.) killed"],
          ["1st common sing.", "קָטַלְתִּי", "I killed"],
          ["3rd common plur.", "קָטְלוּ", "they killed"],
          ["2nd masc. plur.", "קְטַלְתֶּם", "you (m. pl.) killed"],
          ["2nd fem. plur.", "קְטַלְתֶּן", "you (f. pl.) killed"],
          ["1st common plur.", "קָטַלְנוּ", "we killed"],
        ],
      },
      {
        subtitle: "Imperfect (yiqtol): יִקְטֹל — he will kill",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "יִקְטֹל", "he will kill"],
          ["3rd fem. sing.", "תִּקְטֹל", "she will kill"],
          ["2nd masc. sing.", "תִּקְטֹל", "you (m.) will kill"],
          ["2nd fem. sing.", "תִּקְטְלִי", "you (f.) will kill"],
          ["1st common sing.", "אֶקְטֹל", "I will kill"],
          ["3rd masc. plur.", "יִקְטְלוּ", "they (m.) will kill"],
          ["3rd fem. plur.", "תִּקְטֹלְנָה", "they (f.) will kill"],
          ["2nd masc. plur.", "תִּקְטְלוּ", "you (m. pl.) will kill"],
          ["2nd fem. plur.", "תִּקְטֹלְנָה", "you (f. pl.) will kill"],
          ["1st common plur.", "נִקְטֹל", "we will kill"],
        ],
      },
      {
        subtitle: "Imperative",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["2nd masc. sing.", "קְטֹל", "kill! (to a man)"],
          ["2nd fem. sing.", "קִטְלִי", "kill! (to a woman)"],
          ["2nd masc. plur.", "קִטְלוּ", "kill! (to men)"],
          ["2nd fem. plur.", "קְטֹלְנָה", "kill! (to women)"],
        ],
      },
      {
        subtitle: "Infinitives and participles",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["infinitive construct", "קְטֹל", "to kill"],
          ["infinitive absolute", "קָטוֹל", "killing (emphatic)"],
          ["cohortative 1st sing.", "אֶקְטְלָה", "let me kill"],
          ["cohortative 1st plur.", "נִקְטְלָה", "let us kill"],
          [
            "jussive 3rd masc. sing.",
            "יִקְטֹל",
            "let him kill (same as imperfect in the strong verb)",
          ],
          ["active participle masc. sing.", "קֹטֵל", "killing (active participle)"],
          ["active participle fem. sing.", "קֹטֶלֶת", "killing (active participle)"],
          ["active participle masc. plur.", "קֹטְלִים", "killing (active participle)"],
          ["active participle fem. plur.", "קֹטְלוֹת", "killing (active participle)"],
          ["passive participle masc. sing.", "קָטוּל", "killed (passive participle)"],
          ["passive participle fem. sing.", "קְטוּלָה", "killed (passive participle)"],
          ["passive participle masc. plur.", "קְטוּלִים", "killed (passive participle)"],
          ["passive participle fem. plur.", "קְטוּלוֹת", "killed (passive participle)"],
        ],
      },
      {
        subtitle: "Stative verbs take ē or ō in the perfect and a in the imperfect",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["perfect 3rd masc. sing. (ē)", "זָקֵן", "he is old"],
          ["perfect 3rd masc. sing. (ō)", "יָכֹל", "he is able"],
          ["perfect 1st common sing.", "קָטֹנְתִּי", "I am small"],
          ["imperfect 3rd masc. sing. of כבד (a)", "יִכְבַּד", "he will be heavy"],
          ["imperfect 3rd masc. sing. of גדל (a)", "יִגְדַּל", "he will be great"],
        ],
      },
    ],
  },
  sequential: {
    title: "Wayyiqtol and Weqatal",
    tables: [
      {
        subtitle: "Sequential imperfect (wayyiqtol): וַ + dagesh + imperfect; וָ before א",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "וַיִּקְטֹל", "and he killed"],
          ["3rd fem. sing.", "וַתִּקְטֹל", "and she killed"],
          ["2nd masc. sing.", "וַתִּקְטֹל", "and you (m.) killed"],
          ["2nd fem. sing.", "וַתִּקְטְלִי", "and you (f.) killed"],
          ["1st common sing.", "וָאֶקְטֹל", "and I killed"],
          ["3rd masc. plur.", "וַיִּקְטְלוּ", "and they (m.) killed"],
          ["3rd fem. plur.", "וַתִּקְטֹלְנָה", "and they (f.) killed"],
          ["2nd masc. plur.", "וַתִּקְטְלוּ", "and you (m. pl.) killed"],
          ["2nd fem. plur.", "וַתִּקְטֹלְנָה", "and you (f. pl.) killed"],
          ["1st common plur.", "וַנִּקְטֹל", "and we killed"],
        ],
      },
      {
        subtitle: "Sequential perfect (weqatal): וְ + perfect, accent on the last syllable",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "וְקָטַל", "and he will kill"],
          ["3rd fem. sing.", "וְקָטְלָה", "and she will kill"],
          ["2nd masc. sing.", "וְקָטַלְתָּ", "and you (m.) will kill"],
          ["2nd fem. sing.", "וְקָטַלְתְּ", "and you (f.) will kill"],
          ["1st common sing.", "וְקָטַלְתִּי", "and I will kill"],
          ["3rd common plur.", "וְקָטְלוּ", "and they will kill"],
          ["2nd masc. plur.", "וּקְטַלְתֶּם", "and you (m. pl.) will kill"],
          ["2nd fem. plur.", "וּקְטַלְתֶּן", "and you (f. pl.) will kill"],
          ["1st common plur.", "וְקָטַלְנוּ", "and we will kill"],
        ],
      },
      {
        subtitle: "Wayyiqtol in the other stems (3rd masc. sing.)",
        headers: ["Stem", "Hebrew", "Meaning"],
        rows: [
          ["niphal", "וַיִּקָּטֵל", "and he was killed"],
          ["piel", "וַיְקַטֵּל", "and he slaughtered"],
          ["hiphil (short form)", "וַיַּקְטֵל", "and he caused to kill"],
          ["hithpael", "וַיִּתְקַטֵּל", "and he killed himself"],
        ],
      },
    ],
  },
  niphal: {
    title: "Niphal (passive or reflexive)",
    tables: [
      {
        subtitle: "Perfect (qatal): נִקְטַל — he was killed",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "נִקְטַל", "he was killed"],
          ["3rd fem. sing.", "נִקְטְלָה", "she was killed"],
          ["2nd masc. sing.", "נִקְטַלְתָּ", "you (m.) was killed"],
          ["2nd fem. sing.", "נִקְטַלְתְּ", "you (f.) was killed"],
          ["1st common sing.", "נִקְטַלְתִּי", "I was killed"],
          ["3rd common plur.", "נִקְטְלוּ", "they was killed"],
          ["2nd masc. plur.", "נִקְטַלְתֶּם", "you (m. pl.) was killed"],
          ["2nd fem. plur.", "נִקְטַלְתֶּן", "you (f. pl.) was killed"],
          ["1st common plur.", "נִקְטַלְנוּ", "we was killed"],
        ],
      },
      {
        subtitle: "Imperfect (yiqtol): יִקָּטֵל — he will be killed",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "יִקָּטֵל", "he will be killed"],
          ["3rd fem. sing.", "תִּקָּטֵל", "she will be killed"],
          ["2nd masc. sing.", "תִּקָּטֵל", "you (m.) will be killed"],
          ["2nd fem. sing.", "תִּקָּטְלִי", "you (f.) will be killed"],
          ["1st common sing.", "אֶקָּטֵל", "I will be killed"],
          ["3rd masc. plur.", "יִקָּטְלוּ", "they (m.) will be killed"],
          ["3rd fem. plur.", "תִּקָּטַלְנָה", "they (f.) will be killed"],
          ["2nd masc. plur.", "תִּקָּטְלוּ", "you (m. pl.) will be killed"],
          ["2nd fem. plur.", "תִּקָּטַלְנָה", "you (f. pl.) will be killed"],
          ["1st common plur.", "נִקָּטֵל", "we will be killed"],
        ],
      },
      {
        subtitle: "Imperative",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["2nd masc. sing.", "הִקָּטֵל", "be killed! (to a man)"],
          ["2nd fem. sing.", "הִקָּטְלִי", "be killed! (to a woman)"],
          ["2nd masc. plur.", "הִקָּטְלוּ", "be killed! (to men)"],
          ["2nd fem. plur.", "הִקָּטַלְנָה", "be killed! (to women)"],
        ],
      },
      {
        subtitle: "Infinitives and participles",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["infinitive construct", "הִקָּטֵל", "to be killed"],
          ["infinitive absolute", "נִקְטֹל / הִקָּטֵל", "being killed (emphatic)"],
          ["participle masc. sing.", "נִקְטָל", "being killed (participle)"],
          ["participle fem. sing.", "נִקְטָלָה", "being killed (participle)"],
          ["participle masc. plur.", "נִקְטָלִים", "being killed (participle)"],
          ["participle fem. plur.", "נִקְטָלוֹת", "being killed (participle)"],
        ],
      },
    ],
  },
  piel: {
    title: "Piel (intensive or factitive)",
    tables: [
      {
        subtitle: "Perfect (qatal): קִטֵּל — he slaughtered",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "קִטֵּל", "he slaughtered"],
          ["3rd fem. sing.", "קִטְּלָה", "she slaughtered"],
          ["2nd masc. sing.", "קִטַּלְתָּ", "you (m.) slaughtered"],
          ["2nd fem. sing.", "קִטַּלְתְּ", "you (f.) slaughtered"],
          ["1st common sing.", "קִטַּלְתִּי", "I slaughtered"],
          ["3rd common plur.", "קִטְּלוּ", "they slaughtered"],
          ["2nd masc. plur.", "קִטַּלְתֶּם", "you (m. pl.) slaughtered"],
          ["2nd fem. plur.", "קִטַּלְתֶּן", "you (f. pl.) slaughtered"],
          ["1st common plur.", "קִטַּלְנוּ", "we slaughtered"],
        ],
      },
      {
        subtitle: "Imperfect (yiqtol): יְקַטֵּל — he will slaughter",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "יְקַטֵּל", "he will slaughter"],
          ["3rd fem. sing.", "תְּקַטֵּל", "she will slaughter"],
          ["2nd masc. sing.", "תְּקַטֵּל", "you (m.) will slaughter"],
          ["2nd fem. sing.", "תְּקַטְּלִי", "you (f.) will slaughter"],
          ["1st common sing.", "אֲקַטֵּל", "I will slaughter"],
          ["3rd masc. plur.", "יְקַטְּלוּ", "they (m.) will slaughter"],
          ["3rd fem. plur.", "תְּקַטֵּלְנָה", "they (f.) will slaughter"],
          ["2nd masc. plur.", "תְּקַטְּלוּ", "you (m. pl.) will slaughter"],
          ["2nd fem. plur.", "תְּקַטֵּלְנָה", "you (f. pl.) will slaughter"],
          ["1st common plur.", "נְקַטֵּל", "we will slaughter"],
        ],
      },
      {
        subtitle: "Imperative",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["2nd masc. sing.", "קַטֵּל", "slaughter! (to a man)"],
          ["2nd fem. sing.", "קַטְּלִי", "slaughter! (to a woman)"],
          ["2nd masc. plur.", "קַטְּלוּ", "slaughter! (to men)"],
          ["2nd fem. plur.", "קַטֵּלְנָה", "slaughter! (to women)"],
        ],
      },
      {
        subtitle: "Infinitives and participles",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["infinitive construct", "קַטֵּל", "to slaughter"],
          ["infinitive absolute", "קַטֵּל / קַטֹּל", "slaughtering (emphatic)"],
          ["participle masc. sing.", "מְקַטֵּל", "slaughtering (participle)"],
          ["participle fem. sing.", "מְקַטֶּלֶת", "slaughtering (participle)"],
          ["participle masc. plur.", "מְקַטְּלִים", "slaughtering (participle)"],
          ["participle fem. plur.", "מְקַטְּלוֹת", "slaughtering (participle)"],
        ],
      },
    ],
  },
  pual: {
    title: "Pual (passive of piel)",
    tables: [
      {
        subtitle: "Perfect (qatal): קֻטַּל — he was slaughtered",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "קֻטַּל", "he was slaughtered"],
          ["3rd fem. sing.", "קֻטְּלָה", "she was slaughtered"],
          ["2nd masc. sing.", "קֻטַּלְתָּ", "you (m.) was slaughtered"],
          ["2nd fem. sing.", "קֻטַּלְתְּ", "you (f.) was slaughtered"],
          ["1st common sing.", "קֻטַּלְתִּי", "I was slaughtered"],
          ["3rd common plur.", "קֻטְּלוּ", "they was slaughtered"],
          ["2nd masc. plur.", "קֻטַּלְתֶּם", "you (m. pl.) was slaughtered"],
          ["2nd fem. plur.", "קֻטַּלְתֶּן", "you (f. pl.) was slaughtered"],
          ["1st common plur.", "קֻטַּלְנוּ", "we was slaughtered"],
        ],
      },
      {
        subtitle: "Imperfect (yiqtol): יְקֻטַּל — he will be slaughtered",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "יְקֻטַּל", "he will be slaughtered"],
          ["3rd fem. sing.", "תְּקֻטַּל", "she will be slaughtered"],
          ["2nd masc. sing.", "תְּקֻטַּל", "you (m.) will be slaughtered"],
          ["2nd fem. sing.", "תְּקֻטְּלִי", "you (f.) will be slaughtered"],
          ["1st common sing.", "אֲקֻטַּל", "I will be slaughtered"],
          ["3rd masc. plur.", "יְקֻטְּלוּ", "they (m.) will be slaughtered"],
          ["3rd fem. plur.", "תְּקֻטַּלְנָה", "they (f.) will be slaughtered"],
          ["2nd masc. plur.", "תְּקֻטְּלוּ", "you (m. pl.) will be slaughtered"],
          ["2nd fem. plur.", "תְּקֻטַּלְנָה", "you (f. pl.) will be slaughtered"],
          ["1st common plur.", "נְקֻטַּל", "we will be slaughtered"],
        ],
      },
      {
        subtitle: "Infinitives and participles",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["passive participle masc. sing.", "מְקֻטָּל", "being slaughtered (passive participle)"],
          ["passive participle fem. sing.", "מְקֻטֶּלֶת", "being slaughtered (passive participle)"],
          ["passive participle masc. plur.", "מְקֻטָּלִים", "being slaughtered (passive participle)"],
          ["passive participle fem. plur.", "מְקֻטָּלוֹת", "being slaughtered (passive participle)"],
        ],
      },
    ],
  },
  hiphil: {
    title: "Hiphil (causative)",
    tables: [
      {
        subtitle: "Perfect (qatal): הִקְטִיל — he caused to kill",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "הִקְטִיל", "he caused to kill"],
          ["3rd fem. sing.", "הִקְטִילָה", "she caused to kill"],
          ["2nd masc. sing.", "הִקְטַלְתָּ", "you (m.) caused to kill"],
          ["2nd fem. sing.", "הִקְטַלְתְּ", "you (f.) caused to kill"],
          ["1st common sing.", "הִקְטַלְתִּי", "I caused to kill"],
          ["3rd common plur.", "הִקְטִילוּ", "they caused to kill"],
          ["2nd masc. plur.", "הִקְטַלְתֶּם", "you (m. pl.) caused to kill"],
          ["2nd fem. plur.", "הִקְטַלְתֶּן", "you (f. pl.) caused to kill"],
          ["1st common plur.", "הִקְטַלְנוּ", "we caused to kill"],
        ],
      },
      {
        subtitle: "Imperfect (yiqtol): יַקְטִיל — he will cause to kill",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "יַקְטִיל", "he will cause to kill"],
          ["3rd fem. sing.", "תַּקְטִיל", "she will cause to kill"],
          ["2nd masc. sing.", "תַּקְטִיל", "you (m.) will cause to kill"],
          ["2nd fem. sing.", "תַּקְטִילִי", "you (f.) will cause to kill"],
          ["1st common sing.", "אַקְטִיל", "I will cause to kill"],
          ["3rd masc. plur.", "יַקְטִילוּ", "they (m.) will cause to kill"],
          ["3rd fem. plur.", "תַּקְטֵלְנָה", "they (f.) will cause to kill"],
          ["2nd masc. plur.", "תַּקְטִילוּ", "you (m. pl.) will cause to kill"],
          ["2nd fem. plur.", "תַּקְטֵלְנָה", "you (f. pl.) will cause to kill"],
          ["1st common plur.", "נַקְטִיל", "we will cause to kill"],
        ],
      },
      {
        subtitle: "Imperative",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["2nd masc. sing.", "הַקְטֵל", "cause to kill! (to a man)"],
          ["2nd fem. sing.", "הַקְטִילִי", "cause to kill! (to a woman)"],
          ["2nd masc. plur.", "הַקְטִילוּ", "cause to kill! (to men)"],
          ["2nd fem. plur.", "הַקְטֵלְנָה", "cause to kill! (to women)"],
        ],
      },
      {
        subtitle: "Infinitives and participles",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["infinitive construct", "הַקְטִיל", "to cause to kill"],
          ["infinitive absolute", "הַקְטֵל", "causing to kill (emphatic)"],
          ["jussive 3rd masc. sing.", "יַקְטֵל", "let him cause to kill (short form, no yod)"],
          ["participle masc. sing.", "מַקְטִיל", "causing to kill (participle)"],
          ["participle fem. sing.", "מַקְטֶלֶת", "causing to kill (participle)"],
          ["participle masc. plur.", "מַקְטִילִים", "causing to kill (participle)"],
          ["participle fem. plur.", "מַקְטִילוֹת", "causing to kill (participle)"],
        ],
      },
    ],
  },
  hophal: {
    title: "Hophal (passive of hiphil)",
    tables: [
      {
        subtitle: "Perfect (qatal): הָקְטַל — he was caused to kill",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "הָקְטַל", "he was caused to kill"],
          ["3rd fem. sing.", "הָקְטְלָה", "she was caused to kill"],
          ["2nd masc. sing.", "הָקְטַלְתָּ", "you (m.) was caused to kill"],
          ["2nd fem. sing.", "הָקְטַלְתְּ", "you (f.) was caused to kill"],
          ["1st common sing.", "הָקְטַלְתִּי", "I was caused to kill"],
          ["3rd common plur.", "הָקְטְלוּ", "they was caused to kill"],
          ["2nd masc. plur.", "הָקְטַלְתֶּם", "you (m. pl.) was caused to kill"],
          ["2nd fem. plur.", "הָקְטַלְתֶּן", "you (f. pl.) was caused to kill"],
          ["1st common plur.", "הָקְטַלְנוּ", "we was caused to kill"],
        ],
      },
      {
        subtitle: "Imperfect (yiqtol): יָקְטַל — he will be caused to kill",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "יָקְטַל", "he will be caused to kill"],
          ["3rd fem. sing.", "תָּקְטַל", "she will be caused to kill"],
          ["2nd masc. sing.", "תָּקְטַל", "you (m.) will be caused to kill"],
          ["2nd fem. sing.", "תָּקְטְלִי", "you (f.) will be caused to kill"],
          ["1st common sing.", "אָקְטַל", "I will be caused to kill"],
          ["3rd masc. plur.", "יָקְטְלוּ", "they (m.) will be caused to kill"],
          ["3rd fem. plur.", "תָּקְטַלְנָה", "they (f.) will be caused to kill"],
          ["2nd masc. plur.", "תָּקְטְלוּ", "you (m. pl.) will be caused to kill"],
          ["2nd fem. plur.", "תָּקְטַלְנָה", "you (f. pl.) will be caused to kill"],
          ["1st common plur.", "נָקְטַל", "we will be caused to kill"],
        ],
      },
      {
        subtitle: "Infinitives and participles",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["infinitive absolute", "הָקְטֵל", "being caused to kill (emphatic)"],
          ["perfect 3rd masc. sing. with qibbuts (also common)", "הֻקְטַל", "he was caused to kill"],
          [
            "imperfect 3rd masc. sing. with qibbuts (also common)",
            "יֻקְטַל",
            "he will be caused to kill",
          ],
          ["passive participle masc. sing.", "מָקְטָל", "being caused to kill (passive participle)"],
          ["passive participle fem. sing.", "מָקְטֶלֶת", "being caused to kill (passive participle)"],
          ["passive participle masc. plur.", "מָקְטָלִים", "being caused to kill (passive participle)"],
          ["passive participle fem. plur.", "מָקְטָלוֹת", "being caused to kill (passive participle)"],
        ],
      },
    ],
  },
  hithpael: {
    title: "Hithpael (reflexive or reciprocal)",
    tables: [
      {
        subtitle: "Perfect (qatal): הִתְקַטֵּל — he killed himself",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "הִתְקַטֵּל", "he killed himself"],
          ["3rd fem. sing.", "הִתְקַטְּלָה", "she killed herself"],
          ["2nd masc. sing.", "הִתְקַטַּלְתָּ", "you (m.) killed yourself"],
          ["2nd fem. sing.", "הִתְקַטַּלְתְּ", "you (f.) killed yourself"],
          ["1st common sing.", "הִתְקַטַּלְתִּי", "I killed myself"],
          ["3rd common plur.", "הִתְקַטְּלוּ", "they killed themselves"],
          ["2nd masc. plur.", "הִתְקַטַּלְתֶּם", "you (m. pl.) killed yourselves"],
          ["2nd fem. plur.", "הִתְקַטַּלְתֶּן", "you (f. pl.) killed yourselves"],
          ["1st common plur.", "הִתְקַטַּלְנוּ", "we killed ourselves"],
        ],
      },
      {
        subtitle: "Imperfect (yiqtol): יִתְקַטֵּל — he will kill himself",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["3rd masc. sing.", "יִתְקַטֵּל", "he will kill himself"],
          ["3rd fem. sing.", "תִּתְקַטֵּל", "she will kill herself"],
          ["2nd masc. sing.", "תִּתְקַטֵּל", "you (m.) will kill yourself"],
          ["2nd fem. sing.", "תִּתְקַטְּלִי", "you (f.) will kill yourself"],
          ["1st common sing.", "אֶתְקַטֵּל", "I will kill myself"],
          ["3rd masc. plur.", "יִתְקַטְּלוּ", "they (m.) will kill themselves"],
          ["3rd fem. plur.", "תִּתְקַטֵּלְנָה", "they (f.) will kill themselves"],
          ["2nd masc. plur.", "תִּתְקַטְּלוּ", "you (m. pl.) will kill yourselves"],
          ["2nd fem. plur.", "תִּתְקַטֵּלְנָה", "you (f. pl.) will kill yourselves"],
          ["1st common plur.", "נִתְקַטֵּל", "we will kill ourselves"],
        ],
      },
      {
        subtitle: "Imperative",
        headers: ["Person", "Hebrew", "Meaning"],
        rows: [
          ["2nd masc. sing.", "הִתְקַטֵּל", "kill himself! (to a man)"],
          ["2nd fem. sing.", "הִתְקַטְּלִי", "kill himself! (to a woman)"],
          ["2nd masc. plur.", "הִתְקַטְּלוּ", "kill himself! (to men)"],
          ["2nd fem. plur.", "הִתְקַטֵּלְנָה", "kill himself! (to women)"],
        ],
      },
      {
        subtitle: "Infinitives and participles",
        headers: ["Form", "Hebrew", "Meaning"],
        rows: [
          ["infinitive construct", "הִתְקַטֵּל", "to kill oneself"],
          ["infinitive absolute", "הִתְקַטֵּל", "killing oneself (emphatic)"],
          ["participle masc. sing.", "מִתְקַטֵּל", "killing oneself (participle)"],
          ["participle fem. sing.", "מִתְקַטֶּלֶת", "killing oneself (participle)"],
          ["participle masc. plur.", "מִתְקַטְּלִים", "killing oneself (participle)"],
          ["participle fem. plur.", "מִתְקַטְּלוֹת", "killing oneself (participle)"],
        ],
      },
      {
        subtitle:
          "After a sibilant first root letter (ס, שׁ, שׂ, צ) the ת swaps places with it; after צ it becomes ט",
        headers: ["Root", "Hebrew", "Meaning"],
        rows: [
          ["סתר (hide): participle", "מִסְתַּתֵּר", "hiding himself"],
          ["שׁפך (pour): imperfect 3rd fem. sing.", "תִּשְׁתַּפֵּךְ", "it pours itself out"],
          [
            "צוד (hunt, take provisions): perfect 1st common plur.",
            "הִצְטַיַּדְנוּ",
            "we took provisions",
          ],
          ["שׁחה (bow): hishtaphel perfect 3rd common plur.", "הִשְׁתַּחֲווּ", "they bowed down"],
        ],
      },
    ],
  },
} satisfies Record<string, MorphologyChart>;
