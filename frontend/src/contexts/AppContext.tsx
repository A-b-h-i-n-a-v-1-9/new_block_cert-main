import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

export interface Event {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  image: string;
  maxParticipants: number;
  registeredCount: number;
}

export interface TeamMember {
  name: string;
  email: string;
  id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  walletAddress?: string;
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
  addEvent: (event: Omit<Event, "id">) => void;
  registerForEvent: (eventId: string, teamMembers: TeamMember[]) => string;
  markAttendance: (participantId: string) => void;
  issueCertificate: (participantId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // ✅ Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser({ ...parsedUser, token, isAdmin: parsedUser.role === "superadmin" || parsedUser.role === "clubadmin" });
    } else {
      setUser(null);
    }
    setLoadingUser(false);
  }, []);

  // ✅ Fetch events
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

  // ✅ Keep user synced
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.token) localStorage.setItem("token", user.token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  // ✅ Login
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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // ✅ Register
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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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

  // ✅ Local dummy logic (for now)
  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent = { ...event, id: Date.now().toString() };
    setEvents((prev) => [...prev, newEvent]);
  };

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
