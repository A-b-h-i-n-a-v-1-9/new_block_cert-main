const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CertificateIssuer = await ethers.getContractFactory("CertificateIssuer");
  const contract = CertificateIssuer.attach(contractAddress);

  const tokenId = 0; // First NFT minted

  const owner = await contract.ownerOf(tokenId);
  const uri = await contract.tokenURI(tokenId);

  console.log(`📄 Certificate #${tokenId}`);
  console.log("👤 Owner:", owner);
  console.log("🔗 Token URI:", uri);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
