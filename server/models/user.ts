import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: { type: String },
  schemaVersion: { type: Number, default: 1 },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
