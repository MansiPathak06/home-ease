"use client";
import { useState } from "react";
import axios from "axios";
import { Building2, User, Phone, MapPin, CheckCircle, Loader2, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CITIES = [
  "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Noida",
  "Gurgaon", "Faridabad", "Ghaziabad", "Lucknow", "Other",
];

// ── Tiny Toast ────────────────────────────────────────────────────────────────
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
      {isSuccess
        ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#888888" }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4" style={{ color: "#555555" }} />
        </span>
        {children}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#CC0000" }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  color: "#ffffff",
  borderRadius: "8px",
  padding: "10px 12px 10px 36px",
  fontSize: "14px",
  outline: "none",
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SocietyPartnerPage() {
  const [form, setForm] = useState({ name: "", society_name: "", phone: "", city: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 4000);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name         = "Name is required.";
    if (!form.society_name.trim()) e.society_name = "Society name is required.";
    if (!form.city)                e.city         = "Please select your city.";
    if (!form.phone.trim())        e.phone        = "Phone number is required.";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
                                   e.phone        = "Enter a valid 10-digit mobile number.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/society-leads`, form);
      setSubmitted(true);
      showToast("success", "Enquiry submitted! We'll contact you within 24 hours.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: "", message: "" })} />

      <div className="min-h-screen mt-20" style={{ backgroundColor: "#111111" }}>

        {/* ── Hero ── */}
        <div
          className="py-16 text-center px-4"
          style={{ background: "linear-gradient(135deg, #1a0000 0%, #111111 100%)" }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "#2a0000", color: "#CC0000" }}
          >
            B2B Partnership
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Partner With <span style={{ color: "#CC0000" }}>Home Ease</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#999999" }}>
            Bring professional home services to every flat in your housing society.
            Fill the form below and our team will get back within 24 hours.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Left: Info ── */}
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <h2 className="text-lg font-bold text-white mb-4">Why Partner With Us?</h2>
              {[
                { emoji: "🏘️", title: "Bulk Onboarding",       desc: "All residents activated in under 48 hours with zero friction." },
                { emoji: "💰", title: "Group Discount",         desc: "Societies save 20–30% compared to individual bookings."         },
                { emoji: "📊", title: "Admin Dashboard",        desc: "RWA secretary gets a dedicated dashboard to track all bookings." },
                { emoji: "🤝", title: "Dedicated Manager",      desc: "One point of contact for all your society's service needs."      },
                { emoji: "⚡", title: "Priority Response",      desc: "Society requests are queued above regular individual bookings."  },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex gap-3 mb-4 last:mb-0">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#888888" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1a0000", border: "1px solid #CC0000" }}
            >
              <p className="text-sm font-semibold text-white mb-1">📞 Prefer to talk?</p>
              <p className="text-xs" style={{ color: "#999999" }}>
                Call our partnership team directly:{" "}
                <a href="tel:+919999999999" className="font-bold" style={{ color: "#CC0000" }}>
                  +91 99999 99999
                </a>
              </p>
              <p className="text-xs mt-1" style={{ color: "#999999" }}>
                Mon – Sat, 9 AM – 7 PM
              </p>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            {submitted ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <CheckCircle className="w-16 h-16 mb-4" style={{ color: "#22c55e" }} />
                <h3 className="text-xl font-bold text-white mb-2">Enquiry Received!</h3>
                <p className="text-sm" style={{ color: "#999999" }}>
                  Thank you for your interest. Our partnership team will call you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", society_name: "", phone: "", city: "" }); }}
                  className="mt-6 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: "#2a2a2a", color: "#cccccc" }}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-6">Get a Free Consultation</h2>
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                  <Field label="Your Name" icon={User} error={errors.name}>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Sharma"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#CC0000")}
                      onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                    />
                  </Field>

                  <Field label="Society Name" icon={Building2} error={errors.society_name}>
                    <input
                      name="society_name"
                      value={form.society_name}
                      onChange={handleChange}
                      placeholder="e.g. Prestige Lakeside Habitat"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#CC0000")}
                      onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                    />
                  </Field>

                  <Field label="Phone Number" icon={Phone} error={errors.phone}>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#CC0000")}
                      onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                    />
                  </Field>

                  <Field label="City" icon={MapPin} error={errors.city}>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                      onFocus={(e) => (e.target.style.borderColor = "#CC0000")}
                      onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                    >
                      <option value="" disabled>Select your city</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c} style={{ backgroundColor: "#1a1a1a" }}>{c}</option>
                      ))}
                    </select>
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all"
                    style={{ backgroundColor: loading ? "#8B0000" : "#CC0000", color: "#fff" }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#8B0000"; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#CC0000"; }}
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      : <><Building2 className="w-4 h-4" /> Partner With Us</>}
                  </button>

                  <p className="text-xs text-center" style={{ color: "#666666" }}>
                    By submitting, you agree to our{" "}
                    <a href="/terms" style={{ color: "#CC0000" }}>Terms of Service</a>.
                    We won't spam you.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}