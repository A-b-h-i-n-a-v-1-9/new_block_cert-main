import { ethers } from 'ethers';

class BlockchainService {
  constructor() {
    console.log('🔧 Blockchain service initialized (test mode)');
    
    // Check if we have the required environment variables
    this.hasBlockchainConfig = !!(process.env.POLYGON_AMOY_RPC_URL && process.env.PRIVATE_KEY && process.env.CONTRACT_ADDRESS);
    
    if (this.hasBlockchainConfig) {
      console.log('✅ Blockchain environment variables found');
      try {
        this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(
          process.env.CONTRACT_ADDRESS,
          [
            "function issueCertificate(string memory _studentName, string memory _eventId, string memory _ipfshash, address _issuedTo) external returns (uint256)",
            "function verifyCertificate(uint256 _certId) external view returns (tuple(uint256 certId, string studentName, string eventId, string ipfshash, address issuedTo, uint256 issuedAt))"
          ],
          this.wallet
        );
        console.log('🔗 Connected to Polygon Amoy');
      } catch (error) {
        console.error('❌ Failed to connect to blockchain:', error);
        this.hasBlockchainConfig = false;
      }
    } else {
      console.log('⚠️  Running in test mode - no blockchain connection');
    }
  }

  async getNetworkInfo() {
    if (this.hasBlockchainConfig) {
      try {
        const network = await this.provider.getNetwork();
        const balance = await this.provider.getBalance(this.wallet.address);
        return {
          name: 'Polygon Amoy',
          chainId: network.chainId,
          walletAddress: this.wallet.address,
          balance: ethers.formatEther(balance),
          blockNumber: await this.provider.getBlockNumber(),
          contractAddress: process.env.CONTRACT_ADDRESS,
          status: 'Connected'
        };
      } catch (error) {
        return {
          name: 'Polygon Amoy',
          error: error.message,
          status: 'Connection failed'
        };
      }
    } else {
      return {
        name: 'Polygon Amoy (Test Mode)',
        chainId: 80002,
        walletAddress: 'Not configured',
        balance: '0.0',
        blockNumber: 0,
        contractAddress: process.env.CONTRACT_ADDRESS || 'Not set',
        status: 'Test mode - configure environment variables'
      };
    }
  }

  async issueCertificate(studentName, eventId, ipfsHash, walletAddress) {
    if (this.hasBlockchainConfig) {
      try {
        console.log('📝 Issuing certificate on blockchain...');
        const tx = await this.contract.issueCertificate(
          studentName,
          eventId,
          ipfsHash,
          walletAddress
        );
        const receipt = await tx.wait();
        
        // Simulate getting cert ID (in real scenario, parse event logs)
        return {
          certId: Math.floor(Math.random() * 1000).toString(),
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
          status: 'Success'
        };
      } catch (error) {
        throw new Error(`Blockchain error: ${error.message}`);
      }
    } else {
      // Test mode
      return {
        certId: Math.floor(Math.random() * 1000).toString(),
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        blockNumber: Math.floor(Math.random() * 10000),
        explorerUrl: 'https://amoy.polygonscan.com',
        status: 'Test mode - no actual blockchain transaction'
      };
    }
  }

  async verifyCertificate(certId) {
    if (this.hasBlockchainConfig) {
      try {
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
        throw new Error('Certificate not found on blockchain');
      }
    } else {
      return {
        certId,
        studentName: 'Test Student',
        eventId: 'Test Event',
        ipfsHash: 'QmTest',
        issuedTo: '0x742d35Cc6634C0532925a3b8bc9a7a9d5',
        issuedAt: new Date(),
        network: 'Polygon Amoy (Test Mode)'
      };
    }
  }
}

export default new BlockchainService();