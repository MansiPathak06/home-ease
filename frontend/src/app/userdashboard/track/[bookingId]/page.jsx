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
  { key: "approved",   label: "Booking Confirmed",   icon: CheckCircle, color: "#C0392B" },
  { key: "en_route",   label: "Vendor En Route",     icon: Truck,       color: "#C0392B" },
  { key: "arrived",    label: "Vendor Arrived",      icon: MapPin,      color: "#C0392B" },
  { key: "in_service", label: "Service In Progress", icon: Star,        color: "#C0392B" },
  { key: "completed",  label: "Service Completed",   icon: CheckCircle, color: "#C0392B" },
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#C0392B', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#888' }}>Loading tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#111111' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50"
        style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}
      >
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: '#f0f0f0' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: '#f0f0f0' }}>Live Tracking</p>
          <p className="text-xs" style={{ color: '#666' }}>Booking #{bookingId}</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={
            connected
              ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }
              : { backgroundColor: 'rgba(192,57,43,0.15)', color: '#e87c6e', border: '1px solid rgba(192,57,43,0.3)' }
          }
        >
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
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 backdrop-blur rounded-2xl px-5 py-3 shadow-2xl z-[400]"
            style={{ backgroundColor: 'rgba(26,26,26,0.95)', border: '1px solid #2a2a2a' }}
          >
            <div className="text-center">
              <p className="text-3xl font-black" style={{ color: '#f0f0f0' }}>
                {eta.minutes} <span className="text-lg font-medium" style={{ color: '#888' }}>min</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>{eta.distance} km away</p>
            </div>
          </div>
        )}

        {/* Status overlays */}
        {trackingStatus === "arrived" && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 shadow-2xl z-[400]"
            style={{ backgroundColor: '#C0392B' }}
          >
            <p className="text-white font-bold text-sm text-center">🏠 Vendor has arrived!</p>
          </div>
        )}
        {trackingStatus === "in_service" && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 shadow-2xl z-[400]"
            style={{ backgroundColor: '#991b1b' }}
          >
            <p className="text-white font-bold text-sm text-center">⚡ Service in progress</p>
          </div>
        )}
        {trackingStatus === "completed" && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 shadow-2xl z-[400]"
            style={{ backgroundColor: '#22c55e' }}
          >
            <p className="text-white font-bold text-sm text-center">✅ Service completed!</p>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div
        className="rounded-t-3xl -mt-4 relative z-10 pb-6"
        style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid #2a2a2a' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-5" style={{ backgroundColor: '#3a3a3a' }} />

        {/* Vendor card */}
        {booking && (
          <div
            className="mx-4 mb-5 flex items-center gap-3 rounded-2xl p-4"
            style={{ backgroundColor: '#222', border: '1px solid #2a2a2a' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#C0392B' }}
            >
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#f0f0f0' }}>
                {booking.vendor_name || "Your Vendor"}
              </p>
              <p className="text-xs" style={{ color: '#888' }}>{booking.service_name}</p>
            </div>
            <div className="flex gap-2">
              {booking.vendor_phone && (
                <a
                  href={`tel:${booking.vendor_phone}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.12)'}
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.28)', color: '#e87c6e' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.22)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.12)'}
              >
                <MessageCircle className="w-4 h-4" />
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
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={
                      isComplete
                        ? { backgroundColor: '#C0392B' }
                        : isCurrent
                          ? { backgroundColor: '#f0f0f0', boxShadow: '0 0 0 4px rgba(192,57,43,0.25)' }
                          : { backgroundColor: '#2a2a2a' }
                    }
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{
                        color: isComplete ? '#fff' : isCurrent ? '#111' : '#555',
                      }}
                    />
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className="w-0.5 h-8 mt-1 rounded-full"
                      style={{ backgroundColor: isComplete ? '#C0392B' : '#2a2a2a' }}
                    />
                  )}
                </div>

                <div className={`py-2 flex-1 ${idx < STATUS_STEPS.length - 1 ? "mb-1" : ""}`}>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: isComplete ? '#e87c6e' : isCurrent ? '#f0f0f0' : '#444',
                    }}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#666' }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: '#C0392B' }}
                      />
                      In progress...
                    </p>
                  )}
                </div>

                {isCurrent && (
                  <div
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: 'rgba(192,57,43,0.18)', color: '#e87c6e' }}
                  >
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