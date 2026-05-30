"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff } from "lucide-react";

export default function WarehouseAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error, init } = useAuthStore();

  useEffect(() => { init(); }, []);

  const handleLogin = async () => {
    await login(email, password);
    window.location.href = "/dashboard";
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #2C1A0A, #4A2E14 60%, #FAF7F2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 52, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>درّة</div>
        <div style={{ fontSize: 11, color: "rgba(201,169,110,0.5)", letterSpacing: 3, marginTop: 6 }}>— بوابة المستودع —</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.06)", borderRadius: 24, border: "1px solid rgba(201,169,110,0.2)", padding: 28, backdropFilter: "blur(10px)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#E8D5A3", textAlign: "center", marginBottom: 24 }}>تسجيل الدخول</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(201,169,110,0.2)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#FAF7F2", outline: "none", textAlign: "right", direction: "rtl" }}
            placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email"
          />
          <div style={{ position: "relative" }}>
            <input
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(201,169,110,0.2)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#FAF7F2", outline: "none", textAlign: "right", direction: "rtl" }}
              placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)}
              type={showPass ? "text" : "password"} onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              {showPass ? <EyeOff size={16} color="rgba(201,169,110,0.5)" /> : <Eye size={16} color="rgba(201,169,110,0.5)" />}
            </button>
          </div>
          {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", fontSize: 13, color: "#FCA5A5" }}>⚠️ {error}</div>}
          <button onClick={handleLogin} disabled={loading || !email || !password}
            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: loading || !email || !password ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, background: !email || !password ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email || !password ? "rgba(255,255,255,0.3)" : "#2C1A0A", opacity: loading ? 0.7 : 1, transition: "all 0.2s" }}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </div>
      </div>
    </div>
  );
}
