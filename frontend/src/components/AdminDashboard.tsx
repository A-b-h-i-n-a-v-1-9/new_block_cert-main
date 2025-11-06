import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Plus,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  QrCode,
  Award,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useApp } from "../contexts/AppContext";
import axios from "axios";

export function AdminDashboard() {
  const { events, participants, logout, user, loadingUser } = useApp();
  const navigate = useNavigate();
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Safe redirect check
  useEffect(() => {
  if (loadingUser) return; // wait for context
  if (!user) navigate("/login");
  else if (!user.isAdmin) navigate("/");
  else setLoading(false);
}, [user, loadingUser, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mb-4"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // ✅ Dashboard Data
  const totalParticipants = participants.length;
  const totalAttended = participants.filter((p) => p.attended).length;
  const certificatesIssued = participants.filter((p) => p.certificateIssued).length;

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: "bg-blue-500",
      Cultural: "bg-purple-500",
      Business: "bg-green-500",
      Sports: "bg-orange-500",
      Academic: "bg-indigo-500",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  const getEventParticipants = (eventId: string) => {
    return participants.filter((p) => p.eventId === eventId).length;
  };

  // ✅ Issue Certificates
  const handleMintCertificates = async (eventId: string) => {
    try {
      setLoadingEventId(eventId);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/certificates/mint",
        { eventId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message || "Certificates issued successfully!");
      console.log("Mint results:", res.data.results);
    } catch (err: any) {
      console.error("❌ Mint failed:", err);
      alert(err.response?.data?.error || "Failed to mint certificates");
    } finally {
      setLoadingEventId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EventHub Admin
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.userId}</span>
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage events, attendance & certificates</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Events",
              value: events.length,
              color: "text-blue-600",
              icon: <Calendar className="w-8 h-8 text-blue-500" />,
            },
            {
              title: "Total Participants",
              value: totalParticipants,
              color: "text-green-600",
              icon: <Users className="w-8 h-8 text-green-500" />,
            },
            {
              title: "Attended",
              value: totalAttended,
              color: "text-purple-600",
              icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
            },
            {
              title: "Certificates Issued",
              value: certificatesIssued,
              color: "text-orange-600",
              icon: <Award className="w-8 h-8 text-orange-500" />,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-white/70 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-2xl ${stat.color}`}>{stat.value}</p>
                </div>
                {stat.icon}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Event */}
        <Link to="/admin/add-event">
          <Button className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Event
          </Button>
        </Link>

        {/* Manage Events */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Manage Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No events created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <motion.div
                    key={event._id || event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/20 hover:bg-white/70 transition"
                  >
                    {/* Event Info */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={event.image || "/placeholder.png"}
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-lg text-gray-800">{event.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            className={`${getCategoryColor(event.category)} text-white border-0 text-xs`}
                          >
                            {event.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.registeredCount}/{event.maxParticipants} registered
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link to={`/admin/event/${event._id}/participants`}>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4 mr-2" />
                          Participants
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/scan/${event.id}`)}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Scan Attendance
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleMintCertificates(event._id)}
                        disabled={loadingEventId === event._id}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        {loadingEventId === event._id ? "Issuing..." : "Issue Certificates"}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
