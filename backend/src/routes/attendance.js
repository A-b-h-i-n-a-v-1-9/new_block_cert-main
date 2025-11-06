// routes/attendance.js
import express from "express";
import {
  scanAttendance,
  getAttendanceByEvent,   // ✅ Import the event-wise fetch function
} from "../controllers/attendanceController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Route to mark attendance via QR scan
router.post("/scan", adminAuth, scanAttendance);

// ✅ New route to fetch attendance records for a specific event
router.get("/:eventId", getAttendanceByEvent);

export default router;
