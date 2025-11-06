require("dotenv").config();
const { ethers } = require("hardhat");
const uploadToIPFS = require("../utils/uploadToIPFS");

async function main() {
  // Connect to existing deployed contract
  const contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS;
  const CertificateIssuer = await ethers.getContractFactory("CertificateIssuer");
  const certificateIssuer = await CertificateIssuer.attach(contractAddress);

  // Step 1: Upload Metadata to IPFS
  const metadata = {
    name: "Blockchain Developer Certificate",
    description: "Awarded to Abhinav for completing Blockchain Fundamentals",
    studentName: "Abhinav M",
    courseName: "Blockchain Fundamentals",
    issuedAt: new Date().toISOString(),
  };

  const ipfsHash = await uploadToIPFS(metadata);
  console.log(`✅ Uploaded metadata to IPFS: ${ipfsHash}`);

  // Step 2: Issue Certificate NFT
  const tx = await certificateIssuer.issueCertificate(
    "0xYourRecipientWalletAddress", // Replace with recipient wallet
    metadata.studentName,
    metadata.courseName,
    ipfsHash
  );
  await tx.wait();

  console.log(`🎉 Certificate issued on Amoy. IPFS hash: ${ipfsHash}`);
  console.log(`🔗 View contract: https://amoy.polygonscan.com/address/${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
