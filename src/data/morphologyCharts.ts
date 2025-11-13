export const MORPHOLOGY_CHARTS = {
  article: {
    title: "Definite Article (ה - 'the')",
    tables: [
      {
        subtitle: "With various noun patterns",
        headers: ["Pattern", "Masculine", "Feminine"],
        rows: [
          ["Before regular cons.", "הַמֶּלֶךְ (the king)", "הַמַּלְכָּה (the queen)"],
          ["Before gutturals", "הָאָב (the father)", "הָאֵם (the mother)"],
          ["Before ר", "הָרֹאשׁ (the head)", "הָרוּחַ (the wind)"],
        ],
      },
    ],
  },
  masculineNoun: {
    title: "Masculine Nouns",
    tables: [
      {
        subtitle: "סוּס (horse) - Regular pattern",
        headers: ["State", "Singular", "Plural"],
        rows: [
          ["Absolute", "סוּס", "סוּסִים"],
          ["Construct", "סוּס", "סוּסֵי"],
          ["Determined", "הַסּוּס", "הַסּוּסִים"],
        ],
      },
      {
        subtitle: "מֶלֶךְ (king) - Segolate pattern",
        headers: ["State", "Singular", "Plural"],
        rows: [
          ["Absolute", "מֶלֶךְ", "מְלָכִים"],
          ["Construct", "מֶלֶךְ", "מַלְכֵי"],
          ["Determined", "הַמֶּלֶךְ", "הַמְּלָכִים"],
        ],
      },
    ],
  },
  feminineNoun: {
    title: "Feminine Nouns",
    tables: [
      {
        subtitle: "תּוֹרָה (law) - Regular ה- ending",
        headers: ["State", "Singular", "Plural"],
        rows: [
          ["Absolute", "תּוֹרָה", "תּוֹרוֹת"],
          ["Construct", "תּוֹרַת", "תּוֹרוֹת"],
          ["Determined", "הַתּוֹרָה", "הַתּוֹרוֹת"],
        ],
      },
      {
        subtitle: "מַלְכָּה (queen) - Regular ה- ending",
        headers: ["State", "Singular", "Plural"],
        rows: [
          ["Absolute", "מַלְכָּה", "מְלָכוֹת"],
          ["Construct", "מַלְכַּת", "מַלְכוֹת"],
          ["Determined", "הַמַּלְכָּה", "הַמְּלָכוֹת"],
        ],
      },
    ],
  },
  dualNouns: {
    title: "Dual Number Nouns",
    tables: [
      {
        subtitle: "Common dual forms (paired items)",
        headers: ["Word", "Singular", "Dual"],
        rows: [
          ["Hand", "יָד", "יָדַיִם"],
          ["Eye", "עַיִן", "עֵינַיִם"],
          ["Foot", "רֶגֶל", "רַגְלַיִם"],
          ["Day (two)", "יוֹם", "יוֹמַיִם"],
        ],
      },
    ],
  },
  qalPerfect: {
    title: "Qal Perfect (כָּתַב - he wrote)",
    tables: [
      {
        subtitle: "Singular & Plural",
        headers: ["Person", "Singular", "Plural"],
        rows: [
          ["3rd m.", "כָּתַב", "כָּתְבוּ"],
          ["3rd f.", "כָּתְבָה", "כָּתְבוּ"],
          ["2nd m.", "כָּתַבְתָּ", "כְּתַבְתֶּם"],
          ["2nd f.", "כָּתַבְתְּ", "כְּתַבְתֶּן"],
          ["1st c.", "כָּתַבְתִּי", "כָּתַבְנוּ"],
        ],
      },
    ],
  },
  qalImperfect: {
    title: "Qal Imperfect (יִכְתֹּב - he will write)",
    tables: [
      {
        subtitle: "Singular & Plural",
        headers: ["Person", "Singular", "Plural"],
        rows: [
          ["3rd m.", "יִכְתֹּב", "יִכְתְּבוּ"],
          ["3rd f.", "תִּכְתֹּב", "תִּכְתֹּבְנָה"],
          ["2nd m.", "תִּכְתֹּב", "תִּכְתְּבוּ"],
          ["2nd f.", "תִּכְתְּבִי", "תִּכְתֹּבְנָה"],
          ["1st c.", "אֶכְתֹּב", "נִכְתֹּב"],
        ],
      },
    ],
  },
  qalImperative: {
    title: "Qal Imperative (כְּתֹב - write!)",
    tables: [
      {
        subtitle: "Second person only",
        headers: ["Person", "Singular", "Plural"],
        rows: [
          ["2nd m.", "כְּתֹב", "כִּתְבוּ"],
          ["2nd f.", "כִּתְבִי", "כְּתֹבְנָה"],
        ],
      },
    ],
  },
  niphalPerfect: {
    title: "Niphal Perfect (נִכְתַּב - it was written)",
    tables: [
      {
        subtitle: "Singular & Plural",
        headers: ["Person", "Singular", "Plural"],
        rows: [
          ["3rd m.", "נִכְתַּב", "נִכְתְּבוּ"],
          ["3rd f.", "נִכְתְּבָה", "נִכְתְּבוּ"],
          ["2nd m.", "נִכְתַּבְתָּ", "נִכְתַּבְתֶּם"],
          ["2nd f.", "נִכְתַּבְתְּ", "נִכְתַּבְתֶּן"],
          ["1st c.", "נִכְתַּבְתִּי", "נִכְתַּבְנוּ"],
        ],
      },
    ],
  },
  pielPerfect: {
    title: "Piel Perfect (כִּתֵּב - he inscribed)",
    tables: [
      {
        subtitle: "Singular & Plural",
        headers: ["Person", "Singular", "Plural"],
        rows: [
          ["3rd m.", "כִּתֵּב", "כִּתְּבוּ"],
          ["3rd f.", "כִּתְּבָה", "כִּתְּבוּ"],
          ["2nd m.", "כִּתַּבְתָּ", "כִּתַּבְתֶּם"],
          ["2nd f.", "כִּתַּבְתְּ", "כִּתַּבְתֶּן"],
          ["1st c.", "כִּתַּבְתִּי", "כִּתַּבְנוּ"],
        ],
      },
    ],
  },
  hiphilPerfect: {
    title: "Hiphil Perfect (הִכְתִּיב - he caused to write)",
    tables: [
      {
        subtitle: "Singular & Plural",
        headers: ["Person", "Singular", "Plural"],
        rows: [
          ["3rd m.", "הִכְתִּיב", "הִכְתִּיבוּ"],
          ["3rd f.", "הִכְתִּיבָה", "הִכְתִּיבוּ"],
          ["2nd m.", "הִכְתַּבְתָּ", "הִכְתַּבְתֶּם"],
          ["2nd f.", "הִכְתַּבְתְּ", "הִכְתַּבְתֶּן"],
          ["1st c.", "הִכְתַּבְתִּי", "הִכְתַּבְנוּ"],
        ],
      },
    ],
  },
  pronouns: {
    title: "Independent Personal Pronouns",
    tables: [
      {
        subtitle: "Singular & Plural",
        headers: ["Person", "Singular", "Plural"],
        rows: [
          ["3rd m.", "הוּא (he)", "הֵם/הֵמָּה (they)"],
          ["3rd f.", "הִיא (she)", "הֵן/הֵנָּה (they)"],
          ["2nd m.", "אַתָּה (you)", "אַתֶּם (you)"],
          ["2nd f.", "אַתְּ (you)", "אַתֶּן (you)"],
          ["1st c.", "אֲנִי/אָנֹכִי (I)", "אֲנַחְנוּ (we)"],
        ],
      },
    ],
  },
};
