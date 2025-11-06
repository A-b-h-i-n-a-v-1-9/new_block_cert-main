import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function issueCertificate(string memory _studentName, string memory _eventId, string memory _ipfshash, address _issuedTo) external returns (uint256)",
  "function verifyCertificate(uint256 _certId) external view returns (tuple(uint256 certId, string studentName, string eventId, string ipfshash, address issuedTo, uint256 issuedAt))",
  "event CertificateIssued(uint256 certId, string studentName, string eventId, string ipfshash, address issuedTo)"
];

class BlockchainService {
  constructor() {
    this.isRealMode = this.checkBlockchainConfig();
    this.initializeService();
  }

  checkBlockchainConfig() {
    const hasConfig = !!(process.env.POLYGON_AMOY_RPC_URL && process.env.PRIVATE_KEY && process.env.CONTRACT_ADDRESS);
    
    if (hasConfig) {
      console.log('✅ Blockchain environment variables found');
      return true;
    } else {
      console.log('⚠️  Running in TEST MODE - configure blockchain environment variables for real transactions');
      console.log('   Required variables: POLYGON_AMOY_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS');
      return false;
    }
  }

  initializeService() {
    if (this.isRealMode) {
      try {
        this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(
          process.env.CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.wallet
        );
        console.log('🔗 Connected to Polygon Amoy');
        console.log('📝 Contract:', process.env.CONTRACT_ADDRESS);
        console.log('👛 Wallet:', this.wallet.address);
      } catch (error) {
        console.error('❌ Failed to connect to blockchain:', error);
        this.isRealMode = false;
      }
    }
  }

  async getNetworkInfo() {
    if (this.isRealMode) {
      try {
        const network = await this.provider.getNetwork();
        const balance = await this.provider.getBalance(this.wallet.address);
        const blockNumber = await this.provider.getBlockNumber();
        
        return {
          mode: 'REAL',
          network: {
            name: 'Polygon Amoy',
            chainId: network.chainId,
            walletAddress: this.wallet.address,
            balance: ethers.formatEther(balance),
            blockNumber: blockNumber,
            contractAddress: process.env.CONTRACT_ADDRESS
          },
          status: 'Connected and ready'
        };
      } catch (error) {
        return {
          mode: 'REAL (Connection Failed)',
          error: error.message,
          status: 'Blockchain connection failed'
        };
      }
    } else {
      return {
        mode: 'TEST',
        network: {
          name: 'Polygon Amoy (Test Mode)',
          chainId: 80002,
          walletAddress: 'Not configured',
          balance: '0.0',
          blockNumber: 0,
          contractAddress: process.env.CONTRACT_ADDRESS || 'Not set'
        },
        status: 'Test mode - configure environment variables for real transactions',
        requiredVariables: [
          'POLYGON_AMOY_RPC_URL',
          'PRIVATE_KEY', 
          'CONTRACT_ADDRESS'
        ]
      };
    }
  }

  async issueCertificate(studentName, eventId, ipfsHash, walletAddress) {
    if (this.isRealMode) {
      try {
        console.log('📝 Issuing certificate on Polygon Amoy...');
        
        const gasEstimate = await this.contract.issueCertificate.estimateGas(
          studentName,
          eventId,
          ipfsHash,
          walletAddress
        );

        const tx = await this.contract.issueCertificate(
          studentName,
          eventId,
          ipfsHash,
          walletAddress,
          { gasLimit: gasEstimate * 2n }
        );

        console.log('⏳ Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

        // Parse event to get certificate ID
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
          
          return {
            certId,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
            mode: 'REAL'
          };
        }

        throw new Error('Certificate issuance event not found');
      } catch (error) {
        console.error('❌ Blockchain error:', error);
        throw new Error(`Failed to issue certificate: ${error.message}`);
      }
    } else {
      // Test mode - simulate transaction
      console.log('🧪 Test mode: Simulating certificate issuance');
      
      return {
        certId: Math.floor(Math.random() * 10000).toString(),
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        blockNumber: Math.floor(Math.random() * 100000),
        explorerUrl: 'https://amoy.polygonscan.com',
        mode: 'TEST',
        note: 'This is a simulated transaction. Configure environment variables for real blockchain transactions.'
      };
    }
  }

  async verifyCertificate(certId) {
    if (this.isRealMode) {
      try {
        const certificate = await this.contract.verifyCertificate(certId);
        return {
          certId: certificate.certId.toString(),
          studentName: certificate.studentName,
          eventId: certificate.eventId,
          ipfsHash: certificate.ipfshash,
          issuedTo: certificate.issuedTo,
          issuedAt: new Date(parseInt(certificate.issuedAt) * 1000),
          network: 'Polygon Amoy',
          mode: 'REAL'
        };
      } catch (error) {
        throw new Error('Certificate not found on blockchain');
      }
    } else {
      return {
        certId,
        studentName: 'Test Student',
        eventId: 'Test Event',
        ipfsHash: 'QmTestHash',
        issuedTo: '0x1234567890123456789012345678901234567890',
        issuedAt: new Date(),
        network: 'Polygon Amoy',
        mode: 'TEST',
        note: 'This is simulated verification data'
      };
    }
  }
}

// Create instance without throwing errors
let blockchainServiceInstance;

try {
  blockchainServiceInstance = new BlockchainService();
} catch (error) {
  console.error('Failed to initialize blockchain service:', error);
  // Create a fallback instance
  blockchainServiceInstance = {
    isRealMode: false,
    getNetworkInfo: async () => ({
      mode: 'FALLBACK',
      status: 'Blockchain service unavailable',
      error: error.message
    }),
    issueCertificate: async () => {
      throw new Error('Blockchain service unavailable');
    },
    verifyCertificate: async () => {
      throw new Error('Blockchain service unavailable');
    }
  };
}

export default blockchainServiceInstance;