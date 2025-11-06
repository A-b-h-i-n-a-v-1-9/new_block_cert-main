import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Participant from "../models/Participant.js";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

// ✅ CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET EVENT BY ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ REGISTER FOR EVENT (Auto from JWT)
export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Extract JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const participantName = decoded.name;
    const participantEmail = decoded.email;
    const participantId = decoded.userId;

    if (!participantName || !participantEmail) {
      return res.status(400).json({ error: "Participant info missing in token" });
    }

    // ✅ Verify event exists
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // ✅ Check if already registered
    const existingReg = await Registration.findOne({ eventId: id, participantEmail });
    if (existingReg) {
      return res.status(400).json({ error: "Already registered for this event" });
    }

    // ✅ Ensure participant exists in DB
    let participant = await Participant.findOne({ email: participantEmail });
    if (!participant) {
      participant = await Participant.create({
        name: participantName,
        email: participantEmail,
        walletAddress: "",
      });
    }

    // ✅ Generate QR Token & Code
    const qrToken = `${id}-${participantEmail}-${Date.now()}`;
    const qrCodeData = await QRCode.toDataURL(qrToken);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ✅ Create registration record
    const registration = await Registration.create({
      eventId: id,
      participantId: participant._id,
      participantName,
      participantEmail,
      qrToken,
      tokenExpiry: expiry,
      used: false,
    });

    // ✅ Increment event registration count
    await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });

    console.log(`✅ ${participantEmail} registered for event: ${event.title}`);

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
