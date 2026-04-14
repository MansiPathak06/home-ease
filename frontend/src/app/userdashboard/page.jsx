"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Search, Star, MapPin, Phone, Mail, Calendar, Clock,
  Heart, LogOut, User, Bell, IndianRupee, Shield, X,
  CheckCircle, XCircle, AlertCircle, ChevronRight,
  FileText, Loader2, Navigation, ArrowUpRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const gp = (v, camel, snake, fallback = "") =>
  ((v?.[camel] || v?.[snake] || fallback) ?? "").toString();

// ─── HomeEase Dark Palette ─────────────────────────────────
// bg-page:    #0f0f0f   (deepest background)
// bg-card:    #1a1a1a   (card / panel surface)
// bg-elevated:#232323   (nested surfaces)
// bg-input:   #2a2a2a   (inputs, secondary surfaces)
// border:     #2e2e2e   (subtle borders)
// text-pri:   #f0f0f0   (primary text)
// text-sec:   #a0a0a0   (muted text)
// crimson:    #C0202A   (brand primary)
// crimson-hov:#a01820   (hover)

const STATUS_CFG = {
  pending:     { bg: "#2a2200", text: "#f0b429", dot: "#f0b429", label: "Pending"     },
  approved:    { bg: "#001a2e", text: "#4da6ff", dot: "#4da6ff", label: "Approved"    },
  confirmed:   { bg: "#001a2e", text: "#4da6ff", dot: "#4da6ff", label: "Confirmed"   },
  completed:   { bg: "#001a0a", text: "#4caf7d", dot: "#4caf7d", label: "Completed"   },
  rejected:    { bg: "#1f0508", text: "#f07070", dot: "#f07070", label: "Rejected"    },
  cancelled:   { bg: "#1e1e1e", text: "#888888", dot: "#666666", label: "Cancelled"   },
  rescheduled: { bg: "#1a0a2e", text: "#b388ff", dot: "#9c6af7", label: "Rescheduled" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] || { bg: "#1e1e1e", text: "#888", dot: "#666", label: status };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
};

// ─── Hover-aware button (avoids inline onMouse* repetition) ──
const Btn = ({ onClick, style, hoverStyle, className = "", children, disabled }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...style, ...(hov ? hoverStyle : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
};

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bookings");
  const [vendors, setVendors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    if (localStorage.getItem("userType") !== "user") {
      router.push("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vd, bd, fd, pd] = await Promise.all([
        api.vendors.getApproved(),
        api.user.getBookings(),
        api.user.getFavorites(),
        api.user.getProfile(),
      ]);
      setVendors(Array.isArray(vd) ? vd : []);
      setBookings(Array.isArray(bd) ? bd : []);
      setFavorites(Array.isArray(fd) ? fd : []);
      setUserData(pd || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (vendorId) => {
    try {
      const isFav = favorites.some((f) => (f.vendor_id || f.vendorId) === vendorId);
      isFav ? await api.user.removeFavorite(vendorId) : await api.user.addFavorite(vendorId);
      fetchData();
      showToast(isFav ? "Removed from favorites" : "Added to favorites");
    } catch {
      showToast("Failed to update favorites", "error");
    }
  };

  const handleCancelOpen = (booking) => {
    setCancelModal({ open: true, booking });
    setCancelReason("");
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      showToast("Please provide a cancellation reason", "error");
      return;
    }
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/user/bookings/${cancelModal.booking.id}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      showToast("Booking cancelled successfully");
      setCancelModal({ open: false, booking: null });
      setSelectedBooking(null);
      fetchData();
    } catch {
      showToast("Failed to cancel booking. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: "#C0202A" }} />
          <p className="text-sm" style={{ color: "#777" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20" style={{ background: "#0f0f0f" }}>

      {/* ── Toast ── */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white"
          style={{ background: toast.type === "success" ? "#1a1a1a" : "#C0202A", border: "1px solid #333" }}>
          {toast.type === "success"
            ? <CheckCircle className="w-4 h-4" style={{ color: "#4caf7d" }} />
            : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Sub-header (sits below the site navbar) ── */}
      <header className="sticky top-0 z-40" style={{ background: "#1a1a1a", borderBottom: "1px solid #2e2e2e" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#C0202A" }}>HomeEase</h1>
              <p className="text-xs mt-0.5" style={{ color: "#666" }}>Find & book the perfect service</p>
            </div>
            <div className="flex items-center gap-2">
              <Btn
                onClick={() => router.push("/services")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{ background: "rgba(192,32,42,0.12)", color: "#e05060", border: "1px solid rgba(192,32,42,0.35)" }}
                hoverStyle={{ background: "rgba(192,32,42,0.25)" }}
              >
                Browse Services <ArrowUpRight className="w-3.5 h-3.5" />
              </Btn>

              <Btn className="p-2 rounded-lg relative" style={{ color: "#aaa" }} hoverStyle={{ background: "#2a2a2a" }}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#C0202A" }} />
              </Btn>

              <Btn
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ background: "#C0202A" }}
                hoverStyle={{ background: "#a01820" }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Btn>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Tabs ── */}
        <div className="rounded-xl p-1.5 mb-6 flex gap-1 overflow-x-auto"
          style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}>
          {[
            { id: "bookings",  label: "My Bookings",  icon: Calendar, badge: bookings.filter(b => b.status === "pending").length },
            { id: "favorites", label: "Favorites",    icon: Heart,    badge: favorites.length },
            { id: "profile",   label: "Profile",      icon: User,     badge: 0 },
          ].map((tab) => (
            <Btn
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
              style={activeTab === tab.id
                ? { background: "#C0202A", color: "#fff" }
                : { color: "#a0a0a0" }}
              hoverStyle={activeTab === tab.id ? {} : { background: "#2a2a2a", color: "#f0f0f0" }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={activeTab === tab.id
                    ? { background: "#fff", color: "#C0202A" }
                    : { background: "#C0202A", color: "#fff" }}>
                  {tab.badge}
                </span>
              )}
            </Btn>
          ))}
        </div>

        {/* ══ MY BOOKINGS ═════════════════════════════════════ */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#f0f0f0" }}>My Bookings</h2>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ color: "#777", background: "#1a1a1a", border: "1px solid #2e2e2e" }}>
                {bookings.length} total
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}>
                <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: "#2e2e2e" }} />
                <p className="font-medium text-sm" style={{ color: "#666" }}>No bookings yet</p>
                <p className="text-xs mt-1 mb-4" style={{ color: "#444" }}>Head to Services to find and book a vendor</p>
                <Btn
                  onClick={() => router.push("/services")}
                  className="px-5 py-2 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1.5"
                  style={{ background: "#C0202A" }}
                  hoverStyle={{ background: "#a01820" }}
                >
                  Browse Services <ArrowUpRight className="w-3.5 h-3.5" />
                </Btn>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-xl overflow-hidden transition-all"
                    style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#3e3e3e"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#2e2e2e"}
                  >
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="font-bold text-sm truncate" style={{ color: "#f0f0f0" }}>
                              {b.vendor_name || b.vendorName || "Vendor"}
                            </h3>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="text-xs mb-2" style={{ color: "#777" }}>
                            {b.service_name || b.serviceName || "Service"}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "#777" }}>
                            {b.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" style={{ color: "#C0202A" }} />{formatDate(b.date)}
                              </span>
                            )}
                            {b.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" style={{ color: "#C0202A" }} /> {b.time}
                              </span>
                            )}
                            {(b.amount > 0) && (
                              <span className="flex items-center gap-1 font-semibold" style={{ color: "#4caf7d" }}>
                                <IndianRupee className="w-3 h-3" />
                                {(b.amount || 0).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          {b.vendor_response && (
                            <p className="mt-2 text-xs rounded-lg px-2.5 py-1.5" style={{ color: "#4da6ff", background: "#001a2e" }}>
                              <span className="font-semibold">Vendor:</span> {b.vendor_response}
                            </p>
                          )}
                          {b.new_date && (
                            <p className="mt-2 text-xs rounded-lg px-2.5 py-1.5" style={{ color: "#b388ff", background: "#1a0a2e" }}>
                              📅 Rescheduled to: <span className="font-semibold">{b.new_date} at {b.new_time}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-2">
                          <Btn
                            onClick={() => setSelectedBooking(b)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: "#232323", color: "#ccc", border: "1px solid #3a3a3a" }}
                            hoverStyle={{ background: "#2e2e2e", color: "#fff" }}
                          >
                            <FileText className="w-3.5 h-3.5" /> View
                          </Btn>

                          {(b.status === "approved" || b.tracking_status === "en_route" || b.tracking_status === "arrived" || b.tracking_status === "in_service") && (
                            <Btn
                              onClick={() => router.push(`/userdashboard/track/${b.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ background: "#1a4a8a" }}
                              hoverStyle={{ background: "#1556a0" }}
                            >
                              <Navigation className="w-3.5 h-3.5" /> Track
                            </Btn>
                          )}

                          {(b.status === "pending" || b.status === "approved" || b.status === "confirmed") && (
                            <Btn
                              onClick={() => handleCancelOpen(b)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: "rgba(192,32,42,0.1)", color: "#e05060", border: "1px solid rgba(192,32,42,0.3)" }}
                              hoverStyle={{ background: "rgba(192,32,42,0.22)" }}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </Btn>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ FAVORITES ═══════════════════════════════════════ */}
        {activeTab === "favorites" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#f0f0f0" }}>Saved Vendors</h2>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ color: "#777", background: "#1a1a1a", border: "1px solid #2e2e2e" }}>
                {favorites.length} saved
              </span>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}>
                <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: "#2e2e2e" }} />
                <p className="font-medium text-sm" style={{ color: "#666" }}>No favorites yet</p>
                <p className="text-xs mt-1 mb-4" style={{ color: "#444" }}>Save vendors you like while browsing services</p>
                <Btn
                  onClick={() => router.push("/services")}
                  className="px-5 py-2 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1.5"
                  style={{ background: "#C0202A" }}
                  hoverStyle={{ background: "#a01820" }}
                >
                  Browse Services <ArrowUpRight className="w-3.5 h-3.5" />
                </Btn>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav) => {
                  const vid = fav.vendorId || fav.vendor_id;
                  const vendor = vendors.find((v) => v.id === vid);
                  if (!vendor) return null;
                  return (
                    <div key={fav.id} className="rounded-xl p-4 transition-all"
                      style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#3e3e3e"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#2e2e2e"}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: "#f0f0f0" }}>{gp(vendor, "businessName", "business_name")}</h3>
                          <p className="text-xs font-medium mt-0.5" style={{ color: "#C0202A" }}>{gp(vendor, "serviceCategory", "service_category")}</p>
                        </div>
                        <Btn
                          onClick={() => toggleFavorite(vendor.id)}
                          className="p-1.5 rounded-full"
                          style={{}}
                          hoverStyle={{ background: "rgba(192,32,42,0.15)" }}
                        >
                          <Heart className="w-4 h-4" style={{ fill: "#C0202A", color: "#C0202A" }} />
                        </Btn>
                      </div>
                      {(vendor.city || vendor.state) && (
                        <p className="text-xs flex items-center gap-1 mb-3" style={{ color: "#555" }}>
                          <MapPin className="w-3 h-3" /> {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Btn
                          onClick={() => setSelectedVendor(vendor)}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold"
                          style={{ background: "#232323", color: "#ccc", border: "1px solid #3a3a3a" }}
                          hoverStyle={{ background: "#2e2e2e", color: "#fff" }}
                        >
                          View Details
                        </Btn>
                        <Btn
                          onClick={() => {
                            localStorage.setItem("selectedVendor", JSON.stringify(vendor));
                            router.push("/userdashboard/book");
                          }}
                          className="flex-1 px-3 py-2 text-white rounded-lg text-xs font-semibold"
                          style={{ background: "#C0202A" }}
                          hoverStyle={{ background: "#a01820" }}
                        >
                          Book Now
                        </Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ PROFILE ═════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="rounded-xl p-6" style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: "#f0f0f0" }}>My Profile</h2>
            {userData ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(192,32,42,0.15)" }}>
                    <User className="w-7 h-7" style={{ color: "#C0202A" }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "#f0f0f0" }}>{userData.name || "User"}</h3>
                    <p className="text-sm" style={{ color: "#777" }}>{userData.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4" style={{ borderTop: "1px solid #2a2a2a" }}>
                  {[
                    ["Name", userData.name],
                    ["Email", userData.email],
                    ["Phone", userData.phone || "Not provided"],
                    ["Location", userData.location || "Not provided"],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#555" }}>{lbl}</p>
                      <p className="text-sm" style={{ color: "#e0e0e0" }}>{val || "—"}</p>
                    </div>
                  ))}
                </div>
                <Btn
                  onClick={() => router.push("/userdashboard/profile/edit")}
                  className="px-5 py-2 text-white rounded-lg text-sm font-semibold"
                  style={{ background: "#C0202A" }}
                  hoverStyle={{ background: "#a01820" }}
                >
                  Edit Profile
                </Btn>
              </div>
            ) : (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: "#C0202A" }} />
                <p className="text-sm" style={{ color: "#555" }}>Loading profile...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ VENDOR DETAIL MODAL ════════════════════════════════ */}
      {selectedVendor && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl"
            style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}>

            <div className="px-6 pt-6 pb-8 text-white relative" style={{ background: "#111111" }}>
              <Btn
                onClick={() => setSelectedVendor(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
                hoverStyle={{ background: "rgba(255,255,255,0.18)" }}
              >
                <X className="w-4 h-4" />
              </Btn>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#C0202A" }}>
                {gp(selectedVendor, "serviceCategory", "service_category")}
              </p>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#f0f0f0" }}>{gp(selectedVendor, "businessName", "business_name")}</h2>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4"
                    style={i < (selectedVendor.average_rating || selectedVendor.averageRating || 4)
                      ? { fill: "#f0b429", color: "#f0b429" }
                      : { color: "#444" }} />
                ))}
                <span className="text-xs" style={{ color: "#555" }}>({selectedVendor.review_count || selectedVendor.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5 -mt-2">
              <div className="flex flex-wrap gap-2">
                {selectedVendor.city && (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "#232323", color: "#bbb" }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: "#C0202A" }} />
                    {[selectedVendor.city, selectedVendor.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {selectedVendor.pricing && (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "#001a0a", color: "#4caf7d" }}>
                    Starting from <IndianRupee className="w-3.5 h-3.5" />{selectedVendor.pricing}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "#001a2e", color: "#4da6ff" }}>
                  <Shield className="w-3.5 h-3.5" /> Verified
                </span>
                {(selectedVendor.years_in_business || selectedVendor.yearsInBusiness) && (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "#232323", color: "#bbb" }}>
                    ⭐ {selectedVendor.years_in_business || selectedVendor.yearsInBusiness} yrs exp
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "#f0f0f0" }}>About</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#999" }}>
                  {gp(selectedVendor, "description", "description") || "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "#f0f0f0" }}>Services Offered</h3>
                <p className="text-sm" style={{ color: "#999" }}>
                  {gp(selectedVendor, "servicesOffered", "services_offered") || "Contact vendor for details."}
                </p>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#232323", border: "1px solid #2e2e2e" }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: "#f0f0f0" }}>Contact Information</h3>
                <div className="space-y-2">
                  {selectedVendor.email && (
                    <div className="flex items-center gap-2.5 text-sm" style={{ color: "#bbb" }}>
                      <Mail className="w-4 h-4 shrink-0" style={{ color: "#C0202A" }} />
                      <span className="truncate">{selectedVendor.email}</span>
                    </div>
                  )}
                  {selectedVendor.phone && (
                    <div className="flex items-center gap-2.5 text-sm" style={{ color: "#bbb" }}>
                      <Phone className="w-4 h-4 shrink-0" style={{ color: "#C0202A" }} />
                      <span>{selectedVendor.phone}</span>
                    </div>
                  )}
                  {selectedVendor.website && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="shrink-0">🌐</span>
                      <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer"
                        className="hover:underline truncate" style={{ color: "#C0202A" }}>
                        {selectedVendor.website}
                      </a>
                    </div>
                  )}
                  {selectedVendor.availability && (
                    <div className="flex items-center gap-2.5 text-sm" style={{ color: "#bbb" }}>
                      <Clock className="w-4 h-4 shrink-0" style={{ color: "#C0202A" }} />
                      <span>{selectedVendor.availability}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedVendor.certification && (
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: "#f0f0f0" }}>Certifications</h3>
                  <p className="text-sm" style={{ color: "#999" }}>{selectedVendor.certification}</p>
                </div>
              )}

              <div className="flex gap-3 pt-3" style={{ borderTop: "1px solid #2a2a2a" }}>
                <Btn
                  onClick={() => toggleFavorite(selectedVendor.id)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={favorites.some((f) => (f.vendorId || f.vendor_id) === selectedVendor.id)
                    ? { background: "rgba(192,32,42,0.12)", color: "#e05060", border: "1px solid rgba(192,32,42,0.3)" }
                    : { background: "#232323", color: "#ccc", border: "1px solid #3a3a3a" }}
                  hoverStyle={{ opacity: 0.82 }}
                >
                  <Heart className="w-4 h-4"
                    style={favorites.some((f) => (f.vendorId || f.vendor_id) === selectedVendor.id)
                      ? { fill: "#C0202A", color: "#C0202A" } : {}} />
                  {favorites.some((f) => (f.vendorId || f.vendor_id) === selectedVendor.id) ? "Saved" : "Save"}
                </Btn>
                <Btn
                  onClick={() => {
                    localStorage.setItem("selectedVendor", JSON.stringify(selectedVendor));
                    setSelectedVendor(null);
                    router.push("/userdashboard/book");
                  }}
                  className="flex-[2] py-3 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: "#C0202A" }}
                  hoverStyle={{ background: "#a01820" }}
                >
                  <Calendar className="w-4 h-4" /> Book Now
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ BOOKING DETAIL MODAL ════════════════════════════════ */}
      {selectedBooking && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full sm:rounded-2xl sm:max-w-lg shadow-2xl overflow-hidden"
            style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}>

            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #2a2a2a" }}>
              <h3 className="font-bold" style={{ color: "#f0f0f0" }}>Booking Details</h3>
              <Btn onClick={() => setSelectedBooking(null)} className="p-1.5 rounded-full" style={{}} hoverStyle={{ background: "#2a2a2a" }}>
                <X className="w-4 h-4" style={{ color: "#888" }} />
              </Btn>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold" style={{ color: "#f0f0f0" }}>{selectedBooking.vendor_name || selectedBooking.vendorName}</h4>
                  <p className="text-sm" style={{ color: "#777" }}>{selectedBooking.service_name || selectedBooking.serviceName}</p>
                </div>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl p-4" style={{ background: "#232323" }}>
                {[
                  ["Booking ID", `#${selectedBooking.id}`],
                  ["Date", selectedBooking.date || "—"],
                  ["Time", selectedBooking.time || "—"],
                  ["Guests", selectedBooking.guests || "—"],
                  ["Amount", selectedBooking.amount > 0 ? `₹${Number(selectedBooking.amount).toLocaleString("en-IN")}` : "TBD"],
                  ["Booked On", selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleDateString("en-IN") : "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#555" }}>{lbl}</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#e0e0e0" }}>{val}</p>
                  </div>
                ))}
              </div>

              {selectedBooking.message && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#555" }}>Your Message</p>
                  <p className="text-sm rounded-lg p-3" style={{ color: "#bbb", background: "#232323" }}>{selectedBooking.message}</p>
                </div>
              )}
              {selectedBooking.vendor_response && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#4da6ff" }}>Vendor Response</p>
                  <p className="text-sm rounded-lg p-3" style={{ color: "#bbb", background: "#001a2e" }}>{selectedBooking.vendor_response}</p>
                </div>
              )}
              {selectedBooking.new_date && (
                <div className="rounded-lg p-3" style={{ background: "#1a0a2e" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#b388ff" }}>📅 Rescheduled</p>
                  <p className="text-sm font-semibold" style={{ color: "#d4b5ff" }}>{selectedBooking.new_date} at {selectedBooking.new_time}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid #2a2a2a" }}>
              <Btn
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#232323", color: "#ccc" }}
                hoverStyle={{ background: "#2e2e2e", color: "#fff" }}
              >
                Close
              </Btn>
              {(selectedBooking.status === "pending" || selectedBooking.status === "approved" || selectedBooking.status === "confirmed") && (
                <Btn
                  onClick={() => { setSelectedBooking(null); handleCancelOpen(selectedBooking); }}
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: "#C0202A" }}
                  hoverStyle={{ background: "#a01820" }}
                >
                  <XCircle className="w-4 h-4" /> Cancel Booking
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ CANCEL CONFIRM MODAL ════════════════════════════════ */}
      {cancelModal.open && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
          style={{ background: "rgba(0,0,0,0.9)" }}>
          <div className="rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
            style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}>

            <div className="px-6 pt-6 pb-4" style={{ background: "#141414" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: "rgba(192,32,42,0.15)" }}>
                <AlertCircle className="w-6 h-6" style={{ color: "#C0202A" }} />
              </div>
              <h3 className="font-bold" style={{ color: "#f0f0f0" }}>Cancel Booking?</h3>
              <p className="text-sm mt-1" style={{ color: "#888" }}>
                Cancel booking with{" "}
                <span className="font-semibold" style={{ color: "#ccc" }}>
                  {cancelModal.booking?.vendor_name || cancelModal.booking?.vendorName}
                </span>?
              </p>
            </div>

            <div className="px-6 py-4">
              <label className="block text-xs font-semibold mb-2" style={{ color: "#aaa" }}>
                Reason for cancellation <span style={{ color: "#C0202A" }}>*</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Plans changed, found another vendor, event postponed..."
                className="w-full px-3 py-2.5 text-sm rounded-xl resize-none outline-none"
                style={{
                  background: "#232323",
                  color: "#e0e0e0",
                  border: "1px solid #3a3a3a",
                  caretColor: "#C0202A",
                }}
                onFocus={e => e.currentTarget.style.border = "1px solid #C0202A"}
                onBlur={e => e.currentTarget.style.border = "1px solid #3a3a3a"}
              />
              <div className="flex gap-2 mt-4">
                <Btn
                  onClick={() => setCancelModal({ open: false, booking: null })}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#232323", color: "#ccc" }}
                  hoverStyle={{ background: "#2e2e2e", color: "#fff" }}
                >
                  Keep Booking
                </Btn>
                <Btn
                  onClick={handleCancelConfirm}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "#C0202A" }}
                  hoverStyle={actionLoading ? {} : { background: "#a01820" }}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {actionLoading ? "Cancelling..." : "Confirm Cancel"}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}