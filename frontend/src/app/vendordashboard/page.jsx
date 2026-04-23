// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { api } from "@/lib/api";
// import {
//   LayoutDashboard, Calendar, IndianRupee, Star, Settings,
//   LogOut, Edit, Trash2, Plus, TrendingUp, Users, MessageSquare,
//   Bell, X, Save, CheckCircle, XCircle, Clock, RefreshCw,
//   FileText, ChevronDown, ChevronUp, AlertCircle, Check,
//   Navigation, Phone, MapPin, Wifi, WifiOff, ChevronRight,
//   Banknote, Award, Zap, BarChart2, Activity, Filter,
// } from "lucide-react";
// import {
//   AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
// } from "recharts";

// // ── THEME ────────────────────────────────────────────────────
// const T = {
//   crimson: "#C0392B", crimsonHover: "#A41B24",
//   crimsonLight: "#3D1210", crimsonMuted: "#5A1A18", crimsonText: "#F1948A",
//   dark: "#161616", darkSurface: "#1E1E1E", darkSurface2: "#242424",
//   darkBorder: "#2E2E2E", darkBorder2: "#383838",
//   inputBg: "#1A1A1A", inputBorder: "#3A3A3A",
//   white: "#FFFFFF", offWhite: "#F0F0F0",
//   gray400: "#777777", gray500: "#666666", gray600: "#AAAAAA",
//   gray700: "#CCCCCC", gray900: "#EEEEEE",
// };

// const STATUS_CFG = {
//   pending:     { bg: "#2D2200", text: "#FCD34D", dot: "#F59E0B", label: "Pending"     },
//   pending_visit: { bg: "#2D2200", text: "#FCD34D", dot: "#F59E0B", label: "Pending Visit" },
//   approved:    { bg: "#0A1F35", text: "#93C5FD", dot: "#3B82F6", label: "Approved"    },
//   completed:   { bg: "#051E10", text: "#6EE7B7", dot: "#10B981", label: "Completed"   },
//   rejected:    { bg: "#2A0A0A", text: "#F1948A", dot: "#C0392B", label: "Rejected"    },
//   cancelled:   { bg: "#1A1A1A", text: "#9CA3AF", dot: "#6B7280", label: "Cancelled"   },
//   rescheduled: { bg: "#120D30", text: "#C4B5FD", dot: "#7C3AED", label: "Rescheduled" },
// };

// const inputStyle = {
//   width: "100%", padding: "9px 12px", fontSize: 13,
//   border: `1px solid ${T.inputBorder}`, borderRadius: 8,
//   backgroundColor: T.inputBg, color: T.gray900, outline: "none",
//   boxSizing: "border-box", fontFamily: "inherit",
// };
// const textareaStyle = { ...inputStyle, resize: "none" };

// const PIE_COLORS = ["#F59E0B","#3B82F6","#10B981","#C0392B","#7C3AED","#6B7280"];

// // ── MAIN COMPONENT ───────────────────────────────────────────
// export default function VendorDashboard() {
//   const router = useRouter();
//   const [tab, setTab] = useState("overview");
//   const [vendorData, setVendorData]   = useState(null);
//   const [bookings, setBookings]       = useState([]);
//   const [reviews, setReviews]         = useState([]);
//   const [stats, setStats]             = useState({ totalBookings:0, pendingBookings:0, completedBookings:0, totalRevenue:0, averageRating:0, weeklyData:[], monthlyData:[], statusDistribution:[] });

//   // Modals
//   const [showReject, setShowReject]       = useState(false);
//   const [showReschedule, setShowReschedule] = useState(false);
//   const [showNotes, setShowNotes]         = useState(false);
//   const [showEdit, setShowEdit]           = useState(false);
//   const [showLogout, setShowLogout]       = useState(false);
//   const [selectedBk, setSelectedBk]      = useState(null);

//   // Form states
//   const [rejectReason, setRejectReason]   = useState("");
//   const [rescheduleData, setRescheduleData] = useState({ date:"", time:"", reason:"" });
//   const [serviceNote, setServiceNote]     = useState("");
//   const [editForm, setEditForm]           = useState({});

//   // UI states
//   const [expandedBk, setExpandedBk]   = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [loading, setLoading]         = useState(false);
//   const [toast, setToast]             = useState(null); // { msg, type }
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [chartView, setChartView]     = useState("weekly"); // weekly | monthly

//   // Incoming booking alert (Zomato-style)
//   const [incomingAlert, setIncomingAlert] = useState(null);
//   const [alertTimer, setAlertTimer]       = useState(30);
//   const alertIntervalRef = useRef(null);

//   // WebSocket for real-time notifications
//   const wsRef = useRef(null);

//   // ── TOAST ─────────────────────────────────────────────────
//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   // ── WEBSOCKET ─────────────────────────────────────────────
//   const connectWS = useCallback(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
//       const ws = new WebSocket(`${wsUrl}/tracking?role=vendor&token=${token}`);
//       wsRef.current = ws;
//       ws.onopen  = () => console.log("📡 WS connected");
//       ws.onclose = () => setTimeout(connectWS, 4000);
//       ws.onerror = () => ws.close();
//       ws.onmessage = (e) => {
//         try {
//           const data = JSON.parse(e.data);
//           if (data.type === "new_booking") {
//             triggerIncomingAlert(data.booking);
//           }
//         } catch {}
//       };
//     } catch {}
//   }, []);

//   useEffect(() => {
//     const userType = localStorage.getItem("userType");
//     if (userType !== "vendor") { router.push("/vendorlogin"); return; }
//     fetchAll();
//     connectWS();
//     return () => { wsRef.current?.close(); clearInterval(alertIntervalRef.current); };
//   }, []);

//   // ── FETCH ─────────────────────────────────────────────────
//   const fetchAll = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) { router.push("/vendorlogin"); return; }
//     try {
//       const [bkRes, statsRes, profileRes, revRes] = await Promise.all([
//         fetch("http://localhost:5000/api/vendor/bookings",{ headers:{ Authorization:`Bearer ${token}` } }),
//         fetch("http://localhost:5000/api/vendor/stats",   { headers:{ Authorization:`Bearer ${token}` } }),
//         fetch("http://localhost:5000/api/vendor/profile", { headers:{ Authorization:`Bearer ${token}` } }),
//         fetch("http://localhost:5000/api/vendor/reviews", { headers:{ Authorization:`Bearer ${token}` } }),
//       ]);
//       if (bkRes.ok) {
//   const data = await bkRes.json();
//   console.log("📦 Bookings data:", data); // ← yeh add karo
//   setBookings(data);
// }
//       if (statsRes.ok)   setStats(await statsRes.json());
//       if (profileRes.ok) setVendorData(await profileRes.json());
//       if (revRes.ok)     setReviews(await revRes.json());
//     } catch (err) { console.error(err); }
//   };

//   // ── INCOMING ALERT (Zomato style) ─────────────────────────
//   const triggerIncomingAlert = (booking) => {
//     setIncomingAlert(booking);
//     setAlertTimer(30);
//     clearInterval(alertIntervalRef.current);
//     alertIntervalRef.current = setInterval(() => {
//       setAlertTimer((t) => {
//         if (t <= 1) {
//           clearInterval(alertIntervalRef.current);
//           setIncomingAlert(null);
//           return 0;
//         }
//         return t - 1;
//       });
//     }, 1000);
//   };

//   const dismissAlert = () => {
//     clearInterval(alertIntervalRef.current);
//     setIncomingAlert(null);
//   };

//   // ── BOOKING ACTIONS ────────────────────────────────────────
//   const updateStatus = async (bookingId, status, extra = {}) => {
//     setActionLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`http://localhost:5000/api/vendor/bookings/${bookingId}`, {
//         method: "PUT",
//         headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
//         body: JSON.stringify({ status, ...extra }),
//       });
//       const data = await res.json();
//       if (data.conflict) {
//         showToast(`⚠️ ${data.message}`, "error");
//       } else if (data.success) {
//         const msgs = { approved:"✅ Booking accepted!", rejected:"❌ Booking rejected.", completed:"🎉 Marked as completed!", rescheduled:"📅 Reschedule sent!" };
//         showToast(msgs[status] || "Updated!", "success");
//         fetchAll();
//       } else {
//         showToast(data.message || "Failed", "error");
//       }
//     } catch { showToast("Network error", "error"); }
//     finally  { setActionLoading(false); }
//   };

//   const handleApprove   = (bk) => updateStatus(bk.id, "approved");
//   const handleComplete  = (bk) => updateStatus(bk.id, "completed");

//   const handleRejectOpen = (bk) => { setSelectedBk(bk); setRejectReason(""); setShowReject(true); };
//   const handleRejectConfirm = () => {
//     if (!rejectReason.trim()) { showToast("Please enter a reason", "error"); return; }
//     updateStatus(selectedBk.id, "rejected", { vendor_response: rejectReason });
//     setShowReject(false);
//   };

//   const handleRescheduleOpen = (bk) => {
//     setSelectedBk(bk);
//     setRescheduleData({ date: bk.date || "", time: "", reason: "" });
//     setShowReschedule(true);
//   };
//   const handleRescheduleConfirm = () => {
//     if (!rescheduleData.date || !rescheduleData.time) { showToast("Pick new date and time", "error"); return; }
//     updateStatus(selectedBk.id, "rescheduled", { new_date: rescheduleData.date, new_time: rescheduleData.time, vendor_response: rescheduleData.reason });
//     setShowReschedule(false);
//   };

//   const handleNotesOpen = (bk) => { setSelectedBk(bk); setServiceNote(bk.service_notes || ""); setShowNotes(true); };
//   const handleNotesSave = async () => {
//     if (!serviceNote.trim()) { showToast("Enter a note", "error"); return; }
//     await updateStatus(selectedBk.id, selectedBk.status, { service_notes: serviceNote });
//     setShowNotes(false);
//   };

//   // ── PROFILE EDIT ───────────────────────────────────────────
//   const handleEditOpen = () => {
//     setEditForm({
//       businessName: vendorData?.business_name || "", ownerName: vendorData?.owner_name || "",
//       phone: vendorData?.phone || "", address: vendorData?.address || "",
//       city: vendorData?.city || "", state: vendorData?.state || "",
//       zipCode: vendorData?.zip_code || "", servicesOffered: vendorData?.services_offered || "",
//       description: vendorData?.description || "", pricing: vendorData?.pricing || "",
//       availability: vendorData?.availability || "", website: vendorData?.website || "",
//       certification: vendorData?.certification || "",
//     });
//     setShowEdit(true);
//   };
//   const handleEditSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const data = await api.vendor.updateProfile(editForm);
//       if (data.success) { showToast("Profile updated!"); setTimeout(() => { setShowEdit(false); fetchAll(); }, 1500); }
//       else showToast(data.message || "Failed", "error");
//     } catch { showToast("Failed", "error"); }
//     finally { setLoading(false); }
//   };

//   const handleLogout = () => { localStorage.clear(); router.push("/vendorlogin"); };

//   // ── HELPERS ────────────────────────────────────────────────
//   const getStatusBadge = (status) => {
//     const cfg = STATUS_CFG[status] || { bg:"#1A1A1A", text:"#9CA3AF", dot:"#6B7280", label: status };
//     return (
//       <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, backgroundColor:cfg.bg, color:cfg.text }}>
//         <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor:cfg.dot, display:"inline-block" }}/>
//         {cfg.label}
//       </span>
//     );
//   };

//   const filteredBookings = filterStatus === "all" ? bookings : bookings.filter(b => b.status === filterStatus);
//   const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "pending_visit");
//   const chartData = chartView === "weekly" ? (stats.weeklyData || []) : (stats.monthlyData || []);
//   const xKey = chartView === "weekly" ? "day" : "month";

//   // ── BOOKING CARD ───────────────────────────────────────────
//   const BookingCard = ({ bk }) => {
//     const isOpen = expandedBk === bk.id;
//     const isPending = bk.status === "pending" || bk.status === "pending_visit";
//     const isApproved = bk.status === "approved";

//     return (
//       <div style={{ border:`1px solid ${isPending ? "#3A2200" : T.darkBorder}`, borderRadius:12, overflow:"hidden", backgroundColor: isPending ? "#1C1400" : T.darkSurface2, transition:"all 0.2s" }}>
//         {/* Card Header */}
//         <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
//           onClick={() => setExpandedBk(isOpen ? null : bk.id)}>
//           {/* Status dot */}
//           <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor: STATUS_CFG[bk.status]?.dot || "#666", flexShrink:0 }}/>

//           <div style={{ flex:1, minWidth:0 }}>
//             <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
//               <span style={{ fontSize:14, fontWeight:700, color:T.gray900 }}>{bk.service_name}</span>
//               {getStatusBadge(bk.status)}
//               {isPending && (
//                 <span style={{ fontSize:10, fontWeight:800, color:"#F59E0B", backgroundColor:"#2D1800", padding:"2px 8px", borderRadius:999, letterSpacing:"0.05em", animation:"pulse 1.5s infinite" }}>
//                   NEW
//                 </span>
//               )}
//             </div>
//             <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px", fontSize:12, color:T.gray600 }}>
//               <span>👤 {bk.customer_name}</span>
//               <span>📅 {bk.date}</span>
//               <span>🕐 {bk.time}</span>
//               <span style={{ color:"#10B981", fontWeight:700 }}>₹{Number(bk.amount||0).toLocaleString("en-IN")}</span>
//             </div>
//           </div>

//           {/* Quick actions */}
//           <div style={{ display:"flex", gap:6, flexShrink:0 }} onClick={e => e.stopPropagation()}>
//             {isPending && (
//               <>
//                 <button disabled={actionLoading} onClick={() => handleApprove(bk)}
//                   style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#059669", color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
//                   <Check style={{width:12,height:12}}/> Accept
//                 </button>
//                 <button disabled={actionLoading} onClick={() => handleRejectOpen(bk)}
//                   style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:T.crimson, color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
//                   <X style={{width:12,height:12}}/> Reject
//                 </button>
//               </>
//             )}
//             {isApproved && (
//               <button disabled={actionLoading} onClick={() => handleComplete(bk)}
//                 style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#7C3AED", color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
//                 <CheckCircle style={{width:12,height:12}}/> Done
//               </button>
//             )}
//             {(isPending || isApproved) && (
//               <button disabled={actionLoading} onClick={() => handleRescheduleOpen(bk)}
//                 style={{ padding:"6px 10px", borderRadius:8, fontSize:12, fontWeight:700, border:`1px solid ${T.darkBorder2}`, cursor:"pointer", backgroundColor:"transparent", color:T.gray600, display:"flex", alignItems:"center", gap:4 }}>
//                 <RefreshCw style={{width:12,height:12}}/>
//               </button>
//             )}
//             {isApproved && (
//               <button onClick={() => router.push(`/vendordashboard/track/${bk.id}`)}
//                 style={{ padding:"6px 10px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#1E3A5F", color:"#93C5FD", display:"flex", alignItems:"center", gap:4 }}>
//                 <Navigation style={{width:12,height:12}}/> Track
//               </button>
//             )}
//           </div>

//           {isOpen ? <ChevronUp style={{width:16,height:16,color:T.gray400,flexShrink:0}}/> : <ChevronDown style={{width:16,height:16,color:T.gray400,flexShrink:0}}/>}
//         </div>

//         {/* Expanded Details */}
//         {isOpen && (
//           <div style={{ borderTop:`1px solid ${T.darkBorder}`, backgroundColor:T.darkSurface, padding:16 }}>
//             {/* Customer Details Card */}
//             <div style={{ backgroundColor:"#0D1F0D", border:"1px solid #1A3A1A", borderRadius:10, padding:14, marginBottom:14 }}>
//               <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"#4ADE80", marginBottom:10 }}>
//                 👤 Customer Details
//               </p>
//               <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
//                 {[
//                   ["Name",    bk.customer_name  || "—"],
//                   ["Email",   bk.customer_email || "—"],
//                   ["Phone",   bk.customer_phone || "—"],
//                   ["Address", bk.customer_address || "—"],
//                 ].map(([label, val]) => (
//                   <div key={label}>
//                     <p style={{ fontSize:10, color:"#4ADE80", fontWeight:700, marginBottom:2 }}>{label}</p>
//                     <p style={{ fontSize:13, color:T.gray900, fontWeight:500 }}>{val}</p>
//                   </div>
//                 ))}
//               </div>
//               {bk.customer_phone && (
//                 <div style={{ display:"flex", gap:8, marginTop:12 }}>
//                   <a href={`tel:${bk.customer_phone}`}
//                     style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, backgroundColor:T.crimson, color:"#fff", textDecoration:"none", fontSize:12, fontWeight:700 }}>
//                     <Phone style={{width:13,height:13}}/> Call Customer
//                   </a>
//                   {bk.customer_address && (
//                     <a href={`https://maps.google.com?q=${encodeURIComponent(bk.customer_address)}`} target="_blank" rel="noreferrer"
//                       style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, backgroundColor:"#0D2340", color:"#93C5FD", textDecoration:"none", fontSize:12, fontWeight:700, border:"1px solid #1E3A5F" }}>
//                       <MapPin style={{width:13,height:13}}/> Open in Maps
//                     </a>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Booking Meta */}
//             <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
//               {[
//                 ["Booking ID",  `#${bk.id}`],
//                 ["Payment",     bk.payment_method === "cod" ? "Cash on Visit" : "Online Paid"],
//                 ["Amount",      `₹${Number(bk.amount||0).toLocaleString("en-IN")}`],
//                 ["Created",     bk.created_at ? new Date(bk.created_at).toLocaleDateString("en-IN") : "—"],
//                 ...(bk.new_date ? [["Rescheduled To", `${bk.new_date} @ ${bk.new_time}`]] : []),
//               ].map(([label, val]) => (
//                 <div key={label} style={{ backgroundColor:T.darkSurface2, borderRadius:8, padding:"10px 12px" }}>
//                   <p style={{ fontSize:10, color:T.gray400, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{label}</p>
//                   <p style={{ fontSize:13, color:T.gray900, fontWeight:600 }}>{val}</p>
//                 </div>
//               ))}
//             </div>

//             {bk.message && (
//               <div style={{ backgroundColor:"#1A1A2E", border:"1px solid #2E2E5E", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
//                 <p style={{ fontSize:10, color:"#C4B5FD", fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Customer Message</p>
//                 <p style={{ fontSize:13, color:T.gray700 }}>{bk.message}</p>
//               </div>
//             )}
//             {bk.vendor_response && (
//               <div style={{ backgroundColor:"#1A0E0E", border:`1px solid ${T.crimsonMuted}`, borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
//                 <p style={{ fontSize:10, color:T.crimsonText, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Your Response</p>
//                 <p style={{ fontSize:13, color:T.gray700 }}>{bk.vendor_response}</p>
//               </div>
//             )}
//             {bk.service_notes && (
//               <div style={{ backgroundColor:"#1A1A0E", border:"1px solid #3A3A1A", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
//                 <p style={{ fontSize:10, color:"#FDE047", fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Service Notes</p>
//                 <p style={{ fontSize:13, color:T.gray700 }}>{bk.service_notes}</p>
//               </div>
//             )}

//             {/* Action Row */}
//             <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingTop:10, borderTop:`1px solid ${T.darkBorder}` }}>
//               {bk.status === "pending" && (
//                 <>
//                   <button disabled={actionLoading} onClick={() => handleApprove(bk)}
//                     style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#059669", color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
//                     <CheckCircle style={{width:14,height:14}}/> Accept Booking
//                   </button>
//                   <button disabled={actionLoading} onClick={() => handleRejectOpen(bk)}
//                     style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:T.crimson, color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
//                     <XCircle style={{width:14,height:14}}/> Reject
//                   </button>
//                 </>
//               )}
//               {(bk.status === "pending" || bk.status === "approved") && (
//                 <button disabled={actionLoading} onClick={() => handleRescheduleOpen(bk)}
//                   style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:`1px solid #2563EB`, cursor:"pointer", backgroundColor:"#0D2340", color:"#93C5FD", display:"flex", alignItems:"center", gap:5 }}>
//                   <RefreshCw style={{width:14,height:14}}/> Reschedule
//                 </button>
//               )}
//               {bk.status === "approved" && (
//                 <>
//                   <button disabled={actionLoading} onClick={() => handleComplete(bk)}
//                     style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#7C3AED", color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
//                     <Check style={{width:14,height:14}}/> Mark Complete
//                   </button>
//                   <button onClick={() => router.push(`/vendordashboard/track/${bk.id}`)}
//                     style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#1E3A5F", color:"#93C5FD", display:"flex", alignItems:"center", gap:5 }}>
//                     <Navigation style={{width:14,height:14}}/> Live Tracking
//                   </button>
//                 </>
//               )}
//               <button disabled={actionLoading} onClick={() => handleNotesOpen(bk)}
//                 style={{ padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:700, border:`1px solid ${T.darkBorder2}`, cursor:"pointer", backgroundColor:"transparent", color:T.gray600, display:"flex", alignItems:"center", gap:5, marginLeft:"auto" }}>
//                 <FileText style={{width:13,height:13}}/> {bk.service_notes ? "Edit Notes" : "Add Notes"}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // ── MODAL WRAPPERS ─────────────────────────────────────────
//   const Overlay = ({ children, onClose }) => (
//     <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:60, overflowY:"auto" }}
//       onClick={e => e.target === e.currentTarget && onClose()}>
//       {children}
//     </div>
//   );
//   const ModalCard = ({ children, maxW = 440 }) => (
//     <div style={{ backgroundColor:T.darkSurface, borderRadius:14, maxWidth:maxW, width:"100%", padding:24, boxShadow:"0 24px 64px rgba(0,0,0,0.7)", border:`1px solid ${T.darkBorder2}` }}>
//       {children}
//     </div>
//   );
//   const ModalHead = ({ icon:Icon, iconBg, iconColor, title, sub, onClose }) => (
//     <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
//       <div style={{ width:42, height:42, borderRadius:10, backgroundColor:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
//         <Icon style={{ width:20, height:20, color:iconColor }}/>
//       </div>
//       <div style={{ flex:1 }}>
//         <h3 style={{ fontSize:15, fontWeight:700, color:T.gray900, margin:0 }}>{title}</h3>
//         {sub && <p style={{ fontSize:11, color:T.gray500, margin:0 }}>{sub}</p>}
//       </div>
//       <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.gray400 }}>
//         <X style={{width:18,height:18}}/>
//       </button>
//     </div>
//   );
//   const FormLabel = ({ children, required }) => (
//     <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.gray600, marginBottom:5 }}>
//       {children}{required && <span style={{color:T.crimson}}> *</span>}
//     </label>
//   );

//   // ── ANALYTICS TAB ──────────────────────────────────────────
//   const AnalyticsTab = () => {
//     const pieData = (stats.statusDistribution || []).map(d => ({
//       name: STATUS_CFG[d.status]?.label || d.status,
//       value: parseInt(d.count),
//     }));

//     return (
//       <div>
//         <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
//           <h2 style={{ fontSize:17, fontWeight:700, color:T.white, margin:0 }}>Analytics</h2>
//           <div style={{ display:"flex", gap:6 }}>
//             {["weekly","monthly"].map(v => (
//               <button key={v} onClick={() => setChartView(v)}
//                 style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor: chartView===v ? T.crimson : T.darkSurface2, color: chartView===v ? "#fff" : T.gray600, textTransform:"capitalize" }}>
//                 {v}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Mini stat row */}
//         <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
//           {[
//             { label:"Total",     value:stats.totalBookings,     color:"#3B82F6", icon:Calendar },
//             { label:"Pending",   value:stats.pendingBookings,   color:"#F59E0B", icon:Clock },
//             { label:"Revenue",   value:`₹${(stats.totalRevenue||0).toLocaleString("en-IN")}`, color:"#10B981", icon:IndianRupee },
//             { label:"Rating",    value:(stats.averageRating||0).toFixed(1)+"★", color:T.crimson, icon:Star },
//           ].map(({ label, value, color, icon:Icon }) => (
//             <div key={label} style={{ backgroundColor:T.darkSurface2, borderRadius:10, padding:14, borderTop:`2px solid ${color}` }}>
//               <Icon style={{ width:16, height:16, color, marginBottom:6 }}/>
//               <p style={{ fontSize:20, fontWeight:800, color:T.white, margin:0 }}>{value}</p>
//               <p style={{ fontSize:11, color:T.gray500, margin:"2px 0 0" }}>{label}</p>
//             </div>
//           ))}
//         </div>

//         {/* Area Chart */}
//         <div style={{ backgroundColor:T.darkSurface2, borderRadius:12, padding:20, marginBottom:16, border:`1px solid ${T.darkBorder}` }}>
//           <p style={{ fontSize:13, fontWeight:700, color:T.gray700, marginBottom:14 }}>Bookings & Revenue</p>
//           {chartData.length === 0 ? (
//             <div style={{ textAlign:"center", padding:"40px 0", color:T.gray500, fontSize:13 }}>No data yet</div>
//           ) : (
//             <ResponsiveContainer width="100%" height={200}>
//               <AreaChart data={chartData}>
//                 <defs>
//                   <linearGradient id="colorBk" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
//                   </linearGradient>
//                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke={T.darkBorder}/>
//                 <XAxis dataKey={xKey} tick={{ fill:T.gray500, fontSize:11 }} axisLine={false} tickLine={false}/>
//                 <YAxis tick={{ fill:T.gray500, fontSize:11 }} axisLine={false} tickLine={false}/>
//                 <Tooltip
//                   contentStyle={{ backgroundColor:T.darkSurface, border:`1px solid ${T.darkBorder2}`, borderRadius:8, fontSize:12 }}
//                   labelStyle={{ color:T.gray700, fontWeight:700 }}
//                 />
//                 <Area type="monotone" dataKey="bookings" stroke="#3B82F6" fill="url(#colorBk)" strokeWidth={2} dot={{ fill:"#3B82F6", r:3 }} name="Bookings"/>
//                 <Area type="monotone" dataKey="revenue"  stroke="#10B981" fill="url(#colorRev)" strokeWidth={2} dot={{ fill:"#10B981", r:3 }} name="Revenue (₹)"/>
//               </AreaChart>
//             </ResponsiveContainer>
//           )}
//         </div>

//         {/* Bar + Pie row */}
//         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
//           <div style={{ backgroundColor:T.darkSurface2, borderRadius:12, padding:20, border:`1px solid ${T.darkBorder}` }}>
//             <p style={{ fontSize:13, fontWeight:700, color:T.gray700, marginBottom:14 }}>Booking Volume</p>
//             {chartData.length === 0 ? (
//               <div style={{ textAlign:"center", padding:"40px 0", color:T.gray500, fontSize:13 }}>No data yet</div>
//             ) : (
//               <ResponsiveContainer width="100%" height={160}>
//                 <BarChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke={T.darkBorder}/>
//                   <XAxis dataKey={xKey} tick={{ fill:T.gray500, fontSize:10 }} axisLine={false} tickLine={false}/>
//                   <YAxis tick={{ fill:T.gray500, fontSize:10 }} axisLine={false} tickLine={false}/>
//                   <Tooltip contentStyle={{ backgroundColor:T.darkSurface, border:`1px solid ${T.darkBorder2}`, borderRadius:8, fontSize:11 }}/>
//                   <Bar dataKey="bookings" fill={T.crimson} radius={[4,4,0,0]} name="Bookings"/>
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//           <div style={{ backgroundColor:T.darkSurface2, borderRadius:12, padding:20, border:`1px solid ${T.darkBorder}` }}>
//             <p style={{ fontSize:13, fontWeight:700, color:T.gray700, marginBottom:14 }}>Status Distribution</p>
//             {pieData.length === 0 ? (
//               <div style={{ textAlign:"center", padding:"40px 0", color:T.gray500, fontSize:13 }}>No data yet</div>
//             ) : (
//               <ResponsiveContainer width="100%" height={160}>
//                 <PieChart>
//                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
//                     dataKey="value" nameKey="name" paddingAngle={3}>
//                     {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor:T.darkSurface, border:`1px solid ${T.darkBorder2}`, borderRadius:8, fontSize:11 }}/>
//                   <Legend wrapperStyle={{ fontSize:11, color:T.gray600 }}/>
//                 </PieChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ── TABS CONFIG ────────────────────────────────────────────
//   const TABS = [
//     { id:"overview",  label:"Overview",  icon:LayoutDashboard },
//     { id:"bookings",  label:"Bookings",  icon:Calendar,    badge: stats.pendingBookings },
//     { id:"analytics", label:"Analytics", icon:BarChart2 },
//     { id:"reviews",   label:"Reviews",   icon:Star },
//     { id:"profile",   label:"Profile",   icon:Users },
//   ];

//   // ─────────────────────────────────────────────────────────
//   return (
//     <>
//       <style>{`
//         @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
//         @keyframes slideDown { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
//         @keyframes ringPulse { 0%{box-shadow:0 0 0 0 rgba(192,57,43,0.7)} 70%{box-shadow:0 0 0 20px rgba(192,57,43,0)} 100%{box-shadow:0 0 0 0 rgba(192,57,43,0)} }
//         .incoming-card { animation: slideDown 0.4s ease; }
//         .ring-btn { animation: ringPulse 1s infinite; }
//       `}</style>

//       <div style={{ minHeight:"100vh", marginTop:80, backgroundColor:T.dark, fontFamily:"system-ui,sans-serif" }}>

//         {/* ── TOAST ── */}
//         {toast && (
//           <div style={{ position:"fixed", top:20, right:20, zIndex:100, display:"flex", alignItems:"center", gap:8, padding:"11px 18px", borderRadius:10, boxShadow:"0 8px 30px rgba(0,0,0,0.6)", fontSize:13, fontWeight:700, color:"#fff", backgroundColor: toast.type==="success" ? "#059669" : T.crimson, maxWidth:360 }}>
//             {toast.type==="success" ? <CheckCircle style={{width:16,height:16}}/> : <AlertCircle style={{width:16,height:16}}/>}
//             {toast.msg}
//             <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", marginLeft:4 }}><X style={{width:15,height:15}}/></button>
//           </div>
//         )}

//         {/* ── ZOMATO-STYLE INCOMING BOOKING ALERT ── */}
//         {incomingAlert && (
//           <div className="incoming-card" style={{ position:"fixed", top:90, left:"50%", transform:"translateX(-50%)", zIndex:99, width:"min(440px,calc(100vw - 32px))", backgroundColor:"#0D0D0D", border:`2px solid ${T.crimson}`, borderRadius:16, padding:20, boxShadow:"0 20px 60px rgba(192,57,43,0.4)" }}>
//             <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
//               <div className="ring-btn" style={{ width:52, height:52, borderRadius:"50%", backgroundColor:T.crimson, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
//                 <Bell style={{ width:24, height:24, color:"#fff" }}/>
//               </div>
//               <div style={{ flex:1 }}>
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
//                   <p style={{ fontSize:15, fontWeight:800, color:"#fff", margin:0 }}>🔔 New Booking Request!</p>
//                   <span style={{ fontSize:20, fontWeight:800, color:T.crimson }}>{alertTimer}s</span>
//                 </div>
//                 <p style={{ fontSize:13, color:T.gray700, marginBottom:8 }}>
//                   <strong style={{color:"#fff"}}>{incomingAlert.customer_name}</strong> wants <strong style={{color:"#fff"}}>{incomingAlert.service_name}</strong><br/>
//                   📅 {incomingAlert.date} · 🕐 {incomingAlert.time}
//                 </p>
//                 <div style={{ height:3, backgroundColor:"#2A2A2A", borderRadius:4, overflow:"hidden", marginBottom:12 }}>
//                   <div style={{ height:"100%", backgroundColor:T.crimson, width:`${(alertTimer/30)*100}%`, transition:"width 1s linear", borderRadius:4 }}/>
//                 </div>
//                 <div style={{ display:"flex", gap:8 }}>
//                   <button onClick={() => { updateStatus(incomingAlert.id, "approved"); dismissAlert(); }}
//                     className="ring-btn"
//                     style={{ flex:1, padding:"10px 0", borderRadius:10, fontWeight:800, fontSize:13, border:"none", cursor:"pointer", backgroundColor:"#059669", color:"#fff" }}>
//                     ✅ Accept
//                   </button>
//                   <button onClick={() => { setSelectedBk(incomingAlert); setRejectReason(""); setShowReject(true); dismissAlert(); }}
//                     style={{ flex:1, padding:"10px 0", borderRadius:10, fontWeight:800, fontSize:13, border:"none", cursor:"pointer", backgroundColor:T.crimson, color:"#fff" }}>
//                     ❌ Reject
//                   </button>
//                   <button onClick={dismissAlert}
//                     style={{ padding:"10px 14px", borderRadius:10, fontWeight:700, fontSize:12, border:`1px solid ${T.darkBorder2}`, cursor:"pointer", backgroundColor:"transparent", color:T.gray600 }}>
//                     Later
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── HEADER ── */}
//         <header style={{ backgroundColor:T.crimson, borderBottom:`1px solid ${T.crimsonHover}`, boxShadow:"0 2px 12px rgba(0,0,0,0.5)", position:"sticky", top:0, zIndex:40 }}>
//           <div style={{ maxWidth:1280, margin:"0 auto", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//             <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//               <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
//                 <Zap style={{ width:18, height:18, color:"#fff" }}/>
//               </div>
//               <div>
//                 <h1 style={{ fontSize:17, fontWeight:800, color:"#fff", margin:0 }}>{vendorData?.business_name || "Vendor Dashboard"}</h1>
//                 <p style={{ fontSize:11, color:"rgba(255,255,255,0.65)", margin:0 }}>{vendorData?.service_category || "Service Provider"}</p>
//               </div>
//             </div>
//             <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//               {/* Pending badge */}
//               {stats.pendingBookings > 0 && (
//                 <button onClick={() => setTab("bookings")} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, backgroundColor:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", color:"#fff", fontSize:12, fontWeight:700 }}>
//                   <Bell style={{ width:14, height:14 }}/>
//                   <span style={{ backgroundColor:T.dark, color:T.crimsonText, borderRadius:999, padding:"1px 7px", fontSize:11 }}>{stats.pendingBookings}</span>
//                   Pending
//                 </button>
//               )}
//               <button onClick={() => setShowLogout(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, backgroundColor:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", color:"#fff", fontSize:12, fontWeight:700 }}>
//                 <LogOut style={{ width:14, height:14 }}/> Logout
//               </button>
//             </div>
//           </div>
//         </header>

//         <div style={{ maxWidth:1280, margin:"0 auto", padding:"20px 24px" }}>

//           {/* ── PENDING ALERT BANNER ── */}
//           {pendingBookings.length > 0 && (
//             <div style={{ display:"flex", alignItems:"center", gap:12, backgroundColor:"#2D1800", border:"1px solid #92400E", borderRadius:10, padding:"12px 16px", marginBottom:18 }}>
//               <div style={{ width:36, height:36, borderRadius:8, backgroundColor:"#F59E0B22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
//                 <AlertCircle style={{ width:18, height:18, color:"#F59E0B" }}/>
//               </div>
//               <div style={{ flex:1 }}>
//                 <p style={{ fontSize:13, fontWeight:700, color:"#FDE68A", margin:0 }}>
//                   {pendingBookings.length} booking{pendingBookings.length > 1 ? "s" : ""} waiting for your response
//                 </p>
//                 <p style={{ fontSize:11, color:"#FCD34D", margin:0 }}>Respond quickly to improve your acceptance rate</p>
//               </div>
//               <button onClick={() => setTab("bookings")} style={{ padding:"6px 14px", borderRadius:8, backgroundColor:"#D97706", color:"#fff", border:"none", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
//                 View <ChevronRight style={{width:13,height:13}}/>
//               </button>
//             </div>
//           )}

//           {/* ── STAT CARDS ── */}
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
//             {[
//               { icon:Calendar,      color:"#3B82F6", label:"Total",     value:stats.totalBookings },
//               { icon:Clock,         color:"#F59E0B", label:"Pending",   value:stats.pendingBookings },
//               { icon:CheckCircle,   color:"#10B981", label:"Completed", value:stats.completedBookings },
//               { icon:IndianRupee,   color:"#A78BFA", label:"Revenue",   value:`₹${(stats.totalRevenue||0).toLocaleString("en-IN")}` },
//               { icon:Star,          color:T.crimson, label:"Rating",    value:(stats.averageRating||0).toFixed(1)+"★" },
//             ].map(({ icon:Icon, color, label, value }) => (
//               <div key={label} style={{ backgroundColor:T.darkSurface, borderRadius:10, padding:14, border:`1px solid ${T.darkBorder}`, borderTop:`2px solid ${color}`, transition:"transform 0.15s" }}
//                 onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
//                 onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
//                 <Icon style={{ width:16, height:16, color, marginBottom:8 }}/>
//                 <p style={{ fontSize:21, fontWeight:800, color:T.white, margin:0 }}>{value}</p>
//                 <p style={{ fontSize:11, color:T.gray500, margin:"2px 0 0" }}>{label}</p>
//               </div>
//             ))}
//           </div>

//           {/* ── TABS ── */}
//           <div style={{ backgroundColor:T.darkSurface, borderRadius:10, padding:5, marginBottom:18, display:"flex", gap:4, overflowX:"auto", border:`1px solid ${T.darkBorder}` }}>
//             {TABS.map(t => {
//               const active = tab === t.id;
//               return (
//                 <button key={t.id} onClick={() => setTab(t.id)} style={{ position:"relative", display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", whiteSpace:"nowrap", backgroundColor: active ? T.crimson : "transparent", color: active ? "#fff" : T.gray500, transition:"all 0.15s" }}>
//                   <t.icon style={{ width:14, height:14 }}/>
//                   {t.label}
//                   {t.badge > 0 && (
//                     <span style={{ width:17, height:17, borderRadius:"50%", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor: active ? "#fff" : T.crimson, color: active ? T.crimson : "#fff" }}>
//                       {t.badge}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>

//           {/* ── CONTENT ── */}
//           <div style={{ backgroundColor:T.darkSurface, borderRadius:12, padding:24, border:`1px solid ${T.darkBorder}` }}>

//             {/* OVERVIEW */}
//             {tab === "overview" && (
//               <div>
//                 <h2 style={{ fontSize:17, fontWeight:700, color:T.white, marginBottom:18, marginTop:0 }}>Overview</h2>
//                 {/* Pending bookings first */}
//                 {pendingBookings.length > 0 && (
//                   <div style={{ marginBottom:24 }}>
//                     <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
//                       <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:"#F59E0B", animation:"pulse 1s infinite" }}/>
//                       <p style={{ fontSize:13, fontWeight:800, color:"#FDE68A", margin:0 }}>Needs Action — {pendingBookings.length} Pending</p>
//                     </div>
//                     <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
//                       {pendingBookings.map(b => <BookingCard key={b.id} bk={b}/>)}
//                     </div>
//                   </div>
//                 )}
//                 {/* Recent */}
//                 <div>
//                   <p style={{ fontSize:13, fontWeight:700, color:T.gray600, marginBottom:10 }}>Recent Bookings</p>
//                   {bookings.filter(b => b.status !== "pending").length === 0 ? (
//                     <div style={{ textAlign:"center", padding:"48px 0", backgroundColor:T.darkSurface2, borderRadius:10 }}>
//                       <Calendar style={{ width:36, height:36, color:T.gray400, margin:"0 auto 10px" }}/>
//                       <p style={{ color:T.gray500, fontSize:13 }}>No bookings yet</p>
//                     </div>
//                   ) : (
//                     <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
//                       {bookings.filter(b => b.status !== "pending").slice(0,5).map(b => <BookingCard key={b.id} bk={b}/>)}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* BOOKINGS */}
//             {tab === "bookings" && (
//               <div>
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
//                   <h2 style={{ fontSize:17, fontWeight:700, color:T.white, margin:0 }}>All Bookings</h2>
//                   <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
//                     {["all","pending","approved","completed","rejected","rescheduled"].map(f => (
//                       <button key={f} onClick={() => setFilterStatus(f)}
//                         style={{ padding:"5px 12px", borderRadius:999, fontSize:11, fontWeight:700, border:`1px solid ${filterStatus===f ? T.crimson : T.darkBorder}`, cursor:"pointer", backgroundColor: filterStatus===f ? `${T.crimson}22` : "transparent", color: filterStatus===f ? T.crimsonText : T.gray500, textTransform:"capitalize", transition:"all 0.15s" }}>
//                         {f} {f === "all" ? `(${bookings.length})` : f === "pending" ? `(${stats.pendingBookings})` : ""}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//                 {filteredBookings.length === 0 ? (
//                   <div style={{ textAlign:"center", padding:"48px 0", backgroundColor:T.darkSurface2, borderRadius:10 }}>
//                     <Calendar style={{ width:36, height:36, color:T.gray400, margin:"0 auto 10px" }}/>
//                     <p style={{ color:T.gray500, fontSize:13 }}>No {filterStatus} bookings</p>
//                   </div>
//                 ) : (
//                   <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
//                     {filteredBookings.map(b => <BookingCard key={b.id} bk={b}/>)}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ANALYTICS */}
//             {tab === "analytics" && <AnalyticsTab/>}

//             {/* REVIEWS */}
//             {tab === "reviews" && (
//               <div>
//                 <h2 style={{ fontSize:17, fontWeight:700, color:T.white, marginBottom:16, marginTop:0 }}>Customer Reviews</h2>
//                 {reviews.length === 0 ? (
//                   <div style={{ textAlign:"center", padding:"48px 0", backgroundColor:T.darkSurface2, borderRadius:10 }}>
//                     <Star style={{ width:36, height:36, color:T.gray400, margin:"0 auto 10px" }}/>
//                     <p style={{ color:T.gray500, fontSize:13 }}>No reviews yet</p>
//                   </div>
//                 ) : (
//                   <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
//                     {reviews.map(r => (
//                       <div key={r.id} style={{ border:`1px solid ${T.darkBorder}`, borderRadius:10, padding:16, backgroundColor:T.darkSurface2 }}>
//                         <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
//                           <div>
//                             <p style={{ fontWeight:700, color:T.gray900, fontSize:14, margin:0 }}>{r.customer_name}</p>
//                             <p style={{ fontSize:11, color:T.gray500, margin:"2px 0 0" }}>{r.date || new Date(r.created_at).toLocaleDateString("en-IN")}</p>
//                           </div>
//                           <div style={{ display:"flex", gap:2 }}>
//                             {[...Array(5)].map((_,i) => (
//                               <Star key={i} style={{ width:14, height:14, color:i<r.rating?"#F59E0B":T.darkBorder2, fill:i<r.rating?"#F59E0B":"none" }}/>
//                             ))}
//                           </div>
//                         </div>
//                         <p style={{ fontSize:13, color:T.gray700, margin:0 }}>{r.comment}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* PROFILE */}
//             {tab === "profile" && vendorData && (
//               <div>
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
//                   <h2 style={{ fontSize:17, fontWeight:700, color:T.white, margin:0 }}>Business Profile</h2>
//                   <button onClick={handleEditOpen} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, backgroundColor:T.crimson, color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:700 }}>
//                     <Edit style={{width:14,height:14}}/> Edit Profile
//                   </button>
//                 </div>
//                 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
//                   {[
//                     ["Business Name", vendorData.business_name],
//                     ["Owner",         vendorData.owner_name],
//                     ["Email",         vendorData.email],
//                     ["Phone",         vendorData.phone],
//                     ["City",          vendorData.city],
//                     ["State",         vendorData.state],
//                     ["Pricing",       vendorData.pricing],
//                     ["Availability",  vendorData.availability || "—"],
//                     ["Website",       vendorData.website || "—"],
//                     ["Category",      vendorData.service_category],
//                   ].map(([label, val]) => (
//                     <div key={label} style={{ backgroundColor:T.darkSurface2, borderRadius:8, padding:12 }}>
//                       <p style={{ fontSize:10, color:T.gray500, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{label}</p>
//                       <p style={{ fontSize:13, color:T.gray900, fontWeight:600, margin:0 }}>{val}</p>
//                     </div>
//                   ))}
//                 </div>
//                 {vendorData.description && (
//                   <div style={{ marginTop:12, backgroundColor:T.darkSurface2, borderRadius:8, padding:12 }}>
//                     <p style={{ fontSize:10, color:T.gray500, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Description</p>
//                     <p style={{ fontSize:13, color:T.gray700, margin:0 }}>{vendorData.description}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ══ MODALS ════════════════════════════════════════════ */}

//       {/* Reject */}
//       {showReject && (
//         <Overlay onClose={() => setShowReject(false)}>
//           <ModalCard>
//             <ModalHead icon={XCircle} iconBg="#2A0A0A" iconColor={T.crimsonText}
//               title="Reject Booking"
//               sub={selectedBk ? `${selectedBk.service_name} — ${selectedBk.customer_name}` : ""}
//               onClose={() => setShowReject(false)}/>
//             <FormLabel required>Reason for rejection</FormLabel>
//             <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
//               placeholder="e.g. Date not available, fully booked…" style={{ ...textareaStyle, marginBottom:16 }}/>
//             <p style={{ fontSize:11, color:T.gray500, marginBottom:16 }}>This will be sent to the customer.</p>
//             <div style={{ display:"flex", gap:8 }}>
//               <button onClick={() => setShowReject(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
//               <button onClick={handleRejectConfirm} disabled={actionLoading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:T.crimson, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, opacity:actionLoading?0.5:1 }}>
//                 {actionLoading ? "Please wait…" : "Confirm Reject"}
//               </button>
//             </div>
//           </ModalCard>
//         </Overlay>
//       )}

//       {/* Reschedule */}
//       {showReschedule && (
//         <Overlay onClose={() => setShowReschedule(false)}>
//           <ModalCard>
//             <ModalHead icon={RefreshCw} iconBg="#0D2340" iconColor="#93C5FD"
//               title="Reschedule Booking"
//               sub={selectedBk ? `${selectedBk.service_name} — ${selectedBk.customer_name}` : ""}
//               onClose={() => setShowReschedule(false)}/>
//             <div style={{ backgroundColor:T.darkSurface2, borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:12, color:T.gray600 }}>
//               Current: {selectedBk?.date} at {selectedBk?.time}
//             </div>
//             <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
//               <div>
//                 <FormLabel required>New Date</FormLabel>
//                 <input type="date" value={rescheduleData.date} min={new Date().toISOString().split("T")[0]}
//                   onChange={e => setRescheduleData({...rescheduleData, date:e.target.value})} style={inputStyle}/>
//               </div>
//               <div>
//                 <FormLabel required>New Time</FormLabel>
//                 <input type="time" value={rescheduleData.time}
//                   onChange={e => setRescheduleData({...rescheduleData, time:e.target.value})} style={inputStyle}/>
//               </div>
//             </div>
//             <FormLabel>Reason (optional)</FormLabel>
//             <textarea rows={2} value={rescheduleData.reason}
//               onChange={e => setRescheduleData({...rescheduleData, reason:e.target.value})}
//               placeholder="Let customer know why…" style={{ ...textareaStyle, marginBottom:16 }}/>
//             <div style={{ display:"flex", gap:8 }}>
//               <button onClick={() => setShowReschedule(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
//               <button onClick={handleRescheduleConfirm} disabled={actionLoading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:"#2563EB", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, opacity:actionLoading?0.5:1 }}>
//                 {actionLoading ? "Sending…" : "Send Reschedule"}
//               </button>
//             </div>
//           </ModalCard>
//         </Overlay>
//       )}

//       {/* Notes */}
//       {showNotes && (
//         <Overlay onClose={() => setShowNotes(false)}>
//           <ModalCard>
//             <ModalHead icon={FileText} iconBg="#120D30" iconColor="#C4B5FD"
//               title="Service Notes"
//               sub={selectedBk ? `${selectedBk.service_name} — ${selectedBk.customer_name}` : ""}
//               onClose={() => setShowNotes(false)}/>
//             <FormLabel>Internal notes (only visible to you)</FormLabel>
//             <textarea rows={5} value={serviceNote} onChange={e => setServiceNote(e.target.value)}
//               placeholder="e.g. Bring extra equipment, customer prefers morning…" style={{ ...textareaStyle, marginBottom:16 }}/>
//             <div style={{ display:"flex", gap:8 }}>
//               <button onClick={() => setShowNotes(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
//               <button onClick={handleNotesSave} disabled={actionLoading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:"#7C3AED", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:actionLoading?0.5:1 }}>
//                 <Save style={{width:14,height:14}}/> Save Notes
//               </button>
//             </div>
//           </ModalCard>
//         </Overlay>
//       )}

//       {/* Edit Profile */}
//       {showEdit && (
//         <Overlay onClose={() => setShowEdit(false)}>
//           <div style={{ backgroundColor:T.darkSurface, borderRadius:14, maxWidth:700, width:"100%", maxHeight:"90vh", overflowY:"auto", padding:24, boxShadow:"0 24px 64px rgba(0,0,0,0.7)", border:`1px solid ${T.darkBorder2}` }}>
//             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
//               <h2 style={{ fontSize:16, fontWeight:700, color:T.white, margin:0 }}>Edit Business Profile</h2>
//               <button onClick={() => setShowEdit(false)} style={{ background:"none", border:"none", cursor:"pointer", color:T.gray500 }}><X style={{width:18,height:18}}/></button>
//             </div>
//             <form onSubmit={handleEditSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
//               <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
//                 {[{n:"businessName",l:"Business Name",t:"text",r:true},{n:"ownerName",l:"Owner Name",t:"text",r:true},{n:"phone",l:"Phone",t:"tel",r:true},{n:"pricing",l:"Pricing Range",t:"text",r:true}].map(({n,l,t,r}) => (
//                   <div key={n}>
//                     <FormLabel required={r}>{l}</FormLabel>
//                     <input name={n} type={t} required={r} value={editForm[n]||""} onChange={e => setEditForm({...editForm,[n]:e.target.value})} style={inputStyle}/>
//                   </div>
//                 ))}
//               </div>
//               <div><FormLabel required>Address</FormLabel><input name="address" required value={editForm.address||""} onChange={e => setEditForm({...editForm,address:e.target.value})} style={inputStyle}/></div>
//               <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
//                 {["city","state","zipCode"].map(n => (
//                   <div key={n}><FormLabel required>{n==="zipCode"?"PIN Code":n.charAt(0).toUpperCase()+n.slice(1)}</FormLabel><input name={n} required value={editForm[n]||""} onChange={e => setEditForm({...editForm,[n]:e.target.value})} style={inputStyle}/></div>
//                 ))}
//               </div>
//               <div><FormLabel required>Services Offered</FormLabel><textarea name="servicesOffered" required rows={2} value={editForm.servicesOffered||""} onChange={e => setEditForm({...editForm,servicesOffered:e.target.value})} style={textareaStyle}/></div>
//               <div><FormLabel required>Description</FormLabel><textarea name="description" required rows={3} value={editForm.description||""} onChange={e => setEditForm({...editForm,description:e.target.value})} style={textareaStyle}/></div>
//               <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
//                 <div><FormLabel>Availability</FormLabel><input name="availability" placeholder="Mon–Sat, 9AM–6PM" value={editForm.availability||""} onChange={e => setEditForm({...editForm,availability:e.target.value})} style={inputStyle}/></div>
//                 <div><FormLabel>Website</FormLabel><input name="website" type="url" value={editForm.website||""} onChange={e => setEditForm({...editForm,website:e.target.value})} style={inputStyle}/></div>
//               </div>
//               <div style={{ display:"flex", gap:10, paddingTop:12, borderTop:`1px solid ${T.darkBorder}` }}>
//                 <button type="button" onClick={() => setShowEdit(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
//                 <button type="submit" disabled={loading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:T.crimson, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:loading?0.5:1 }}>
//                   <Save style={{width:14,height:14}}/> {loading?"Saving…":"Save Changes"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </Overlay>
//       )}

//       {/* Logout */}
//       {showLogout && (
//         <Overlay onClose={() => setShowLogout(false)}>
//           <ModalCard maxW={340}>
//             <div style={{ textAlign:"center", marginBottom:18 }}>
//               <div style={{ width:50, height:50, borderRadius:12, backgroundColor:"#2A0A0A", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
//                 <LogOut style={{ width:22, height:22, color:T.crimsonText }}/>
//               </div>
//               <h3 style={{ fontSize:15, fontWeight:700, color:T.white, marginBottom:6, marginTop:0 }}>Confirm Logout</h3>
//               <p style={{ fontSize:12, color:T.gray500, margin:0 }}>You'll need to login again to access your dashboard.</p>
//             </div>
//             <div style={{ display:"flex", gap:8 }}>
//               <button onClick={() => setShowLogout(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
//               <button onClick={handleLogout} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:T.crimson, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
//                 <LogOut style={{width:14,height:14}}/> Logout
//               </button>
//             </div>
//           </ModalCard>
//         </Overlay>
//       )}
//     </>
//   );
// }
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  LayoutDashboard, Calendar, IndianRupee, Star, Settings,
  LogOut, Edit, Trash2, Plus, TrendingUp, Users, MessageSquare,
  Bell, X, Save, CheckCircle, XCircle, Clock, RefreshCw,
  FileText, ChevronDown, ChevronUp, AlertCircle, Check,
  Navigation, Phone, MapPin, Wifi, WifiOff, ChevronRight,
  Banknote, Award, Zap, BarChart2, Activity, Filter,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── THEME ────────────────────────────────────────────────────
const T = {
  crimson: "#C0392B", crimsonHover: "#A41B24",
  crimsonLight: "#3D1210", crimsonMuted: "#5A1A18", crimsonText: "#F1948A",
  dark: "#161616", darkSurface: "#1E1E1E", darkSurface2: "#242424",
  darkBorder: "#2E2E2E", darkBorder2: "#383838",
  inputBg: "#1A1A1A", inputBorder: "#3A3A3A",
  white: "#FFFFFF", offWhite: "#F0F0F0",
  gray400: "#777777", gray500: "#666666", gray600: "#AAAAAA",
  gray700: "#CCCCCC", gray900: "#EEEEEE",
};

const STATUS_CFG = {
  pending:     { bg: "#2D2200", text: "#FCD34D", dot: "#F59E0B", label: "Pending"     },
  pending_visit: { bg: "#2D2200", text: "#FCD34D", dot: "#F59E0B", label: "Pending Visit" },
  approved:    { bg: "#0A1F35", text: "#93C5FD", dot: "#3B82F6", label: "Approved"    },
  completed:   { bg: "#051E10", text: "#6EE7B7", dot: "#10B981", label: "Completed"   },
  rejected:    { bg: "#2A0A0A", text: "#F1948A", dot: "#C0392B", label: "Rejected"    },
  cancelled:   { bg: "#1A1A1A", text: "#9CA3AF", dot: "#6B7280", label: "Cancelled"   },
  rescheduled: { bg: "#120D30", text: "#C4B5FD", dot: "#7C3AED", label: "Rescheduled" },
};

const inputStyle = {
  width: "100%", padding: "9px 12px", fontSize: 13,
  border: `1px solid ${T.inputBorder}`, borderRadius: 8,
  backgroundColor: T.inputBg, color: T.gray900, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const textareaStyle = { ...inputStyle, resize: "none" };

const PIE_COLORS = ["#F59E0B","#3B82F6","#10B981","#C0392B","#7C3AED","#6B7280"];

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function VendorDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [vendorData, setVendorData]   = useState(null);
  const [bookings, setBookings]       = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [stats, setStats]             = useState({ totalBookings:0, pendingBookings:0, completedBookings:0, totalRevenue:0, averageRating:0, weeklyData:[], monthlyData:[], statusDistribution:[] });

  // Modals
  const [showReject, setShowReject]           = useState(false);
  const [showReschedule, setShowReschedule]   = useState(false);
  const [showNotes, setShowNotes]             = useState(false);
  const [showEdit, setShowEdit]               = useState(false);
  const [showLogout, setShowLogout]           = useState(false);
  const [showQuoteModal, setShowQuoteModal]   = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBk, setSelectedBk]          = useState(null);

  // Form states
  const [rejectReason, setRejectReason]       = useState("");
  const [rescheduleData, setRescheduleData]   = useState({ date:"", time:"", reason:"" });
  const [serviceNote, setServiceNote]         = useState("");
  const [editForm, setEditForm]               = useState({});
  const [quoteAmount, setQuoteAmount]         = useState("");
  const [quoteNote, setQuoteNote]             = useState("");
  const [paymentMethod, setPaymentMethod]     = useState(null); // 'cash' | 'online'

  // UI states
  const [expandedBk, setExpandedBk]   = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null); // { msg, type }
  const [filterStatus, setFilterStatus] = useState("all");
  const [chartView, setChartView]     = useState("weekly"); // weekly | monthly

  // Incoming booking alert (Zomato-style)
  const [incomingAlert, setIncomingAlert] = useState(null);
  const [alertTimer, setAlertTimer]       = useState(30);
  const alertIntervalRef = useRef(null);

  // WebSocket for real-time notifications
  const wsRef = useRef(null);

  // ── TOAST ─────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── WEBSOCKET ─────────────────────────────────────────────
  const connectWS = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
      const ws = new WebSocket(`${wsUrl}/tracking?role=vendor&token=${token}`);
      wsRef.current = ws;
      ws.onopen  = () => console.log("📡 WS connected");
      ws.onclose = () => setTimeout(connectWS, 4000);
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "new_booking") {
            triggerIncomingAlert(data.booking);
          }
        } catch {}
      };
    } catch {}
  }, []);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "vendor") { router.push("/vendorlogin"); return; }
    fetchAll();
    connectWS();
    return () => { wsRef.current?.close(); clearInterval(alertIntervalRef.current); };
  }, []);

  // ── FETCH ─────────────────────────────────────────────────
  const fetchAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/vendorlogin"); return; }
    try {
      const [bkRes, statsRes, profileRes, revRes] = await Promise.all([
        fetch("http://localhost:5000/api/vendor/bookings",{ headers:{ Authorization:`Bearer ${token}` } }),
        fetch("http://localhost:5000/api/vendor/stats",   { headers:{ Authorization:`Bearer ${token}` } }),
        fetch("http://localhost:5000/api/vendor/profile", { headers:{ Authorization:`Bearer ${token}` } }),
        fetch("http://localhost:5000/api/vendor/reviews", { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      if (bkRes.ok) {
        const data = await bkRes.json();
        console.log("📦 Bookings data:", data);
        setBookings(data);
      }
      if (statsRes.ok)   setStats(await statsRes.json());
      if (profileRes.ok) setVendorData(await profileRes.json());
      if (revRes.ok)     setReviews(await revRes.json());
    } catch (err) { console.error(err); }
  };

  // ── INCOMING ALERT (Zomato style) ─────────────────────────
  const triggerIncomingAlert = (booking) => {
    setIncomingAlert(booking);
    setAlertTimer(30);
    clearInterval(alertIntervalRef.current);
    alertIntervalRef.current = setInterval(() => {
      setAlertTimer((t) => {
        if (t <= 1) {
          clearInterval(alertIntervalRef.current);
          setIncomingAlert(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const dismissAlert = () => {
    clearInterval(alertIntervalRef.current);
    setIncomingAlert(null);
  };

  // ── BOOKING ACTIONS ────────────────────────────────────────
  const updateStatus = async (bookingId, status, extra = {}) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/vendor/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await res.json();
      if (data.conflict) {
        showToast(`⚠️ ${data.message}`, "error");
      } else if (data.success) {
        const msgs = { approved:"✅ Booking accepted!", rejected:"❌ Booking rejected.", completed:"🎉 Marked as completed!", rescheduled:"📅 Reschedule sent!" };
        showToast(msgs[status] || "Updated!", "success");
        fetchAll();
      } else {
        showToast(data.message || "Failed", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally  { setActionLoading(false); }
  };

  const handleApprove   = (bk) => updateStatus(bk.id, "approved");
  const handleComplete  = (bk) => updateStatus(bk.id, "completed");

  const handleRejectOpen = (bk) => { setSelectedBk(bk); setRejectReason(""); setShowReject(true); };
  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) { showToast("Please enter a reason", "error"); return; }
    updateStatus(selectedBk.id, "rejected", { vendor_response: rejectReason });
    setShowReject(false);
  };

  const handleRescheduleOpen = (bk) => {
    setSelectedBk(bk);
    setRescheduleData({ date: bk.date || "", time: "", reason: "" });
    setShowReschedule(true);
  };
  const handleRescheduleConfirm = () => {
    if (!rescheduleData.date || !rescheduleData.time) { showToast("Pick new date and time", "error"); return; }
    updateStatus(selectedBk.id, "rescheduled", { new_date: rescheduleData.date, new_time: rescheduleData.time, vendor_response: rescheduleData.reason });
    setShowReschedule(false);
  };

  const handleNotesOpen = (bk) => { setSelectedBk(bk); setServiceNote(bk.service_notes || ""); setShowNotes(true); };
  const handleNotesSave = async () => {
    if (!serviceNote.trim()) { showToast("Enter a note", "error"); return; }
    await updateStatus(selectedBk.id, selectedBk.status, { service_notes: serviceNote });
    setShowNotes(false);
  };

  // ── QUOTE HANDLER ──────────────────────────────────────────
  const handleSendQuote = async () => {
    if (!quoteAmount || isNaN(quoteAmount) || Number(quoteAmount) <= 0) {
      showToast("Enter a valid amount", "error"); return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/vendor/bookings/${selectedBk.id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quote_amount: Number(quoteAmount), quote_note: quoteNote }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("💰 Price quote sent to customer!");
        setShowQuoteModal(false); setQuoteAmount(""); setQuoteNote("");
        fetchAll();
      } else showToast(data.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setActionLoading(false); }
  };

  // ── FINAL PAYMENT HANDLER ──────────────────────────────────
  const handleFinalPayment = async () => {
    if (!paymentMethod) { showToast("Select payment method", "error"); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/vendor/bookings/${selectedBk.id}/final-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ final_payment_method: paymentMethod }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Payment recorded! Your earning: ₹${data.summary?.vendorPayout}`);
        setShowPaymentModal(false); setPaymentMethod(null);
        fetchAll();
      } else showToast(data.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setActionLoading(false); }
  };

  // ── PROFILE EDIT ───────────────────────────────────────────
  const handleEditOpen = () => {
    setEditForm({
      businessName: vendorData?.business_name || "", ownerName: vendorData?.owner_name || "",
      phone: vendorData?.phone || "", address: vendorData?.address || "",
      city: vendorData?.city || "", state: vendorData?.state || "",
      zipCode: vendorData?.zip_code || "", servicesOffered: vendorData?.services_offered || "",
      description: vendorData?.description || "", pricing: vendorData?.pricing || "",
      availability: vendorData?.availability || "", website: vendorData?.website || "",
      certification: vendorData?.certification || "",
    });
    setShowEdit(true);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const data = await api.vendor.updateProfile(editForm);
      if (data.success) { showToast("Profile updated!"); setTimeout(() => { setShowEdit(false); fetchAll(); }, 1500); }
      else showToast(data.message || "Failed", "error");
    } catch { showToast("Failed", "error"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); router.push("/vendorlogin"); };

  // ── HELPERS ────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const cfg = STATUS_CFG[status] || { bg:"#1A1A1A", text:"#9CA3AF", dot:"#6B7280", label: status };
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, backgroundColor:cfg.bg, color:cfg.text }}>
        <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor:cfg.dot, display:"inline-block" }}/>
        {cfg.label}
      </span>
    );
  };

  const filteredBookings = filterStatus === "all" ? bookings : bookings.filter(b => b.status === filterStatus);
  const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "pending_visit");
  const chartData = chartView === "weekly" ? (stats.weeklyData || []) : (stats.monthlyData || []);
  const xKey = chartView === "weekly" ? "day" : "month";

  // ── BOOKING CARD ───────────────────────────────────────────
  const BookingCard = ({ bk }) => {
    const isOpen = expandedBk === bk.id;
    const isPending = bk.status === "pending" || bk.status === "pending_visit";
    const isApproved = bk.status === "approved";

    return (
      <div style={{ border:`1px solid ${isPending ? "#3A2200" : T.darkBorder}`, borderRadius:12, overflow:"hidden", backgroundColor: isPending ? "#1C1400" : T.darkSurface2, transition:"all 0.2s" }}>
        {/* Card Header */}
        <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
          onClick={() => setExpandedBk(isOpen ? null : bk.id)}>
          {/* Status dot */}
          <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor: STATUS_CFG[bk.status]?.dot || "#666", flexShrink:0 }}/>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ fontSize:14, fontWeight:700, color:T.gray900 }}>{bk.service_name}</span>
              {getStatusBadge(bk.status)}
              {isPending && (
                <span style={{ fontSize:10, fontWeight:800, color:"#F59E0B", backgroundColor:"#2D1800", padding:"2px 8px", borderRadius:999, letterSpacing:"0.05em", animation:"pulse 1.5s infinite" }}>
                  NEW
                </span>
              )}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px", fontSize:12, color:T.gray600 }}>
              <span>👤 {bk.customer_name}</span>
              <span>📅 {bk.date}</span>
              <span>🕐 {bk.time}</span>
              <span style={{ color:"#10B981", fontWeight:700 }}>₹{Number(bk.amount||0).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display:"flex", gap:6, flexShrink:0 }} onClick={e => e.stopPropagation()}>
            {isPending && (
              <>
                <button disabled={actionLoading} onClick={() => handleApprove(bk)}
                  style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#059669", color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
                  <Check style={{width:12,height:12}}/> Accept
                </button>
                <button disabled={actionLoading} onClick={() => handleRejectOpen(bk)}
                  style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:T.crimson, color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
                  <X style={{width:12,height:12}}/> Reject
                </button>
              </>
            )}
            {isApproved && (
              <button disabled={actionLoading} onClick={() => handleComplete(bk)}
                style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#7C3AED", color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
                <CheckCircle style={{width:12,height:12}}/> Done
              </button>
            )}
            {(isPending || isApproved) && (
              <button disabled={actionLoading} onClick={() => handleRescheduleOpen(bk)}
                style={{ padding:"6px 10px", borderRadius:8, fontSize:12, fontWeight:700, border:`1px solid ${T.darkBorder2}`, cursor:"pointer", backgroundColor:"transparent", color:T.gray600, display:"flex", alignItems:"center", gap:4 }}>
                <RefreshCw style={{width:12,height:12}}/>
              </button>
            )}
            {isApproved && (
              <button onClick={() => router.push(`/vendordashboard/track/${bk.id}`)}
                style={{ padding:"6px 10px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#1E3A5F", color:"#93C5FD", display:"flex", alignItems:"center", gap:4 }}>
                <Navigation style={{width:12,height:12}}/> Track
              </button>
            )}
          </div>

          {isOpen ? <ChevronUp style={{width:16,height:16,color:T.gray400,flexShrink:0}}/> : <ChevronDown style={{width:16,height:16,color:T.gray400,flexShrink:0}}/>}
        </div>

        {/* Expanded Details */}
        {isOpen && (
          <div style={{ borderTop:`1px solid ${T.darkBorder}`, backgroundColor:T.darkSurface, padding:16 }}>
            {/* Customer Details Card */}
            <div style={{ backgroundColor:"#0D1F0D", border:"1px solid #1A3A1A", borderRadius:10, padding:14, marginBottom:14 }}>
              <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"#4ADE80", marginBottom:10 }}>
                👤 Customer Details
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                {[
                  ["Name",    bk.customer_name  || "—"],
                  ["Email",   bk.customer_email || "—"],
                  ["Phone",   bk.customer_phone || "—"],
                  ["Address", bk.customer_address || "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p style={{ fontSize:10, color:"#4ADE80", fontWeight:700, marginBottom:2 }}>{label}</p>
                    <p style={{ fontSize:13, color:T.gray900, fontWeight:500 }}>{val}</p>
                  </div>
                ))}
              </div>
              {bk.customer_phone && (
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  <a href={`tel:${bk.customer_phone}`}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, backgroundColor:T.crimson, color:"#fff", textDecoration:"none", fontSize:12, fontWeight:700 }}>
                    <Phone style={{width:13,height:13}}/> Call Customer
                  </a>
                  {bk.customer_address && (
                    <a href={`https://maps.google.com?q=${encodeURIComponent(bk.customer_address)}`} target="_blank" rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, backgroundColor:"#0D2340", color:"#93C5FD", textDecoration:"none", fontSize:12, fontWeight:700, border:"1px solid #1E3A5F" }}>
                      <MapPin style={{width:13,height:13}}/> Open in Maps
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Booking Meta */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
              {[
                ["Booking ID",  `#${bk.id}`],
                ["Payment",     bk.payment_method === "cod" ? "Cash on Visit" : "Online Paid"],
                ["Amount",      `₹${Number(bk.amount||0).toLocaleString("en-IN")}`],
                ["Created",     bk.created_at ? new Date(bk.created_at).toLocaleDateString("en-IN") : "—"],
                ...(bk.new_date ? [["Rescheduled To", `${bk.new_date} @ ${bk.new_time}`]] : []),
              ].map(([label, val]) => (
                <div key={label} style={{ backgroundColor:T.darkSurface2, borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:10, color:T.gray400, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{label}</p>
                  <p style={{ fontSize:13, color:T.gray900, fontWeight:600 }}>{val}</p>
                </div>
              ))}
            </div>

            {bk.message && (
              <div style={{ backgroundColor:"#1A1A2E", border:"1px solid #2E2E5E", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
                <p style={{ fontSize:10, color:"#C4B5FD", fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Customer Message</p>
                <p style={{ fontSize:13, color:T.gray700 }}>{bk.message}</p>
              </div>
            )}
            {bk.vendor_response && (
              <div style={{ backgroundColor:"#1A0E0E", border:`1px solid ${T.crimsonMuted}`, borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
                <p style={{ fontSize:10, color:T.crimsonText, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Your Response</p>
                <p style={{ fontSize:13, color:T.gray700 }}>{bk.vendor_response}</p>
              </div>
            )}
            {bk.service_notes && (
              <div style={{ backgroundColor:"#1A1A0E", border:"1px solid #3A3A1A", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
                <p style={{ fontSize:10, color:"#FDE047", fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Service Notes</p>
                <p style={{ fontSize:13, color:T.gray700 }}>{bk.service_notes}</p>
              </div>
            )}

            {/* Action Row */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingTop:10, borderTop:`1px solid ${T.darkBorder}` }}>
              {bk.status === "pending" && (
                <>
                  <button disabled={actionLoading} onClick={() => handleApprove(bk)}
                    style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#059669", color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
                    <CheckCircle style={{width:14,height:14}}/> Accept Booking
                  </button>
                  <button disabled={actionLoading} onClick={() => handleRejectOpen(bk)}
                    style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:T.crimson, color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
                    <XCircle style={{width:14,height:14}}/> Reject
                  </button>
                </>
              )}
              {(bk.status === "pending" || bk.status === "approved") && (
                <button disabled={actionLoading} onClick={() => handleRescheduleOpen(bk)}
                  style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:`1px solid #2563EB`, cursor:"pointer", backgroundColor:"#0D2340", color:"#93C5FD", display:"flex", alignItems:"center", gap:5 }}>
                  <RefreshCw style={{width:14,height:14}}/> Reschedule
                </button>
              )}
              {bk.status === "approved" && (
                <>
                  <button disabled={actionLoading} onClick={() => handleComplete(bk)}
                    style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#7C3AED", color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
                    <Check style={{width:14,height:14}}/> Mark Complete
                  </button>
                  <button onClick={() => router.push(`/vendordashboard/track/${bk.id}`)}
                    style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", backgroundColor:"#1E3A5F", color:"#93C5FD", display:"flex", alignItems:"center", gap:5 }}>
                    <Navigation style={{width:14,height:14}}/> Live Tracking
                  </button>
                </>
              )}

              {/* ── QUOTE BUTTONS ── */}
              {bk.status === "approved" && !bk.quote_status && (
                <button onClick={() => { setSelectedBk(bk); setShowQuoteModal(true); }}
                  style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700,
                           border:"none", cursor:"pointer", backgroundColor:"#D97706", color:"#fff",
                           display:"flex", alignItems:"center", gap:5 }}>
                  <IndianRupee style={{width:14,height:14}}/> Send Quote
                </button>
              )}

              {bk.quote_status === "pending_user" && (
                <div style={{ padding:"8px 12px", borderRadius:8, fontSize:12,
                              background:"#2D1800", border:"1px solid #92400E", color:"#FDE68A" }}>
                  ⏳ Waiting for customer to accept ₹{Number(bk.quote_amount).toLocaleString("en-IN")}
                </div>
              )}

              {bk.quote_status === "accepted" && (
                <div style={{ padding:"8px 12px", borderRadius:8, fontSize:12,
                              background:"#052E16", border:"1px solid #065F46", color:"#6EE7B7" }}>
                  ✅ Customer accepted ₹{Number(bk.final_amount).toLocaleString("en-IN")}
                </div>
              )}

              {/* ── PAYMENT BUTTONS ── */}
              {bk.status === "completed" && !bk.final_payment_status && (
                <button onClick={() => { setSelectedBk(bk); setShowPaymentModal(true); }}
                  style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700,
                           border:"none", cursor:"pointer", backgroundColor:"#059669", color:"#fff",
                           display:"flex", alignItems:"center", gap:5 }}>
                  <IndianRupee style={{width:14,height:14}}/> Record Payment
                </button>
              )}

              {bk.final_payment_status === "paid" && (
                <div style={{ padding:"8px 12px", borderRadius:8, fontSize:12,
                              background:"#052E16", border:"1px solid #065F46", color:"#6EE7B7" }}>
                  💵 Payment recorded ({bk.final_payment_method}) — Payout: ₹{Number(bk.vendor_payout).toLocaleString("en-IN")}
                </div>
              )}

              <button disabled={actionLoading} onClick={() => handleNotesOpen(bk)}
                style={{ padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:700, border:`1px solid ${T.darkBorder2}`, cursor:"pointer", backgroundColor:"transparent", color:T.gray600, display:"flex", alignItems:"center", gap:5, marginLeft:"auto" }}>
                <FileText style={{width:13,height:13}}/> {bk.service_notes ? "Edit Notes" : "Add Notes"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── MODAL WRAPPERS ─────────────────────────────────────────
  const Overlay = ({ children, onClose }) => (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:60, overflowY:"auto" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
  const ModalCard = ({ children, maxW = 440 }) => (
    <div style={{ backgroundColor:T.darkSurface, borderRadius:14, maxWidth:maxW, width:"100%", padding:24, boxShadow:"0 24px 64px rgba(0,0,0,0.7)", border:`1px solid ${T.darkBorder2}` }}>
      {children}
    </div>
  );
  const ModalHead = ({ icon:Icon, iconBg, iconColor, title, sub, onClose }) => (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
      <div style={{ width:42, height:42, borderRadius:10, backgroundColor:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon style={{ width:20, height:20, color:iconColor }}/>
      </div>
      <div style={{ flex:1 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:T.gray900, margin:0 }}>{title}</h3>
        {sub && <p style={{ fontSize:11, color:T.gray500, margin:0 }}>{sub}</p>}
      </div>
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.gray400 }}>
        <X style={{width:18,height:18}}/>
      </button>
    </div>
  );
  const FormLabel = ({ children, required }) => (
    <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.gray600, marginBottom:5 }}>
      {children}{required && <span style={{color:T.crimson}}> *</span>}
    </label>
  );

  // ── ANALYTICS TAB ──────────────────────────────────────────
  const AnalyticsTab = () => {
    const pieData = (stats.statusDistribution || []).map(d => ({
      name: STATUS_CFG[d.status]?.label || d.status,
      value: parseInt(d.count),
    }));

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:T.white, margin:0 }}>Analytics</h2>
          <div style={{ display:"flex", gap:6 }}>
            {["weekly","monthly"].map(v => (
              <button key={v} onClick={() => setChartView(v)}
                style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", backgroundColor: chartView===v ? T.crimson : T.darkSurface2, color: chartView===v ? "#fff" : T.gray600, textTransform:"capitalize" }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Mini stat row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Total",     value:stats.totalBookings,     color:"#3B82F6", icon:Calendar },
            { label:"Pending",   value:stats.pendingBookings,   color:"#F59E0B", icon:Clock },
            { label:"Revenue",   value:`₹${(stats.totalRevenue||0).toLocaleString("en-IN")}`, color:"#10B981", icon:IndianRupee },
            { label:"Rating",    value:(stats.averageRating||0).toFixed(1)+"★", color:T.crimson, icon:Star },
          ].map(({ label, value, color, icon:Icon }) => (
            <div key={label} style={{ backgroundColor:T.darkSurface2, borderRadius:10, padding:14, borderTop:`2px solid ${color}` }}>
              <Icon style={{ width:16, height:16, color, marginBottom:6 }}/>
              <p style={{ fontSize:20, fontWeight:800, color:T.white, margin:0 }}>{value}</p>
              <p style={{ fontSize:11, color:T.gray500, margin:"2px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Area Chart */}
        <div style={{ backgroundColor:T.darkSurface2, borderRadius:12, padding:20, marginBottom:16, border:`1px solid ${T.darkBorder}` }}>
          <p style={{ fontSize:13, fontWeight:700, color:T.gray700, marginBottom:14 }}>Bookings & Revenue</p>
          {chartData.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:T.gray500, fontSize:13 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.darkBorder}/>
                <XAxis dataKey={xKey} tick={{ fill:T.gray500, fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:T.gray500, fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{ backgroundColor:T.darkSurface, border:`1px solid ${T.darkBorder2}`, borderRadius:8, fontSize:12 }}
                  labelStyle={{ color:T.gray700, fontWeight:700 }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#3B82F6" fill="url(#colorBk)" strokeWidth={2} dot={{ fill:"#3B82F6", r:3 }} name="Bookings"/>
                <Area type="monotone" dataKey="revenue"  stroke="#10B981" fill="url(#colorRev)" strokeWidth={2} dot={{ fill:"#10B981", r:3 }} name="Revenue (₹)"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar + Pie row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ backgroundColor:T.darkSurface2, borderRadius:12, padding:20, border:`1px solid ${T.darkBorder}` }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.gray700, marginBottom:14 }}>Booking Volume</p>
            {chartData.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:T.gray500, fontSize:13 }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.darkBorder}/>
                  <XAxis dataKey={xKey} tick={{ fill:T.gray500, fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:T.gray500, fontSize:10 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ backgroundColor:T.darkSurface, border:`1px solid ${T.darkBorder2}`, borderRadius:8, fontSize:11 }}/>
                  <Bar dataKey="bookings" fill={T.crimson} radius={[4,4,0,0]} name="Bookings"/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ backgroundColor:T.darkSurface2, borderRadius:12, padding:20, border:`1px solid ${T.darkBorder}` }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.gray700, marginBottom:14 }}>Status Distribution</p>
            {pieData.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:T.gray500, fontSize:13 }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:T.darkSurface, border:`1px solid ${T.darkBorder2}`, borderRadius:8, fontSize:11 }}/>
                  <Legend wrapperStyle={{ fontSize:11, color:T.gray600 }}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── TABS CONFIG ────────────────────────────────────────────
  const TABS = [
    { id:"overview",  label:"Overview",  icon:LayoutDashboard },
    { id:"bookings",  label:"Bookings",  icon:Calendar,    badge: stats.pendingBookings },
    { id:"analytics", label:"Analytics", icon:BarChart2 },
    { id:"reviews",   label:"Reviews",   icon:Star },
    { id:"profile",   label:"Profile",   icon:Users },
  ];

  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideDown { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes ringPulse { 0%{box-shadow:0 0 0 0 rgba(192,57,43,0.7)} 70%{box-shadow:0 0 0 20px rgba(192,57,43,0)} 100%{box-shadow:0 0 0 0 rgba(192,57,43,0)} }
        .incoming-card { animation: slideDown 0.4s ease; }
        .ring-btn { animation: ringPulse 1s infinite; }
      `}</style>

      <div style={{ minHeight:"100vh", marginTop:80, backgroundColor:T.dark, fontFamily:"system-ui,sans-serif" }}>

        {/* ── TOAST ── */}
        {toast && (
          <div style={{ position:"fixed", top:20, right:20, zIndex:100, display:"flex", alignItems:"center", gap:8, padding:"11px 18px", borderRadius:10, boxShadow:"0 8px 30px rgba(0,0,0,0.6)", fontSize:13, fontWeight:700, color:"#fff", backgroundColor: toast.type==="success" ? "#059669" : T.crimson, maxWidth:360 }}>
            {toast.type==="success" ? <CheckCircle style={{width:16,height:16}}/> : <AlertCircle style={{width:16,height:16}}/>}
            {toast.msg}
            <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", marginLeft:4 }}><X style={{width:15,height:15}}/></button>
          </div>
        )}

        {/* ── ZOMATO-STYLE INCOMING BOOKING ALERT ── */}
        {incomingAlert && (
          <div className="incoming-card" style={{ position:"fixed", top:90, left:"50%", transform:"translateX(-50%)", zIndex:99, width:"min(440px,calc(100vw - 32px))", backgroundColor:"#0D0D0D", border:`2px solid ${T.crimson}`, borderRadius:16, padding:20, boxShadow:"0 20px 60px rgba(192,57,43,0.4)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div className="ring-btn" style={{ width:52, height:52, borderRadius:"50%", backgroundColor:T.crimson, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Bell style={{ width:24, height:24, color:"#fff" }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <p style={{ fontSize:15, fontWeight:800, color:"#fff", margin:0 }}>🔔 New Booking Request!</p>
                  <span style={{ fontSize:20, fontWeight:800, color:T.crimson }}>{alertTimer}s</span>
                </div>
                <p style={{ fontSize:13, color:T.gray700, marginBottom:8 }}>
                  <strong style={{color:"#fff"}}>{incomingAlert.customer_name}</strong> wants <strong style={{color:"#fff"}}>{incomingAlert.service_name}</strong><br/>
                  📅 {incomingAlert.date} · 🕐 {incomingAlert.time}
                </p>
                <div style={{ height:3, backgroundColor:"#2A2A2A", borderRadius:4, overflow:"hidden", marginBottom:12 }}>
                  <div style={{ height:"100%", backgroundColor:T.crimson, width:`${(alertTimer/30)*100}%`, transition:"width 1s linear", borderRadius:4 }}/>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { updateStatus(incomingAlert.id, "approved"); dismissAlert(); }}
                    className="ring-btn"
                    style={{ flex:1, padding:"10px 0", borderRadius:10, fontWeight:800, fontSize:13, border:"none", cursor:"pointer", backgroundColor:"#059669", color:"#fff" }}>
                    ✅ Accept
                  </button>
                  <button onClick={() => { setSelectedBk(incomingAlert); setRejectReason(""); setShowReject(true); dismissAlert(); }}
                    style={{ flex:1, padding:"10px 0", borderRadius:10, fontWeight:800, fontSize:13, border:"none", cursor:"pointer", backgroundColor:T.crimson, color:"#fff" }}>
                    ❌ Reject
                  </button>
                  <button onClick={dismissAlert}
                    style={{ padding:"10px 14px", borderRadius:10, fontWeight:700, fontSize:12, border:`1px solid ${T.darkBorder2}`, cursor:"pointer", backgroundColor:"transparent", color:T.gray600 }}>
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <header style={{ backgroundColor:T.crimson, borderBottom:`1px solid ${T.crimsonHover}`, boxShadow:"0 2px 12px rgba(0,0,0,0.5)", position:"sticky", top:0, zIndex:40 }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Zap style={{ width:18, height:18, color:"#fff" }}/>
              </div>
              <div>
                <h1 style={{ fontSize:17, fontWeight:800, color:"#fff", margin:0 }}>{vendorData?.business_name || "Vendor Dashboard"}</h1>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.65)", margin:0 }}>{vendorData?.service_category || "Service Provider"}</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {stats.pendingBookings > 0 && (
                <button onClick={() => setTab("bookings")} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, backgroundColor:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", color:"#fff", fontSize:12, fontWeight:700 }}>
                  <Bell style={{ width:14, height:14 }}/>
                  <span style={{ backgroundColor:T.dark, color:T.crimsonText, borderRadius:999, padding:"1px 7px", fontSize:11 }}>{stats.pendingBookings}</span>
                  Pending
                </button>
              )}
              <button onClick={() => setShowLogout(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, backgroundColor:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", color:"#fff", fontSize:12, fontWeight:700 }}>
                <LogOut style={{ width:14, height:14 }}/> Logout
              </button>
            </div>
          </div>
        </header>

        <div style={{ maxWidth:1280, margin:"0 auto", padding:"20px 24px" }}>

          {/* ── PENDING ALERT BANNER ── */}
          {pendingBookings.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:12, backgroundColor:"#2D1800", border:"1px solid #92400E", borderRadius:10, padding:"12px 16px", marginBottom:18 }}>
              <div style={{ width:36, height:36, borderRadius:8, backgroundColor:"#F59E0B22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <AlertCircle style={{ width:18, height:18, color:"#F59E0B" }}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#FDE68A", margin:0 }}>
                  {pendingBookings.length} booking{pendingBookings.length > 1 ? "s" : ""} waiting for your response
                </p>
                <p style={{ fontSize:11, color:"#FCD34D", margin:0 }}>Respond quickly to improve your acceptance rate</p>
              </div>
              <button onClick={() => setTab("bookings")} style={{ padding:"6px 14px", borderRadius:8, backgroundColor:"#D97706", color:"#fff", border:"none", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                View <ChevronRight style={{width:13,height:13}}/>
              </button>
            </div>
          )}

          {/* ── STAT CARDS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
            {[
              { icon:Calendar,      color:"#3B82F6", label:"Total",     value:stats.totalBookings },
              { icon:Clock,         color:"#F59E0B", label:"Pending",   value:stats.pendingBookings },
              { icon:CheckCircle,   color:"#10B981", label:"Completed", value:stats.completedBookings },
              { icon:IndianRupee,   color:"#A78BFA", label:"Revenue",   value:`₹${(stats.totalRevenue||0).toLocaleString("en-IN")}` },
              { icon:Star,          color:T.crimson, label:"Rating",    value:(stats.averageRating||0).toFixed(1)+"★" },
            ].map(({ icon:Icon, color, label, value }) => (
              <div key={label} style={{ backgroundColor:T.darkSurface, borderRadius:10, padding:14, border:`1px solid ${T.darkBorder}`, borderTop:`2px solid ${color}`, transition:"transform 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                <Icon style={{ width:16, height:16, color, marginBottom:8 }}/>
                <p style={{ fontSize:21, fontWeight:800, color:T.white, margin:0 }}>{value}</p>
                <p style={{ fontSize:11, color:T.gray500, margin:"2px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── TABS ── */}
          <div style={{ backgroundColor:T.darkSurface, borderRadius:10, padding:5, marginBottom:18, display:"flex", gap:4, overflowX:"auto", border:`1px solid ${T.darkBorder}` }}>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ position:"relative", display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", whiteSpace:"nowrap", backgroundColor: active ? T.crimson : "transparent", color: active ? "#fff" : T.gray500, transition:"all 0.15s" }}>
                  <t.icon style={{ width:14, height:14 }}/>
                  {t.label}
                  {t.badge > 0 && (
                    <span style={{ width:17, height:17, borderRadius:"50%", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor: active ? "#fff" : T.crimson, color: active ? T.crimson : "#fff" }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── CONTENT ── */}
          <div style={{ backgroundColor:T.darkSurface, borderRadius:12, padding:24, border:`1px solid ${T.darkBorder}` }}>

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div>
                <h2 style={{ fontSize:17, fontWeight:700, color:T.white, marginBottom:18, marginTop:0 }}>Overview</h2>
                {pendingBookings.length > 0 && (
                  <div style={{ marginBottom:24 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:"#F59E0B", animation:"pulse 1s infinite" }}/>
                      <p style={{ fontSize:13, fontWeight:800, color:"#FDE68A", margin:0 }}>Needs Action — {pendingBookings.length} Pending</p>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {pendingBookings.map(b => <BookingCard key={b.id} bk={b}/>)}
                    </div>
                  </div>
                )}
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:T.gray600, marginBottom:10 }}>Recent Bookings</p>
                  {bookings.filter(b => b.status !== "pending").length === 0 ? (
                    <div style={{ textAlign:"center", padding:"48px 0", backgroundColor:T.darkSurface2, borderRadius:10 }}>
                      <Calendar style={{ width:36, height:36, color:T.gray400, margin:"0 auto 10px" }}/>
                      <p style={{ color:T.gray500, fontSize:13 }}>No bookings yet</p>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {bookings.filter(b => b.status !== "pending").slice(0,5).map(b => <BookingCard key={b.id} bk={b}/>)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOOKINGS */}
            {tab === "bookings" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                  <h2 style={{ fontSize:17, fontWeight:700, color:T.white, margin:0 }}>All Bookings</h2>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {["all","pending","approved","completed","rejected","rescheduled"].map(f => (
                      <button key={f} onClick={() => setFilterStatus(f)}
                        style={{ padding:"5px 12px", borderRadius:999, fontSize:11, fontWeight:700, border:`1px solid ${filterStatus===f ? T.crimson : T.darkBorder}`, cursor:"pointer", backgroundColor: filterStatus===f ? `${T.crimson}22` : "transparent", color: filterStatus===f ? T.crimsonText : T.gray500, textTransform:"capitalize", transition:"all 0.15s" }}>
                        {f} {f === "all" ? `(${bookings.length})` : f === "pending" ? `(${stats.pendingBookings})` : ""}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredBookings.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"48px 0", backgroundColor:T.darkSurface2, borderRadius:10 }}>
                    <Calendar style={{ width:36, height:36, color:T.gray400, margin:"0 auto 10px" }}/>
                    <p style={{ color:T.gray500, fontSize:13 }}>No {filterStatus} bookings</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {filteredBookings.map(b => <BookingCard key={b.id} bk={b}/>)}
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS */}
            {tab === "analytics" && <AnalyticsTab/>}

            {/* REVIEWS */}
            {tab === "reviews" && (
              <div>
                <h2 style={{ fontSize:17, fontWeight:700, color:T.white, marginBottom:16, marginTop:0 }}>Customer Reviews</h2>
                {reviews.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"48px 0", backgroundColor:T.darkSurface2, borderRadius:10 }}>
                    <Star style={{ width:36, height:36, color:T.gray400, margin:"0 auto 10px" }}/>
                    <p style={{ color:T.gray500, fontSize:13 }}>No reviews yet</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ border:`1px solid ${T.darkBorder}`, borderRadius:10, padding:16, backgroundColor:T.darkSurface2 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                          <div>
                            <p style={{ fontWeight:700, color:T.gray900, fontSize:14, margin:0 }}>{r.customer_name}</p>
                            <p style={{ fontSize:11, color:T.gray500, margin:"2px 0 0" }}>{r.date || new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                          </div>
                          <div style={{ display:"flex", gap:2 }}>
                            {[...Array(5)].map((_,i) => (
                              <Star key={i} style={{ width:14, height:14, color:i<r.rating?"#F59E0B":T.darkBorder2, fill:i<r.rating?"#F59E0B":"none" }}/>
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize:13, color:T.gray700, margin:0 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {tab === "profile" && vendorData && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <h2 style={{ fontSize:17, fontWeight:700, color:T.white, margin:0 }}>Business Profile</h2>
                  <button onClick={handleEditOpen} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, backgroundColor:T.crimson, color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:700 }}>
                    <Edit style={{width:14,height:14}}/> Edit Profile
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {[
                    ["Business Name", vendorData.business_name],
                    ["Owner",         vendorData.owner_name],
                    ["Email",         vendorData.email],
                    ["Phone",         vendorData.phone],
                    ["City",          vendorData.city],
                    ["State",         vendorData.state],
                    ["Pricing",       vendorData.pricing],
                    ["Availability",  vendorData.availability || "—"],
                    ["Website",       vendorData.website || "—"],
                    ["Category",      vendorData.service_category],
                  ].map(([label, val]) => (
                    <div key={label} style={{ backgroundColor:T.darkSurface2, borderRadius:8, padding:12 }}>
                      <p style={{ fontSize:10, color:T.gray500, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{label}</p>
                      <p style={{ fontSize:13, color:T.gray900, fontWeight:600, margin:0 }}>{val}</p>
                    </div>
                  ))}
                </div>
                {vendorData.description && (
                  <div style={{ marginTop:12, backgroundColor:T.darkSurface2, borderRadius:8, padding:12 }}>
                    <p style={{ fontSize:10, color:T.gray500, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Description</p>
                    <p style={{ fontSize:13, color:T.gray700, margin:0 }}>{vendorData.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ MODALS ════════════════════════════════════════════ */}

      {/* Reject */}
      {showReject && (
        <Overlay onClose={() => setShowReject(false)}>
          <ModalCard>
            <ModalHead icon={XCircle} iconBg="#2A0A0A" iconColor={T.crimsonText}
              title="Reject Booking"
              sub={selectedBk ? `${selectedBk.service_name} — ${selectedBk.customer_name}` : ""}
              onClose={() => setShowReject(false)}/>
            <FormLabel required>Reason for rejection</FormLabel>
            <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Date not available, fully booked…" style={{ ...textareaStyle, marginBottom:16 }}/>
            <p style={{ fontSize:11, color:T.gray500, marginBottom:16 }}>This will be sent to the customer.</p>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowReject(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
              <button onClick={handleRejectConfirm} disabled={actionLoading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:T.crimson, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, opacity:actionLoading?0.5:1 }}>
                {actionLoading ? "Please wait…" : "Confirm Reject"}
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* Reschedule */}
      {showReschedule && (
        <Overlay onClose={() => setShowReschedule(false)}>
          <ModalCard>
            <ModalHead icon={RefreshCw} iconBg="#0D2340" iconColor="#93C5FD"
              title="Reschedule Booking"
              sub={selectedBk ? `${selectedBk.service_name} — ${selectedBk.customer_name}` : ""}
              onClose={() => setShowReschedule(false)}/>
            <div style={{ backgroundColor:T.darkSurface2, borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:12, color:T.gray600 }}>
              Current: {selectedBk?.date} at {selectedBk?.time}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <FormLabel required>New Date</FormLabel>
                <input type="date" value={rescheduleData.date} min={new Date().toISOString().split("T")[0]}
                  onChange={e => setRescheduleData({...rescheduleData, date:e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <FormLabel required>New Time</FormLabel>
                <input type="time" value={rescheduleData.time}
                  onChange={e => setRescheduleData({...rescheduleData, time:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <FormLabel>Reason (optional)</FormLabel>
            <textarea rows={2} value={rescheduleData.reason}
              onChange={e => setRescheduleData({...rescheduleData, reason:e.target.value})}
              placeholder="Let customer know why…" style={{ ...textareaStyle, marginBottom:16 }}/>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowReschedule(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
              <button onClick={handleRescheduleConfirm} disabled={actionLoading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:"#2563EB", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, opacity:actionLoading?0.5:1 }}>
                {actionLoading ? "Sending…" : "Send Reschedule"}
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* Notes */}
      {showNotes && (
        <Overlay onClose={() => setShowNotes(false)}>
          <ModalCard>
            <ModalHead icon={FileText} iconBg="#120D30" iconColor="#C4B5FD"
              title="Service Notes"
              sub={selectedBk ? `${selectedBk.service_name} — ${selectedBk.customer_name}` : ""}
              onClose={() => setShowNotes(false)}/>
            <FormLabel>Internal notes (only visible to you)</FormLabel>
            <textarea rows={5} value={serviceNote} onChange={e => setServiceNote(e.target.value)}
              placeholder="e.g. Bring extra equipment, customer prefers morning…" style={{ ...textareaStyle, marginBottom:16 }}/>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowNotes(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
              <button onClick={handleNotesSave} disabled={actionLoading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:"#7C3AED", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:actionLoading?0.5:1 }}>
                <Save style={{width:14,height:14}}/> Save Notes
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* Edit Profile */}
      {showEdit && (
        <Overlay onClose={() => setShowEdit(false)}>
          <div style={{ backgroundColor:T.darkSurface, borderRadius:14, maxWidth:700, width:"100%", maxHeight:"90vh", overflowY:"auto", padding:24, boxShadow:"0 24px 64px rgba(0,0,0,0.7)", border:`1px solid ${T.darkBorder2}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:T.white, margin:0 }}>Edit Business Profile</h2>
              <button onClick={() => setShowEdit(false)} style={{ background:"none", border:"none", cursor:"pointer", color:T.gray500 }}><X style={{width:18,height:18}}/></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[{n:"businessName",l:"Business Name",t:"text",r:true},{n:"ownerName",l:"Owner Name",t:"text",r:true},{n:"phone",l:"Phone",t:"tel",r:true},{n:"pricing",l:"Pricing Range",t:"text",r:true}].map(({n,l,t,r}) => (
                  <div key={n}>
                    <FormLabel required={r}>{l}</FormLabel>
                    <input name={n} type={t} required={r} value={editForm[n]||""} onChange={e => setEditForm({...editForm,[n]:e.target.value})} style={inputStyle}/>
                  </div>
                ))}
              </div>
              <div><FormLabel required>Address</FormLabel><input name="address" required value={editForm.address||""} onChange={e => setEditForm({...editForm,address:e.target.value})} style={inputStyle}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                {["city","state","zipCode"].map(n => (
                  <div key={n}><FormLabel required>{n==="zipCode"?"PIN Code":n.charAt(0).toUpperCase()+n.slice(1)}</FormLabel><input name={n} required value={editForm[n]||""} onChange={e => setEditForm({...editForm,[n]:e.target.value})} style={inputStyle}/></div>
                ))}
              </div>
              <div><FormLabel required>Services Offered</FormLabel><textarea name="servicesOffered" required rows={2} value={editForm.servicesOffered||""} onChange={e => setEditForm({...editForm,servicesOffered:e.target.value})} style={textareaStyle}/></div>
              <div><FormLabel required>Description</FormLabel><textarea name="description" required rows={3} value={editForm.description||""} onChange={e => setEditForm({...editForm,description:e.target.value})} style={textareaStyle}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><FormLabel>Availability</FormLabel><input name="availability" placeholder="Mon–Sat, 9AM–6PM" value={editForm.availability||""} onChange={e => setEditForm({...editForm,availability:e.target.value})} style={inputStyle}/></div>
                <div><FormLabel>Website</FormLabel><input name="website" type="url" value={editForm.website||""} onChange={e => setEditForm({...editForm,website:e.target.value})} style={inputStyle}/></div>
              </div>
              <div style={{ display:"flex", gap:10, paddingTop:12, borderTop:`1px solid ${T.darkBorder}` }}>
                <button type="button" onClick={() => setShowEdit(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:T.crimson, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:loading?0.5:1 }}>
                  <Save style={{width:14,height:14}}/> {loading?"Saving…":"Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* Logout */}
      {showLogout && (
        <Overlay onClose={() => setShowLogout(false)}>
          <ModalCard maxW={340}>
            <div style={{ textAlign:"center", marginBottom:18 }}>
              <div style={{ width:50, height:50, borderRadius:12, backgroundColor:"#2A0A0A", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                <LogOut style={{ width:22, height:22, color:T.crimsonText }}/>
              </div>
              <h3 style={{ fontSize:15, fontWeight:700, color:T.white, marginBottom:6, marginTop:0 }}>Confirm Logout</h3>
              <p style={{ fontSize:12, color:T.gray500, margin:0 }}>You'll need to login again to access your dashboard.</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowLogout(false)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, backgroundColor:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>Cancel</button>
              <button onClick={handleLogout} style={{ flex:1, padding:12, borderRadius:8, border:"none", backgroundColor:T.crimson, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <LogOut style={{width:14,height:14}}/> Logout
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* ── QUOTE MODAL ── */}
      {showQuoteModal && selectedBk && (
        <Overlay onClose={() => setShowQuoteModal(false)}>
          <ModalCard>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ width:42, height:42, borderRadius:10, backgroundColor:"#2D1800", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:20 }}>💰</span>
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:T.gray900, margin:0 }}>Send Price Quote</h3>
                <p style={{ fontSize:11, color:T.gray500, margin:0 }}>{selectedBk.service_name} — {selectedBk.customer_name}</p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:T.gray600, padding:4 }}>✕</button>
            </div>

            <div style={{ backgroundColor:"#1C1400", border:"1px solid #3A2200", borderRadius:10, padding:"10px 14px", marginBottom:16 }}>
              <p style={{ fontSize:11, color:"#FDE68A", margin:0 }}>ℹ️ After assessing the work, send your final price to the customer. They must accept before you start.</p>
            </div>

            <div style={{ marginBottom:14 }}>
              <FormLabel required>Your Price (₹)</FormLabel>
              <input type="number" min="1" value={quoteAmount} onChange={e => setQuoteAmount(e.target.value)}
                placeholder="e.g. 1500" style={{ ...inputStyle, fontSize:20, fontWeight:700 }}/>
              {selectedBk.advance_amount && (
                <p style={{ fontSize:11, color:"#4ADE80", marginTop:4 }}>
                  ✓ Advance of ₹{Number(selectedBk.advance_amount).toLocaleString("en-IN")} already paid by customer
                </p>
              )}
            </div>

            <div style={{ marginBottom:18 }}>
              <FormLabel>Note (optional)</FormLabel>
              <textarea rows={2} value={quoteNote} onChange={e => setQuoteNote(e.target.value)}
                placeholder="e.g. Includes labour + materials"
                style={textareaStyle}/>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowQuoteModal(false)}
                style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, background:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>
                Cancel
              </button>
              <button onClick={handleSendQuote} disabled={actionLoading || !quoteAmount}
                style={{ flex:1, padding:12, borderRadius:8, border:"none", background:"#D97706", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:13, opacity:(!quoteAmount||actionLoading)?0.5:1 }}>
                {actionLoading ? "Sending..." : `💰 Send ₹${quoteAmount ? Number(quoteAmount).toLocaleString("en-IN") : "—"}`}
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPaymentModal && selectedBk && (() => {
        const totalAmount = Number(selectedBk.final_amount || selectedBk.quote_amount || selectedBk.amount || 0);
        const advance     = Number(selectedBk.advance_amount || 99);
        const remaining   = Math.max(0, totalAmount - advance);
        const commission  = Number(selectedBk.commission_pct || 10);
        const vendorEarn  = totalAmount - Math.round((totalAmount * commission) / 100);
        return (
          <Overlay onClose={() => setShowPaymentModal(false)}>
            <ModalCard>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:42, height:42, borderRadius:10, backgroundColor:"#052E16", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:20 }}>💵</span>
                </div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:T.gray900, margin:0 }}>Record Final Payment</h3>
                  <p style={{ fontSize:11, color:T.gray500, margin:0 }}>{selectedBk.service_name} — {selectedBk.customer_name}</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:T.gray600 }}>✕</button>
              </div>

              {/* Breakdown */}
              <div style={{ backgroundColor:"#0D1F0D", border:"1px solid #1A3A1A", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
                <p style={{ fontSize:10, color:"#4ADE80", fontWeight:800, textTransform:"uppercase", marginBottom:8 }}>Payment Breakdown</p>
                {[
                  ["Total Agreed",   `₹${totalAmount.toLocaleString("en-IN")}`,   "#fff"],
                  ["Advance Paid",   `₹${advance.toLocaleString("en-IN")}`,       "#4ADE80"],
                  ["Remaining",      `₹${remaining.toLocaleString("en-IN")}`,     "#FCD34D"],
                  [`Commission (${commission}%)`, `₹${Math.round(totalAmount*commission/100).toLocaleString("en-IN")}`, "#F1948A"],
                  ["Your Earnings",  `₹${vendorEarn.toLocaleString("en-IN")}`,    "#93C5FD"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#aaa" }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color }}>{val}</span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize:12, color:T.gray600, marginBottom:12 }}>How did customer pay the remaining ₹{remaining.toLocaleString("en-IN")}?</p>

              {/* Payment Method Selection */}
              <div style={{ display:"flex", gap:10, marginBottom:18 }}>
                {[
                  { key:"cash",   label:"💵 Cash",  desc:"Received hand to hand" },
                  { key:"online", label:"💳 Online", desc:"UPI / Card / Transfer" },
                ].map(({ key, label, desc }) => (
                  <div key={key} onClick={() => setPaymentMethod(key)}
                    style={{ flex:1, padding:"12px 14px", borderRadius:10, cursor:"pointer", border:`2px solid ${paymentMethod===key?"#059669":"#2E2E2E"}`, backgroundColor:paymentMethod===key?"#052E16":"#1A1A1A", transition:"all 0.15s" }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"#fff", margin:"0 0 2px" }}>{label}</p>
                    <p style={{ fontSize:11, color:"#666", margin:0 }}>{desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setShowPaymentModal(false)}
                  style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${T.darkBorder2}`, background:"transparent", color:T.gray600, cursor:"pointer", fontWeight:700, fontSize:13 }}>
                  Cancel
                </button>
                <button onClick={handleFinalPayment} disabled={!paymentMethod || actionLoading}
                  style={{ flex:2, padding:12, borderRadius:8, border:"none", background:"#059669", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:13, opacity:(!paymentMethod||actionLoading)?0.5:1 }}>
                  {actionLoading ? "Recording..." : "✅ Confirm Payment"}
                </button>
              </div>
            </ModalCard>
          </Overlay>
        );
      })()}
    </>
  );
}