"use client";
import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className="w-7 h-7 transition-all duration-150"
            style={{
              fill: s <= (hovered || value) ? "#C0392B" : "transparent",
              color: s <= (hovered || value) ? "#C0392B" : "#444",
            }}
          />
        </button>
      ))}
    </div>
  );
}

const SERVICES = [
  "Home Cleaning", "Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning",
  "Sofa Cleaning", "Carpet Cleaning", "Mattress Cleaning", "Pest Control",
  "AC Repair & Service", "Washing Machine Repair", "Refrigerator Repair",
  "Electrician", "Plumber", "Carpenter", "House Painting", "Home Renovation",
  "Packers & Movers", "Cook / Chef at Home", "Handyman Service", "Other",
];

export default function ReviewSubmitForm() {
  const [form, setForm] = useState({ name: "", email: "", rating: 0, text: "", service: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (form.rating === 0) return setError("Please select a rating.");
    if (!form.text.trim() || form.text.trim().length < 10)
      return setError("Please write at least 10 characters.");

    setLoading(true);
    try {
      const res = await api.reviews.submit(form);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || "Submission failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className="w-16 h-16 flex items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(192,57,43,0.15)" }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: "#C0392B" }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#f0f0f0" }}>
          Thank You!
        </h3>
        <p className="text-sm" style={{ color: "#888" }}>
          Your review has been submitted and is pending approval.
          <br />It will appear publicly once our team reviews it.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", rating: 0, text: "", service: "" }); }}
          className="mt-6 px-5 py-2 text-sm font-semibold transition-colors"
          style={{ border: "1px solid #C0392B", color: "#C0392B" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#C0392B"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#C0392B"; }}
        >
          Write Another Review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888" }}>
            Your Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-4 py-2.5 text-sm outline-none transition-colors"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888" }}>
            Email (optional)
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="e.g. rahul@email.com"
            className="w-full px-4 py-2.5 text-sm outline-none transition-colors"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
          />
        </div>
      </div>

      {/* Service */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888" }}>
          Service Used (optional)
        </label>
        <select
          value={form.service}
          onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
          className="w-full px-4 py-2.5 text-sm outline-none transition-colors"
          style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: form.service ? "#f0f0f0" : "#555" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
        >
          <option value="">Select a service...</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#888" }}>
          Your Rating *
        </label>
        <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
        {form.rating > 0 && (
          <p className="text-xs mt-1" style={{ color: "#666" }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
          </p>
        )}
      </div>

      {/* Review text */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888" }}>
          Your Review *
        </label>
        <textarea
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          placeholder="Tell us about your experience with our service..."
          rows={4}
          className="w-full px-4 py-2.5 text-sm outline-none transition-colors resize-none"
          style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
        />
        <p className="text-xs mt-1" style={{ color: "#555" }}>
          {form.text.length} / 500 characters
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm font-medium px-3 py-2" style={{ backgroundColor: "#2a0000", border: "1px solid #CC0000", color: "#ff6b6b" }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50"
        style={{ backgroundColor: "#C0392B", color: "#fff" }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#8B0000"; }}
        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#C0392B"; }}
      >
        {loading ? (
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
        ) : (
          <><Send className="w-4 h-4" /> Submit Review</>
        )}
      </button>

      <p className="text-xs text-center" style={{ color: "#555" }}>
        Reviews are publicly visible after admin approval. We do not share your email.
      </p>
    </div>
  );
}