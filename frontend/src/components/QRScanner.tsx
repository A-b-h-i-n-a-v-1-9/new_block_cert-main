import React, { useState } from "react";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import axios from "axios";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export function QRScanner() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleScan = async (data: string | null) => {
    if (!data || loading) return;

    try {
      setLoading(true);
      setStatus("idle");

      // ✅ Send admin token instead of Bearer user token
      const res = await axios.post(
        "http://localhost:4000/api/attendance/scan",
        { qrToken: data },
        {
          headers: {
            "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN,
          },
        }
      );

      setResult(res.data.message || "Attendance recorded successfully");
      setStatus("success");
      console.log("✅ Attendance recorded for:", data);
    } catch (err: any) {
      console.error("❌ Scan failed:", err);
      setStatus("error");
      setResult(err.response?.data?.error || "Invalid or expired QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scanner Error:", err);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Scan Attendance for Event
        </h1>

        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <QrReader
            onResult={(result, error) => {
              if (!!result) handleScan(result.getText());
              if (!!error) handleError(error);
            }}
            constraints={{ facingMode: "environment" }}
            containerStyle={{ width: "100%" }}
          />
        </div>

        <div className="mt-6 text-center">
          {status === "success" && (
            <div className="flex flex-col items-center text-green-600">
              <CheckCircle2 className="w-10 h-10 mb-2" />
              <p>{result}</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center text-red-600">
              <XCircle className="w-10 h-10 mb-2" />
              <p>{result}</p>
            </div>
          )}
          {status === "idle" && (
            <p className="text-gray-600">Align QR code within the frame</p>
          )}
        </div>

        <Button
          onClick={() => navigate("/admin")}
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  );
}
