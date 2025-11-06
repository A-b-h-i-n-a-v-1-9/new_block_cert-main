import { uploadFileToIPFS } from "./uploadFileToIPFS.js";
import { generateCertificateImage } from "./generateCertificateImage.js";
import blockchainService from "./blockchainService.js";
import Certificate from "../models/Certificate.js";
import fs from "fs";

export async function batchMintCertificates(event, attendees) {
  const results = [];

  for (const attendee of attendees) {
    try {
      const certId = `CERT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      // 🖼️ 1. Generate a certificate PNG
      const filePath = await generateCertificateImage(
        attendee.name,
        event.title,
        certId
      );

      // ☁️ 2. Upload to IPFS
      const ipfsHash = await uploadFileToIPFS(filePath, `Certificate_${attendee.name}.png`);

      // 🧹 3. Delete local temp file
      fs.unlinkSync(filePath);

      // 💎 4. Store on blockchain
      const blockchainResult = await blockchainService.issueCertificate(
        attendee.name,
        event._id.toString(),
        ipfsHash,
        attendee.walletAddress || "0x0000000000000000000000000000000000000000"
      );

      const txHash =
        blockchainResult.txHash ||
        blockchainResult.transactionHash ||
        blockchainResult.tx?.hash ||
        null;

      // 🗄️ 5. Save to DB
      const cert = await Certificate.create({
        eventId: event._id,
        participantEmail: attendee.email,
        certId: blockchainResult.certId || certId,
        walletAddress: attendee.walletAddress,
        ipfsHash,
        txHash,
      });

      results.push({
        status: "success",
        participant: attendee.email,
        ipfsHash,
        certId: cert.certId,
        txHash,
      });
    } catch (err) {
      console.error(`❌ Error minting for ${attendee.email}:`, err);
      results.push({
        status: "failed",
        participant: attendee.email,
        error: err.message,
      });
    }
  }

  return results;
}
