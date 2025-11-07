import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { LandingPage } from './components/LandingPage';
import { EventDetails } from './components/EventDetails';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AddEvent } from './components/AddEvent';
import { ManageEvent } from './components/ManageEvent';
import { ParticipantsList } from './components/ParticipantsList';
import { Toaster } from './components/ui/sonner';
import { Profile } from './components/MyCertificates';
import { QRScanner } from "./components/QRScanner";


export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<Profile/>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-event" element={<AddEvent />} />
            <Route path="/admin/manage-event/:eventId" element={<ManageEvent />} />
            <Route path="/admin/event/:eventId/participants" element={<ParticipantsList />} />
            <Route path="/admin/scan/:id" element={<QRScanner />} />

            
            {/* Catch-all route - redirect any unmatched routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster />
        </div>
      </Router>
    </AppProvider>
  );
}