"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Briefcase } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ keep this

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.auth.login(formData.email, formData.password);

      if (data.success) {
        localStorage.setItem("userType", data.user.role || "user");
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("token", data.token);

        const redirect = searchParams.get("redirect"); // ✅ works now

        if (data.user.role === "admin") {
          router.push("/admindashboard");
        } else if (redirect) {
          router.push(`/${redirect}`);
        } else {
          router.push("/userdashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .glass {
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }
        .lg-input {
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
        .lg-input::placeholder { color: rgba(255,255,255,0.22); }
        .lg-input:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .lg-checkbox {
          width: 13px;
          height: 13px;
          accent-color: #b91c1c;
          border-radius: 0;
        }
      `}</style>

      {/* ── BG IMAGE — replace YOUR_IMAGE_URL_HERE ── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(10,2,2,0.82) 0%, rgba(10,2,2,0.75) 100%),
            url('https://i.pinimg.com/736x/d4/86/19/d48619f28f998dacb921d90eefd94f51.jpg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />
      {/* Red tinted overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(180,30,30,0.35) 0%, transparent 55%)" }} />
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 70%, rgba(100,10,10,0.4) 0%, transparent 55%)" }} />

      {/* PAGE */}
      <div className="font-dm relative z-10 min-h-screen flex items-center justify-center px-4 py-10 pt-30">
        <div className="w-full" style={{ maxWidth: "780px" }}>

          {/* TWO COLUMN LAYOUT */}
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
                  Welcome back.
                </h1>
                <p className="text-white font-light leading-relaxed"
                  style={{ fontSize: "12.5px", opacity: 0.68 }}>
                  Sign in to manage your bookings, track services, and connect with trusted vendors.
                </p>
              </div>

              {/* Feature bullets */}
              <div className="relative z-10 flex flex-col gap-3">
                {[
                  "Book home services instantly",
                  "Track your bookings live",
                  "Verified & trusted vendors",
                  "24/7 customer support",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="text-white" style={{ fontSize: "8px", opacity: 0.7 }}>✦</span>
                    <span className="text-white font-light" style={{ fontSize: "12px", opacity: 0.75 }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <div className="relative z-10 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <p className="text-white font-light" style={{ fontSize: "11px", opacity: 0.5, lineHeight: 1.6 }}>
                  New to HomeEase?{" "}
                  <a href="/register" className="underline font-medium"
                    style={{ opacity: 0.85 }}>Create an account</a>
                </p>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="p-8">
              <div className="mb-6 pb-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <h2 className="font-playfair text-white font-semibold mb-1"
                  style={{ fontSize: "1.2rem" }}>
                  Sign in to your account
                </h2>
                <p className="text-white font-light" style={{ fontSize: "11.5px", opacity: 0.4 }}>
                  Enter your credentials to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} autoComplete="off">

                {/* Email */}
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="uppercase tracking-widest text-white"
                    style={{ fontSize: "9px", opacity: 0.4 }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                      style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                    <input
                      className="lg-input"
                      id="email" name="email" type="email"
                      required value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="uppercase tracking-widest text-white"
                    style={{ fontSize: "9px", opacity: 0.4 }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                      style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                    <input
                      className="lg-input"
                      id="password" name="password"
                      type={showPassword ? "text" : "password"}
                      required value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
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
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      id="remember" name="remember"
                      type="checkbox"
                      className="lg-checkbox"
                    />
                    <label htmlFor="remember" className="text-white font-light"
                      style={{ fontSize: "11px", opacity: 0.5 }}>
                      Remember me
                    </label>
                  </div>
                  <a  href="/forgot-password" className="text-white font-light"
                    style={{ fontSize: "11px", opacity: 0.55, textDecoration: "underline" }}>
                    Forgot password?
                  </a>
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
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
                  <span className="text-white uppercase tracking-widest"
                    style={{ fontSize: "9px", opacity: 0.35 }}>or</span>
                  <div className="flex-1" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Vendor Login */}
                <a
                  href="/vendorlogin"
                  className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest transition-colors mb-3"
                  style={{
                    padding: "11px",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "2px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    fontFamily: "'DM Sans', sans-serif",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <Briefcase style={{ width: "13px", height: "13px" }} />
                  Continue as Vendor
                </a>

                {/* Register link */}
                <p className="text-center text-white font-light"
                  style={{ fontSize: "11px", opacity: 0.4 }}>
                  Don't have an account?{" "}
                  <a href="/register" className="underline font-medium"
                    style={{ opacity: 1, color: "#fca5a5" }}>
                    Sign up
                  </a>
                </p>

              </form>
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-center mt-4 font-light"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>
            Protected by industry-standard encryption. Your data is safe with us.
          </p>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 600px) {
          .glass.w-full.grid {
            grid-template-columns: 1fr !important;
          }
          .glass.w-full.grid > div:first-child {
            display: none !important;
          }
          .glass.w-full.grid > div:last-child {
            padding: 2rem 1.5rem !important;
          }
        }
        @media (max-width: 400px) {
          .glass.w-full.grid > div:last-child {
            padding: 1.75rem 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}