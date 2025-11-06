import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

export interface Event {
  _id?: string;
  title: string;
  description: string;
  date: string | Date;
  time: string;
  venue: string;
  category: string;
  image?: string;
  maxParticipants: number;
  registeredCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
  isAdmin?: boolean;
}

export interface Participant {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  teamMembers: TeamMember[];
  registrationDate: string;
  attended: boolean;
  certificateIssued: boolean;
  qrCode: string;
}

interface AppContextType {
  user: User | null;
  loadingUser: boolean;
  events: Event[];
  participants: Participant[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<boolean>;
  logout: () => void;
  addEvent: (event: Omit<Event, "_id">) => Promise<Event>;
  registerForEvent: (eventId: string, teamMembers: TeamMember[]) => string;
  markAttendance: (participantId: string) => void;
  issueCertificate: (participantId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  const [user, setUser] = useState<User | null>(
    storedUser && storedToken
      ? {
          ...JSON.parse(storedUser),
          token: storedToken,
          isAdmin:
            JSON.parse(storedUser).role === "superadmin" ||
            JSON.parse(storedUser).role === "clubadmin",
        }
      : null
  );

  const [loadingUser, setLoadingUser] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // ✅ Fetch all events once on load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/events");
        setEvents(res.data.events || res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // ✅ Sync user with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.token) localStorage.setItem("token", user.token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  // ✅ Login / Register / Logout
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", { email, password });
      const { token, user: loggedUser } = res.data;
      const updatedUser = {
        ...loggedUser,
        token,
        isAdmin: loggedUser.role === "superadmin" || loggedUser.role === "clubadmin",
      };
      setUser(updatedUser);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: string }): Promise<boolean> => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/register", data);
      const { token, user: newUser } = res.data;
      const updatedUser = {
        ...newUser,
        token,
        isAdmin: newUser.role === "superadmin" || newUser.role === "clubadmin",
      };
      setUser(updatedUser);
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ✅ FIXED: Add Event → calls backend API + updates state
  const addEvent = async (eventData: Omit<Event, "_id">): Promise<Event> => {
    if (!user || !user.token) throw new Error("User not authenticated");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/events",
        { ...eventData, date: new Date(eventData.date) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const newEvent = res.data;
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (err: any) {
      console.error("Failed to create event:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to create event");
    }
  };

  // ✅ Dummy local helpers
  const registerForEvent = (eventId: string, teamMembers: TeamMember[]) => {
    if (!user) return "";
    const qrCode = `QR-${Date.now()}-${user.id}-${eventId}`;
    const newParticipant: Participant = {
      id: Date.now().toString(),
      eventId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      teamMembers,
      registrationDate: new Date().toISOString(),
      attended: false,
      certificateIssued: false,
      qrCode,
    };
    setParticipants((prev) => [...prev, newParticipant]);
    return qrCode;
  };

  const markAttendance = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, attended: true } : p))
    );
  };

  const issueCertificate = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, certificateIssued: true } : p))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        events,
        participants,
        login,
        register,
        logout,
        addEvent,
        registerForEvent,
        markAttendance,
        issueCertificate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
