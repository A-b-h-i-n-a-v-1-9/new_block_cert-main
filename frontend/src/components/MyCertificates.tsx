import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export function MyCertificates() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCerts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mb-4"></div>
        <p>Loading Certificates...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">🎓 My Certificates</h1>

      {certs.length === 0 ? (
        <p className="text-gray-500">No certificates yet. Attend an event and wait for the admin to mint them!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((c, i) => (
            <Card key={i} className="p-4 bg-white/80 hover:shadow-lg transition">
              <CardContent>
                <h3 className="text-lg font-semibold">{c.eventId?.title}</h3>
                <p className="text-sm text-gray-600">{c.participantEmail}</p>
                <Badge className="mt-2 bg-green-500 text-white">Certificate Minted</Badge>

                <p className="text-xs mt-2">
                  <span className="font-semibold">Cert ID:</span> {c.certId}
                </p>

                {c.txHash && (
                  <p className="text-xs mt-1 text-gray-600">
                    <a
                      href={`https://amoy.polygonscan.com/tx/${c.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on PolygonScan ↗
                    </a>
                  </p>
                )}

                {c.ipfsHash && (
                  <p className="text-xs mt-1 text-gray-600">
                    <a
                      href={`https://ipfs.io/ipfs/${c.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      View on IPFS ↗
                    </a>
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Issued on: {new Date(c.issuedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
