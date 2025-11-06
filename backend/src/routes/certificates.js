// backend/src/routes/certificates.js
import express from "express";
import {
  getAllCertificates,
  mintCertificates,
  verifyCertificate,
  getNetworkInfo,
  generateCertificatePDF
} from "../controllers/certificateController.js";


import { validateMintCertificates } from "../utils/validator.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/certificates - Get all certificates
router.get("/", getAllCertificates);

// POST /api/certificates/mint - Generate certificates for event attendees
// Minting certificates should be restricted to admins
import { adminAuth } from "../middleware/authMiddleware.js";

router.post(
  "/mint",
  adminAuth, // ✅ allow x-admin-token for admin panel
  validateMintCertificates,
  mintCertificates
);


// GET /api/certificates/verify/:certId - Verify a certificate
router.get("/verify/:certId", verifyCertificate);

// GET /api/certificates/network-info - Get system information
router.get("/network-info", getNetworkInfo);
router.get("/:certId/pdf", generateCertificatePDF);


export default router;