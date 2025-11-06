import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  UserPlus,
  Ticket,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,  // ✅ add this line
} from "./ui/dialog";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useApp } from "../contexts/AppContext";
import { TeamMember } from "../contexts/AppContext";

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();

  const [showRegistration, setShowRegistration] = useState(false);
  const [teamSize, setTeamSize] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [qrCode, setQrCode] = useState<string>("");
  const [showTicket, setShowTicket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<any>(null);

  // ✅ Fetch event initially
  const fetchEvent = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error("❌ Failed to load event:", err);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // 🔄 Auto-refresh event count every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchEvent, 10000);
    return () => clearInterval(interval);
  }, [id]);

  // ✅ Check if user is already registered
  useEffect(() => {
  const checkRegistration = async () => {
    const token = localStorage.getItem("token");

    // 🧠 Wait until user is hydrated & token exists
    if (!user || !id || !token || token === "undefined" || token === "null") {
      if (process.env.NODE_ENV === "development") {
  console.log("Skipping registration check: missing user or token");
}

      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:4000/api/events/check/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.registered) {
        setIsRegistered(true);
        setQrCode(res.data.qrCode);
      }
    } catch (err) {
      console.error("❌ Failed to check registration:", err);
    }
  };

  checkRegistration();
}, [user, id]);


  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <p>Loading event details...</p>
      </div>
    );
  }

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

  const handleRegister = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowRegistration(true);
  };

  const handleTeamSizeChange = (size: number) => {
    setTeamSize(size);
    if (size === 1) {
      setTeamMembers([]);
    } else {
      const members = Array(size - 1)
        .fill(null)
        .map(() => ({
          name: "",
          email: "",
          id: "",
        }));
      setTeamMembers(members);
    }
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const submitRegistration = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        teamMembers: teamMembers.map((m) => ({
          name: m.name,
          email: m.email,
          id: m.id,
        })),
      };

      const response = await axios.post(
        `http://localhost:4000/api/events/${id}/register`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQrCode(response.data.qrCode);
      setIsRegistered(true);
      setShowRegistration(false);
      setShowTicket(true);

      // 🔄 Refresh count right after registering
      await fetchEvent();
    } catch (err: any) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      alert(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = teamMembers.every(
    (member) => member.name.trim() && member.email.trim() && member.id.trim()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
              <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EventHub
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Event Info */}
          <div className="lg:col-span-2">
            <div className="relative mb-8 rounded-2xl overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 lg:h-80 object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge
                  className={`${getCategoryColor(
                    event.category
                  )} text-white border-0 text-sm`}
                >
                  {event.category}
                </Badge>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl lg:text-4xl mb-6 text-gray-800">
                {event.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {event.description}
              </p>

              <div className="prose prose-gray max-w-none">
                <h3>What to Expect</h3>
                <ul className="text-gray-600">
                  <li>Interactive sessions with industry experts</li>
                  <li>Networking opportunities with peers and professionals</li>
                  <li>Hands-on workshops and practical demonstrations</li>
                  <li>Certificate of participation</li>
                  <li>Refreshments and networking lunch</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 sticky top-24">
              <CardHeader>
                <h3 className="text-xl text-gray-800">Event Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500 mt-1" />
                  <p className="text-gray-800">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-purple-500 mt-1" />
                  <p className="text-gray-800">{event.time}</p>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-500 mt-1" />
                  <p className="text-gray-800">{event.venue}</p>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-orange-500 mt-1" />
                  <div className="w-full">
                    <motion.p
                      key={event.registeredCount}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-800"
                    >
                      {event.registeredCount} / {event.maxParticipants} registered
                    </motion.p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(event.registeredCount /
                            event.maxParticipants) *
                            100
                            }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {!isRegistered ? (
                  <Button
                    onClick={handleRegister}
                    disabled={
                      loading || event.registeredCount >= event.maxParticipants
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mt-6"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading
                      ? "Registering..."
                      : event.registeredCount >= event.maxParticipants
                        ? "Event Full"
                        : "Register Now"}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 mt-6">
                    <Button disabled className="bg-green-500 text-white w-full">
                      ✅ Registered
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowTicket(true)}
                      className="w-full"
                    >
                      <Ticket className="w-4 h-4 mr-2" /> View My Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="teamSize">Number of Team Members</Label>
              <Input
                id="teamSize"
                type="number"
                min="1"
                max="10"
                value={teamSize}
                onChange={(e) =>
                  handleTeamSizeChange(parseInt(e.target.value) || 1)
                }
                className="mt-1"
              />
            </div>

            {teamSize > 1 && (
              <div className="space-y-4">
                <h4 className="text-lg">Team Member Details</h4>
                {teamMembers.map((member, index) => (
                  <Card key={index} className="p-4">
                    <h5 className="mb-3">Member {index + 2}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) =>
                            updateTeamMember(index, "name", e.target.value)
                          }
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            updateTeamMember(index, "email", e.target.value)
                          }
                          placeholder="email@college.edu"
                        />
                      </div>
                      <div>
                        <Label>Student ID</Label>
                        <Input
                          value={member.id}
                          onChange={(e) =>
                            updateTeamMember(index, "id", e.target.value)
                          }
                          placeholder="Student ID"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRegistration(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitRegistration}
                disabled={loading || (teamSize > 1 && !isFormValid)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? "Processing..." : "Complete Registration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🎟️ Fancy Ticket Modal */}
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
  <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
    <VisuallyHidden>
      <DialogTitle>{event.title} Ticket</DialogTitle>
      <DialogDescription>Your event ticket and details</DialogDescription>
    </VisuallyHidden>

    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="relative"
    >
      <div className="relative bg-white rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
            <div className="flex items-center justify-center space-x-4 text-sm opacity-90">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-4 bg-gradient-to-b from-gray-100 to-white">
          <div className="absolute -top-2 left-0 right-0 flex justify-between px-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 flex flex-col items-center">
              <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                <img src={qrCode} alt="QR Code" className="w-24 h-24" />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Scan for entry</p>
            </div>

            <div className="col-span-2 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Attendee</p>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                <p className="text-sm text-gray-800">{event.venue}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Event ID</p>
                <p className="text-sm font-mono text-gray-800">{id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4" />
                <span>General Admission</span>
              </div>
              <div className="text-right">
                <p>Issued: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </DialogContent>
</Dialog>
    </div>
  );
}
