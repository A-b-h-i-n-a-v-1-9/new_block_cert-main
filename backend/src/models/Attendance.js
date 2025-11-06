// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    participantEmail: { type: String, required: true },
    attendedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate attendance for same participant-event pair
attendanceSchema.index({ eventId: 1, participantEmail: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
