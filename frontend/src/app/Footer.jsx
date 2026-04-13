"use client";
import React from "react";
import {
  Home,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  return (
    // THEME CHANGE: was bg-white shadow-2xl → dark charcoal #111111
    <footer style={{ backgroundColor: "#111111" }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-8">

          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {/* THEME CHANGE: icon bg was bg-red-600 → #8B0000 deep crimson */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "#8B0000" }}
              >
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                {/* THEME CHANGE: was text-gray-900 → white */}
                <h3 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Home Ease</h3>
                {/* THEME CHANGE: was text-red-600 → #CC0000 bright crimson */}
                <p className="text-sm font-semibold" style={{ color: "#CC0000" }}>
                  Smart Home Services, Simplified
                </p>
              </div>
            </div>

            {/* THEME CHANGE: was text-gray-600 → #999999 muted */}
            <p style={{ color: "#999999" }} className="leading-relaxed">
              Your trusted partner for all home maintenance needs — from
              cleaning and plumbing to electrical and carpentry services, all in
              one place.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    // THEME CHANGE: was bg-red-100 text-red-600 hover:bg-red-600 → dark crimson tones
                    style={{ backgroundColor: "#2a0000", color: "#CC0000" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#CC0000";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#2a0000";
                      e.currentTarget.style.color = "#CC0000";
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            {/* THEME CHANGE: was text-gray-900 → white */}
            <h4 className="text-xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-3">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="font-medium inline-flex items-center group transition-all duration-300 hover:underline"
                  // THEME CHANGE: was text-red-600 hover:text-red-800 → #CC0000 hover:#8B0000
                  style={{ color: "#CC0000" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#8B0000"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#CC0000"; }}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {link.name}
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-6">
            {/* THEME CHANGE: was text-gray-900 → white */}
            <h4 className="text-xl font-bold mb-4" style={{ color: "#FFFFFF" }}>Contact Us</h4>
            <div className="space-y-4">

              <div className="flex items-start gap-3">
                {/* THEME CHANGE: icon color was text-red-600 → #CC0000 */}
                <Mail className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: "#CC0000" }} />
                <div>
                  {/* THEME CHANGE: label was text-gray-500 → #666666 */}
                  <p className="text-sm" style={{ color: "#666666" }}>Email</p>
                  <a
                    href="mailto:support@homeease.com"
                    className="font-medium transition-colors duration-300"
                    style={{ color: "#FFFFFF" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#CC0000"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                  >
                    support@homeease.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: "#CC0000" }} />
                <div>
                  <p className="text-sm" style={{ color: "#666666" }}>Phone</p>
                  <a
                    href="tel:+911234567890"
                    className="font-medium transition-colors duration-300"
                    style={{ color: "#FFFFFF" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#CC0000"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                  >
                    +91 123 456 7890
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: "#CC0000" }} />
                <div>
                  <p className="text-sm" style={{ color: "#666666" }}>Location</p>
                  <p className="font-medium" style={{ color: "#FFFFFF" }}>
                    Lucknow, Uttar Pradesh, India
                  </p>
                </div>
              </div>
            </div>

            {/* THEME CHANGE: was bg-red-600 hover:bg-red-700 → #8B0000 hover:#CC0000 */}
            <a
              href="#contact"
              className="inline-block w-full sm:w-auto font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center text-white"
              style={{ backgroundColor: "#8B0000" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#CC0000";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(139,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B0000";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Get in Touch
            </a>
          </div>
        </div>

        {/* Divider — THEME CHANGE: was border-gray-200 → #2a2a2a */}
        <div style={{ borderTop: "1px solid #2a2a2a" }} className="my-8"></div>

        {/* Additional Links */}
        <div className="text-center text-sm mb-8" style={{ color: "#666666" }}>
          <p className="mb-2">
            Trusted by thousands of homeowners across India
          </p>
          <p>
            Available 24/7 • Verified Professionals • Secure Payments •
            Satisfaction Guaranteed
          </p>
        </div>
      </div>

      {/* Copyright Strip — THEME CHANGE: was bg-red-600 → #8B0000 deep crimson */}
      <div className="py-4" style={{ backgroundColor: "#8B0000" }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-white text-sm font-medium">
            © 2026 Home Ease. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;