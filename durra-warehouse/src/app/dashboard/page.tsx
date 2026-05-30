"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WarehouseNav from "@/components/WarehouseNav";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available:   { label: "متاح",   color: "#059669", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)" },
  rented:      { label: "مؤجَّر", color: "#2563EB", bg: "rgba(37,99,235,0.08)",  border: "rgba(37,99,235,0.2)" },
  cleaning:    { label: "تنظيف",  color: "#D97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)" },
  maintenance: { label: "صيانة",  color: "#7C3AED", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
  transit:     { label: "توصيل",  color: "#DC2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)" },
};

export default function WarehouseDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ available: 0, rented: 0, cleaning: 0, maintenance: 0, transit: 0 });
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, "warehouse")).then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data);
      setStats({
        available:   data.filter((d: any) => d.status === "available").length,
        rented:      data.filter((d: any) => d.status === "rented").length,
        cleaning:    data.filter((d: any) => d.status === "cleaning").length,
        maintenance: data.filter((d: any) => d.status === "maintenance").length,
        transit:     data.filter((d: any) => d.status === "transit").length,
      });
      setFetching(false);
    });
  }, [user]);

  const SECTIONS = [
    { href: "/send",      label: "إرسال",    desc: "جاهزة للإرسال",    count: stats.available,   color: "#059669" },
    { href: "/receive",   label: "استلام",   desc: "مرتجعات للاستلام", count: stats.rented,      color: "#2563EB" },
    { href: "/cleaning",  label: "تنظيف",   desc: "في التنظيف",       count: stats.cleaning,    color: "#D97706" },
    { href: "/condition", label: "صيانة",   desc: "في الصيانة",       count: stats.maintenance, color: "#7C3AED" },
    { href: "/tracking",  label: "توصيل",   desc: "في الطريق",        count: stats.transit,     color: "#DC2626" },
  ];

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 11, color: "rgba(52,211,153,0.55)", letterSpacing: 2 }}>WAREHOUSE</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#34D399" }}>درّة</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="page-header-title">إدارة المستودع</div>
          <div className="page-header-sub">{items.length} قطعة في المخزون</div>
        </div>
        {/* Total badge */}
        <div style={{ marginTop: 16, background: "rgba(52,211,153,0.1)", borderRadius: 16, border: "1px solid rgba(52,211,153,0.2)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "rgba(52,211,153,0.6)" }}>إجمالي المخزون</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#34D399", lineHeight: 1 }}>{items.length}</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Sections Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {SECTIONS.map(s => (
            <Link href={s.href} key={s.href} style={{ textDecoration: "none" }}>
              <div className="stat-card" style={{ borderColor: `${s.color}20` }}>
                <div className="stat-value" style={{ color: s.color }}>{s.count}</div>
                <div className="stat-label" style={{ color: s.color }}>{s.label}</div>
                <div className="stat-desc">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent items */}
        <div className="section-header" style={{ padding: "0 0 12px" }}>
          <div className="section-title">آخر القطع</div>
          <div style={{ fontSize: 11, color: "var(--text4)" }}>{items.length} قطعة</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.slice(0, 6).map((item: any) => {
            const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
            return (
              <div key={item.id} className="item-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.dressName || "فستان"}</div>
                  <div style={{ fontSize: 10, color: "var(--text4)", fontFamily: "monospace" }}>{item.dressId?.slice(0, 10) || "—"}</div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">المستودع فارغ</div>
            </div>
          )}
        </div>
      </div>
      <WarehouseNav />
    </div>
  );
}
