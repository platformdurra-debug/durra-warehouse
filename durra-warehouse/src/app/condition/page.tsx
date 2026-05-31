"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import WarehouseNav from "@/components/WarehouseNav";

export default function ConditionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Damage report modal
  const [reportItem, setReportItem] = useState<any>(null);
  const [damageDesc, setDamageDesc] = useState("");
  const [damageImages, setDamageImages] = useState<File[]>([]);
  const [damagePreviews, setDamagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "warehouse"), where("status", "in", ["maintenance", "cleaning"])))
      .then(snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user]);

  const markFixed = async (id: string) => {
    setUpdating(id);
    await updateDoc(doc(db, "warehouse", id), { status: "available", updatedAt: new Date() });
    await addDoc(collection(db, "warehouseHistory"), {
      warehouseId: id,
      dressName: items.find(i => i.id === id)?.dressName || "",
      newStatus: "available",
      action: "تمت الصيانة — أصبح متاحاً",
      createdAt: serverTimestamp(),
    });
    setItems(prev => prev.filter(i => i.id !== id));
    setUpdating(null);
  };

  const handleDamageImages = (files: FileList) => {
    const arr = Array.from(files).slice(0, 4);
    setDamageImages(arr);
    setDamagePreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const submitDamageReport = async () => {
    if (!reportItem || !damageDesc.trim()) { alert("أضف وصف الضرر"); return; }
    setSubmitting(true);
    try {
      // رفع الصور
      const urls: string[] = [];
      for (const img of damageImages) {
        const storageRef = ref(storage, `damage/${reportItem.id}/${Date.now()}_${img.name}`);
        await uploadBytes(storageRef, img);
        urls.push(await getDownloadURL(storageRef));
      }

      // حفظ تقرير الضرر
      await addDoc(collection(db, "damageReports"), {
        warehouseId: reportItem.id,
        dressId: reportItem.dressId,
        dressName: reportItem.dressName || "فستان",
        bookingId: reportItem.bookingId,
        customerId: reportItem.customerId,
        customerName: reportItem.customerName,
        sellerId: reportItem.sellerId,
        description: damageDesc,
        images: urls,
        status: "open",
        createdAt: serverTimestamp(),
      });

      // إشعار للأدمن
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "damage_report",
        title: "⚠️ تقرير ضرر جديد",
        body: `${reportItem.dressName || "فستان"} — ${damageDesc.slice(0, 60)}`,
        warehouseId: reportItem.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      // تحديث حالة الفستان لصيانة
      await updateDoc(doc(db, "warehouse", reportItem.id), {
        status: "maintenance",
        damageDesc,
        updatedAt: new Date(),
      });

      setReportItem(null);
      setDamageDesc("");
      setDamageImages([]);
      setDamagePreviews([]);
      alert("تم إرسال تقرير الضرر للإدارة ✅");
    } finally { setSubmitting(false); }
  };

  const filtered = items.filter(i => !search || i.dressName?.includes(search) || i.dressId?.includes(search));

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 3 }}>WAREHOUSE</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#C9A96E" }}>درّة ✦</div>
        </div>
        <div className="page-title">حالة القطع</div>
        <div className="page-sub">{items.length} قطعة تحتاج متابعة</div>
      </div>

      <div style={{ padding: "16px" }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الكود..." style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
              <div className="empty-text">لا توجد قطع تحتاج متابعة</div>
            </div>
          ) : filtered.map(item => (
            <div key={item.id} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.status === "maintenance" ? "#6B4FAD" : "#D4880A", flexShrink: 0, marginTop: 4 }} />
                <div style={{ textAlign: "right", flex: 1, marginRight: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{item.dressName || "فستان"}</div>
                  <div style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace" }}>{item.dressId?.slice(0, 14) || "—"}</div>
                  {item.sellerName && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>المعرِضة: {item.sellerName}</div>}
                  {item.customerName && <div style={{ fontSize: 11, color: "var(--text3)" }}>العروس: {item.customerName}</div>}
                  {item.damageDesc && (
                    <div style={{ fontSize: 11, color: "#C0392B", marginTop: 4, padding: "4px 8px", background: "rgba(192,57,43,0.06)", borderRadius: 8, border: "1px solid rgba(192,57,43,0.15)" }}>
                      ⚠️ {item.damageDesc}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setReportItem(item); setDamageDesc(""); setDamageImages([]); setDamagePreviews([]); }}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 12, background: "rgba(192,57,43,0.05)", color: "var(--red)" }}>
                  📸 تقرير ضرر
                </button>
                <button onClick={() => markFixed(item.id)} disabled={updating === item.id} className="btn-gold" style={{ flex: 1, opacity: updating === item.id ? 0.6 : 1 }}>
                  {updating === item.id ? "..." : "تمت الصيانة ✓"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Damage Report Modal */}
      {reportItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setReportItem(null)}>
          <div style={{ width: "100%", background: "var(--card)", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", textAlign: "right", marginBottom: 4 }}>⚠️ تقرير ضرر</div>
            <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "right", marginBottom: 16 }}>{reportItem.dressName}</div>

            {/* صور الضرر */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8, textAlign: "right", fontWeight: 600 }}>صور الضرر</div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                {damagePreviews.map((p, i) => <img key={i} src={p} style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />)}
                <label style={{ width: 70, height: 70, borderRadius: 10, border: "1.5px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ fontSize: 22, color: "var(--gold)" }}>+</span>
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleDamageImages(e.target.files)} />
                </label>
              </div>
            </div>

            <textarea value={damageDesc} onChange={e => setDamageDesc(e.target.value)}
              placeholder="وصف الضرر بالتفصيل..."
              style={{ width: "100%", height: 100, padding: "12px 14px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg2)", color: "var(--text)", fontFamily: "Tajawal, sans-serif", fontSize: 13, outline: "none", resize: "none", textAlign: "right", direction: "rtl", marginBottom: 14 }} />

            <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.15)", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#C0392B", textAlign: "right" }}>
                سيتم إرسال هذا التقرير للإدارة لمراجعة التأمين وخصم قيمة الضرر من تأمين الزبونة
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setReportItem(null)} className="btn-ghost">إلغاء</button>
              <button onClick={submitDamageReport} disabled={submitting || !damageDesc.trim()} className="btn-gold" style={{ flex: 1 }}>
                {submitting ? "جاري الإرسال..." : "إرسال للإدارة"}
              </button>
            </div>
          </div>
        </div>
      )}

      <WarehouseNav />
    </div>
  );
}
