// routes/attendance.js
import express from "express";
import { scanAttendance } from "../controllers/attendanceController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/scan", adminAuth, scanAttendance);
export default router;
