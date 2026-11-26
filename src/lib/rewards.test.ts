import { describe, expect, it } from "vitest";
import { activeStreak, consistencyBonus, isOutfitUnlocked, OUTFITS, manilaDate } from "./rewards";

describe("consistency rewards", () => {
  it("only grants a daily bonus on a new study day", () => {
    expect(consistencyBonus(true, 1)).toBe(10);
    expect(consistencyBonus(false, 1)).toBe(0);
    expect(consistencyBonus(false, 3)).toBe(0);
    expect(consistencyBonus(false, 7)).toBe(0);
  });
  it("adds streak bonuses at days 3 and 7", () => {
    expect(consistencyBonus(true, 3)).toBe(35);
    expect(consistencyBonus(true, 7)).toBe(60);
    expect(consistencyBonus(true, 4)).toBe(10);
  });
  for (const outfit of OUTFITS) {
    it(`unlocks ${outfit.id} at ${outfit.days} study days`, () => {
      expect(isOutfitUnlocked(outfit.id, outfit.days)).toBe(true);
      expect(isOutfitUnlocked(outfit.id, outfit.days - 1)).toBe(false);
    });
  }
  it("never unlocks unknown outfits", () => {
    expect(isOutfitUnlocked("made-up", 999)).toBe(false);
  });
  it("resets the displayed streak after a missed day", () => {
    const now = new Date("2026-11-26T03:25:00Z");
    expect(activeStreak({ streak: 7, last_study_date: "2026-11-24" }, now)).toBe(0);
    expect(activeStreak({ streak: 7, last_study_date: "2026-11-25" }, now)).toBe(7);
    expect(activeStreak({ streak: 8, last_study_date: "2026-11-26" }, now)).toBe(8);
    expect(manilaDate(new Date("2026-11-25T16:00:00Z"))).toBe("2026-11-26");
  });
});