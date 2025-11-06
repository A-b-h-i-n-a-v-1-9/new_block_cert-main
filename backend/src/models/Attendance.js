import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  participantEmail: { type: String, required: true },
  checkedInAt: { type: Date, default: Date.now }, // ✅ matches controller
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
