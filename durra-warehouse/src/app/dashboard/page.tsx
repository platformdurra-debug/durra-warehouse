"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WarehouseNav from "@/components/WarehouseNav";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  available:   { label: "متاح",   color: "#2D8A5E", bg: "rgba(45,138,94,0.1)" },
  rented:      { label: "مؤجَّر", color: "#2A6BAD", bg: "rgba(42,107,173,0.1)" },
  cleaning:    { label: "تنظيف",  color: "#D4880A", bg: "rgba(212,136,10,0.1)" },
  maintenance: { label: "صيانة",  color: "#6B4FAD", bg: "rgba(107,79,173,0.1)" },
  transit:     { label: "توصيل",  color: "#C0392B", bg: "rgba(192,57,43,0.1)" },
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
    { href: "/send",      label: "إرسال",  desc: "جاهزة للإرسال",    count: stats.available,   color: "#2D8A5E" },
    { href: "/receive",   label: "استلام", desc: "مرتجعات للاستلام", count: stats.rented,      color: "#2A6BAD" },
    { href: "/cleaning",  label: "تنظيف", desc: "في التنظيف",        count: stats.cleaning,    color: "#D4880A" },
    { href: "/condition", label: "صيانة", desc: "في الصيانة",        count: stats.maintenance, color: "#6B4FAD" },
    { href: "/tracking",  label: "توصيل", desc: "في الطريق",         count: stats.transit,     color: "#C0392B" },
  ];

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 3 }}>WAREHOUSE</div>
          <div className="page-header-logo">درّة ✦</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="page-header-title">إدارة المستودع</div>
          <div className="page-header-sub">{items.length} قطعة في المخزون</div>
        </div>
        <div style={{ marginTop: 16, background: "rgba(201,169,110,0.1)", borderRadius: 16, border: "1px solid rgba(201,169,110,0.2)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "rgba(201,169,110,0.6)" }}>إجمالي المخزون</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#C9A96E", lineHeight: 1, fontFamily: "Tajawal" }}>{items.length}</div>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {SECTIONS.map(s => (
            <Link href={s.href} key={s.href} style={{ textDecoration: "none" }}>
              <div className="stat-card" style={{ borderColor: `${s.color}22` }}>
                <div className="stat-value" style={{ color: s.color }}>{s.count}</div>
                <div className="stat-label" style={{ color: s.color }}>{s.label}</div>
                <div className="stat-desc">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent */}
        <div className="section-title">آخر القطع</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">المستودع فارغ</div>
            </div>
          )}
          {items.slice(0, 6).map((item: any) => {
            const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
            return (
              <div key={item.id} className="item-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.dressName || "فستان"}</div>
                  <div style={{ fontSize: 10, color: "var(--text4)", fontFamily: "monospace" }}>{item.dressId?.slice(0, 10) || "—"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <WarehouseNav />
    </div>
  );
}
