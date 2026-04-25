"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Building2, Phone, MapPin, Calendar,
  Trash2, RefreshCw, Loader2, AlertCircle, Users2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ type, message, onClose }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div
      className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-xs"
      style={{
        backgroundColor: isSuccess ? "#0a2a0a" : "#2a0000",
        border: `1px solid ${isSuccess ? "#22c55e" : "#CC0000"}`,
        color: isSuccess ? "#22c55e" : "#ff6b6b",
      }}
    >
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ lead, onConfirm, onCancel }) {
  if (!lead) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "#CC0000" }} />
        <h3 className="text-base font-bold text-white text-center mb-1">Delete Lead?</h3>
        <p className="text-xs text-center mb-5" style={{ color: "#999999" }}>
          Remove <span className="font-semibold text-white">{lead.name}</span> ({lead.society_name})? This can't be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#2a2a2a", color: "#cccccc" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#CC0000", color: "#fff" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminSocietyLeadsSection() {
  const [leads, setLeads]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deletingId, setDeletingId]   = useState(null);
  const [confirmLead, setConfirmLead] = useState(null);
  const [search, setSearch]           = useState("");
  const [toast, setToast]             = useState({ type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/society-leads/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to fetch society leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async () => {
    if (!confirmLead) return;
    setDeletingId(confirmLead.id);
    setConfirmLead(null);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/society-leads/admin/${confirmLead.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads((prev) => prev.filter((l) => l.id !== confirmLead.id));
      showToast("success", "Lead deleted successfully.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete lead.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.society_name.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: "", message: "" })} />
      <ConfirmDialog lead={confirmLead} onConfirm={handleDelete} onCancel={() => setConfirmLead(null)} />

      <div className="space-y-4">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users2 className="w-4 h-4" style={{ color: "#CC0000" }} />
              Society Partnership Leads
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#2a0000", color: "#CC0000" }}
              >
                {leads.length}
              </span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
              RWA enquiries submitted via the partnership form
            </p>
          </div>

          <div className="flex gap-2">
            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, society, city…"
              className="text-xs rounded-lg px-3 py-2 w-48"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                color: "#cccccc",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#CC0000")}
              onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
            />
            {/* Refresh */}
            <button
              onClick={fetchLeads}
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" style={{ color: "#999999" }} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#CC0000" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#333333" }} />
            <p className="text-sm font-semibold text-white">No leads found</p>
            <p className="text-xs mt-1" style={{ color: "#666666" }}>
              {search ? "Try a different search term." : "Society partnership enquiries will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-2xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
                    {["#", "Name", "Society", "Phone", "City", "Date", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#888888" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      style={{ borderBottom: "1px solid #1f1f1f", backgroundColor: idx % 2 === 0 ? "#111111" : "#141414" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e1e1e")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#111111" : "#141414")}
                    >
                      <td className="px-4 py-3 text-xs" style={{ color: "#555555" }}>{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                      <td className="px-4 py-3" style={{ color: "#cccccc" }}>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" style={{ color: "#CC0000" }} />
                          {lead.society_name}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "#cccccc" }}>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" style={{ color: "#555555" }} />
                          {lead.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "#cccccc" }}>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" style={{ color: "#555555" }} />
                          {lead.city}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#888888" }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(lead.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setConfirmLead(lead)}
                          disabled={deletingId === lead.id}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                          style={{ backgroundColor: "#2a0000", color: "#CC0000" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#CC0000") && (e.currentTarget.style.color = "#fff")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2a0000") && (e.currentTarget.style.color = "#CC0000")}
                        >
                          {deletingId === lead.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><Trash2 className="w-3 h-3" /> Delete</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filtered.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{lead.name}</p>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#CC0000" }}>
                        <Building2 className="w-3 h-3" /> {lead.society_name}
                      </p>
                    </div>
                    <button
                      onClick={() => setConfirmLead(lead)}
                      disabled={deletingId === lead.id}
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: "#2a0000" }}
                    >
                      {deletingId === lead.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#CC0000" }} />
                        : <Trash2 className="w-3.5 h-3.5" style={{ color: "#CC0000" }} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: "#888888" }}>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(lead.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}