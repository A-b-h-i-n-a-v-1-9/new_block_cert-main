const { ethers } = require("hardhat");

async function main() {
  const CertificateIssuer = await ethers.getContractFactory("CertificateIssuer");
  const certificateIssuer = await CertificateIssuer.deploy();

  // ✅ No need for .deployed() — just wait for deploy transaction
  await certificateIssuer.waitForDeployment();

  console.log("CertificateIssuer deployed to:", await certificateIssuer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
