// models/Certificate.js
import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participantEmail: {
      type: String,
      required: true,
    },
    certId: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
    },
    // 🧾 JSON metadata stored on IPFS (contains email, event, date, etc.)
    metadataIpfsHash: {
      type: String,
    },
    // 📄 Actual PDF file uploaded to IPFS
    pdfIpfsHash: {
      type: String,
    },
    // 🔗 Blockchain transaction info
    txHash: {
      type: String,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
