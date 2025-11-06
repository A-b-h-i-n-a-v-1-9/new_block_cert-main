import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readFileIfPath = (p) => {
  if (!p) return null;
  try {
    const resolved = path.resolve(__dirname, p);
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
  "fallback-private-key-for-development";

export const PUBLIC_KEY =
  process.env.PUBLIC_KEY ||
  readFileIfPath(process.env.PUBLIC_KEY_PATH) ||
  null;

export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-secret-token-2024" ;

export const QR_TOKEN_EXPIRY_MINUTES = Number(process.env.QR_TOKEN_EXPIRY_MINUTES) || 15;

export default {
  PRIVATE_KEY,
  PUBLIC_KEY,
  ADMIN_TOKEN,
  QR_TOKEN_EXPIRY_MINUTES,
};