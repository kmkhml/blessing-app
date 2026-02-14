
import { RECIPIENT_KEY_MAP, BLESSING_KEY_MAP } from './translations';
import type { Language } from './translations';
import { getManifestation } from '../constants/manifestations';

export interface BlessingData {
  type: string; // Added type field
  title: string;
  incantation: string;
  symbol: string;
  element: string;
  color: string;
  gradient: [string, string];
}

const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const isProfessional = (r: string) => ["Boss", "Subordinate"].includes(r);

export const generateBlessing = (recipientRaw: string, typeRaw: string, lang: Language = 'en'): BlessingData => {
  // Normalize inputs to English keys for logic
  const recipient = RECIPIENT_KEY_MAP[recipientRaw] || recipientRaw;
  const type = BLESSING_KEY_MAP[typeRaw] || typeRaw;

  let title = "";
  let incantation = "";
  let symbol = getRandom(ZODIAC_SYMBOLS);
  let element = lang === 'zh' ? "以太" : "Ether";
  let color = "text-yellow-400";
  let gradient: [string, string] = ["#d4af37", "#f1c40f"]; // Celestial Gold
  // const rLower = recipient.toLowerCase();

  // Helper for bilingual strings
  const t = (en: string, zh: string) => lang === 'zh' ? zh : en;

  // Translate recipient name for insertion
  // let rName = recipient;
  // if (lang === 'zh') {
  //   const index = RECIPIENTS_MAP.en.indexOf(recipient);
  //   if (index !== -1) {
  //     rName = RECIPIENTS_MAP.zh[index];
  //   }
  // }

  // Define logic for "Abundance" since we renamed "Wealth"
  // Map "Wealth" to "Abundance" in logic if passed, though BLESSING_KEY_MAP handles it.
  
  // NEW: Use Manifestation Matrix for Title and Incantation
  const manifestation = getManifestation(recipient, type);
  title = manifestation.title;
  incantation = manifestation.incantation;

  // Insert Recipient Name if needed (for generic templates)
  // The matrix templates are mostly "I" statements or "My [kin]".
  // We can do a simple replacement if the template contains a placeholder, 
  // but most are designed to be standalone.
  // Let's refine the incantation if it refers to "this creature" or "this soul" to be more specific?
  // Actually, the assertive "I" statements are better left pure.
  
  // Override visual elements based on Type
  switch (type) {
    case "Love":
      element = t("Fire", "火");
      color = "text-rose-400";
      // Royal Purple & Gold (Mystic/Royal)
      gradient = ["#7c3aed", "#fbbf24"]; 
      symbol = "❤";
      if (isProfessional(recipient) || recipient === "Mentor") symbol = "⚖";
      break;
    
    case "Friendship":
      element = t("Air", "风");
      color = "text-sky-400";
      // Emerald & Silver (Elven/Ancient)
      gradient = ["#10b981", "#e2e8f0"]; 
      symbol = "🤝";
      break;

    case "Family":
      element = t("Earth", "地");
      color = "text-emerald-400";
      gradient = ["#d4af37", "#fcd34d"]; // Gold/Amber
      symbol = "🌳";
      break;

    case "Abundance": // Renamed from Wealth
    case "Wealth":
      element = t("Gold", "金");
      color = "text-amber-400";
      // Deep Blue & Gold (Lapis Lazuli / Royal Treasury)
      gradient = ["#1e3a8a", "#d4af37"]; 
      symbol = "💎";
      break;

    case "Career":
      element = t("Metal", "金");
      color = "text-blue-400";
      // Steel Blue & Silver (Starship/High-Tech Ancient)
      gradient = ["#3b82f6", "#94a3b8"]; 
      symbol = "⚔";
      break;

    case "Health":
      element = t("Water", "水");
      color = "text-teal-400";
      // Jade Green & Gold (Life/Nature)
      gradient = ["#059669", "#f59e0b"]; 
      symbol = "⚕";
      break;
      
    default:
      // Fallback already handled
  }

  return {
    type, 
    title,
    incantation,
    symbol,
    element,
    color,
    gradient
  };
};
