"use client";
import { useState, useEffect } from "react";
import { Star, Plus, X, Search, Filter, ArrowLeft, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import ReviewSubmitForm from "@/components/ReviewSubmitForm";
import { api } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarDisplay({ rating, size = "sm" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={sz}
          style={{ fill: s <= rating ? "#C0392B" : "transparent", color: s <= rating ? "#C0392B" : "#444" }}
        />
      ))}
    </div>
  );
}

function ReviewModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.88)" }}>
      <div className="w-full max-w-lg rounded-lg" style={{ backgroundColor: "#111111", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: "#f0f0f0" }}>Share Your Experience</h3>
            <p className="text-xs mt-0.5" style={{ color: "#666" }}>Your review will be visible after approval</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X className="w-5 h-5" style={{ color: "#999" }} />
          </button>
        </div>
        <div className="p-5">
          <ReviewSubmitForm />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState(0);   // 0 = all
  const [filterService, setFilterService] = useState(""); // "" = all
  const [sortBy, setSortBy] = useState("newest");         // newest | highest | lowest
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    api.reviews.getPublic()
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Number(r.rating) === star).length,
  }));

  const services = [...new Set(reviews.map((r) => r.service).filter(Boolean))];

  // ── Filter + sort + paginate ───────────────────────────────────────────────
  const filtered = reviews
    .filter((r) => {
      if (filterRating && Number(r.rating) !== filterRating) return false;
      if (filterService && r.service !== filterService) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.name?.toLowerCase().includes(q) && !r.text?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "highest") return Number(b.rating) - Number(a.rating);
      if (sortBy === "lowest") return Number(a.rating) - Number(b.rating);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, filterRating, filterService, sortBy]);

  return (
    <div className="min-h-screen mt-20" style={{ backgroundColor: "#111111" }}>
      {showModal && <ReviewModal onClose={() => setShowModal(false)} />}

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#0d0d0d", borderBottom: "1px solid #2a2a2a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors"
            style={{ color: "#666" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C0392B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            {/* Title */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#C0392B" }}>
                Customer Reviews
              </p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: "#f0f0f0" }}>
                What People<br />Are Saying
              </h1>
            </div>

            {/* Rating Summary */}
            <div className="flex items-start gap-8">
              {/* Big number */}
              <div className="text-center">
                <div className="text-6xl font-black" style={{ color: "#C0392B" }}>{avgRating}</div>
                <StarDisplay rating={Math.round(Number(avgRating))} size="lg" />
                <p className="text-xs mt-1" style={{ color: "#666" }}>{reviews.length} reviews</p>
              </div>

              {/* Bar chart */}
              <div className="space-y-1.5 min-w-[160px]">
                {ratingCounts.map(({ star, count }) => {
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <button
                      key={star}
                      onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                      className="flex items-center gap-2 w-full group"
                    >
                      <span className="text-xs w-4 text-right" style={{ color: "#666" }}>{star}</span>
                      <Star className="w-3 h-3 flex-shrink-0" style={{ fill: "#C0392B", color: "#C0392B" }} />
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#2a2a2a" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: filterRating === star ? "#C0392B" : "#555",
                          }}
                        />
                      </div>
                      <span className="text-xs w-8" style={{ color: "#555" }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Write review CTA */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 font-bold py-3 px-6 text-sm transition-colors self-start lg:self-auto"
              style={{ backgroundColor: "#C0392B", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B0000")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C0392B")}
            >
              <Plus className="w-4 h-4" /> Write a Review
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters Bar ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#151515", borderBottom: "1px solid #2a2a2a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#555" }} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm outline-none"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              />
            </div>

            {/* Star filter pills */}
            <div className="flex gap-1">
              <span className="text-xs font-semibold self-center mr-1" style={{ color: "#555" }}>
                <Filter className="w-3.5 h-3.5 inline mr-1" />Rating:
              </span>
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterRating(filterRating === s ? 0 : s)}
                  className="flex items-center gap-0.5 px-2.5 py-1 text-xs font-semibold transition-colors"
                  style={
                    filterRating === s
                      ? { backgroundColor: "#C0392B", color: "#fff" }
                      : { backgroundColor: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }
                  }
                >
                  {s}<Star className="w-2.5 h-2.5" style={{ fill: "currentColor" }} />
                </button>
              ))}
            </div>

            {/* Service filter */}
            {services.length > 0 && (
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: filterService ? "#f0f0f0" : "#555" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              >
                <option value="">All Services</option>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs outline-none"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>

            {/* Clear filters */}
            {(search || filterRating || filterService) && (
              <button
                onClick={() => { setSearch(""); setFilterRating(0); setFilterService(""); }}
                className="text-xs font-semibold px-3 py-2 transition-colors"
                style={{ color: "#C0392B", border: "1px solid #3a0000", backgroundColor: "#1a0000" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a0000")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a0000")}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Reviews Grid ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Results count */}
        {!loading && (
          <p className="text-xs mb-5" style={{ color: "#555" }}>
            Showing {paginated.length} of {filtered.length} review{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== reviews.length && ` (filtered from ${reviews.length})`}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="p-5 border animate-pulse" style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex-shrink-0" style={{ backgroundColor: "#2a2a2a" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 rounded" style={{ backgroundColor: "#2a2a2a" }} />
                    <div className="h-3 w-full rounded" style={{ backgroundColor: "#2a2a2a" }} />
                    <div className="h-3 w-3/4 rounded" style={{ backgroundColor: "#2a2a2a" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-24">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: "#2a2a2a" }} />
            <p className="text-sm font-semibold mb-1" style={{ color: "#555" }}>No reviews found</p>
            <p className="text-xs" style={{ color: "#444" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((review, i) => (
              <div
                key={review.id}
                className="p-5 border flex flex-col transition-colors duration-200"
                style={{
                  backgroundColor: "#1a1a1a",
                  borderColor: "#2a2a2a",
                  animationDelay: `${i * 40}ms`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C0392B")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              >
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ backgroundColor: "#C0392B" }}
                  >
                    {(review.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-sm font-bold truncate" style={{ color: "#f0f0f0" }}>{review.name}</span>
                    </div>
                    <StarDisplay rating={Number(review.rating)} />
                  </div>
                </div>

                {/* Service tag */}
                {review.service && (
                  <span
                    className="self-start text-xs px-2 py-0.5 mb-2 font-medium"
                    style={{ backgroundColor: "#2a0000", color: "#C0392B", border: "1px solid #3a0000" }}
                  >
                    {review.service}
                  </span>
                )}

                {/* Review text */}
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#aaa" }}>
                  "{review.text}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #222" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                    <span className="text-xs" style={{ color: "#555" }}>Verified Customer</span>
                  </div>
                  {review.created_at && (
                    <span className="text-xs" style={{ color: "#444" }}>
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-30"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#999" }}
              onMouseEnter={(e) => { if (page > 1) e.currentTarget.style.borderColor = "#C0392B"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
            >
              ← Prev
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              // show first, last, current ±1
              if (p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: "#444" }}>…</span>;
                return null;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 text-xs font-bold transition-colors"
                  style={
                    page === p
                      ? { backgroundColor: "#C0392B", color: "#fff" }
                      : { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888" }
                  }
                  onMouseEnter={(e) => { if (page !== p) e.currentTarget.style.borderColor = "#C0392B"; }}
                  onMouseLeave={(e) => { if (page !== p) e.currentTarget.style.borderColor = "#2a2a2a"; }}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-30"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#999" }}
              onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.borderColor = "#C0392B"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
        {!loading && reviews.length > 0 && (
          <div
            className="mt-12 p-8 text-center"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: "#f0f0f0" }}>Had a great experience?</h3>
            <p className="text-sm mb-5" style={{ color: "#666" }}>
              Share your feedback and help others make informed decisions.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 font-bold py-3 px-8 text-sm transition-colors"
              style={{ backgroundColor: "#C0392B", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B0000")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C0392B")}
            >
              <Plus className="w-4 h-4" /> Write a Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}