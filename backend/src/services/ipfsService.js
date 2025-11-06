import axios from "axios";
import FormData from "form-data";

/**
 * Upload JSON metadata to IPFS (Pinata)
 */
export async function uploadToIPFS(metadata, displayName = "Certificate_Metadata") {
  try {
    console.log("🪶 Uploading metadata JSON to Pinata IPFS...");
    const body = {
      pinataContent: metadata,
      pinataMetadata: {
        name: displayName,
        keyvalues: {
          event: metadata.eventTitle || "unknown_event",
          participant: metadata.participantName || "unknown_participant",
        },
      },
    };

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.error("❌ IPFS upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload metadata to IPFS");
  }
}


/**
 * Upload a file (like PDF) to IPFS (Pinata)
 */
export async function uploadFileToIPFS(buffer, filename = "file.pdf") {
  try {
    console.log("📄 Uploading PDF to Pinata IPFS...");
    if (!process.env.PINATA_JWT) throw new Error("Missing PINATA_JWT");

    const formData = new FormData();
    formData.append("file", buffer, { filename });

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    const ipfsHash = res.data?.IpfsHash;
    if (!ipfsHash) throw new Error("No IpfsHash returned by Pinata");

    return ipfsHash;
  } catch (error) {
    console.error("❌ Pinata file upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload PDF file to IPFS");
  }
}
