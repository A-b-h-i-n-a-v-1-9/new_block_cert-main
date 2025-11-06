// backend/src/utils/validator.js
import mongoose from "mongoose";

const isValidEmail = (email) => {
  // simple but practical regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const isValidDate = (v) => {
  const d = new Date(v);
  return !isNaN(d.valueOf());
};

export const validateEvent = (req, res, next) => {
  const { name, date } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Event 'name' is required." });
  }
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ error: "Event 'date' is required and must be a valid date." });
  }
  next();
};

export const validateRegistration = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Participant 'name' is required." });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Valid participant 'email' is required." });
  }
  next();
};

export const validateAttendanceScan = (req, res, next) => {
  const { qrToken } = req.body;
  if (!qrToken || typeof qrToken !== "string") {
    return res.status(400).json({ error: "'qrToken' is required in body." });
  }
  next();
};

export const validateMintCertificates = (req, res, next) => {
  if (!req.body.eventId)
    return res.status(400).json({ error: "Event ID is required to mint certificates" });
  next();
};
