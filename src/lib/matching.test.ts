import { describe, expect, it } from "vitest";
import { computeMatch, WEIGHTS, type QuizAnswers } from "./matching";
import { animals } from "./animals";

const ideal: QuizAnswers = { hoursAway: 0, housing: 2, dailyTime: 2, activity: 2, kids: 1, pets: 0, experience: 2, routine: 0, openness: 0 };
const poor: QuizAnswers = { hoursAway: 2, housing: 0, dailyTime: 0, activity: 0, kids: 0, pets: 3, experience: 0, routine: 2, openness: 2 };

describe("matching", () => {
  it("weights sum to 100", () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });
  it("scores stay within 0–100", () => {
    for (const a of animals) for (const q of [ideal, poor]) {
      const s = computeMatch(q, a).score;
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
  it("ideal adopter scores higher than incompatible one for every animal", () => {
    for (const a of animals) expect(computeMatch(ideal, a).score).toBeGreaterThan(computeMatch(poor, a).score);
  });
  it("high-energy large dog with ideal adopter scores at least 90", () => {
    const dog = animals.find((a) => a.energy === "alta" && a.size === "grande" && !a.forgotten)!;
    expect(computeMatch(ideal, dog).score).toBeGreaterThanOrEqual(90);
  });
});
