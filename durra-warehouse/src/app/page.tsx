"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Root() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, []);
  return <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#34D399", fontSize: 32 }}>✦</div></div>;
}
