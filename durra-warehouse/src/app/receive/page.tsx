"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
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
    // الحجوزات النشطة (الفستان مع الزبونة، ننتظر إرجاعه)
    getDocs(query(collection(db, "bookings"), where("status", "==", "active")))
      .then(snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user]);

  const receiveItem = async (id: string) => {
    setUpdating(id);
    const item = items.find(i => i.id === id);

    // الفستان رجع — ينتقل لمرحلة التنظيف، ونعلّم إنه تم الاستلام
    await updateDoc(doc(db, "bookings", id), {
      warehouseStatus: "cleaning",
      returnedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "warehouseHistory"), {
      bookingId: id,
      dressName: item?.dressName || "فستان",
      customerName: item?.customerName || "",
      newStatus: "cleaning",
      action: "تم استلام الفستان من العروس — للتنظيف",
      createdAt: serverTimestamp(),
    });

    setItems(prev => prev.filter(i => i.id !== id));
    setUpdating(null);
  };

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
          <div className="page-header-title">استلام المرتجعات</div>
          <div className="page-header-sub">{items.length} فستان مع العرائس</div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو العروس..." style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📥</div>
              <div className="empty-text">لا توجد مرتجعات حالياً</div>
            </div>
          ) : filtered.map(item => {
            const end = item.endDate?.seconds ? new Date(item.endDate.seconds * 1000) : null;
            const isLate = end && end < new Date();
            return (
              <div key={item.id} className="item-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: isLate ? "#C0392B" : "#D4880A", flexShrink: 0, marginTop: 4 }} />
                  <div style={{ textAlign: "right", flex: 1, marginRight: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{item.dressName || "فستان"}</div>
                    <div style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace" }}>#{item.id.slice(0, 8)}</div>
                    {item.customerName && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>👰 {item.customerName}</div>}
                    {end && <div style={{ fontSize: 11, color: isLate ? "#C0392B" : "var(--text3)", marginTop: 4, fontWeight: 600 }}>
                      موعد الإرجاع: {end.toLocaleDateString("ar-BH", { day: "numeric", month: "long" })} {isLate ? "⚠️ متأخر" : ""}
                    </div>}
                  </div>
                </div>
                <button onClick={() => receiveItem(item.id)} disabled={updating === item.id} className="btn-gold"
                  style={{ opacity: updating === item.id ? 0.6 : 1 }}>
                  {updating === item.id ? "جاري التحديث..." : "تم الاستلام ✓"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <WarehouseNav />
    </div>
  );
}
