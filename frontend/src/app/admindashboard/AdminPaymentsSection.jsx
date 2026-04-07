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

function StatCard({ label, value, icon: Icon, color, sub, subColor = "text-gray-400" }) {
  return (
    <div className={`bg-white rounded-lg border-l-4 ${color} shadow-sm p-4 flex items-center justify-between`}>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-gray-50">
        <Icon className="w-5 h-5 text-gray-400" />
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <div>
            <h3 className="font-bold text-gray-900">Payment Detail</h3>
            <p className="text-xs text-gray-500 mt-0.5">Booking #{booking.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold mb-1">Customer</p>
              <p className="text-xs font-bold text-gray-900">{booking.user_name ?? booking.customer_name ?? "—"}</p>
              <p className="text-xs text-gray-500">{booking.user_email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold mb-1">Vendor</p>
              <p className="text-xs font-bold text-gray-900">{booking.vendor_name ?? "Unassigned"}</p>
              <p className="text-xs text-gray-500">{booking.service_category}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold text-gray-700 mb-3">💰 Payment Breakdown</p>
            {[
              ["Service",         booking.service_name, "text-gray-700"],
              ["Date",            fmtDate(booking.date), "text-gray-700"],
              ["Payment Method",  (booking.payment_method ?? "cod").toUpperCase(), "text-gray-700"],
              ["Payment Status",  booking.payment_status ?? "pending", "text-gray-700"],
            ].map(([l, v, c]) => (
              <div key={l} className="flex justify-between text-xs">
                <span className="text-gray-500">{l}</span>
                <span className={`font-semibold capitalize ${c}`}>{v}</span>
              </div>
            ))}
            <div className="border-t border-green-200 pt-2 mt-2 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total Booking Value</span>
                <span className="font-bold text-gray-800">{fmt(price)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Admin Commission ({pct}%)</span>
                <span className="font-bold text-blue-700">{fmt(adminEarn)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-green-200 pt-1.5">
                <span className="font-bold text-gray-700">Vendor Payout</span>
                <span className="font-bold text-green-700 text-sm">{fmt(vendorPay)}</span>
              </div>
            </div>
          </div>

          {/* Payout status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <span className="text-xs font-semibold text-gray-600">Payout Status</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              booking.payout_status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {booking.payout_status === "paid" ? "✓ Paid to Vendor" : "⏳ Pending"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {booking.payout_status !== "paid" && booking.status === "completed" && price > 0 && (
              <button onClick={() => onMarkPaid(booking.id)}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Mark Payout Paid
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
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
      if (bRes.success) {
        // Only show bookings that have a price set (actual payment records)
        setBookings(bRes.bookings);
      }
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

  // Filter bookings client-side for payout status (already filtered server-side for rest)
  const visible = bookings.filter(b => {
    if (filters.payoutStatus && b.payout_status !== filters.payoutStatus) return false;
    return true;
  });

  // Revenue by method
  const onlineTotal  = visible.filter(b => b.payment_method === "online").reduce((s, b) => s + parseFloat(b.service_price ?? b.amount ?? 0), 0);
  const codTotal     = visible.filter(b => b.payment_method === "cod"   ).reduce((s, b) => s + parseFloat(b.service_price ?? b.amount ?? 0), 0);
  const pendingPayout = visible.filter(b => b.payout_status === "pending" && b.status === "completed").reduce((s, b) => s + parseFloat(b.vendor_payout ?? 0), 0);

  return (
    <div className="space-y-5">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue"
          value={fmt(stats?.totalRevenue ?? 0)}
          icon={IndianRupee} color="border-green-500"
          sub={`Admin keeps ${fmt(stats?.totalAdminEarnings ?? 0)}`}
          subColor="text-green-600"
        />
        <StatCard
          label="Vendor Payouts"
          value={fmt(stats?.totalVendorPayout ?? 0)}
          icon={TrendingUp} color="border-blue-500"
          sub={`${stats?.payoutPaid ?? 0} paid, ${stats?.payoutPending ?? 0} pending`}
        />
        <StatCard
          label="Online Payments"
          value={fmt(onlineTotal)}
          icon={CreditCard} color="border-purple-500"
          sub={`${visible.filter(b => b.payment_method === "online").length} transactions`}
        />
        <StatCard
          label="COD Payments"
          value={fmt(codTotal)}
          icon={Banknote} color="border-orange-500"
          sub={`${visible.filter(b => b.payment_method === "cod").length} transactions`}
        />
      </div>

      {/* Pending payouts alert */}
      {pendingPayout > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <p className="text-xs text-orange-700 font-semibold">
            {fmt(pendingPayout)} in vendor payouts are pending for completed bookings
          </p>
          <button
            onClick={() => setFilter("payoutStatus", "pending")}
            className="ml-auto text-xs bg-orange-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-orange-700"
          >
            View All
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by booking ID, customer, vendor..."
              value={filters.search} onChange={e => setFilter("search", e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              showFilters || activeCount > 0 ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 border-gray-300"
            }`}>
            <Filter className="w-4 h-4" />
            Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Payment Method</label>
              <select value={filters.paymentMethod} onChange={e => setFilter("paymentMethod", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg">
                <option value="">All Methods</option>
                <option value="online">Online</option>
                <option value="cod">COD</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Payout Status</label>
              <select value={filters.payoutStatus} onChange={e => setFilter("payoutStatus", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg">
                <option value="">All Payouts</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Booking Status</label>
              <select value={filters.bookingStatus} onChange={e => setFilter("bookingStatus", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg">
                <option value="">All Statuses</option>
                {["pending","approved","completed","cancelled"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">From Date</label>
              <input type="date" value={filters.dateFrom} onChange={e => setFilter("dateFrom", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">To Date</label>
              <input type="date" value={filters.dateTo} onChange={e => setFilter("dateTo", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg" />
            </div>
            {activeCount > 0 && (
              <div className="flex items-end">
                <button onClick={clearFilters}
                  className="w-full px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium">
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast.text && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-center ${
          toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
        }`}>{toast.text}</div>
      )}

      {/* ── Payments Table ── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-700">
            {loading ? "Loading..." : `${visible.length} payment records`}
          </p>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>Paid</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>Pending</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">Loading payments...</div>
        ) : visible.length === 0 ? (
          <div className="py-20 text-center">
            <IndianRupee className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Booking","Customer","Vendor","Method","Booking Value","Admin Earns","Vendor Gets","Payout","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(b => {
                  const price     = parseFloat(b.service_price ?? b.amount ?? 0);
                  const pct       = parseFloat(b.commission_pct ?? 15);
                  const vendor    = parseFloat(b.vendor_payout ?? price * (1 - pct / 100));
                  const admin     = price - vendor;

                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-gray-700">#{b.id}</p>
                        <p className="text-xs text-gray-400">{fmtDate(b.date)}</p>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          b.status === "completed" ? "bg-green-100 text-green-700" :
                          b.status === "cancelled" ? "bg-gray-100 text-gray-500" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-900">{b.user_name ?? b.customer_name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{b.user_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-900">{b.vendor_name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{b.service_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          b.payment_method === "online" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {(b.payment_method ?? "cod").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-gray-800">{price > 0 ? fmt(price) : <span className="text-gray-300">Not set</span>}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-blue-700">{price > 0 ? fmt(admin) : "—"}</p>
                        {price > 0 && <p className="text-xs text-gray-400">{pct}%</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-green-700">{price > 0 ? fmt(vendor) : "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          b.payout_status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {b.payout_status === "paid" ? "✓ Paid" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => setSelected(b)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700">
                            <Eye className="w-3 h-3" /> Detail
                          </button>
                          {b.payout_status !== "paid" && b.status === "completed" && price > 0 && (
                            <button onClick={() => handleMarkPaid(b.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700">
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