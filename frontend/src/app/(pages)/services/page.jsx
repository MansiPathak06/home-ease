"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Droplet,
  Zap,
  Wind,
  PaintBucket,
  Hammer,
  Sparkles,
  Phone,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Shield,
  ThumbsUp,
  Users,
  Home,
  Leaf,
  Bug,
  Tv,
  Drill,
  Truck,
  Settings,
  Star,
  Lightbulb,
  Sofa,
  Lock,
  Camera,
  Waves,
  TreePine,
  Package,
  Flame,
  DoorOpen,
  Fence,
  CreditCard,
  Headphones,
} from "lucide-react";

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const featuredServices = [
  {
    id: 1,
    icon: Droplet,
    title: "Plumbing Services",
    description: "Expert plumbing repairs, installations, and emergency fixes",
    features: [
      "Pipe Repair",
      "Leak Detection",
      "Drain Cleaning",
      "Water Heater",
      "Faucet Fix",
      "Toilet Repair",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493810/Plumbing_lnokuk.jpg",
  },
  {
    id: 2,
    icon: Zap,
    title: "Electrical Services",
    description: "Safe and reliable electrical work by certified professionals",
    features: [
      "Wiring & Rewiring",
      "Switch Installation",
      "Circuit Breaker",
      "LED Setup",
      "Panel Upgrade",
      "Emergency Fix",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Electrical_l6gmd4.jpg",
  },
  {
    id: 3,
    icon: Sparkles,
    title: "House Cleaning",
    description: "Professional deep cleaning for spotless, hygienic spaces",
    features: [
      "Deep Cleaning",
      "Kitchen Sanitize",
      "Bathroom Clean",
      "Floor Polish",
      "Carpet Clean",
      "Move-in/out",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg",
  },
  {
    id: 4,
    icon: Wind,
    title: "AC Service & Repair",
    description: "Fast AC repair, maintenance, and installation services",
    features: [
      "AC Repair",
      "Gas Refill",
      "Deep Cleaning",
      "Installation",
      "Filter Change",
      "AMC Service",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493674/AC_Repair_pc979w.jpg",
  },
  {
    id: 5,
    icon: PaintBucket,
    title: "Painting Services",
    description: "Transform your space with premium painting services",
    features: [
      "Interior Paint",
      "Exterior Paint",
      "Wall Texture",
      "Waterproofing",
      "Wood Polish",
      "Wallpaper",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493687/Painting_cojmnd.jpg",
  },
  {
    id: 6,
    icon: Wrench,
    title: "Appliance Repair",
    description: "Quick reliable fixes for all home appliances",
    features: [
      "Washing Machine",
      "Refrigerator",
      "Microwave",
      "Dishwasher",
      "Oven Repair",
      "Chimney",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761499268/Appliance_Repair_ybs8nw.jpg",
  },
];

const additionalServices = [
  {
    id: 7,
    icon: Hammer,
    title: "Carpentry Work",
    details: [
      "Furniture Making",
      "Door Install",
      "Cabinet Work",
      "Wood Repairs",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536143/Carpentry_Work_rvo7n7.jpg",
  },
  {
    id: 8,
    icon: Home,
    title: "Home Renovation",
    details: [
      "Kitchen Remodel",
      "Bathroom Upgrade",
      "Room Reno",
      "Floor Design",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Home_Renovation_w7qwi8.jpg",
  },
  {
    id: 9,
    icon: Leaf,
    title: "Gardening",
    details: ["Lawn Mowing", "Plant Care", "Garden Design", "Tree Trimming"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Gardening_Landscaping_hj5qae.jpg",
  },
  {
    id: 10,
    icon: Bug,
    title: "Pest Control",
    details: [
      "Termite Control",
      "Rodent Removal",
      "Insect Treatment",
      "Sanitization",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Pest_Control_effbvx.jpg",
  },
  {
    id: 11,
    icon: Tv,
    title: "TV & Electronics",
    details: ["TV Mounting", "Home Theater", "Cable Mgmt", "Speaker Setup"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/TV_Electronics_Setup_qlbsig.jpg",
  },
  {
    id: 12,
    icon: Drill,
    title: "Furniture Assembly",
    details: [
      "IKEA Assembly",
      "Bed Setup",
      "Wardrobe Install",
      "Shelf Mounting",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Furniture_Assembly_frfjwc.jpg",
  },
  {
    id: 13,
    icon: Truck,
    title: "Moving & Shifting",
    details: ["Home Moving", "Office Shift", "Packing", "Vehicle Transport"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536148/Moving_Shifting_dqu5gl.jpg",
  },
  {
    id: 14,
    icon: Settings,
    title: "Smart Home Setup",
    details: ["Smart Lights", "Voice Control", "Security", "Automation"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/Smart_Home_Setup_gaqkdq.jpg",
  },
  {
    id: 15,
    icon: DoorOpen,
    title: "Door & Window",
    details: ["Door Repair", "Window Install", "Screen Replace", "Lock Fix"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Door_Window_Services_ipjyf2.jpg",
  },
  {
    id: 16,
    icon: Flame,
    title: "Geyser & Water Heater",
    details: [
      "Installation",
      "Thermostat Repair",
      "Element Replace",
      "Service",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Geyser_Water_Heater_uxgxsb.jpg",
  },
  {
    id: 17,
    icon: Fence,
    title: "Fencing & Gate",
    details: ["Fence Install", "Gate Repair", "Automation", "Boundary Wall"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Fencing_Gate_Work_koexy7.jpg",
  },
  {
    id: 18,
    icon: Lock,
    title: "Locksmith",
    details: ["Lock Repair", "Key Duplication", "Emergency Unlock", "Security"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Locksmith_Service_drgetb.jpg",
  },
  {
    id: 19,
    icon: Camera,
    title: "CCTV & Security",
    details: ["CCTV Install", "DVR Setup", "Remote Monitor", "Maintenance"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/CCTV_Security_abtcdk.jpg",
  },
  {
    id: 20,
    icon: Waves,
    title: "Water Purifier",
    details: ["RO Install", "Filter Change", "AMC Service", "Water Testing"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536167/Water_Purifier_Service_yktevb.jpg",
  },
  {
    id: 21,
    icon: TreePine,
    title: "Tree Service",
    details: ["Tree Trimming", "Removal", "Stump Grinding", "Plant Care"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/Tree_Service_Care_avpshd.jpg",
  },
  {
    id: 22,
    icon: Package,
    title: "Handyman",
    details: [
      "Minor Repairs",
      "Fixture Install",
      "Drywall Patch",
      "General Fixes",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Handyman_Services_ahcjtn.jpg",
  },
  {
    id: 23,
    icon: Sofa,
    title: "Upholstery Cleaning",
    details: [
      "Sofa Cleaning",
      "Mattress Clean",
      "Carpet Wash",
      "Stain Removal",
    ],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536166/Upholstery_Cleaning_aeodvk.jpg",
  },
  {
    id: 24,
    icon: Lightbulb,
    title: "Lighting Solutions",
    details: ["LED Install", "Chandelier", "Smart Lights", "Outdoor Lighting"],
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Lighting_Solutions_ey6zwl.jpg",
  },
];

const stats = [
  { icon: Users, number: "15,000+", label: "Happy Customers" },
  { icon: CheckCircle2, number: "75,000+", label: "Services Done" },
  { icon: Award, number: "800+", label: "Professionals" },
  { icon: Star, number: "4.9/5", label: "Avg Rating" },
];

const processSteps = [
  {
    step: "01",
    icon: Phone,
    title: "Book Service",
    description: "Choose service & schedule a convenient time",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563226/Book_Service_hwrt4t.jpg",
  },
  {
    step: "02",
    icon: Users,
    title: "Get Matched",
    description: "We assign the best verified pro for your need",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563225/Get_Matched_ua93zw.jpg",
  },
  {
    step: "03",
    icon: Wrench,
    title: "Service Done",
    description: "Expert arrives on time and completes work",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563231/Service_Done_wf7afl.jpg",
  },
  {
    step: "04",
    icon: Star,
    title: "Rate & Review",
    description: "Share your experience and enjoy quality",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563229/Rate_Review_dicdgy.jpg",
  },
];

function OurServicesPage() {
  const router = useRouter();
  const [visibleFeatured, setVisibleFeatured] = useState([]);
  const [visibleAdditional, setVisibleAdditional] = useState([]);
  const [visibleProcess, setVisibleProcess] = useState([]);
  const [visibleStats, setVisibleStats] = useState(false);

  const featuredRefs = useRef([]);
  const additionalRefs = useRef([]);
  const processRefs = useRef([]);
  const statsRef = useRef(null);

  useEffect(() => {
    const opts = { threshold: 0.15 };
    const makeObs = (refs, setter, visited) =>
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = refs.current.indexOf(e.target);
            if (i !== -1 && !visited.includes(i))
              setTimeout(() => setter((p) => [...p, i]), i * 60);
          }
        });
      }, opts);

    const fObs = makeObs(featuredRefs, setVisibleFeatured, visibleFeatured);
    const aObs = makeObs(
      additionalRefs,
      setVisibleAdditional,
      visibleAdditional,
    );
    const pObs = makeObs(processRefs, setVisibleProcess, visibleProcess);
    const sObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setVisibleStats(true)),
      opts,
    );

    featuredRefs.current.forEach((el) => el && fObs.observe(el));
    additionalRefs.current.forEach((el) => el && aObs.observe(el));
    processRefs.current.forEach((el) => el && pObs.observe(el));
    if (statsRef.current) sObs.observe(statsRef.current);

    return () => {
      fObs.disconnect();
      aObs.disconnect();
      pObs.disconnect();
      sObs.disconnect();
    };
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/Professional_Home_Services_Background_yzqgrf.jpg"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-red-700/85" />
        </div>

        <div className="relative z-8 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest text-red-200 uppercase mb-3">
              Home Services
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              Every Service
              <br />
              Your Home Needs
            </h1>
            <p className="text-base md:text-lg text-red-100 mb-8 max-w-xl leading-relaxed">
              Verified professionals for plumbing, electrical, cleaning, and 20+
              more services — anytime, anywhere.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-red-600 hover:bg-red-50 font-bold py-3 px-7 text-sm transition-all duration-200 flex items-center gap-2 group">
                Book a Service{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-red-600 font-bold py-3 px-7 text-sm transition-all duration-200">
                View All Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section ref={statsRef} className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className={`px-6 py-8 flex items-center gap-4 group hover:bg-red-600 transition-colors duration-200
                    ${visibleStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                    transition-all duration-500`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="w-10 h-10 bg-red-50 group-hover:bg-red-500 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-red-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900 group-hover:text-white transition-colors duration-200">
                      {s.number}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-red-100 font-medium transition-colors duration-200">
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured / Popular Services ──────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">
              Most Booked
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Popular Services
            </h2>
          </div>
        </div>

        {/* 2 cols mobile → 3 cols md → shared border grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
          {featuredServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                ref={(el) => {
                  if (el) featuredRefs.current[index] = el;
                }}
                className={`bg-white group overflow-hidden relative transition-all duration-500
                  ${visibleFeatured.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                {/* Image */}
                <div className="h-44 relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 bg-red-600 p-1.5">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-bold text-white">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-3 leading-snug line-clamp-2">
                    {service.description}
                  </p>

                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.features.map((f, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/services/${slugify(service.title)}`)
                    }
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-xs transition-colors duration-200 flex items-center justify-center gap-1.5"
                  >
                    Find Vendors <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── All Services Grid ─────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">
                Everything Under One Roof
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Complete Home Solutions
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-px bg-gray-200 border border-gray-200">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  ref={(el) => {
                    if (el) additionalRefs.current[index] = el;
                  }}
                  onClick={() =>
                    router.push(`/services/${slugify(service.title)}`)
                  }
                  className={`bg-white group cursor-pointer overflow-hidden relative transition-all duration-500
                    ${visibleAdditional.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${index * 40}ms` }}
                >
                  {/* Compact image */}
                  <div className="h-28 relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />
                    <div className="absolute top-2 left-2 bg-red-600 p-1">
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    {/* Hover overlay CTA */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
                        Book Now
                      </span>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="px-2.5 py-2 border-t border-gray-100 group-hover:border-red-500 transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-900 mb-1 truncate">
                      {service.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-2">
                      {service.details.slice(0, 2).map((d, i) => (
                        <span
                          key={i}
                          className="text-xs text-gray-400 truncate"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">
            Simple Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
          {processSteps.map((p, index) => {
            const Icon = p.icon;
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) processRefs.current[index] = el;
                }}
                className={`bg-white group overflow-hidden relative transition-all duration-500
                  ${visibleProcess.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="h-40 relative overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3 text-4xl font-black text-white/20 leading-none select-none">
                    {p.step}
                  </div>
                  <div className="absolute top-3 right-3 bg-red-600 p-1.5">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="p-4 group-hover:bg-red-600 transition-colors duration-300">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-white mb-1 transition-colors duration-300">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 group-hover:text-red-100 leading-snug transition-colors duration-300">
                    {p.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="bg-red-600 border-t-7 border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image panel */}
            <div className="relative h-64 lg:h-auto overflow-hidden">
              <img
                src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761538862/Team_imw68d.jpg"
                alt="Professional Team"
                className="w-full h-100 object-cover"
              />
              <div className="absolute inset-0 bg-red-900/40" />
              <div className="absolute bottom-6 left-6 bg-white px-5 py-3">
                <div className="text-2xl font-black text-red-600">24/7</div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                  Available
                </div>
              </div>
            </div>

            {/* Text panel */}
            <div className="p-5 md:p-7 flex flex-col justify-center">
              <p className="text-[10px] font-semibold tracking-wider text-red-200 uppercase mb-2">
                Get Help Today
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-snug">
                Having a problem?
                <br />
                We'll fix it today.
              </h2>

              <p className="text-red-100 text-xs mb-4 leading-relaxed max-w-sm">
                Instant access to verified professionals ready to solve your
                home service needs — fast response, quality work, guaranteed
                satisfaction.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-5">
                {[
                  "Verified Professionals",
                  "Same-Day Service",
                  "100% Satisfaction Guaranteed",
                  "No Hidden Charges",
                  "Emergency 24/7",
                  "Warranty on All Work",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-200 flex-shrink-0" />
                    <span className="text-white text-[11px] font-medium">
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-red-700 px-3 py-2 mb-4 w-fit">
                <Phone className="w-4 h-4 text-red-200 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-red-300 leading-none">
                    Call Us Now
                  </div>
                  <a
                    href="tel:+912342312323"
                    className="text-white font-bold text-sm hover:text-red-200 transition-colors"
                  >
                    (234) 231-2323
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="bg-white text-red-600 hover:bg-red-50 font-bold py-2 px-5 text-xs transition-colors duration-200 flex items-center gap-1.5">
                  Book Now <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button className="border border-white text-white hover:bg-white hover:text-red-600 font-bold py-2 px-5 text-xs transition-all duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OurServicesPage;
