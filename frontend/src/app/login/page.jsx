"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Briefcase } from "lucide-react";
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = "pathakmansi608@gmail.com";
  const ADMIN_PASSWORD = "@Mansi123";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.auth.login(formData.email, formData.password);
      
      if (data.success) {
        localStorage.setItem("userType", data.user.type || "user");
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("token", data.token);
        
        if (data.user.type === "admin") {
          router.push("/admindashboard");
        } else {
          router.push("/userdashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mt-20 bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg mb-3">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-600">Sign in to continue to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                {error}
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-xs text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-xs font-medium text-red-600 hover:text-red-700">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">Or continue as</span>
              </div>
            </div>
          </div>

          {/* Vendor Login Link */}
          <a
            href="/vendorlogin"
            className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Vendor Login
          </a>

          {/* Sign Up Link */}
          <p className="mt-4 text-center text-xs text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="font-semibold text-red-600 hover:text-red-700">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}