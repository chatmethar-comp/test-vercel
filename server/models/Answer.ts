import mongoose from "mongoose";
import QuestionSchema from "./question";

const AnswerSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  time: { type: Date, default: Date.now },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  followUpAnswers: [
    {
      fromSectionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      generatedQuestion: { type: QuestionSchema, required: true }, // Reuse QuestionSchema here
      answer: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  schemaVersion: { type: Number, default: 1 },
});

export default mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);