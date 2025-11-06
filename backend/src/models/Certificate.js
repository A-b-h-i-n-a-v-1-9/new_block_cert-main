import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  participantEmail: { type: String, required: true },
  certId: { type: String, required: true },
  walletAddress: { type: String },
  ipfsHash: { type: String },
  txHash: { type: String },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Certificate", certificateSchema);
