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
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-2 rounded-full shadow hover:scale-105 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-2 rounded-full shadow hover:scale-105 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentImage ? 'bg-white w-6' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl space-y-6 text-center lg:text-left">

          <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
            Trusted by 50,000+ Homeowners
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
            Smart Home Services at Your <span className="text-red-500">Fingertips</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Find and book trusted professionals for all your home needs in just a few clicks.
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white">Verified</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white">Fast Booking</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white">Secure</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition">
              Book Service →
            </button>
            <button className="bg-white text-red-600 px-5 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-100 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
