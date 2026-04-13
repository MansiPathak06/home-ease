"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Shield } from 'lucide-react';

export default function HomeEaseHero() {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
      alt: 'Professional cleaner at work'
    },
    {
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
      alt: 'Plumber fixing pipes'
    },
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
      alt: 'Electrician working'
    },
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
      alt: 'AC repair technician'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-[100vh] mt-4 overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Darker overlay to match dark theme */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,10,10,0.72)' }} />
      </div>

      {/* Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full shadow hover:scale-105 transition"
        style={{ backgroundColor: '#1e1e1e', border: '1px solid #3a3a3a', color: '#C0392B' }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full shadow hover:scale-105 transition"
        style={{ backgroundColor: '#1e1e1e', border: '1px solid #3a3a3a', color: '#C0392B' }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-2 rounded-full transition-all`}
            style={{
              width: index === currentImage ? '24px' : '8px',
              backgroundColor: index === currentImage ? '#C0392B' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl space-y-6 text-center lg:text-left">

          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide"
            style={{ backgroundColor: 'rgba(192,57,43,0.18)', color: '#e87c6e', border: '1px solid rgba(192,57,43,0.35)' }}
          >
            Trusted by 50,000+ Homeowners
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
            Smart Home Services at Your{' '}
            <span style={{ color: '#C0392B' }}>Fingertips</span>
          </h1>

          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#c0c0c0' }}>
            Find and book trusted professionals for all your home needs in just a few clicks.
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-3">
            {[
              { Icon: CheckCircle, label: 'Verified' },
              { Icon: Clock,        label: 'Fast Booking' },
              { Icon: Shield,       label: 'Secure' },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(192,57,43,0.25)' }}
              >
                <Icon className="w-4 h-4" style={{ color: '#C0392B' }} />
                <span className="text-xs text-white">{label}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition"
              style={{ backgroundColor: '#C0392B' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#991b1b'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C0392B'}
            >
              Book Service →
            </button>
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: '#1e1e1e', color: '#e87c6e', border: '1px solid #C0392B' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e1e1e'}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}