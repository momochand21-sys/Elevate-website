"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { DUMMY_LOGOS, type LogoAsset } from "@/lib/portal-data";

const TYPE_LABEL: Record<LogoAsset["type"], string> = {
  master: "Master", embroidery: "Embroidery", print: "Print",
};

export default function LogosPage() {
  const [logos, setLogos] = useState<LogoAsset[]>(DUMMY_LOGOS);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setLogos(prev => [{
        id:           `logo_${Date.now()}`,
        name:         file.name.replace(/\.[^.]+$/, ""),
        type:         "master",
        fileType:     file.name.split(".").pop()?.toUpperCase() ?? "FILE",
        fileSize:     `${(file.size / 1024).toFixed(0)} KB`,
        brandColours: [],
        notes:        "",
        createdAt:    new Date().toISOString().split("T")[0],
        approved:     false,
        version:      "v1.0",
      }, ...prev]);
      setNotice(`${file.name} uploaded — awaiting approval.`);
      setUploading(false);
      setTimeout(() => setNotice(null), 5000);
    }, 1200);
  };

  const deleteLogo = (id: string) => {
    setLogos(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div style={{ padding: "64px 48px 48px", maxWidth: 1080 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "2rem", letterSpacing: "0.04em", color: "#F5F5F3", lineHeight: 1, marginBottom: 4 }}>
            Saved Logos
          </h1>
          <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
            PNG · SVG · PDF · AI · EPS · JPG
          </p>
        </div>
        <div>
          <input ref={fileRef} type="file" className="hidden"
            accept=".png,.svg,.pdf,.ai,.eps,.jpg,.jpeg" onChange={handleUpload}/>
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{
              padding: "11px 22px", background: "#0041F9", border: "none",
              cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1,
              fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.58rem",
              letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff", transition: "background 0.2s",
            }}
            onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLElement).style.background = "#0035CC"; }}
            onMouseLeave={e => { if (!uploading) (e.currentTarget as HTMLElement).style.background = "#0041F9"; }}
          >
            {uploading ? "Uploading…" : "+ Upload Logo"}
          </button>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ade80" }}>
            ✓ {notice}
          </p>
        </div>
      )}

      {/* Logo grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logos.map(logo => (
          <div key={logo.id} style={{
            background: "rgba(10,10,16,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            padding: "22px", display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* File + info */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 48, height: 48, flexShrink: 0,
                background: "rgba(0,65,249,0.1)", border: "1px solid rgba(0,65,249,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", color: "#0041F9" }}>
                  {logo.fileType}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.88rem", color: "rgba(255,255,255,0.82)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                  {logo.name}
                </p>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.44rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    {TYPE_LABEL[logo.type]} · {logo.fileSize}
                  </span>
                  {logo.approved && (
                    <span style={{ padding: "1px 6px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.4rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#22c55e" }}>
                      Approved
                    </span>
                  )}
                </div>
              </div>
            </div>

            {logo.notes && (
              <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                {logo.notes}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <Link href="/products/hoodies/heavyweight-hoodie" style={{ flex: 1 }}>
                <div style={{
                  padding: "9px", textAlign: "center",
                  background: "rgba(0,65,249,0.1)", border: "1px solid rgba(0,65,249,0.35)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.1)"; }}>
                  <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,249,0.9)" }}>
                    Use for Order
                  </span>
                </div>
              </Link>
              <button title="Download" style={{ padding: "9px 12px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.35)", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1v8M3.5 6l3 3 3-3M1 10.5v.5A1 1 0 002 12h9a1 1 0 001-1v-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button title="Delete" onClick={() => deleteLogo(logo.id)} style={{ padding: "9px 12px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.25)", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3.5h9M5 3.5V2h3v1.5M4 3.5l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Upload placeholder */}
        <div onClick={() => fileRef.current?.click()} style={{
          border: "1px dashed rgba(255,255,255,0.1)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8, padding: 28,
          cursor: "pointer", minHeight: 160, transition: "all 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,65,249,0.45)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.04)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <span style={{ fontSize: "1.4rem", color: "rgba(255,255,255,0.15)" }}>+</span>
          <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
            Upload New Logo
          </p>
        </div>
      </div>
    </div>
  );
}
