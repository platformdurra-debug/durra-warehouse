"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/tracking",  label: "التتبع",   svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { href: "/condition", label: "الصيانة",  svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  { href: "/cleaning",  label: "التنظيف",  svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6l3 1m0 0-3 9a5.002 5.002 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1-3 9a5.002 5.002 0 0 0 6.001 0M18 7l3 9m-3-9-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg> },
  { href: "/receive",   label: "استلام",   svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
  { href: "/send",      label: "إرسال",    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
  { href: "/dashboard", label: "الرئيسية", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
];

export default function WarehouseNav() {
  const path = usePathname();
  if (path === "/auth") return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }}>
      <div style={{ background: "rgba(10,22,40,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 0 20px" }}>
        {NAV.map(item => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, position: "relative" }}>
              {active && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, borderRadius: "0 0 4px 4px", background: "linear-gradient(90deg, #34D399, #6EE7B7)" }} />}
              <div style={{ color: active ? "#34D399" : "rgba(255,255,255,0.3)", transition: "color 0.2s" }}>{item.svg}</div>
              <span style={{ fontSize: 10, fontFamily: "Tajawal, sans-serif", fontWeight: active ? 700 : 400, color: active ? "#34D399" : "rgba(255,255,255,0.3)" }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
