// controllers/certificateController.js
import Certificate from "../models/Certificate.js";
import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";
import Event from "../models/Event.js";
import blockchainService from "../services/blockchainService.js";
import { uploadToIPFS, uploadFileToIPFS } from "../services/ipfsService.js";
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
 * 🧩 Helper — Generate and upload certificate PDF to IPFS
 */
async function generateAndUploadPDF(cert) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ layout: "landscape", size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      try {
        const participant = await Participant.findOne({
          email: cert.participantEmail,
        });

        const safeName = (participant?.name || cert.participantEmail.split("@")[0])
          .replace(/[^a-z0-9]/gi, "_");
        const safeEvent =
          cert.eventId?.title?.replace(/[^a-z0-9]/gi, "_") || "event";

        const filename = `${safeName}_${safeEvent}.pdf`;

        console.log(`📄 Uploading PDF to Pinata IPFS as "${filename}"...`);
        const pdfHash = await uploadFileToIPFS(pdfBuffer, filename);
        cert.pdfIpfsHash = pdfHash;
        await cert.save();
        console.log(`✅ Uploaded certificate PDF to IPFS: ${pdfHash}`);
        resolve(pdfHash);
      } catch (err) {
        console.error("❌ Failed to upload PDF to IPFS:", err.message);
        reject(err);
      }
    });

    // 🎨 PDF Layout
    const { width, height } = doc.page;
    doc.rect(0, 0, width, height).fill("#fafafa");

    // 👤 Use participant name if available
    const participant = await Participant.findOne({ email: cert.participantEmail });
    const displayName = participant?.name || cert.participantEmail;

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
      .text(displayName, { align: "center" });

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
  });
}

/**
 * 🎯 Mint certificates — only for attendees present in Attendance table
 */
export const mintCertificates = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // ✅ Only attendees present in Attendance
    const attendees = await Attendance.find({ eventId });
    if (attendees.length === 0)
      return res
        .status(400)
        .json({ error: "No attendance records found for this event" });

    console.log(`🎯 Minting ${attendees.length} certificates for ${event.title}`);

    const results = [];

    for (const att of attendees) {
      try {
        const { participantEmail } = att;

        // 🔒 Skip already issued
        const existing = await Certificate.findOne({ eventId, participantEmail });
        if (existing) {
          results.push({ participantEmail, status: "already_issued" });
          continue;
        }

        const participant = await Participant.findOne({ email: participantEmail });
        if (!participant) {
          console.warn(`⚠️ No participant record found for ${participantEmail}`);
          results.push({ participantEmail, status: "participant_not_found" });
          continue;
        }

        const walletAddress =
          participant.walletAddress?.trim() ||
          "0x0000000000000000000000000000000000000000";

        console.log("🧾 Minting certificate for:", {
          participantEmail,
          walletAddress,
          eventTitle: event.title,
        });

        // 🪶 Upload metadata JSON to IPFS
        const metadata = {
          participantEmail,
          participantName: participant.name,
          eventTitle: event.title,
          issuedAt: new Date().toISOString(),
        };

        const fileName = `${participant.name || "Participant"}_${event.title}`;
        const ipfsHash = await uploadToIPFS(metadata, fileName);
        console.log(`✅ Uploaded metadata JSON to IPFS: ${ipfsHash}`);

        // 🧱 Mint on blockchain
        const blockchainResult = await blockchainService.issueCertificate(
          participantEmail,
          event.title,
          ipfsHash,
          walletAddress
        );

        const txHash =
          blockchainResult.txHash ||
          blockchainResult.transactionHash ||
          blockchainResult.tx?.hash ||
          null;

        const cert = await Certificate.create({
          eventId,
          participantEmail,
          certId: blockchainResult.certId,
          walletAddress,
          metadataIpfsHash: ipfsHash,
          txHash,
        });

        // 📄 Populate event info & auto-generate PDF
        const populatedCert = await Certificate.findById(cert._id).populate("eventId");
        await generateAndUploadPDF(populatedCert);

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
    const dbCertificate = await Certificate.findOne({ certId }).populate("eventId");

    if (!dbCertificate)
      return res.status(404).json({ error: "Certificate not found" });

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
 * 🎓 Generate certificate PDF manually (if needed)
 */
export const generateCertificatePDF = async (req, res) => {
  try {
    const { certId } = req.params;
    const cert = await Certificate.findOne({ certId }).populate("eventId");

    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    const pdfHash = await generateAndUploadPDF(cert);
    res.json({
      message: "✅ Certificate PDF generated and uploaded",
      pdfIpfsHash: pdfHash,
    });
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    res.status(500).json({ error: err.message });
  }
};
