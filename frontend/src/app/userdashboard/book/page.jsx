"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, MapPin, Star, Shield, ChevronRight, Sparkles } from "lucide-react";

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM",
];

const today = new Date().toISOString().split("T")[0];

export default function BookService() {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [step, setStep] = useState(1); // 1 = date, 2 = time, 3 = notes
  const [bookingData, setBookingData] = useState({ date: "", time: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("selectedVendor");
    if (raw) setVendor(JSON.parse(raw));
    else router.push("/userdashboard");
  }, [router]);

  const businessName = vendor?.business_name || vendor?.businessName || "Vendor";
  const serviceCategory = vendor?.service_category || vendor?.serviceCategory || "Service";
  const pricing = vendor?.pricing || null;
  const city = vendor?.city || "";
  const state = vendor?.state || "";
  const rating = vendor?.average_rating || vendor?.averageRating || 4.5;

  const canNext1 = bookingData.date !== "";
  const canNext2 = bookingData.time !== "";
  const canSubmit = canNext1 && canNext2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendor_id: vendor.id,
          service_name: serviceCategory,
          vendor_name: businessName,
          date: bookingData.date,
          time: bookingData.time,
          message: bookingData.message,
          amount: 0,
          status: "pending",
        }),
      });
      if (res.ok) {
        setSuccess(true);
        localStorage.removeItem("selectedVendor");
        setTimeout(() => router.push("/userdashboard"), 3000);
      } else {
        const d = await res.json();
        setError(d.message || "Booking failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Format selected date nicely
  const formatDate = (str) => {
    if (!str) return null;
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fafaf8" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#dc2626", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#fafaf8" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
          .book-font { font-family: 'DM Sans', sans-serif; }
          .book-serif { font-family: 'DM Serif Display', serif; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
          @keyframes scaleIn { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
          .anim-up { animation: fadeUp 0.5s ease forwards; }
          .anim-scale { animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        `}</style>
        <div className="book-font text-center anim-up" style={{ maxWidth: 400 }}>
          <div className="anim-scale" style={{ width: 80, height: 80, background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <CheckCircle style={{ width: 40, height: 40, color: "#fff" }} />
          </div>
          <h2 className="book-serif" style={{ fontSize: 28, color: "#111", marginBottom: 10 }}>Booking Confirmed!</h2>
          <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.6 }}>
            Your request with <strong style={{ color: "#111" }}>{businessName}</strong> has been sent.<br />
            You'll hear back shortly.
          </p>
          <div style={{ marginTop: 32, height: 3, background: "#f3f4f6", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#dc2626,#f97316)", borderRadius: 8, animation: "progress 3s linear forwards" }} />
          </div>
          <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 10 }}>Redirecting to dashboard…</p>
        </div>
        <style>{`@keyframes progress { from { width:0% } to { width:100% } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        .book-wrap *, .book-wrap *::before, .book-wrap *::after { box-sizing: border-box; }
        .book-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #fafaf8; padding-top: 80px; margin: 0; }
        .book-serif { font-family: 'DM Serif Display', serif; }

        /* ── layout ── */
        .bk-inner { max-width: 560px; margin: 0 auto; padding: 32px 20px 60px; }

        /* ── back ── */
        .bk-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: #6b7280; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 28px; transition: color .15s; }
        .bk-back:hover { color: #dc2626; }

        /* ── vendor card ── */
        .bk-vendor { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 20px rgba(0,0,0,.04); margin-bottom: 28px; }
        .bk-vendor-top { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 24px; color: #fff; }
        .bk-vendor-cat { font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 6px; }
        .bk-vendor-name { font-size: 22px; font-weight: 600; color: #fff; line-height: 1.2; margin-bottom: 12px; }
        .bk-vendor-meta { display: flex; align-items: center; justify-content: space-between; }
        .bk-vendor-loc { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,.75); }
        .bk-stars { display: flex; gap: 2px; }
        .bk-vendor-bottom { padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; background: #fff7ed; border-top: 1px solid #fed7aa; }
        .bk-price { font-size: 13px; color: #92400e; font-weight: 500; }
        .bk-price strong { font-weight: 700; color: #7c2d12; }
        .bk-verified { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #15803d; background: #dcfce7; border-radius: 20px; padding: 4px 10px; }

        /* ── section label ── */
        .bk-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; margin-bottom: 14px; }

        /* ── date input ── */
        .bk-section { background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,.06); margin-bottom: 16px; }
        .bk-section-title { font-size: 17px; font-weight: 600; color: #111; margin-bottom: 6px; }
        .bk-section-sub { font-size: 13px; color: #9ca3af; margin-bottom: 22px; }
        .bk-date-input { width: 100%; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 13px 16px; font-size: 15px; font-family: inherit; color: #111; background: #fafaf8; transition: border .15s, box-shadow .15s; outline: none; }
        .bk-date-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.1); background: #fff; }
        .bk-date-display { margin-top: 10px; font-size: 13px; color: #dc2626; font-weight: 500; min-height: 18px; }

        /* ── time slots ── */
        .bk-time-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (min-width: 400px) { .bk-time-grid { grid-template-columns: repeat(5, 1fr); } }
        .bk-slot { border: 1.5px solid #e5e7eb; background: #fafaf8; border-radius: 10px; padding: 10px 6px; font-size: 12px; font-weight: 500; color: #4b5563; cursor: pointer; transition: all .15s; text-align: center; outline: none; font-family: inherit; }
        .bk-slot:hover { border-color: #dc2626; color: #dc2626; background: #fff5f5; }
        .bk-slot.selected { border-color: #dc2626; background: #dc2626; color: #fff; font-weight: 600; box-shadow: 0 2px 8px rgba(220,38,38,.3); }

        /* ── textarea ── */
        .bk-textarea { width: 100%; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 13px 16px; font-size: 14px; font-family: inherit; color: #111; background: #fafaf8; resize: none; min-height: 110px; outline: none; transition: border .15s, box-shadow .15s; line-height: 1.6; }
        .bk-textarea:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.1); background: #fff; }
        .bk-textarea::placeholder { color: #c4c4c4; }

        /* ── summary row ── */
        .bk-summary { background: #fff; border-radius: 16px; border: 1.5px solid #f3f4f6; padding: 20px 24px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
        .bk-summary-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
        .bk-summary-key { color: #9ca3af; font-weight: 500; }
        .bk-summary-val { color: #111; font-weight: 600; }

        /* ── error ── */
        .bk-error { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 12px 16px; font-size: 13px; color: #b91c1c; margin-bottom: 16px; }

        /* ── actions ── */
        .bk-actions { display: flex; gap: 10px; }
        .bk-btn-ghost { flex: 1; padding: 14px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 14px; font-weight: 600; color: #6b7280; background: #fff; cursor: pointer; font-family: inherit; transition: all .15s; }
        .bk-btn-ghost:hover { border-color: #d1d5db; background: #f9fafb; }
        .bk-btn-primary { flex: 2; padding: 14px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #dc2626, #ea580c); cursor: pointer; font-family: inherit; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(220,38,38,.3); }
        .bk-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,.35); }
        .bk-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }

        /* ── progress dots ── */
        .bk-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
        .bk-dot { width: 8px; height: 8px; border-radius: 50%; background: #e5e7eb; transition: all .2s; }
        .bk-dot.active { background: #dc2626; width: 24px; border-radius: 4px; }
        .bk-dot.done { background: #fca5a5; }

        /* ── spinner ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .anim-up { animation: fadeUp .3s ease forwards; }
      `}</style>

      <div className="book-wrap">
        <div className="bk-inner">

          {/* Back */}
          <button className="bk-back" onClick={() => router.back()}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back
          </button>

          {/* Vendor Card */}
          <div className="bk-vendor">
            <div className="bk-vendor-top">
              <div className="bk-vendor-cat">{serviceCategory}</div>
              <div className="bk-vendor-name book-serif">{businessName}</div>
              <div className="bk-vendor-meta">
                {(city || state) ? (
                  <div className="bk-vendor-loc">
                    <MapPin style={{ width: 12, height: 12 }} />
                    {[city, state].filter(Boolean).join(", ")}
                  </div>
                ) : <span />}
                <div className="bk-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: 13, height: 13, fill: i < Math.floor(rating) ? "#fde047" : "transparent", color: i < Math.floor(rating) ? "#fde047" : "rgba(255,255,255,.35)" }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="bk-vendor-bottom">
              <div className="bk-price">
                {pricing ? <>Starting from <strong>₹{pricing}</strong></> : <span style={{ color: "#b45309" }}>Contact for pricing</span>}
              </div>
              <div className="bk-verified">
                <Shield style={{ width: 11, height: 11 }} />
                Verified
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bk-progress">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`bk-dot ${step === s ? "active" : step > s ? "done" : ""}`} />
            ))}
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>Step {step} of 3</span>
          </div>

          {/* ── STEP 1: Date ── */}
          {step === 1 && (
            <div className="bk-section anim-up">
              <div className="bk-section-title">When do you need the service?</div>
              <div className="bk-section-sub">Pick a date that works for you</div>
              <div className="bk-label">Select Date</div>
              <input
                type="date"
                className="bk-date-input"
                min={today}
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
              />
              <div className="bk-date-display">
                {bookingData.date ? `📅 ${formatDate(bookingData.date)}` : ""}
              </div>
              <div className="bk-actions" style={{ marginTop: 28 }}>
                <button className="bk-btn-ghost" onClick={() => router.back()}>Cancel</button>
                <button className="bk-btn-primary" disabled={!canNext1} onClick={() => setStep(2)}>
                  Continue <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Time ── */}
          {step === 2 && (
            <div className="bk-section anim-up">
              <div className="bk-section-title">Pick a time slot</div>
              <div className="bk-section-sub">Choose your preferred arrival time</div>
              <div className="bk-label">Available Slots</div>
              <div className="bk-time-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`bk-slot ${bookingData.time === slot ? "selected" : ""}`}
                    onClick={() => setBookingData({ ...bookingData, time: slot })}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <div className="bk-actions" style={{ marginTop: 28 }}>
                <button className="bk-btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="bk-btn-primary" disabled={!canNext2} onClick={() => setStep(3)}>
                  Continue <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Notes + Confirm ── */}
          {step === 3 && (
            <div className="anim-up">
              <div className="bk-section">
                <div className="bk-section-title">Any special requests?</div>
                <div className="bk-section-sub">Optional — let the vendor know anything specific</div>
                <div className="bk-label">Notes</div>
                <textarea
                  className="bk-textarea"
                  placeholder="e.g. Need service on ground floor, prefer morning visit, specific materials required..."
                  value={bookingData.message}
                  onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                />
              </div>

              {/* Summary */}
              <div className="bk-summary">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#d1d5db", marginBottom: 4 }}>Booking Summary</div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Vendor</span>
                  <span className="bk-summary-val">{businessName}</span>
                </div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Date</span>
                  <span className="bk-summary-val">{formatDate(bookingData.date)}</span>
                </div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Time</span>
                  <span className="bk-summary-val">{bookingData.time}</span>
                </div>
                {pricing && (
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Starting from</span>
                    <span className="bk-summary-val" style={{ color: "#dc2626" }}>₹{pricing}</span>
                  </div>
                )}
              </div>

              {error && <div className="bk-error">{error}</div>}

              <div className="bk-actions">
                <button className="bk-btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button className="bk-btn-primary" disabled={loading || !canSubmit} onClick={handleSubmit}>
                  {loading
                    ? <><div className="spinner" /> Submitting…</>
                    : <><Sparkles style={{ width: 16, height: 16 }} /> Confirm Booking</>
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}