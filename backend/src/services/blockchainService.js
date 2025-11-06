import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manual ABI definition (safer than file import)
const CONTRACT_ABI = [
  "function issueCertificate(string memory _studentName, string memory _eventId, string memory _ipfshash, address _issuedTo) external returns (uint256)",
  "function verifyCertificate(uint256 _certId) external view returns (tuple(uint256 certId, string studentName, string eventId, string ipfshash, address issuedTo, uint256 issuedAt))",
  "function certificates(uint256) external view returns (uint256 certId, string studentName, string eventId, string ipfshash, address issuedTo, uint256 issuedAt)",
  "event CertificateIssued(uint256 certId, string studentName, string eventId, string ipfshash, address issuedTo)"
];

// Polygon Amoy network configuration
const POLYGON_AMOY_CONFIG = {
  chainId: 80002,
  name: 'Polygon Amoy',
  rpcUrl: process.env.POLYGON_AMOY_RPC_URL,
  blockExplorer: 'https://amoy.polygonscan.com'
};

class BlockchainService {
  constructor() {
    if (!process.env.POLYGON_AMOY_RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      console.error('❌ Missing required environment variables for blockchain service');
      console.error('POLYGON_AMOY_RPC_URL:', !!process.env.POLYGON_AMOY_RPC_URL);
      console.error('PRIVATE_KEY:', !!process.env.PRIVATE_KEY);
      console.error('CONTRACT_ADDRESS:', !!process.env.CONTRACT_ADDRESS);
      throw new Error('Missing required environment variables for blockchain service');
    }

    try {
      // Use Polygon Amoy RPC
      this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      this.contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.wallet
      );
      
      console.log('🔗 Connected to Polygon Amoy testnet');
      console.log('📝 Contract address:', process.env.CONTRACT_ADDRESS);
      console.log('👛 Wallet address:', this.wallet.address);
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  async issueCertificate(studentName, eventId, ipfsHash, walletAddress) {
    try {
      console.log('📝 Issuing certificate on Polygon Amoy...');
      console.log('Student:', studentName);
      console.log('Event:', eventId);
      console.log('Wallet:', walletAddress);

      // Estimate gas first
      const gasEstimate = await this.contract.issueCertificate.estimateGas(
        studentName,
        eventId,
        ipfsHash,
        walletAddress
      );

      console.log('⛽ Estimated gas:', gasEstimate.toString());

      const tx = await this.contract.issueCertificate(
        studentName,
        eventId,
        ipfsHash,
        walletAddress,
        {
          gasLimit: gasEstimate * 2n // Add buffer for Polygon
        }
      );

      console.log('⏳ Transaction sent:', tx.hash);
      console.log('🔍 View on Polygonscan:', `${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      // Find the CertificateIssued event
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          return parsedLog && parsedLog.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = this.contract.interface.parseLog(event);
        const certId = parsedEvent.args.certId.toString();
        
        console.log('🎉 Certificate issued with ID:', certId);
        
        return {
          certId,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          explorerUrl: `${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${receipt.hash}`
        };
      }

      throw new Error('Certificate issuance event not found');
    } catch (error) {
      console.error('❌ Blockchain error:', error);
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  async verifyCertificate(certId) {
    try {
      console.log('🔍 Verifying certificate on Polygon Amoy:', certId);
      const certificate = await this.contract.verifyCertificate(certId);
      
      return {
        certId: certificate.certId.toString(),
        studentName: certificate.studentName,
        eventId: certificate.eventId,
        ipfsHash: certificate.ipfshash,
        issuedTo: certificate.issuedTo,
        issuedAt: new Date(parseInt(certificate.issuedAt) * 1000),
        network: 'Polygon Amoy'
      };
    } catch (error) {
      console.error('❌ Verification error:', error);
      throw new Error('Certificate not found on blockchain');
    }
  }

  // Get network info
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        name: POLYGON_AMOY_CONFIG.name,
        chainId: network.chainId,
        walletAddress: this.wallet.address,
        balance: ethers.formatEther(balance),
        blockNumber: blockNumber,
        contractAddress: process.env.CONTRACT_ADDRESS,
        rpcUrl: process.env.POLYGON_AMOY_RPC_URL
      };
    } catch (error) {
      console.error('❌ Failed to get network info:', error);
      throw new Error('Cannot connect to Polygon Amoy network');
    }
  }
}

// Create and export the service instance
const blockchainService = new BlockchainService();
export default blockchainService;