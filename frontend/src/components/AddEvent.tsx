import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, MapPin, Users, Type, FileText, Clock, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../contexts/AppContext';

export function AddEvent() {
  const navigate = useNavigate();
  const { addEvent, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: '',
    maxParticipants: 100,
    image: 'https://images.unsplash.com/photo-1571645163064-77faa9676a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwbWVldGluZyUyMGJ1c2luZXNzfGVufDF8fHx8MTc1OTczOTk0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  });

  if (!user?.isAdmin) {
    navigate('/login');
    return null;
  }

  const categories = [
    'Technology',
    'Cultural',
    'Business',
    'Sports',
    'Academic'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue || !formData.category) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }

  try {
    await addEvent({
      ...formData,
      registeredCount: 0,
    });

    navigate('/admin');
  } catch (err: any) {
    setError(err.message || 'Failed to create event. Please try again.');
  }

  setLoading(false);
};


  const generateImageUrl = (category: string) => {
    const imageMap = {
      Technology: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      Cultural: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop',
      Business: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
      Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
      Academic: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop'
    };
    return imageMap[category as keyof typeof imageMap] || formData.image;
  };

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
              <img
  src="https://i.imgur.gg/d8YmEE7-ChainOwl-removebg-preview.png"
  alt="Logo"
  className="w-8 h-8 rounded-lg object-cover"
/>
              <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChainOwl Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-gray-800 mb-2">Create New Event</h1>
          <p className="text-gray-600">Fill in the details to create a new event</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="pl-10 min-h-[100px]"
                      required
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Venue */}
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="venue"
                      type="text"
                      placeholder="Event venue or location"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Category and Max Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          handleInputChange('category', value);
                          handleInputChange('image', generateImageUrl(value));
                        }}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        max="10000"
                        placeholder="100"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 100)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {formData.title && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t pt-6"
                  >
                    <h3 className="text-lg mb-4 text-gray-800">Preview</h3>
                    <div className="bg-white/50 rounded-lg p-4 border border-white/20">
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt="Event preview"
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h4 className="text-lg mb-2 text-gray-800">{formData.title}</h4>
                      {formData.description && (
                        <p className="text-gray-600 text-sm mb-2">{formData.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        {formData.date && <span>📅 {new Date(formData.date).toLocaleDateString()}</span>}
                        {formData.time && <span>🕐 {formData.time}</span>}
                        {formData.venue && <span>📍 {formData.venue}</span>}
                        {formData.category && <span>🏷️ {formData.category}</span>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}