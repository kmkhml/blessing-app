
export type Language = 'en' | 'zh';

export const UI_TRANSLATIONS = {
  en: {
    title: "Cosmic Blessings",
    recipientLabel: "Who is this blessing for?",
    blessingLabel: "What do you seek?",
    invokeButton: "Invoke the Stars",
    resetButton: "Cast Another Blessing",
    for: "FOR"
  },
  zh: {
    title: "星际祈福",
    recipientLabel: "祈福对象是谁？",
    blessingLabel: "您所求为何？",
    invokeButton: "开启星阵",
    resetButton: "再次祈福",
    for: "致"
  }
};

export const RECIPIENTS_MAP = {
  en: [
    "Father", "Mother", "Son", "Daughter",
    "Grandfather", "Grandmother",
    "Boyfriend", "Girlfriend", "Husband", "Wife",
    "Self", "Boss", "Mentee",
    "Pet", "Mentor"
  ],
  zh: [
    "父亲", "母亲", "儿子", "女儿",
    "祖父", "祖母",
    "男朋友", "女朋友", "丈夫", "妻子",
    "自己", "上司", "学员",
    "宠物", "导师"
  ]
};

// Map Chinese recipients back to English keys for internal logic if needed, 
// or just use indices. But keeping a mapping is safer.
export const RECIPIENT_KEY_MAP: Record<string, string> = {
  "父亲": "Father", "母亲": "Mother", "儿子": "Son", "女儿": "Daughter",
  "祖父": "Grandfather", "祖母": "Grandmother",
  "男朋友": "Boyfriend", "女朋友": "Girlfriend", "丈夫": "Husband", "妻子": "Wife",
  "自己": "Self", "上司": "Boss", "学员": "Mentee", "下属": "Mentee",
  "宠物": "Pet", "导师": "Mentor",
  // English to English (identity)
  "Father": "Father", "Mother": "Mother", "Son": "Son", "Daughter": "Daughter",
  "Grandfather": "Grandfather", "Grandmother": "Grandmother",
  "Boyfriend": "Boyfriend", "Girlfriend": "Girlfriend", "Husband": "Husband", "Wife": "Wife",
  "Self": "Self", "Boss": "Boss", "Mentee": "Mentee", "Subordinate": "Mentee",
  "Pet": "Pet", "Mentor": "Mentor"
};

export const BLESSINGS_MAP = {
  en: ["Love", "Friendship", "Family", "Abundance", "Career", "Health"],
  zh: ["爱情", "友情", "亲情", "丰盛", "事业", "健康"]
};

export const BLESSING_KEY_MAP: Record<string, string> = {
  "爱情": "Love", "友情": "Friendship", "亲情": "Family", 
  "丰盛": "Abundance", "事业": "Career", "健康": "Health",
  // Old Chinese keys just in case
  "财运": "Abundance",
  // English to English
  "Love": "Love", "Friendship": "Friendship", "Family": "Family",
  "Abundance": "Abundance", "Wealth": "Abundance", "Career": "Career", "Health": "Health"
};
