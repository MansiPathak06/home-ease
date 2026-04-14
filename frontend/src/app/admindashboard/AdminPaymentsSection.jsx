"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Search, RefreshCw, Filter, X, IndianRupee,
  TrendingUp, TrendingDown, CheckCircle, Clock,
  CreditCard, Banknote, AlertCircle, Eye,
  Calendar, Download, ChevronDown
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatCard({ label, value, icon: Icon, borderColor, sub, subColor }) {
  return (
    <div className="rounded-lg shadow-sm p-4 flex items-center justify-between"
      style={{ background: "#1C1010", borderLeft: `4px solid ${borderColor}` }}>
      <div>
        <p className="text-xs font-medium" style={{ color: "#aaa" }}>{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: subColor ?? "#888" }}>{sub}</p>}
      </div>
      <div className="p-2 rounded-lg" style={{ background: "#2a1212" }}>
        <Icon className="w-5 h-5" style={{ color: borderColor }} />
      </div>
    </div>
  );
}

// ─── Payment Detail Modal ──────────────────────────────────────────────────────
function PaymentModal({ booking, onClose, onMarkPaid }) {
  const price      = parseFloat(booking.service_price ?? booking.amount ?? 0);
  const pct        = parseFloat(booking.commission_pct ?? 15);
  const vendorPay  = parseFloat(booking.vendor_payout  ?? price * (1 - pct / 100));
  const adminEarn  = price - vendorPay;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl w-full max-w-lg shadow-2xl" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: "1px solid #3a1a1a" }}>
          <div>
            <h3 className="font-bold text-white">Payment Detail</h3>
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>Booking #{booking.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2a1212"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X className="w-5 h-5" style={{ color: "#aaa" }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: "#2a1212" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#888" }}>Customer</p>
              <p className="text-xs font-bold text-white">{booking.user_name ?? booking.customer_name ?? "—"}</p>
              <p className="text-xs" style={{ color: "#888" }}>{booking.user_email}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#2a1212" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#888" }}>Vendor</p>
              <p className="text-xs font-bold text-white">{booking.vendor_name ?? "Unassigned"}</p>
              <p className="text-xs" style={{ color: "#888" }}>{booking.service_category}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-lg p-4 space-y-2" style={{ background: "#1a2a1a", border: "1px solid #1a3a1a" }}>
            <p className="text-xs font-bold text-white mb-3">💰 Payment Breakdown</p>
            {[
              ["Service",         booking.service_name],
              ["Date",            fmtDate(booking.date)],
              ["Payment Method",  (booking.payment_method ?? "cod").toUpperCase()],
              ["Payment Status",  booking.payment_status ?? "pending"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-xs">
                <span style={{ color: "#888" }}>{l}</span>
                <span className="font-semibold capitalize text-white">{v}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 space-y-1.5" style={{ borderTop: "1px solid #1a3a1a" }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: "#aaa" }}>Total Booking Value</span>
                <span className="font-bold text-white">{fmt(price)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "#aaa" }}>Admin Commission ({pct}%)</span>
                <span className="font-bold" style={{ color: "#60a5fa" }}>{fmt(adminEarn)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5" style={{ borderTop: "1px solid #1a3a1a" }}>
                <span className="font-bold text-white">Vendor Payout</span>
                <span className="font-bold text-sm" style={{ color: "#4ade80" }}>{fmt(vendorPay)}</span>
              </div>
            </div>
          </div>

          {/* Payout status */}
          <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "#2a1212" }}>
            <span className="text-xs font-semibold" style={{ color: "#aaa" }}>Payout Status</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={booking.payout_status === "paid"
                ? { background: "#0a2a0a", color: "#4ade80" }
                : { background: "#2a1a00", color: "#fb923c" }}>
              {booking.payout_status === "paid" ? "✓ Paid to Vendor" : "⏳ Pending"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {booking.payout_status !== "paid" && booking.status === "completed" && price > 0 && (
              <button onClick={() => onMarkPaid(booking.id)}
                className="flex-1 py-2.5 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                style={{ background: "#16a34a" }}
                onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
                onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
                <CheckCircle className="w-4 h-4" /> Mark Payout Paid
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: "#2a1212", color: "#ccc" }}
              onMouseEnter={e => e.currentTarget.style.background = "#3a1a1a"}
              onMouseLeave={e => e.currentTarget.style.background = "#2a1212"}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminPaymentsSection() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState({ text: "", type: "" });

  const [filters, setFilters] = useState({
    search: "", paymentMethod: "", payoutStatus: "", bookingStatus: "", dateFrom: "", dateTo: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        api.admin.getBookings({ ...filters, status: filters.bookingStatus }),
        api.admin.getBookingStats()
      ]);
      if (bRes.success) setBookings(bRes.bookings);
      if (sRes.success) setStats(sRes.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkPaid = async (bookingId) => {
    const res = await api.admin.updateBooking(bookingId, { payout_status: "paid" });
    if (res.success) { showToast("Payout marked as paid ✓"); setSelected(null); loadData(); }
    else showToast("Error updating payout", "error");
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => setFilters({ search: "", paymentMethod: "", payoutStatus: "", bookingStatus: "", dateFrom: "", dateTo: "" });
  const activeCount = Object.values(filters).filter(Boolean).length;

  const visible = bookings.filter(b => {
    if (filters.payoutStatus && b.payout_status !== filters.payoutStatus) return false;
    return true;
  });

  const onlineTotal   = visible.filter(b => b.payment_method === "online").reduce((s, b) => s + parseFloat(b.service_price ?? b.amount ?? 0), 0);
  const codTotal      = visible.filter(b => b.payment_method === "cod").reduce((s, b) => s + parseFloat(b.service_price ?? b.amount ?? 0), 0);
  const pendingPayout = visible.filter(b => b.payout_status === "pending" && b.status === "completed").reduce((s, b) => s + parseFloat(b.vendor_payout ?? 0), 0);

  // Shared input style helpers
  const inputStyle = { background: "#2a1212", color: "#fff", border: "1px solid #3a1a1a" };
  const onFocus = e => e.target.style.border = "1px solid #C0392B";
  const onBlur  = e => e.target.style.border = "1px solid #3a1a1a";

  return (
    <div className="space-y-5">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Revenue"    value={fmt(stats?.totalRevenue ?? 0)}        icon={IndianRupee} borderColor="#22c55e"  sub={`Admin keeps ${fmt(stats?.totalAdminEarnings ?? 0)}`} subColor="#4ade80" />
        <StatCard label="Vendor Payouts"   value={fmt(stats?.totalVendorPayout ?? 0)}   icon={TrendingUp}  borderColor="#60a5fa"  sub={`${stats?.payoutPaid ?? 0} paid, ${stats?.payoutPending ?? 0} pending`} subColor="#93c5fd" />
        <StatCard label="Online Payments"  value={fmt(onlineTotal)}                      icon={CreditCard}  borderColor="#a78bfa"  sub={`${visible.filter(b => b.payment_method === "online").length} transactions`} subColor="#c4b5fd" />
        <StatCard label="COD Payments"     value={fmt(codTotal)}                         icon={Banknote}    borderColor="#fb923c"  sub={`${visible.filter(b => b.payment_method === "cod").length} transactions`} subColor="#fdba74" />
      </div>

      {/* Pending payouts alert */}
      {pendingPayout > 0 && (
        <div className="rounded-lg px-4 py-3 flex items-center gap-3"
          style={{ background: "#2a1a00", border: "1px solid #78350f" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#fb923c" }} />
          <p className="text-xs font-semibold" style={{ color: "#fb923c" }}>
            {fmt(pendingPayout)} in vendor payouts are pending for completed bookings
          </p>
          <button onClick={() => setFilter("payoutStatus", "pending")}
            className="ml-auto text-xs text-white px-3 py-1 rounded-md font-semibold transition-colors"
            style={{ background: "#C0392B" }}
            onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
            onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
            View All
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="rounded-lg p-4 space-y-3" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#888" }} />
            <input type="text" placeholder="Search by booking ID, customer, vendor..."
              value={filters.search} onChange={e => setFilter("search", e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
            style={showFilters || activeCount > 0
              ? { background: "#C0392B", color: "#fff", border: "1px solid #C0392B" }
              : { background: "transparent", color: "#aaa", border: "1px solid #3a1a1a" }}>
            <Filter className="w-4 h-4" />
            Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <button onClick={loadData}
            className="p-2 rounded-lg border transition-colors"
            style={{ border: "1px solid #3a1a1a", background: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2a1212"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <RefreshCw className="w-4 h-4" style={{ color: "#aaa" }} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2" style={{ borderTop: "1px solid #3a1a1a" }}>
            {[
              { label: "Payment Method", key: "paymentMethod", options: [["", "All Methods"], ["online", "Online"], ["cod", "COD"]] },
              { label: "Payout Status",  key: "payoutStatus",  options: [["", "All Payouts"], ["pending", "Pending"], ["paid", "Paid"]] },
              { label: "Booking Status", key: "bookingStatus", options: [["", "All Statuses"], ...["pending","approved","completed","cancelled"].map(s => [s, s.charAt(0).toUpperCase() + s.slice(1)])] },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "#aaa" }}>{label}</label>
                <select value={filters[key]} onChange={e => setFilter(key, e.target.value)}
                  className="w-full px-2 py-1.5 text-sm rounded-lg outline-none"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                  {options.map(([v, l]) => <option key={v} value={v} style={{ background: "#1C1010" }}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#aaa" }}>From Date</label>
              <input type="date" value={filters.dateFrom} onChange={e => setFilter("dateFrom", e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded-lg outline-none"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#aaa" }}>To Date</label>
              <input type="date" value={filters.dateTo} onChange={e => setFilter("dateTo", e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded-lg outline-none"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            {activeCount > 0 && (
              <div className="flex items-end">
                <button onClick={clearFilters}
                  className="w-full px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
                  style={{ color: "#C0392B", border: "1px solid #3a1a1a", background: "transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2a0a0a"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast.text && (
        <div className="px-4 py-2.5 rounded-lg text-sm font-semibold text-center"
          style={toast.type === "error"
            ? { background: "#2a0a0a", color: "#f87171", border: "1px solid #7f1d1d" }
            : { background: "#0a2a0a", color: "#4ade80", border: "1px solid #14532d" }}>
          {toast.text}
        </div>
      )}

      {/* ── Payments Table ── */}
      <div className="rounded-lg overflow-hidden" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
        <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid #3a1a1a" }}>
          <p className="text-sm font-semibold text-white">
            {loading ? "Loading..." : `${visible.length} payment records`}
          </p>
          <div className="flex gap-3 text-xs" style={{ color: "#888" }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#4ade80" }}></span>Paid</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#fb923c" }}></span>Pending</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: "#888" }}>Loading payments...</div>
        ) : visible.length === 0 ? (
          <div className="py-20 text-center">
            <IndianRupee className="w-10 h-10 mx-auto mb-2" style={{ color: "#3a1a1a" }} />
            <p className="text-sm" style={{ color: "#888" }}>No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#2a1212", borderBottom: "1px solid #3a1a1a" }}>
                <tr>
                  {["Booking","Customer","Vendor","Method","Booking Value","Admin Earns","Vendor Gets","Payout","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: "#aaa" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(b => {
                  const price  = parseFloat(b.service_price ?? b.amount ?? 0);
                  const pct    = parseFloat(b.commission_pct ?? 15);
                  const vendor = parseFloat(b.vendor_payout ?? price * (1 - pct / 100));
                  const admin  = price - vendor;

                  return (
                    <tr key={b.id} className="transition-colors"
                      style={{ borderBottom: "1px solid #2a1212" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#231010"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold" style={{ color: "#aaa" }}>#{b.id}</p>
                        <p className="text-xs" style={{ color: "#666" }}>{fmtDate(b.date)}</p>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={
                            b.status === "completed" ? { background: "#0a2a0a", color: "#4ade80" } :
                            b.status === "cancelled" ? { background: "#2a2a2a", color: "#888" } :
                            { background: "#2a1a00", color: "#fbbf24" }
                          }>{b.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-white">{b.user_name ?? b.customer_name ?? "—"}</p>
                        <p className="text-xs" style={{ color: "#666" }}>{b.user_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-white">{b.vendor_name ?? "—"}</p>
                        <p className="text-xs" style={{ color: "#666" }}>{b.service_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={b.payment_method === "online"
                            ? { background: "#2e1a4a", color: "#a78bfa" }
                            : { background: "#2a2a2a", color: "#aaa" }}>
                          {(b.payment_method ?? "cod").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-white">
                          {price > 0 ? fmt(price) : <span style={{ color: "#444" }}>Not set</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold" style={{ color: "#60a5fa" }}>{price > 0 ? fmt(admin) : "—"}</p>
                        {price > 0 && <p className="text-xs" style={{ color: "#666" }}>{pct}%</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold" style={{ color: "#4ade80" }}>{price > 0 ? fmt(vendor) : "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={b.payout_status === "paid"
                            ? { background: "#0a2a0a", color: "#4ade80" }
                            : { background: "#2a1a00", color: "#fb923c" }}>
                          {b.payout_status === "paid" ? "✓ Paid" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => setSelected(b)}
                            className="flex items-center gap-1 px-2.5 py-1 text-white rounded-md text-xs font-semibold transition-colors"
                            style={{ background: "#C0392B" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
                            onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
                            <Eye className="w-3 h-3" /> Detail
                          </button>
                          {b.payout_status !== "paid" && b.status === "completed" && price > 0 && (
                            <button onClick={() => handleMarkPaid(b.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-white rounded-md text-xs font-semibold transition-colors"
                              style={{ background: "#16a34a" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
                              onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
                              <CheckCircle className="w-3 h-3" /> Pay Out
                            </button>
                          )}
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

      {selected && (
        <PaymentModal
          booking={selected}
          onClose={() => setSelected(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}
    </div>
  );
}
