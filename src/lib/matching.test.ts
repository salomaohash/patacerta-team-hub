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
  it("high-energy dog: active, available adopter scores at least 90 and beats the incompatible one", () => {
    const dog = animals.find((a) => a.species === "cão" && a.energy === "alta" && !a.forgotten)!;
    expect(computeMatch(ideal, dog).score).toBeGreaterThanOrEqual(90);
    expect(computeMatch(ideal, dog).score).toBeGreaterThan(computeMatch(poor, dog).score + 30);
  });
  it("special-needs animal scores 0 on openness when adopter says no", () => {
    const a = animals.find((x) => x.forgotten)!;
    expect(computeMatch(poor, a).dimensions.openness.score).toBe(0);
  });
});
