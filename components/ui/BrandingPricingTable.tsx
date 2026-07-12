"use client";

import { useState } from "react";

const BRANDING_TIERS = [
  { label: "1–24",   min: 1,   embChest: 3.50, embBack: 5.00, prtChest: 1.67, prtBack: 2.50 },
  { label: "25–49",  min: 25,  embChest: 3.00, embBack: 4.25, prtChest: 1.40, prtBack: 2.10 },
  { label: "50–99",  min: 50,  embChest: 2.50, embBack: 3.50, prtChest: 1.15, prtBack: 1.75 },
  { label: "100–249",min: 100, embChest: 2.00, embBack: 2.75, prtChest: 0.90, prtBack: 1.40 },
  { label: "250+",   min: 250, embChest: 1.75, embBack: 2.25, prtChest: 0.75, prtBack: 1.15 },
];

const SANS = "var(--font-dm-sans,sans-serif)";
const MONO = "var(--font-jetbrains,monospace)";
const BEBAS = "var(--font-bebas,'Bebas Neue')";

export default function BrandingPricingTable() {
  const [open, setOpen] = useState(false);
  const cols = BRANDING_TIERS;

  return (
    <div>
      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "13px 18px",
          border: `1px solid ${open ? "rgba(0,65,249,0.55)" : "rgba(255,255,255,0.12)"}`,
          background: open ? "rgba(0,65,249,0.09)" : "rgba(255,255,255,0.02)",
          cursor: "pointer", transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" stroke={open ? "#0041F9" : "rgba(255,255,255,0.4)"} strokeWidth="1.2"/>
            <rect x="8" y="1" width="5" height="5" stroke={open ? "#0041F9" : "rgba(255,255,255,0.4)"} strokeWidth="1.2"/>
            <rect x="1" y="8" width="5" height="5" stroke={open ? "#0041F9" : "rgba(255,255,255,0.4)"} strokeWidth="1.2"/>
            <rect x="8" y="8" width="5" height="5" stroke={open ? "#0041F9" : "rgba(255,255,255,0.4)"} strokeWidth="1.2"/>
          </svg>
          <span style={{ fontFamily: SANS, fontSize: "0.875rem", fontWeight: 500, color: open ? "#fff" : "rgba(255,255,255,0.65)", letterSpacing: "0.01em" }}>
            Embroidery &amp; Print Prices
          </span>
        </div>
        <span style={{
          fontFamily: SANS, fontSize: "1.1rem", lineHeight: 1,
          color: open ? "#0041F9" : "rgba(255,255,255,0.3)",
          display: "inline-block",
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 0.2s, color 0.2s",
        }}>+</span>
      </button>

      {/* ── Collapsible panel ── */}
      {open && (
        <div style={{ border: "1px solid rgba(0,65,249,0.2)", borderTop: "none", padding: "20px 18px 16px", background: "rgba(0,65,249,0.03)" }}>

          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
              <thead>
                <tr>
                  <th style={{ fontFamily: SANS, fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textAlign: "left", padding: "0 14px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>
                    Units
                  </th>
                  {cols.map(c => (
                    <th key={c.label} style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "0 8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {/* Section: Embroidery */}
                <tr>
                  <td colSpan={6} style={{ fontFamily: SANS, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,65,249,0.75)", padding: "14px 0 6px" }}>
                    Embroidery
                  </td>
                </tr>

                <tr>
                  <td style={{ fontFamily: SANS, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", padding: "8px 14px 8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>
                    Chest position
                  </td>
                  {cols.map(c => (
                    <td key={c.label} style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.04em", color: "rgba(255,255,255,0.7)" }}>
                        +£{c.embChest.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ fontFamily: SANS, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", padding: "8px 14px 8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>
                    Back position
                  </td>
                  {cols.map(c => (
                    <td key={c.label} style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.04em", color: "rgba(255,255,255,0.7)" }}>
                        +£{c.embBack.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Section: Print */}
                <tr>
                  <td colSpan={6} style={{ fontFamily: SANS, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,65,249,0.75)", padding: "14px 0 6px" }}>
                    Print
                  </td>
                </tr>

                <tr>
                  <td style={{ fontFamily: SANS, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", padding: "8px 14px 8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>
                    Chest position
                  </td>
                  {cols.map(c => (
                    <td key={c.label} style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.04em", color: "rgba(255,255,255,0.7)" }}>
                        +£{c.prtChest.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ fontFamily: SANS, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", padding: "8px 14px 8px 12px", whiteSpace: "nowrap" }}>
                    Back position
                  </td>
                  {cols.map(c => (
                    <td key={c.label} style={{ textAlign: "center", padding: "8px" }}>
                      <span style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.04em", color: "rgba(255,255,255,0.7)" }}>
                        +£{c.prtBack.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>

          <p style={{ fontFamily: SANS, fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", marginTop: 14, lineHeight: 1.5 }}>
            Per position · Per unit · Prices drop automatically at 25, 50, 100 &amp; 250 units · Min. order 10 units
          </p>
        </div>
      )}
    </div>
  );
}
