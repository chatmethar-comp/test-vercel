import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answerType: {
    type: String,
    enum: ["text", "checkbox", "radio", "file"],
    required: true,
  },
  options: { type: [String], default: [] },
});

export default QuestionSchema;
