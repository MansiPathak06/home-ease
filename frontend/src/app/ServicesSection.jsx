"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Star, ArrowRight, Wrench, Droplet, Zap, Wind, PaintBucket, Hammer,
  Sparkles, Bug, Tv, Drill, Truck, Settings, Lightbulb, Sofa, Lock,
  Camera, Waves, TreePine, Package, Flame, DoorOpen, UtensilsCrossed,
  Baby, Heart, User, Laptop, Wifi, Printer, Car, Leaf, Shield, Home,
  Scissors, Thermometer } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function toSlug(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const categoryIconMap = {
  "Home Cleaning":               Sparkles,
  "Deep Cleaning":               Sparkles,
  "Kitchen Cleaning":            Sparkles,
  "Bathroom Cleaning":           Sparkles,
  "Sofa Cleaning":               Sofa,
  "Carpet Cleaning":             Sofa,
  "Mattress Cleaning":           Sofa,
  "Pest Control":                Bug,
  "Termite Control":             Bug,
  "Cockroach / Ant Control":     Bug,
  "Bed Bug Control":             Bug,
  "AC Repair & Service":         Wind,
  "Washing Machine Repair":      Wrench,
  "Refrigerator Repair":         Thermometer,
  "Microwave Repair":            Wrench,
  "TV Repair & Installation":    Tv,
  "Geyser Repair":               Flame,
  "Water Cooler Repair":         Waves,
  "Electrician":                 Zap,
  "Fan Installation / Repair":   Lightbulb,
  "Light & Switch Repair":       Lightbulb,
  "Inverter / Battery Service":  Zap,
  "Plumber":                     Droplet,
  "Tap & Faucet Repair":         Droplet,
  "Leakage Repair":              Droplet,
  "Bathroom Fittings Installation": Droplet,
  "Water Tank Cleaning":         Waves,
  "RO / Water Purifier Service": Waves,
  "RO Installation":             Waves,
  "RO Filter Change":            Waves,
  "CCTV Installation":           Camera,
  "Doorbell Installation":       DoorOpen,
  "TV Wall Mount Installation":  Tv,
  "Curtain & Blinds Installation": Home,
  "Carpenter":                   Hammer,
  "Furniture Repair":            Hammer,
  "Modular Kitchen Repair":      Hammer,
  "Wardrobe Repair":             Hammer,
  "House Painting":              PaintBucket,
  "Wall Putty & Polish":         PaintBucket,
  "Home Renovation":             Home,
  "Tiles & Flooring":            Home,
  "Packers & Movers":            Truck,
  "Home Shifting Service":       Truck,
  "Cook / Chef at Home":         UtensilsCrossed,
  "Babysitter / Nanny":          Baby,
  "Elderly Care":                Heart,
  "Maid Service":                User,
  "Laptop / Computer Repair":    Laptop,
  "WiFi / Internet Setup":       Wifi,
  "Printer Repair":              Printer,
  "Driver on Hire":              Car,
  "Gardening Service":           Leaf,
  "Home Sanitization":           Shield,
  "Handyman Service":            Wrench,
};

const categoryImageMap = {
  "Home Cleaning":               "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg",
  "Deep Cleaning":               "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg",
  "Kitchen Cleaning":            "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg",
  "Bathroom Cleaning":           "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg",
  "Sofa Cleaning":               "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536166/Upholstery_Cleaning_aeodvk.jpg",
  "Carpet Cleaning":             "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536166/Upholstery_Cleaning_aeodvk.jpg",
  "Mattress Cleaning":           "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536166/Upholstery_Cleaning_aeodvk.jpg",
  "Pest Control":                "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Pest_Control_effbvx.jpg",
  "Termite Control":             "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Pest_Control_effbvx.jpg",
  "Cockroach / Ant Control":     "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Pest_Control_effbvx.jpg",
  "Bed Bug Control":             "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Pest_Control_effbvx.jpg",
  "AC Repair & Service":         "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493674/AC_Repair_pc979w.jpg",
  "Washing Machine Repair":      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761499268/Appliance_Repair_ybs8nw.jpg",
  "Refrigerator Repair":         "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761499268/Appliance_Repair_ybs8nw.jpg",
  "Microwave Repair":            "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761499268/Appliance_Repair_ybs8nw.jpg",
  "TV Repair & Installation":    "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/TV_Electronics_Setup_qlbsig.jpg",
  "Geyser Repair":               "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Geyser_Water_Heater_uxgxsb.jpg",
  "Water Cooler Repair":         "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Geyser_Water_Heater_uxgxsb.jpg",
  "Electrician":                 "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Electrical_l6gmd4.jpg",
  "Fan Installation / Repair":   "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Lighting_Solutions_ey6zwl.jpg",
  "Light & Switch Repair":       "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Lighting_Solutions_ey6zwl.jpg",
  "Inverter / Battery Service":  "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Electrical_l6gmd4.jpg",
  "Plumber":                     "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493810/Plumbing_lnokuk.jpg",
  "Tap & Faucet Repair":         "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493810/Plumbing_lnokuk.jpg",
  "Leakage Repair":              "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493810/Plumbing_lnokuk.jpg",
  "Bathroom Fittings Installation": "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Locksmith_Service_drgetb.jpg",
  "Water Tank Cleaning":         "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/Tree_Service_Care_avpshd.jpg",
  "RO / Water Purifier Service": "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536167/Water_Purifier_Service_yktevb.jpg",
  "RO Installation":             "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536167/Water_Purifier_Service_yktevb.jpg",
  "RO Filter Change":            "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536167/Water_Purifier_Service_yktevb.jpg",
  "CCTV Installation":           "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/CCTV_Security_abtcdk.jpg",
  "Doorbell Installation":       "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Door_Window_Services_ipjyf2.jpg",
  "TV Wall Mount Installation":  "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/TV_Electronics_Setup_qlbsig.jpg",
  "Curtain & Blinds Installation":"https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Door_Window_Services_ipjyf2.jpg",
  "Carpenter":                   "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536143/Carpentry_Work_rvo7n7.jpg",
  "Furniture Repair":            "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Furniture_Assembly_frfjwc.jpg",
  "Modular Kitchen Repair":      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536143/Carpentry_Work_rvo7n7.jpg",
  "Wardrobe Repair":             "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536143/Carpentry_Work_rvo7n7.jpg",
  "House Painting":              "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493687/Painting_cojmnd.jpg",
  "Wall Putty & Polish":         "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493687/Painting_cojmnd.jpg",
  "Home Renovation":             "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Home_Renovation_w7qwi8.jpg",
  "Tiles & Flooring":            "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Fencing_Gate_Work_koexy7.jpg",
  "Packers & Movers":            "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536148/Moving_Shifting_dqu5gl.jpg",
  "Home Shifting Service":       "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536148/Moving_Shifting_dqu5gl.jpg",
  "Cook / Chef at Home":         "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg",
  "Babysitter / Nanny":          "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563225/Get_Matched_ua93zw.jpg",
  "Elderly Care":                "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563225/Get_Matched_ua93zw.jpg",
  "Maid Service":                "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg",
  "Laptop / Computer Repair":    "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/Smart_Home_Setup_gaqkdq.jpg",
  "WiFi / Internet Setup":       "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/Smart_Home_Setup_gaqkdq.jpg",
  "Printer Repair":              "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761499268/Appliance_Repair_ybs8nw.jpg",
  "Driver on Hire":              "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536148/Moving_Shifting_dqu5gl.jpg",
  "Gardening Service":           "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Gardening_Landscaping_hj5qae.jpg",
  "Home Sanitization":           "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Handyman_Services_ahcjtn.jpg",
  "Handyman Service":            "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Handyman_Services_ahcjtn.jpg",
};

const ALL_SERVICES = [
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

const FEATURED = ALL_SERVICES.slice(0, 6);

function ServicesSection() {
  const router = useRouter();
  const [visibleCards, setVisibleCards] = useState([]);
  const [visibleTestimonials, setVisibleTestimonials] = useState(false);
  const cardsRef = useRef([]);
  const testimonialsRef = useRef(null);

  const testimonials = [
    { id: 1, name: 'Sarah Johnson',   text: 'Absolutely fantastic service! The team was professional, punctual, and exceeded all my expectations.', rating: 5 },
    { id: 2, name: 'Michael Chen',    text: 'Best home service experience ever. They transformed my living room beautifully!',                        rating: 5 },
    { id: 3, name: 'Emily Rodriguez', text: 'Highly recommend! Quality work at fair prices with excellent customer care throughout.',                  rating: 5 },
  ];

  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px' };
    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = cardsRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleCards.includes(index))
            setTimeout(() => setVisibleCards(prev => [...prev, index]), index * 80);
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const testimonialsObserver = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setVisibleTestimonials(true)),
      observerOptions
    );
    cardsRef.current.forEach(card => { if (card) observer.observe(card); });
    if (testimonialsRef.current) testimonialsObserver.observe(testimonialsRef.current);
    return () => { observer.disconnect(); testimonialsObserver.disconnect(); };
  }, [visibleCards]);

  return (
    <div style={{ backgroundColor: '#111111' }}>
      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C0392B' }}>
              What We Offer
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#f0f0f0' }}>
              Our Top Services
            </h2>
          </div>
          <button
            onClick={() => router.push('/services')}
            className="inline-flex items-center gap-2 self-start sm:self-auto font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
            style={{ border: '2px solid #C0392B', color: '#C0392B', backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C0392B'; }}
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px" style={{ backgroundColor: '#2a2a2a', border: '1px solid #2a2a2a' }}>
          {FEATURED.map((title, index) => {
            const Icon = categoryIconMap[title] || Wrench;
            const image = categoryImageMap[title];
            const slug = toSlug(title);
            return (
              <div
                key={title}
                ref={el => { if (el) cardsRef.current[index] = el; }}
                onClick={() => router.push(`/services/${slug}`)}
                className={`group cursor-pointer relative overflow-hidden transition-all duration-400
                  ${visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ backgroundColor: '#1a1a1a', transitionDelay: `${index * 60}ms` }}
              >
                <div className="aspect-square relative overflow-hidden">
                  {image ? (
                    <img src={image} alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#2a2a2a' }}>
                      <Icon className="w-10 h-10" style={{ color: '#555' }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                  <div className="absolute top-2.5 left-2.5 p-1.5" style={{ backgroundColor: '#C0392B' }}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xs font-bold px-4 py-2 uppercase tracking-wider" style={{ backgroundColor: '#C0392B' }}>
                      Find Vendors
                    </span>
                  </div>
                </div>
                <div
                  className="p-3 border-t transition-colors duration-200"
                  style={{ borderColor: '#2a2a2a' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#C0392B'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                >
                  <h3 className="text-xs font-bold mb-0.5 line-clamp-1" style={{ color: '#f0f0f0' }}>{title}</h3>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: '#C0392B' }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials & Stats */}
      <section ref={testimonialsRef} className="border-t py-14" style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 transition-all duration-700 ${visibleTestimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C0392B' }}>
                Customer Reviews
              </p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#f0f0f0' }}>
                What Our Customers Say
              </h2>
            </div>
            <button
              className="inline-flex items-center gap-2 self-start sm:self-auto font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
              style={{ border: '2px solid #C0392B', color: '#C0392B', backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C0392B'; }}
            >
              Read All Reviews <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Stats panel */}
            <div className={`lg:col-span-2 transition-all duration-700 delay-100 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="border h-full" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                <div className="grid grid-cols-2" style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {[
                    { value: '10K+', label: 'Happy Customers' },
                    { value: '50K+', label: 'Jobs Done' },
                    { value: '4.9★', label: 'Avg Rating' },
                    { value: '98%',  label: 'Satisfaction' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-5 transition-colors duration-200 group cursor-default"
                      style={{
                        borderRight: i % 2 === 0 ? '1px solid #2a2a2a' : 'none',
                        borderBottom: i < 2 ? '1px solid #2a2a2a' : 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div className="text-2xl font-black mb-0.5" style={{ color: '#f0f0f0' }}>{stat.value}</div>
                      <div className="text-xs font-medium" style={{ color: '#888' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a' }}>
                  {[
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: '100% Verified Reviews', sub: 'All feedback is authentic' },
                    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Background-Checked Pros', sub: 'Secure & safe service' },
                    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: '2-Hour Response', sub: 'Fast & reliable booking' },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-200"
                      style={{ borderBottom: i < 2 ? '1px solid #2a2a2a' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(192,57,43,0.15)' }}>
                        <svg className="w-4 h-4" style={{ color: '#C0392B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: '#f0f0f0' }}>{badge.title}</div>
                        <div className="text-xs" style={{ color: '#888' }}>{badge.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className={`lg:col-span-3 flex flex-col gap-4 transition-all duration-700 delay-200 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              {testimonials.map((t, i) => (
                <div
                  key={t.id}
                  className="p-5 border transition-colors duration-200"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#2a2a2a',
                    transitionDelay: visibleTestimonials ? `${(i + 1) * 120}ms` : '0ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#C0392B'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: '#C0392B' }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold" style={{ color: '#f0f0f0' }}>{t.name}</span>
                        <div className="flex gap-0.5 flex-shrink-0">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3" style={{ fill: '#C0392B', color: '#C0392B' }} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#aaa' }}>"{t.text}"</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5" style={{ backgroundColor: '#22c55e' }}></div>
                        <span className="text-xs font-medium" style={{ color: '#666' }}>Verified Customer</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesSection;