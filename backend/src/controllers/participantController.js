import Participant from "../models/Participant.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

export const getParticipantsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const registrations = await Registration.find({ eventId })
      .populate("participantId", "name email walletAddress")
      .lean();

    // If no registrations found, just return empty array
    if (!registrations || registrations.length === 0) {
      return res.json({ eventId, participants: [] });
    }

    const participants = registrations.map((r) => ({
      id: r.participantId?._id,
      name: r.participantId?.name,
      email: r.participantId?.email,
      walletAddress: r.participantId?.walletAddress,
      registeredAt: r.createdAt,
      attended: r.used || false,
      certificateIssued: r.certificateIssued || false,
      qrToken: r.qrToken,
    }));

    res.json({ eventId, participants });
  } catch (err) {
    console.error("❌ Error in getParticipantsByEvent:", err.message);
    res.status(500).json({ error: err.message });
  }
};
