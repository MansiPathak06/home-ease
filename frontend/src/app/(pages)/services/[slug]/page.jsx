"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Star, IndianRupee, Shield, Search, Navigation, Filter, ArrowLeft, Loader2, Users, ChevronRight } from "lucide-react";

// Maps slug → display name and API search term
const SERVICE_META = {
  "cleaning":         { name: "House Cleaning",      search: "Cleaning"    },
  "plumbing":         { name: "Plumbing",             search: "Plumbing"    },
  "electrical":       { name: "Electrical",           search: "Electrical"  },
  "ac-repair":        { name: "AC Service & Repair",  search: "AC"          },
  "painting":         { name: "Painting",             search: "Painting"    },
  "carpentry":        { name: "Carpentry",            search: "Carpentry"   },
  "pest-control":     { name: "Pest Control",         search: "Pest"        },
  "gardening":        { name: "Gardening",            search: "Gardening"   },
  "moving-shifting":  { name: "Moving & Shifting",    search: "Moving"      },
  "cctv-security":    { name: "CCTV & Security",      search: "CCTV"        },
  "appliance-repair": { name: "Appliance Repair",     search: "Appliance"   },
  "home-renovation":  { name: "Home Renovation",      search: "Renovation"  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const CITIES = ["All Cities", "Lucknow", "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad"];

export default function ServiceVendorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug || "";

  const meta = SERVICE_META[slug] || { name: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()), search: slug };

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [sortBy, setSortBy] = useState("rating"); // rating | price

  useEffect(() => {
    fetchVendors();
  }, [slug, city]);

  const fetchVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("query", meta.search);
      if (city && city !== "All Cities") params.append("city", city);
      const res = await fetch(`${API_URL}/vendors/search?${params}`);
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      setVendors(list);

      // Auto-redirect if exactly one vendor
      if (list.length === 1) {
        // Store the vendor and go to user dashboard
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedVendor", JSON.stringify(list[0]));
        }
        router.push("/userdashboard");
      }
    } catch (err) {
      setError("Could not load vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const detected = data.address?.city || data.address?.town || data.address?.state_district || "";
          if (detected) setCity(detected);
        } catch (_) {}
        setDetectingLoc(false);
      },
      () => setDetectingLoc(false)
    );
  };

  const filtered = vendors
    .filter((v) => {
      const q = search.toLowerCase();
      const name = (v.business_name || v.businessName || "").toLowerCase();
      const desc = (v.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "rating") return ((b.average_rating || b.averageRating || 0) - (a.average_rating || a.averageRating || 0));
      if (sortBy === "price")  return ((a.pricing || 0) - (b.pricing || 0));
      return 0;
    });

  const gp = (v, camel, snake, fb = "") => ((v?.[camel] || v?.[snake] || fb) ?? "").toString();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-red-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold mb-1">{meta.name}</h1>
          <p className="text-red-200 text-sm">
            {loading ? "Searching vendors…" : `${filtered.length} vendor${filtered.length !== 1 ? "s" : ""} found${city !== "All Cities" ? ` in ${city}` : ""}`}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Text search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* City filter */}
            <div className="flex gap-2">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>

              <button
                onClick={detectLocation}
                title="Detect my location"
                className="px-3 py-2.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <Navigation className={`w-4 h-4 ${detectingLoc ? "animate-pulse" : ""}`} />
                <span className="hidden sm:inline">Detect</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="rating">Top Rated</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Finding the best vendors for you…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={fetchVendors} className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No vendors found</p>
            <p className="text-gray-400 text-sm mt-1">Try changing city or clearing the search filter</p>
            <button onClick={() => { setCity("All Cities"); setSearch(""); }} className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((vendor) => {
              const name    = gp(vendor, "businessName", "business_name");
              const cat     = gp(vendor, "serviceCategory", "service_category");
              const desc    = gp(vendor, "description", "description");
              const rating  = vendor.average_rating || vendor.averageRating || 0;
              const reviews = vendor.review_count   || vendor.reviewCount   || 0;

              return (
                <div
                  key={vendor.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    localStorage.setItem("selectedVendor", JSON.stringify(vendor));
                    router.push("/userdashboard");
                  }}
                >
                  {/* Color banner */}
                  <div className="h-24 bg-gradient-to-br from-red-500 to-orange-500 relative">
                    <div className="absolute bottom-2 left-3">
                      <span className="px-2.5 py-0.5 bg-white/95 rounded-full text-xs font-bold text-red-600 shadow-sm">{cat}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 text-sm leading-tight">{name}</h3>

                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({reviews})</span>
                    </div>

                    <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{desc || "Professional service with verified expertise."}</p>

                    <div className="space-y-1 mb-3 text-xs text-gray-500">
                      {(vendor.city || vendor.state) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                      {vendor.pricing && (
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          <IndianRupee className="w-3 h-3 text-green-500" />
                          {vendor.pricing}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                      <button className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                        View Details <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
