"use client";
import React, { useRef, useState } from "react";

export default function ContactPage() {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const formData = new FormData(formRef.current);
    try {
      const response = await fetch("https://formsubmit.co/ajax/pathakmansi608@gmail.com", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success === "true") {
        setShowPopup(true);
        formRef.current.reset();
      } else {
        setErrorMsg("Failed to send. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .glass { backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); }
        .cp-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          padding: 10px 12px;
          width: 100%;
          outline: none;
          border-radius: 0;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .cp-input::placeholder { color: rgba(255,255,255,0.22); }
        .cp-input:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        select.cp-input { color: rgba(255,255,255,0.5); cursor: pointer; }
        select.cp-input option { background: #1a0505; color: #fff; }
        textarea.cp-input { resize: none; height: 95px; }
      `}</style>

      {/* ============================================================
          BG IMAGE — replace the URL below with your image link
          Example: url('https://your-image-link.com/photo.jpg')
          or a local image: url('/images/contact-bg.jpg')
      ============================================================ */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(10,2,2,0.82) 0%, rgba(10,2,2,0.75) 100%),
            url('https://i.pinimg.com/1200x/f7/ae/be/f7aebeeac60006a669303b641503eda0.jpg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />

      {/* Dark red tinted overlays on top of image */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(180,30,30,0.35) 0%, transparent 55%)" }} />
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 70%, rgba(100,10,10,0.4) 0%, transparent 55%)" }} />

      {/* PAGE */}
      <div className="font-dm relative z-10 min-h-screen flex items-center justify-center px-4 py-28">
        <div
          className="glass w-full border grid"
          style={{
            maxWidth: "860px",
            borderColor: "rgba(255,255,255,0.07)",
            background: "rgba(10,2,2,0.52)",
            gridTemplateColumns: "clamp(220px, 35%, 300px) 1fr",
          }}
        >

          {/* ── LEFT PANEL ── */}
          <div className="relative overflow-hidden flex flex-col justify-between gap-10 p-10"
            style={{ background: "#b91c1c" }}>
            {/* decorative circles */}
            <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full"
              style={{ background: "rgba(0,0,0,0.15)" }} />
            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)" }} />

            {/* Brand */}
            <div className="relative z-10">
              <span className="block mb-4 text-white tracking-widest uppercase"
                style={{ fontSize: "10px", opacity: 0.55 }}>
                HomeEase Services
              </span>
              <h1 className="font-playfair text-3xl font-semibold text-white mb-3 leading-tight">
                Let's talk.
              </h1>
              <p className="text-white leading-relaxed font-light"
                style={{ fontSize: "13px", opacity: 0.68 }}>
                Have a question or need help with a booking? Our team is here —
                reach out and we'll respond within 24 hours.
              </p>
            </div>

            {/* Contact Info */}
            <div className="relative z-10 flex flex-col gap-4">
              {[
                {
                  label: "Phone",
                  value: "+91 9410225039",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.58a16 16 0 0 0 6.46 6.46l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  ),
                },
                {
                  label: "Email",
                  value: "pathakmansi608@gmail.com",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  ),
                },
                {
                  label: "Location",
                  value: "Uttar Pradesh, India",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  ),
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8"
                    style={{ background: "rgba(255,255,255,0.1)" }}>
                    {icon}
                  </div>
                  <div>
                    <div className="uppercase tracking-widest text-white mb-0.5"
                      style={{ fontSize: "9px", opacity: 0.4 }}>{label}</div>
                    <div className="text-white font-light" style={{ fontSize: "12px", opacity: 0.78 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="relative z-10 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="uppercase tracking-widest text-white mb-1.5"
                style={{ fontSize: "9px", opacity: 0.4 }}>Support Hours</div>
              <p className="text-white font-light" style={{ fontSize: "12px", opacity: 0.65, lineHeight: 1.7 }}>
                Mon – Sat: 9:00 AM – 7:00 PM<br />
                Sunday: 10:00 AM – 4:00 PM
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="p-10">
            <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="font-playfair text-white font-semibold mb-1" style={{ fontSize: "1.3rem" }}>
                Send a message
              </h2>
              <p className="text-white font-light" style={{ fontSize: "12px", opacity: 0.4 }}>
                Fill out the form and we'll get back to you shortly.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} autoComplete="off">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                    Full Name
                  </label>
                  <input className="cp-input" name="name" type="text" placeholder="Rahul Sharma" required minLength={2} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                    Email
                  </label>
                  <input className="cp-input" name="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                    Phone (optional)
                  </label>
                  <input className="cp-input" name="phone" type="tel" placeholder="+91 00000 00000" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                    Subject
                  </label>
                  <select className="cp-input" name="subject" required defaultValue="">
                    <option value="" disabled>Select a topic</option>
                    <option value="Booking Inquiry">Booking Inquiry</option>
                    <option value="Vendor Support">Vendor Support</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                  Message
                </label>
                <textarea className="cp-input" name="message" placeholder="Tell us what's on your mind..." required />
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="mb-4 text-red-300 font-light px-3 py-2"
                  style={{ fontSize: "12px", borderLeft: "2px solid #ef4444", background: "rgba(239,68,68,0.08)" }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest transition-colors disabled:opacity-50"
                style={{
                  padding: "13px",
                  background: loading ? "#991b1b" : "#b91c1c",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "2.5px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#991b1b"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#b91c1c"; }}
              >
                <span>{loading ? "Sending..." : "Send Message"}</span>
                {!loading && (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#fff" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── SUCCESS POPUP ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setShowPopup(false)}
        >
          <div
            className="text-center p-10 w-full"
            style={{
              maxWidth: "300px",
              background: "#0d0303",
              border: "1px solid rgba(255,255,255,0.09)",
              borderTop: "2px solid #b91c1c",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mx-auto mb-5 w-12 h-12"
              style={{ background: "rgba(185,28,28,0.12)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#b91c1c" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-playfair text-white font-semibold text-xl mb-2">Message Sent!</h3>
            <p className="text-white font-light mb-6" style={{ fontSize: "12px", opacity: 0.45, lineHeight: 1.7 }}>
              Thank you for reaching out. We'll respond to your query within 24 hours.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="text-red-600 uppercase tracking-widest transition-all"
              style={{
                padding: "10px 28px",
                background: "transparent",
                border: "1px solid rgba(185,28,28,0.45)",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "2px",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#b91c1c"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#b91c1c"; }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 640px) {
          .cp-layout-grid { grid-template-columns: 1fr !important; }
          .cp-form-row { grid-template-columns: 1fr !important; }
          .cp-left-pad { padding: 2rem 1.5rem !important; }
          .cp-right-pad { padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </>
  );
}