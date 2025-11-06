import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import eventRoutes from "./routes/events.js";
import participantRoutes from "./routes/participantRoutes.js";
import registrationRoutes from "./routes/registrations.js";
import certificateRoutes from "./routes/certificates.js";
import attendanceRoutes from "./routes/attendance.js";
import authRoutes from "./routes/auth.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

//  routes
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/auth", authRoutes);

// Health 
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend running smoothly 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Root 
app.get("/", (req, res) => {
  res.json({
    message: "Blockcerts Backend API",
    version: "1.0.0",
  });
});
app.use(errorHandler);

export default app; 
