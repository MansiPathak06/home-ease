"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Search, Filter, Eye, Edit2, UserCheck, Calendar,
  CheckCircle, XCircle, RefreshCw, IndianRupee, Percent,
  ChevronDown, X, AlertCircle, Clock, Truck, CreditCard,
  Banknote, TrendingUp, Users, Briefcase,Navigation,
} from "lucide-react";
import AdminTrackingPanel, { FullTrackModal } from "@/components/admin/AdminTrackingPanel";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    "bg-yellow-900/40 text-yellow-300 border-yellow-700",
  approved:   "bg-blue-900/40 text-blue-300 border-blue-700",
  completed:  "bg-green-900/40 text-green-300 border-green-700",
  cancelled:  "bg-zinc-700/50 text-zinc-400 border-zinc-600",
  rejected:   "bg-red-900/40 text-red-400 border-red-700",
};

const PAYOUT_STYLES = {
  pending: "bg-orange-900/40 text-orange-400",
  paid:    "bg-green-900/40 text-green-400",
};

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className={`bg-[#1a1a1a] rounded-lg border-l-4 ${color} border border-zinc-800 shadow-sm p-4 flex items-center justify-between`}>
      <div>
        <p className="text-xs text-zinc-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-zinc-800">
        <Icon className="w-5 h-5 text-zinc-400" />
      </div>
    </div>
  );
}

// ─── Payout Badge ─────────────────────────────────────────────────────────────
function PayoutBadge({ booking }) {
  const price    = parseFloat(booking.service_price ?? 0);
  const pct      = parseFloat(booking.commission_pct ?? 15);
  const payout   = parseFloat(booking.vendor_payout ?? price * (1 - pct / 100));
  const commission = price - payout;

  if (!price) return <span className="text-xs text-zinc-500">No price set</span>;

  return (
    <div className="text-xs space-y-0.5">
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Service Price</span>
        <span className="font-semibold text-zinc-200">{fmt(price)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Admin ({pct}%)</span>
        <span className="font-semibold text-red-400">−{fmt(commission)}</span>
      </div>
      <div className="flex justify-between gap-4 border-t border-zinc-700 pt-0.5">
        <span className="text-zinc-400">Vendor Gets</span>
        <span className="font-bold text-green-400">{fmt(payout)}</span>
      </div>
    </div>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────
function BookingModal({ booking, vendors, onClose, onSave }) {
  const [form, setForm] = useState({
    status:        booking.status         ?? "pending",
    vendor_id:     booking.vendor_id      ?? "",
    new_date:      booking.new_date       ?? "",
    new_time:      booking.new_time       ?? "",
    service_price: booking.service_price  ?? "",
    commission_pct:booking.commission_pct ?? 15,
    payout_status: booking.payout_status  ?? "pending",
    admin_notes:   booking.admin_notes    ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  const price    = parseFloat(form.service_price || 0);
  const pct      = parseFloat(form.commission_pct || 15);
  const payout   = price * (1 - pct / 100);
  const commission = price - payout;

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await api.admin.updateBooking(booking.id, form);
      if (res.success) { setMsg("Saved!"); setTimeout(onSave, 800); }
      else setMsg(res.message || "Error saving");
    } catch { setMsg("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="sticky top-0 bg-[#111111] border-b border-zinc-800 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <div>
            <h2 className="text-base font-bold text-white">Booking #{booking.id}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{booking.service_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Customer
              </p>
              <p className="font-semibold text-white">{booking.user_name ?? booking.customer_name ?? "—"}</p>
              <p className="text-xs text-zinc-400">{booking.user_email ?? booking.customer_email}</p>
              <p className="text-xs text-zinc-400">{booking.user_phone ?? booking.customer_phone}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Current Vendor
              </p>
              <p className="font-semibold text-white">{booking.vendor_name ?? "Unassigned"}</p>
              <p className="text-xs text-zinc-400">{booking.service_category}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Booking Date
              </p>
              <p className="font-semibold text-white">{fmtDate(booking.date)}</p>
              <p className="text-xs text-zinc-400">{booking.time}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400 mb-1">Payment</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAYOUT_STYLES[booking.payment_status] ?? "bg-zinc-700 text-zinc-400"}`}>
                {booking.payment_status ?? "pending"}
              </span>
              <p className="text-xs text-zinc-400 mt-1 capitalize">{booking.payment_method ?? "cod"}</p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-2">Admin Actions</h3>

            {/* Status + Assign Vendor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Booking Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none"
                >
                  {["pending","approved","completed","cancelled","rejected"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Assign / Reassign Vendor</label>
                <select
                  value={form.vendor_id}
                  onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none"
                >
                  <option value="">— Select Vendor —</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.business_name} ({v.city})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reschedule */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Reschedule Date</label>
                <input
                  type="date" value={form.new_date}
                  onChange={(e) => setForm({ ...form, new_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Reschedule Time</label>
                <input
                  type="time" value={form.new_time}
                  onChange={(e) => setForm({ ...form, new_time: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing & Commission */}
            <div>
              <h4 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" /> Pricing & Commission
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Service Price (₹)</label>
                  <input
                    type="number" value={form.service_price} placeholder="e.g. 1000"
                    onChange={(e) => setForm({ ...form, service_price: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Admin Commission (%)</label>
                  <input
                    type="number" value={form.commission_pct} min="0" max="100"
                    onChange={(e) => setForm({ ...form, commission_pct: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Payout Preview */}
              {price > 0 && (
                <div className="bg-zinc-900 border border-green-800 rounded-lg p-3">
                  <p className="text-xs font-bold text-zinc-300 mb-2">💰 Payout Breakdown</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Service Price</span>
                      <span className="font-bold text-zinc-200">{fmt(price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Admin Commission ({pct}%)</span>
                      <span className="font-bold text-red-400">−{fmt(commission)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-700 pt-1 mt-1">
                      <span className="font-bold text-zinc-300">Vendor Gets</span>
                      <span className="font-bold text-green-400 text-sm">{fmt(payout)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payout Status */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Payout Status</label>
              <div className="flex gap-3">
                {["pending","paid"].map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setForm({ ...form, payout_status: s })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      form.payout_status === s
                        ? s === "paid" ? "bg-green-600 text-white border-green-600" : "bg-orange-600 text-white border-orange-600"
                        : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    {s === "paid" ? "✓ Paid" : "⏳ Pending"}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Admin Notes</label>
              <textarea
                rows={2} value={form.admin_notes} placeholder="Internal notes..."
                onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none resize-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          {msg && (
            <p className={`text-xs font-semibold text-center ${msg === "Saved!" ? "text-green-400" : "text-red-400"}`}>
              {msg}
            </p>
          )}

          {/* Save */}
          <button
            onClick={handleSave} disabled={saving}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminBookingsSection() {
  const [bookings, setBookings]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [vendors, setVendors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [trackingBooking, setTrackingBooking] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "", status: "", vendorId: "", paymentMethod: "", dateFrom: "", dateTo: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes, vRes] = await Promise.all([
        api.admin.getBookings(filters),
        api.admin.getBookingStats(),
        api.admin.getApprovedVendorsList()
      ]);
      if (bRes.success) setBookings(bRes.bookings);
      if (sRes.success) setStats(sRes.stats);
      if (vRes.success) setVendors(vRes.vendors);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const quickAction = async (bookingId, data) => {
    await api.admin.updateBooking(bookingId, data);
    loadAll();
  };
  // todayBookings compute karo (bookings state ke baad)
const todayStr = new Date().toISOString().split("T")[0];
const todayBookings = bookings.filter((b) => {
  const bDate = (b.new_date || b.date || "").slice(0, 10);
  return bDate === todayStr && ["approved", "en_route", "arrived", "in_service"].includes(b.status);
});

  const clearFilters = () =>
    setFilters({ search: "", status: "", vendorId: "", paymentMethod: "", dateFrom: "", dateTo: "" });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* ── Aaj Ki Active Bookings Alert ── */}
{todayBookings.length > 0 && (
  <div className="space-y-2">
    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
      Aaj ke active vendors — {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
    </p>
    {todayBookings.map((b) => (
      <div
        key={b.id}
        className="flex items-center justify-between bg-[#1a1a1a] border border-orange-800/40 rounded-xl px-4 py-3 cursor-pointer hover:bg-orange-950/30 transition-all"
        onClick={() => setTrackingBooking(b)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">
              {b.vendor_name || "Vendor"} → {b.user_name ?? b.customer_name}
            </p>
            <p className="text-zinc-400 text-xs mt-0.5">
              {b.service_name} · <span className="text-orange-400 font-semibold">{b.new_time || b.time}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status] ?? ""}`}>
            {b.status}
          </span>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors">
            <Navigation className="w-3 h-3" /> Track
          </button>
        </div>
      </div>
    ))}
  </div>
)}

      {/* ── Stats Row ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Bookings"   value={stats.totalBookings}        icon={Briefcase}   color="border-blue-500"   sub={`${stats.pending} pending`} />
          <StatCard label="Total Revenue"    value={fmt(stats.totalRevenue)}    icon={IndianRupee} color="border-green-500"  sub={`Admin: ${fmt(stats.totalAdminEarnings)}`} />
          <StatCard label="Vendor Payouts"   value={fmt(stats.totalVendorPayout)} icon={TrendingUp} color="border-purple-500" sub={`${stats.payoutPending} unpaid`} />
          <StatCard label="Completed"        value={stats.completed}            icon={CheckCircle} color="border-emerald-500" sub={`${stats.cancelled} cancelled`} />
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800 p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text" placeholder="Search by booking ID, customer, vendor, service..."
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none placeholder:text-zinc-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-red-600 text-white border-red-600"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <button onClick={loadAll} className="p-2 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">Status</label>
              <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600">
                <option value="">All Statuses</option>
                {["pending","approved","completed","cancelled","rejected"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">Vendor</label>
              <select value={filters.vendorId} onChange={(e) => setFilter("vendorId", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600">
                <option value="">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.business_name}</option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">Payment Method</label>
              <select value={filters.paymentMethod} onChange={(e) => setFilter("paymentMethod", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600">
                <option value="">All Methods</option>
                <option value="online">Online</option>
                <option value="cod">COD</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">From Date</label>
              <input type="date" value={filters.dateFrom}
                onChange={(e) => setFilter("dateFrom", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">To Date</label>
              <input type="date" value={filters.dateTo}
                onChange={(e) => setFilter("dateTo", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600" />
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button onClick={clearFilters}
                  className="w-full px-3 py-1.5 text-sm text-red-400 border border-red-800 rounded-lg hover:bg-red-900/30 font-medium transition-colors">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bookings Table ── */}
      <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
          <p className="text-sm font-semibold text-zinc-300">
            {loading ? "Loading..." : `${bookings.length} bookings`}
          </p>
          <div className="flex gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>Pending</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Approved</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Completed</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500 text-sm">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center">
            <Briefcase className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  {["Booking ID","Customer","Vendor","Service","Date","Status","Payout","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-zinc-200">#{b.id}</span>
                      <p className="text-xs text-zinc-500 mt-0.5">{fmtDate(b.created_at)}</p>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100 text-xs">{b.user_name ?? b.customer_name ?? "—"}</p>
                      <p className="text-xs text-zinc-500">{b.user_phone ?? b.customer_phone}</p>
                    </td>

                    {/* Vendor */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100 text-xs">{b.vendor_name ?? <span className="text-orange-400 italic">Unassigned</span>}</p>
                      <p className="text-xs text-zinc-500">{b.service_category}</p>
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-zinc-200 max-w-[120px] truncate">{b.service_name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{b.payment_method ?? "cod"}</p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs text-zinc-200">{fmtDate(b.new_date || b.date)}</p>
                      <p className="text-xs text-zinc-500">{b.new_time || b.time}</p>
                      {b.new_date && (
                        <span className="text-xs text-blue-400 font-semibold">Rescheduled</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status] ?? ""}`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Payout */}
                    <td className="px-4 py-3 min-w-[140px]">
                      <PayoutBadge booking={b} />
                      {b.service_price && (
                        <span className={`mt-1 inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full ${PAYOUT_STYLES[b.payout_status] ?? "bg-zinc-800 text-zinc-400"}`}>
                          {b.payout_status === "paid" ? "✓ Paid" : "⏳ Pending"}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {/* View / Edit */}
                        <button
                          onClick={() => setSelected(b)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Manage
                        </button>

                        {/* Quick: Mark Complete */}
                        {b.status === "approved" && (
                          <button
                            onClick={() => quickAction(b.id, { status: "completed" })}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-700 text-white rounded-md text-xs font-semibold hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" /> Complete
                          </button>
                        )}

                        {/* Quick: Cancel */}
                        {["pending","approved"].includes(b.status) && (
                          <button
                            onClick={() => quickAction(b.id, { status: "cancelled", cancelled_by: "admin" })}
                            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-700 text-white rounded-md text-xs font-semibold hover:bg-zinc-600 transition-colors"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        )}

                        {/* Quick: Mark Payout Paid */}
                        {b.service_price && b.payout_status === "pending" && b.status === "completed" && (
                          <button
                            onClick={() => quickAction(b.id, { payout_status: "paid" })}
                            className="flex items-center gap-1 px-2.5 py-1 bg-purple-700 text-white rounded-md text-xs font-semibold hover:bg-purple-600 transition-colors"
                          >
                            <IndianRupee className="w-3 h-3" /> Pay Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <BookingModal
          booking={selected}
          vendors={vendors}
          onClose={() => setSelected(null)}
          onSave={() => { setSelected(null); loadAll(); }}
        />
      )}
      {/* Tracking Modal */}
{trackingBooking && (
  <FullTrackModal
    booking={trackingBooking}
    onClose={() => setTrackingBooking(null)}
  />
)}
    </div>
  );
}