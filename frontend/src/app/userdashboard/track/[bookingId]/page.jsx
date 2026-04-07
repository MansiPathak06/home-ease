"use client";
// app/userdashboard/track/[bookingId]/page.jsx
// Install: npm install leaflet react-leaflet
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, MapPin, Clock, CheckCircle, Truck, Phone,
  MessageCircle, Star, Navigation, Wifi, WifiOff, User
} from "lucide-react";

// ─── Leaflet Map (SSR-safe) ─────────────────────────────────
const TrackingMap = dynamic(() => import("@/components/tracking/TrackingMap"), { ssr: false });

// ─── Status config ──────────────────────────────────────────
const STATUS_STEPS = [
  { key: "approved",   label: "Booking Confirmed",  icon: CheckCircle, color: "#22c55e" },
  { key: "en_route",   label: "Vendor En Route",    icon: Truck,       color: "#3b82f6" },
  { key: "arrived",    label: "Vendor Arrived",     icon: MapPin,      color: "#f59e0b" },
  { key: "in_service", label: "Service In Progress",icon: Star,        color: "#8b5cf6" },
  { key: "completed",  label: "Service Completed",  icon: CheckCircle, color: "#10b981" },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

export default function UserTracking() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.bookingId;

  const [booking, setBooking] = useState(null);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [trackingStatus, setTrackingStatus] = useState("approved");
  const [eta, setEta] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  // Get user's own location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  // Fetch booking details
  useEffect(() => {
    if (!bookingId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/user/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  // WebSocket connection
  const connectWS = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
    const ws = new WebSocket(`${wsUrl}/tracking?bookingId=${bookingId}&role=user`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setTimeout(connectWS, 3000); };
    ws.onerror = () => ws.close();

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "location_update") {
        setVendorLocation(data.location);
        setPath((prev) => [...prev.slice(-200), data.location]);
        if (data.eta) setEta(data.eta);
      }
      if (data.type === "status_update") setTrackingStatus(data.status);
      if (data.type === "path_history") setPath(data.path);
    };
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) connectWS();
    return () => wsRef.current?.close();
  }, [connectWS]);

  // Send user location to WS
  useEffect(() => {
    if (userLocation && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "user_location", location: userLocation }));
    }
  }, [userLocation]);

  const currentStepIdx = STATUS_ORDER.indexOf(trackingStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Live Tracking</p>
          <p className="text-white/50 text-xs">Booking #{bookingId}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? "Live" : "Reconnecting..."}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[50vh]">
        <TrackingMap
          vendorLocation={vendorLocation}
          userLocation={userLocation}
          path={path}
          trackingStatus={trackingStatus}
        />

        {/* ETA overlay */}
        {eta && trackingStatus === "en_route" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur border border-white/10 rounded-2xl px-5 py-3 shadow-2xl z-[400]">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{eta.minutes} <span className="text-lg font-medium text-white/60">min</span></p>
              <p className="text-white/50 text-xs mt-0.5">{eta.distance} km away</p>
            </div>
          </div>
        )}

        {/* Status arrived badge */}
        {trackingStatus === "arrived" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 rounded-2xl px-5 py-3 shadow-2xl z-[400]">
            <p className="text-white font-bold text-sm text-center">🏠 Vendor has arrived!</p>
          </div>
        )}
        {trackingStatus === "in_service" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600 rounded-2xl px-5 py-3 shadow-2xl z-[400]">
            <p className="text-white font-bold text-sm text-center">⚡ Service in progress</p>
          </div>
        )}
        {trackingStatus === "completed" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 rounded-2xl px-5 py-3 shadow-2xl z-[400]">
            <p className="text-white font-bold text-sm text-center">✅ Service completed!</p>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="bg-gray-900 rounded-t-3xl -mt-4 relative z-10 border-t border-white/5 pb-6">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-5" />

        {/* Vendor card */}
        {booking && (
          <div className="mx-4 mb-5 flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{booking.vendor_name || "Your Vendor"}</p>
              <p className="text-white/50 text-xs">{booking.service_name}</p>
            </div>
            <div className="flex gap-2">
              {booking.vendor_phone && (
                <a href={`tel:${booking.vendor_phone}`}
                  className="w-9 h-9 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center hover:bg-green-500/30 transition-colors">
                  <Phone className="w-4 h-4 text-green-400" />
                </a>
              )}
              <button className="w-9 h-9 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                <MessageCircle className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>
        )}

        {/* Progress steps */}
        <div className="mx-4 space-y-0">
          {STATUS_STEPS.map((step, idx) => {
            const isComplete = idx < currentStepIdx;
            const isCurrent  = idx === currentStepIdx;
            const isFuture   = idx > currentStepIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center gap-3">
                {/* Connector line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isComplete ? "bg-green-500" :
                    isCurrent  ? "bg-white ring-4 ring-white/20" :
                    "bg-white/10"
                  }`}>
                    <Icon className={`w-4 h-4 ${isComplete ? "text-white" : isCurrent ? "text-gray-900" : "text-white/30"}`} />
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 rounded-full ${isComplete ? "bg-green-500" : "bg-white/10"}`} />
                  )}
                </div>

                <div className={`py-2 flex-1 ${idx < STATUS_STEPS.length - 1 ? "mb-1" : ""}`}>
                  <p className={`text-sm font-semibold ${isComplete ? "text-green-400" : isCurrent ? "text-white" : "text-white/30"}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                      In progress...
                    </p>
                  )}
                </div>

                {isCurrent && (
                  <div className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${step.color}20`, color: step.color }}>
                    Now
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}