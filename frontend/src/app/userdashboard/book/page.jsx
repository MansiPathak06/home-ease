"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Users, MessageSquare, CheckCircle, IndianRupee, MapPin, Star, Shield } from "lucide-react";

export default function BookService() {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    guests: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const selectedVendor = localStorage.getItem("selectedVendor");
    if (selectedVendor) {
      setVendor(JSON.parse(selectedVendor));
    } else {
      router.push("/userdashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/user/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendor_id: vendor.id,
          service_name: vendor.service_category || vendor.serviceCategory,
          vendor_name: vendor.business_name || vendor.businessName,
          date: bookingData.date,
          time: bookingData.time,
          guests: bookingData.guests,
          message: bookingData.message,
          amount: 0,
          status: "pending",
        }),
      });

      if (response.ok) {
        setSuccess(true);
        localStorage.removeItem("selectedVendor");
        setTimeout(() => router.push("/userdashboard"), 2500);
      } else {
        const data = await response.json();
        setError(data.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
  ];

  const today = new Date().toISOString().split("T")[0];

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Requested!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Your booking with <span className="font-semibold text-gray-800">{vendor.business_name || vendor.businessName}</span> has been submitted.
          </p>
          <p className="text-gray-400 text-xs mt-3">Redirecting to dashboard...</p>
          <div className="mt-5 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  const businessName = vendor.business_name || vendor.businessName || "Vendor";
  const serviceCategory = vendor.service_category || vendor.serviceCategory || "Service";
  const pricing = vendor.pricing || "Contact for pricing";
  const city = vendor.city || "";
  const state = vendor.state || "";
  const rating = vendor.average_rating || vendor.averageRating || 4.5;

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Top nav */}
      <div className="sticky top-16 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Book a Service</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Vendor Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-100 text-xs font-semibold uppercase tracking-wider mb-1">{serviceCategory}</p>
                <h1 className="text-2xl font-bold">{businessName}</h1>
                {(city || state) && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-100 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{[city, state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "fill-yellow-300 text-yellow-300" : "text-red-300"}`} />
                  ))}
                </div>
                <p className="text-red-100 text-xs">{rating} rating</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center justify-between bg-orange-50 border-t border-orange-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <p>Starting from</p>
              <IndianRupee className="w-4 h-4 text-orange-600" />
              <span className="font-semibold">{pricing}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              Verified Vendor
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Book This Service</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill in your details and we'll confirm shortly</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date & Time */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                Date & Time
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                  <input
                    name="date"
                    type="date"
                    required
                    min={today}
                    value={bookingData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Preferred Time <span className="text-red-500">*</span></label>
                  <select
                    name="time"
                    required
                    value={bookingData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                Number of Guests <span className="text-red-500">*</span>
              </label>
              <input
                name="guests"
                type="number"
                min="1"
                max="10000"
                required
                value={bookingData.guests}
                onChange={handleChange}
                placeholder="e.g. 100"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-500" />
                Special Requirements
              </label>
              <textarea
                name="message"
                rows="4"
                value={bookingData.message}
                onChange={handleChange}
                placeholder="Any special requests, dietary requirements, theme preferences, or additional notes for the vendor..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
              />
            </div>

            {/* Price Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <IndianRupee className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Pricing in Indian Rupees (₹)</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  The vendor will confirm the final pricing in ₹ after reviewing your booking request.
                  Vendor's listed range: <span className="font-medium">{pricing}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 flex-grow-[2] py-3 px-6 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-red-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { emoji: "🔒", text: "Secure Booking" },
            { emoji: "✅", text: "Verified Vendors" },
            { emoji: "💬", text: "24/7 Support" },
          ].map(({ emoji, text }) => (
            <div key={text} className="bg-white border border-gray-100 rounded-xl py-3 px-2 text-center shadow-sm">
              <p className="text-lg mb-1">{emoji}</p>
              <p className="text-xs font-medium text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}