"use client";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  MapPin,
  Search,
  LogIn,
  LayoutDashboard,
  Navigation,
} from "lucide-react";
import { useRouter } from "next/navigation";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  .navbar-root {
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  /* ── Logo ── */
  .nav-logo-icon {
    transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), background 0.2s;
  }
  .nav-logo:hover .nav-logo-icon {
    transform: rotate(-10deg) scale(1.15);
    background: #991b1b;
  }
  .nav-logo-text {
    transition: letter-spacing 0.35s ease, color 0.2s;
  }
  .nav-logo:hover .nav-logo-text {
    letter-spacing: 0.4px;
    color: #C0392B;
  }

  /* ── Search ── */
  .nav-search-input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s;
  }
  .nav-search-input:focus {
    border-color: #C0392B !important;
    box-shadow: 0 0 0 3px rgba(192,57,43,0.18) !important;
    outline: none;
  }
  .nav-search-pin {
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.2s;
  }
  .nav-search-wrap:focus-within .nav-search-pin {
    transform: translateY(-50%) scale(1.25);
    opacity: 1 !important;
  }

  /* ── Icon buttons ── */
  .nav-icon-btn {
    transition: background 0.18s, border-color 0.18s, transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
  }
  .nav-icon-btn:hover {
    transform: scale(1.13);
    box-shadow: 0 4px 12px rgba(192,57,43,0.28);
    background: #2a2a2a !important;
    border-color: #C0392B !important;
  }
  .nav-icon-btn:active {
    transform: scale(0.95);
  }

  /* ── Nav links staggered entrance ── */
  .nav-link-item {
    animation: navFadeSlide 0.5s both;
    position: relative;
    overflow: hidden;
  }
  .nav-link-item:nth-child(1) { animation-delay: 0.05s; }
  .nav-link-item:nth-child(2) { animation-delay: 0.11s; }
  .nav-link-item:nth-child(3) { animation-delay: 0.17s; }
  .nav-link-item:nth-child(4) { animation-delay: 0.23s; }

  @keyframes navFadeSlide {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Underline slide */
  .nav-link-item::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: calc(100% - 24px);
    height: 2px;
    background: #C0392B;
    border-radius: 2px;
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1);
  }
  .nav-link-item:hover::after,
  .nav-link-item.active::after {
    transform: translateX(-50%) scaleX(1);
  }
  .nav-link-item {
    transition: color 0.2s, background 0.2s;
  }

  /* ── CTA button ── */
  .nav-cta-btn {
    animation: navFadeSlide 0.5s 0.3s both;
    position: relative;
    overflow: hidden;
    transition: background 0.2s, transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s;
  }
  .nav-cta-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 24px rgba(192,57,43,0.4);
    background: #991b1b !important;
  }
  .nav-cta-btn:active {
    transform: scale(0.97);
  }

  /* Ripple */
  .nav-ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    transform: scale(0);
    animation: navRipple 0.55s linear forwards;
    pointer-events: none;
  }
  @keyframes navRipple {
    to { transform: scale(5); opacity: 0; }
  }

  /* ── Mobile menu slide ── */
  .nav-mobile-menu {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s ease;
  }
  .nav-mobile-menu.open {
    max-height: 500px;
    opacity: 1;
  }

  /* Mobile nav links */
  .nav-mobile-link {
    transition: background 0.18s, color 0.18s, transform 0.22s ease, padding-left 0.22s ease;
  }
  .nav-mobile-link:hover {
    background: #2a2a2a;
    color: #C0392B;
    transform: translateX(5px);
    padding-left: 18px;
  }

  /* Mobile CTA */
  .nav-mobile-cta {
    transition: background 0.2s, transform 0.22s ease;
  }
  .nav-mobile-cta:hover {
    background: #991b1b !important;
    transform: scale(1.02);
  }

  /* ── Detecting pulse ── */
  .nav-detect-pulse {
    animation: detectPulse 1.1s ease infinite;
  }
  @keyframes detectPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.3); }
  }

  /* ── Scroll shadow transition ── */
  .navbar-scrolled {
    box-shadow: 0 2px 20px rgba(192,57,43,0.18), 0 1px 4px rgba(0,0,0,0.3);
  }

  /* ── Logo entrance ── */
  .nav-logo {
    animation: navFadeSlide 0.45s 0s both;
    text-decoration: none;
    display: flex;
    align-items: center;
  }
`;



export default function Navbar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userType, setUserType] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const ctaBtnRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const type = localStorage.getItem("userType");
    setUserType(type);
  }, []);

  const dashboardPath =
    userType === "admin"
      ? "/admindashboard"
      : userType === "vendor"
        ? "/vendordashboard"
        : userType === "user"
          ? "/userdashboard"
          : null;

  const handleLocationSearch = (e) => {
    if (e.key === "Enter" && location.trim()) {
      router.push(`/services?location=${encodeURIComponent(location.trim())}`);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state_district ||
            "";
          if (city) setLocation(city);
        } catch (_) {}
        setDetecting(false);
      },
      () => setDetecting(false),
    );
  };

  const handleRipple = (e) => {
    const btn = ctaBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "nav-ripple";
    ripple.style.width = ripple.style.height = "80px";
    ripple.style.left = `${e.clientX - rect.left - 40}px`;
    ripple.style.top = `${e.clientY - rect.top - 40}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <style>{styles}</style>

      <nav
        className={`navbar-root fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled ? "navbar-scrolled" : ""
        }`}
        style={{ backgroundColor: "#111111", borderBottom: "1px solid #2a2a2a" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* ── Logo ── */}
            <a href="/" className="nav-logo flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="HomeEase Logo"
                className="h-20 w-auto"
              />
            </a>

            {/* ── Search bar ── */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
              <div className="nav-search-wrap relative flex-1">
                <span
                  className="nav-search-pin absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#C0392B", opacity: 0.8 }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleLocationSearch}
                  className="nav-search-input w-full pl-9 pr-3 py-2 text-sm rounded-xl"
                  style={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #3a3a3a",
                    color: "#f0f0f0",
                  }}
                />
              </div>

              <button
                onClick={() =>
                  location.trim() &&
                  router.push(
                    `/services?location=${encodeURIComponent(location.trim())}`,
                  )
                }
                className="nav-icon-btn w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #3a3a3a",
                  color: "#C0392B",
                }}
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={detectLocation}
                title="Detect location"
                className="nav-icon-btn w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #3a3a3a",
                  color: "#C0392B",
                }}
              >
                <Navigation
                  className={`w-3.5 h-3.5 ${detecting ? "nav-detect-pulse" : ""}`}
                />
              </button>
            </div>

            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setActiveLink(link.name)}
                  className={`nav-link-item px-3 py-2 text-sm font-medium rounded-lg cursor-pointer ${
                    activeLink === link.name ? "active" : ""
                  }`}
                  style={{
                    color: activeLink === link.name ? "#C0392B" : "#d1d1d1",
                  }}
                >
                  {link.name}
                </a>
              ))}

              {dashboardPath ? (
                <a
                  href={dashboardPath}
                  className="nav-cta-btn ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                  style={{ backgroundColor: "#C0392B", color: "#ffffff" }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </a>
              ) : (
                <a
                  ref={ctaBtnRef}
                  href="/login"
                  onClick={handleRipple}
                  className="nav-cta-btn ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                  style={{ backgroundColor: "#C0392B", color: "#ffffff" }}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Get Started
                </a>
              )}
            </div>

            {/* ── Mobile toggle ── */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="nav-icon-btn md:hidden w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: "#1e1e1e",
                border: "1px solid #3a3a3a",
                color: "#C0392B",
              }}
            >
              {isOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className={`nav-mobile-menu md:hidden ${isOpen ? "open" : ""}`}
          style={{ borderTop: "1px solid #2a2a2a" }}
        >
          <div className="px-4 py-4 space-y-2" style={{ backgroundColor: "#111111" }}>
            {/* Mobile search */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "#C0392B" }}
                />
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleLocationSearch}
                  className="nav-search-input w-full pl-9 pr-3 py-2 text-sm rounded-xl"
                  style={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #3a3a3a",
                    color: "#f0f0f0",
                  }}
                />
              </div>
              <button
                onClick={detectLocation}
                className="nav-icon-btn w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #3a3a3a",
                  color: "#C0392B",
                }}
              >
                <Navigation
                  className={`w-3.5 h-3.5 ${detecting ? "nav-detect-pulse" : ""}`}
                />
              </button>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.name);
                  setIsOpen(false);
                }}
                className="nav-mobile-link block px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  color: activeLink === link.name ? "#C0392B" : "#d1d1d1",
                  backgroundColor: activeLink === link.name ? "#1e1e1e" : "transparent",
                }}
              >
                {link.name}
              </a>
            ))}

            <a
              href={dashboardPath || "/login"}
              className="nav-mobile-cta block text-center py-2.5 rounded-xl font-semibold text-sm mt-1"
              style={{ backgroundColor: "#C0392B", color: "#ffffff" }}
            >
              {dashboardPath ? "Dashboard" : "Get Started"}
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}