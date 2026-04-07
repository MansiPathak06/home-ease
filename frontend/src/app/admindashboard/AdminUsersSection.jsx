"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Search, RefreshCw, Eye, Trash2, Ban, CheckCircle,
  X, Users, ShieldAlert, ShieldCheck, Calendar,
  Phone, Mail, MapPin, BookOpen, AlertTriangle,
  Lock, IndianRupee, TrendingUp
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_STYLES = {
  pending:   "bg-yellow-100 text-yellow-700",
  approved:  "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  rejected:  "bg-red-100 text-red-700",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={`bg-white rounded-lg border-l-4 ${color} shadow-sm p-3 flex items-center justify-between`}>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-gray-50">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onReset }) {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState("");

  const handleReset = async () => {
    if (newPassword.length < 6) {
      setMsg("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const res = await api.admin.resetUserPassword(user.id, newPassword);
      if (res.success) { setMsg("Password reset ✓"); setTimeout(onReset, 800); }
      else setMsg(res.message ?? "Error");
    } catch { setMsg("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">Reset Password</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Setting new password for <span className="font-semibold text-gray-800">{user.name}</span>
        </p>
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">New Password</label>
          <input
            type="text"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 chars)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
          />
        </div>
        {msg && (
          <p className={`text-xs font-semibold mb-3 ${msg.includes("✓") ? "text-green-600" : "text-red-600"}`}>
            {msg}
          </p>
        )}
        <button
          onClick={handleReset}
          disabled={saving}
          className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserModal({ user, onClose, onBlock, onUnblock, onDelete, onResetPassword }) {
  const [activeTab, setActiveTab] = useState("info");
  const bookings  = user.bookings  ?? [];
  const payments  = user.payments  ?? [];

  const totalSpent     = bookings.reduce((s, b) => s + parseFloat(b.amount ?? 0), 0);
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  // Fraud signals
  const fraudSignals = [];
  if (cancelledCount > 3)                                      fraudSignals.push(`High cancellations (${cancelledCount})`);
  if (bookings.length > 0 && cancelledCount / bookings.length > 0.5) fraudSignals.push("Cancel rate >50%");
  if (user.is_blocked)                                         fraudSignals.push("Currently blocked");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">{user.name}</h2>
                {user.is_blocked ? (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Ban className="w-3 h-3" /> Blocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Joined {fmtDate(user.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{bookings.length}</p>
              <p className="text-xs text-blue-500 mt-0.5">Total Bookings</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-700">{fmt(totalSpent)}</p>
              <p className="text-xs text-green-500 mt-0.5">Total Spent</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${cancelledCount > 3 ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-xl font-bold ${cancelledCount > 3 ? "text-red-600" : "text-gray-700"}`}>
                {cancelledCount}
              </p>
              <p className={`text-xs mt-0.5 ${cancelledCount > 3 ? "text-red-500" : "text-gray-500"}`}>
                Cancellations
              </p>
            </div>
          </div>

          {/* Fraud Signals */}
          {fraudSignals.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Fraud / Risk Signals
              </p>
              <div className="space-y-1">
                {fraudSignals.map((sig, i) => (
                  <p key={i} className="text-xs text-orange-600">⚠ {sig}</p>
                ))}
              </div>
            </div>
          )}

          {/* Inner tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: "info",     label: "Profile Info" },
              { key: "bookings", label: `Bookings (${bookings.length})` },
              { key: "payments", label: "Payments" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === key ? "bg-white text-red-600 shadow-sm" : "text-gray-500"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Profile Info ── */}
          {activeTab === "info" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Name",     user.name,     Mail],
                ["Email",    user.email,    Mail],
                ["Phone",    user.phone ?? "Not provided",    Phone],
                ["Location", user.location ?? "Not provided", MapPin],
                ["User ID",  user.id,       null],
                ["Joined",   fmtDate(user.created_at), Calendar],
              ].map(([label, val, Icon]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1">
                    {Icon && <Icon className="w-3 h-3" />} {label}
                  </p>
                  <p className="text-xs text-gray-800 font-medium break-all">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Booking History ── */}
          {activeTab === "bookings" && (
            <div className="space-y-2">
              {bookings.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">No bookings found</p>
              ) : bookings.map(b => (
                <div key={b.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{b.service_name ?? "Service"}</p>
                      <p className="text-xs text-gray-500">{b.vendor_name ?? "Vendor"}</p>
                      <p className="text-xs text-gray-400">{fmtDate(b.date)} {b.time && `· ${b.time}`}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {b.status}
                      </span>
                      {b.amount > 0 && (
                        <p className="text-xs font-bold text-gray-800 mt-1">{fmt(b.amount)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Payments ── */}
          {activeTab === "payments" && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-green-700">
                    {bookings.filter(b => b.status === "completed").length}
                  </p>
                  <p className="text-xs text-green-500">Paid</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-yellow-700">
                    {bookings.filter(b => ["pending","approved"].includes(b.status)).length}
                  </p>
                  <p className="text-xs text-yellow-500">Pending</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-red-700">
                    {bookings.filter(b => b.status === "cancelled").length}
                  </p>
                  <p className="text-xs text-red-500">Cancelled</p>
                </div>
              </div>

              {/* Transaction list from bookings */}
              {bookings.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">No payment history</p>
              ) : bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{b.service_name ?? "Service"}</p>
                    <p className="text-xs text-gray-400">{fmtDate(b.date)} · <span className="capitalize">{b.payment_method ?? "cod"}</span></p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${b.status === "completed" ? "text-green-600" : b.status === "cancelled" ? "text-gray-400 line-through" : "text-yellow-600"}`}>
                      {fmt(b.amount)}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{b.payment_status ?? "pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t flex-wrap">
            <button
              onClick={() => onResetPassword(user)}
              className="flex-1 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" /> Reset Password
            </button>
            {user.is_blocked ? (
              <button
                onClick={() => onUnblock(user.id)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Unblock
              </button>
            ) : (
              <button
                onClick={() => onBlock(user.id)}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-1.5"
              >
                <Ban className="w-4 h-4" /> Block User
              </button>
            )}
            <button
              onClick={() => onDelete(user.id)}
              className="flex-1 py-2 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminUsersSection() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all"); // all | active | blocked | fraud
  const [toast, setToast]       = useState({ text: "", type: "" });

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, bookingsRes] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getAllBookings()   // reuse existing endpoint — returns all bookings
      ]);

      const users = usersRes ?? [];

      // Group bookings by user_id for history & payment tabs
      const bookingsByUser = {};
      (bookingsRes?.bookings ?? bookingsRes ?? []).forEach(b => {
        if (!bookingsByUser[b.user_id]) bookingsByUser[b.user_id] = [];
        bookingsByUser[b.user_id].push(b);
      });

      const enriched = users.map(u => ({
        ...u,
        bookings: bookingsByUser[u.id] ?? [],
      }));

      setUsers(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleBlock = async (id) => {
    if (!confirm("Block this user? They won't be able to log in.")) return;
    const res = await api.admin.blockUser(id);
    if (res.success) { showToast("User blocked"); setSelected(null); loadUsers(); }
    else showToast(res.message ?? "Error", "error");
  };

  const handleUnblock = async (id) => {
    const res = await api.admin.unblockUser(id);
    if (res.success) { showToast("User unblocked ✓"); setSelected(null); loadUsers(); }
    else showToast(res.message ?? "Error", "error");
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this user and all their bookings?")) return;
    const res = await api.admin.deleteUser(id);
    if (res.success) { showToast("User deleted"); setSelected(null); loadUsers(); }
    else showToast(res.message ?? "Error", "error");
  };

  const handleResetPassword = (user) => {
    setSelected(null);         // close user modal
    setResetTarget(user);      // open password modal
  };

  // Fraud detection: users with >3 cancellations or cancel rate >50%
  const isFraud = (u) => {
    const cancelled = (u.bookings ?? []).filter(b => b.status === "cancelled").length;
    const total     = (u.bookings ?? []).length;
    return cancelled > 3 || (total > 2 && cancelled / total > 0.5);
  };

  const visible = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q);

    const matchFilter =
      filter === "all" ||
      (filter === "active"  && !u.is_blocked) ||
      (filter === "blocked" &&  u.is_blocked) ||
      (filter === "fraud"   &&  isFraud(u));

    return matchSearch && matchFilter;
  });

  const blocked = users.filter(u => u.is_blocked).length;
  const fraud   = users.filter(u => isFraud(u)).length;

  return (
    <div className="space-y-5">

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Users"    value={users.length}         icon={Users}       color="border-blue-500"   />
        <StatCard label="Active Users"   value={users.length - blocked} icon={ShieldCheck} color="border-green-500"  />
        <StatCard label="Blocked"        value={blocked}              icon={Ban}         color="border-red-500"    sub="restricted login" />
        <StatCard label="Fraud Signals"  value={fraud}                icon={AlertTriangle} color="border-orange-500" sub="needs review" />
      </div>

      {/* ── Search & Filter ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, email, phone, location..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg flex-wrap">
            {[
              { key: "all",     label: `All (${users.length})` },
              { key: "active",  label: `Active (${users.length - blocked})` },
              { key: "blocked", label: `Blocked (${blocked})` },
              { key: "fraud",   label: `⚠ Fraud (${fraud})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === key ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={loadUsers}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast.text && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-center ${
          toast.type === "error"
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {toast.text}
        </div>
      )}

      {/* ── Users Table ── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            {loading ? "Loading..." : `${visible.length} users`}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">Loading users...</div>
        ) : visible.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["User", "Contact", "Bookings", "Spent", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(user => {
                  const totalSpent = (user.bookings ?? []).reduce((s, b) => s + parseFloat(b.amount ?? 0), 0);
                  const cancelled  = (user.bookings ?? []).filter(b => b.status === "cancelled").length;
                  const fraud      = isFraud(user);

                  return (
                    <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${user.is_blocked ? "bg-red-50/30" : ""}`}>
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            user.is_blocked ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                          }`}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{user.name}</p>
                            {fraud && !user.is_blocked && (
                              <span className="text-xs text-orange-600 font-semibold flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Risk
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.phone ?? "No phone"}</p>
                      </td>

                      {/* Bookings */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-gray-800">{user.bookings?.length ?? 0}</p>
                        {cancelled > 0 && (
                          <p className={`text-xs ${cancelled > 3 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                            {cancelled} cancelled
                          </p>
                        )}
                      </td>

                      {/* Spent */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-gray-800">{fmt(totalSpent)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {user.is_blocked ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                            <Ban className="w-2.5 h-2.5" /> Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs text-gray-500">{fmtDate(user.created_at)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => setSelected(user)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {user.is_blocked ? (
                            <button
                              onClick={() => handleUnblock(user.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700"
                            >
                              <ShieldCheck className="w-3 h-3" /> Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlock(user.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600"
                            >
                              <Ban className="w-3 h-3" /> Block
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-600 rounded-md text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selected && (
        <UserModal
          user={selected}
          onClose={() => setSelected(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
        />
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onReset={() => { setResetTarget(null); loadUsers(); }}
        />
      )}
    </div>
  );
}