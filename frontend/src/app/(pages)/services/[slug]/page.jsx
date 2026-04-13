"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Star, IndianRupee, Shield, Search, Navigation, ArrowLeft, Loader2, Users, CalendarCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const CITIES = ["All Cities", "Lucknow", "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Moradabad", "Meerut", "Agra", "Varanasi", "Kanpur"];

export function toSlug(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function slugToName(slug = "") {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function ServiceVendorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug || "";

  const displayName = slugToName(slug);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    if (slug) fetchVendors();
  }, [slug, city]);

  const fetchVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const qp = new URLSearchParams();
      qp.append("query", slug.replace(/-/g, " "));
      if (city && city !== "All Cities") qp.append("city", city);

      const res = await fetch(`${API_URL}/vendors/search?${qp}`);
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      const matched = list.filter((v) => {
        const cat = v.service_category || v.serviceCategory || "";
        return toSlug(cat) === slug;
      });

      setVendors(matched);

      if (matched.length === 1) {
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedVendor", JSON.stringify(matched[0]));
        }
        router.push("/userdashboard/book");
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

  const bookVendor = (vendor) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedVendor", JSON.stringify(vendor));
    }
    router.push("/userdashboard/book");
  };

  const filtered = vendors
    .filter((v) => {
      const q = search.toLowerCase();
      const name = (v.business_name || v.businessName || "").toLowerCase();
      const desc = (v.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.average_rating || b.averageRating || 0) - (a.average_rating || a.averageRating || 0);
      if (sortBy === "price")  return (a.pricing || 0) - (b.pricing || 0);
      return 0;
    });

  const gp = (v, camel, snake, fb = "") => ((v?.[camel] || v?.[snake] || fb) ?? "").toString();

  return (
    // THEME CHANGE: was bg-gray-50 → dark charcoal #111111
    <div className="min-h-screen pt-20" style={{ backgroundColor: "#111111" }}>

      {/* Header — THEME CHANGE: was gradient from-red-600 to-red-700 → from #8B0000 to #111111 */}
      <div className="text-white py-10 px-4" style={{ background: "linear-gradient(to right, #8B0000, #1a1a1a)" }}>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            // THEME CHANGE: was text-red-200 hover:text-white → #CC0000 hover:white
            className="flex items-center gap-1.5 text-sm mb-4 transition-colors"
            style={{ color: "#CC0000" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#CC0000"; }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
          {/* THEME CHANGE: was text-red-200 → #999999 muted */}
          <p className="text-sm" style={{ color: "#999999" }}>
            {loading
              ? "Searching vendors…"
              : `${filtered.length} vendor${filtered.length !== 1 ? "s" : ""} found${city !== "All Cities" ? ` in ${city}` : ""}`}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filters — THEME CHANGE: was bg-white border-gray-100 → #1a1a1a border #2a2a2a */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#666666" }} />
              <input
                type="text"
                placeholder="Search vendors by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg outline-none"
                // THEME CHANGE: dark input styling
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #2a2a2a",
                  color: "#FFFFFF",
                }}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2.5 text-sm rounded-lg outline-none"
                // THEME CHANGE: dark select
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #2a2a2a",
                  color: "#FFFFFF",
                }}
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>

              <button
                onClick={detectLocation}
                title="Detect my location"
                className="px-3 py-2.5 text-sm rounded-lg flex items-center gap-1.5 transition-colors"
                // THEME CHANGE: was bg-red-50 text-red-600 border-red-200 → dark crimson tones
                style={{ backgroundColor: "#2a0000", color: "#CC0000", border: "1px solid #8B0000" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a0000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a0000"; }}
              >
                <Navigation className={`w-4 h-4 ${detectingLoc ? "animate-pulse" : ""}`} />
                <span className="hidden sm:inline">Detect</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 text-sm rounded-lg outline-none"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #2a2a2a",
                  color: "#FFFFFF",
                }}
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
            {/* THEME CHANGE: spinner color → #CC0000 */}
            <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: "#CC0000" }} />
            <p className="text-sm" style={{ color: "#999999" }}>Finding the best vendors for you…</p>
          </div>
        ) : error ? (
          // THEME CHANGE: was bg-white border-gray-100 → dark card
          <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <p className="font-medium" style={{ color: "#CC0000" }}>{error}</p>
            <button
              onClick={fetchVendors}
              className="mt-4 px-5 py-2 text-white rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#8B0000" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#CC0000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            {/* THEME CHANGE: icon color → #2a2a2a */}
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: "#2a2a2a" }} />
            <p className="font-semibold" style={{ color: "#FFFFFF" }}>No vendors found</p>
            <p className="text-sm mt-1" style={{ color: "#666666" }}>Try changing city or clearing the search filter</p>
            <button
              onClick={() => { setCity("All Cities"); setSearch(""); }}
              className="mt-4 px-5 py-2 text-white rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#8B0000" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#CC0000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
            >
              Clear Filters
            </button>
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
                  className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                  // THEME CHANGE: was bg-white border-gray-100 shadow → dark card
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(139,0,0,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Card header — THEME CHANGE: was gradient from-red-500 to-orange-500 → #8B0000 to #111111 */}
                  <div className="h-24 relative" style={{ background: "linear-gradient(to bottom right, #8B0000, #111111)" }}>
                    <div className="absolute bottom-2 left-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm"
                        // THEME CHANGE: was bg-white/95 text-red-600 → dark bg crimson text
                        style={{ backgroundColor: "rgba(17,17,17,0.95)", color: "#CC0000" }}
                      >
                        {cat}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* THEME CHANGE: name was text-gray-900 → white */}
                    <h3 className="font-bold mb-1 text-sm leading-tight" style={{ color: "#FFFFFF" }}>{name}</h3>

                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : ""}`}
                          style={i >= Math.round(rating) ? { color: "#2a2a2a" } : {}} />
                      ))}
                      <span className="text-xs ml-1" style={{ color: "#666666" }}>({reviews})</span>
                    </div>

                    {/* THEME CHANGE: desc was text-gray-500 → #999999 */}
                    <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: "#999999" }}>
                      {desc || "Professional service with verified expertise."}
                    </p>

                    <div className="space-y-1 mb-3 text-xs" style={{ color: "#666666" }}>
                      {(vendor.city || vendor.state) && (
                        <div className="flex items-center gap-1.5">
                          {/* THEME CHANGE: icon was text-red-400 → #CC0000 */}
                          <MapPin className="w-3 h-3" style={{ color: "#CC0000" }} />
                          {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                      {vendor.pricing && (
                        <div className="flex items-center gap-1 font-medium" style={{ color: "#FFFFFF" }}>
                          <IndianRupee className="w-3 h-3" style={{ color: "#22c55e" }} />
                          {vendor.pricing}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {/* THEME CHANGE: was bg-blue-50 text-blue-600 → dark tint with blue text */}
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: "#001a2a", color: "#60a5fa" }}
                      >
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                      <button
                        onClick={() => bookVendor(vendor)}
                        className="flex-1 flex items-center justify-center gap-1 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        // THEME CHANGE: was bg-red-600 hover:bg-red-700 → #8B0000 hover:#CC0000
                        style={{ backgroundColor: "#8B0000" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#CC0000"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
                      >
                        <CalendarCheck className="w-3 h-3" /> Book Service
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