// routes/participantRoutes.js
import express from "express";
import { getParticipantsByEvent } from "../controllers/participantController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

// ✅ Must be plural and use correct param name
router.get("/event/:eventId/participants", verifyToken, getParticipantsByEvent);


export default router;
