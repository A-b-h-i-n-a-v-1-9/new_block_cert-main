require("dotenv").config();
const { ethers } = require("hardhat");
const uploadToIPFS = require("../utils/uploadToIPFS");

async function main() {
  const filePath = "./certificate.pdf"; // change path if needed
  const ipfsHash = await uploadToIPFS(filePath);

  const [deployer] = await ethers.getSigners();
  const certificateIssuer = await ethers.getContractAt(
    "CertificateIssuer",
    process.env.CONTRACT_ADDRESS
  );

  const tx = await certificateIssuer.issueCertificate(
    deployer.address,
    "John Doe",
    "Blockchain Basics",
    ipfsHash
  );

  await tx.wait();
  console.log(`✅ Certificate issued with IPFS hash: ${ipfsHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
