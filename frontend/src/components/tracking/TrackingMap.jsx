"use client";
// components/tracking/TrackingMap.jsx
// Renders vendor pin, user pin, and the GPS trail path
// SSR-safe: imported via next/dynamic with { ssr: false }
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon paths in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom SVG icons
const vendorIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:44px;height:44px;border-radius:50%;
    background:linear-gradient(135deg,#ef4444,#f97316);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 20px rgba(239,68,68,0.5);
    border:3px solid white;
    animation: vendorPulse 1.5s ease-in-out infinite;
    position:relative;
  ">
    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
      <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9l-1.5-4.5H4.5L3 9.5H1.5v5H3c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h1.5V9.5H19.5zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5.5 9l.75-2.25h11.5L18.5 9H5.5z"/>
    </svg>
    <div style="position:absolute;top:-3px;right:-3px;width:12px;height:12px;background:#22c55e;border-radius:50%;border:2px solid white;"></div>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:40px;height:40px;border-radius:50%;
    background:linear-gradient(135deg,#3b82f6,#6366f1);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 20px rgba(59,130,246,0.5);
    border:3px solid white;
  ">
    <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function TrackingMap({
  vendorLocation,
  userLocation,
  path = [],
  trackingStatus = "approved",
  isVendorView = false,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vendorMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const hasInitialized = useRef(false);

  // Init map
  useEffect(() => {
    if (hasInitialized.current || !mapRef.current) return;
    hasInitialized.current = true;

    const defaultCenter = vendorLocation
      ? [vendorLocation.lat, vendorLocation.lng]
      : userLocation
      ? [userLocation.lat, userLocation.lng]
      : [20.5937, 78.9629]; // India center

    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Dark map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Pulse animation CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes vendorPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(239,68,68,0.5); }
        50% { transform: scale(1.08); box-shadow: 0 6px 30px rgba(239,68,68,0.8); }
      }
    `;
    document.head.appendChild(style);

    return () => { map.remove(); hasInitialized.current = false; };
  }, []);

  // Vendor marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !vendorLocation) return;

    if (vendorMarkerRef.current) {
      vendorMarkerRef.current.setLatLng([vendorLocation.lat, vendorLocation.lng]);
    } else {
      vendorMarkerRef.current = L.marker([vendorLocation.lat, vendorLocation.lng], { icon: vendorIcon })
        .addTo(map)
        .bindPopup("<b>Your Vendor</b><br>On the way to you", { closeButton: false });
    }

    if (isVendorView) {
      map.panTo([vendorLocation.lat, vendorLocation.lng], { animate: true });
    }
  }, [vendorLocation, isVendorView]);

  // User/destination marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Location</b>", { closeButton: false });
    }
  }, [userLocation]);

  // Auto-fit both markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !vendorLocation || !userLocation || isVendorView) return;

    const bounds = L.latLngBounds(
      [vendorLocation.lat, vendorLocation.lng],
      [userLocation.lat, userLocation.lng]
    );
    map.fitBounds(bounds, { padding: [60, 60], animate: true });
  }, [vendorLocation, userLocation, isVendorView]);

  // Path polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || path.length < 2) return;

    const latLngs = path.map((p) => [p.lat, p.lng]);

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
    } else {
      polylineRef.current = L.polyline(latLngs, {
        color: "#ef4444",
        weight: 4,
        opacity: 0.8,
        dashArray: "8 4",
        lineCap: "round",
      }).addTo(map);
    }
  }, [path]);

  return (
    <div className="w-full h-full min-h-[40vh]">
      <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "40vh" }} />
    </div>
  );
}