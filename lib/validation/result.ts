import { z } from "zod";

export const ReviewerContentSchema = z.object({
  summary: z.string().min(1, "Reviewer summary is required"),
  keyPoints: z.array(z.string().min(1)).default([]),
});

export const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).default([]),
  answer: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: z.enum(["multiple_choice", "fill_in_blank"]).optional(),
  contextHint: z.string().min(1).optional(),
});

export const QuizContentSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1),
});

export const FlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
});

export const FlashcardContentSchema = z.object({
  cards: z.array(FlashcardSchema).min(1),
});

export const SaveResultSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("reviewer"),
      content: ReviewerContentSchema,
      title: z.string().trim().optional(),
      sourcePdfId: z.string().trim().optional(),
    }),
    z.object({
      type: z.literal("quiz"),
      content: QuizContentSchema,
      title: z.string().trim().optional(),
      sourcePdfId: z.string().trim().optional(),
    }),
    z.object({
      type: z.literal("flashcards"),
      content: FlashcardContentSchema,
      title: z.string().trim().optional(),
      sourcePdfId: z.string().trim().optional(),
    }),
  ])
  .superRefine((payload, ctx) => {
    if (payload.type === "quiz") {
      payload.content.questions.forEach((q, i) => {
        const questionType = q.questionType || "multiple_choice";

        if (questionType === "fill_in_blank") {
          return;
        }

        if (q.options.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Multiple-choice questions must have at least 2 options",
            path: ["content", "questions", i, "options"],
          });
          return;
        }

        if (!q.options.includes(q.answer)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Quiz answer must match one of the options",
            path: ["content", "questions", i, "answer"],
          });
        }
      });
    }
  });

export type SaveResultPayload = z.infer<typeof SaveResultSchema>;
