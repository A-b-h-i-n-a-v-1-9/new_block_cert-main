import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Attendance from "../models/Attendance.js";

export const scanAttendance = async (req, res) => {
  try {
    console.log("📥 Incoming QR Scan Request:", req.body);

    const { qrToken } = req.body;
    if (!qrToken) {
      console.log("❌ Missing qrToken in body");
      return res.status(400).json({ error: "QR token missing" });
    }

    const reg = await Registration.findOne({ qrToken });
    console.log("🔍 Found Registration:", reg);

    if (!reg) {
      console.log("❌ Registration not found for token:", qrToken);
      return res.status(404).json({ error: "Invalid or unknown QR token" });
    }

    if (reg.tokenExpiry && reg.tokenExpiry < new Date()) {
      console.log("⚠️ Token expired for:", reg.participantEmail);
      return res.status(400).json({ error: "QR code expired!" });
    }

    if (reg.used) {
      console.log("⚠️ Already used QR:", reg.participantEmail);
      return res.status(200).json({ message: "Already checked in!" });
    }

    console.log("🧩 Attempting to create Attendance for:", {
      eventId: reg.eventId,
      participantEmail: reg.participantEmail || reg.email,
    });

    const attendance = await Attendance.create({
      eventId: new mongoose.Types.ObjectId(reg.eventId),
      participantEmail: reg.participantEmail || reg.email,
      attendedAt: new Date(),
    });

    console.log("✅ Attendance created successfully:", attendance);

    reg.used = true;
    await reg.save();

    console.log("🟢 Registration marked as used");

    res.status(200).json({
      message: `Attendance marked successfully for ${reg.participantEmail}`,
    });
  } catch (err) {
    console.error("❌ Attendance marking error:", err);
    res.status(500).json({ error: err.message });
  }
};
