import mongoose, { Schema, Document, Model } from "mongoose";

interface IQuestionAndAnswer {
  questionText: string;
  userAnswer: string;
}

interface IGeneratedQuestion extends Document {
  questionsAndAnswers: IQuestionAndAnswer[];
  generatedQuestion: string;
  instance: string;
  createdAt: Date;
}

const GeneratedQuestionSchema: Schema = new Schema({
  questionsAndAnswers: [
    {
      questionText: { type: String, required: true },
      userAnswer: { type: String, required: false},
    },
  ],
  generatedQuestion: { type: String, required: true },
  instance: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const GeneratedQuestion: Model<IGeneratedQuestion> =
  mongoose.models.GeneratedQuestion ||
  mongoose.model<IGeneratedQuestion>(
    "GeneratedQuestion",
    GeneratedQuestionSchema
  );

export default GeneratedQuestion;
