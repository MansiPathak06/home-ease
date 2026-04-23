"use client";
// components/admin/AdminTrackingPanel.jsx
// Drop this inside your AdminBookingsSection or as a separate tab
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Navigation, Users, Truck, CheckCircle, Circle,
  Wifi, WifiOff, MapPin, Clock, Eye, X
} from "lucide-react";

const TrackingMap = dynamic(() => import("@/components/tracking/TrackingMap"), { ssr: false });

const STATUS_COLORS = {
  approved:    "text-blue-400   bg-blue-500/10   border-blue-500/20",
  en_route:    "text-orange-400 bg-orange-500/10 border-orange-500/20",
  arrived:     "text-amber-400  bg-amber-500/10  border-amber-500/20",
  in_service:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
  completed:   "text-green-400  bg-green-500/10  border-green-500/20",
};

const STATUS_LABEL = {
  approved:    "Confirmed",
  en_route:    "En Route",
  arrived:     "Arrived",
  in_service:  "In Service",
  completed:   "Completed",
};

// ── Single booking tracker ────────────────────────────────────
function BookingTracker({ booking }) {
  const [vendorLocation, setVendorLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [status, setStatus] = useState(booking.tracking_status || booking.status || "approved");
  const [connected, setConnected] = useState(false);
  const [eta, setEta] = useState(null);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
    const ws = new WebSocket(`${wsUrl}/tracking?bookingId=${booking.id}&role=admin`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setTimeout(connect, 4000); };
    ws.onerror = () => ws.close();
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "location_update") {
        setVendorLocation(data.location);
        setPath((prev) => [...prev.slice(-200), data.location]);
        if (data.eta) setEta(data.eta);
      }
      if (data.type === "status_update") setStatus(data.status);
      if (data.type === "path_history") setPath(data.path);
    };
  }, [booking.id]);

  useEffect(() => { connect(); return () => wsRef.current?.close(); }, [connect]);

  const cls = STATUS_COLORS[status] || STATUS_COLORS.approved;

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/8 transition-all">
      {/* Live dot */}
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${connected && vendorLocation ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-white text-sm font-bold truncate">#{booking.id} – {booking.vendor_name || "Vendor"}</p>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
            {STATUS_LABEL[status] || status}
          </span>
        </div>
        <p className="text-white/40 text-xs truncate">{booking.service_name} · {booking.customer_name}</p>
        {eta && status === "en_route" && (
          <p className="text-orange-400 text-xs mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> ETA {eta.minutes} min · {eta.distance} km
          </p>
        )}
        {!vendorLocation && connected && (
          <p className="text-white/30 text-xs mt-0.5">Waiting for vendor GPS...</p>
        )}
      </div>

      <div className={`px-2 py-1 rounded-md text-[10px] font-semibold ${connected ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
        {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      </div>
    </div>
  );
}

// ── Full-screen modal tracking ────────────────────────────────
function FullTrackModal({ booking, onClose }) {
  const [vendorLocation, setVendorLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [status, setStatus] = useState(booking.tracking_status || booking.status || "approved");
  const [eta, setEta] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
    const ws = new WebSocket(`${wsUrl}/tracking?bookingId=${booking.id}&role=admin`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
    ws.onerror = () => ws.close();
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "location_update") {
        setVendorLocation(data.location);
        setPath((prev) => [...prev.slice(-300), data.location]);
        if (data.eta) setEta(data.eta);
      }
      if (data.type === "status_update") setStatus(data.status);
      if (data.type === "path_history") setPath(data.path);
    };
  }, [booking.id]);

  useEffect(() => { connect(); return () => wsRef.current?.close(); }, [connect]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white font-bold">Tracking Booking #{booking.id}</p>
            <p className="text-white/50 text-xs">{booking.vendor_name} → {booking.customer_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? "Live" : "Connecting..."}
            </span>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 h-[75vh]">
          {/* Map */}
          <div className="md:col-span-2 relative">
            <TrackingMap vendorLocation={vendorLocation} path={path} trackingStatus={status} />
            {eta && (
              <div className="absolute top-4 left-4 bg-gray-900/95 border border-white/10 rounded-xl px-4 py-2 z-[400]">
                <p className="text-white text-lg font-black">{eta.minutes} <span className="text-sm font-normal text-white/50">min</span></p>
                <p className="text-white/40 text-xs">{eta.distance} km away</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-gray-900/50 border-l border-white/10 p-5 overflow-y-auto space-y-4">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Booking Info</p>
              <div className="space-y-2 text-sm">
                {[
                  ["Booking", `#${booking.id}`],
                  ["Vendor", booking.vendor_name || "—"],
                  ["Customer", booking.customer_name || "—"],
                  ["Service", booking.service_name || "—"],
                  ["Date", booking.date || "—"],
                  ["Time", booking.time || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white font-medium text-right text-xs max-w-[60%] truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Status</p>
              <div className={`px-3 py-2 rounded-xl border text-sm font-bold ${STATUS_COLORS[status] || ""}`}>
                {STATUS_LABEL[status] || status}
              </div>
            </div>

            {vendorLocation && (
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Last GPS</p>
                <div className="bg-white/5 rounded-xl p-3 text-xs font-mono text-white/60">
                  <p>Lat: {vendorLocation.lat.toFixed(6)}</p>
                  <p>Lng: {vendorLocation.lng.toFixed(6)}</p>
                  <p className="text-white/30 mt-1">
                    {vendorLocation.timestamp ? new Date(vendorLocation.timestamp).toLocaleTimeString() : ""}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Path Points</p>
              <p className="text-white font-bold text-xl">{path.length}</p>
              <p className="text-white/30 text-xs">GPS pings recorded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
export default function AdminTrackingPanel({ bookings = [] }) {
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Filter to bookings that are in active tracking states
  const activeBookings = bookings.filter((b) =>
    ["approved", "en_route", "arrived", "in_service"].includes(b.tracking_status || b.status)
  );

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
            <Navigation className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Live Tracking</p>
            <p className="text-white/40 text-xs">{activeBookings.length} active service{activeBookings.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${activeBookings.length > 0 ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
      </div>

      {/* Active bookings list */}
      {activeBookings.length === 0 ? (
        <div className="text-center py-10 text-white/30">
          <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active services being tracked</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {activeBookings.map((b) => (
            <div key={b.id} className="relative group">
              <BookingTracker booking={b} />
              <button
                onClick={() => setSelectedBooking(b)}
                className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-white text-xs font-semibold flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> View
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Full-screen modal */}
      {selectedBooking && (
        <FullTrackModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
      {/* // AdminTrackingPanel.jsx ke end mein ye add karo */}

    </div>
    
  );
}
export { FullTrackModal };