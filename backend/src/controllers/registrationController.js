import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import QRCode from "qrcode";

// ✅ Register Participant
export const registerParticipant = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, walletAddress } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const existing = await Registration.findOne({ eventId, participantEmail: email });
    if (existing) return res.status(400).json({ error: "Already registered" });

    const qrToken = `${eventId}-${email}-${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrToken);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const registration = await Registration.create({
      eventId,
      participantName: name,
      participantEmail: email,
      walletAddress,
      qrToken,
      qrCode,
      tokenExpiry: expiry,
      used: false,
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    res.status(201).json({
      message: "Registered successfully",
      qrCode: registration.qrCode,
    });
  } catch (err) {
    console.error("❌ Registration failed:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Admin View: Get all registrations by event
export const getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const registrations = await Registration.find({ eventId }).lean();

    const participants = registrations.map((r) => ({
      name: r.participantName,
      email: r.participantEmail,
      walletAddress: r.walletAddress || "",
      attended: r.used || false,
      qrCode: r.qrCode,
    }));

    res.json({ eventId, participants });
  } catch (err) {
    console.error("❌ Fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Dynamic count for frontend
export const getRegistrationCount = async (req, res) => {
  try {
    const { eventId } = req.params;
    const count = await Registration.countDocuments({ eventId });
    res.json({ count });
  } catch (err) {
    console.error("❌ Count failed:", err);
    res.status(500).json({ error: err.message });
  }
};
