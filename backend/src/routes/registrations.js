import express from "express";
import {
  registerParticipant,
  getRegistrationsByEvent,
} from "../controllers/registrationController.js";
import { validateRegistration } from "../utils/validator.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register participant for event (public)
router.post("/:eventId/register", validateRegistration, registerParticipant);

// ✅ Get all registrations for admin dashboard (secured)
router.get("/event/:eventId", adminAuth, getRegistrationsByEvent);

export default router;
