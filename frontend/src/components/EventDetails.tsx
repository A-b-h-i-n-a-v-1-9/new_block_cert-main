import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Clock, ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useApp } from '../contexts/AppContext';
import { QRDisplay } from './QRDisplay';
import { TeamMember } from '../contexts/AppContext';

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, user } = useApp();

  const [showRegistration, setShowRegistration] = useState(false);
  const [teamSize, setTeamSize] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Find event by _id or id
  const event = events.find(e => e._id === id || e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Event not found</h2>
          <Link to="/">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 🟢 Helper: category color
  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: 'bg-blue-500',
      Cultural: 'bg-purple-500',
      Business: 'bg-green-500',
      Sports: 'bg-orange-500',
      Academic: 'bg-indigo-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  // 🟢 Handle registration popup
  const handleRegister = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowRegistration(true);
  };

  // 🟢 Manage team size & member info
  const handleTeamSizeChange = (size: number) => {
    setTeamSize(size);
    if (size === 1) {
      setTeamMembers([]);
    } else {
      const members = Array(size - 1).fill(null).map(() => ({
        name: '',
        email: '',
        id: ''
      }));
      setTeamMembers(members);
    }
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  // ✅ Submit registration to backend
const submitRegistration = async () => {
  if (!user) {
    navigate("/login");
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem("token");
    const eventId = event._id || event.id;

    // ✅ Only send event and team data — backend will get user info from JWT
const payload = {
  teamMembers: teamMembers.map(m => ({
    name: m.name,
    email: m.email,
    id: m.id,
  })),
};


    console.log("📦 Sending registration payload:", payload);

    const response = await axios.post(
      `http://localhost:4000/api/events/${eventId}/register`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Send token so backend gets user info
        },
      }
    );

    console.log("✅ Registration success:", response.data);
    setQrCode(response.data.qrCode);
    setShowRegistration(false);
    setShowQR(true);
  } catch (err: any) {
    console.error("❌ Registration failed:", err.response?.data || err.message);
    alert(err.response?.data?.error || "Registration failed. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const isFormValid = teamMembers.every(
    member => member.name.trim() && member.email.trim() && member.id.trim()
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
          {/* Main Event Info */}
          <div className="lg:col-span-2">
            <div className="relative mb-8 rounded-2xl overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 lg:h-80 object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className={`${getCategoryColor(event.category)} text-white border-0 text-sm`}>
                  {event.category}
                </Badge>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl lg:text-4xl mb-6 text-gray-800">{event.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{event.description}</p>

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
                  <div>
                    <p className="text-gray-800">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
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
                  <div>
                    <p className="text-gray-800">
                      {event.registeredCount} / {event.maxParticipants} registered
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(event.registeredCount / event.maxParticipants) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleRegister}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mt-6"
                  disabled={event.registeredCount >= event.maxParticipants || loading}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Registering...' :
                    event.registeredCount >= event.maxParticipants ? 'Event Full' : 'Register Now'}
                </Button>
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
                onChange={e => handleTeamSizeChange(parseInt(e.target.value) || 1)}
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
                        <Label htmlFor={`name-${index}`}>Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={member.name}
                          onChange={e => updateTeamMember(index, 'name', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={member.email}
                          onChange={e => updateTeamMember(index, 'email', e.target.value)}
                          placeholder="email@college.edu"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`id-${index}`}>Student ID</Label>
                        <Input
                          id={`id-${index}`}
                          value={member.id}
                          onChange={e => updateTeamMember(index, 'id', e.target.value)}
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
                {loading ? 'Processing...' : 'Complete Registration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Display */}
      {showQR && (
        <QRDisplay
          qrCode={qrCode}
          eventTitle={event.title}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
