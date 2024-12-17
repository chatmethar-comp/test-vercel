import mongoose from "mongoose";
import SectionSchema from "./section";

const FormSchema = new mongoose.Schema({
  creator: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  title: { type: String, required: true },
  sections: { type: [SectionSchema], required: true },
  schemaVersion: { type: Number, default: 1 }
});

const Form = mongoose.model("Form", FormSchema);
export default Form;
