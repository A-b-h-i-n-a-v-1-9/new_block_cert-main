import crypto from "crypto";
import jwt from "jsonwebtoken";

const PRIVATE_KEY = process.env.QR_PRIVATE_KEY; // RSA private key (PEM format)
const PUBLIC_KEY = process.env.QR_PUBLIC_KEY;   // RSA public key (PEM format)

// Generate QR token
export function generateQRToken(eventId, participantId) {
  const payload = {
    eventId,
    participantId,
    ts: Date.now()
  };

  // Sign with RSA private key
  const token = jwt.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "5m" // token valid for 5 minutes
  });

  return token; // frontend will embed this into QR code
}

// Verify QR token
export function verifyQRToken(token) {
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });
    return { valid: true, data: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
