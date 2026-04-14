"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  Calendar,
  IndianRupee,
  Star,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  MessageSquare,
  Bell,
  X,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Navigation,
} from "lucide-react";

// ── THEME TOKENS (HomeEase full dark palette) ───────────────
const T = {
  crimson:       "#C0392B",
  crimsonHover:  "#A41B24",
  crimsonLight:  "#3D1210",   // dark red tint for badges/alerts on dark bg
  crimsonMuted:  "#5A1A18",   // border tint on dark bg
  crimsonText:   "#F1948A",   // readable red text on dark bg

  dark:          "#1C1C1C",   // main page background
  darkSurface:   "#242424",   // cards / panels
  darkSurface2:  "#2C2C2C",   // slightly lighter surface (nested cards)
  darkBorder:    "#3A3A3A",   // borders on dark bg
  darkBorder2:   "#333333",   // subtler border

  inputBg:       "#2A2A2A",   // dark input fields
  inputBorder:   "#444444",

  white:         "#FFFFFF",
  offWhite:      "#F0F0F0",   // text on dark bg
  gray50:        "#2A2A2A",   // "light" bg replacement → dark surface
  gray100:       "#333333",
  gray200:       "#444444",
  gray400:       "#888888",
  gray500:       "#777777",
  gray600:       "#AAAAAA",
  gray700:       "#CCCCCC",
  gray900:       "#EEEEEE",   // near-white text
};

// ── INLINE STYLE HELPERS ────────────────────────────────────
const btn = {
  primary: {
    backgroundColor: T.crimson,
    color: T.white,
    border: "none",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s",
  },
  outline: {
    backgroundColor: "transparent",
    color: T.gray700,
    border: `1px solid ${T.darkBorder}`,
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s",
  },
};

export default function VendorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [vendorData, setVendorData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  const [showRejectModal, setShowRejectModal]         = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal]           = useState(false);
  const [selectedBooking, setSelectedBooking]         = useState(null);
  const [rejectReason, setRejectReason]               = useState("");
  const [rescheduleData, setRescheduleData]           = useState({ date: "", time: "", reason: "" });
  const [serviceNote, setServiceNote]                 = useState("");
  const [expandedBooking, setExpandedBooking]         = useState(null);
  const [actionLoading, setActionLoading]             = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "vendor") {
      router.push("/vendorlogin");
      return;
    }
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/vendorlogin"); return; }

      const [bookingsRes, statsRes, profileRes, reviewsRes] = await Promise.all([
        fetch("http://localhost:5000/api/vendor/bookings",  { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/vendor/stats",     { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/vendor/profile",   { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/vendor/reviews",   { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!bookingsRes.ok) throw new Error(`Bookings: ${bookingsRes.status}`);
      if (!profileRes.ok)  throw new Error(`Profile: ${profileRes.status}`);

      const [bookingsData, statsData, profileData, reviewsData] = await Promise.all([
        bookingsRes.json(),
        statsRes.ok   ? statsRes.json()   : null,
        profileRes.json(),
        reviewsRes.ok ? reviewsRes.json() : [],
      ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      if (statsData) setStats(statsData);
      setVendorData(profileData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      console.error("Error fetching vendor data:", err);
      setError(err.message || "Failed to load data");
    }
  };

  // ── BOOKING ACTIONS ────────────────────────────────────────

  const updateBookingStatus = async (bookingId, status, extra = {}) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/vendor/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!response.ok) throw new Error("Failed to update booking");
      const data = await response.json();
      if (data.success) {
        const messages = {
          approved:    "✅ Booking approved!",
          rejected:    "❌ Booking rejected.",
          completed:   "🎉 Marked as completed!",
          rescheduled: "📅 Reschedule request sent!",
        };
        setSuccess(messages[status] || "Updated!");
        fetchVendorData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to update booking. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove         = (booking) => updateBookingStatus(booking.id, "approved");
  const handleMarkCompleted   = (booking) => updateBookingStatus(booking.id, "completed");

  const handleRejectOpen = (booking) => {
    setSelectedBooking(booking); setRejectReason(""); setShowRejectModal(true);
  };
  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) { setError("Please provide a reason for rejection."); return; }
    updateBookingStatus(selectedBooking.id, "rejected", { vendor_response: rejectReason });
    setShowRejectModal(false); setSelectedBooking(null);
  };

  const handleRescheduleOpen = (booking) => {
    setSelectedBooking(booking);
    setRescheduleData({ date: booking.date || "", time: booking.time || "", reason: "" });
    setShowRescheduleModal(true);
  };
  const handleRescheduleConfirm = () => {
    if (!rescheduleData.date || !rescheduleData.time) { setError("Please pick a new date and time."); return; }
    updateBookingStatus(selectedBooking.id, "rescheduled", {
      new_date: rescheduleData.date,
      new_time: rescheduleData.time,
      vendor_response: rescheduleData.reason,
    });
    setShowRescheduleModal(false); setSelectedBooking(null);
  };

  const handleNotesOpen = (booking) => {
    setSelectedBooking(booking); setServiceNote(booking.service_notes || ""); setShowNotesModal(true);
  };
  const handleNotesSave = async () => {
    if (!serviceNote.trim()) { setError("Please enter a note."); return; }
    await updateBookingStatus(selectedBooking.id, selectedBooking.status, { service_notes: serviceNote });
    setShowNotesModal(false); setSelectedBooking(null);
  };

  // ── PROFILE EDIT ───────────────────────────────────────────

  const handleEditProfile = () => {
    setEditFormData({
      businessName:    vendorData?.business_name    || "",
      ownerName:       vendorData?.owner_name       || "",
      phone:           vendorData?.phone            || "",
      address:         vendorData?.address          || "",
      city:            vendorData?.city             || "",
      state:           vendorData?.state            || "",
      zipCode:         vendorData?.zip_code         || "",
      servicesOffered: vendorData?.services_offered || "",
      description:     vendorData?.description      || "",
      pricing:         vendorData?.pricing          || "",
      availability:    vendorData?.availability     || "",
      website:         vendorData?.website          || "",
      certification:   vendorData?.certification    || "",
    });
    setShowEditModal(true);
    setError(""); setSuccess("");
  };

  const handleEditFormChange = (e) =>
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const data = await api.vendor.updateProfile(editFormData);
      if (data.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => { setShowEditModal(false); fetchVendorData(); }, 2000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = () => { localStorage.clear(); router.push("/vendorlogin"); };
  const handleLogoutClick   = () => setShowLogoutModal(true);

  // ── STATUS CONFIG ──────────────────────────────────────────
  const statusConfig = {
    pending:     { bg: "#3A2E00", text: "#FCD34D", dot: "#F59E0B", label: "Pending"     },
    approved:    { bg: "#0D2340", text: "#93C5FD", dot: "#3B82F6", label: "Approved"    },
    completed:   { bg: "#052E16", text: "#6EE7B7", dot: "#10B981", label: "Completed"   },
    rejected:    { bg: T.crimsonLight, text: T.crimsonText, dot: T.crimson, label: "Rejected"    },
    cancelled:   { bg: "#2A2A2A", text: "#9CA3AF", dot: "#6B7280", label: "Cancelled"   },
    rescheduled: { bg: "#1E1040", text: "#C4B5FD", dot: "#7C3AED", label: "Rescheduled" },
  };

  const getStatusBadge = (status) => {
    const cfg = statusConfig[status] || { bg: "#2A2A2A", text: "#9CA3AF", dot: "#6B7280", label: status };
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
        backgroundColor: cfg.bg, color: cfg.text,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dot, display: "inline-block" }} />
        {cfg.label}
      </span>
    );
  };

  const formatINR = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // ── INPUT STYLE (dark, matching page) ─────────────────────
  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    fontSize: 13,
    border: `1px solid ${T.inputBorder}`,
    borderRadius: 6,
    backgroundColor: T.inputBg,
    color: T.gray900,
    outline: "none",
    boxSizing: "border-box",
  };

  const textareaStyle = { ...inputStyle, resize: "none" };

  // ── BOOKING ACTIONS COMPONENT ──────────────────────────────

  const BookingActions = ({ booking, compact = false }) => {
    const s = booking.status;
    const base = {
      padding: compact ? "4px 10px" : "6px 12px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 700,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      transition: "opacity 0.15s",
    };

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, ...(compact ? {} : { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.darkBorder}` }) }}>
        {s === "pending" && (
          <button disabled={actionLoading} onClick={() => handleApprove(booking)}
            style={{ ...base, backgroundColor: "#059669", color: T.white }}>
            <CheckCircle style={{ width: 12, height: 12 }} /> Accept
          </button>
        )}
        {(s === "pending" || s === "approved") && (
          <button disabled={actionLoading} onClick={() => handleRejectOpen(booking)}
            style={{ ...base, backgroundColor: T.crimson, color: T.white }}>
            <XCircle style={{ width: 12, height: 12 }} /> Reject
          </button>
        )}
        {(s === "pending" || s === "approved") && (
          <button disabled={actionLoading} onClick={() => handleRescheduleOpen(booking)}
            style={{ ...base, backgroundColor: "#2563EB", color: T.white }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Reschedule
          </button>
        )}
        {s === "approved" && (
          <button disabled={actionLoading} onClick={() => handleMarkCompleted(booking)}
            style={{ ...base, backgroundColor: "#7C3AED", color: T.white }}>
            <Check style={{ width: 12, height: 12 }} /> Mark Complete
          </button>
        )}
        {(s === "approved" || s === "en_route" || s === "arrived" || s === "in_service") && (
          <button onClick={() => router.push(`/vendordashboard/track/${booking.id}`)}
            style={{ ...base, backgroundColor: "#4F46E5", color: T.white }}>
            <Navigation style={{ width: 12, height: 12 }} /> Track
          </button>
        )}
        <button disabled={actionLoading} onClick={() => handleNotesOpen(booking)}
          style={{ ...base, backgroundColor: "transparent", color: T.gray600, border: `1px solid ${T.darkBorder}` }}>
          <FileText style={{ width: 12, height: 12 }} />
          {booking.service_notes ? "Edit Notes" : "Add Notes"}
        </button>
      </div>
    );
  };

  // ── BOOKING ROW ────────────────────────────────────────────

  const BookingRow = ({ booking, showActions = true }) => {
    const isOpen = expandedBooking === booking.id;
    return (
      <div style={{
        border: `1px solid ${T.darkBorder}`,
        borderRadius: 8,
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}>
        <div
          style={{ padding: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, cursor: "pointer", userSelect: "none", backgroundColor: T.darkSurface2 }}
          onClick={() => setExpandedBooking(isOpen ? null : booking.id)}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.gray900 }}>{booking.service_name}</span>
              {getStatusBadge(booking.status)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, fontSize: 12, color: T.gray600 }}>
              <span>👤 {booking.customer_name}</span>
              <span>📅 {booking.date}</span>
              <span>🕐 {booking.time}</span>
              <span style={{ fontWeight: 700, color: T.gray900, display: "flex", alignItems: "center", gap: 2 }}>
                <IndianRupee style={{ width: 12, height: 12 }} />
                {Number(booking.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            {booking.service_notes && (
              <p style={{ marginTop: 6, fontSize: 11, color: "#93C5FD", display: "flex", alignItems: "center", gap: 4 }}>
                <FileText style={{ width: 12, height: 12 }} /> Has service notes
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {showActions && <BookingActions booking={booking} compact />}
            {isOpen
              ? <ChevronUp style={{ width: 16, height: 16, color: T.gray400 }} />
              : <ChevronDown style={{ width: 16, height: 16, color: T.gray400 }} />}
          </div>
        </div>

        {isOpen && (
          <div style={{ borderTop: `1px solid ${T.darkBorder}`, backgroundColor: T.darkSurface, padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 12, marginBottom: 12 }}>
              {[
                ["Customer Email", booking.customer_email || "—"],
                ["Customer Phone", booking.customer_phone || "—"],
                ["Booking ID", `#${booking.id}`],
              ].map(([label, val]) => (
                <div key={label}>
                  <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</p>
                  <p style={{ color: T.gray900 }}>{val}</p>
                </div>
              ))}
              <div>
                <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Amount</p>
                <p style={{ color: T.gray900, fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                  <IndianRupee style={{ width: 13, height: 13 }} />
                  {Number(booking.amount || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Created</p>
                <p style={{ color: T.gray900 }}>{booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-IN") : "—"}</p>
              </div>
              {booking.guests && (
                <div>
                  <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Guests</p>
                  <p style={{ color: T.gray900 }}>{booking.guests}</p>
                </div>
              )}
              {booking.new_date && (
                <div style={{ gridColumn: "span 2" }}>
                  <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Rescheduled To</p>
                  <p style={{ color: "#C4B5FD", fontWeight: 700 }}>{booking.new_date} at {booking.new_time}</p>
                </div>
              )}
              {booking.vendor_response && (
                <div style={{ gridColumn: "span 2" }}>
                  <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Your Response</p>
                  <p style={{ color: T.gray900, backgroundColor: T.darkSurface2, border: `1px solid ${T.darkBorder}`, borderRadius: 6, padding: "6px 10px" }}>{booking.vendor_response}</p>
                </div>
              )}
              {booking.message && (
                <div style={{ gridColumn: "span 2" }}>
                  <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Customer Message</p>
                  <p style={{ color: T.gray900, backgroundColor: T.darkSurface2, border: `1px solid ${T.darkBorder}`, borderRadius: 6, padding: "6px 10px" }}>{booking.message}</p>
                </div>
              )}
              {booking.service_notes && (
                <div style={{ gridColumn: "span 2" }}>
                  <p style={{ color: T.gray400, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Service Notes</p>
                  <p style={{ color: T.gray900, backgroundColor: T.darkSurface2, border: `1px solid ${T.darkBorder}`, borderRadius: 6, padding: "6px 10px" }}>{booking.service_notes}</p>
                </div>
              )}
            </div>
            <BookingActions booking={booking} />
          </div>
        )}
      </div>
    );
  };

  // ── STAT CARDS CONFIG ──────────────────────────────────────
  const statCards = [
    { icon: Calendar,      accent: "#3B82F6", label: "Total Bookings", value: stats.totalBookings },
    { icon: TrendingUp,    accent: "#F59E0B", label: "Pending",        value: stats.pendingBookings },
    { icon: IndianRupee,   accent: "#10B981", label: "Total Revenue",  value: `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}` },
    { icon: Star,          accent: T.crimson, label: "Avg Rating",     value: (stats.averageRating || 0).toFixed(1) },
    { icon: MessageSquare, accent: "#EC4899", label: "Total Reviews",  value: reviews.length },
  ];

  // ── TABS CONFIG ────────────────────────────────────────────
  const tabs = [
    { id: "overview",  label: "Overview",  icon: LayoutDashboard },
    { id: "bookings",  label: "Bookings",  icon: Calendar, badge: stats.pendingBookings },
    { id: "services",  label: "Services",  icon: Settings },
    { id: "reviews",   label: "Reviews",   icon: Star },
    { id: "profile",   label: "Profile",   icon: Users },
  ];

  // ── MODAL OVERLAY ──────────────────────────────────────────
  const Overlay = ({ children, onClose }) => (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, zIndex: 50, overflowY: "auto",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );

  const ModalCard = ({ children, maxWidth = 448 }) => (
    <div style={{
      backgroundColor: T.darkSurface, borderRadius: 12, maxWidth, width: "100%",
      padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      border: `1px solid ${T.darkBorder}`,
    }}>
      {children}
    </div>
  );

  const ModalHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle, onClose }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon style={{ width: 20, height: 20, color: iconColor }} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.gray900, margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 11, color: T.gray600, margin: 0 }}>{subtitle}</p>}
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.gray400, padding: 4 }}>
        <X style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );

  const ModalFooter = ({ onCancel, onConfirm, confirmLabel, confirmStyle, loading }) => (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onCancel} style={{ ...btn.outline, flex: 1, justifyContent: "center" }}>Cancel</button>
      <button onClick={onConfirm} disabled={loading} style={{ ...confirmStyle, flex: 1, justifyContent: "center", opacity: loading ? 0.5 : 1 }}>
        {loading ? "Please wait..." : confirmLabel}
      </button>
    </div>
  );

  const FormLabel = ({ children, required }) => (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.gray600, marginBottom: 6 }}>
      {children}{required && <span style={{ color: T.crimson }}> *</span>}
    </label>
  );

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", marginTop: 80, backgroundColor: T.dark }}>

      {/* Toast */}
      {(success || error) && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 100,
          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
          borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          fontSize: 13, fontWeight: 600, color: T.white,
          backgroundColor: success ? "#059669" : T.crimson,
        }}>
          {success ? <CheckCircle style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
          {success || error}
          <button onClick={() => { setSuccess(""); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.white, padding: 0 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{
        backgroundColor: T.crimson,
        borderBottom: `1px solid ${T.crimsonHover}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: T.white, margin: 0 }}>
              {vendorData?.business_name || "Vendor Dashboard"}
            </h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>Manage your services and bookings</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{
              position: "relative", padding: 8, backgroundColor: "rgba(255,255,255,0.15)",
              border: `1px solid rgba(255,255,255,0.25)`, borderRadius: 8, cursor: "pointer",
            }}>
              <Bell style={{ width: 18, height: 18, color: T.white }} />
              {stats.pendingBookings > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 4, width: 16, height: 16,
                  backgroundColor: T.dark, borderRadius: "50%", color: T.white,
                  fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                }}>{stats.pendingBookings}</span>
              )}
            </button>
            <button onClick={handleLogoutClick} style={{
              ...btn.primary,
              backgroundColor: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <LogOut style={{ width: 15, height: 15 }} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px" }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
          {statCards.map(({ icon: Icon, accent, label, value }) => (
            <div key={label} style={{
              backgroundColor: T.darkSurface,
              borderRadius: 10,
              padding: 16,
              borderTop: `3px solid ${accent}`,
              border: `1px solid ${T.darkBorder}`,
              borderTopColor: accent,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Icon style={{ width: 18, height: 18, color: accent }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  backgroundColor: `${accent}22`, color: accent,
                  padding: "2px 8px", borderRadius: 4,
                }}>{label.split(" ")[0]}</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: T.white, margin: 0 }}>{value}</p>
              <p style={{ fontSize: 11, color: T.gray600, margin: "2px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{
          backgroundColor: T.darkSurface,
          borderRadius: 10,
          padding: 6,
          marginBottom: 20,
          display: "flex",
          gap: 4,
          overflowX: "auto",
          border: `1px solid ${T.darkBorder}`,
        }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                position: "relative",
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px",
                borderRadius: 7,
                fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: "none", whiteSpace: "nowrap",
                backgroundColor: active ? T.crimson : "transparent",
                color: active ? T.white : T.gray400,
                transition: "all 0.15s",
              }}>
                <tab.icon style={{ width: 15, height: 15 }} />
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%", fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: active ? T.white : T.crimson,
                    color: active ? T.crimson : T.white,
                  }}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT PANEL ── */}
        <div style={{
          backgroundColor: T.darkSurface, borderRadius: 10,
          padding: 24, border: `1px solid ${T.darkBorder}`,
        }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.white, marginBottom: 16, marginTop: 0 }}>Dashboard Overview</h2>

              {stats.pendingBookings > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  backgroundColor: "#3A2E00", border: "1px solid #92400E",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 16,
                }}>
                  <AlertCircle style={{ width: 18, height: 18, color: "#FCD34D", flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: "#FDE68A" }}>
                      {stats.pendingBookings} booking{stats.pendingBookings > 1 ? "s" : ""} awaiting your response.
                    </span>
                    <span style={{ color: "#FCD34D" }}> Accept or reject them promptly.</span>
                  </div>
                  <button onClick={() => setActiveTab("bookings")} style={{
                    ...btn.primary, backgroundColor: "#D97706", fontSize: 11, padding: "5px 12px",
                  }}>View</button>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: T.gray700, marginBottom: 12 }}>Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", backgroundColor: T.darkSurface2, borderRadius: 8 }}>
                    <Calendar style={{ width: 40, height: 40, color: T.gray400, margin: "0 auto 12px" }} />
                    <p style={{ color: T.gray600, fontSize: 13 }}>No bookings yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {bookings.slice(0, 5).map((b) => <BookingRow key={b.id} booking={b} showActions />)}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: T.gray700, marginBottom: 12 }}>Recent Reviews</h3>
                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", backgroundColor: T.darkSurface2, borderRadius: 8 }}>
                    <Star style={{ width: 40, height: 40, color: T.gray400, margin: "0 auto 12px" }} />
                    <p style={{ color: T.gray600, fontSize: 13 }}>No reviews yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} style={{ border: `1px solid ${T.darkBorder}`, borderRadius: 8, padding: 12, backgroundColor: T.darkSurface2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: T.gray900, fontSize: 13 }}>{review.customer_name}</span>
                          <div style={{ display: "flex" }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} style={{ width: 12, height: 12, color: i < review.rating ? "#F59E0B" : T.gray200, fill: i < review.rating ? "#F59E0B" : "none" }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 11, color: T.gray400, marginLeft: "auto" }}>{review.date}</span>
                        </div>
                        <p style={{ color: T.gray700, fontSize: 12, margin: 0 }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: T.white, margin: 0 }}>All Bookings</h2>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["all", "pending", "approved", "completed", "rejected", "rescheduled", "cancelled"].map((f) => (
                    <button key={f} onClick={() => setExpandedBooking(null)} style={{
                      padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      backgroundColor: T.darkSurface2, color: T.gray600,
                      border: `1px solid ${T.darkBorder}`, cursor: "pointer", textTransform: "capitalize",
                    }}>{f}</button>
                  ))}
                </div>
              </div>
              {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", backgroundColor: T.darkSurface2, borderRadius: 8 }}>
                  <Calendar style={{ width: 40, height: 40, color: T.gray400, margin: "0 auto 12px" }} />
                  <p style={{ color: T.gray600, fontSize: 13 }}>No bookings yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bookings.map((b) => <BookingRow key={b.id} booking={b} showActions />)}
                </div>
              )}
            </div>
          )}

          {/* SERVICES */}
          {activeTab === "services" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: T.white, margin: 0 }}>Your Services</h2>
                <button style={{ ...btn.primary }}>
                  <Plus style={{ width: 15, height: 15 }} /> Add Service
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {services.length === 0 ? (
                  <div style={{ gridColumn: "span 2", textAlign: "center", padding: "48px 0", backgroundColor: T.darkSurface2, borderRadius: 8 }}>
                    <Settings style={{ width: 40, height: 40, color: T.gray400, margin: "0 auto 12px" }} />
                    <p style={{ color: T.gray600, fontSize: 13, marginBottom: 12 }}>No services added yet</p>
                    <button style={{ ...btn.primary }}>Add Your First Service</button>
                  </div>
                ) : (
                  services.map((service) => (
                    <div key={service.id} style={{ border: `1px solid ${T.darkBorder}`, borderRadius: 8, padding: 16, backgroundColor: T.darkSurface2 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.gray900 }}>{service.name}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                            <Edit style={{ width: 16, height: 16, color: T.crimson }} />
                          </button>
                          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                            <Trash2 style={{ width: 16, height: 16, color: T.crimson }} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: T.gray600, marginBottom: 12 }}>{service.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: T.crimsonText, display: "flex", alignItems: "center", gap: 2 }}>
                          <IndianRupee style={{ width: 15, height: 15 }} />
                          {Number(service.price || 0).toLocaleString("en-IN")}
                        </span>
                        <span style={{ fontSize: 11, color: T.gray600 }}>{service.duration}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.white, marginBottom: 16, marginTop: 0 }}>Customer Reviews</h2>
              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", backgroundColor: T.darkSurface2, borderRadius: 8 }}>
                  <Star style={{ width: 40, height: 40, color: T.gray400, margin: "0 auto 12px" }} />
                  <p style={{ color: T.gray600, fontSize: 13 }}>No reviews yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{ border: `1px solid ${T.darkBorder}`, borderRadius: 8, padding: 16, backgroundColor: T.darkSurface2 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <h4 style={{ fontWeight: 700, color: T.gray900, fontSize: 14, margin: 0 }}>{review.customer_name}</h4>
                          <p style={{ fontSize: 11, color: T.gray500, margin: 0 }}>{review.date}</p>
                        </div>
                        <div style={{ display: "flex" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} style={{ width: 15, height: 15, color: i < review.rating ? "#F59E0B" : T.gray200, fill: i < review.rating ? "#F59E0B" : "none" }} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: T.gray700, margin: 0 }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && vendorData && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.white, marginBottom: 16, marginTop: 0 }}>Business Profile</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    ["Business Name", vendorData.business_name],
                    ["Owner Name",    vendorData.owner_name],
                    ["Email",         vendorData.email],
                    ["Phone",         vendorData.phone],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: T.gray600 }}>{label}</label>
                      <p style={{ color: T.gray900, marginTop: 4, fontSize: 13 }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.gray600 }}>Address</label>
                  <p style={{ color: T.gray900, marginTop: 4, fontSize: 13 }}>
                    {vendorData.address}, {vendorData.city}, {vendorData.state} {vendorData.zip_code}
                  </p>
                </div>
                {[
                  ["Service Category", vendorData.service_category],
                  ["Services Offered", vendorData.services_offered],
                  ["Description",      vendorData.description],
                ].map(([label, val]) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.gray600 }}>{label}</label>
                    <p style={{ color: T.gray900, marginTop: 4, fontSize: 13 }}>{val}</p>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    ["Pricing",           vendorData.pricing],
                    ["Availability",      vendorData.availability || "Not specified"],
                    ["Website",           vendorData.website || "Not provided"],
                    ["Years in Business", `${vendorData.years_in_business} years`],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: T.gray600 }}>{label}</label>
                      <p style={{ color: T.gray900, marginTop: 4, fontSize: 13 }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <button onClick={handleEditProfile} style={{ ...btn.primary }}>
                    <Edit style={{ width: 15, height: 15 }} /> Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════ */}

      {/* Reject Modal */}
      {showRejectModal && (
        <Overlay onClose={() => setShowRejectModal(false)}>
          <ModalCard>
            <ModalHeader
              icon={XCircle} iconBg={T.crimsonLight} iconColor={T.crimsonText}
              title="Reject Booking"
              subtitle={`${selectedBooking?.service_name} – ${selectedBooking?.customer_name}`}
              onClose={() => setShowRejectModal(false)}
            />
            <div style={{ marginBottom: 16 }}>
              <FormLabel required>Reason for rejection</FormLabel>
              <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Date not available, fully booked, etc."
                style={textareaStyle}
              />
              <p style={{ fontSize: 11, color: T.gray400, marginTop: 4 }}>This message will be sent to the customer.</p>
            </div>
            {error && <p style={{ fontSize: 11, color: T.crimsonText, marginBottom: 10 }}>{error}</p>}
            <ModalFooter
              onCancel={() => setShowRejectModal(false)}
              onConfirm={handleRejectConfirm}
              confirmLabel="Confirm Reject"
              confirmStyle={{ ...btn.primary, backgroundColor: T.crimson }}
              loading={actionLoading}
            />
          </ModalCard>
        </Overlay>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <Overlay onClose={() => setShowRescheduleModal(false)}>
          <ModalCard>
            <ModalHeader
              icon={RefreshCw} iconBg="#0D2340" iconColor="#93C5FD"
              title="Reschedule Booking"
              subtitle={`${selectedBooking?.service_name} – ${selectedBooking?.customer_name}`}
              onClose={() => setShowRescheduleModal(false)}
            />
            <div style={{ backgroundColor: T.darkSurface2, borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: T.gray600 }}>
              <span style={{ fontWeight: 700 }}>Current:</span> {selectedBooking?.date} at {selectedBooking?.time}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FormLabel required>New Date</FormLabel>
                  <input type="date" value={rescheduleData.date} min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <FormLabel required>New Time</FormLabel>
                  <input type="time" value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <FormLabel>Reason (optional)</FormLabel>
                <textarea rows={2} value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  placeholder="Let the customer know why you're rescheduling..."
                  style={textareaStyle}
                />
              </div>
            </div>
            {error && <p style={{ fontSize: 11, color: T.crimsonText, marginBottom: 10 }}>{error}</p>}
            <ModalFooter
              onCancel={() => setShowRescheduleModal(false)}
              onConfirm={handleRescheduleConfirm}
              confirmLabel="Send Reschedule"
              confirmStyle={{ ...btn.primary, backgroundColor: "#2563EB" }}
              loading={actionLoading}
            />
          </ModalCard>
        </Overlay>
      )}

      {/* Service Notes Modal */}
      {showNotesModal && (
        <Overlay onClose={() => setShowNotesModal(false)}>
          <ModalCard>
            <ModalHeader
              icon={FileText} iconBg="#1E1040" iconColor="#C4B5FD"
              title="Service Notes"
              subtitle={`${selectedBooking?.service_name} – ${selectedBooking?.customer_name}`}
              onClose={() => setShowNotesModal(false)}
            />
            <div style={{ marginBottom: 16 }}>
              <FormLabel>Internal notes for this booking</FormLabel>
              <textarea rows={5} value={serviceNote} onChange={(e) => setServiceNote(e.target.value)}
                placeholder="e.g. Customer wants extra decoration near entrance. Bring backup equipment..."
                style={textareaStyle}
              />
              <p style={{ fontSize: 11, color: T.gray400, marginTop: 4 }}>These notes are only visible to you.</p>
            </div>
            {error && <p style={{ fontSize: 11, color: T.crimsonText, marginBottom: 10 }}>{error}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowNotesModal(false)} style={{ ...btn.outline, flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={handleNotesSave} disabled={actionLoading}
                style={{ ...btn.primary, backgroundColor: "#7C3AED", flex: 1, justifyContent: "center", opacity: actionLoading ? 0.5 : 1 }}>
                {actionLoading ? "Saving..." : <><Save style={{ width: 15, height: 15 }} /> Save Notes</>}
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Overlay onClose={() => setShowEditModal(false)}>
          <div style={{
            backgroundColor: T.darkSurface, borderRadius: 12, maxWidth: 720, width: "100%",
            maxHeight: "90vh", overflowY: "auto", padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            border: `1px solid ${T.darkBorder}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>Edit Business Profile</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.gray500 }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { name: "businessName", label: "Business Name", type: "text", required: true },
                  { name: "ownerName",    label: "Owner Name",    type: "text", required: true },
                  { name: "phone",        label: "Phone",         type: "tel",  required: true },
                  { name: "pricing",      label: "Pricing Range (₹)", type: "text", required: true, placeholder: "₹5,000 – ₹50,000" },
                ].map(({ name, label, type, required, placeholder }) => (
                  <div key={name}>
                    <FormLabel required={required}>{label}</FormLabel>
                    <input name={name} type={type} required={required} placeholder={placeholder}
                      value={editFormData[name] || ""} onChange={handleEditFormChange}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              <div>
                <FormLabel required>Address</FormLabel>
                <input name="address" type="text" required value={editFormData.address || ""} onChange={handleEditFormChange} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                {["city", "state", "zipCode"].map((name) => (
                  <div key={name}>
                    <FormLabel required>{name === "zipCode" ? "PIN Code" : name.charAt(0).toUpperCase() + name.slice(1)}</FormLabel>
                    <input name={name} type="text" required value={editFormData[name] || ""} onChange={handleEditFormChange} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div>
                <FormLabel required>Services Offered</FormLabel>
                <textarea name="servicesOffered" required rows={2} value={editFormData.servicesOffered || ""} onChange={handleEditFormChange} style={textareaStyle} />
              </div>
              <div>
                <FormLabel required>Business Description</FormLabel>
                <textarea name="description" required rows={3} value={editFormData.description || ""} onChange={handleEditFormChange} style={textareaStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FormLabel>Availability</FormLabel>
                  <input name="availability" type="text" placeholder="Mon–Sat, 9AM–6PM" value={editFormData.availability || ""} onChange={handleEditFormChange} style={inputStyle} />
                </div>
                <div>
                  <FormLabel>Website</FormLabel>
                  <input name="website" type="url" placeholder="https://www.example.com" value={editFormData.website || ""} onChange={handleEditFormChange} style={inputStyle} />
                </div>
              </div>
              <div>
                <FormLabel>Certifications / Licenses</FormLabel>
                <input name="certification" type="text" value={editFormData.certification || ""} onChange={handleEditFormChange} style={inputStyle} />
              </div>
              {error   && <div style={{ backgroundColor: T.crimsonLight, border: `1px solid ${T.crimsonMuted}`, color: T.crimsonText, padding: "8px 12px", borderRadius: 6, fontSize: 12 }}>{error}</div>}
              {success && <div style={{ backgroundColor: "#052E16", border: "1px solid #065F46", color: "#6EE7B7", padding: "8px 12px", borderRadius: 6, fontSize: 12 }}>{success}</div>}
              <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: `1px solid ${T.darkBorder}` }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ ...btn.outline, flex: 1, justifyContent: "center" }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ ...btn.primary, flex: 1, justifyContent: "center", opacity: loading ? 0.5 : 1 }}>
                  {loading ? "Saving..." : <><Save style={{ width: 15, height: 15 }} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <Overlay onClose={() => setShowLogoutModal(false)}>
          <ModalCard maxWidth={360}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, backgroundColor: T.crimsonLight, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
              }}>
                <LogOut style={{ width: 22, height: 22, color: T.crimsonText }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.white, marginBottom: 6, marginTop: 0 }}>Confirm Logout</h3>
              <p style={{ fontSize: 12, color: T.gray600, margin: 0 }}>Are you sure? You'll need to login again to access your dashboard.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ ...btn.outline, flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={handleLogoutConfirm} style={{ ...btn.primary, flex: 1, justifyContent: "center" }}>
                <LogOut style={{ width: 15, height: 15 }} /> Logout
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}
    </div>
  );
}