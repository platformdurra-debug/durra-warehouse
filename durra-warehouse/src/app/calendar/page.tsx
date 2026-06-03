"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import WarehouseNav from "@/components/WarehouseNav";

export default function WarehouseCalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("status", "in", ["confirmed", "active"])))
      .then(snap => {
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setFetching(false);
      }).catch(() => setFetching(false));
  }, [user, loading]);

  // بناء أيام الـ 14 يوم القادمة
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const getBookingsForDay = (day: Date) => {
    const dayStr = day.toISOString().split("T")[0];
    return bookings.filter(b => {
      const start = b.startDate?.seconds ? new Date(b.startDate.seconds * 1000) : null;
      const end = b.endDate?.seconds ? new Date(b.endDate.seconds * 1000) : null;
      if (!start || !end) return false;
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return start.toISOString().split("T")[0] === dayStr || end.toISOString().split("T")[0] === dayStr;
    });
  };

  const selectedBookings = selectedDay ? bookings.filter(b => {
    const start = b.startDate?.seconds ? new Date(b.startDate.seconds * 1000) : null;
    const end = b.endDate?.seconds ? new Date(b.endDate.seconds * 1000) : null;
    if (!start || !end) return false;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return start.toISOString().split("T")[0] === selectedDay || end.toISOString().split("T")[0] === selectedDay;
  }) : [];

  // طلبات اليوم
  const todayStr = today.toISOString().split("T")[0];
  const todayBookings = getBookingsForDay(today);
  const toSendToday = todayBookings.filter(b => {
    const start = b.startDate?.seconds ? new Date(b.startDate.seconds * 1000) : null;
    if (!start) return false;
    start.setHours(0, 0, 0, 0);
    return start.toISOString().split("T")[0] === todayStr;
  });
  const toReceiveToday = todayBookings.filter(b => {
    const end = b.endDate?.seconds ? new Date(b.endDate.seconds * 1000) : null;
    if (!end) return false;
    end.setHours(0, 0, 0, 0);
    return end.toISOString().split("T")[0] === todayStr;
  });

  const dayNames = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 3 }}>WAREHOUSE</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#C9A96E" }}>درّة ✦</div>
        </div>
        <div className="page-title">التقويم</div>
        <div className="page-sub">جدول الإرسال والاستلام — 14 يوم قادم</div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* اليوم */}
        {(toSendToday.length > 0 || toReceiveToday.length > 0) && (
          <div className="card" style={{ marginBottom: 16, borderColor: "rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.03)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold3)", marginBottom: 12, textAlign: "right" }}>
              📅 اليوم — {today.toLocaleDateString("ar-BH", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {toSendToday.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#2D8A5E", marginBottom: 6, textAlign: "right" }}>📤 تحتاج إرسال ({toSendToday.length})</div>
                {toSendToday.map(b => (
                  <div key={b.id} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(45,138,94,0.08)", border: "1px solid rgba(45,138,94,0.15)", marginBottom: 6, textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{b.dressName || "فستان"}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{b.customerName || "—"}</div>
                  </div>
                ))}
              </div>
            )}
            {toReceiveToday.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#D4880A", marginBottom: 6, textAlign: "right" }}>📥 متوقع استلام ({toReceiveToday.length})</div>
                {toReceiveToday.map(b => (
                  <div key={b.id} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(212,136,10,0.08)", border: "1px solid rgba(212,136,10,0.15)", marginBottom: 6, textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{b.dressName || "فستان"}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{b.customerName || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* الأيام القادمة */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", marginBottom: 16 }}>
          {days.map(day => {
            const dayStr = day.toISOString().split("T")[0];
            const dayBookings = getBookingsForDay(day);
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selectedDay;
            return (
              <button key={dayStr} onClick={() => setSelectedDay(isSelected ? "" : dayStr)}
                style={{ flexShrink: 0, width: 56, padding: "10px 4px", borderRadius: 14, border: `1.5px solid ${isSelected ? "#C9A96E" : isToday ? "rgba(201,169,110,0.3)" : "var(--border)"}`, cursor: "pointer", background: isSelected ? "rgba(201,169,110,0.1)" : isToday ? "rgba(201,169,110,0.05)" : "var(--card)", textAlign: "center", transition: "all 0.2s", fontFamily: "Tajawal, sans-serif" }}>
                <div style={{ fontSize: 10, color: isSelected ? "var(--gold3)" : "var(--text3)", marginBottom: 4 }}>{dayNames[day.getDay()]}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? "var(--gold3)" : isToday ? "var(--gold3)" : "var(--text)" }}>{day.getDate()}</div>
                {dayBookings.length > 0 && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A96E", margin: "4px auto 0" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* تفاصيل اليوم المختار */}
        {selectedDay && selectedBookings.length > 0 && (
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12, textAlign: "right" }}>
              {new Date(selectedDay).toLocaleDateString("ar-BH", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedBookings.map(b => {
                const start = b.startDate?.seconds ? new Date(b.startDate.seconds * 1000) : null;
                const end = b.endDate?.seconds ? new Date(b.endDate.seconds * 1000) : null;
                const isStart = start?.toISOString().split("T")[0] === selectedDay;
                return (
                  <div key={b.id} style={{ padding: "12px 14px", borderRadius: 12, background: isStart ? "rgba(45,138,94,0.06)" : "rgba(212,136,10,0.06)", border: `1px solid ${isStart ? "rgba(45,138,94,0.15)" : "rgba(212,136,10,0.15)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: isStart ? "rgba(45,138,94,0.1)" : "rgba(212,136,10,0.1)", color: isStart ? "#2D8A5E" : "#D4880A" }}>
                        {isStart ? "📤 إرسال" : "📥 استلام"}
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{b.dressName || "فستان"}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{b.customerName || "—"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedDay && selectedBookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-text">لا توجد حركات في هذا اليوم</div>
          </div>
        )}

        {!selectedDay && toSendToday.length === 0 && toReceiveToday.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div className="empty-text">اختر يوماً لعرض تفاصيله</div>
          </div>
        )}
      </div>
      <WarehouseNav />
    </div>
  );
}
