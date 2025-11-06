import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Users, QrCode, Settings, Calendar, MapPin, Clock, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useApp } from '../contexts/AppContext';

// Simple QR Scanner Simulator Component
function QRScanner({ onScan, onClose }: { onScan: (data: string) => void; onClose: () => void }) {
  const [scannedData, setScannedData] = useState('');

  const simulateScans = [
    'QR-1703001234567-2-1',
    'QR-1703001234568-2-2',
    'QR-1703001234569-2-3',
    'QR-1703001234570-2-4'
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code Scanner</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Point camera at QR code</p>
            <div className="w-32 h-32 mx-auto mt-4 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-blue-500 text-sm">Scanning...</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Simulate scans:</p>
            {simulateScans.map((qr, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  setScannedData(qr);
                  onScan(qr);
                }}
              >
                {qr}
              </Button>
            ))}
          </div>

          {scannedData && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">Scanned: {scannedData}</p>
            </div>
          )}

          <Button onClick={onClose} variant="outline" className="w-full">
            Close Scanner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ManageEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events, participants, markAttendance, user } = useApp();
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');

  if (!user?.isAdmin) {
    navigate('/login');
    return null;
  }

  const event = events.find(e => e.id === eventId);
  const eventParticipants = participants.filter(p => p.eventId === eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Event not found</h2>
          <Link to="/admin">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const handleQRScan = (qrData: string) => {
    // Extract participant info from QR code
    const participant = participants.find(p => p.qrCode === qrData);
    
    if (participant && participant.eventId === eventId) {
      markAttendance(participant.id);
      setScanResult(`✅ Attendance marked for ${participant.userName}`);
    } else {
      setScanResult('❌ Invalid QR code or participant not found');
    }
    
    setTimeout(() => setScanResult(''), 3000);
  };

  const attendedCount = eventParticipants.filter(p => p.attended).length;
  const attendanceRate = eventParticipants.length > 0 
    ? (attendedCount / eventParticipants.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
              <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EventHub Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Event Details</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6 rounded-lg overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getCategoryColor(event.category)} text-white border-0`}>
                      {event.category}
                    </Badge>
                  </div>
                </div>

                <h2 className="text-2xl mb-4 text-gray-800">{event.title}</h2>
                <p className="text-gray-600 mb-6">{event.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-gray-800">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-gray-800">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="text-gray-800">{event.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="text-gray-800">{event.registeredCount}/{event.maxParticipants}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Scanner */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Attendance Scanner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    Scan participant QR codes to mark attendance
                  </p>

                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg ${
                        scanResult.includes('✅') 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {scanResult}
                    </motion.div>
                  )}

                  <Button
                    onClick={() => setShowScanner(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Open QR Scanner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registered</span>
                  <span className="text-blue-600">{event.registeredCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Participants</span>
                  <span className="text-green-600">{eventParticipants.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Attended</span>
                  <span className="text-purple-600">{attendedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="text-orange-600">{attendanceRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={`/admin/event/${eventId}/participants`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    View All Participants
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowScanner(true)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Codes
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event Details
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {eventParticipants.slice(-3).map((participant, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">
                        {participant.userName} registered
                      </span>
                    </div>
                  ))}
                  {eventParticipants.length === 0 && (
                    <p className="text-gray-500">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}