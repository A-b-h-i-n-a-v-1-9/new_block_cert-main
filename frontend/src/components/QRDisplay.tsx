import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface QRDisplayProps {
  qrCode: string;
  eventTitle: string;
  onClose: () => void;
}

export function QRDisplay({ qrCode, eventTitle, onClose }: QRDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${eventTitle}-qr.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative text-center space-y-6">
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
          <img
            src={qrCode}
            alt="QR Code"
            className="w-64 h-64 rounded-lg border shadow-md"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownload}
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
