"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Briefcase,
  Mail,
  MapPin,
  TrendingUp,
  AlertCircle,
  X,
  Users,
  Truck
} from "lucide-react";
import { Navigation } from "lucide-react";
import { FullTrackModal } from "@/components/admin/AdminTrackingPanel";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div
      className="rounded-lg p-3 flex items-center justify-between"
      style={{
        backgroundColor: "#1a1a1a",
        borderLeft: "4px solid #CC0000",
        border: "1px solid #2a2a2a",
      }}
    >
      <div>
        <p className="text-xs font-medium" style={{ color: "#999999" }}>
          {label}
        </p>
        <p className="text-lg font-bold text-white mt-0.5">{value}</p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "#777" }}>
            {sub}
          </p>
        )}
      </div>
      <div className="p-2 rounded-lg" style={{ backgroundColor: "#2a0000" }}>
        <Icon className="w-4 h-4" style={{ color: "#CC0000" }} />
      </div>
    </div>
  );
}

function VendorModal({ vendor, onClose, onApprove, onReject, onDelete }) {
  const s = vendor.stats ?? {};

  let extraFields = [];
  if (vendor.additional_info) {
    try {
      const parsed =
        typeof vendor.additional_info === "string"
          ? JSON.parse(vendor.additional_info)
          : vendor.additional_info;
      extraFields = Object.entries(parsed).filter(([k]) => k.trim());
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {vendor.business_name}
            </h2>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                vendor.is_approved
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {vendor.is_approved ? "Approved" : "Pending Approval"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Vendor Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total Bookings",
                val: s.totalBookings ?? 0,
                bg: "bg-blue-50",
                text: "text-blue-700",
                sub: "text-blue-600",
              },
              {
                label: "Completed",
                val: s.completedJobs ?? 0,
                bg: "bg-green-50",
                text: "text-green-700",
                sub: "text-green-600",
              },
              {
                label: "Avg Rating",
                val: s.avgRating
                  ? `${parseFloat(s.avgRating).toFixed(1)}★`
                  : "—",
                bg: "bg-yellow-50",
                text: "text-yellow-700",
                sub: "text-yellow-600",
              },
              {
                label: "Earnings",
                val: fmt(s.totalEarnings ?? 0),
                bg: "bg-purple-50",
                text: "text-purple-700",
                sub: "text-purple-600",
              },
            ].map(({ label, val, bg, text, sub: sc }) => (
              <div key={label} className={`${bg} rounded-lg p-3 text-center`}>
                <p className={`text-lg font-bold ${text}`}>{val}</p>
                <p className={`text-xs ${sc} mt-0.5`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Owner", vendor.owner_name],
              ["Email", vendor.email],
              ["Phone", vendor.phone],
              ["Category", vendor.service_category],
              ["Years", `${vendor.years_in_business ?? "—"} years`],
              ["Pricing", vendor.pricing ?? "—"],
              ["Availability", vendor.availability ?? "Not specified"],
              ["Joined", fmtDate(vendor.created_at)],
            ].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
                <p className="text-gray-900 mt-0.5 text-xs">{val}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">Address</p>
            <p className="text-xs text-gray-800">
              {vendor.address}, {vendor.city}, {vendor.state} —{" "}
              {vendor.zip_code}
            </p>
          </div>

          {vendor.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Description
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {vendor.description}
              </p>
            </div>
          )}

          {vendor.services_offered && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Services Offered
              </p>
              <p className="text-xs text-gray-700">{vendor.services_offered}</p>
            </div>
          )}

          {vendor.certification && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Certifications
              </p>
              <p className="text-xs text-gray-700">{vendor.certification}</p>
            </div>
          )}

          {vendor.website && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Website
              </p>
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-600 hover:underline"
              >
                {vendor.website}
              </a>
            </div>
          )}

          {extraFields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Additional Information
              </p>
              <div className="grid grid-cols-2 gap-2">
                {extraFields.map(([k, v]) => (
                  <div key={k} className="bg-red-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">{k}</p>
                    <p className="text-xs font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.totalBookings > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">
                Cancel Rate
              </span>
              <span
                className={`text-xs font-bold ${(s.cancelRate ?? 0) > 20 ? "text-red-600" : "text-green-600"}`}
              >
                {(s.cancelRate ?? 0).toFixed(1)}%
                {(s.cancelRate ?? 0) > 20 && " ⚠️ High"}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t flex-wrap">
            {!vendor.is_approved && (
              <button
                onClick={() => onApprove(vendor.id)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
            {!vendor.is_approved && (
              <button
                onClick={() => onReject(vendor.id)}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Decline
              </button>
            )}
            <button
              onClick={() => onDelete(vendor.id)}
              className="flex-1 py-2 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorSection({ onStatsChange }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ text: "", type: "" });
  const [trackingVendorId, setTrackingVendorId] = useState(null);
const [vendorActiveBooking, setVendorActiveBooking] = useState(null);
const [loadingBooking, setLoadingBooking] = useState(false);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 3000);
  };

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const [vendorsRes, statsRes] = await Promise.all([
        api.admin.getVendors(),
        api.admin.getVendorStats(),
      ]);

      const statsMap = {};
      if (statsRes?.success) {
        statsRes.stats.forEach((s) => {
          statsMap[s.vendor_id] = s;
        });
      }

      const merged = (vendorsRes ?? []).map((v) => ({
        ...v,
        stats: statsMap[v.id] ?? {},
      }));

      setVendors(merged);

      if (onStatsChange) {
        onStatsChange({
          totalVendors: merged.length,
          pendingVendors: merged.filter((v) => !v.is_approved).length,
          approvedVendors: merged.filter((v) => v.is_approved).length,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [onStatsChange]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);
  useEffect(() => {
  if (!trackingVendorId) return;
  setLoadingBooking(true);
  api.admin.getBookings({ vendorId: trackingVendorId, status: "en_route" })
    .then((res) => {
      // en_route nahi mila toh approved try karo
      const active = res.bookings?.find((b) =>
        ["en_route", "arrived", "in_service", "approved"].includes(b.status)
      );
      setVendorActiveBooking(active || null);
    })
    .catch(() => setVendorActiveBooking(null))
    .finally(() => setLoadingBooking(false));
}, [trackingVendorId]);

  const handleApprove = async (id) => {
    const res = await api.admin.approveVendor(id);
    if (res.success) {
      showToast("Vendor approved ✓");
      setSelected(null);
      loadVendors();
    } else showToast(res.message ?? "Error", "error");
  };

  const handleReject = async (id) => {
    if (!confirm("Decline and remove this vendor application?")) return;
    const res = await api.admin.rejectVendor(id);
    if (res.success) {
      showToast("Vendor declined");
      setSelected(null);
      loadVendors();
    } else showToast(res.message ?? "Error", "error");
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this vendor and all their data?")) return;
    const res = await api.admin.deleteVendor(id);
    if (res.success) {
      showToast("Vendor deleted");
      setSelected(null);
      loadVendors();
    } else showToast(res.message ?? "Error", "error");
  };

  const visible = vendors.filter((v) => {
    const matchFilter =
      filter === "all" ||
      (filter === "pending" && !v.is_approved) ||
      (filter === "approved" && v.is_approved);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.business_name?.toLowerCase().includes(q) ||
      v.owner_name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.service_category?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const pending = vendors.filter((v) => !v.is_approved).length;
  const approved = vendors.filter((v) => v.is_approved).length;
  const topEarner = [...vendors].sort(
    (a, b) => (b.stats?.totalEarnings ?? 0) - (a.stats?.totalEarnings ?? 0),
  )[0];

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Vendors"
          value={vendors.length}
          icon={Briefcase}
          color="border-blue-500"
        />
        <StatCard
          label="Pending Approval"
          value={pending}
          icon={AlertCircle}
          color="border-yellow-500"
          sub="awaiting review"
        />
        <StatCard
          label="Approved Active"
          value={approved}
          icon={CheckCircle}
          color="border-green-500"
        />
        <StatCard
          label="Top Earner"
          value={topEarner?.business_name?.split(" ")[0] ?? "—"}
          icon={TrendingUp}
          color="border-purple-500"
          sub={topEarner ? fmt(topEarner.stats?.totalEarnings ?? 0) : "no data"}
        />
      </div>

      {/* Filters */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#777" }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #2a2a2a",
                color: "#fff",
              }}
            />
          </div>

          <div
            className="flex gap-1 p-1 rounded-lg"
            style={{ backgroundColor: "#111111" }}
          >
            {[
              { key: "all", label: `All (${vendors.length})` },
              { key: "pending", label: `Pending (${pending})` },
              { key: "approved", label: `Approved (${approved})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold"
                style={
                  filter === key
                    ? { backgroundColor: "#CC0000", color: "#fff" }
                    : { color: "#999999" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={loadVendors}
            className="p-2 rounded-lg"
            style={{ backgroundColor: "#111111", border: "1px solid #2a2a2a" }}
          >
            <RefreshCw className="w-4 h-4" style={{ color: "#999999" }} />
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast.text && (
        <div
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-center ${
            toast.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Vendor Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          Loading vendors...
        </div>
      ) : visible.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-lg border border-gray-200">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map((vendor) => {
            const s = vendor.stats ?? {};
            const cancelRate = parseFloat(s.cancelRate ?? 0);
            return (
              <div
                key={vendor.id}
                className="rounded-lg p-4 transition-all"
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#8B0000")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1a1a1a")
                }
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate">
                        {vendor.business_name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                          vendor.is_approved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {vendor.is_approved ? "Active" : "Pending"}
                      </span>
                    </div>
                    <p
                      className="text-xs font-medium mt-0.5"
                      style={{ color: "#CC0000" }}
                    >
                      {vendor.service_category}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1 mb-3">
                  <p
                    className="text-xs flex items-center gap-1.5"
                    style={{ color: "#999999" }}
                  >
                    <Users className="w-3 h-3" /> {vendor.owner_name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> {vendor.email}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> {vendor.city}, {vendor.state}
                  </p>
                </div>

                {/* Stats mini-grid */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  <div className="bg-blue-50 rounded-md p-1.5 text-center">
                    <p className="text-sm font-bold text-blue-700">
                      {s.totalBookings ?? 0}
                    </p>
                    <p style={{ fontSize: "9px" }} className="text-blue-500">
                      Bookings
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-md p-1.5 text-center">
                    <p className="text-sm font-bold text-green-700">
                      {s.completedJobs ?? 0}
                    </p>
                    <p style={{ fontSize: "9px" }} className="text-green-500">
                      Done
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-md p-1.5 text-center">
                    <p className="text-sm font-bold text-yellow-700">
                      {s.avgRating ? parseFloat(s.avgRating).toFixed(1) : "—"}
                    </p>
                    <p style={{ fontSize: "9px" }} className="text-yellow-500">
                      Rating
                    </p>
                  </div>
                  <div
                    className={`rounded-md p-1.5 text-center ${cancelRate > 20 ? "bg-red-50" : "bg-gray-50"}`}
                  >
                    <p
                      className={`text-sm font-bold ${cancelRate > 20 ? "text-red-600" : "text-gray-600"}`}
                    >
                      {cancelRate.toFixed(0)}%
                    </p>
                    <p style={{ fontSize: "9px" }} className="text-gray-400">
                      Cancel
                    </p>
                  </div>
                </div>

                {/* Earnings */}
                <div
                  className="flex items-center justify-between mb-3 px-3 py-1.5 rounded-md"
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #2a2a2a",
                  }}
                >
                  <span style={{ color: "#999999" }} className="text-xs">
                    Total Earnings
                  </span>
                  <span className="text-xs font-bold text-white">
                    {fmt(s.totalEarnings ?? 0)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(vendor)}
                    className="flex-1 py-1.5 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> View Details
                  </button>
                  {/* YE NAYA BUTTON ADD KARO — sirf approved vendors ke liye */}
{vendor.is_approved && (
  <button
    onClick={() => setTrackingVendorId(vendor.id)}
    className="flex-1 py-1.5 bg-orange-600 text-white rounded-md text-xs font-semibold hover:bg-orange-700 flex items-center justify-center gap-1"
  >
    <Navigation className="w-3 h-3" /> Track
  </button>
)}
                  {!vendor.is_approved && (
                    <button
                      onClick={() => handleApprove(vendor.id)}
                      className="flex-1 py-1.5 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                  )}
                  {!vendor.is_approved && (
                    <button
                      onClick={() => handleReject(vendor.id)}
                      className="py-1.5 px-3 bg-yellow-500 text-white rounded-md text-xs font-semibold hover:bg-yellow-600"
                    >
                      Decline
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="py-1.5 px-2.5 bg-gray-100 text-gray-600 rounded-md text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <VendorModal
          vendor={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}
      {trackingVendorId && (
  <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 border border-white/10 text-center">
      {loadingBooking ? (
        <p className="text-white text-sm">Booking dhundh raha hun...</p>
      ) : vendorActiveBooking ? (
        <>
          <p className="text-white font-bold mb-1">Active Booking Mili!</p>
          <p className="text-zinc-400 text-xs mb-4">
            #{vendorActiveBooking.id} · {vendorActiveBooking.service_name} · {vendorActiveBooking.new_time || vendorActiveBooking.time}
          </p>
          <button
            onClick={() => {
              setTrackingVendorId(null);
              // FullTrackModal open karo
              // Ya seedha redirect: router.push(`/admin/track/${vendorActiveBooking.id}`)
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700"
          >
            Live Map Dekho
          </button>
          <button
            onClick={() => setTrackingVendorId(null)}
            className="ml-2 px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm font-bold hover:bg-zinc-600"
          >
            Band Karo
          </button>
        </>
      ) : (
        <>
          <Truck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Koi Active Booking Nahi</p>
          <p className="text-zinc-400 text-xs mb-4">
            Is vendor ki abhi koi active/en-route booking nahi hai.
          </p>
          <button
            onClick={() => setTrackingVendorId(null)}
            className="px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm font-bold"
          >
            Theek Hai
          </button>
        </>
      )}
    </div>
  </div>
)}
    </div>
  );
}
