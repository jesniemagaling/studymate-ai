import { describe, expect, it } from "vitest";

import {
  generateQuizQuestions,
  QuizGenerationInputError,
} from "@/lib/services/quiz-generator";

describe("quiz-generator service", () => {
  it("generates quiz questions with defaults", () => {
    const questions = generateQuizQuestions({
      text: "Photosynthesis converts light into chemical energy for plants. Cellular respiration converts glucose into ATP energy for cells.",
    });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]).toMatchObject({
      id: 1,
      difficulty: "medium",
      questionType: "multiple_choice",
    });
    expect(questions[0].contextHint).toContain("Source hint:");
    expect(questions[0].options).toContain(questions[0].answer);
  });

  it("supports fill-in-blank question type", () => {
    const questions = generateQuizQuestions({
      text: "Neural networks are a machine learning approach that learns patterns from data.",
      questionType: "fill_in_blank",
      difficulty: "easy",
      count: 1,
    });

    expect(questions).toHaveLength(1);
    expect(questions[0].questionType).toBe("fill_in_blank");
    expect(questions[0].question).toContain("Fill in the blank");
  });

  it("caps question count to 15", () => {
    const sentence =
      "This is a sufficiently long sentence for quiz generation.";
    const text = Array.from({ length: 40 }, () => sentence).join(" ");

    const questions = generateQuizQuestions({ text, count: 100 });
    expect(questions.length).toBeLessThanOrEqual(15);
  });

  it("throws on missing text", () => {
    expect(() => generateQuizQuestions({ text: "" })).toThrow(
      QuizGenerationInputError,
    );
  });

  it("throws on invalid difficulty", () => {
    expect(() =>
      generateQuizQuestions({
        text: "A valid sentence with enough length.",
        difficulty: "invalid" as never,
      }),
    ).toThrow("Invalid difficulty");
  });
});
