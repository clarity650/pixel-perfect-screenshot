import { describe, it, expect } from "vitest";
import { computeBadges, levelFor } from "./study";

describe("rewards", () => {
  it("levels up every 100 points", () => {
    expect(levelFor(0)).toEqual({ level: 1, into: 0 });
    expect(levelFor(250)).toEqual({ level: 3, into: 50 });
  });
  it("awards the 3-day streak badge at streak 3", () => {
    const b = computeBadges({ points: 0, streak: 3 }, []);
    expect(b.find((x) => x.id === "streak3")?.earned).toBe(true);
    expect(b.find((x) => x.id === "streak7")?.earned).toBe(false);
  });
  it("awards Bullseye only for a perfect quiz", () => {
    const miss = computeBadges(null, [{ kind: "quiz", score: 4, total: 5, subject: "Biology" }]);
    const hit = computeBadges(null, [{ kind: "quiz", score: 5, total: 5, subject: "Biology" }]);
    expect(miss.find((x) => x.id === "perfect")?.earned).toBe(false);
    expect(hit.find((x) => x.id === "perfect")?.earned).toBe(true);
  });
});
