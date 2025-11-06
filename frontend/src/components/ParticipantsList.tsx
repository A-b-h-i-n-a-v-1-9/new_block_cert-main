import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Users, Eye, Award, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import axios from "axios";
import { QRDisplay } from "./QRDisplay";

export function ParticipantsList() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [selectedQR, setSelectedQR] = useState("");
  const [minting, setMinting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, regRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/events/${eventId}`),
          axios.get(`http://localhost:4000/api/registrations/event/${eventId}`, {
            headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN },
          }),
        ]);
        setEvent(eventRes.data);
        setParticipants(regRes.data.participants || []);
      } catch (err) {
        console.error("❌ Failed to load participants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  // ✅ Mint certificates for this event
  const handleMintCertificates = async () => {
    try {
      setMinting(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
  "http://localhost:4000/api/certificates/mint",
  { eventId },
  {
    headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN },
  }
);

      alert(` ${res.data.message || "Certificates issued successfully!"}`);
      console.log("Mint results:", res.data.results);
    } catch (err: any) {
      console.error("❌ Mint failed:", err);
      alert(err.response?.data?.error || "Failed to mint certificates");
    } finally {
      setMinting(false);
    }
  };

  // ✅ Verify minted certificates
  const handleVerifyCertificates = async () => {
    try {
      setVerifying(true);
      const res = await axios.get("http://localhost:4000/api/certificates");
      const eventCerts = res.data.filter((c: any) => c.eventId?._id === eventId);
      alert(`✅ Verified ${eventCerts.length} certificates on blockchain`);
      console.log("Verified certs:", eventCerts);
    } catch (err: any) {
      console.error("❌ Verification failed:", err);
      alert("❌ Failed to verify certificates");
    } finally {
      setVerifying(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {event.title}
          </h1>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Participants List</h2>
        <div className="flex space-x-3">
          <Button
            size="sm"
            disabled={minting}
            onClick={handleMintCertificates}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {minting ? "⏳ Minting..." : "🪙 Issue Certificates"}
            <Award className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={verifying}
            onClick={handleVerifyCertificates}
          >
            {verifying ? "Checking..." : "Verify Certificates"}
            <ShieldCheck className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>{event.title} - Registered Participants</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No participants registered yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>QR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/50"
                    >
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.walletAddress || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            p.attended
                              ? "bg-green-500 text-white"
                              : "bg-gray-400 text-white"
                          }
                        >
                          {p.attended ? "Present" : "Absent"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedQR(p.qrToken);
                            setShowQR(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View QR
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRDisplay qrCode={selectedQR} eventTitle={event.title} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}
