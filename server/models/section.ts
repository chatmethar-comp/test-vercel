import mongoose from "mongoose";
import QuestionSchema from "./question";

const SectionSchema = new mongoose.Schema({
  section_name: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
  useAI: { type: Boolean, default: false },
});

export default SectionSchema; 