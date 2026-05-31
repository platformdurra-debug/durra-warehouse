"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function WarehouseAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuthStore();

  const handleLogin = async () => {
    setSubmitting(true);
    try { await login(email, password); } finally { setSubmitting(false); }
  };

  const handleForgot = async () => {
    if (!email) { setResetError("أدخل بريدك أولاً"); return; }
    setSubmitting(true); setResetError("");
    try { await sendPasswordResetEmail(auth, email); setResetSent(true); }
    catch (e: any) { setResetError(e.code === "auth/user-not-found" ? "البريد غير مسجّل" : "حدث خطأ"); }
    finally { setSubmitting(false); }
  };

  const inp = { width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(201,169,110,0.2)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#FAF7F2", outline: "none", textAlign: "right" as const, direction: "rtl" as const };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #2C1A0A, #4A2E14 60%, #1A0E02)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 52, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>درّة</div>
        <div style={{ fontSize: 11, color: "rgba(201,169,110,0.5)", letterSpacing: 3, marginTop: 6 }}>— بوابة المستودع —</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.06)", borderRadius: 24, border: "1px solid rgba(201,169,110,0.2)", padding: 28, backdropFilter: "blur(10px)" }}>
        {isForgot ? (
          <div>
            <button onClick={() => { setIsForgot(false); setResetSent(false); setResetError(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,0.5)", fontSize: 13, marginBottom: 16 }}>← رجوع</button>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#E8D5A3", textAlign: "center", marginBottom: 20 }}>نسيت كلمة المرور؟</div>
            {resetSent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📩</div>
                <div style={{ fontSize: 13, color: "#34D399", fontWeight: 700 }}>تم إرسال رابط إعادة التعيين</div>
                <button onClick={() => { setIsForgot(false); setResetSent(false); }}
                  style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", color: "#C9A96E", fontSize: 13, fontWeight: 700 }}>رجوع للدخول</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                {resetError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", fontSize: 13, color: "#FCA5A5" }}>⚠️ {resetError}</div>}
                <button onClick={handleForgot} disabled={submitting || !email}
                  style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: !email ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !email ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email ? "rgba(255,255,255,0.3)" : "#2C1A0A", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "جاري الإرسال..." : "إرسال الرابط"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#E8D5A3", textAlign: "center", marginBottom: 24 }}>تسجيل الدخول</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
              <div style={{ position: "relative" }}>
                <input style={inp} placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={16} color="rgba(201,169,110,0.5)" /> : <Eye size={16} color="rgba(201,169,110,0.5)" />}
                </button>
              </div>
              {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", fontSize: 13, color: "#FCA5A5" }}>⚠️ {error}</div>}
              <button onClick={handleLogin} disabled={submitting || !email || !password}
                style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: submitting || !email || !password ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, background: !email || !password ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email || !password ? "rgba(255,255,255,0.3)" : "#2C1A0A", opacity: submitting ? 0.7 : 1, transition: "all 0.2s" }}>
                {submitting ? "جاري الدخول..." : "دخول"}
              </button>
              <button onClick={() => setIsForgot(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(201,169,110,0.5)", fontFamily: "Tajawal, sans-serif" }}>
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
