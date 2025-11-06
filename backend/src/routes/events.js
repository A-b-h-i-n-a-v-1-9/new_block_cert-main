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

router.post(
  "/",
  authenticate,
  requireRole(["admin", "clubadmin", "superadmin"]),
  validateEvent,
  createEvent
);

router.get("/", getEvents);
router.get("/check/:eventId", checkUserRegistration);
router.get("/:id", getEventById);
router.put("/:id", authenticate, requireRole(["clubadmin", "superadmin"]), validateEvent, updateEvent);
router.delete("/:id", authenticate, requireRole(["clubadmin", "superadmin"]), deleteEvent);
router.post("/:id/register", authenticate, registerForEvent);

export default router;
