// backend/src/keys.js
import fs from "fs";
import path from "path";

const readFileIfPath = (p) => {
  if (!p) return null;
  try {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved)) return fs.readFileSync(resolved, "utf8");
    return null;
  } catch (err) {
    console.warn("keys.js readFileIfPath error:", err.message);
    return null;
  }
};

export const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  readFileIfPath(process.env.PRIVATE_KEY_PATH) ||
  null;

export const PUBLIC_KEY =
  process.env.PUBLIC_KEY ||
  readFileIfPath(process.env.PUBLIC_KEY_PATH) ||
  null;

export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-token-not-set";

export const QR_TOKEN_EXPIRY_MINUTES = Number(process.env.QR_TOKEN_EXPIRY_MINUTES) || 15;

export default {
  PRIVATE_KEY,
  PUBLIC_KEY,
  ADMIN_TOKEN,
  QR_TOKEN_EXPIRY_MINUTES,
};
