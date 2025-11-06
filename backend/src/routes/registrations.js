import express from "express";
import {
  registerParticipant,
  getRegistrationsByEvent,
  getRegistrationCount,
} from "../controllers/registrationController.js";
import { validateRegistration } from "../utils/validator.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:eventId/register", validateRegistration, registerParticipant);
router.get("/event/:eventId", adminAuth, getRegistrationsByEvent);

// ✅ This one fixes your count request
router.get("/count/:eventId", getRegistrationCount);

export default router;
