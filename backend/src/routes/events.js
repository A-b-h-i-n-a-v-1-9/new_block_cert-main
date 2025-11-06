import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
} from "../controllers/eventController.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validateEvent } from "../utils/validator.js";

const router = express.Router();

// Create event
router.post("/", authenticate, requireRole(["clubadmin", "superadmin"]), validateEvent, createEvent);

// List events
router.get("/", getEvents);

// Get single event
router.get("/:id", getEventById);

// Update event
router.put("/:id", authenticate, requireRole(["clubadmin", "superadmin"]), validateEvent, updateEvent);

// Delete event
router.delete("/:id", authenticate, requireRole(["clubadmin", "superadmin"]), deleteEvent);

// Register for event
router.post("/:id/register", authenticate, registerForEvent);

export default router;
