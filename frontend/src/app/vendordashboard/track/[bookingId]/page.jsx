"use client";
// app/vendordashboard/track/[bookingId]/page.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Navigation, Play, Square, MapPin,
  CheckCircle, Clock, Users, Phone, Wifi, WifiOff,
  AlertCircle, Truck, Star
} from "lucide-react";

const TrackingMap = dynamic(() => import("@/components/tracking/TrackingMap"), { ssr: false });

const STATUS_STEPS = [
  { key: "en_route",   label: "Start Journey",       desc: "Begin navigating to customer",  color: "bg-[#C0392B]",        icon: Truck },
  { key: "arrived",    label: "Mark Arrived",         desc: "You've reached the location",   color: "bg-[#A93226]",        icon: MapPin },
  { key: "in_service", label: "Start Service",        desc: "Begin providing the service",   color: "bg-[#922B21]",        icon: Play },
  { key: "completed",  label: "Complete Service",     desc: "Mark service as done",          color: "bg-[#1E8449]",        icon: CheckCircle },
];

export default function VendorTracking() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.bookingId;

  const [booking, setBooking] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [trackingStatus, setTrackingStatus] = useState("approved");
  const [isTracking, setIsTracking] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locError, setLocError] = useState("");
  const wsRef = useRef(null);
  const watchIdRef = useRef(null);

  // Fetch booking
  useEffect(() => {
    if (!bookingId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/vendor/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  // WebSocket
  const connectWS = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
    const ws = new WebSocket(`${wsUrl}/tracking?bookingId=${bookingId}&role=vendor`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setTimeout(connectWS, 3000); };
    ws.onerror = () => ws.close();
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "status_update") setTrackingStatus(data.status);
      if (data.type === "path_history") setPath(data.path);
    };
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) connectWS();
    return () => { wsRef.current?.close(); stopTracking(); };
  }, [connectWS]);

  const startTracking = () => {
    setLocError("");
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() };
        setMyLocation(loc);
        setPath((prev) => [...prev.slice(-200), loc]);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "location_update", location: loc, bookingId }));
        }
      },
      (err) => setLocError("Unable to get location: " + err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    setIsTracking(false);
  };

  const sendStatus = (status) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "status_update", status, bookingId }));
    }
    setTrackingStatus(status);

    // Also update DB
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/vendor/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: status === "completed" ? "completed" : "approved", tracking_status: status }),
    });
  };

  const statusOrder = ["approved", "en_route", "arrived", "in_service", "completed"];
  const currentIdx = statusOrder.indexOf(trackingStatus);
  const nextStep = STATUS_STEPS[currentIdx]; // next action available

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex flex-col">
      {/* Header */}
      <div className="bg-[#C0392B] border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-white/20 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Service Tracking</p>
          <p className="text-white/70 text-xs">Booking #{bookingId}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          connected
            ? "bg-white/20 text-white border border-white/30"
            : "bg-black/30 text-white/60 border border-white/10"
        }`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? "Connected" : "Reconnecting"}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[40vh]">
        <TrackingMap
          vendorLocation={myLocation}
          path={path}
          isVendorView
          trackingStatus={trackingStatus}
        />

        {/* Live badge */}
        {isTracking && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#C0392B] rounded-full px-3 py-1.5 shadow-lg z-[400] border border-white/20">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#232323] rounded-t-3xl -mt-4 relative z-10 border-t border-white/10 p-5 pb-8 space-y-5">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />

        {/* Customer info */}
        {booking && (
          <div className="flex items-center gap-3 bg-[#2C2C2C] rounded-2xl p-4 border border-white/10">
            <div className="w-11 h-11 bg-[#C0392B] rounded-full flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{booking.customer_name || "Customer"}</p>
              <p className="text-white/50 text-xs">{booking.service_name}</p>
              <p className="text-white/30 text-xs mt-0.5">{booking.date} · {booking.time}</p>
            </div>
            {booking.customer_phone && (
              <a href={`tel:${booking.customer_phone}`}
                className="w-9 h-9 bg-[#C0392B]/20 border border-[#C0392B]/40 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#E74C3C]" />
              </a>
            )}
          </div>
        )}

        {/* GPS Toggle */}
        <div className="flex gap-3">
          {!isTracking ? (
            <button onClick={startTracking}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-[#C0392B]/30">
              <Navigation className="w-5 h-5" />
              Start GPS Sharing
            </button>
          ) : (
            <button onClick={stopTracking}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#C0392B]/10 border border-[#C0392B]/40 text-[#E74C3C] rounded-2xl font-bold text-sm transition-all">
              <Square className="w-4 h-4" />
              Stop GPS
            </button>
          )}
        </div>

        {locError && (
          <div className="flex items-center gap-2 text-[#E74C3C] bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-xl px-3 py-2.5 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {locError}
          </div>
        )}

        {/* Status progression */}
        <div className="space-y-2.5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Update Status</p>
          {STATUS_STEPS.map((step, idx) => {
            const stepIdx = statusOrder.indexOf(step.key);
            const isCompleted = stepIdx <= currentIdx;
            const isNext = stepIdx === currentIdx + 1;
            const isFuture = stepIdx > currentIdx + 1;
            const Icon = step.icon;

            return (
              <button
                key={step.key}
                disabled={!isNext || !connected}
                onClick={() => isNext && sendStatus(step.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all ${
                  isCompleted
                    ? "bg-[#1E8449]/10 border border-[#1E8449]/25 opacity-60"
                    : isNext
                    ? `${step.color} shadow-lg active:scale-95`
                    : "bg-white/5 border border-white/10 opacity-30 cursor-not-allowed"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? "bg-[#1E8449]" : isNext ? "bg-white/20" : "bg-white/10"
                }`}>
                  {isCompleted
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <Icon className="w-5 h-5 text-white" />
                  }
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{isCompleted ? "✓ " : ""}{step.label}</p>
                  <p className="text-white/60 text-xs">{step.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}