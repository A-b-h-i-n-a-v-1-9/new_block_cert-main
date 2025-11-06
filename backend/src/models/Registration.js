import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
    },
    participantName: {
      type: String,
      required: true,
    },
    participantEmail: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
      default: "",
    },

    // ✅ QR Data
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    qrCode: {
      type: String, // base64 image (data:image/png;base64,...)
      required: true,
    },

    // ✅ Token & Attendance tracking
    tokenExpiry: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Unique constraint per event & email
registrationSchema.index({ eventId: 1, participantEmail: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);
