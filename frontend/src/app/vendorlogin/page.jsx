"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin,
  Briefcase, FileText, DollarSign, Clock, Plus, Trash2
} from "lucide-react";

export default function VendorLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [registerData, setRegisterData] = useState({
    businessName: "", ownerName: "", email: "", password: "",
    phone: "", address: "", city: "", state: "", zipCode: "",
    serviceCategory: "", servicesOffered: "", description: "",
    yearsInBusiness: "", pricing: "", availability: "",
    website: "", certification: "",
  });

  const [customFields, setCustomFields] = useState([]);

  const serviceCategories = [
    "Home Cleaning","Deep Cleaning","Kitchen Cleaning","Bathroom Cleaning",
    "Sofa Cleaning","Carpet Cleaning","Mattress Cleaning","Pest Control",
    "Termite Control","Cockroach / Ant Control","Bed Bug Control",
    "AC Repair & Service","Washing Machine Repair","Refrigerator Repair",
    "Microwave Repair","TV Repair & Installation","Geyser Repair",
    "Water Cooler Repair","Electrician","Fan Installation / Repair",
    "Light & Switch Repair","Inverter / Battery Service","Plumber",
    "Tap & Faucet Repair","Leakage Repair","Bathroom Fittings Installation",
    "Water Tank Cleaning","RO / Water Purifier Service","RO Installation",
    "RO Filter Change","CCTV Installation","Doorbell Installation",
    "TV Wall Mount Installation","Curtain & Blinds Installation","Carpenter",
    "Furniture Repair","Modular Kitchen Repair","Wardrobe Repair",
    "House Painting","Wall Putty & Polish","Home Renovation","Tiles & Flooring",
    "Packers & Movers","Home Shifting Service","Cook / Chef at Home",
    "Babysitter / Nanny","Elderly Care","Maid Service","Laptop / Computer Repair",
    "WiFi / Internet Setup","Printer Repair","Driver on Hire",
    "Gardening Service","Home Sanitization","Handyman Service",
  ];

  const addCustomField = () => setCustomFields([...customFields, { key: "", value: "" }]);
  const removeCustomField = (index) => setCustomFields(customFields.filter((_, i) => i !== index));
  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.auth.vendorLogin(loginData.email, loginData.password);
      if (data.success) {
        if (!data.isApproved) {
          setError("Your account is pending admin approval. Please wait for approval.");
          setLoading(false);
          return;
        }
        localStorage.setItem("userType", "vendor");
        localStorage.setItem("userEmail", loginData.email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("vendorId", data.vendor.id);
        router.push("/vendordashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const additionalInfo = {};
      customFields.forEach(({ key, value }) => {
        if (key.trim()) additionalInfo[key.trim()] = value.trim();
      });
      const payload = {
        ...registerData,
        ...(Object.keys(additionalInfo).length > 0 && {
          additionalInfo: JSON.stringify(additionalInfo),
        }),
      };
      const data = await api.auth.vendorRegister(payload);
      if (data.success) {
        setSuccess(data.message || "Registration successful! Your account is pending admin approval.");
        setTimeout(() => setIsLogin(true), 3000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .glass {
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }
        .vl-input {
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
        .vl-input::placeholder { color: rgba(255,255,255,0.22); }
        .vl-input:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .vl-input-plain {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          padding: 10px 12px;
          width: 100%;
          outline: none;
          border-radius: 0;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .vl-input-plain::placeholder { color: rgba(255,255,255,0.22); }
        .vl-input-plain:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .vl-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          padding: 10px 12px;
          width: 100%;
          outline: none;
          border-radius: 0;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
        }
        .vl-select:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .vl-select option { background: #1a0505; color: #fff; }
        .vl-textarea {
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
          resize: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .vl-textarea::placeholder { color: rgba(255,255,255,0.22); }
        .vl-textarea:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .vl-textarea-plain {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          padding: 10px 12px;
          width: 100%;
          outline: none;
          border-radius: 0;
          resize: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .vl-textarea-plain::placeholder { color: rgba(255,255,255,0.22); }
        .vl-textarea-plain:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .cf-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 300;
          padding: 8px 10px;
          outline: none;
          border-radius: 0;
          transition: border-color 0.2s;
        }
        .cf-input::placeholder { color: rgba(255,255,255,0.25); }
        .cf-input:focus { border-color: rgba(185,28,28,0.6); }

        /* ── Tab button: use a CSS class so there's no inline shorthand conflict ── */
        .vl-tab {
          padding-bottom: 12px;
          margin-right: 24px;
          font-weight: 500;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 10px;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, border-bottom-color 0.2s;
        }
        .vl-tab.active {
          border-bottom: 2px solid #b91c1c;
          opacity: 1;
        }
        .vl-tab.inactive {
          border-bottom: 2px solid transparent;
          opacity: 0.35;
        }
      `}</style>

      {/* ── BG ── */}
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
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(180,30,30,0.35) 0%, transparent 55%)" }} />
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 70%, rgba(100,10,10,0.4) 0%, transparent 55%)" }} />

      {/* PAGE */}
      <div className="font-dm relative z-10 min-h-screen flex items-start justify-center px-4 pt-32 pb-10">
        <div className="w-full" style={{ maxWidth: isLogin ? "780px" : "920px" }}>

          <div
            className="glass w-full grid border"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(10,2,2,0.52)",
              gridTemplateColumns: isLogin
                ? "clamp(200px,38%,280px) 1fr"
                : "clamp(200px,30%,260px) 1fr",
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

              <div className="relative z-10">
                <span className="block mb-4 text-white tracking-widest uppercase"
                  style={{ fontSize: "10px", opacity: 0.55 }}>
                  HomeEase — Vendor Portal
                </span>
                <h1 className="font-playfair text-white mb-3 leading-tight font-semibold"
                  style={{ fontSize: "1.7rem" }}>
                  {isLogin ? "Welcome back." : "Join as a vendor."}
                </h1>
                <p className="text-white font-light leading-relaxed"
                  style={{ fontSize: "12px", opacity: 0.68 }}>
                  {isLogin
                    ? "Sign in to manage your bookings, respond to customers, and grow your business."
                    : "Register your business and start receiving bookings from thousands of customers."}
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-3">
                {(isLogin
                  ? ["Manage all your bookings", "Accept or reject requests", "Track earnings & reviews", "Update your profile anytime"]
                  : ["Free to register", "Admin-verified listing", "Get bookings instantly", "Grow your customer base"]
                ).map((text) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="text-white" style={{ fontSize: "8px", opacity: 0.7 }}>✦</span>
                    <span className="text-white font-light" style={{ fontSize: "12px", opacity: 0.75 }}>{text}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-10 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <p className="text-white font-light" style={{ fontSize: "11px", opacity: 0.5, lineHeight: 1.6 }}>
                  {isLogin ? "New vendor? " : "Already registered? "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                    className="underline font-medium text-white"
                    style={{ opacity: 0.85, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "11px" }}
                  >
                    {isLogin ? "Register here" : "Sign in"}
                  </button>
                </p>
                <p className="text-white font-light mt-2" style={{ fontSize: "11px", opacity: 0.4 }}>
                  Not a vendor?{" "}
                  <a href="/login" className="underline" style={{ opacity: 0.75 }}>User Login</a>
                </p>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="p-8 overflow-y-auto" style={{ maxHeight: "90vh" }}>

              {/* Tab toggle — uses CSS class to avoid shorthand conflict */}
              <div className="flex mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {[
                  { label: "Login",    active: isLogin  },
                  { label: "Register", active: !isLogin },
                ].map(({ label, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setIsLogin(label === "Login"); setError(""); setSuccess(""); }}
                    className={`vl-tab ${active ? "active" : "inactive"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── LOGIN FORM ── */}
              {isLogin ? (
                <form onSubmit={handleLoginSubmit} autoComplete="off">
                  <div className="mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h2 className="font-playfair text-white font-semibold mb-1" style={{ fontSize: "1.15rem" }}>
                      Sign in to your portal
                    </h2>
                    <p className="text-white font-light" style={{ fontSize: "11.5px", opacity: 0.4 }}>
                      Enter your vendor credentials to continue.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input className="vl-input" name="email" type="email" required
                        value={loginData.email} onChange={handleLoginChange}
                        placeholder="vendor@example.com" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-5">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input className="vl-input" name="password"
                        type={showPassword ? "text" : "password"} required
                        value={loginData.password} onChange={handleLoginChange}
                        placeholder="Enter your password"
                        style={{ paddingRight: "38px" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}>
                        {showPassword
                          ? <EyeOff style={{ width: "13px", height: "13px" }} />
                          : <Eye style={{ width: "13px", height: "13px" }} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 font-light px-3 py-2"
                      style={{
                        fontSize: "12px", color: "#fca5a5",
                        borderLeft: error.includes("pending") || error.includes("approval") ? "2px solid #f59e0b" : "2px solid #ef4444",
                        background: error.includes("pending") || error.includes("approval") ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                      }}>
                      {error.includes("pending") || error.includes("approval") ? (
                        <div>
                          <p className="font-medium mb-0.5" style={{ color: "#fbbf24" }}>⏳ Account Pending Approval</p>
                          <p style={{ color: "rgba(255,255,255,0.6)" }}>Your registration is under admin review. Usually takes 24–48 hours.</p>
                        </div>
                      ) : error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest disabled:opacity-50"
                    style={{
                      padding: "12px", background: loading ? "#991b1b" : "#b91c1c",
                      fontSize: "11px", fontWeight: 500, letterSpacing: "2.5px",
                      border: "none", cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#991b1b"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#b91c1c"; }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

              ) : (
                /* ── REGISTRATION FORM ── */
                <form onSubmit={handleRegisterSubmit} autoComplete="off">
                  <div className="mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h2 className="font-playfair text-white font-semibold mb-1" style={{ fontSize: "1.15rem" }}>
                      Register your business
                    </h2>
                    <p className="text-white font-light" style={{ fontSize: "11.5px", opacity: 0.4 }}>
                      Fill in all details. Your account will be reviewed before activation.
                    </p>
                  </div>

                  <p className="uppercase tracking-widest text-white mb-3" style={{ fontSize: "9px", opacity: 0.35 }}>
                    Business Details
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Business Name *</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                        <input className="vl-input" name="businessName" type="text" required
                          value={registerData.businessName} onChange={handleRegisterChange} placeholder="ABC Services" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Owner Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                        <input className="vl-input" name="ownerName" type="text" required
                          value={registerData.ownerName} onChange={handleRegisterChange} placeholder="John Doe" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                        <input className="vl-input" name="email" type="email" required
                          value={registerData.email} onChange={handleRegisterChange} placeholder="vendor@example.com" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                        <input className="vl-input" name="password"
                          type={showPassword ? "text" : "password"} required
                          value={registerData.password} onChange={handleRegisterChange}
                          placeholder="Create a strong password" style={{ paddingRight: "38px" }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}>
                          {showPassword ? <EyeOff style={{ width: "13px", height: "13px" }} /> : <Eye style={{ width: "13px", height: "13px" }} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                        <input className="vl-input" name="phone" type="tel" required
                          value={registerData.phone} onChange={handleRegisterChange} placeholder="+91 98765 43210" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Category *</label>
                      <select className="vl-select" name="serviceCategory" required
                        value={registerData.serviceCategory} onChange={handleRegisterChange}>
                        <option value="">Select a category</option>
                        {serviceCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Business Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input className="vl-input" name="address" type="text" required
                        value={registerData.address} onChange={handleRegisterChange} placeholder="123 Main Street" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { name: "city",    label: "City *",    placeholder: "New Delhi", required: true },
                      { name: "state",   label: "State *",   placeholder: "Delhi",     required: true },
                      { name: "zipCode", label: "PIN Code *", placeholder: "110001",   required: true },
                    ].map(({ name, label, placeholder, required }) => (
                      <div key={name} className="flex flex-col gap-1.5">
                        <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>{label}</label>
                        <input className="vl-input-plain" name={name} type="text" required={required}
                          value={registerData[name]} onChange={handleRegisterChange} placeholder={placeholder} />
                      </div>
                    ))}
                  </div>

                  <div className="my-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                  <p className="uppercase tracking-widest text-white mb-3" style={{ fontSize: "9px", opacity: 0.35 }}>
                    Service Information
                  </p>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Services Offered *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <textarea className="vl-textarea" name="servicesOffered" required rows={2}
                        value={registerData.servicesOffered} onChange={handleRegisterChange}
                        placeholder="List the specific services you provide..." />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Business Description *</label>
                    <textarea className="vl-textarea-plain" name="description" required rows={3}
                      value={registerData.description} onChange={handleRegisterChange}
                      placeholder="Describe your business, experience, and what makes you unique..." />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Years in Business *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                        <input className="vl-input" name="yearsInBusiness" type="number" required
                          value={registerData.yearsInBusiness} onChange={handleRegisterChange} placeholder="5" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Pricing Range *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                        <input className="vl-input" name="pricing" type="text" required
                          value={registerData.pricing} onChange={handleRegisterChange} placeholder="₹500 - ₹2000" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Availability</label>
                      <input className="vl-input-plain" name="availability" type="text"
                        value={registerData.availability} onChange={handleRegisterChange} placeholder="Mon-Sat, 9AM-6PM" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Website</label>
                      <input className="vl-input-plain" name="website" type="url"
                        value={registerData.website} onChange={handleRegisterChange} placeholder="https://www.example.com" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>Certifications / Licenses</label>
                    <input className="vl-input-plain" name="certification" type="text"
                      value={registerData.certification} onChange={handleRegisterChange}
                      placeholder="List any relevant certifications or licenses" />
                  </div>

                  {/* Additional Info */}
                  <div className="mb-4 p-4"
                    style={{ border: "1px dashed rgba(185,28,28,0.35)", background: "rgba(185,28,28,0.05)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium" style={{ fontSize: "12px" }}>Additional Information</p>
                        <p className="text-white font-light mt-0.5" style={{ fontSize: "11px", opacity: 0.4 }}>
                          GST Number, Team Size, Languages, etc.
                        </p>
                      </div>
                      <button type="button" onClick={addCustomField}
                        className="flex items-center gap-1.5 text-white uppercase tracking-widest"
                        style={{
                          padding: "6px 12px", background: "#b91c1c", border: "none",
                          fontSize: "9px", fontWeight: 500, letterSpacing: "1.5px",
                          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>
                        <Plus style={{ width: "11px", height: "11px" }} />
                        Add Field
                      </button>
                    </div>

                    {customFields.length === 0 && (
                      <p className="text-center text-white font-light py-3"
                        style={{ fontSize: "11px", opacity: 0.3, border: "1px dashed rgba(255,255,255,0.1)" }}>
                        No extra fields yet — click "Add Field" to include more info
                      </p>
                    )}

                    <div className="flex flex-col gap-2">
                      {customFields.map((field, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input type="text" placeholder="Field Name (e.g. GST Number)"
                            value={field.key}
                            onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
                            className="cf-input" style={{ width: "42%" }} />
                          <input type="text" placeholder="Value"
                            value={field.value}
                            onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                            className="cf-input flex-1" />
                          <button type="button" onClick={() => removeCustomField(index)}
                            style={{ color: "rgba(248,113,113,0.7)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                            <Trash2 style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-3 font-light px-3 py-2 text-red-300"
                      style={{ fontSize: "12px", borderLeft: "2px solid #ef4444", background: "rgba(239,68,68,0.08)" }}>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-3 font-light px-3 py-2"
                      style={{ fontSize: "12px", color: "#86efac", borderLeft: "2px solid #22c55e", background: "rgba(34,197,94,0.08)" }}>
                      {success}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest disabled:opacity-50"
                    style={{
                      padding: "12px", background: loading ? "#991b1b" : "#b91c1c",
                      fontSize: "11px", fontWeight: 500, letterSpacing: "2.5px",
                      border: "none", cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#991b1b"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#b91c1c"; }}
                  >
                    {loading ? "Submitting..." : "Submit for Approval"}
                  </button>

                  <p className="text-center text-white font-light mt-3"
                    style={{ fontSize: "10.5px", opacity: 0.3 }}>
                    By registering, you agree to our Terms of Service and Privacy Policy.
                    Your account will be reviewed by our admin team before activation.
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="text-center mt-4 font-light"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
            HomeEase Vendor Portal — Secure & Encrypted
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .glass.w-full.grid {
            grid-template-columns: 1fr !important;
          }
          .glass.w-full.grid > div:first-child {
            display: none !important;
          }
          .glass.w-full.grid > div:last-child {
            padding: 2rem 1.5rem !important;
            max-height: none !important;
          }
          .grid.grid-cols-2 { grid-template-columns: 1fr !important; }
          .grid.grid-cols-3 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .glass.w-full.grid > div:last-child {
            padding: 1.75rem 1.25rem !important;
          }
          .grid.grid-cols-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}