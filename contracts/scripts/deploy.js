const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CertificateRegistry to Polygon Amoy...");
  
  // Get the contract factory
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  
  // Deploy the contract
  const registry = await CertificateRegistry.deploy();
  
  // Wait for deployment to complete
  await registry.waitForDeployment();
  
  // Get the contract address
  const address = await registry.getAddress();
  
  console.log("✅ CertificateRegistry deployed to:", address);
  console.log("🔍 Transaction hash:", registry.deploymentTransaction().hash);
  
  // Optional: Verify contract on Polygonscan
  console.log("📝 To verify on Polygonscan, run:");
  console.log(`npx hardhat verify --network amoy ${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});