import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Mail, 
  Award, 
  LogOut, 
  RefreshCw, 
  ExternalLink,
  FileText,
  Shield,
  Calendar,
  FileDown
} from "lucide-react";

export function Profile() {
  const [user, setUser] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      
      const [userRes, certsRes] = await Promise.all([
        axios.get("http://localhost:4000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:4000/api/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      
      setUser(userRes.data.user);
      setCerts(certsRes.data);
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
    } finally {
      setLoading(false);
      setLoadingUser(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Function to get PDF URL from IPFS hash
  const getPdfUrl = (ipfsHash: string) => {
    if (!ipfsHash) return null;
    return `https://plum-giant-ape-432.mypinata.cloud/ipfs/${ipfsHash}`;
  };

  // Function to get IPFS metadata URL
  const getIpfsUrl = (ipfsHash: string) => {
    if (!ipfsHash) return null;
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  };

  if (loadingUser || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-blue-500 rounded-full animate-ping"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">Loading Profile</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 👤 USER PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12"
        >
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
              
                </div>
                
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {user?.name}
                  </h1>
                  
                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600 mb-3">  
                    <Mail className="w-4 h-4" />
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 text-sm capitalize rounded-full">
                    <User className="w-3 h-3 mr-1" />
                    {user?.role || "participant"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-2.5 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 rounded-xl px-6 py-2.5 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🎓 CERTIFICATES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-3 shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Certificates</h1>
              <p className="text-gray-600">Your blockchain-verified achievements</p>
            </div>
          </div>

          <AnimatePresence>
            {certs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200 p-12 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                  No Certificates Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Attend an event and wait for the administrator to issue your blockchain certificates. 
                  They will appear here once minted.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {certs.map((cert, index) => (
                  <motion.div
                    key={cert.certId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                      <CardContent className="p-6">
                        {/* Certificate Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 shadow-md">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Verified
                          </Badge>
                        </div>

                        {/* Certificate Content */}
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {cert.eventId?.title || "Event Certificate"}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {cert.participantEmail}
                        </p>

                        {/* Certificate Details */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">Certificate ID:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                              {cert.certId?.slice(0, 8)}...
                            </code>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>

                        {/* Action Links */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          {/* PDF Certificate Download */}
                          {cert.pdfIpfsHash && (
                            <a
                              href={getPdfUrl(cert.pdfIpfsHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors"
                            >
                              <FileDown className="w-3 h-3" />
                              <span>Download PDF</span>
                            </a>
                          )}

                          {/* IPFS Metadata Link */}
                          {cert.metadataIpfsHash && (
                            <a
                              href={getIpfsUrl(cert.metadataIpfsHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-2 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View Metadata</span>
                            </a>
                          )}

                          {/* Blockchain Transaction Link */}
                          {cert.txHash && (
                            <a
                              href={`https://amoy.polygonscan.com/tx/${cert.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>PolygonScan</span>
                            </a>
                          )}
                        </div>

                        {/* Additional IPFS Links */}
                        <div className="mt-3 space-y-1">
                          {cert.pdfIpfsHash && (
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">PDF IPFS:</span>{" "}
                              <a
                                href={getIpfsUrl(cert.pdfIpfsHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline ml-1"
                              >
                                View on IPFS ↗
                              </a>
                            </p>
                          )}
                          
                          {cert.metadataIpfsHash && (
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Metadata IPFS:</span>{" "}
                              <a
                                href={getIpfsUrl(cert.metadataIpfsHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline ml-1"
                              >
                                View on IPFS ↗
                              </a>
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}