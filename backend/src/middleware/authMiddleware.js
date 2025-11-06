// // backend/src/middleware/authMiddleware.js
// export const adminAuth = (req, res, next) => {
//   try {
//     const token = req.headers["x-admin-token"];
//     if (!token) return res.status(401).json({ error: "No admin token provided" });

//     if (token !== process.env.ADMIN_TOKEN)
//       return res.status(403).json({ error: "Unauthorized access" });

//     next();
//   } catch (err) {
//     res.status(500).json({ error: "Auth middleware error" });
//   }
// };

import jwt from "jsonwebtoken";
import { ADMIN_TOKEN } from "../keys.js"; // define ADMIN_TOKEN in your .env or keys.js

// ✅ Regular JWT auth (for logged users)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// ✅ Admin-only token middleware
export const adminAuth = (req, res, next) => {
  const token = req.header("x-admin-token");
  if (!token) {
    return res.status(401).json({ error: "No admin token provided" });
  }

  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Invalid admin token" });
  }

  next();
};
