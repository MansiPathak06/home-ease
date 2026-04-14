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
  pending:   "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40",
  approved:  "bg-blue-900/40 text-blue-400 border border-blue-700/40",
  completed: "bg-green-900/40 text-green-400 border border-green-700/40",
  cancelled: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  rejected:  "bg-red-900/40 text-red-400 border border-red-700/40",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={`bg-[#1a1a1a] rounded-lg border-l-4 ${color} shadow-sm p-3 flex items-center justify-between`}>
      <div>
        <p className="text-xs text-zinc-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-zinc-800">
        <Icon className="w-4 h-4 text-zinc-400" />
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#1a1a1a] border border-zinc-700 rounded-xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">Reset Password</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Setting new password for <span className="font-semibold text-white">{user.name}</span>
        </p>
        <div className="mb-3">
          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">New Password</label>
          <input
            type="text"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 chars)"
            className="w-full px-3 py-2 text-sm border border-zinc-600 rounded-lg bg-[#111111] text-white placeholder-zinc-500 focus:ring-1 focus:ring-[#C0392B] focus:border-[#C0392B] outline-none"
          />
        </div>
        {msg && (
          <p className={`text-xs font-semibold mb-3 ${msg.includes("✓") ? "text-green-400" : "text-red-400"}`}>
            {msg}
          </p>
        )}
        <button
          onClick={handleReset}
          disabled={saving}
          className="w-full py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-bold hover:bg-[#a93226] disabled:opacity-50 transition-colors"
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-zinc-700 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C0392B]/20 border border-[#C0392B]/30 rounded-full flex items-center justify-center">
              <span className="text-[#C0392B] font-bold text-sm">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{user.name}</h2>
                {user.is_blocked ? (
                  <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-700/40 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Ban className="w-3 h-3" /> Blocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-700/40 text-xs font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">Joined {fmtDate(user.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-400">{bookings.length}</p>
              <p className="text-xs text-blue-500 mt-0.5">Total Bookings</p>
            </div>
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-400">{fmt(totalSpent)}</p>
              <p className="text-xs text-green-500 mt-0.5">Total Spent</p>
            </div>
            <div className={`rounded-lg p-3 text-center border ${cancelledCount > 3 ? "bg-red-900/20 border-red-700/30" : "bg-zinc-800 border-zinc-700"}`}>
              <p className={`text-xl font-bold ${cancelledCount > 3 ? "text-red-400" : "text-zinc-300"}`}>
                {cancelledCount}
              </p>
              <p className={`text-xs mt-0.5 ${cancelledCount > 3 ? "text-red-500" : "text-zinc-500"}`}>
                Cancellations
              </p>
            </div>
          </div>

          {/* Fraud Signals */}
          {fraudSignals.length > 0 && (
            <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-3">
              <p className="text-xs font-bold text-orange-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Fraud / Risk Signals
              </p>
              <div className="space-y-1">
                {fraudSignals.map((sig, i) => (
                  <p key={i} className="text-xs text-orange-400">⚠ {sig}</p>
                ))}
              </div>
            </div>
          )}

          {/* Inner tabs */}
          <div className="flex gap-1 bg-[#111111] border border-zinc-700 p-1 rounded-lg">
            {[
              { key: "info",     label: "Profile Info" },
              { key: "bookings", label: `Bookings (${bookings.length})` },
              { key: "payments", label: "Payments" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === key
                    ? "bg-[#C0392B] text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
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
                <div key={label} className="bg-[#111111] border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 font-semibold mb-1 flex items-center gap-1">
                    {Icon && <Icon className="w-3 h-3" />} {label}
                  </p>
                  <p className="text-xs text-zinc-200 font-medium break-all">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Booking History ── */}
          {activeTab === "bookings" && (
            <div className="space-y-2">
              {bookings.length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-6">No bookings found</p>
              ) : bookings.map(b => (
                <div key={b.id} className="border border-zinc-700 bg-[#111111] rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-white">{b.service_name ?? "Service"}</p>
                      <p className="text-xs text-zinc-400">{b.vendor_name ?? "Vendor"}</p>
                      <p className="text-xs text-zinc-500">{fmtDate(b.date)} {b.time && `· ${b.time}`}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                        {b.status}
                      </span>
                      {b.amount > 0 && (
                        <p className="text-xs font-bold text-zinc-200 mt-1">{fmt(b.amount)}</p>
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
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-green-400">
                    {bookings.filter(b => b.status === "completed").length}
                  </p>
                  <p className="text-xs text-green-500">Paid</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-yellow-400">
                    {bookings.filter(b => ["pending","approved"].includes(b.status)).length}
                  </p>
                  <p className="text-xs text-yellow-500">Pending</p>
                </div>
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-red-400">
                    {bookings.filter(b => b.status === "cancelled").length}
                  </p>
                  <p className="text-xs text-red-500">Cancelled</p>
                </div>
              </div>

              {/* Transaction list from bookings */}
              {bookings.length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-6">No payment history</p>
              ) : bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between border border-zinc-700 bg-[#111111] rounded-lg p-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{b.service_name ?? "Service"}</p>
                    <p className="text-xs text-zinc-500">{fmtDate(b.date)} · <span className="capitalize">{b.payment_method ?? "cod"}</span></p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${b.status === "completed" ? "text-green-400" : b.status === "cancelled" ? "text-zinc-500 line-through" : "text-yellow-400"}`}>
                      {fmt(b.amount)}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">{b.payment_status ?? "pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-zinc-700 flex-wrap">
            <button
              onClick={() => onResetPassword(user)}
              className="flex-1 py-2 bg-zinc-700 text-white rounded-lg text-sm font-semibold hover:bg-zinc-600 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Lock className="w-4 h-4" /> Reset Password
            </button>
            {user.is_blocked ? (
              <button
                onClick={() => onUnblock(user.id)}
                className="flex-1 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" /> Unblock
              </button>
            ) : (
              <button
                onClick={() => onBlock(user.id)}
                className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-500 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Ban className="w-4 h-4" /> Block User
              </button>
            )}
            <button
              onClick={() => onDelete(user.id)}
              className="flex-1 py-2 bg-[#C0392B] text-white rounded-lg text-sm font-semibold hover:bg-[#a93226] flex items-center justify-center gap-1.5 transition-colors"
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
        api.admin.getAllBookings()
      ]);

      const users = usersRes ?? [];

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
    setSelected(null);
    setResetTarget(user);
  };

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
    <div className="space-y-5 bg-[#111111] min-h-screen p-4">

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Users"    value={users.length}           icon={Users}         color="border-blue-500"   />
        <StatCard label="Active Users"   value={users.length - blocked} icon={ShieldCheck}   color="border-green-500"  />
        <StatCard label="Blocked"        value={blocked}                icon={Ban}           color="border-[#C0392B]"  sub="restricted login" />
        <StatCard label="Fraud Signals"  value={fraud}                  icon={AlertTriangle} color="border-orange-500" sub="needs review" />
      </div>

      {/* ── Search & Filter ── */}
      <div className="bg-[#1a1a1a] border border-zinc-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, email, phone, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-600 rounded-lg bg-[#111111] text-white placeholder-zinc-500 focus:ring-1 focus:ring-[#C0392B] focus:border-[#C0392B] outline-none"
            />
          </div>
          <div className="flex gap-1 bg-[#111111] border border-zinc-700 p-1 rounded-lg flex-wrap">
            {[
              { key: "all",     label: `All (${users.length})` },
              { key: "active",  label: `Active (${users.length - blocked})` },
              { key: "blocked", label: `Blocked (${blocked})` },
              { key: "fraud",   label: `⚠ Fraud (${fraud})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === key
                    ? "bg-[#C0392B] text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={loadUsers}
            className="p-2 hover:bg-zinc-800 rounded-lg border border-zinc-600 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast.text && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-center border ${
          toast.type === "error"
            ? "bg-red-900/30 text-red-400 border-red-700/40"
            : "bg-green-900/30 text-green-400 border-green-700/40"
        }`}>
          {toast.text}
        </div>
      )}

      {/* ── Users Table ── */}
      <div className="bg-[#1a1a1a] border border-zinc-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-700">
          <p className="text-sm font-semibold text-zinc-300">
            {loading ? "Loading..." : `${visible.length} users`}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500 text-sm">Loading users...</div>
        ) : visible.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111111] border-b border-zinc-700">
                <tr>
                  {["User", "Contact", "Bookings", "Spent", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {visible.map(user => {
                  const totalSpent = (user.bookings ?? []).reduce((s, b) => s + parseFloat(b.amount ?? 0), 0);
                  const cancelled  = (user.bookings ?? []).filter(b => b.status === "cancelled").length;
                  const fraud      = isFraud(user);

                  return (
                    <tr key={user.id} className={`hover:bg-zinc-800/40 transition-colors ${user.is_blocked ? "bg-red-900/10" : ""}`}>
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
                            user.is_blocked
                              ? "bg-red-900/30 text-red-400 border-red-700/40"
                              : "bg-[#C0392B]/20 text-[#C0392B] border-[#C0392B]/30"
                          }`}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{user.name}</p>
                            {fraud && !user.is_blocked && (
                              <span className="text-xs text-orange-400 font-semibold flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Risk
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-zinc-300">{user.email}</p>
                        <p className="text-xs text-zinc-500">{user.phone ?? "No phone"}</p>
                      </td>

                      {/* Bookings */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-zinc-200">{user.bookings?.length ?? 0}</p>
                        {cancelled > 0 && (
                          <p className={`text-xs ${cancelled > 3 ? "text-red-400 font-semibold" : "text-zinc-500"}`}>
                            {cancelled} cancelled
                          </p>
                        )}
                      </td>

                      {/* Spent */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-zinc-200">{fmt(totalSpent)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {user.is_blocked ? (
                          <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-700/40 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                            <Ban className="w-2.5 h-2.5" /> Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-700/40 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs text-zinc-500">{fmtDate(user.created_at)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => setSelected(user)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#C0392B] text-white rounded-md text-xs font-semibold hover:bg-[#a93226] transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {user.is_blocked ? (
                            <button
                              onClick={() => handleUnblock(user.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-700 text-white rounded-md text-xs font-semibold hover:bg-green-600 transition-colors"
                            >
                              <ShieldCheck className="w-3 h-3" /> Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlock(user.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 text-white rounded-md text-xs font-semibold hover:bg-orange-500 transition-colors"
                            >
                              <Ban className="w-3 h-3" /> Block
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-700 text-zinc-300 rounded-md text-xs hover:bg-red-900/40 hover:text-red-400 transition-colors"
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