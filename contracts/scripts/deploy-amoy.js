const { ethers } = require("hardhat");

async function main() {
  console.log("🎯 Starting deployment to Polygon Amoy...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get the contract factory
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  
  console.log("📦 Deploying CertificateRegistry...");
  
  // Deploy the contract
  const registry = await CertificateRegistry.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await registry.waitForDeployment();
  
  const contractAddress = await registry.getAddress();
  console.log("✅ CertificateRegistry deployed to:", contractAddress);
  
  // Get transaction details
  const deploymentTransaction = registry.deploymentTransaction();
  console.log("🔗 Transaction hash:", deploymentTransaction.hash);
  console.log("📊 Gas used:", deploymentTransaction.gasLimit.toString());
  
  // Verify the contract (optional - you'll need Polygonscan API key)
  console.log("\n🎉 Deployment successful!");
  console.log("📝 Contract address:", contractAddress);
  console.log("👤 Deployed by:", deployer.address);
  console.log("🔍 View on Polygonscan: https://amoy.polygonscan.com/address/" + contractAddress);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });