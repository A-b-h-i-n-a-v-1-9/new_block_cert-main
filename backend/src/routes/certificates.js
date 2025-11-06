import express from "express";
import mongoose from "mongoose"; // ✅ needed for ObjectId casting
import {
  getAllCertificates,
  mintCertificates,
  verifyCertificate,
  getNetworkInfo,
  generateCertificatePDF,
} from "../controllers/certificateController.js";
import Certificate from "../models/Certificate.js";
import { validateMintCertificates } from "../utils/validator.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Get all certificates for admin
 */
router.get("/", getAllCertificates);

/**
 * ✅ Get certificates for a specific event (used by frontend)
 */
router.get("/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // 🔧 Cast eventId to ObjectId to ensure match works
    const objectId =
      mongoose.Types.ObjectId.isValid(eventId)
        ? new mongoose.Types.ObjectId(eventId)
        : eventId;

    const certs = await Certificate.find({ eventId: objectId }).populate("eventId");

    res.status(200).json(certs || []);
  } catch (error) {
    console.error("❌ Error fetching certificates by event:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🪙 Mint new certificates
 */
router.post("/mint", adminAuth, validateMintCertificates, mintCertificates);

/**
 * 🔍 Verify a specific certificate by certId
 */
router.get("/verify/:certId", verifyCertificate);

/**
 * 🌐 Get blockchain network info
 */
router.get("/network-info", getNetworkInfo);

/**
 * 📄 Generate certificate PDF manually (optional)
 */
router.get("/:certId/pdf", generateCertificatePDF);

export default router;
