"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, Lock, KeyRound, CheckCircle } from "lucide-react";
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await api.auth.forgotPassword(email);
      if (response.success) {
        setSuccess("OTP sent to your email!");
        setStep(2);
        // Start resend timer
        setResendTimer(60);
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await api.auth.forgotPassword(email);
      if (response.success) {
        setSuccess("OTP resent to your email!");
        setResendTimer(60);
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await api.auth.verifyOTP(email, otp);
      if (response.success) {
        setSuccess("OTP verified successfully!");
        setStep(3);
      }
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await api.auth.resetPassword(email, otp, newPassword);
      if (response.success) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
       
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .glass {
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }
        .lg-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          padding: 10px 12px 10px 38px;
          width: 100%;
          outline: none;
          border-radius: 0;
          transition: all 0.2s;
        }
        .lg-input::placeholder { color: rgba(255,255,255,0.22); }
        .lg-input:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
        .otp-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 24px;
          font-weight: 500;
          text-align: center;
          padding: 14px;
          width: 100%;
          outline: none;
          letter-spacing: 8px;
          transition: all 0.2s;
        }
        .otp-input:focus {
          border-color: rgba(185,28,28,0.7);
          background: rgba(255,255,255,0.07);
        }
      `}</style>

      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(10,2,2,0.82) 0%, rgba(10,2,2,0.75) 100%),
            url('https://i.pinimg.com/736x/d4/86/19/d48619f28f998dacb921d90eefd94f51.jpg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />
      
      {/* Overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(180,30,30,0.35) 0%, transparent 55%)" }} />
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 70%, rgba(100,10,10,0.4) 0%, transparent 55%)" }} />

      {/* Main Content */}
      <div className="font-dm relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full" style={{ maxWidth: "500px" }}>
          
          <div
            className="glass w-full border"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(10,2,2,0.52)",
            }}
          >
            <div className="p-8">
              {/* Header */}
              <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <button
                  onClick={() => {
                    if (step === 1) router.push("/login");
                    else if (step === 2) setStep(1);
                    else setStep(2);
                  }}
                  className="flex items-center gap-2 text-white mb-4 hover:opacity-80 transition-opacity"
                  style={{ opacity: 0.6, fontSize: "12px" }}
                >
                  <ArrowLeft style={{ width: "14px", height: "14px" }} />
                  {step === 1 ? "Back to Login" : "Back"}
                </button>
                <h2 className="font-playfair text-white font-semibold mb-1" style={{ fontSize: "1.3rem" }}>
                  {step === 1 && "Reset Password"}
                  {step === 2 && "Enter OTP"}
                  {step === 3 && "Create New Password"}
                </h2>
                <p className="text-white font-light" style={{ fontSize: "11.5px", opacity: 0.4 }}>
                  {step === 1 && "Enter your email to receive a verification code"}
                  {step === 2 && `Enter the 6-digit code sent to ${email}`}
                  {step === 3 && "Your new password must be different from previous ones"}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 font-light px-3 py-2 text-red-300 animate-pulse"
                  style={{
                    fontSize: "12px",
                    borderLeft: "2px solid #ef4444",
                    background: "rgba(239,68,68,0.08)",
                  }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 font-light px-3 py-2 text-green-300 flex items-center gap-2"
                  style={{
                    fontSize: "12px",
                    borderLeft: "2px solid #10b981",
                    background: "rgba(16,185,129,0.08)",
                  }}>
                  <CheckCircle style={{ width: "14px", height: "14px" }} />
                  {success}
                </div>
              )}

              {/* Step 1: Email Form */}
              {step === 1 && (
                <form onSubmit={handleSendOTP}>
                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="lg-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest transition-all disabled:opacity-50 hover:shadow-lg"
                    style={{
                      padding: "12px",
                      background: loading ? "#991b1b" : "#b91c1c",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "2.5px",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Form */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP}>
                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                      Enter OTP
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="otp-input"
                        type="text"
                        required
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-white" style={{ fontSize: "10px", opacity: 0.4 }}>
                        Didn't receive code?
                      </p>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0}
                        className="text-white underline transition-all hover:opacity-80 disabled:opacity-30 disabled:no-underline"
                        style={{ fontSize: "10px", color: "#fca5a5" }}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest transition-all disabled:opacity-50 hover:shadow-lg"
                    style={{
                      padding: "12px",
                      background: loading ? "#991b1b" : "#b91c1c",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "2.5px",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>
              )}

              {/* Step 3: New Password Form */}
              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="lg-input"
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        style={{ paddingRight: "38px" }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:opacity-80"
                        style={{ opacity: 0.5, fontSize: "11px" }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="uppercase tracking-widest text-white" style={{ fontSize: "9px", opacity: 0.4 }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        style={{ width: "13px", height: "13px", opacity: 0.35 }} />
                      <input
                        className="lg-input"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full flex items-center justify-center gap-2 text-white uppercase tracking-widest transition-all disabled:opacity-50 hover:shadow-lg"
                    style={{
                      padding: "12px",
                      background: loading ? "#991b1b" : "#b91c1c",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "2.5px",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}

              {/* Footer Links */}
              <div className="mt-6 text-center">
                <p className="text-white font-light" style={{ fontSize: "11px", opacity: 0.4 }}>
                  Remember your password?{" "}
                  <a href="/login" className="underline font-medium transition-all hover:opacity-80" 
                    style={{ opacity: 1, color: "#fca5a5" }}>
                    Back to Login
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}