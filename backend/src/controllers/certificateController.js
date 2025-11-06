import Certificate from "../models/Certificate.js";
import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";
import Event from "../models/Event.js";
import blockchainService from "../services/blockchainService.js";
import { uploadToIPFS } from "../services/ipfsService.js";
import PDFDocument from "pdfkit";

/**
 * 🧾 Get all certificates (Admin)
 */
export const getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate("eventId")
      .sort({ createdAt: -1 });
    res.json(certs);
  } catch (err) {
    console.error("❌ Error fetching certificates:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🎯 Mint certificates for all attendees of an event
 */
export const mintCertificates = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const attendees = await Attendance.find({ eventId });
    if (attendees.length === 0)
      return res.status(400).json({ error: "No attendance records found for this event" });

    console.log(`🎯 Minting ${attendees.length} certificates for ${event.title}`);

    const results = [];

    for (const att of attendees) {
      try {
        const { participantEmail } = att;

        // ✅ Fetch participant and ensure valid wallet address
        const participant = (await Participant.findOne({ email: participantEmail })) || {};
        const walletAddress =
          participant.walletAddress && participant.walletAddress.trim() !== ""
            ? participant.walletAddress
            : "0x0000000000000000000000000000000000000000";

        console.log("🧾 Minting certificate for:", {
          participantEmail,
          walletAddress,
          eventTitle: event.title,
        });

        // 🪶 Upload metadata to IPFS before mint
        const metadata = {
          participantEmail,
          eventTitle: event.title,
          issuedAt: new Date().toISOString(),
        };

        const ipfsHash = await uploadToIPFS(metadata);
        console.log(`✅ Uploaded metadata to IPFS: ${ipfsHash}`);

        // 🧱 Mint certificate on blockchain
        const blockchainResult = await blockchainService.issueCertificate(
          participantEmail,
          event.title,
          ipfsHash,
          walletAddress
        );

        // Normalize transaction hash
        const txHash =
          blockchainResult.txHash ||
          blockchainResult.transactionHash ||
          blockchainResult.tx?.hash ||
          null;

        // ✅ Save certificate record to MongoDB
        await Certificate.create({
          eventId,
          participantEmail,
          certId: blockchainResult.certId,
          walletAddress,
          ipfsHash,
          txHash,
        });

        results.push({
          participantEmail,
          certId: blockchainResult.certId,
          txHash,
          status: "success",
        });
      } catch (error) {
        console.error(`❌ Error minting for ${att.participantEmail}:`, error.message);
        results.push({
          participantEmail: att.participantEmail,
          error: error.message,
          status: "failed",
        });
      }
    }

    res.json({ message: "✅ Minting completed", results });
  } catch (err) {
    console.error("❌ Minting failed:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🔍 Verify certificate
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params;

    const blockchainData = await blockchainService.verifyCertificate(certId);
    const dbCertificate = await Certificate.findOne({ certId })
      .populate("eventId")
      .populate("participantId");

    res.json({
      blockchain: blockchainData,
      database: dbCertificate,
      verified: true,
    });
  } catch (error) {
    console.error("❌ Certificate verification failed:", error);
    res.status(404).json({
      error: "Certificate not found or invalid",
      verified: false,
    });
  }
};

/**
 * 🌐 Blockchain Network Info
 */
export const getNetworkInfo = async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    res.json({
      success: true,
      network: networkInfo,
      message: "Connected to Polygon Amoy successfully!",
    });
  } catch (error) {
    console.error("❌ Network info error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 🎓 Generate certificate PDF and upload metadata to IPFS
 */
export const generateCertificatePDF = async (req, res) => {
  try {
    const { certId } = req.params;

    const cert = await Certificate.findOne({ certId }).populate("eventId");
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // 🧾 Create PDF in memory
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // 🪶 Upload metadata to IPFS (again for archival)
      const metadata = {
        certId: cert.certId,
        participantEmail: cert.participantEmail,
        eventTitle: cert.eventId?.title || "Untitled Event",
        issuedAt: cert.issuedAt,
        txHash: cert.txHash,
      };

      try {
        const ipfsHash = await uploadToIPFS(metadata);
        console.log(`✅ Uploaded certificate metadata to IPFS: ${ipfsHash}`);

        // Save hash in DB
        cert.ipfsHash = ipfsHash;
        await cert.save();
      } catch (err) {
        console.warn("⚠️ IPFS upload failed during PDF generation:", err.message);
      }

      // 🧾 Return PDF to browser
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${cert.certId}.pdf"`
      );
      res.send(pdfBuffer);
    });

    // 🎨 PDF Design
    const { width, height } = doc.page;
    doc.rect(0, 0, width, height).fill("#fafafa");

    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(32)
      .text("Certificate of Participation", 0, 100, { align: "center" });

    doc
      .moveDown(1)
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#374151")
      .text("This is to certify that", { align: "center" });

    doc
      .moveDown(1)
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#4f46e5")
      .text(cert.participantEmail, { align: "center" });

    doc
      .moveDown(1)
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#111827")
      .text(
        `has successfully participated in the event "${cert.eventId?.title}"`,
        { align: "center", width: width - 100 }
      );

    doc
      .moveDown(2)
      .fontSize(14)
      .fillColor("#6b7280")
      .text(`Certificate ID: ${cert.certId}`, { align: "center" })
      .text(`Transaction: ${cert.txHash}`, { align: "center" })
      .text(`Issued on: ${new Date(cert.issuedAt).toLocaleDateString()}`, {
        align: "center",
      });

    doc
      .moveDown(3)
      .fontSize(16)
      .fillColor("#111827")
      .text("_________________________", { align: "center" })
      .moveDown(0.3)
      .fontSize(14)
      .fillColor("#6b7280")
      .text("Authorized Signature", { align: "center" });

    doc.end();
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    res.status(500).json({ error: err.message });
  }
};
