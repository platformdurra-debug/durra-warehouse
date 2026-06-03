"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import WarehouseNav from "@/components/WarehouseNav";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "bookings"), where("status", "==", "active")))
      .then(snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user]);

  const filtered = items.filter(i => !search || i.dressName?.includes(search) || i.customerName?.includes(search));

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 3 }}>WAREHOUSE</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#C9A96E" }}>درّة ✦</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="page-header-title">تتبع التوصيل</div>
          <div className="page-header-sub">{items.length} قطعة</div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الكود..." style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">لا توجد قطع حالياً</div>
            </div>
          ) : filtered.map(item => (
            <div key={item.id} className="item-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#C0392B", flexShrink: 0, marginTop: 4 }} />
                <div style={{ textAlign: "right", flex: 1, marginRight: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{item.dressName || "فستان"}</div>
                  <div style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace" }}>{item.dressId?.slice(0, 14) || "—"}</div>
                  {item.sellerName && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>المعرِضة: {item.sellerName}</div>}
                  {item.customerName && <div style={{ fontSize: 11, color: "var(--text3)" }}>العروس: {item.customerName}</div>}
                  {item.updatedAt && <div style={{ fontSize: 10, color: "var(--text4)", marginTop: 4 }}>
                    {item.endDate?.seconds ? "الإرجاع: " + new Date(item.endDate.seconds * 1000).toLocaleDateString("ar-BH") : ""}
                  </div>}
                </div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 50, background: "rgba(42,107,173,0.1)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2A6BAD" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2A6BAD" }}>مع العروس</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <WarehouseNav />
    </div>
  );
}
