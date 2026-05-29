"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WarehouseNav from "@/components/WarehouseNav";

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
    { href: "/send",      icon: "📤", label: "إرسال",    desc: "جاهزة للإرسال",   count: stats.available, color: "#34D399" },
    { href: "/receive",   icon: "📥", label: "استلام",   desc: "مرتجعات للاستلام", count: stats.rented,    color: "#60A5FA" },
    { href: "/cleaning",  icon: "🧺", label: "تنظيف",   desc: "في التنظيف",       count: stats.cleaning,  color: "#F59E0B" },
    { href: "/condition", icon: "🔧", label: "صيانة",   desc: "في الصيانة",       count: stats.maintenance,color: "#F472B6" },
    { href: "/tracking",  icon: "🚚", label: "توصيل",   desc: "في الطريق",        count: stats.transit,   color: "#A78BFA" },
  ];

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#34D399", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0A1628", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ padding: "56px 20px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 24, color: "#34D399", marginBottom: 2 }}>درّة</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>إدارة المستودع</div>
        </div>

        {/* Total Count */}
        <div style={{ background: "rgba(52,211,153,0.08)", borderRadius: 20, border: "1px solid rgba(52,211,153,0.15)", padding: "16px 20px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#34D399", lineHeight: 1 }}>{items.length}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>إجمالي القطع في المستودع</div>
        </div>

        {/* Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {SECTIONS.map(s => (
            <Link href={s.href} key={s.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", padding: "16px 14px" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.count}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Items */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 12 }}>آخر القطع</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.slice(0, 5).map((item: any) => {
            const statusColors: Record<string, string> = { available: "#34D399", rented: "#60A5FA", cleaning: "#F59E0B", maintenance: "#F472B6", transit: "#A78BFA" };
            const statusLabels: Record<string, string> = { available: "متاح", rented: "مؤجّر", cleaning: "تنظيف", maintenance: "صيانة", transit: "توصيل" };
            return (
              <div key={item.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${statusColors[item.status] || "#6B7280"}20`, color: statusColors[item.status] || "#6B7280" }}>{statusLabels[item.status] || item.status}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item.dressName || "فستان"}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.dressId?.slice(0, 8) || "—"}</div>
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
