
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminTrackingPanel from "@/components/admin/AdminTrackingPanel";
import { api } from "@/lib/api";
import AdminBookingsSection   from "./AdminBookingsSection";
import AdminVendorSection     from "./AdminVendorSection";
import AdminUsersSection      from "./AdminUsersSection";
import AdminPaymentsSection   from "./AdminPaymentsSection";
import AdminCategoriesSection from "./AdminCategoriesSection";
import {
  Users, Briefcase, CheckCircle, Calendar,
  LogOut, Bell, BookOpen, IndianRupee, Tag,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bookings");
  const [stats, setStats] = useState({
    totalVendors: 0, pendingVendors: 0, approvedVendors: 0, totalUsers: 0,
  });

  useEffect(() => {
    if (localStorage.getItem("userType") !== "admin") {
      router.push("/login");
      return;
    }
    api.admin.getUsers().then(data => {
      setStats(prev => ({ ...prev, totalUsers: (data ?? []).length }));
    }).catch(console.error);
  }, []);

  const handleVendorStatsChange = useCallback(({ totalVendors, pendingVendors, approvedVendors }) => {
    setStats(prev => ({ ...prev, totalVendors, pendingVendors, approvedVendors }));
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  const TABS = [
    { key: "bookings",   label: "Bookings",                        icon: BookOpen    },
    { key: "vendors",    label: `Vendors (${stats.totalVendors})`, icon: Briefcase   },
    { key: "users",      label: `Users (${stats.totalUsers})`,     icon: Users       },
    { key: "payments",   label: "Payments",                        icon: IndianRupee },
    { key: "categories", label: "Categories",                      icon: Tag         },
  ];

  return (
    <div className="min-h-screen mt-20 bg-gray-50">

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-red-600">Admin Dashboard</h1>
              <p className="text-xs text-gray-600 mt-0.5">Manage vendors, users, bookings and payments</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Vendors",    val: stats.totalVendors,    color: "border-blue-500",   bg: "bg-blue-100",   Icon: Briefcase,   iconColor: "text-blue-600"   },
            { label: "Pending Approval", val: stats.pendingVendors,  color: "border-yellow-500", bg: "bg-yellow-100", Icon: Calendar,    iconColor: "text-yellow-600" },
            { label: "Approved Vendors", val: stats.approvedVendors, color: "border-green-500",  bg: "bg-green-100",  Icon: CheckCircle, iconColor: "text-green-600"  },
            { label: "Total Users",      val: stats.totalUsers,      color: "border-red-500",    bg: "bg-red-100",    Icon: Users,       iconColor: "text-red-600"    },
          ].map(({ label, val, color, bg, Icon, iconColor }) => (
            <div key={label} className={`bg-white rounded-lg shadow-sm p-4 border-l-2 ${color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{val}</p>
                </div>
                <div className={`${bg} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 bg-white p-1 rounded-lg border border-gray-200 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === key ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "bookings" && (
  <>
    <AdminTrackingPanel bookings={[]} />
    <AdminBookingsSection />
  </>
)}
        {activeTab === "vendors"    && <AdminVendorSection onStatsChange={handleVendorStatsChange} />}
        {activeTab === "users"      && <AdminUsersSection />}
        {activeTab === "payments"   && <AdminPaymentsSection />}
        {activeTab === "categories" && <AdminCategoriesSection />}

      </div>
    </div>
  );
}