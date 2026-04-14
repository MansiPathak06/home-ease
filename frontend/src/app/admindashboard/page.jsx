
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
  <div className="min-h-screen mt-20" style={{ backgroundColor: "#111111" }}>

    {/* HEADER */}
    <header style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#CC0000" }}>
              Admin Dashboard
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#999999" }}>
              Manage vendors, users, bookings and payments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg relative"
              style={{ backgroundColor: "#111111" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#111111")}
            >
              <Bell className="w-5 h-5" style={{ color: "#999999" }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "#CC0000" }}></span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
              style={{ backgroundColor: "#CC0000", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B0000")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#CC0000")}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Vendors", val: stats.totalVendors, Icon: Briefcase },
          { label: "Pending Approval", val: stats.pendingVendors, Icon: Calendar },
          { label: "Approved Vendors", val: stats.approvedVendors, Icon: CheckCircle },
          { label: "Total Users", val: stats.totalUsers, Icon: Users },
        ].map(({ label, val, Icon }) => (
          <div
            key={label}
            className="rounded-lg p-4 transition-all"
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B0000")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: "#999999" }} className="text-xs font-medium">
                  {label}
                </p>
                <p className="text-xl font-bold text-white mt-1">{val}</p>
              </div>

              <div style={{ backgroundColor: "#2a0000" }} className="p-2 rounded-lg">
                <Icon className="w-5 h-5" style={{ color: "#CC0000" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-lg overflow-x-auto"
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
        }}
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all"
            style={
              activeTab === key
                ? { backgroundColor: "#CC0000", color: "#fff" }
                : { color: "#999999" }
            }
            onMouseEnter={(e) => {
              if (activeTab !== key) e.currentTarget.style.backgroundColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== key) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div>
        {activeTab === "bookings" && (
          <>
            <AdminTrackingPanel bookings={[]} />
            <AdminBookingsSection />
          </>
        )}
        {activeTab === "vendors" && (
          <AdminVendorSection onStatsChange={handleVendorStatsChange} />
        )}
        {activeTab === "users" && <AdminUsersSection />}
        {activeTab === "payments" && <AdminPaymentsSection />}
        {activeTab === "categories" && <AdminCategoriesSection />}
      </div>
    </div>
  </div>
);
}