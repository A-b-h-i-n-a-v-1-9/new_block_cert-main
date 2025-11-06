// routes/certificates.js
import express from "express";
import {
  getAllCertificates,
  mintCertificates,
  verifyCertificate,
  getNetworkInfo,
  generateCertificatePDF,
} from "../controllers/certificateController.js";
import { validateMintCertificates } from "../utils/validator.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📄 All routes
router.get("/", getAllCertificates);
router.post("/mint", adminAuth, validateMintCertificates, mintCertificates);
router.get("/verify/:certId", verifyCertificate);
router.get("/network-info", getNetworkInfo);
router.get("/:certId/pdf", generateCertificatePDF);

export default router;
