"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
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
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "warehouse"), where("status", "==", "rented")))
      .then(snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const updateStatus = async (id: string) => {
    setUpdating(id);
    await updateDoc(doc(db, "warehouse", id), { status: "cleaning", updatedAt: new Date() });
    setItems(prev => prev.filter(i => i.id !== id));
    setUpdating(null);
  };

  const filtered = items.filter(i => !search || i.dressName?.includes(search) || i.dressId?.includes(search));

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 11, color: "rgba(52,211,153,0.55)", letterSpacing: 2 }}>WAREHOUSE</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#34D399" }}>درّة</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="page-header-title">استلام المرتجعات</div>
          <div className="page-header-sub">{items.length} قطعة</div>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الكود..." style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">لا توجد قطع حالياً</div>
            </div>
          ) : filtered.map(item => (
            <div key={item.id} className="item-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563EB", flexShrink: 0, marginTop: 4 }} />
                <div style={{ textAlign: "right", flex: 1, marginRight: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{item.dressName || "فستان"}</div>
                  <div style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace" }}>{item.dressId?.slice(0, 14) || "—"}</div>
                  {item.sellerName && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>المعرِضة: {item.sellerName}</div>}
                  {item.customerName && <div style={{ fontSize: 11, color: "var(--text3)" }}>العروس: {item.customerName}</div>}
                  {item.updatedAt && (
                    <div style={{ fontSize: 10, color: "var(--text4)", marginTop: 4 }}>
                      {new Date(item.updatedAt?.seconds ? item.updatedAt.seconds * 1000 : item.updatedAt).toLocaleDateString("ar-BH")}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => updateStatus(item.id)} disabled={updating === item.id} className="btn-green" style={{ opacity: updating === item.id ? 0.6 : 1 }}>
                {updating === item.id ? "جاري التحديث..." : "تأكيد الاستلام ✓"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <WarehouseNav />
    </div>
  );
}
