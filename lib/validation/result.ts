import { z } from "zod";

export const ReviewerContentSchema = z.object({
  summary: z.string().min(1, "Reviewer summary is required"),
  keyPoints: z.array(z.string().min(1)).default([]),
});

export const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answer: z.string().min(1),
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
    }),
    z.object({
      type: z.literal("quiz"),
      content: QuizContentSchema,
      title: z.string().trim().optional(),
    }),
    z.object({
      type: z.literal("flashcards"),
      content: FlashcardContentSchema,
      title: z.string().trim().optional(),
    }),
  ])
  .superRefine((payload, ctx) => {
    if (payload.type === "quiz") {
      payload.content.questions.forEach((q, i) => {
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
