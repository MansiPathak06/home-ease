"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.auth.register(formData);
      if (data.success) {
        localStorage.setItem("userType", data.user.type || "user");
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("token", data.token);
        router.push("/userdashboard");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <style>{`
       
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .glass {
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }
        .rg-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          padding: 10px 12px 10px 38px;
          width: 100%;
          outline: none;
          border-radius: 0;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .rg-input::placeholder { color: rgba(255,255,255,0.22); }
        .rg-input:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .rg-input-no-icon {
          padding-left: 12px;
        }
      `}</style>

      {/* ── BG IMAGE — replace YOUR_IMAGE_URL_HERE with your image link ── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(10,2,2,0.80) 0%, rgba(10,2,2,0.72) 100%),
            url('https://i.pinimg.com/736x/d4/86/19/d48619f28f998dacb921d90eefd94f51.jpg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />

      {/* Red radial overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 15% 25%, rgba(180,30,30,0.32) 0%, transparent 55%)" }} />
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 85% 75%, rgba(100,10,10,0.38) 0%, transparent 55%)" }} />

      {/* PAGE */}
      <div className="font-dm relative z-10 min-h-screen flex items-center justify-center px-4 py-10 pt-24">
        
        <div className="w-full" style={{ maxWidth: "820px" }}>

          {/* ── TWO COLUMN LAYOUT ── */}
          <div
            className="glass w-full grid border"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(10,2,2,0.52)",
              gridTemplateColumns: "clamp(200px,38%,280px) 1fr",
            }}
          >

            {/* ── LEFT PANEL ── */}
            <div
              className="relative overflow-hidden flex flex-col justify-between gap-8 p-8"
              style={{ background: "#b91c1c" }}
            >
              {/* decorative circles */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full"
                style={{ background: "rgba(0,0,0,0.15)" }} />
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* Brand */}
              <div className="relative z-10">
                <span className="block mb-4 text-white tracking-widest uppercase"
                  style={{ fontSize: "10px", opacity: 0.55 }}>
                  HomeEase Services
                </span>
                <h1 className="font-playfair text-white mb-3 leading-tight font-semibold"
                  style={{ fontSize: "1.75rem" }}>
                  Join us today.
                </h1>
                <p className="text-white font-light leading-relaxed"
                  style={{ fontSize: "12.5px", opacity: 0.68 }}>
                  Create your account and get access to trusted home services — all in one place.
                </p>
              </div>

              {/* Feature bullets */}
              <div className="relative z-10 flex flex-col gap-3">
                {[
                  { icon: "✦", text: "Book services instantly" },
                  { icon: "✦", text: "Track your bookings live" },
                  { icon: "✦", text: "Verified & trusted vendors" },
                  { icon: "✦", text: "24/7 customer support" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="text-white" style={{ fontSize: "8px", opacity: 0.7 }}>{icon}</span>
                    <span className="text-white font-light" style={{ fontSize: "12px", opacity: 0.75 }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <div className="relative z-10 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <p className="text-white font-light" style={{ fontSize: "11px", opacity: 0.5, lineHeight: 1.6 }}>
                  Already have an account?{" "}
                  <a href="/login" className="underline font-medium"
                    style={{ opacity: 0.85 }}>Sign in</a>
                </p>
              </div>
            </div>

            {/* ── RIGHT PANEL (FORM) ── */}
            <div className="p-8">
              <div className="mb-5 pb-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <h2 className="font-playfair text-white font-semibold mb-1"
                  style={{ fontSize: "1.2rem" }}>
                  Create your account
                </h2>
                <p className="text-white font-light" style={{ fontSize: "11.5px", opacity: 0.4 }}>
                  Fill in the details below to get started.
                </p>
              </div>

              <form onSubmit={handleSubmit} autoComplete="off">

                {/* Row 1 — Name + Email */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-widest text-white"
                      style={{ fontSize: "9px", opacity: 0.4 }}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="rg-input"
                        id="name" name="name" type="text"
                        required value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-widest text-white"
                      style={{ fontSize: "9px", opacity: 0.4 }}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="rg-input"
                        id="email" name="email" type="email"
                        required value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2 — Phone + Location */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-widest text-white"
                      style={{ fontSize: "9px", opacity: 0.4 }}>Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="rg-input"
                        id="phone" name="phone" type="tel"
                        required value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-widest text-white"
                      style={{ fontSize: "9px", opacity: 0.4 }}>Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="rg-input"
                        id="location" name="location" type="text"
                        required value={formData.location}
                        onChange={handleChange}
                        placeholder="Ghaziabad, UP"
                      />
                    </div>
                  </div>
                </div>

                {/* Password — full width */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="uppercase tracking-widest text-white"
                    style={{ fontSize: "9px", opacity: 0.4 }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                      style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                    <input
                      className="rg-input"
                      id="password" name="password"
                      type={showPassword ? "text" : "password"}
                      required minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      style={{ paddingRight: "38px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {showPassword
                        ? <EyeOff style={{ width: "13px", height: "13px" }} />
                        : <Eye style={{ width: "13px", height: "13px" }} />}
                    </button>
                  </div>
                  <p className="text-white font-light" style={{ fontSize: "10px", opacity: 0.3 }}>
                    Use at least 6 characters with a mix of letters and numbers.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-3 font-light px-3 py-2 text-red-300"
                    style={{
                      fontSize: "12px",
                      borderLeft: "2px solid #ef4444",
                      background: "rgba(239,68,68,0.08)",
                    }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest transition-colors disabled:opacity-50"
                  style={{
                    padding: "12px",
                    background: loading ? "#991b1b" : "#b91c1c",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "2.5px",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#991b1b"; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#b91c1c"; }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
                  <span className="text-white uppercase tracking-widest"
                    style={{ fontSize: "9px", opacity: 0.35 }}>or</span>
                  <div className="flex-1" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Sign in link */}
                <a
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest transition-colors"
                  style={{
                    padding: "11px",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "2px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <ArrowLeft style={{ width: "13px", height: "13px" }} />
                  Already have an account? Sign In
                </a>

              </form>
            </div>
          </div>

          {/* Terms note */}
          <p className="text-center mt-4 font-light"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 600px) {
          .glass.w-full.grid { grid-template-columns: 1fr !important; }
          .glass.w-full.grid > div:first-child { display: none !important; }
          .glass.w-full.grid > div:last-child { padding: 2rem 1.5rem !important; }
          .grid.grid-cols-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .glass.w-full.grid > div:last-child { padding: 1.75rem 1.25rem !important; }
        }
      `}</style>
    </>
  );
}