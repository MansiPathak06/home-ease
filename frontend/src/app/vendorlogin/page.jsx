"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin,
  Briefcase, FileText, DollarSign, Clock, Plus, Trash2
} from "lucide-react";

export default function VendorLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    serviceCategory: "",
    servicesOffered: "",
    description: "",
    yearsInBusiness: "",
    pricing: "",
    availability: "",
    website: "",
    certification: "",
  });

  // Custom dynamic fields state
  const [customFields, setCustomFields] = useState([]);

const serviceCategories = [
  // Cleaning Services
  "Home Cleaning",
  "Deep Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Sofa Cleaning",
  "Carpet Cleaning",
  "Mattress Cleaning",

  // Pest Control
  "Pest Control",
  "Termite Control",
  "Cockroach / Ant Control",
  "Bed Bug Control",

  // Appliance Repair
  "AC Repair & Service",
  "Washing Machine Repair",
  "Refrigerator Repair",
  "Microwave Repair",
  "TV Repair & Installation",
  "Geyser Repair",
  "Water Cooler Repair",

  // Electrical Services
  "Electrician",
  "Fan Installation / Repair",
  "Light & Switch Repair",
  "Inverter / Battery Service",

  // Plumbing Services
  "Plumber",
  "Tap & Faucet Repair",
  "Leakage Repair",
  "Bathroom Fittings Installation",
  "Water Tank Cleaning",

  // RO & Water
  "RO / Water Purifier Service",
  "RO Installation",
  "RO Filter Change",

  // Home Installation
  "CCTV Installation",
  "Doorbell Installation",
  "TV Wall Mount Installation",
  "Curtain & Blinds Installation",

  // Carpentry & Furniture
  "Carpenter",
  "Furniture Repair",
  "Modular Kitchen Repair",
  "Wardrobe Repair",

  // Painting & Renovation
  "House Painting",
  "Wall Putty & Polish",
  "Home Renovation",
  "Tiles & Flooring",

  // Shifting & Logistics
  "Packers & Movers",
  "Home Shifting Service",

  // Personal & Domestic Help
  "Cook / Chef at Home",
  "Babysitter / Nanny",
  "Elderly Care",
  "Maid Service",

  // IT & Digital
  "Laptop / Computer Repair",
  "WiFi / Internet Setup",
  "Printer Repair",

  // Misc Popular
  "Driver on Hire",
  "Gardening Service",
  "Home Sanitization",
  "Handyman Service"
];

  // --- Custom field handlers ---
  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  // --- Login handlers ---
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.auth.vendorLogin(loginData.email, loginData.password);

      if (data.success) {
        if (!data.isApproved) {
          setError("Your account is pending admin approval. Please wait for approval.");
          setLoading(false);
          return;
        }

        localStorage.setItem("userType", "vendor");
        localStorage.setItem("userEmail", loginData.email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("vendorId", data.vendor.id);

        router.push("/vendordashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Convert custom fields array → object, skip empty keys
      const additionalInfo = {};
      customFields.forEach(({ key, value }) => {
        if (key.trim()) {
          additionalInfo[key.trim()] = value.trim();
        }
      });

      const payload = {
        ...registerData,
        // Only include additionalInfo if the vendor actually added custom fields
        ...(Object.keys(additionalInfo).length > 0 && {
          additionalInfo: JSON.stringify(additionalInfo),
        }),
      };

      const data = await api.auth.vendorRegister(payload);

      if (data.success) {
        setSuccess(
          data.message || "Registration successful! Your account is pending admin approval."
        );
        setTimeout(() => setIsLogin(true), 3000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg mb-3">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? "Vendor Portal" : "Vendor Registration"}
          </h1>
          <p className="text-sm text-gray-600">
            {isLogin
              ? "Sign in to manage your services."
              : "Register your business and reach more customers!"}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-lg shadow-sm max-w-sm mx-auto border border-gray-200">
          <button
            onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
              isLogin ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
              !isLogin ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Register
          </button>
        </div>

        {/* Forms Container */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">

          {/* ── LOGIN FORM ── */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="email" type="email" required
                    value={loginData.email} onChange={handleLoginChange}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="vendor@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="password" type={showPassword ? "text" : "password"} required
                    value={loginData.password} onChange={handleLoginChange}
                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword
                      ? <EyeOff className="h-4 w-4 text-gray-400" />
                      : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-red-600 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

          ) : (
            /* ── REGISTRATION FORM ── */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Business Name *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input name="businessName" type="text" required
                      value={registerData.businessName} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="ABC Services" />
                  </div>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Owner Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input name="ownerName" type="text" required
                      value={registerData.ownerName} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="John Doe" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input name="email" type="email" required
                      value={registerData.email} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="vendor@example.com" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input name="password" type={showPassword ? "text" : "password"} required
                      value={registerData.password} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="Create a strong password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword
                        ? <EyeOff className="h-4 w-4 text-gray-400" />
                        : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input name="phone" type="tel" required
                      value={registerData.phone} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="+91 98765 43210" />
                  </div>
                </div>

                {/* Service Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Service Category *
                  </label>
                  <select name="serviceCategory" required
                    value={registerData.serviceCategory} onChange={handleRegisterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500">
                    <option value="">Select a category</option>
                    {serviceCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Business Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input name="address" type="text" required
                    value={registerData.address} onChange={handleRegisterChange}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="123 Main Street" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">City *</label>
                  <input name="city" type="text" required
                    value={registerData.city} onChange={handleRegisterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="New Delhi" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">State *</label>
                  <input name="state" type="text" required
                    value={registerData.state} onChange={handleRegisterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Delhi" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">ZIP Code *</label>
                  <input name="zipCode" type="text" required
                    value={registerData.zipCode} onChange={handleRegisterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="110001" />
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Services Offered *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea name="servicesOffered" required rows="2"
                    value={registerData.servicesOffered} onChange={handleRegisterChange}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                    placeholder="List the specific services you provide..." />
                </div>
              </div>

              {/* Business Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Business Description *
                </label>
                <textarea name="description" required rows="3"
                  value={registerData.description} onChange={handleRegisterChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                  placeholder="Describe your business, experience, and what makes you unique..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Years in Business */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Years in Business *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input name="yearsInBusiness" type="number" required
                      value={registerData.yearsInBusiness} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="5" />
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Pricing Range *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input name="pricing" type="text" required
                      value={registerData.pricing} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="₹500 - ₹2000" />
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Availability
                  </label>
                  <input name="availability" type="text"
                    value={registerData.availability} onChange={handleRegisterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Mon-Sat, 9AM-6PM" />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Website
                  </label>
                  <input name="website" type="url"
                    value={registerData.website} onChange={handleRegisterChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="https://www.example.com" />
                </div>
              </div>

              {/* Certification */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Certifications / Licenses
                </label>
                <input name="certification" type="text"
                  value={registerData.certification} onChange={handleRegisterChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  placeholder="List any relevant certifications or licenses" />
              </div>

              {/* ── ADDITIONAL INFORMATION (DYNAMIC FIELDS) ── */}
              <div className="border border-dashed border-red-200 bg-red-50/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Additional Information
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Add extra details like GST Number, Team Size, Languages Spoken, etc.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Field
                  </button>
                </div>

                {customFields.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2 border border-dashed border-gray-200 rounded-md">
                    No extra fields yet — click "Add Field" to include more info
                  </p>
                )}

                {customFields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Field Name (e.g. GST Number)"
                      value={field.key}
                      onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
                      className="w-5/12 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {/* ── END ADDITIONAL INFORMATION ── */}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-xs">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-red-600 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Submitting..." : "Submit for Approval"}
              </button>

              <p className="text-xs text-gray-600 text-center">
                By registering, you agree to our Terms of Service and Privacy Policy.
                Your account will be reviewed by our admin team before activation.
              </p>
            </form>
          )}

          {/* Back to Main Login */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-600">
              Not a vendor?{" "}
              <a href="/login" className="font-semibold text-red-600 hover:text-red-700">
                User Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}