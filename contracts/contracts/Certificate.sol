// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    struct Certificate {
        uint256 certId;
        string studentName;
        string eventId;
        string ipfsHash;     // IPFS metadata
        address issuedTo;    // Wallet address of student
        uint256 issuedAt;    // Timestamp
    }

    mapping(uint256 => Certificate) public certificates;
    uint256 public nextCertId;

    event CertificateIssued(
        uint256 certId,
        string studentName,
        string eventId,
        string ipfsHash,
        address issuedTo
    );

    function issueCertificate(
        string memory _studentName,
        string memory _eventId,
        string memory _ipfsHash,
        address _issuedTo
    ) external returns (uint256) {
        uint256 certId = nextCertId;
        certificates[certId] = Certificate(
            certId,
            _studentName,
            _eventId,
            _ipfsHash,
            _issuedTo,
            block.timestamp
        );
        nextCertId++;

        emit CertificateIssued(certId, _studentName, _eventId, _ipfsHash, _issuedTo);
        return certId;
    }

    function verifyCertificate(uint256 _certId)
        external
        view
        returns (Certificate memory)
    {
        return certificates[_certId];
    }
}
