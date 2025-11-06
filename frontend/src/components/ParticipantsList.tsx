import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Users, Eye, Award, ShieldCheck, Download, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import axios from "axios";
import { QRDisplay } from "./QRDisplay";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

export function ParticipantsList() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [selectedQR, setSelectedQR] = useState("");
  const [minting, setMinting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ✅ Fetch event + participants + certificates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, regRes, certRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/events/${eventId}`),
          axios.get(`http://localhost:4000/api/registrations/event/${eventId}`, {
            headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN },
          }),
          axios.get(`http://localhost:4000/api/certificates/event/${eventId}`),
        ]);

        setEvent(eventRes.data);
        setParticipants(regRes.data.participants || []);
        setCertificates(certRes.data || []);
      } catch (err) {
        console.error("❌ Failed to load participants or certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  // ✅ Mint certificates
  const handleMintCertificates = async () => {
    try {
      setMinting(true);
      const res = await axios.post(
        "http://localhost:4000/api/certificates/mint",
        { eventId },
        {
          headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN },
        }
      );

      alert(` ${res.data.message || "Certificates issued successfully!"}`);
      console.log("Mint results:", res.data.results);

      // ✅ Refresh certificate data
      const certRes = await axios.get(
        `http://localhost:4000/api/certificates/event/${eventId}`
      );
      setCertificates(certRes.data);
    } catch (err: any) {
      console.error("❌ Mint failed:", err);
      alert(err.response?.data?.error || "Failed to mint certificates");
    } finally {
      setMinting(false);
    }
  };

  // ✅ Verify certificates
  const handleVerifyCertificates = async () => {
    try {
      setVerifying(true);
      const res = await axios.get("http://localhost:4000/api/certificates");
      const eventCerts = res.data.filter(
        (c: any) => c.eventId?._id === eventId
      );
      alert(`✅ Verified ${eventCerts.length} certificates on blockchain`);
      console.log("Verified certs:", eventCerts);
    } catch (err: any) {
      console.error("❌ Verification failed:", err);
      alert("❌ Failed to verify certificates");
    } finally {
      setVerifying(false);
    }
  };

  // ✅ Analytics Data
  const totalParticipants = participants.length;
  const totalCertificates = certificates.length;
  const totalWalletsLinked = participants.filter(
    (p) => p.walletAddress && p.walletAddress !== ""
  ).length;

  // Example attendance data (you can replace once you integrate Attendance route)
  const totalAttended = participants.filter((p) => p.attended).length;
  const attendancePercent =
    totalParticipants > 0
      ? ((totalAttended / totalParticipants) * 100).toFixed(1)
      : 0;

  const pieData = [
    { name: "Attended", value: totalAttended },
    { name: "Absent", value: totalParticipants - totalAttended },
  ];
  const COLORS = ["#34d399", "#f87171"];

  // ✅ Loading State
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mb-4"></div>
        <p>Loading Participants...</p>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Event not found</p>
        <Button onClick={() => navigate("/admin")}>Back</Button>
      </div>
    );

  // ✅ Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{event.title}</h1>
            <p className="text-sm text-gray-600">Participant Management</p>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Participants & Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Manage participants and issue blockchain certificates
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              disabled={minting || totalParticipants === 0}
              onClick={handleMintCertificates}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2 h-auto"
            >
              {minting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Issuing Certificates...
                </>
              ) : (
                <>
                  <Award className="w-5 h-5 mr-2" />
                  Issue Certificates
                  {totalParticipants > 0 && (
                    <span className="ml-2 bg-blue-800 text-xs px-2 py-1 rounded-full">
                      {totalParticipants}
                    </span>
                  )}
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={verifying || totalCertificates === 0}
              onClick={handleVerifyCertificates}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 h-auto"
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verify Certificates
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Event Analytics Section */}
        <Card className="bg-white shadow-sm border border-gray-200 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Event Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-700">Total Registrations</p>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {totalParticipants}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-700">Attendance Rate</p>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {attendancePercent}%
                </p>
                <p className="text-xs text-green-600 mt-1">{totalAttended} attended</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-700">Certificates Issued</p>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {totalCertificates}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {totalParticipants > 0 ? 
                    Math.round((totalCertificates / totalParticipants) * 100) : 0
                  }% coverage
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-amber-700">Wallets Linked</p>
                  <Download className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-900 mt-2">
                  {totalWalletsLinked}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {totalParticipants > 0 ? 
                    Math.round((totalWalletsLinked / totalParticipants) * 100) : 0
                  }% linked
                </p>
              </div>
            </div>

            {/* Animated Pie Chart */}
            <div className="w-full h-72 flex justify-center">
              <ResponsiveContainer width="90%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Registered Participants
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({participants.length} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-600 mb-2">No participants registered yet</p>
                <p className="text-sm text-gray-500">Participants will appear here once they register for your event.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700">Wallet Address</TableHead>
                      <TableHead className="font-semibold text-gray-700">Certificate Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">QR Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((p, i) => {
                      const hasCert = certificates.some(
                        (c) => c.participantEmail === p.email
                      );
                      return (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-gray-50 border-b border-gray-100"
                        >
                          <TableCell className="font-medium text-gray-900">{p.name}</TableCell>
                          <TableCell className="text-gray-700">{p.email}</TableCell>
                          <TableCell>
                            {p.walletAddress ? (
                              <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {p.walletAddress.slice(0, 8)}...{p.walletAddress.slice(-6)}
                              </code>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                hasCert
                                  ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                              }
                            >
                              {hasCert ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Issued
                                </>
                              ) : (
                                "Pending"
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (p.qrCode) {
                                  setSelectedQR(p.qrCode);
                                  setShowQR(true);
                                } else {
                                  alert("No QR code available for this participant.");
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-2" /> View
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRDisplay
          qrCode={selectedQR}
          eventTitle={event.title}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}