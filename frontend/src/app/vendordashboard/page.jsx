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

  // ── STATUS HELPERS ─────────────────────────────────────────

  const statusConfig = {
    pending:     { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Pending"     },
    approved:    { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Approved"    },
    completed:   { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  label: "Completed"   },
    rejected:    { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500",    label: "Rejected"    },
    cancelled:   { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400",   label: "Cancelled"   },
    rescheduled: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", label: "Rescheduled" },
  };

  const getStatusBadge = (status) => {
    const cfg = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: status };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  // ── FORMAT CURRENCY ────────────────────────────────────────
  const formatINR = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // ── BOOKING ACTIONS COMPONENT ──────────────────────────────

  const BookingActions = ({ booking, compact = false }) => {
    const s = booking.status;
    const btnBase = compact
      ? "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 disabled:opacity-50"
      : "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50";

    return (
      <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "mt-3 pt-3 border-t border-gray-100"}`}>
        {s === "pending" && (
          <button disabled={actionLoading} onClick={() => handleApprove(booking)}
            className={`${btnBase} bg-green-600 text-white hover:bg-green-700`}>
            <CheckCircle className="w-3.5 h-3.5" /> Accept
          </button>
        )}
        {(s === "pending" || s === "approved") && (
          <button disabled={actionLoading} onClick={() => handleRejectOpen(booking)}
            className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}>
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        )}
        {(s === "pending" || s === "approved") && (
          <button disabled={actionLoading} onClick={() => handleRescheduleOpen(booking)}
            className={`${btnBase} bg-blue-600 text-white hover:bg-blue-700`}>
            <RefreshCw className="w-3.5 h-3.5" /> Reschedule
          </button>
        )}
        {s === "approved" && (
          <button disabled={actionLoading} onClick={() => handleMarkCompleted(booking)}
            className={`${btnBase} bg-purple-600 text-white hover:bg-purple-700`}>
            <Check className="w-3.5 h-3.5" /> Mark Complete
          </button>
        )}
       {/* Track button — show when booking is approved/active */}
{(s === "approved" || s === "en_route" || s === "arrived" || s === "in_service") && (
  <button
    onClick={() => router.push(`/vendordashboard/track/${booking.id}`)}
    className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-700`}
  >
    <Navigation className="w-3.5 h-3.5" /> Track
  </button>
)}

<button disabled={actionLoading} onClick={() => handleNotesOpen(booking)}
  className={`${btnBase} border border-gray-300 text-gray-700 hover:bg-gray-50`}>
  <FileText className="w-3.5 h-3.5" />
  {booking.service_notes ? "Edit Notes" : "Add Notes"}
</button>
      </div>
    );
  };

  // ── BOOKING ROW ────────────────────────────────────────────

  const BookingRow = ({ booking, showActions = true }) => {
    const isOpen = expandedBooking === booking.id;
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-all">
        <div
          className="p-4 flex flex-col md:flex-row justify-between gap-3 cursor-pointer select-none"
          onClick={() => setExpandedBooking(isOpen ? null : booking.id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-gray-900">{booking.service_name}</h3>
              {getStatusBadge(booking.status)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
              <span>👤 {booking.customer_name}</span>
              <span>📅 {booking.date}</span>
              <span>🕐 {booking.time}</span>
              {/* ── ₹ instead of $ ── */}
              <span className="font-semibold text-gray-900 flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3" />
                {Number(booking.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            {booking.service_notes && (
              <p className="mt-1.5 text-xs text-blue-600 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Has service notes
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 md:flex-col md:items-end">
            {showActions && <BookingActions booking={booking} compact />}
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-3">
              <div>
                <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Customer Email</p>
                <p className="text-gray-900">{booking.customer_email || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Customer Phone</p>
                <p className="text-gray-900">{booking.customer_phone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Booking ID</p>
                <p className="text-gray-900 font-mono">#{booking.id}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Amount</p>
                {/* ── ₹ instead of $ ── */}
                <p className="text-gray-900 font-semibold flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {Number(booking.amount || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Created</p>
                <p className="text-gray-900">{booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-IN") : "—"}</p>
              </div>
              {booking.guests && (
                <div>
                  <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Guests</p>
                  <p className="text-gray-900">{booking.guests}</p>
                </div>
              )}
              {booking.new_date && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Rescheduled To</p>
                  <p className="text-purple-700 font-semibold">{booking.new_date} at {booking.new_time}</p>
                </div>
              )}
              {booking.vendor_response && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Your Response</p>
                  <p className="text-gray-900 bg-white border border-gray-200 rounded p-2">{booking.vendor_response}</p>
                </div>
              )}
              {booking.message && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Customer Message</p>
                  <p className="text-gray-900 bg-white border border-gray-200 rounded p-2">{booking.message}</p>
                </div>
              )}
              {booking.service_notes && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Service Notes</p>
                  <p className="text-gray-900 bg-white border border-gray-200 rounded p-2">{booking.service_notes}</p>
                </div>
              )}
            </div>
            <BookingActions booking={booking} />
          </div>
        )}
      </div>
    );
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen mt-20 bg-gray-50">

      {/* Global toast */}
      {(success || error) && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          success ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {success || error}
          <button onClick={() => { setSuccess(""); setError(""); }}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-red-600">
                {vendorData?.business_name || "Vendor Dashboard"}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">Manage your services and bookings</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {stats.pendingBookings > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {stats.pendingBookings}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stats – Revenue now shows ₹ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { icon: Calendar,      color: "blue",   label: "Total Bookings", value: stats.totalBookings },
            { icon: TrendingUp,    color: "yellow", label: "Pending",        value: stats.pendingBookings },
            { icon: IndianRupee,   color: "green",  label: "Total Revenue",  value: `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}` },
            { icon: Star,          color: "red",    label: "Avg Rating",     value: (stats.averageRating || 0).toFixed(1) },
            { icon: MessageSquare, color: "pink",   label: "Total Reviews",  value: reviews.length },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className={`bg-white rounded-lg shadow-sm p-4 border-t-2 border-${color}-500`}>
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-5 h-5 text-${color}-600`} />
                <span className={`text-xs font-semibold text-${color}-600 bg-${color}-100 px-1.5 py-0.5 rounded uppercase`}>
                  {label.split(" ")[0]}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1.5 mb-6 flex gap-1 overflow-x-auto border border-gray-200">
          {[
            { id: "overview",  label: "Overview",  icon: LayoutDashboard },
            { id: "bookings",  label: "Bookings",  icon: Calendar, badge: stats.pendingBookings },
            { id: "services",  label: "Services",  icon: Settings },
            { id: "reviews",   label: "Reviews",   icon: Star },
            { id: "profile",   label: "Profile",   icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-red-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className={`ml-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                  activeTab === tab.id ? "bg-white text-red-600" : "bg-red-600 text-white"
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Dashboard Overview</h2>

              {stats.pendingBookings > 0 && (
                <div className="mb-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-semibold text-yellow-800">
                      {stats.pendingBookings} booking{stats.pendingBookings > 1 ? "s" : ""} awaiting your response.
                    </span>
                    <span className="text-yellow-700"> Accept or reject them promptly.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-md hover:bg-yellow-700"
                  >
                    View
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookings.slice(0, 5).map((b) => <BookingRow key={b.id} booking={b} showActions />)}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Reviews</h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-semibold text-gray-900 text-sm">{review.customer_name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400 ml-auto">{review.date}</span>
                        </div>
                        <p className="text-gray-700 text-xs">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {activeTab === "bookings" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">All Bookings</h2>
                <div className="hidden sm:flex gap-1.5">
                  {["all", "pending", "approved", "completed", "rejected", "rescheduled", "cancelled"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setExpandedBooking(null)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 capitalize"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.map((b) => <BookingRow key={b.id} booking={b} showActions />)}
                </div>
              )}
            </div>
          )}

          {/* ── SERVICES ── */}
          {activeTab === "services" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Services</h2>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
                    <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-3">No services added yet</p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold">
                      Add Your First Service
                    </button>
                  </div>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-bold text-gray-900">{service.name}</h3>
                        <div className="flex gap-1.5">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-red-600" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs mb-3">{service.description}</p>
                      <div className="flex justify-between items-center">
                        {/* ── ₹ instead of $ ── */}
                        <span className="text-lg font-bold text-red-600 flex items-center gap-0.5">
                          <IndianRupee className="w-4 h-4" />
                          {Number(service.price || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-600">{service.duration}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === "reviews" && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{review.customer_name}</h4>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-xs">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === "profile" && vendorData && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Business Profile</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["Business Name", vendorData.business_name],
                    ["Owner Name",    vendorData.owner_name],
                    ["Email",         vendorData.email],
                    ["Phone",         vendorData.phone],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <label className="text-xs font-semibold text-gray-600">{label}</label>
                      <p className="text-gray-900 mt-1 text-sm">{val}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Address</label>
                  <p className="text-gray-900 mt-1 text-sm">
                    {vendorData.address}, {vendorData.city}, {vendorData.state} {vendorData.zip_code}
                  </p>
                </div>
                {[
                  ["Service Category", vendorData.service_category],
                  ["Services Offered", vendorData.services_offered],
                  ["Description",      vendorData.description],
                ].map(([label, val]) => (
                  <div key={label}>
                    <label className="text-xs font-semibold text-gray-600">{label}</label>
                    <p className="text-gray-900 mt-1 text-sm">{val}</p>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["Pricing",           vendorData.pricing],
                    ["Availability",      vendorData.availability || "Not specified"],
                    ["Website",           vendorData.website || "Not provided"],
                    ["Years in Business", `${vendorData.years_in_business} years`],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <label className="text-xs font-semibold text-gray-600">{label}</label>
                      <p className="text-gray-900 mt-1 text-sm">{val}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════ */}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject Booking</h3>
                <p className="text-xs text-gray-500">{selectedBooking?.service_name} – {selectedBooking?.customer_name}</p>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Date not available, fully booked, etc."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">This message will be sent to the customer.</p>
            </div>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={handleRejectConfirm} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold disabled:opacity-50">
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reschedule Booking</h3>
                <p className="text-xs text-gray-500">{selectedBooking?.service_name} – {selectedBooking?.customer_name}</p>
              </div>
              <button onClick={() => setShowRescheduleModal(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-xs text-gray-600">
              <span className="font-medium">Current:</span> {selectedBooking?.date} at {selectedBooking?.time}
            </div>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Date <span className="text-red-500">*</span></label>
                  <input type="date" value={rescheduleData.date} min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Time <span className="text-red-500">*</span></label>
                  <input type="time" value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason (optional)</label>
                <textarea rows={2} value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  placeholder="Let the customer know why you're rescheduling..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowRescheduleModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={handleRescheduleConfirm} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50">
                {actionLoading ? "Sending..." : "Send Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Service Notes</h3>
                <p className="text-xs text-gray-500">{selectedBooking?.service_name} – {selectedBooking?.customer_name}</p>
              </div>
              <button onClick={() => setShowNotesModal(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Internal notes for this booking</label>
              <textarea rows={5} value={serviceNote} onChange={(e) => setServiceNote(e.target.value)}
                placeholder="e.g. Customer wants extra decoration near entrance. Bring backup equipment. Contact florist day before..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">These notes are only visible to you.</p>
            </div>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowNotesModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={handleNotesSave} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                {actionLoading ? "Saving..." : (<><Save className="w-4 h-4" /> Save Notes</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Business Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "businessName", label: "Business Name", type: "text", required: true },
                  { name: "ownerName",    label: "Owner Name",    type: "text", required: true },
                  { name: "phone",        label: "Phone",         type: "tel",  required: true },
                  { name: "pricing",      label: "Pricing Range (₹)", type: "text", required: true, placeholder: "₹5,000 – ₹50,000" },
                ].map(({ name, label, type, required, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                    <input name={name} type={type} required={required} placeholder={placeholder}
                      value={editFormData[name]} onChange={handleEditFormChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Address</label>
                <input name="address" type="text" required value={editFormData.address} onChange={handleEditFormChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["city", "state", "zipCode"].map((name) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 capitalize">
                      {name === "zipCode" ? "PIN Code" : name}
                    </label>
                    <input name={name} type="text" required value={editFormData[name]} onChange={handleEditFormChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Services Offered</label>
                <textarea name="servicesOffered" required rows="2" value={editFormData.servicesOffered} onChange={handleEditFormChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Description</label>
                <textarea name="description" required rows="3" value={editFormData.description} onChange={handleEditFormChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Availability</label>
                  <input name="availability" type="text" placeholder="Mon–Sat, 9AM–6PM" value={editFormData.availability} onChange={handleEditFormChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Website</label>
                  <input name="website" type="url" placeholder="https://www.example.com" value={editFormData.website} onChange={handleEditFormChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Certifications / Licenses</label>
                <input name="certification" type="text" value={editFormData.certification} onChange={handleEditFormChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}
              {success && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">{success}</div>}
              <div className="flex gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {loading ? "Saving..." : (<><Save className="w-4 h-4" /> Save Changes</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Confirm Logout</h3>
              <p className="text-xs text-gray-600">Are you sure? You'll need to login again to access your dashboard.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={handleLogoutConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold flex items-center justify-center gap-1.5">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}