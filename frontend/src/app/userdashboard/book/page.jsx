"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle, MapPin, Star, Shield,
  ChevronRight, Sparkles, CreditCard, Banknote, AlertCircle
} from "lucide-react";

const timeSlots = [
  "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "01:00 PM","02:00 PM","03:00 PM","04:00 PM",
  "05:00 PM","06:00 PM",
];
const today = new Date().toISOString().split("T")[0];
const ADVANCE = 99;

export default function BookService() {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({ date: "", time: "", message: "" });
  const [paymentMethod, setPaymentMethod] = useState(null); // "razorpay" | "cod"
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

 useEffect(() => {
  // ✅ Pehle token check karo
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login?redirect=userdashboard/book"); // ya jo bhi tumhara login route hai
    return;
  }

  const raw = localStorage.getItem("selectedVendor");
  if (raw) setVendor(JSON.parse(raw));
  else router.push("/userdashboard");
}, [router]);

  // Razorpay script load
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const businessName    = vendor?.business_name    || vendor?.businessName    || "Vendor";
  const serviceCategory = vendor?.service_category || vendor?.serviceCategory || "Service";
  const pricing         = vendor?.pricing || null;
  const city            = vendor?.city  || "";
  const state           = vendor?.state || "";
  const rating          = vendor?.average_rating || vendor?.averageRating || 4.5;

  const formatDate = (str) => {
    if (!str) return null;
    return new Date(str + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  };

  // ── COD booking ──────────────────────────────────────────────────
  const handleCOD = async () => {
    const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login?redirect=userdashboard/book");
    return;
  }
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendor_id:    vendor.id,
          service_name: serviceCategory,
          vendor_name:  businessName,
          date:         bookingData.date,
          time:         bookingData.time,
          message:      bookingData.message,
          amount:       0,
          payment_method: "cod",
        }),
      });
      if (res.ok) {
        localStorage.removeItem("selectedVendor");
        setSuccess(true);
        setTimeout(() => router.push("/userdashboard"), 3000);
      } else {
        const d = await res.json();
        setError(d.message || "Booking failed.");
      }
    } catch { setError("Network error."); }
    finally   { setLoading(false); }
  };

  // ── Razorpay booking ─────────────────────────────────────────────
  const handleRazorpay = async () => {
     const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login?redirect=userdashboard/book");
    return;
  }
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");

      // 1. Order create karo
      const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message);

      // 2. Razorpay popup open karo
      const options = {
        key:      orderData.keyId,
        amount:   orderData.amount,
        currency: orderData.currency,
        name:     businessName,
        description: `Advance booking charge — ${serviceCategory}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          // 3. Verify + save booking
          const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingData: {
                vendor_id:    vendor.id,
                service_name: serviceCategory,
                vendor_name:  businessName,
                date:         bookingData.date,
                time:         bookingData.time,
                message:      bookingData.message,
              },
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            localStorage.removeItem("selectedVendor");
            setSuccess(true);
            setTimeout(() => router.push("/userdashboard"), 3000);
          } else {
            setError("Payment verified but booking failed. Contact support.");
          }
          setLoading(false);
        },
        modal: { ondismiss: () => { setLoading(false); setError("Payment cancelled."); } },
        theme: { color: "#C0392B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Payment failed.");
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────

  if (!vendor) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#1A1A1A" }}>
      <div style={{ width:36,height:36,border:"3px solid #2C2C2C",borderTopColor:"#C0392B",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background:"#1A1A1A" }}>
      <style>{`
       
        .book-serif{font-family:'DM Serif Display',serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
        @keyframes progress{from{width:0%}to{width:100%}}
        .anim-up{animation:fadeUp .5s ease forwards}
        .anim-scale{animation:scaleIn .4s cubic-bezier(.34,1.56,.64,1) forwards}
      `}</style>
      <div style={{fontFamily:"'DM Sans',sans-serif",textAlign:"center",maxWidth:400}} className="anim-up">
        <div className="anim-scale" style={{width:80,height:80,background:"linear-gradient(135deg,#16a34a,#4ade80)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px"}}>
          <CheckCircle style={{width:40,height:40,color:"#fff"}}/>
        </div>
        <h2 className="book-serif" style={{fontSize:28,color:"#FFFFFF",marginBottom:10}}>Booking Confirmed!</h2>
        <p style={{color:"#CCCCCC",fontSize:15,lineHeight:1.6}}>
          Your request with <strong style={{color:"#fff"}}>{businessName}</strong> has been sent.<br/>
          {paymentMethod === "razorpay"
            ? <>₹{ADVANCE} advance paid successfully.</>
            : <>₹{ADVANCE} visitation charge due on vendor arrival.</>}
        </p>
        <div style={{marginTop:32,height:3,background:"#2C2C2C",borderRadius:8,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#C0392B,#e74c3c)",borderRadius:8,animation:"progress 3s linear forwards"}}/>
        </div>
        <p style={{color:"#6b7280",fontSize:12,marginTop:10}}>Redirecting to dashboard…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        
        .book-wrap*,.book-wrap*::before,.book-wrap*::after{box-sizing:border-box}
        .book-wrap{font-family:'DM Sans',sans-serif;min-height:100vh;background:#1A1A1A;padding-top:80px}
        .book-serif{font-family:'DM Serif Display',serif}
        .bk-inner{max-width:560px;margin:0 auto;padding:32px 20px 60px}
        .bk-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#CCCCCC;background:none;border:none;cursor:pointer;padding:0;margin-bottom:28px;transition:color .15s}
        .bk-back:hover{color:#C0392B}
        .bk-vendor{background:#2C2C2C;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.3);margin-bottom:28px;border:1px solid #3a3a3a}
        .bk-vendor-top{background:linear-gradient(135deg,#C0392B 0%,#96281B 100%);padding:24px;color:#fff}
        .bk-vendor-cat{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.65);margin-bottom:6px}
        .bk-vendor-name{font-size:22px;font-weight:600;line-height:1.2;margin-bottom:12px}
        .bk-vendor-meta{display:flex;align-items:center;justify-content:space-between}
        .bk-vendor-loc{display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,.75)}
        .bk-vendor-bottom{padding:14px 24px;display:flex;align-items:center;justify-content:space-between;background:#252525;border-top:1px solid #3a3a3a}
        .bk-price{font-size:13px;color:#CCCCCC;font-weight:500}
        .bk-price strong{font-weight:700;color:#e74c3c}
        .bk-verified{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#4ade80;background:rgba(74,222,128,.12);border-radius:20px;padding:4px 10px}
        .bk-section{background:#2C2C2C;border-radius:20px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.3);margin-bottom:16px;border:1px solid #3a3a3a}
        .bk-section-title{font-size:17px;font-weight:600;color:#FFFFFF;margin-bottom:6px}
        .bk-section-sub{font-size:13px;color:#6b7280;margin-bottom:22px}
        .bk-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:14px}
        .bk-date-input{width:100%;border:1.5px solid #3a3a3a;border-radius:12px;padding:13px 16px;font-size:15px;font-family:inherit;color:#000;background:#EAF0FB;outline:none;color-scheme:light;transition:border .15s,box-shadow .15s}
        .bk-date-input:focus{border-color:#C0392B;box-shadow:0 0 0 3px rgba(192,57,43,.2)}
        .bk-date-display{margin-top:10px;font-size:13px;color:#e74c3c;font-weight:500;min-height:18px}
        .bk-time-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
        @media(min-width:400px){.bk-time-grid{grid-template-columns:repeat(5,1fr)}}
        .bk-slot{border:1.5px solid #3a3a3a;background:#252525;border-radius:10px;padding:10px 6px;font-size:12px;font-weight:500;color:#CCCCCC;cursor:pointer;text-align:center;outline:none;font-family:inherit;transition:all .15s}
        .bk-slot:hover{border-color:#C0392B;color:#e74c3c;background:rgba(192,57,43,.08)}
        .bk-slot.selected{border-color:#C0392B;background:#C0392B;color:#fff;font-weight:600;box-shadow:0 2px 8px rgba(192,57,43,.4)}
        .bk-textarea{width:100%;border:1.5px solid #3a3a3a;border-radius:12px;padding:13px 16px;font-size:14px;font-family:inherit;color:#111;background:#EAF0FB;resize:none;min-height:110px;outline:none;transition:border .15s,box-shadow .15s;line-height:1.6}
        .bk-textarea:focus{border-color:#C0392B;box-shadow:0 0 0 3px rgba(192,57,43,.2)}
        .bk-textarea::placeholder{color:#8a9ab5}
        .bk-summary{background:#2C2C2C;border-radius:16px;border:1.5px solid #3a3a3a;padding:20px 24px;margin-bottom:16px;display:flex;flex-direction:column;gap:10px}
        .bk-summary-row{display:flex;align-items:center;justify-content:space-between;font-size:13px}
        .bk-summary-key{color:#6b7280;font-weight:500}
        .bk-summary-val{color:#FFFFFF;font-weight:600}
        .bk-error{background:rgba(192,57,43,.15);border:1px solid rgba(192,57,43,.4);border-radius:12px;padding:12px 16px;font-size:13px;color:#e74c3c;margin-bottom:16px}
        .bk-actions{display:flex;gap:10px}
        .bk-btn-ghost{flex:1;padding:14px;border:1.5px solid #3a3a3a;border-radius:12px;font-size:14px;font-weight:600;color:#CCCCCC;background:#252525;cursor:pointer;font-family:inherit;transition:all .15s}
        .bk-btn-ghost:hover{border-color:#555;background:#333;color:#fff}
        .bk-btn-primary{flex:2;padding:14px;border:none;border-radius:12px;font-size:14px;font-weight:600;color:#fff;background:#C0392B;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(192,57,43,.4);transition:all .15s}
        .bk-btn-primary:hover:not(:disabled){transform:translateY(-1px);background:#a93226;box-shadow:0 6px 20px rgba(192,57,43,.5)}
        .bk-btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
        .bk-progress{display:flex;align-items:center;gap:8px;margin-bottom:28px}
        .bk-dot{width:8px;height:8px;border-radius:50%;background:#3a3a3a;transition:all .2s}
        .bk-dot.active{background:#C0392B;width:24px;border-radius:4px}
        .bk-dot.done{background:#7a1a10}

        /* Payment cards */
        .pay-card{background:#252525;border:2px solid #3a3a3a;border-radius:16px;padding:20px;cursor:pointer;transition:all .2s;display:flex;align-items:flex-start;gap:14px}
        .pay-card:hover{border-color:#C0392B;background:#2e2020}
        .pay-card.selected{border-color:#C0392B;background:rgba(192,57,43,.1)}
        .pay-card-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .pay-card-title{font-size:15px;font-weight:600;color:#FFFFFF;margin-bottom:4px}
        .pay-card-desc{font-size:12px;color:#6b7280;line-height:1.5}
        .pay-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:6px;margin-top:6px}
        .bk-notice{background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.3);border-radius:12px;padding:14px 16px;font-size:13px;color:#fde047;display:flex;gap:10px;align-items:flex-start;margin-top:16px}

        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .anim-up{animation:fadeUp .3s ease forwards}
      `}</style>

      <div className="book-wrap">
        <div className="bk-inner">
          <button className="bk-back" onClick={() => router.back()}>
            <ArrowLeft style={{width:15,height:15}}/> Back
          </button>

          {/* Vendor card */}
          <div className="bk-vendor">
            <div className="bk-vendor-top">
              <div className="bk-vendor-cat">{serviceCategory}</div>
              <div className="bk-vendor-name book-serif">{businessName}</div>
              <div className="bk-vendor-meta">
                {(city||state) ? (
                  <div className="bk-vendor-loc">
                    <MapPin style={{width:12,height:12}}/>{[city,state].filter(Boolean).join(", ")}
                  </div>
                ) : <span/>}
                <div style={{display:"flex",gap:2}}>
                  {[...Array(5)].map((_,i) => (
                    <Star key={i} style={{width:13,height:13,fill:i<Math.floor(rating)?"#fde047":"transparent",color:i<Math.floor(rating)?"#fde047":"rgba(255,255,255,.35)"}}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="bk-vendor-bottom">
              <div className="bk-price">
                {pricing ? <>Starting from <strong>₹{pricing}</strong></> : <span style={{color:"#e74c3c"}}>Contact for pricing</span>}
              </div>
              <div className="bk-verified"><Shield style={{width:11,height:11}}/>Verified</div>
            </div>
          </div>

          {/* Progress dots — 4 steps */}
          <div className="bk-progress">
            {[1,2,3,4].map(s => (
              <div key={s} className={`bk-dot ${step===s?"active":step>s?"done":""}`}/>
            ))}
            <span style={{fontSize:12,color:"#6b7280",marginLeft:4}}>Step {step} of 4</span>
          </div>

          {/* ── Step 1: Date ── */}
          {step === 1 && (
            <div className="bk-section anim-up">
              <div className="bk-section-title">When do you need the service?</div>
              <div className="bk-section-sub">Pick a date that works for you</div>
              <div className="bk-label">Select Date</div>
              <input type="date" className="bk-date-input" min={today}
                value={bookingData.date}
                onChange={e => setBookingData({...bookingData, date:e.target.value})}/>
              <div className="bk-date-display">
                {bookingData.date ? `📅 ${formatDate(bookingData.date)}` : ""}
              </div>
              <div className="bk-actions" style={{marginTop:28}}>
                <button className="bk-btn-ghost" onClick={() => router.back()}>Cancel</button>
                <button className="bk-btn-primary" disabled={!bookingData.date} onClick={() => setStep(2)}>
                  Continue <ChevronRight style={{width:16,height:16}}/>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Time ── */}
          {step === 2 && (
            <div className="bk-section anim-up">
              <div className="bk-section-title">Pick a time slot</div>
              <div className="bk-section-sub">Choose your preferred arrival time</div>
              <div className="bk-label">Available Slots</div>
              <div className="bk-time-grid">
                {timeSlots.map(slot => (
                  <button key={slot}
                    className={`bk-slot ${bookingData.time===slot?"selected":""}`}
                    onClick={() => setBookingData({...bookingData, time:slot})}>
                    {slot}
                  </button>
                ))}
              </div>
              <div className="bk-actions" style={{marginTop:28}}>
                <button className="bk-btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="bk-btn-primary" disabled={!bookingData.time} onClick={() => setStep(3)}>
                  Continue <ChevronRight style={{width:16,height:16}}/>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Notes ── */}
          {step === 3 && (
            <div className="anim-up">
              <div className="bk-section">
                <div className="bk-section-title">Any special requests?</div>
                <div className="bk-section-sub">Optional — let the vendor know anything specific</div>
                <div className="bk-label">Notes</div>
                <textarea className="bk-textarea"
                  placeholder="e.g. Ground floor, prefer morning, specific materials..."
                  value={bookingData.message}
                  onChange={e => setBookingData({...bookingData, message:e.target.value})}/>
              </div>
              <div className="bk-actions">
                <button className="bk-btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button className="bk-btn-primary" onClick={() => setStep(4)}>
                  Continue <ChevronRight style={{width:16,height:16}}/>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Payment ── */}
          {step === 4 && (
            <div className="anim-up">
              <div className="bk-section">
                <div className="bk-section-title">Choose payment method</div>
                <div className="bk-section-sub">
                  A ₹{ADVANCE} advance/visitation charge applies for all bookings
                </div>

                {/* Razorpay card */}
                <div className={`pay-card ${paymentMethod==="razorpay"?"selected":""}`}
                  onClick={() => setPaymentMethod("razorpay")}>
                  <div className="pay-card-icon" style={{background:"rgba(192,57,43,.15)"}}>
                    <CreditCard style={{width:22,height:22,color:"#e74c3c"}}/>
                  </div>
                  <div>
                    <div className="pay-card-title">Pay Online Now</div>
                    <div className="pay-card-desc">
                      Pay ₹{ADVANCE} advance via UPI, card, or net banking.<br/>
                      Remaining amount after service is delivered.
                    </div>
                    <span className="pay-badge" style={{background:"rgba(74,222,128,.12)",color:"#4ade80"}}>
                      Recommended
                    </span>
                  </div>
                </div>

                <div style={{height:10}}/>

                {/* COD card */}
                <div className={`pay-card ${paymentMethod==="cod"?"selected":""}`}
                  onClick={() => setPaymentMethod("cod")}>
                  <div className="pay-card-icon" style={{background:"rgba(234,179,8,.12)"}}>
                    <Banknote style={{width:22,height:22,color:"#fde047"}}/>
                  </div>
                  <div>
                    <div className="pay-card-title">Cash on Visit</div>
                    <div className="pay-card-desc">
                      Pay ₹{ADVANCE} visitation charge when vendor arrives.<br/>
                      Remaining amount after service is completed.
                    </div>
                    <span className="pay-badge" style={{background:"rgba(234,179,8,.1)",color:"#fde047"}}>
                      Pay at doorstep
                    </span>
                  </div>
                </div>

                {/* COD notice */}
                {paymentMethod === "cod" && (
                  <div className="bk-notice">
                    <AlertCircle style={{width:16,height:16,flexShrink:0,marginTop:1}}/>
                    <span>
                      ₹{ADVANCE} visitation charge is non-refundable and must be paid when the vendor arrives at your location, regardless of whether you proceed with the service.
                    </span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bk-summary">
                <div style={{fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#6b7280",marginBottom:4}}>
                  Booking Summary
                </div>
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
                <div className="bk-summary-row" style={{borderTop:"1px solid #3a3a3a",paddingTop:10,marginTop:4}}>
                  <span className="bk-summary-key">Advance charge</span>
                  <span className="bk-summary-val" style={{color:"#e74c3c"}}>₹{ADVANCE}</span>
                </div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Payment</span>
                  <span className="bk-summary-val">
                    {paymentMethod === "razorpay" ? "Online (Razorpay)"
                    : paymentMethod === "cod"     ? "Cash on Visit"
                    : "—"}
                  </span>
                </div>
              </div>

              {error && <div className="bk-error">{error}</div>}

              <div className="bk-actions">
                <button className="bk-btn-ghost" onClick={() => setStep(3)}>Back</button>
                <button
                  className="bk-btn-primary"
                  disabled={!paymentMethod || loading}
                  onClick={paymentMethod === "razorpay" ? handleRazorpay : handleCOD}>
                  {loading
                    ? <><div className="spinner"/> Processing…</>
                    : paymentMethod === "razorpay"
                      ? <><CreditCard style={{width:16,height:16}}/> Pay ₹{ADVANCE}</>
                      : <><Sparkles style={{width:16,height:16}}/> Confirm Booking</>
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