import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    walletAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Participant", participantSchema);
