const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateIssuer with IPFS", function () {
  let issuer, owner, recipient;

  beforeEach(async () => {
    [owner, recipient] = await ethers.getSigners();
    const CertificateIssuer = await ethers.getContractFactory("CertificateIssuer");
    issuer = await CertificateIssuer.deploy();
    await issuer.waitForDeployment();
  });

  it("Should issue certificate with IPFS hash", async () => {
    const ipfsHash = "ipfs://QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH";
    const tx = await issuer.issueCertificate(
      recipient.address,
      "Alice",
      "Blockchain 101",
      ipfsHash
    );
    await tx.wait();

    // Verify token URI
    const tokenURI = await issuer.tokenURI(1);
    expect(tokenURI).to.equal(ipfsHash);

    // Verify struct data
    const cert = await issuer.verifyCertificate(1);
    expect(cert.studentName).to.equal("Alice");
    expect(cert.courseName).to.equal("Blockchain 101");
    expect(cert.ipfsHash).to.equal(ipfsHash);
    expect(cert.valid).to.be.true;
  });
});
