// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { api } from "@/lib/api";
// import {
//   Search, RefreshCw, Filter, X, IndianRupee,
//   TrendingUp, TrendingDown, CheckCircle, Clock,
//   CreditCard, Banknote, AlertCircle, Eye,
//   Calendar, Download, ChevronDown
// } from "lucide-react";

// const fmt = (n) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

// const fmtDate = (d) =>
//   d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// function StatCard({ label, value, icon: Icon, borderColor, sub, subColor }) {
//   return (
//     <div className="rounded-lg shadow-sm p-4 flex items-center justify-between"
//       style={{ background: "#1C1010", borderLeft: `4px solid ${borderColor}` }}>
//       <div>
//         <p className="text-xs font-medium" style={{ color: "#aaa" }}>{label}</p>
//         <p className="text-xl font-bold text-white mt-0.5">{value}</p>
//         {sub && <p className="text-xs mt-0.5" style={{ color: subColor ?? "#888" }}>{sub}</p>}
//       </div>
//       <div className="p-2 rounded-lg" style={{ background: "#2a1212" }}>
//         <Icon className="w-5 h-5" style={{ color: borderColor }} />
//       </div>
//     </div>
//   );
// }

// // ─── Payment Detail Modal ──────────────────────────────────────────────────────
// function PaymentModal({ booking, onClose, onMarkPaid }) {
//   const price      = parseFloat(booking.service_price ?? booking.amount ?? 0);
//   const pct        = parseFloat(booking.commission_pct ?? 15);
//   const vendorPay  = parseFloat(booking.vendor_payout  ?? price * (1 - pct / 100));
//   const adminEarn  = price - vendorPay;

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//       <div className="rounded-xl w-full max-w-lg shadow-2xl" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
//         <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: "1px solid #3a1a1a" }}>
//           <div>
//             <h3 className="font-bold text-white">Payment Detail</h3>
//             <p className="text-xs mt-0.5" style={{ color: "#888" }}>Booking #{booking.id}</p>
//           </div>
//           <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
//             style={{ background: "transparent" }}
//             onMouseEnter={e => e.currentTarget.style.background = "#2a1212"}
//             onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//             <X className="w-5 h-5" style={{ color: "#aaa" }} />
//           </button>
//         </div>

//         <div className="p-6 space-y-4">
//           {/* Parties */}
//           <div className="grid grid-cols-2 gap-3">
//             <div className="rounded-lg p-3" style={{ background: "#2a1212" }}>
//               <p className="text-xs font-semibold mb-1" style={{ color: "#888" }}>Customer</p>
//               <p className="text-xs font-bold text-white">{booking.user_name ?? booking.customer_name ?? "—"}</p>
//               <p className="text-xs" style={{ color: "#888" }}>{booking.user_email}</p>
//             </div>
//             <div className="rounded-lg p-3" style={{ background: "#2a1212" }}>
//               <p className="text-xs font-semibold mb-1" style={{ color: "#888" }}>Vendor</p>
//               <p className="text-xs font-bold text-white">{booking.vendor_name ?? "Unassigned"}</p>
//               <p className="text-xs" style={{ color: "#888" }}>{booking.service_category}</p>
//             </div>
//           </div>

//           {/* Breakdown */}
//           <div className="rounded-lg p-4 space-y-2" style={{ background: "#1a2a1a", border: "1px solid #1a3a1a" }}>
//             <p className="text-xs font-bold text-white mb-3">💰 Payment Breakdown</p>
//             {[
//               ["Service",         booking.service_name],
//               ["Date",            fmtDate(booking.date)],
//               ["Payment Method",  (booking.payment_method ?? "cod").toUpperCase()],
//               ["Payment Status",  booking.payment_status ?? "pending"],
//             ].map(([l, v]) => (
//               <div key={l} className="flex justify-between text-xs">
//                 <span style={{ color: "#888" }}>{l}</span>
//                 <span className="font-semibold capitalize text-white">{v}</span>
//               </div>
//             ))}
//             <div className="pt-2 mt-2 space-y-1.5" style={{ borderTop: "1px solid #1a3a1a" }}>
//               <div className="flex justify-between text-xs">
//                 <span style={{ color: "#aaa" }}>Total Booking Value</span>
//                 <span className="font-bold text-white">{fmt(price)}</span>
//               </div>
//               <div className="flex justify-between text-xs">
//                 <span style={{ color: "#aaa" }}>Admin Commission ({pct}%)</span>
//                 <span className="font-bold" style={{ color: "#60a5fa" }}>{fmt(adminEarn)}</span>
//               </div>
//               <div className="flex justify-between text-xs pt-1.5" style={{ borderTop: "1px solid #1a3a1a" }}>
//                 <span className="font-bold text-white">Vendor Payout</span>
//                 <span className="font-bold text-sm" style={{ color: "#4ade80" }}>{fmt(vendorPay)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Payout status */}
//           <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "#2a1212" }}>
//             <span className="text-xs font-semibold" style={{ color: "#aaa" }}>Payout Status</span>
//             <span className="text-xs font-bold px-2.5 py-1 rounded-full"
//               style={booking.payout_status === "paid"
//                 ? { background: "#0a2a0a", color: "#4ade80" }
//                 : { background: "#2a1a00", color: "#fb923c" }}>
//               {booking.payout_status === "paid" ? "✓ Paid to Vendor" : "⏳ Pending"}
//             </span>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 pt-2">
//             {booking.payout_status !== "paid" && booking.status === "completed" && price > 0 && (
//               <button onClick={() => onMarkPaid(booking.id)}
//                 className="flex-1 py-2.5 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
//                 style={{ background: "#16a34a" }}
//                 onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
//                 onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
//                 <CheckCircle className="w-4 h-4" /> Mark Payout Paid
//               </button>
//             )}
//             <button onClick={onClose}
//               className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
//               style={{ background: "#2a1212", color: "#ccc" }}
//               onMouseEnter={e => e.currentTarget.style.background = "#3a1a1a"}
//               onMouseLeave={e => e.currentTarget.style.background = "#2a1212"}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── MAIN ─────────────────────────────────────────────────────────────────────
// export default function AdminPaymentsSection() {
//   const [bookings, setBookings] = useState([]);
//   const [stats, setStats]       = useState(null);
//   const [loading, setLoading]   = useState(true);
//   const [selected, setSelected] = useState(null);
//   const [toast, setToast]       = useState({ text: "", type: "" });

//   const [filters, setFilters] = useState({
//     search: "", paymentMethod: "", payoutStatus: "", bookingStatus: "", dateFrom: "", dateTo: ""
//   });
//   const [showFilters, setShowFilters] = useState(false);

//   const showToast = (text, type = "success") => {
//     setToast({ text, type });
//     setTimeout(() => setToast({ text: "", type: "" }), 3000);
//   };

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [bRes, sRes] = await Promise.all([
//         api.admin.getBookings({ ...filters, status: filters.bookingStatus }),
//         api.admin.getBookingStats()
//       ]);
//       if (bRes.success) setBookings(bRes.bookings);
//       if (sRes.success) setStats(sRes.stats);
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   }, [filters]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const handleMarkPaid = async (bookingId) => {
//     const res = await api.admin.updateBooking(bookingId, { payout_status: "paid" });
//     if (res.success) { showToast("Payout marked as paid ✓"); setSelected(null); loadData(); }
//     else showToast("Error updating payout", "error");
//   };

//   const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
//   const clearFilters = () => setFilters({ search: "", paymentMethod: "", payoutStatus: "", bookingStatus: "", dateFrom: "", dateTo: "" });
//   const activeCount = Object.values(filters).filter(Boolean).length;

//   const visible = bookings.filter(b => {
//     if (filters.payoutStatus && b.payout_status !== filters.payoutStatus) return false;
//     return true;
//   });

//   const onlineTotal   = visible.filter(b => b.payment_method === "online").reduce((s, b) => s + parseFloat(b.service_price ?? b.amount ?? 0), 0);
//   const codTotal      = visible.filter(b => b.payment_method === "cod").reduce((s, b) => s + parseFloat(b.service_price ?? b.amount ?? 0), 0);
//   const pendingPayout = visible.filter(b => b.payout_status === "pending" && b.status === "completed").reduce((s, b) => s + parseFloat(b.vendor_payout ?? 0), 0);

//   // Shared input style helpers
//   const inputStyle = { background: "#2a1212", color: "#fff", border: "1px solid #3a1a1a" };
//   const onFocus = e => e.target.style.border = "1px solid #C0392B";
//   const onBlur  = e => e.target.style.border = "1px solid #3a1a1a";

//   return (
//     <div className="space-y-5">

//       {/* ── Stats Row ── */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//         <StatCard label="Total Revenue"    value={fmt(stats?.totalRevenue ?? 0)}        icon={IndianRupee} borderColor="#22c55e"  sub={`Admin keeps ${fmt(stats?.totalAdminEarnings ?? 0)}`} subColor="#4ade80" />
//         <StatCard label="Vendor Payouts"   value={fmt(stats?.totalVendorPayout ?? 0)}   icon={TrendingUp}  borderColor="#60a5fa"  sub={`${stats?.payoutPaid ?? 0} paid, ${stats?.payoutPending ?? 0} pending`} subColor="#93c5fd" />
//         <StatCard label="Online Payments"  value={fmt(onlineTotal)}                      icon={CreditCard}  borderColor="#a78bfa"  sub={`${visible.filter(b => b.payment_method === "online").length} transactions`} subColor="#c4b5fd" />
//         <StatCard label="COD Payments"     value={fmt(codTotal)}                         icon={Banknote}    borderColor="#fb923c"  sub={`${visible.filter(b => b.payment_method === "cod").length} transactions`} subColor="#fdba74" />
//       </div>

//       {/* Pending payouts alert */}
//       {pendingPayout > 0 && (
//         <div className="rounded-lg px-4 py-3 flex items-center gap-3"
//           style={{ background: "#2a1a00", border: "1px solid #78350f" }}>
//           <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#fb923c" }} />
//           <p className="text-xs font-semibold" style={{ color: "#fb923c" }}>
//             {fmt(pendingPayout)} in vendor payouts are pending for completed bookings
//           </p>
//           <button onClick={() => setFilter("payoutStatus", "pending")}
//             className="ml-auto text-xs text-white px-3 py-1 rounded-md font-semibold transition-colors"
//             style={{ background: "#C0392B" }}
//             onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
//             onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
//             View All
//           </button>
//         </div>
//       )}

//       {/* ── Filters ── */}
//       <div className="rounded-lg p-4 space-y-3" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
//         <div className="flex gap-2">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#888" }} />
//             <input type="text" placeholder="Search by booking ID, customer, vendor..."
//               value={filters.search} onChange={e => setFilter("search", e.target.value)}
//               className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
//               style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
//           </div>
//           <button onClick={() => setShowFilters(!showFilters)}
//             className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
//             style={showFilters || activeCount > 0
//               ? { background: "#C0392B", color: "#fff", border: "1px solid #C0392B" }
//               : { background: "transparent", color: "#aaa", border: "1px solid #3a1a1a" }}>
//             <Filter className="w-4 h-4" />
//             Filters {activeCount > 0 && `(${activeCount})`}
//           </button>
//           <button onClick={loadData}
//             className="p-2 rounded-lg border transition-colors"
//             style={{ border: "1px solid #3a1a1a", background: "transparent" }}
//             onMouseEnter={e => e.currentTarget.style.background = "#2a1212"}
//             onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//             <RefreshCw className="w-4 h-4" style={{ color: "#aaa" }} />
//           </button>
//         </div>

//         {showFilters && (
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2" style={{ borderTop: "1px solid #3a1a1a" }}>
//             {[
//               { label: "Payment Method", key: "paymentMethod", options: [["", "All Methods"], ["online", "Online"], ["cod", "COD"]] },
//               { label: "Payout Status",  key: "payoutStatus",  options: [["", "All Payouts"], ["pending", "Pending"], ["paid", "Paid"]] },
//               { label: "Booking Status", key: "bookingStatus", options: [["", "All Statuses"], ...["pending","approved","completed","cancelled"].map(s => [s, s.charAt(0).toUpperCase() + s.slice(1)])] },
//             ].map(({ label, key, options }) => (
//               <div key={key}>
//                 <label className="text-xs font-semibold mb-1 block" style={{ color: "#aaa" }}>{label}</label>
//                 <select value={filters[key]} onChange={e => setFilter(key, e.target.value)}
//                   className="w-full px-2 py-1.5 text-sm rounded-lg outline-none"
//                   style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
//                   {options.map(([v, l]) => <option key={v} value={v} style={{ background: "#1C1010" }}>{l}</option>)}
//                 </select>
//               </div>
//             ))}
//             <div>
//               <label className="text-xs font-semibold mb-1 block" style={{ color: "#aaa" }}>From Date</label>
//               <input type="date" value={filters.dateFrom} onChange={e => setFilter("dateFrom", e.target.value)}
//                 className="w-full px-2 py-1.5 text-sm rounded-lg outline-none"
//                 style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
//             </div>
//             <div>
//               <label className="text-xs font-semibold mb-1 block" style={{ color: "#aaa" }}>To Date</label>
//               <input type="date" value={filters.dateTo} onChange={e => setFilter("dateTo", e.target.value)}
//                 className="w-full px-2 py-1.5 text-sm rounded-lg outline-none"
//                 style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
//             </div>
//             {activeCount > 0 && (
//               <div className="flex items-end">
//                 <button onClick={clearFilters}
//                   className="w-full px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
//                   style={{ color: "#C0392B", border: "1px solid #3a1a1a", background: "transparent" }}
//                   onMouseEnter={e => e.currentTarget.style.background = "#2a0a0a"}
//                   onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//                   Clear All
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Toast ── */}
//       {toast.text && (
//         <div className="px-4 py-2.5 rounded-lg text-sm font-semibold text-center"
//           style={toast.type === "error"
//             ? { background: "#2a0a0a", color: "#f87171", border: "1px solid #7f1d1d" }
//             : { background: "#0a2a0a", color: "#4ade80", border: "1px solid #14532d" }}>
//           {toast.text}
//         </div>
//       )}

//       {/* ── Payments Table ── */}
//       <div className="rounded-lg overflow-hidden" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
//         <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid #3a1a1a" }}>
//           <p className="text-sm font-semibold text-white">
//             {loading ? "Loading..." : `${visible.length} payment records`}
//           </p>
//           <div className="flex gap-3 text-xs" style={{ color: "#888" }}>
//             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#4ade80" }}></span>Paid</span>
//             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#fb923c" }}></span>Pending</span>
//           </div>
//         </div>

//         {loading ? (
//           <div className="py-20 text-center text-sm" style={{ color: "#888" }}>Loading payments...</div>
//         ) : visible.length === 0 ? (
//           <div className="py-20 text-center">
//             <IndianRupee className="w-10 h-10 mx-auto mb-2" style={{ color: "#3a1a1a" }} />
//             <p className="text-sm" style={{ color: "#888" }}>No payment records found</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead style={{ background: "#2a1212", borderBottom: "1px solid #3a1a1a" }}>
//                 <tr>
//                   {["Booking","Customer","Vendor","Method","Booking Value","Admin Earns","Vendor Gets","Payout","Actions"].map(h => (
//                     <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: "#aaa" }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {visible.map(b => {
//                   const price  = parseFloat(b.service_price ?? b.amount ?? 0);
//                   const pct    = parseFloat(b.commission_pct ?? 15);
//                   const vendor = parseFloat(b.vendor_payout ?? price * (1 - pct / 100));
//                   const admin  = price - vendor;

//                   return (
//                     <tr key={b.id} className="transition-colors"
//                       style={{ borderBottom: "1px solid #2a1212" }}
//                       onMouseEnter={e => e.currentTarget.style.background = "#231010"}
//                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//                       <td className="px-4 py-3">
//                         <p className="font-mono text-xs font-bold" style={{ color: "#aaa" }}>#{b.id}</p>
//                         <p className="text-xs" style={{ color: "#666" }}>{fmtDate(b.date)}</p>
//                         <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
//                           style={
//                             b.status === "completed" ? { background: "#0a2a0a", color: "#4ade80" } :
//                             b.status === "cancelled" ? { background: "#2a2a2a", color: "#888" } :
//                             { background: "#2a1a00", color: "#fbbf24" }
//                           }>{b.status}</span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <p className="text-xs font-medium text-white">{b.user_name ?? b.customer_name ?? "—"}</p>
//                         <p className="text-xs" style={{ color: "#666" }}>{b.user_phone}</p>
//                       </td>
//                       <td className="px-4 py-3">
//                         <p className="text-xs font-medium text-white">{b.vendor_name ?? "—"}</p>
//                         <p className="text-xs" style={{ color: "#666" }}>{b.service_name}</p>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-xs font-bold px-2 py-0.5 rounded-full"
//                           style={b.payment_method === "online"
//                             ? { background: "#2e1a4a", color: "#a78bfa" }
//                             : { background: "#2a2a2a", color: "#aaa" }}>
//                           {(b.payment_method ?? "cod").toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <p className="text-xs font-bold text-white">
//                           {price > 0 ? fmt(price) : <span style={{ color: "#444" }}>Not set</span>}
//                         </p>
//                       </td>
//                       <td className="px-4 py-3">
//                         <p className="text-xs font-bold" style={{ color: "#60a5fa" }}>{price > 0 ? fmt(admin) : "—"}</p>
//                         {price > 0 && <p className="text-xs" style={{ color: "#666" }}>{pct}%</p>}
//                       </td>
//                       <td className="px-4 py-3">
//                         <p className="text-xs font-bold" style={{ color: "#4ade80" }}>{price > 0 ? fmt(vendor) : "—"}</p>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-xs font-bold px-2 py-0.5 rounded-full"
//                           style={b.payout_status === "paid"
//                             ? { background: "#0a2a0a", color: "#4ade80" }
//                             : { background: "#2a1a00", color: "#fb923c" }}>
//                           {b.payout_status === "paid" ? "✓ Paid" : "⏳ Pending"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex flex-col gap-1.5">
//                           <button onClick={() => setSelected(b)}
//                             className="flex items-center gap-1 px-2.5 py-1 text-white rounded-md text-xs font-semibold transition-colors"
//                             style={{ background: "#C0392B" }}
//                             onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
//                             onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
//                             <Eye className="w-3 h-3" /> Detail
//                           </button>
//                           {b.payout_status !== "paid" && b.status === "completed" && price > 0 && (
//                             <button onClick={() => handleMarkPaid(b.id)}
//                               className="flex items-center gap-1 px-2.5 py-1 text-white rounded-md text-xs font-semibold transition-colors"
//                               style={{ background: "#16a34a" }}
//                               onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
//                               onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
//                               <CheckCircle className="w-3 h-3" /> Pay Out
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {selected && (
//         <PaymentModal
//           booking={selected}
//           onClose={() => setSelected(null)}
//           onMarkPaid={handleMarkPaid}
//         />
//       )}
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import {
  IndianRupee, CheckCircle, Clock, AlertCircle,
  TrendingUp, Users, RefreshCw, Edit2, X, Check,
} from "lucide-react";

const C = "#CC0000";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Badge = ({ status }) => {
  const cfg = {
    paid:         { bg: "#052E16", text: "#4ADE80" },
    pending:      { bg: "#2D2200", text: "#FCD34D" },
    accepted:     { bg: "#052E16", text: "#4ADE80" },
    rejected:     { bg: "#2A0A0A", text: "#F1948A" },
    pending_user: { bg: "#2D2200", text: "#FCD34D" },
    completed:    { bg: "#052E16", text: "#4ADE80" },
    cancelled:    { bg: "#1A1A1A", text: "#888" },
  }[status] || { bg: "#1A1A1A", text: "#888" };
  return (
    <span style={{ background: cfg.bg, color: cfg.text, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      {status || "—"}
    </span>
  );
};

export default function AdminPaymentsSection() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [editCommission, setEditCommission] = useState({ bookingId: null, value: "" });
  const [globalCommission, setGlobalCommission] = useState("");
  const [filter, setFilter] = useState("all");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const h = { Authorization: `Bearer ${token}` };
      const [pRes, sRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/payments", { headers: h }),
        fetch("http://localhost:5000/api/admin/payments/summary", { headers: h }),
      ]);
      if (pRes.ok) setPayments(await pRes.json());
      if (sRes.ok) setSummary(await sRes.json());
    } catch { showToast("Failed to load", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const markPayoutDone = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/payments/${id}/payout-done`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      if ((await res.json()).success) { showToast("Payout marked done ✅"); fetchData(); }
    } catch { showToast("Failed", "error"); }
  };

  const saveCommission = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/payments/${id}/commission`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ commission_pct: Number(editCommission.value) }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Commission updated! Admin: ${fmt(data.summary?.adminEarning)}, Vendor: ${fmt(data.summary?.vendorPayout)}`);
        setEditCommission({ bookingId: null, value: "" });
        fetchData();
      } else showToast(data.message || "Failed", "error");
    } catch { showToast("Failed", "error"); }
  };

  const applyGlobalCommission = async () => {
    if (!globalCommission) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/payments/global-commission", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ commission_pct: Number(globalCommission) }),
      });
      const data = await res.json();
      if (data.success) { showToast(data.message); setGlobalCommission(""); fetchData(); }
      else showToast(data.message || "Failed", "error");
    } catch { showToast("Failed", "error"); }
  };

  const filtered = filter === "all" ? payments
    : filter === "paid" ? payments.filter(p => p.final_payment_status === "paid")
    : filter === "pending_payout" ? payments.filter(p => p.payout_status === "pending" && p.final_payment_status === "paid")
    : payments.filter(p => p.quote_status === "pending_user");

  const s = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 16 };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
      <RefreshCw style={{ width: 28, height: 28, margin: "0 auto 8px", animation: "spin 1s linear infinite", color: C }} />
      <p style={{ fontSize: 13 }}>Loading payments...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "system-ui,sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", backgroundColor: toast.type === "success" ? "#059669" : C, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
          {toast.msg}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Admin Earned",       value: fmt(summary.adminTotalEarning),   color: C,        icon: TrendingUp },
            { label: "Vendor Payouts",     value: fmt(summary.vendorTotalPayout),   color: "#3B82F6", icon: Users },
            { label: "Pending Payouts",    value: fmt(summary.pendingVendorPayout), color: "#F59E0B", icon: Clock },
            { label: "Total Transactions", value: payments.filter(p => p.final_payment_status === "paid").length, color: "#10B981", icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ ...s, borderTop: `2px solid ${color}` }}>
              <Icon style={{ width: 16, height: 16, color, marginBottom: 6 }} />
              <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>{value}</p>
              <p style={{ fontSize: 11, color: "#666", margin: "2px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Global Commission */}
      <div style={{ ...s, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Global Commission</p>
          <p style={{ fontSize: 11, color: "#666", margin: "2px 0 0" }}>Apply % to all pending bookings at once</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <input type="number" min="0" max="100" value={globalCommission}
            onChange={e => setGlobalCommission(e.target.value)}
            placeholder="e.g. 15"
            style={{ width: 80, padding: "7px 10px", borderRadius: 8, border: "1px solid #3a3a3a", background: "#111", color: "#fff", fontSize: 13, outline: "none" }}
          />
          <span style={{ color: "#666", fontSize: 13 }}>%</span>
          <button onClick={applyGlobalCommission} disabled={!globalCommission}
            style={{ padding: "7px 16px", borderRadius: 8, background: C, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: globalCommission ? 1 : 0.5 }}>
            Apply
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { key: "all",            label: `All (${payments.length})` },
          { key: "paid",           label: `Paid (${payments.filter(p => p.final_payment_status === "paid").length})` },
          { key: "pending_payout", label: `Pending Payout (${payments.filter(p => p.payout_status === "pending" && p.final_payment_status === "paid").length})` },
          { key: "quote_pending",  label: `Quote Pending (${payments.filter(p => p.quote_status === "pending_user").length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `1px solid ${filter === f.key ? C : "#2a2a2a"}`, background: filter === f.key ? `${C}22` : "transparent", color: filter === f.key ? "#F1948A" : "#666", cursor: "pointer" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#444", fontSize: 13 }}>No payments found</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ ...s, padding: 0, overflow: "hidden" }}>
              {/* Header row */}
              <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, borderBottom: "1px solid #2a2a2a" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#f0f0f0" }}>{p.vendor_name || "—"}</span>
                    <span style={{ fontSize: 11, color: "#555" }}>→</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>{p.customer_name || "—"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>
                    {p.service_name} · {p.date} · #{p.id?.slice(0, 10)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Badge status={p.quote_status || "—"} />
                  <Badge status={p.final_payment_status || "—"} />
                  <Badge status={p.payout_status || "—"} />
                </div>
              </div>

              {/* Amounts row */}
              <div style={{ padding: "10px 16px", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, backgroundColor: "#141414" }}>
                {[
                  ["Quote Sent",     p.quote_amount    ? fmt(p.quote_amount)   : "—", "#FCD34D"],
                  ["Final Amount",   p.final_amount    ? fmt(p.final_amount)   : "—", "#4ADE80"],
                  ["Admin Earning",  p.admin_earning   ? fmt(p.admin_earning)  : "—", C],
                  ["Vendor Payout",  p.vendor_payout   ? fmt(p.vendor_payout)  : "—", "#93C5FD"],
                  ["Commission",     `${p.commission_pct || 10}%`,                    "#C4B5FD"],
                ].map(([label, val, color]) => (
                  <div key={label}>
                    <p style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Payment method + actions */}
              <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {p.final_payment_method && (
                  <span style={{ fontSize: 11, color: "#888", background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "3px 10px", borderRadius: 999 }}>
                    {p.final_payment_method === "cash" ? "💵 Cash" : "💳 Online"}
                  </span>
                )}

                {/* Edit commission */}
                {editCommission.bookingId === p.id ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="number" min="0" max="100" value={editCommission.value}
                      onChange={e => setEditCommission({ bookingId: p.id, value: e.target.value })}
                      style={{ width: 60, padding: "5px 8px", borderRadius: 6, border: "1px solid #3a3a3a", background: "#111", color: "#fff", fontSize: 12, outline: "none" }}
                    />
                    <span style={{ color: "#555", fontSize: 12 }}>%</span>
                    <button onClick={() => saveCommission(p.id)}
                      style={{ padding: "5px 10px", borderRadius: 6, background: "#059669", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                      <Check style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={() => setEditCommission({ bookingId: null, value: "" })}
                      style={{ padding: "5px 10px", borderRadius: 6, background: "#2a2a2a", color: "#aaa", border: "none", cursor: "pointer", fontSize: 11 }}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditCommission({ bookingId: p.id, value: String(p.commission_pct || 10) })}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid #3a3a3a", background: "transparent", color: "#888", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                    <Edit2 style={{ width: 11, height: 11 }} /> Edit %
                  </button>
                )}

                {/* Mark payout done */}
                {p.payout_status === "pending" && p.final_payment_status === "paid" && (
                  <button onClick={() => markPayoutDone(p.id)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 6, background: "#059669", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>
                    <CheckCircle style={{ width: 12, height: 12 }} /> Mark Payout Done
                  </button>
                )}
                {p.payout_status === "paid" && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#4ADE80", fontWeight: 700 }}>✅ Payout Done</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
