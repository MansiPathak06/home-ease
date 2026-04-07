import React from 'react';
import { Home, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Services', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Use', href: '#' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' }
  ];

  return (
    <footer className="bg-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Home Ease</h3>
                <p className="text-sm text-red-600 font-semibold">Smart Home Services, Simplified</p>
              </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              Your trusted partner for all home maintenance needs — from cleaning and plumbing to electrical and carpentry services, all in one place.
            </p>
            
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h4>
            <nav className="flex flex-col space-y-3">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-red-600 hover:text-red-800 hover:underline transition-all duration-300 font-medium inline-flex items-center group"
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
            <h4 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a 
                    href="mailto:support@homeease.com" 
                    className="text-gray-900 hover:text-red-600 transition-colors duration-300 font-medium"
                  >
                    support@homeease.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a 
                    href="tel:+911234567890" 
                    className="text-gray-900 hover:text-red-600 transition-colors duration-300 font-medium"
                  >
                    +91 123 456 7890
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900 font-medium">Lucknow, Uttar Pradesh, India</p>
                </div>
              </div>
            </div>
            
            <a
              href="#contact"
              className="inline-block w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 text-center"
            >
              Get in Touch
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Additional Links */}
        <div className="text-center text-sm text-gray-600 mb-8">
          <p className="mb-2">
            Trusted by thousands of homeowners across India
          </p>
          <p>
            Available 24/7 • Verified Professionals • Secure Payments • Satisfaction Guaranteed
          </p>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="bg-red-600 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-white text-sm font-medium">
            © 2025 Home Ease. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;