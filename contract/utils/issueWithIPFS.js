require("dotenv").config();
const { ethers } = require("hardhat");
const uploadToIPFS = require("../utils/uploadToIPFS");

async function main() {
  const ipfsHash = await uploadToIPFS("./certificate.pdf");
  console.log("IPFS Hash:", ipfsHash);

  const CertificateIssuer = await ethers.getContractFactory("CertificateIssuer");
  const issuer = await CertificateIssuer.attach(process.env.CONTRACT_ADDRESS);

  const tx = await issuer.issueCertificate(
    "0xRecipientAddressHere",
    "John Doe",
    "Solidity Basics",
    `ipfs://${ipfsHash}`
  );
  await tx.wait();
  console.log("Certificate issued!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
