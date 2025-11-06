import axios from "axios";

/**
 * Upload JSON metadata to IPFS using Pinata JWT authentication.
 * Returns the IPFS CID (hash) on success.
 */
export async function uploadToIPFS(metadata) {
  try {
    console.log(" Uploading to Pinata IPFS...");

    if (!process.env.PINATA_JWT) {
      throw new Error("Missing PINATA_JWT in environment variables");
    }

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    const ipfsHash = res.data.IpfsHash;
    console.log(` Uploaded to IPFS: ${ipfsHash}`);
    return ipfsHash;
  } catch (error) {
    console.error("❌ Pinata upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload certificate metadata to IPFS");
  }
}
