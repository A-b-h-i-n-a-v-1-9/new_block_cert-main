import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  checkUserRegistration,
} from "../controllers/eventController.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validateEvent } from "../utils/validator.js";

const router = express.Router();

// ✅ Create event
router.post("/", authenticate, requireRole(["clubadmin", "superadmin"]), validateEvent, createEvent);

// ✅ Get all events
router.get("/", getEvents);

// ✅ 🔥 Move this ABOVE the generic :id route
+router.get("/check/:eventId", checkUserRegistration);

// ✅ Get single event
router.get("/:id", getEventById);

// ✅ Update event
router.put("/:id", authenticate, requireRole(["clubadmin", "superadmin"]), validateEvent, updateEvent);

// ✅ Delete event
router.delete("/:id", authenticate, requireRole(["clubadmin", "superadmin"]), deleteEvent);

// ✅ Register for event
router.post("/:id/register", authenticate, registerForEvent);

export default router;
