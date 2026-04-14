"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";

export default function EditProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await api.user.getProfile();
      if (profile) {
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Profile updated successfully!");
        router.push('/userdashboard');
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      console.error("Update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-300 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] pt-24 pb-16 px-4">
      {/* 🔥 pt-24 = TOP SPACING FIX */}

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#2C2C2C] border border-[#3a3a3a] hover:border-red-500 transition"
          >
            <ArrowLeft size={16} className="text-gray-300" />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
            <p className="text-xs text-gray-400">Update your personal info</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-[#2f2f2f] rounded-xl p-6 shadow-lg">

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-[#1F1F1F] border border-[#3a3a3a] rounded-lg text-sm text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-[#1F1F1F] border border-[#3a3a3a] rounded-lg text-sm text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#1F1F1F] border border-[#3a3a3a] rounded-lg text-sm text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#1F1F1F] border border-[#3a3a3a] rounded-lg text-sm text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/userdashboard')}
                className="flex-1 py-2.5 text-sm rounded-lg bg-[#252525] border border-[#3a3a3a] text-gray-300 hover:bg-[#2f2f2f] transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 text-sm rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}