"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import WarehouseNav from "@/components/WarehouseNav";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  available:   { label: "متاح",   color: "#2D8A5E", bg: "rgba(45,138,94,0.1)",   icon: "✅" },
  rented:      { label: "مؤجَّر", color: "#2A6BAD", bg: "rgba(42,107,173,0.1)",  icon: "🔑" },
  cleaning:    { label: "تنظيف",  color: "#D4880A", bg: "rgba(212,136,10,0.1)",  icon: "🧺" },
  maintenance: { label: "صيانة",  color: "#6B4FAD", bg: "rgba(107,79,173,0.1)",  icon: "🔧" },
  transit:     { label: "توصيل",  color: "#C0392B", bg: "rgba(192,57,43,0.1)",   icon: "🚚" },
};

export default function WarehouseHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;
    setFetching(true);
    getDocs(query(collection(db, "warehouseHistory"), orderBy("createdAt", "desc"), limit(100)))
      .then(snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const filtered = items.filter(i =>
    !search || i.dressName?.includes(search) || i.action?.includes(search)
  );

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 3 }}>WAREHOUSE</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#C9A96E" }}>درّة ✦</div>
        </div>
        <div className="page-title">سجل الحركات</div>
        <div className="page-sub">{items.length} حركة</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: "var(--bg2)", borderRadius: 12, padding: "10px 14px", border: "1px solid var(--border)" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن فستان..."
            style={{ flex: 1, border: "none", background: "transparent", fontFamily: "Tajawal, sans-serif", fontSize: 13, color: "var(--text)", outline: "none", textAlign: "right", direction: "rtl" }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div className="empty-text">لا توجد حركات</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(item => {
              const s = STATUS_CONFIG[item.newStatus] || STATUS_CONFIG.available;
              return (
                <div key={item.id} className="card" style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>
                        {s.icon} {s.label}
                      </span>
                      <div style={{ fontSize: 10, color: "var(--text4)" }}>
                        {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("ar-BH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.dressName || "فستان"}</div>
                      {item.action && <div style={{ fontSize: 11, color: "var(--text3)" }}>{item.action}</div>}
                      {item.note && <div style={{ fontSize: 11, color: "var(--text4)", marginTop: 2 }}>{item.note}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <WarehouseNav />
    </div>
  );
}
