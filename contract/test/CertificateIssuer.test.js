const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateIssuer", function () {
  let CertificateIssuer, certificateIssuer;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    CertificateIssuer = await ethers.getContractFactory("CertificateIssuer");
    certificateIssuer = await CertificateIssuer.deploy();
    await certificateIssuer.waitForDeployment();
  });

  it("Should allow the owner to issue a certificate", async function () {
    const tx = await certificateIssuer.issueCertificate(
      addr1.address,
      "Alice",
      "Blockchain 101",
      "ipfs://samplehash"
    );
    await tx.wait();

    const cert = await certificateIssuer.verifyCertificate(1);
    expect(cert.studentName).to.equal("Alice");
    expect(cert.courseName).to.equal("Blockchain 101");
    expect(cert.ipfsHash).to.equal("ipfs://samplehash");
    expect(cert.valid).to.equal(true);
  });

  it("Should not allow non-owners to issue a certificate", async function () {
    await expect(
  certificateIssuer.connect(addr1).issueCertificate(
    addr1.address,
    "Bob",
    "Solidity Basics",
    "ipfs://hash2"
  )
).to.be.revertedWith("Ownable: caller is not the owner");

  });

  it("Should return correct certificate details", async function () {
    await certificateIssuer.issueCertificate(
      addr1.address,
      "Charlie",
      "Smart Contracts",
      "ipfs://hash3"
    );

    const cert = await certificateIssuer.verifyCertificate(1);
    expect(cert.studentName).to.equal("Charlie");
    expect(cert.courseName).to.equal("Smart Contracts");
    expect(cert.ipfsHash).to.equal("ipfs://hash3");
  });

  it("Should revoke a certificate", async function () {
    await certificateIssuer.issueCertificate(
      addr1.address,
      "Diana",
      "DeFi 101",
      "ipfs://hash4"
    );

    await certificateIssuer.revokeCertificate(1);

    const cert = await certificateIssuer.verifyCertificate(1);
    expect(cert.valid).to.equal(false);
  });

  it("Should not revoke a non-existent certificate", async function () {
    await expect(
      certificateIssuer.revokeCertificate(999)
    ).to.be.revertedWith("Certificate does not exist");
  });
});
