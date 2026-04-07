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
    <div className="bg-white">

      {/* ── How It Works ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">Simple Process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How Home Ease Works</h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                ref={(el) => (stepsRef.current[index] = el)}
                className={`
                  relative p-6 md:p-8
                  ${index < steps.length - 1 ? "border-b md:border-b-0 md:border-r border-gray-200" : ""}
                  group hover:bg-red-600 transition-colors duration-300
                  ${visibleSteps.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                  transition-all duration-500
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 text-5xl font-black text-gray-100 group-hover:text-red-500 transition-colors duration-300 select-none leading-none">
                  {String(step.id).padStart(2, "0")}
                </div>

                <div className="w-10 h-10 bg-red-600 group-hover:bg-white flex items-center justify-center mb-4 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-white group-hover:text-red-600 transition-colors duration-300" />
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-white mb-1.5 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-red-100 leading-relaxed transition-colors duration-300">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Trust Features ────────────────────────── */}
        <div className="mt-px grid grid-cols-2 lg:grid-cols-4 border border-gray-200 border-t-0">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                ref={(el) => (featuresRef.current[i] = el)}
                className={`
                  p-5
                  ${i < features.length - 1 ? "border-b lg:border-b-0 border-r border-gray-200" : ""}
                  ${i === 1 ? "border-r-0 lg:border-r border-gray-200" : ""}
                  group hover:bg-gray-50 transition-colors duration-200
                  ${visibleFeatures.includes(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                  transition-all duration-500
                `}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-8 h-8 bg-red-50 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-red-600" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">{f.title}</h4>
                <p className="text-xs text-gray-500 leading-snug">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────── */}
      <section ref={whyRef} className="bg-gray-50 border-t border-gray-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className={`mb-10 transition-all duration-700 ${visibleWhy ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">Our Strengths</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Home Ease?</h2>
          </div>

          {/* Cards grid — 2 cols mobile, 3 desktop, sharp square */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-gray-200 border border-gray-200">
            {whyChooseFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`
                    bg-white group cursor-default overflow-hidden relative
                    transition-all duration-500
                    ${visibleWhy ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                  `}
                  style={{ transitionDelay: visibleWhy ? `${index * 70}ms` : "0ms" }}
                >
                  {/* Image */}
                  <div className="h-36 relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Icon badge */}
                    <div className="absolute top-2.5 left-2.5 bg-red-600 p-1.5">
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>

                    {/* Title on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-bold text-white leading-tight">{item.title}</h3>
                    </div>
                  </div>

                  {/* Description row */}
                  <div className="px-3 py-2.5 border-t border-gray-100 group-hover:border-red-500 transition-colors duration-200">
                    <p className="text-xs text-gray-500 leading-snug line-clamp-2">{item.description}</p>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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