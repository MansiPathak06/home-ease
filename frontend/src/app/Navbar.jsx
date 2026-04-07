"use client";
import { useState, useEffect } from "react";
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

export default function Navbar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userType, setUserType] = useState(null);
  const [detecting, setDetecting] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth
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
      router.push(
        `/services?location=${encodeURIComponent(location.trim())}`
      );
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
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
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
      () => setDetecting(false)
    );
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
          : "bg-gradient-to-r from-red-600 via-red-500 to-red-600"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="/images/logo.png"
              alt="HomeEase Logo"
              className="h-24 w-auto p-1.5  object-cover transition-all duration-300 hover:scale-105"
            />
          </a>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 mx-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <MapPin
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  scrolled ? "text-gray-400" : "text-white/70"
                }`}
              />
              <input
                type="text"
                placeholder="Enter city..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleLocationSearch}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-all focus:outline-none ${
                  scrolled
                    ? "bg-white border-gray-200 text-gray-700 focus:ring-2 focus:ring-red-500"
                    : "bg-white/10 border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-white/40"
                }`}
              />
            </div>

            <button
              onClick={() =>
                location.trim() &&
                router.push(
                  `/services?location=${encodeURIComponent(location.trim())}`
                )
              }
              className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition shadow-sm"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={detectLocation}
              title="Detect location"
              className={`p-2 rounded-lg transition ${
                scrolled
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Navigation
                className={`w-4 h-4 ${
                  detecting ? "animate-pulse" : ""
                }`}
              />
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  scrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/20"
                }`}
              >
                {link.name}
              </a>
            ))}

            {dashboardPath ? (
              <a
                href={dashboardPath}
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>
            ) : (
              <a
                href="/login"
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition"
              >
                <LogIn className="w-4 h-4" />
                Get Started
              </a>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-md ${
              scrolled ? "text-gray-700" : "text-white"
            }`}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="bg-white px-4 py-3 space-y-2 shadow-md">

          {/* Mobile Search */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter city..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleLocationSearch}
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
            <button
              onClick={detectLocation}
              className="p-2 bg-red-50 text-red-600 rounded-md"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-gray-700 rounded-md hover:bg-red-50"
            >
              {link.name}
            </a>
          ))}

          <a
            href={dashboardPath || "/login"}
            className="block text-center bg-red-600 text-white py-2 rounded-md font-semibold"
          >
            {dashboardPath ? "Dashboard" : "Get Started"}
          </a>
        </div>
      </div>
    </nav>
  );
}