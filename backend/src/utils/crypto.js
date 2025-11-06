// backend/src/utils/crypto.js
import crypto from "crypto";
import { PRIVATE_KEY } from "../keys.js";

if (!PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY not found. Please set PRIVATE_KEY or PRIVATE_KEY_PATH in .env");
}

/**
 * Generate a signed QR token
 * @param {string} eventId
 * @param {string} participantId
 * @returns {string} base64 encoded signed token
 */
export const generateToken = (eventId, participantId) => {
  const timestamp = Date.now().toString();
  const payload = `${eventId}:${participantId}:${timestamp}`;
  const signature = crypto.createHmac("sha256", PRIVATE_KEY).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64");
  return token;
};

/**
 * Verify token signature and return decoded data
 * @param {string} token
 * @returns {object|null} { eventId, participantId, timestamp } if valid else null
 */
export const verifyToken = (token) => {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [eventId, participantId, timestamp, signature] = decoded.split(":");
    const computed = crypto.createHmac("sha256", PRIVATE_KEY)
      .update(`${eventId}:${participantId}:${timestamp}`)
      .digest("hex");

    if (computed !== signature) return null;
    return { eventId, participantId, timestamp };
  } catch {
    return null;
  }
};
