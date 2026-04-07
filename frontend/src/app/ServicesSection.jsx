"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Star, Wrench, Droplet, Zap, Wind, PaintBucket, Hammer, ArrowRight, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

function ServicesSection() {
  const router = useRouter();
  const [visibleCards, setVisibleCards] = useState([]);
  const [visibleTestimonials, setVisibleTestimonials] = useState(false);
  const cardsRef = useRef([]);
  const testimonialsRef = useRef(null);

  const services = [
    {
      id: 1,
      icon: Wrench,
      title: 'Cleaning',
      description: 'Professional deep cleaning for spotless, hygienic spaces',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg'
    },
    {
      id: 2,
      icon: Droplet,
      title: 'Plumbing',
      description: 'Expert plumbing repairs and installations for your home',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493810/Plumbing_lnokuk.jpg'
    },
    {
      id: 3,
      icon: Zap,
      title: 'Electrical',
      description: 'Safe and reliable electrical services by certified experts',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Electrical_l6gmd4.jpg'
    },
    {
      id: 4,
      icon: Wind,
      title: 'AC Repair',
      description: 'Fast AC repair and maintenance for optimal cooling',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493674/AC_Repair_pc979w.jpg'
    },
    {
      id: 5,
      icon: PaintBucket,
      title: 'Painting',
      description: 'Transform your space with premium painting services',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493687/Painting_cojmnd.jpg'
    },
    {
      id: 6,
      icon: Hammer,
      title: 'Carpentry',
      description: 'Custom woodwork and furniture crafted to perfection',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Carpentry_k6uqoa.jpg'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      text: 'Absolutely fantastic service! The team was professional, punctual, and exceeded all my expectations.',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      text: 'Best home service experience ever. They transformed my living room beautifully!',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      text: 'Highly recommend! Quality work at fair prices with excellent customer care throughout.',
      rating: 5
    }
  ];

  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px' };

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = cardsRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleCards.includes(index)) {
            setTimeout(() => setVisibleCards(prev => [...prev, index]), index * 80);
          }
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
    <div className="bg-white">

      {/* ── Services Section ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Our Top Services
            </h2>
          </div>
          <button
            onClick={() => router.push('/services')}
            className="inline-flex items-center gap-2 self-start sm:self-auto border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid — 2 cols on mobile, 3 on md, 4 on lg */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
          {services.map((service, index) => {
            const Icon = service.icon;
            const slug = slugify(service.title);
            return (
              <div
                key={service.id}
                ref={el => { if (el) cardsRef.current[index] = el; }}
                onClick={() => router.push(`/services/${slug}`)}
                className={`
                  bg-white group cursor-pointer relative overflow-hidden
                  transition-all duration-400
                  ${visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                {/* Square image — aspect-square keeps it perfectly square */}
                <div className="aspect-square relative overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Icon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

                  {/* Icon badge */}
                  <div className="absolute top-2.5 left-2.5 bg-red-600 p-1.5">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>

                  {/* Hover CTA overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-red-600 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider">
                      Find Vendors
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3 border-t border-gray-100 group-hover:border-red-500 transition-colors duration-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">{service.title}</h3>
                  <p className="text-xs text-gray-500 leading-snug line-clamp-1">{service.description}</p>
                </div>

                {/* Bottom red accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Testimonials & Stats ───────────────────────── */}
      <section
        ref={testimonialsRef}
        className="bg-gray-50 border-t border-gray-200 py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 transition-all duration-700 ${visibleTestimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div>
              <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">Customer Reviews</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Customers Say</h2>
            </div>
            <button className="inline-flex items-center gap-2 self-start sm:self-auto border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-2.5 px-5 text-sm transition-colors duration-200">
              Read All Reviews <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Stats panel (2/5 width on lg) */}
            <div className={`lg:col-span-2 transition-all duration-700 delay-100 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="bg-white border border-gray-200 h-full">

                {/* Stat grid */}
                <div className="grid grid-cols-2 border-b border-gray-200">
                  {[
                    { value: '10K+', label: 'Happy Customers' },
                    { value: '50K+', label: 'Jobs Done' },
                    { value: '4.9★', label: 'Avg Rating' },
                    { value: '98%', label: 'Satisfaction' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className={`p-5 ${i % 2 === 0 ? 'border-r border-gray-200' : ''} ${i < 2 ? 'border-b border-gray-200' : ''} hover:bg-red-600 hover:text-white transition-colors duration-200 group`}
                    >
                      <div className="text-2xl font-black text-gray-900 group-hover:text-white mb-0.5">{stat.value}</div>
                      <div className="text-xs text-gray-500 group-hover:text-red-100 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Trust badges */}
                <div className="divide-y divide-gray-100">
                  {[
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: '100% Verified Reviews', sub: 'All feedback is authentic' },
                    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Background-Checked Pros', sub: 'Secure & safe service' },
                    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: '2-Hour Response', sub: 'Fast & reliable booking' },
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-200">
                      <div className="w-8 h-8 bg-red-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{badge.title}</div>
                        <div className="text-xs text-gray-500">{badge.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Testimonials (3/5 width on lg) */}
            <div className={`lg:col-span-3 flex flex-col gap-4 transition-all duration-700 delay-200 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              {testimonials.map((t, i) => (
                <div
                  key={t.id}
                  className="bg-white border border-gray-200 p-5 hover:border-red-500 transition-colors duration-200 group"
                  style={{ transitionDelay: visibleTestimonials ? `${(i + 1) * 120}ms` : '0ms' }}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900">{t.name}</span>
                        <div className="flex gap-0.5 flex-shrink-0">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-red-600 text-red-600" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500"></div>
                        <span className="text-xs text-gray-400 font-medium">Verified Customer</span>
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