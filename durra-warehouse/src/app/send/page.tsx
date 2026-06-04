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
    // الحجوزات المؤكدة والمدفوعة الجاهزة للإرسال
    getDocs(query(collection(db, "bookings"), where("status", "==", "confirmed")))
      .then(snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user]);

  const updateStatus = async (id: string) => {
    const item = items.find(i => i.id === id);
    const isCOD = item?.paymentMethod === "cod" && item?.paymentStatus === "cod_pending";

    // لو دفع عند الاستلام — تأكيد استلام المبلغ
    if (isCOD) {
      if (!confirm(`هذا الطلب دفع عند الاستلام.\nهل استلمتِ المبلغ (${item?.totalPrice} د.ب) من العروس؟`)) return;
    }
    setUpdating(id);

    // الحجز ينتقل لـ active (الفستان مع الزبونة) + تأكيد الدفع لو COD
    await updateDoc(doc(db, "bookings", id), {
      status: "active",
      sentAt: serverTimestamp(),
      ...(isCOD ? { paymentStatus: "held", codCollectedAt: serverTimestamp() } : {}),
    });

    // سجل في تاريخ المستودع
    await addDoc(collection(db, "warehouseHistory"), {
      bookingId: id,
      dressName: item?.dressName || "فستان",
      customerName: item?.customerName || "",
      newStatus: "transit",
      action: "تم إرسال الفستان للعروس",
      createdAt: serverTimestamp(),
    });

    // إشعار للزبونة
    if (item?.customerId) {
      await addDoc(collection(db, "notifications"), {
        userId: item.customerId,
        type: "dress_sent",
        title: "🚚 فستانك في الطريق",
        body: "تم إرسال فستان " + (item.dressName || "") + " — سيصلك قريباً",
        bookingId: id,
        read: false,
        createdAt: serverTimestamp(),
      });
    }

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
          <div className="page-header-title">إرسال الطلبات</div>
          <div className="page-header-sub">{items.length} طلب جاهز للإرسال</div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو العروس..." style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">لا توجد طلبات للإرسال</div>
            </div>
          ) : filtered.map(item => {
            const start = item.startDate?.seconds ? new Date(item.startDate.seconds * 1000) : null;
            return (
              <div key={item.id} className="item-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2D8A5E", flexShrink: 0, marginTop: 4 }} />
                  <div style={{ textAlign: "right", flex: 1, marginRight: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{item.dressName || "فستان"}</div>
                    <div style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace" }}>#{item.id.slice(0, 8)}</div>
                    {item.customerName && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>👰 {item.customerName}</div>}
                    {item.customerPhone && <div style={{ fontSize: 11, color: "var(--text3)" }}>📞 {item.customerPhone}</div>}
                    {item.size && <div style={{ fontSize: 11, color: "var(--text3)" }}>المقاس: {item.size}</div>}
                    {item.paymentMethod === "cod" && item.paymentStatus === "cod_pending" && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, padding: "4px 10px", borderRadius: 8, background: "rgba(212,136,10,0.12)" }}>
                        <span>💵</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#92580A" }}>دفع عند الاستلام — حصّلي {item.totalPrice} د.ب</span>
                      </div>
                    )}
                    {start && <div style={{ fontSize: 11, color: "#2D8A5E", marginTop: 4, fontWeight: 600 }}>
                      موعد الاستلام: {start.toLocaleDateString("ar-BH", { day: "numeric", month: "long" })}
                    </div>}
                  </div>
                </div>
                <button onClick={() => updateStatus(item.id)} disabled={updating === item.id} className="btn-gold"
                  style={{ opacity: updating === item.id ? 0.6 : 1 }}>
                  {updating === item.id ? "جاري التحديث..." : "تأكيد الإرسال ✓"}
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
