import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event", 
    required: true 
  },
  participantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Participant" 
  },
  participantName: { type: String, required: true },
  participantEmail: { type: String, required: true },
  qrToken: { type: String, required: true },
  tokenExpiry: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

registrationSchema.index({ eventId: 1, participantEmail: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);
