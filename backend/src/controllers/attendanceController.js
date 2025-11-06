// controllers/attendanceController.js
import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Attendance from "../models/Attendance.js";

export const scanAttendance = async (req, res) => {
  try {
    console.log("📥 Incoming QR Scan Request:", req.body);

    const { qrToken } = req.body;
    if (!qrToken)
      return res.status(400).json({ error: "QR token missing" });

    const reg = await Registration.findOne({ qrToken });
    if (!reg) return res.status(404).json({ error: "Invalid or unknown QR token" });

    if (reg.tokenExpiry && reg.tokenExpiry < new Date()) {
      return res.status(400).json({ error: "QR code expired!" });
    }

    if (reg.used) {
      return res.status(200).json({ message: "Already checked in!" });
    }

    // ✅ Create attendance record
    const attendance = await Attendance.create({
      eventId: new mongoose.Types.ObjectId(reg.eventId),
      participantEmail: reg.participantEmail || reg.email,
      attendedAt: new Date(),
    });

    reg.used = true;
    await reg.save();

    res.status(200).json({
      message: `✅ Attendance marked successfully for ${reg.participantEmail}`,
      attendance,
    });
  } catch (err) {
    console.error("❌ Attendance marking error:", err);
    res.status(500).json({ error: err.message });
  }
};
