"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Search, Star, MapPin, Phone, Mail, Calendar, Clock,
  Heart, LogOut, User, Bell, IndianRupee, Shield, X,
  CheckCircle, XCircle, AlertCircle, ChevronRight,
  RefreshCw, FileText, Loader2,  Navigation,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const gp = (v, camel, snake, fallback = "") =>
  ((v?.[camel] || v?.[snake] || fallback) ?? "").toString();

const STATUS_CFG = {
  pending:     { bg: "bg-yellow-100",  text: "text-yellow-700",  dot: "bg-yellow-500",  label: "Pending"     },
  approved:    { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500",    label: "Approved"    },
  confirmed:   { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500",    label: "Confirmed"   },
  completed:   { bg: "bg-green-100",   text: "text-green-700",   dot: "bg-green-500",   label: "Completed"   },
  rejected:    { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500",     label: "Rejected"    },
  cancelled:   { bg: "bg-gray-100",    text: "text-gray-600",    dot: "bg-gray-400",    label: "Cancelled"   },
  rescheduled: { bg: "bg-purple-100",  text: "text-purple-700",  dot: "bg-purple-500",  label: "Rescheduled" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// Add this helper at the top with other helpers
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
};

// ─── Categories ───────────────────────────────────────────
const CATEGORIES = [
  "All", "Catering", "Photography", "Videography", "Decoration",
  "Entertainment", "Venue", "Transportation", "Wedding Planning",
  "Florist", "Makeup & Hair", "DJ/Music",
];

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("browse");
  const [vendors, setVendors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    } catch (err) {
      showToast("Failed to update favorites", "error");
    }
  };

  // ── Cancel Booking ────────────────────────────────────────
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

  // ── Filters ───────────────────────────────────────────────
  const filteredVendors = vendors
    .filter((v) => v?.id)
    .filter((v) => {
      const q = searchQuery.toLowerCase();
      const name = gp(v, "businessName", "business_name").toLowerCase();
      const cat  = gp(v, "serviceCategory", "service_category").toLowerCase();
      const svcs = gp(v, "servicesOffered", "services_offered").toLowerCase();
      return (
        (name.includes(q) || cat.includes(q) || svcs.includes(q)) &&
        (selectedCategory === "all" || cat === selectedCategory.toLowerCase())
      );
    });

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-20">

      {/* ── Toast ── */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-red-600">EventBazaar</h1>
              <p className="text-xs text-gray-500 mt-0.5">Find & book the perfect service</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Tabs ── */}
        <div className="bg-white rounded-xl shadow-sm p-1.5 mb-6 flex gap-1 overflow-x-auto border border-gray-100">
          {[
            { id: "browse",    label: "Browse Services", icon: Search,   badge: 0 },
            { id: "bookings",  label: "My Bookings",     icon: Calendar, badge: bookings.filter(b => b.status === "pending").length },
            { id: "favorites", label: "Favorites",       icon: Heart,    badge: favorites.length },
            { id: "profile",   label: "Profile",         icon: User,     badge: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? "bg-white text-red-600" : "bg-red-600 text-white"
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ BROWSE ══════════════════════════════════════════ */}
        {activeTab === "browse" && (
          <div>
            {/* Search bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors by name, service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c.toLowerCase()}>{c}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-2">{filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""} found</p>
            </div>

            {/* Vendor Cards */}
            {filteredVendors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No vendors found</p>
                <p className="text-gray-400 text-xs mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendors.map((vendor) => {
                  const isFav = favorites.some((f) => (f.vendorId || f.vendor_id) === vendor.id);
                  const name  = gp(vendor, "businessName", "business_name");
                  const cat   = gp(vendor, "serviceCategory", "service_category");
                  const desc  = gp(vendor, "description", "description");
                  const rating = vendor.average_rating || vendor.averageRating || 4;
                  const reviews = vendor.review_count || vendor.reviewCount || 0;

                  return (
                    <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      {/* Color banner */}
                      <div className="h-28 bg-gradient-to-br from-red-500 to-orange-500 relative">
                        <button
                          onClick={() => toggleFavorite(vendor.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 backdrop-blur rounded-full shadow hover:scale-110 transition-transform"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                        </button>
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur rounded-full text-xs font-bold text-red-600 shadow-sm">
                            {cat}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 text-[15px] leading-tight">{name}</h3>

                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({reviews})</span>
                        </div>

                        <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{desc || "No description available."}</p>

                        <div className="space-y-1 mb-3 text-xs text-gray-500">
                          {(vendor.city || vendor.state) && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <IndianRupee className="w-3 h-3 text-green-500" />
                            <span className="font-medium text-gray-700">{vendor.pricing || "Contact for pricing"}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ MY BOOKINGS ═════════════════════════════════════ */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Bookings</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{bookings.length} total</span>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No bookings yet</p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-sm truncate">
                              {b.vendor_name || b.vendorName || "Vendor"}
                            </h3>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {b.service_name || b.serviceName || "Service"}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            {b.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-red-400" />{formatDate(b.date)}
                              </span>
                            )}
                            {b.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-red-400" /> {b.time}
                              </span>
                            )}
                            {(b.amount > 0) && (
                              <span className="flex items-center gap-1 font-semibold text-gray-800">
                                <IndianRupee className="w-3 h-3 text-green-500" />
                                {(b.amount || 0).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          {b.vendor_response && (
                            <p className="mt-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-semibold">Vendor:</span> {b.vendor_response}
                            </p>
                          )}
                          {b.new_date && (
                            <p className="mt-2 text-xs text-purple-700 bg-purple-50 rounded-lg px-2.5 py-1.5">
                              📅 Rescheduled to: <span className="font-semibold">{b.new_date} at {b.new_time}</span>
                            </p>
                          )}
                        </div>

                     <div className="flex sm:flex-col items-center sm:items-end gap-2">
  <button
    onClick={() => setSelectedBooking(b)}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold transition-colors"
  >
    <FileText className="w-3.5 h-3.5" /> View
  </button>

  {/* ── Track button: show when approved or vendor is on the way ── */}
  {(b.status === "approved" || b.tracking_status === "en_route" || b.tracking_status === "arrived" || b.tracking_status === "in_service") && (
    <button
      onClick={() => router.push(`/userdashboard/track/${b.id}`)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-semibold transition-colors"
    >
      <Navigation className="w-3.5 h-3.5" /> Track
    </button>
  )}

  {(b.status === "pending" || b.status === "approved" || b.status === "confirmed") && (
    <button
      onClick={() => handleCancelOpen(b)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors border border-red-200"
    >
      <XCircle className="w-3.5 h-3.5" /> Cancel
    </button>
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
              <h2 className="text-lg font-bold text-gray-900">Saved Vendors</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{favorites.length} saved</span>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No favorites yet</p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav) => {
                  const vid = fav.vendorId || fav.vendor_id;
                  const vendor = vendors.find((v) => v.id === vid);
                  if (!vendor) return null;
                  return (
                    <div key={fav.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{gp(vendor, "businessName", "business_name")}</h3>
                          <p className="text-xs text-red-500 font-medium mt-0.5">{gp(vendor, "serviceCategory", "service_category")}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(vendor.id)}
                          className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>
                      {(vendor.city || vendor.state) && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3" /> {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem("selectedVendor", JSON.stringify(vendor));
                            router.push("/userdashboard/book");
                          }}
                          className="flex-1 px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Book Now
                        </button>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">My Profile</h2>
            {userData ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{userData.name || "User"}</h3>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  {[
                    ["Name", userData.name],
                    ["Email", userData.email],
                    ["Phone", userData.phone || "Not provided"],
                    ["Location", userData.location || "Not provided"],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{lbl}</p>
                      <p className="text-sm text-gray-900">{val || "—"}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/userdashboard/profile/edit")}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading profile...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ VENDOR DETAIL MODAL ════════════════════════════════ */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Banner */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 pt-6 pb-8 text-white relative">
              <button
                onClick={() => setSelectedVendor(null)}
                className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-1">
                {gp(selectedVendor, "serviceCategory", "service_category")}
              </p>
              <h2 className="text-2xl font-bold mb-2">{gp(selectedVendor, "businessName", "business_name")}</h2>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (selectedVendor.average_rating || selectedVendor.averageRating || 4) ? "fill-yellow-300 text-yellow-300" : "text-red-300"}`} />
                ))}
                <span className="text-red-200 text-xs">({selectedVendor.review_count || selectedVendor.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5 -mt-2">
              {/* Quick info chips */}
              <div className="flex flex-wrap gap-2">
                {selectedVendor.city && (
                  <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {[selectedVendor.city, selectedVendor.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {selectedVendor.pricing && (
                  <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                    <p>Starting from</p>
                    <IndianRupee className="w-3.5 h-3.5" />
                    {selectedVendor.pricing}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                  <Shield className="w-3.5 h-3.5" /> Verified
                </span>
                {(selectedVendor.years_in_business || selectedVendor.yearsInBusiness) && (
                  <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                    ⭐ {selectedVendor.years_in_business || selectedVendor.yearsInBusiness} yrs exp
                  </span>
                )}
              </div>

              {/* About */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {gp(selectedVendor, "description", "description") || "No description provided."}
                </p>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Services Offered</h3>
                <p className="text-sm text-gray-600">
                  {gp(selectedVendor, "servicesOffered", "services_offered") || "Contact vendor for details."}
                </p>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {selectedVendor.email && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate">{selectedVendor.email}</span>
                    </div>
                  )}
                  {selectedVendor.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{selectedVendor.phone}</span>
                    </div>
                  )}
                  {selectedVendor.website && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="text-red-500 shrink-0">🌐</span>
                      <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer"
                        className="text-red-600 hover:underline truncate">
                        {selectedVendor.website}
                      </a>
                    </div>
                  )}
                  {selectedVendor.availability && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{selectedVendor.availability}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Certification */}
              {selectedVendor.certification && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Certifications</h3>
                  <p className="text-sm text-gray-600">{selectedVendor.certification}</p>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => toggleFavorite(selectedVendor.id)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    favorites.some((f) => (f.vendorId || f.vendor_id) === selectedVendor.id)
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.some((f) => (f.vendorId || f.vendor_id) === selectedVendor.id) ? "fill-red-500" : ""}`} />
                  {favorites.some((f) => (f.vendorId || f.vendor_id) === selectedVendor.id) ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("selectedVendor", JSON.stringify(selectedVendor));
                    setSelectedVendor(null);
                    router.push("/userdashboard/book");
                  }}
                  className="flex-[2] py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-red-200"
                >
                  <Calendar className="w-4 h-4" /> Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ BOOKING DETAIL MODAL ════════════════════════════════ */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{selectedBooking.vendor_name || selectedBooking.vendorName}</h4>
                  <p className="text-sm text-gray-500">{selectedBooking.service_name || selectedBooking.serviceName}</p>
                </div>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                {[
                  ["Booking ID", `#${selectedBooking.id}`],
                  ["Date", selectedBooking.date || "—"],
                  ["Time", selectedBooking.time || "—"],
                  ["Guests", selectedBooking.guests || "—"],
                  ["Amount", selectedBooking.amount > 0 ? `₹${Number(selectedBooking.amount).toLocaleString("en-IN")}` : "TBD"],
                  ["Booked On", selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleDateString("en-IN") : "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{lbl}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              {selectedBooking.message && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Message</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedBooking.message}</p>
                </div>
              )}
              {selectedBooking.vendor_response && (
                <div>
                  <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Vendor Response</p>
                  <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{selectedBooking.vendor_response}</p>
                </div>
              )}
              {selectedBooking.new_date && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-purple-600 mb-1">📅 Rescheduled</p>
                  <p className="text-sm text-purple-800 font-semibold">{selectedBooking.new_date} at {selectedBooking.new_time}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {(selectedBooking.status === "pending" || selectedBooking.status === "approved" || selectedBooking.status === "confirmed") && (
                <button
                  onClick={() => { setSelectedBooking(null); handleCancelOpen(selectedBooking); }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ CANCEL CONFIRM MODAL ════════════════════════════════ */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="bg-red-50 px-6 pt-6 pb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Cancel Booking?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Cancel booking with <span className="font-semibold">{cancelModal.booking?.vendor_name || cancelModal.booking?.vendorName}</span>?
              </p>
            </div>
            <div className="px-6 py-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Plans changed, found another vendor, event postponed..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setCancelModal({ open: false, booking: null })}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {actionLoading ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}