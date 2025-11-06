// backend/src/utils/validator.js
import mongoose from "mongoose";

// ✅ Email validation (unchanged)
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// ✅ Date validation (unchanged)
const isValidDate = (v) => {
  const d = new Date(v);
  return !isNaN(d.valueOf());
};

/* =========================================================
   ✅ EVENT VALIDATION (Fixed for "title" + all required fields)
========================================================= */
export const validateEvent = (req, res, next) => {
  const {
    title,
    description,
    date,
    time,
    venue,
    category,
    maxParticipants,
  } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Event 'title' is required." });
  }

  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "Event 'description' is required." });
  }

  if (!date || !isValidDate(date)) {
    return res.status(400).json({ error: "Event 'date' is required and must be valid." });
  }

  if (!time || typeof time !== "string") {
    return res.status(400).json({ error: "Event 'time' is required." });
  }

  if (!venue || typeof venue !== "string" || !venue.trim()) {
    return res.status(400).json({ error: "Event 'venue' is required." });
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    return res.status(400).json({ error: "Event 'category' is required." });
  }

  if (maxParticipants === undefined || isNaN(maxParticipants) || maxParticipants < 1) {
    return res.status(400).json({ error: "Event 'maxParticipants' must be at least 1." });
  }

  next();
};

/* =========================================================
   ✅ REGISTRATION VALIDATION
========================================================= */
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

/* =========================================================
   ✅ ATTENDANCE VALIDATION
========================================================= */
export const validateAttendanceScan = (req, res, next) => {
  const { qrToken } = req.body;
  if (!qrToken || typeof qrToken !== "string") {
    return res.status(400).json({ error: "'qrToken' is required in body." });
  }
  next();
};

/* =========================================================
   ✅ CERTIFICATE VALIDATION
========================================================= */
export const validateMintCertificates = (req, res, next) => {
  if (!req.body.eventId)
    return res.status(400).json({ error: "Event ID is required to mint certificates." });
  next();
};
