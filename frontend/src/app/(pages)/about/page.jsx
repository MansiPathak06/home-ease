"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  BarChart2,
  Expand,
  Smartphone,
  Sparkles,
  Users,
  Award,
  Star,
  Shield,
} from "lucide-react";

/* ── DATA ───────────────────────── */

const keyFeatures = [
  { icon: Users, text: "Connects users instantly with trusted, skilled professionals" },
  { icon: Shield, text: "Verified worker profiles with ratings for reliability" },
  { icon: CheckCircle2, text: "Instant booking and direct communication with providers" },
  { icon: Sparkles, text: "User-friendly interface for quick search and seamless booking" },
  { icon: BarChart2, text: "Worker dashboard for profile, availability & job tracking" },
  { icon: Award, text: "Secure and scalable platform for large-scale deployment" },
  { icon: Star, text: "Built with modern web technologies for speed & responsiveness" },
];

const futureObjectives = [
  { icon: Sparkles, text: "AI-powered recommendations for personalized worker suggestions" },
  { icon: Smartphone, text: "Dedicated mobile apps for Android and iOS" },
  { icon: CreditCard, text: "Online payment gateway for secure transactions" },
  { icon: MapPin, text: "Geo-location tracking for finding nearby services fast" },
  { icon: BarChart2, text: "Analytics dashboards for service quality monitoring" },
  { icon: Expand, text: "Expansion into new categories and cities" },
];

const stats = [
  { number: "15K+", label: "Happy Customers" },
  { number: "800+", label: "Professionals" },
  { number: "4.9★", label: "Avg Rating" },
  { number: "24/7", label: "Support" },
];

/* ── COMPONENT ───────────────────── */

export default function AboutPage() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <main style={{ backgroundColor: "#111111" }} className="min-h-screen">

      {/* ── HERO ───────────────────── */}
      <section style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: "#CC0000" }}>
            About Us
          </p>

          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#FFFFFF" }}>
            Home Ease
          </h1>

          <p className="max-w-xl mb-6" style={{ color: "#999999" }}>
            A smart platform connecting households with verified professionals for on-demand home services.
          </p>

          <button
            className="px-6 py-2.5 font-bold text-sm"
            style={{ backgroundColor: "#CC0000", color: "#fff" }}
          >
            Explore Services
          </button>
        </div>
      </section>

      {/* ── STATS ───────────────────── */}
      <section style={{ borderBottom: "1px solid #2a2a2a" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: "1px solid #2a2a2a" }}>
            {stats.map((s, i) => (
              <div
                key={i}
                className="px-6 py-7"
                style={{
                  borderRight: "1px solid #2a2a2a",
                  borderBottom: "1px solid #2a2a2a",
                }}
              >
                <div className="text-2xl font-black text-white">{s.number}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN ───────────────────── */}
      <section ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid lg:grid-cols-2 gap-px" style={{ backgroundColor: "#2a2a2a" }}>

          {/* FEATURES */}
          <div className={`p-8 ${visible ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: "#111111" }}>
            <p style={{ color: "#CC0000" }} className="text-xs uppercase mb-2">What We Offer</p>
            <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>

            {keyFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-3 mb-4">
                  <Icon className="w-4 h-4" style={{ color: "#CC0000" }} />
                  <p style={{ color: "#999999" }}>{f.text}</p>
                </div>
              );
            })}
          </div>

          {/* FUTURE */}
          <div className={`p-8 ${visible ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: "#111111" }}>
            <p style={{ color: "#CC0000" }} className="text-xs uppercase mb-2">What's Coming</p>
            <h2 className="text-2xl font-bold text-white mb-6">Future Objectives</h2>

            {futureObjectives.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-3 mb-4">
                  <Icon className="w-4 h-4" style={{ color: "#CC0000" }} />
                  <p style={{ color: "#999999" }}>{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MISSION ───────────────── */}
        <div className="mt-6 p-8 text-center" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <p style={{ color: "#CC0000" }} className="text-xs uppercase mb-2">Our Mission</p>
          <h2 className="text-2xl font-bold text-white mb-3">Empowering Digital Transformation</h2>
          <p style={{ color: "#999999" }}>
            HomeEase aims to modernize home service access and create job opportunities through technology.
          </p>
        </div>
      </section>
    </main>
  );
}