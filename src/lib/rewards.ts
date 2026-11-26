export const OUTFITS = [
  { id: "classic", name: "Just bunny", days: 0, detail: "Yours from the start" },
  { id: "scarf", name: "Rose ribbon", days: 1, detail: "1 study day" },
  { id: "sweater", name: "Cozy scholar", days: 3, detail: "3 study days" },
  { id: "overalls", name: "Sky overalls", days: 5, detail: "5 study days" },
  { id: "garden", name: "Garden party", days: 7, detail: "7 study days" },
  { id: "starlight", name: "Starlight cape", days: 14, detail: "14 study days" },
] as const;

export type OutfitId = (typeof OUTFITS)[number]["id"];
export type Fur = "vanilla" | "blush" | "sky";
export const FURS: { id: Fur; name: string }[] = [
  { id: "vanilla", name: "Vanilla" }, { id: "blush", name: "Blush" }, { id: "sky", name: "Sky" },
];

export function isOutfitUnlocked(id: string, studyDays: number) {
  const outfit = OUTFITS.find((o) => o.id === id);
  return outfit !== undefined && studyDays >= outfit.days;
}

export function consistencyBonus(newDay: boolean, streak: number) {
  return newDay ? 10 + (streak === 3 ? 25 : streak === 7 ? 50 : 0) : 0;
}

export function manilaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function activeStreak(profile: { streak: number; last_study_date: string | null } | null | undefined, now = new Date()) {
  if (!profile?.last_study_date) return 0;
  const yesterday = manilaDate(new Date(now.getTime() - 86400000));
  return profile.last_study_date >= yesterday ? profile.streak : 0;
}

export function asOutfit(value: string | undefined): OutfitId {
  return OUTFITS.find((o) => o.id === value)?.id ?? "classic";
}

export function asFur(value: string | undefined): Fur {
  return FURS.find((f) => f.id === value)?.id ?? "vanilla";
}