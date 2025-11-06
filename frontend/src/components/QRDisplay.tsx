import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface QRDisplayProps {
  qrCode: string; // can be base64, URL, or plain token
  eventTitle: string;
  onClose: () => void;
}

export function QRDisplay({ qrCode, eventTitle, onClose }: QRDisplayProps) {
  const [qrImage, setQrImage] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        if (!qrCode) return;

        // ✅ Case 1: already an image (base64 or http URL)
        if (qrCode.startsWith("data:image") || qrCode.startsWith("http")) {
          setQrImage(qrCode);
        } 
        // ✅ Case 2: raw token or string → generate QR image from it
        else {
          const generated = await QRCode.toDataURL(qrCode);
          setQrImage(generated);
        }
      } catch (err) {
        console.error("❌ Failed to generate QR image:", err);
      }
    };
    generateQR();
  }, [qrCode]);

  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `${eventTitle}-qr.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative text-center space-y-6 animate-in fade-in-50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800">QR Code</h2>
        <p className="text-gray-500 text-sm">Show this at the event check-in</p>

        {/* QR Code Image */}
        <div className="flex justify-center">
          {qrImage ? (
            <img
              src={qrImage}
              alt="QR Code"
              className="w-64 h-64 rounded-lg border shadow-md transition-all"
            />
          ) : (
            <p className="text-gray-500">Generating QR...</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownload}
            disabled={!qrImage}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full"
          >
            Download QR
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
