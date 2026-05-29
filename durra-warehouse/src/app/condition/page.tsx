"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import WarehouseNav from "@/components/WarehouseNav";

export default function WarehousePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "warehouse"), where("status", "==", "maintenance")))
      .then(snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const updateStatus = async (id: string) => {
    await updateDoc(doc(db, "warehouse", id), { status: "available", updatedAt: new Date() });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filtered = items.filter(i => !search || i.dressName?.includes(search) || i.dressId?.includes(search));

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#34D399", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0A1628", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 4 }}>{🔧} حالة القطع</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 14 }}>{items.length} قطعة</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontFamily: "Tajawal, sans-serif", fontSize: 13, outline: "none", textAlign: "right", direction: "rtl" }} />
      </div>
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{🔧}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد قطع حالياً</div>
          </div>
        ) : filtered.map(item => (
          <div key={item.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F472B6", marginTop: 4, flexShrink: 0 }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{item.dressName || "فستان"}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>ID: {item.dressId?.slice(0, 12) || "—"}</div>
                {item.sellerName && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>المعرِضة: {item.sellerName}</div>}
                {item.customerName && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>العروس: {item.customerName}</div>}
                {item.updatedAt && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{new Date(item.updatedAt?.seconds ? item.updatedAt.seconds * 1000 : item.updatedAt).toLocaleDateString("ar-BH")}</div>}
              </div>
            </div>
            <button onClick={() => updateStatus(item.id)} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, background: "rgba(52,211,153,0.15)", color: "#34D399" }}>
              تمت الصيانة ✓
            </button>
          </div>
        ))}
      </div>
      <WarehouseNav />
    </div>
  );
}
