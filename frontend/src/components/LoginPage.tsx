import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, User, Lock, Wallet, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { useApp } from "../contexts/AppContext";

export function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    walletAddress: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useApp();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        // ✅ Register Flow
        const success = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: isAdmin ? "superadmin" : "student",
        });

        if (success) {
          navigate(isAdmin ? "/admin" : "/");
        } else {
          throw new Error("Registration failed");
        }
      } else {
        // ✅ Login Flow
        const success = await login(formData.email, formData.password);
        if (success) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (user.role === "superadmin" || user.role === "clubadmin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          throw new Error("Invalid email or password");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
          <img
  src="https://i.imgur.gg/d8YmEE7-ChainOwl-removebg-preview.png"
  alt="Logo"
  className="w-8 h-8 rounded-lg object-cover"
/>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChainOwl
            </span>
          </Link>
          <h1 className="text-3xl mb-2 text-gray-800">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">
            {isSignup ? "Register to get started" : "Sign in to your account"}
          </p>
        </div>

        {/* Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {isAdmin ? "Admin" : "Student"} {isSignup ? "Sign Up" : "Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name (Signup only) */}
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Wallet Address (Signup only) */}
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address *</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="walletAddress"
                      type="text"
                      placeholder="Enter wallet ID"
                      value={formData.walletAddress}
                      onChange={(e) => handleChange("walletAddress", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isSignup
                  ? "Sign Up"
                  : "Sign In"}
              </Button>

              {/* Toggle Buttons */}
              <div className="text-center pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {isSignup
                    ? "Already have an account? Login"
                    : "New user? Create account"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdmin(!isAdmin)}
                  className="block text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  {isAdmin ? "Switch to Student" : "Admin Login"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
