import mongoose, { Schema, models } from 'mongoose';

const SavedContentSchema = new Schema(
  {
    userId: { type: String, required: true },
    pdfName: { type: String, required: false },
    type: {
      type: String,
      enum: ['reviewer', 'quiz', 'flashcards'],
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.SavedContent ||
  mongoose.model('SavedContent', SavedContentSchema);
