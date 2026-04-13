"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Calendar,
  CheckCircle,
  Shield,
  Clock,
  ThumbsUp,
  Phone,
  ArrowRight,
  Award,
  CreditCard,
  Headphones,
  Sparkles,
} from "lucide-react";

const whyChooseFeatures = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description: "Background-verified, trained, and highly experienced providers",
    image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536167/Verified_Professionals_eulr9u.jpg",
  },
  {
    icon: Clock,
    title: "On-Time Service",
    description: "Punctual delivery with real-time tracking of your booking",
    image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/On-Time_Service_bpwvvx.jpg",
  },
  {
    icon: ThumbsUp,
    title: "Quality Guaranteed",
    description: "100% satisfaction guarantee with warranty on all services",
    image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/Quality_Guaranteed_t6bllk.jpg",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Round-the-clock support for emergencies and queries",
    image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Support_iavewd.jpg",
  },
  {
    icon: ArrowRight,
    title: "Transparent Pricing",
    description: "Upfront quotes with no hidden charges whatsoever",
    image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Transparent_Pricing_qbpf3g.jpg",
  },
  {
    icon: Award,
    title: "Certified Experts",
    description: "Licensed technicians with years of field experience",
    image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Certified_Experts_uwff84.jpg",
  },
];

const HowItWorksSection = () => {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [visibleWhy, setVisibleWhy] = useState(false);

  const stepsRef = useRef([]);
  const featuresRef = useRef([]);
  const whyRef = useRef(null);

  const steps = [
    {
      id: 1,
      icon: Search,
      title: "Browse Services",
      description: "Explore categories like cleaning, plumbing, electrical, and more.",
    },
    {
      id: 2,
      icon: Calendar,
      title: "Book Instantly",
      description: "Choose your expert and schedule at your convenience in clicks.",
    },
    {
      id: 3,
      icon: CheckCircle,
      title: "Relax & Enjoy",
      description: "Sit back while verified professionals handle the job with care.",
    },
  ];

  const features = [
    { icon: Shield,     title: "Verified Experts",      description: "Background-checked and certified professionals." },
    { icon: CreditCard, title: "Secure Payments",        description: "Encrypted payments, transparent pricing, no hidden fees." },
    { icon: Headphones, title: "24/7 Support",           description: "Customer support ready to help at any hour." },
    { icon: Sparkles,   title: "AI Recommendations",     description: "Smart suggestions based on your service history." },
  ];

  useEffect(() => {
    const opts = { threshold: 0.2 };

    const stepsObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = stepsRef.current.indexOf(entry.target);
          if (i !== -1 && !visibleSteps.includes(i))
            setTimeout(() => setVisibleSteps((p) => [...p, i]), i * 150);
        }
      });
    }, opts);

    const featuresObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = featuresRef.current.indexOf(entry.target);
          if (i !== -1 && !visibleFeatures.includes(i))
            setTimeout(() => setVisibleFeatures((p) => [...p, i]), i * 100);
        }
      });
    }, opts);

    const whyObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisibleWhy(true)),
      opts
    );

    stepsRef.current.forEach((el) => el && stepsObs.observe(el));
    featuresRef.current.forEach((el) => el && featuresObs.observe(el));
    if (whyRef.current) whyObs.observe(whyRef.current);

    return () => { stepsObs.disconnect(); featuresObs.disconnect(); whyObs.disconnect(); };
  }, []);

  return (
    // THEME CHANGE: was bg-white → dark charcoal background
    <div style={{ backgroundColor: "#111111" }}>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Header */}
        <div className="mb-10">
          {/* THEME CHANGE: was text-red-600 → bright crimson accent */}
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>Simple Process</p>
          {/* THEME CHANGE: was text-gray-900 → white for dark bg */}
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>How Home Ease Works</h2>
        </div>

        {/* Steps */}
        {/* THEME CHANGE: was border-gray-200 → dark border */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: "1px solid #2a2a2a" }}>
          {steps.map((step, index) => {
            return (
              <div
                key={step.id}
                ref={(el) => (stepsRef.current[index] = el)}
                className={`
                  relative p-6 md:p-8
                  group transition-colors duration-300
                  ${visibleSteps.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                  transition-all duration-500
                `}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  // THEME CHANGE: right/bottom borders in dark tone
                  borderRight: index < steps.length - 1 ? "1px solid #2a2a2a" : "none",
                  backgroundColor: "#111111",
                }}
                // THEME CHANGE: hover → deep crimson #8B0000
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#111111"; }}
              >
                {/* Step number — THEME CHANGE: was text-gray-100 → subtle dark */}
                <div
                  className="absolute top-4 right-4 text-5xl font-black select-none leading-none transition-colors duration-300"
                  style={{ color: "#2a2a2a" }}
                >
                  {String(step.id).padStart(2, "0")}
                </div>

                {/* THEME CHANGE: icon box was bg-red-600 → #CC0000; hover → white */}
                <div
                  className="w-10 h-10 flex items-center justify-center mb-4 transition-colors duration-300"
                  style={{ backgroundColor: "#CC0000" }}
                >
                  {React.createElement(step.icon, {
                    className: "w-5 h-5",
                    style: { color: "#FFFFFF" },
                  })}
                </div>

                {/* THEME CHANGE: title was text-gray-900 → white */}
                <h3 className="text-base font-bold mb-1.5 transition-colors duration-300" style={{ color: "#FFFFFF" }}>
                  {step.title}
                </h3>
                {/* THEME CHANGE: desc was text-gray-500 → muted light gray */}
                <p className="text-sm leading-relaxed transition-colors duration-300" style={{ color: "#999999" }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Trust Features ────────────────────────── */}
        {/* THEME CHANGE: border-gray-200 → #2a2a2a */}
        <div
          className="mt-px grid grid-cols-2 lg:grid-cols-4"
          style={{ border: "1px solid #2a2a2a", borderTop: "none" }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                ref={(el) => (featuresRef.current[i] = el)}
                className={`
                  p-5 group transition-colors duration-200
                  ${visibleFeatures.includes(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                  transition-all duration-500
                `}
                style={{
                  transitionDelay: `${i * 80}ms`,
                  // THEME CHANGE: right/bottom borders → #2a2a2a
                  borderRight: i < features.length - 1 ? "1px solid #2a2a2a" : "none",
                  backgroundColor: "#111111",
                }}
                // THEME CHANGE: hover → slightly lighter charcoal
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1a1a1a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#111111"; }}
              >
                {/* THEME CHANGE: icon bg was bg-red-50 → dark crimson tint */}
                <div
                  className="w-8 h-8 flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#2a0000" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#CC0000" }} />
                </div>
                {/* THEME CHANGE: title was text-gray-900 → white */}
                <h4 className="text-xs font-bold mb-1" style={{ color: "#FFFFFF" }}>{f.title}</h4>
                {/* THEME CHANGE: desc was text-gray-500 → #999999 */}
                <p className="text-xs leading-snug" style={{ color: "#999999" }}>{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────── */}
      {/* THEME CHANGE: was bg-gray-50 → slightly lighter dark #1a1a1a */}
      <section
        ref={whyRef}
        className="py-14"
        style={{ backgroundColor: "#1a1a1a", borderTop: "1px solid #2a2a2a" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className={`mb-10 transition-all duration-700 ${visibleWhy ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>Our Strengths</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>Why Choose Home Ease?</h2>
          </div>

          {/* Cards grid */}
          {/* THEME CHANGE: bg-gray-200 gap → #2a2a2a, border → #2a2a2a */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px"
            style={{ backgroundColor: "#2a2a2a", border: "1px solid #2a2a2a" }}
          >
            {whyChooseFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`
                    group cursor-default overflow-hidden relative
                    transition-all duration-500
                    ${visibleWhy ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                  `}
                  style={{
                    transitionDelay: visibleWhy ? `${index * 70}ms` : "0ms",
                    // THEME CHANGE: was bg-white → dark charcoal card
                    backgroundColor: "#111111",
                  }}
                >
                  {/* Image */}
                  <div className="h-36 relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Gradient overlay — slightly deeper for dark theme */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />

                    {/* Icon badge — THEME CHANGE: was bg-red-600 → #8B0000 */}
                    <div className="absolute top-2.5 left-2.5 p-1.5" style={{ backgroundColor: "#8B0000" }}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>

                    {/* Title on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-bold text-white leading-tight">{item.title}</h3>
                    </div>
                  </div>

                  {/* Description row — THEME CHANGE: border → #2a2a2a, hover → #CC0000 */}
                  <div
                    className="px-3 py-2.5 transition-colors duration-200"
                    style={{ borderTop: "1px solid #2a2a2a" }}
                  >
                    <p className="text-xs leading-snug line-clamp-2" style={{ color: "#999999" }}>{item.description}</p>
                  </div>

                  {/* Bottom accent — THEME CHANGE: was bg-red-600 → #CC0000 */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ backgroundColor: "#CC0000" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksSection;