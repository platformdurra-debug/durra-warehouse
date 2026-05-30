"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "الرئيسية", icon: "🏠" },
  { href: "/send",      label: "إرسال",    icon: "📤" },
  { href: "/receive",   label: "استلام",   icon: "📥" },
  { href: "/cleaning",  label: "تنظيف",   icon: "🧺" },
  { href: "/condition", label: "صيانة",   icon: "🔧" },
  { href: "/tracking",  label: "توصيل",   icon: "🚚" },
];

export default function WarehouseNav() {
  const path = usePathname();
  if (path === "/auth") return null;
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.map(item => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link href={item.href} key={item.href} style={{ textDecoration: "none", flex: 1 }}>
              <div className={`bn-item ${active ? "active" : ""}`}>
                <div className="bn-bar" />
                <span className="bn-icon">{item.icon}</span>
                <span className="bn-label">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
