// about/page.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2, Rocket, MapPin, CreditCard, BarChart2,
  Expand, Smartphone, Sparkles, ArrowRight, Users, Award, Star, Shield
} from "lucide-react";

const keyFeatures = [
  { icon: Users,       text: "Connects users instantly with trusted, skilled professionals" },
  { icon: Shield,      text: "Verified worker profiles with ratings for reliability" },
  { icon: CheckCircle2,text: "Instant booking and direct communication with providers" },
  { icon: Sparkles,    text: "User-friendly interface for quick search and seamless booking" },
  { icon: BarChart2,   text: "Worker dashboard for profile, availability & job tracking" },
  { icon: Award,       text: "Secure and scalable platform for large-scale deployment" },
  { icon: Star,        text: "Built with modern web technologies for speed & responsiveness" },
];

const futureObjectives = [
  { icon: Sparkles,    text: "AI-powered recommendations for personalized worker suggestions" },
  { icon: Smartphone,  text: "Dedicated mobile apps for Android and iOS" },
  { icon: CreditCard,  text: "Online payment gateway for secure transactions" },
  { icon: MapPin,      text: "Geo-location tracking for finding nearby services fast" },
  { icon: BarChart2,   text: "Analytics dashboards for service quality monitoring" },
  { icon: Expand,      text: "Expansion into new categories and cities" },
];

const stats = [
  { number: "15K+", label: "Happy Customers" },
  { number: "800+", label: "Professionals" },
  { number: "4.9★", label: "Avg Rating" },
  { number: "24/7", label: "Support" },
];

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
    <main className="min-h-screen bg-white">

      {/* ── Hero banner ───────────────────────────── */}
      <section className="bg-red-600 border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-widest text-red-200 uppercase mb-3">About Us</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            Home Ease
          </h1>
          <p className="text-red-100 text-base md:text-lg max-w-xl leading-relaxed mb-6">
            A smart platform connecting households with verified professionals for on-demand home services — fast, reliable, and trusted.
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold py-2.5 px-6 text-sm transition-colors duration-200">
            Book a Service <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────── */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
            {stats.map((s, i) => (
              <div key={i} className="px-6 py-7 group hover:bg-red-600 transition-colors duration-200">
                <div className="text-2xl font-black text-gray-900 group-hover:text-white transition-colors duration-200">{s.number}</div>
                <div className="text-xs text-gray-500 group-hover:text-red-100 font-medium mt-0.5 transition-colors duration-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────── */}
      <section ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-200 border border-gray-200">

          {/* Key Features */}
          <div className={`bg-white p-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">What We Offer</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="space-y-4">
              {keyFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-7 h-7 bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-600 transition-colors duration-200">
                      <Icon className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <p className="text-sm text-gray-600 leading-snug">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Future Objectives */}
          <div className={`bg-white p-8 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">What's Coming</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Future Objectives</h2>
            <div className="space-y-4">
              {futureObjectives.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-7 h-7 bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-600 transition-colors duration-200">
                      <Icon className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <p className="text-sm text-gray-600 leading-snug">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Mission statement ─────────────────── */}
        <div className={`mt-px border border-gray-200 border-t-0 bg-red-600 p-8 md:p-10 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest text-red-200 uppercase mb-3">Our Mission</p>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              Empowering Digital Transformation
            </h2>
            <p className="text-red-100 text-sm md:text-base leading-relaxed">
              HomeEase aims to modernize home service access, create job opportunities, and bring digital empowerment to households and workers alike — building a future where quality service is just a tap away.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}