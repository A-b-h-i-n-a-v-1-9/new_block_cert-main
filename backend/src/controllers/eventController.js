import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Participant from "../models/Participant.js";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

/* =========================================================
   ✅ CREATE EVENT
========================================================= */
export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================================================
   ✅ GET ALL EVENTS
   (Counts dynamically from DB so it's always fresh)
========================================================= */
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    const eventsWithCounts = await Promise.all(
      events.map(async (ev) => {
        const regCount = await Registration.countDocuments({ eventId: ev._id });
        return { ...ev.toObject(), registeredCount: regCount };
      })
    );
    res.json(eventsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   ✅ GET EVENT BY ID
   (Dynamic registration count)
========================================================= */
// ✅ GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const registeredCount = await Registration.countDocuments({
      eventId: event._id,
    });

    res.json({ ...event.toObject(), registeredCount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


/* =========================================================
   ✅ UPDATE EVENT
========================================================= */
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================================================
   ✅ DELETE EVENT
========================================================= */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   ✅ REGISTER FOR EVENT (JWT Auto)
   - Dynamic count (no stale values)
   - QR stored permanently
========================================================= */
export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 Verify JWT
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const participantName = decoded.name;
    const participantEmail = decoded.email;
    const participantId = decoded.userId;

    if (!participantEmail)
      return res.status(400).json({ error: "Invalid user info in token" });

    // ✅ Event existence
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // ✅ Already registered?
    const existingReg = await Registration.findOne({
      eventId: id,
      participantEmail,
    });
    if (existingReg)
      return res
        .status(400)
        .json({ error: "Already registered for this event" });

    // ✅ Ensure participant exists
    let participant = await Participant.findOne({ email: participantEmail });
    if (!participant) {
      participant = await Participant.create({
        name: participantName,
        email: participantEmail,
        walletAddress: "",
      });
    }

    // ✅ Generate & store QR
    const qrToken = `${id}-${participantEmail}-${Date.now()}`;
    const qrCodeData = await QRCode.toDataURL(qrToken);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Registration.create({
      eventId: id,
      participantId: participant._id,
      participantName,
      participantEmail,
      qrToken,
      qrCode: qrCodeData, // base64
      tokenExpiry: expiry,
      used: false,
    });

    // ✅ Recalculate event registrations dynamically
    const regCount = await Registration.countDocuments({ eventId: id });
    await Event.findByIdAndUpdate(id, { registeredCount: regCount });

    res.status(201).json({
      message: "Registered successfully",
      qrCode: qrCodeData,
      qrToken,
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   ✅ CHECK REGISTRATION STATUS FOR LOGGED-IN USER
   (returns registered + QR)
========================================================= */
export const checkUserRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const participantEmail = decoded.email;
    if (!participantEmail)
      return res.status(400).json({ error: "Invalid user info in token" });

    const registration = await Registration.findOne({
      eventId,
      participantEmail,
    });

    if (!registration)
      return res.json({ registered: false, qrCode: null });

    res.json({
      registered: true,
      qrCode: registration.qrCode,
    });
  } catch (err) {
    console.error("❌ Check registration failed:", err);
    res.status(500).json({ error: err.message });
  }
};
