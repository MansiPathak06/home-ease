"use client";
import { useState, useEffect } from "react";
import {
  Star, CheckCircle, Trash2, Plus, X, Clock,
  MessageSquare, User, Mail, Briefcase, Search,
} from "lucide-react";
import { api } from "@/lib/api";

const SERVICES = [
  "Home Cleaning", "Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning",
  "Sofa Cleaning", "Carpet Cleaning", "Mattress Cleaning", "Pest Control",
  "AC Repair & Service", "Washing Machine Repair", "Refrigerator Repair",
  "Electrician", "Plumber", "Carpenter", "House Painting", "Home Renovation",
  "Packers & Movers", "Cook / Chef at Home", "Handyman Service", "Other",
];

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-3 h-3"
          style={{
            fill: s <= rating ? "#CC0000" : "transparent",
            color: s <= rating ? "#CC0000" : "#555",
          }}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            className="w-6 h-6 transition-all"
            style={{
              fill: s <= (hovered || value) ? "#CC0000" : "transparent",
              color: s <= (hovered || value) ? "#CC0000" : "#555",
            }}
          />
        </button>
      ))}
    </div>
  );
}

export default function AdminReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "approved"
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ name: "", email: "", rating: 5, text: "", service: "" });
  const [formLoading, setFormLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await api.admin.reviews.getAll();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      await api.admin.reviews.approve(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r))
      );
      showToast("Review approved and published!");
    } catch {
      showToast("Failed to approve review", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(id + "_delete");
    try {
      await api.admin.reviews.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast("Review deleted.");
    } catch {
      showToast("Failed to delete review", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      showToast("Name and review text are required.", "error");
      return;
    }
    setFormLoading(true);
    try {
      await api.admin.reviews.add(form);
      showToast("Review added and published!");
      setShowAddModal(false);
      setForm({ name: "", email: "", rating: 5, text: "", service: "" });
      loadReviews();
    } catch {
      showToast("Failed to add review", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchFilter =
      filter === "all" ? true :
      filter === "pending" ? !r.is_approved :
      r.is_approved;
    const matchSearch =
      search === "" ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.text?.toLowerCase().includes(search.toLowerCase()) ||
      r.service?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 text-sm font-semibold shadow-lg"
          style={{
            backgroundColor: toast.type === "error" ? "#8B0000" : "#1a3a1a",
            border: `1px solid ${toast.type === "error" ? "#CC0000" : "#22c55e"}`,
            color: "#fff",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#f0f0f0" }}>
            Reviews Management
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#999" }}>
            {pendingCount} pending approval · {approvedCount} published
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors"
          style={{ backgroundColor: "#CC0000", color: "#fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B0000")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#CC0000")}
        >
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Reviews", val: reviews.length, icon: MessageSquare },
          { label: "Pending", val: pendingCount, icon: Clock },
          { label: "Published", val: approvedCount, icon: CheckCircle },
        ].map(({ label, val, icon: Icon }) => (
          <div
            key={label}
            className="p-4 rounded-lg"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: "#999" }}>{label}</p>
                <p className="text-xl font-bold text-white mt-1">{val}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#2a0000" }}>
                <Icon className="w-5 h-5" style={{ color: "#CC0000" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
      >
        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded" style={{ backgroundColor: "#111" }}>
          {[
            { key: "all", label: "All" },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "approved", label: `Published (${approvedCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 text-xs font-semibold rounded transition-all"
              style={
                filter === key
                  ? { backgroundColor: "#CC0000", color: "#fff" }
                  : { color: "#999" }
              }
              onMouseEnter={(e) => { if (filter !== key) e.currentTarget.style.backgroundColor = "#2a2a2a"; }}
              onMouseLeave={(e) => { if (filter !== key) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#555" }} />
          <input
            type="text"
            placeholder="Search by name, service, or review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded outline-none"
            style={{
              backgroundColor: "#111",
              border: "1px solid #2a2a2a",
              color: "#f0f0f0",
            }}
          />
        </div>
      </div>

      {/* Reviews list */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid #2a2a2a" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ backgroundColor: "#1a1a1a" }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#CC0000", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ backgroundColor: "#1a1a1a" }}>
            <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: "#333" }} />
            <p style={{ color: "#555" }} className="text-sm">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#2a2a2a" }}>
            {filtered.map((review) => (
              <div
                key={review.id}
                className="p-4 transition-colors"
                style={{ backgroundColor: "#1a1a1a" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: "#CC0000", color: "#fff" }}
                  >
                    {review.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold" style={{ color: "#f0f0f0" }}>{review.name}</span>
                      {review.email && (
                        <span className="text-xs" style={{ color: "#666" }}>{review.email}</span>
                      )}
                      {review.service && (
                        <span
                          className="text-xs px-2 py-0.5 font-medium"
                          style={{ backgroundColor: "#2a0000", color: "#CC0000", border: "1px solid #3a0000" }}
                        >
                          {review.service}
                        </span>
                      )}
                      <span
                        className="text-xs px-2 py-0.5 font-semibold"
                        style={
                          review.is_approved
                            ? { backgroundColor: "#1a3a1a", color: "#22c55e", border: "1px solid #2a4a2a" }
                            : { backgroundColor: "#3a3a00", color: "#facc15", border: "1px solid #4a4a00" }
                        }
                      >
                        {review.is_approved ? "Published" : "Pending"}
                      </span>
                    </div>

                    <StarDisplay rating={review.rating} />
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "#aaa" }}>
                      "{review.text}"
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: "#555" }}>
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!review.is_approved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id + "_approve"}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "#1a3a1a", color: "#22c55e", border: "1px solid #2a4a2a" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#22c55e20")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a1a")}
                        title="Approve & Publish"
                      >
                        {actionLoading === review.id + "_approve" ? (
                          <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "#22c55e", borderTopColor: "transparent" }} />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id + "_delete"}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "#2a0000", color: "#CC0000", border: "1px solid #3a0000" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a0000")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2a0000")}
                      title="Delete Review"
                    >
                      {actionLoading === review.id + "_delete" ? (
                        <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "#CC0000", borderTopColor: "transparent" }} />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-md rounded-lg"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #2a2a2a" }}>
              <h3 className="text-base font-bold" style={{ color: "#f0f0f0" }}>Add Review Manually</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <X className="w-5 h-5" style={{ color: "#999" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#999" }}>
                  <User className="inline w-3 h-3 mr-1" />Customer Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-sm rounded outline-none"
                  style={{ backgroundColor: "#111", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#CC0000")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#999" }}>
                  <Mail className="inline w-3 h-3 mr-1" />Email (optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. rahul@email.com"
                  className="w-full px-3 py-2 text-sm rounded outline-none"
                  style={{ backgroundColor: "#111", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#CC0000")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#999" }}>
                  <Briefcase className="inline w-3 h-3 mr-1" />Service (optional)
                </label>
                <select
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded outline-none"
                  style={{ backgroundColor: "#111", border: "1px solid #2a2a2a", color: form.service ? "#f0f0f0" : "#555" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#CC0000")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                >
                  <option value="">Select a service...</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#999" }}>Rating *</label>
                <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#999" }}>
                  <MessageSquare className="inline w-3 h-3 mr-1" />Review Text *
                </label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder="Write the customer's review here..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded outline-none resize-none"
                  style={{ backgroundColor: "#111", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#CC0000")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5" style={{ borderTop: "1px solid #2a2a2a" }}>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 text-sm font-semibold rounded transition-colors"
                style={{ backgroundColor: "#2a2a2a", color: "#999" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={formLoading}
                className="flex-1 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#CC0000", color: "#fff" }}
                onMouseEnter={(e) => { if (!formLoading) e.currentTarget.style.backgroundColor = "#8B0000"; }}
                onMouseLeave={(e) => { if (!formLoading) e.currentTarget.style.backgroundColor = "#CC0000"; }}
              >
                {formLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
                ) : (
                  <><Plus className="w-4 h-4" /> Publish Review</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}