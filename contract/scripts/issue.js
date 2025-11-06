const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Replace with your deployed contract address
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CertificateIssuer = await ethers.getContractFactory("CertificateIssuer");
  const contract = CertificateIssuer.attach(contractAddress);

  // Details for certificate
  const recipient = deployer.address; // Minting to yourself for test
  const tokenURI = "https://example.com/metadata/1.json"; // Replace with actual URI or IPFS

  const tx = await contract.issueCertificate(recipient, tokenURI);
  const receipt = await tx.wait();

  console.log("✅ Certificate issued!");
  console.log("Transaction Hash:", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
