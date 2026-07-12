"use client";

import Link from "next/link";
import { DUMMY_PRESETS } from "@/lib/portal-data";

export default function PresetsPage() {
  return (
    <div style={{ padding:"32px 40px", maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>Client Portal</p>
          <h1 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2.2rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>Saved Presets</h1>
          <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color:"rgba(255,255,255,0.35)", marginTop:4 }}>
            Reorder in seconds using your saved configurations.
          </p>
        </div>
        <button style={{ padding:"10px 20px", border:"1px solid rgba(0,65,249,0.5)", background:"transparent", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.58rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(0,65,249,0.8)" }}>
          + Save New Preset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DUMMY_PRESETS.map(preset => (
          <div key={preset.id} style={{ padding:"24px", background:"rgba(10,10,16,0.7)", border:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", gap:18 }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ width:44, height:44, background:"rgba(0,65,249,0.12)", border:"1px solid rgba(0,65,249,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", flexShrink:0 }}>
                {preset.icon}
              </div>
              <div>
                <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.95rem", color:"rgba(255,255,255,0.85)", fontWeight:500, marginBottom:3 }}>{preset.name}</p>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
                  Last used {preset.lastUsed}
                </p>
              </div>
            </div>

            {/* Config details */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {[
                ["Product",   preset.product],
                ["Quantity",  `${preset.qty} units`],
                ["Branding",  preset.method],
                ["Positions", preset.positions.join(", ")],
                ["Logo",      preset.logoAsset],
                ["Sizes",     Object.entries(preset.sizes).map(([k,v])=>`${k}×${v}`).join(", ")],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.26)", marginBottom:2 }}>{k}</p>
                  <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.8rem", color:"rgba(255,255,255,0.55)" }}>{v}</p>
                </div>
              ))}
            </div>

            {preset.notes && (
              <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.78rem", color:"rgba(255,255,255,0.32)", lineHeight:1.5, padding:"10px 14px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                {preset.notes}
              </p>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:8 }}>
              <Link href="/products" style={{ flex:1 }}>
                <span style={{ display:"block", padding:"10px", background:"#0041F9", textAlign:"center", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.56rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#fff" }}>
                  Reorder
                </span>
              </Link>
              <Link href="/products" style={{ flex:1 }}>
                <span style={{ display:"block", padding:"10px", border:"1px solid rgba(255,255,255,0.1)", textAlign:"center", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.56rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)" }}>
                  Request Quote
                </span>
              </Link>
              <button style={{ padding:"10px 14px", border:"1px solid rgba(255,255,255,0.08)", background:"transparent", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
                Edit
              </button>
            </div>
          </div>
        ))}

        {/* Add preset placeholder */}
        <div style={{ padding:"24px", border:"1px dashed rgba(255,255,255,0.1)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, minHeight:200, cursor:"pointer", transition:"all 0.2s" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(0,65,249,0.4)";(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.04)";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.1)";(e.currentTarget as HTMLElement).style.background="transparent";}}>
          <span style={{ fontSize:"1.5rem", color:"rgba(255,255,255,0.15)" }}>+</span>
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)" }}>Save New Preset</p>
          <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.75rem", color:"rgba(255,255,255,0.2)", textAlign:"center" }}>
            Build a quote and save it as a preset for instant reorder
          </p>
        </div>
      </div>
    </div>
  );
}
