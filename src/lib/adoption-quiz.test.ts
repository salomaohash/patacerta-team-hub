import { describe, expect, it } from "vitest";
import { ADOPTION_QUIZ_PATH, adoptionQuestions, isAdoptionProfile, matchesAdoptionSpecies, toQuizAnswers } from "./adoption-quiz";
import { animals } from "./animals";
import { computeMatch } from "./matching";
import { loadQuiz, saveQuiz } from "./state/quiz";

describe("uploaded adoption quiz", () => {
  it("starts Quero adotar at the quiz instead of the catalog", () => expect(ADOPTION_QUIZ_PATH).toBe("/quiz"));
  it("requires exactly six answered source questions", () => {
    expect(adoptionQuestions).toHaveLength(6);
    expect(isAdoptionProfile([0, 1, 2, 0, 1, 3])).toBe(true);
    expect(isAdoptionProfile([0, 1, 2, 0, 1])).toBe(false);
    expect(isAdoptionProfile([0, 1, 2, 0, undefined, 3])).toBe(false);
    expect(isAdoptionProfile([0, 1, 2, 0, 3, 3])).toBe(false);
  });
  it("dog preference excludes cats", () => {
    const q = toQuizAnswers([0, 1, 0, 0, 0, 0]);
    expect(animals.filter((a) => matchesAdoptionSpecies(q, a)).every((a) => a.species === "cão")).toBe(true);
  });
  it("cat preference excludes dogs", () => {
    const q = toQuizAnswers([0, 1, 0, 0, 1, 0]);
    expect(animals.filter((a) => matchesAdoptionSpecies(q, a)).every((a) => a.species === "gato")).toBe(true);
  });
  it("open preference keeps both species", () => {
    const q = toQuizAnswers([0, 1, 0, 0, 2, 0]);
    expect(animals.filter((a) => matchesAdoptionSpecies(q, a))).toHaveLength(animals.length);
  });
  it("answers affect compatibility instead of returning the fixed 92 percent source result", () => {
    const dog = animals.find((a) => a.id === "thor");
    if (!dog) throw new Error("Missing Thor fixture");
    expect(computeMatch(toQuizAnswers([1, 2, 2, 2, 0, 1]), dog).score).toBe(100);
    expect(computeMatch(toQuizAnswers([0, 0, 0, 0, 0, 0]), dog).score).toBe(20);
  });
  it("saves new profile and preserves legacy answers", () => {
    const q = toQuizAnswers([0, 1, 0, 0, 1, 0]);
    saveQuiz(q);
    expect(loadQuiz()).toEqual(q);
    const { adoptionProfile, ...legacy } = q;
    expect(adoptionProfile).toHaveLength(6);
    saveQuiz(legacy);
    expect(loadQuiz()).toEqual(legacy);
    localStorage.removeItem("patacerta.quiz");
  });
});