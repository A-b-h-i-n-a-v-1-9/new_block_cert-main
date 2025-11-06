// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateIssuer is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    struct Certificate {
        uint256 id;
        string studentName;
        string courseName;
        string ipfsHash;
        uint256 issuedAt;
        bool valid;
    }

    mapping(uint256 => Certificate) public certificates;

    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed recipient,
        string studentName,
        string courseName,
        string ipfsHash
    );

    event CertificateRevoked(uint256 indexed certificateId);

    constructor() ERC721("BlockchainCertificate", "BCERT") {}

    function issueCertificate(
        address recipient,
        string memory studentName,
        string memory courseName,
        string memory ipfsHash
    ) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newCertificateId = _tokenIds;

        // Mint the NFT
        _mint(recipient, newCertificateId);
        _setTokenURI(newCertificateId, ipfsHash); // Store IPFS hash in tokenURI

        // Save certificate details
        certificates[newCertificateId] = Certificate({
            id: newCertificateId,
            studentName: studentName,
            courseName: courseName,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            valid: true
        });

        emit CertificateIssued(
            newCertificateId,
            recipient,
            studentName,
            courseName,
            ipfsHash
        );

        return newCertificateId;
    }

    function verifyCertificate(uint256 certificateId)
        public
        view
        returns (Certificate memory)
    {
        require(_exists(certificateId), "Certificate does not exist");
        return certificates[certificateId];
    }

    function revokeCertificate(uint256 certificateId) public onlyOwner {
        require(_exists(certificateId), "Certificate does not exist");
        require(certificates[certificateId].valid, "Certificate already revoked");

        certificates[certificateId].valid = false;

        emit CertificateRevoked(certificateId);
    }
}
