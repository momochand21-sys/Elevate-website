"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TopBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <div
      className="px-3 lg:px-12"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 600,
        height: 38,
        background: "#080808",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
      }}
    >
      {/* Left — empty spacer */}
      <div />

      {/* Centre — email */}
      <a
        href="mailto:info@elevateworkwear.com"
        style={{
          display: "flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-dm-sans,sans-serif)",
          fontSize: "0.72rem", fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          textDecoration: "none",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
          justifySelf: "center",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1"/>
          <path d="M1 4l5 3.5L11 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        info@elevateworkwear.com
      </a>

      {/* Right — search (desktop) / Client Portal (mobile) */}
      <div style={{ justifySelf: "end" }}>
      <Link
        href="/portal"
        className="lg:hidden"
        style={{
          display: "inline-block",
          fontFamily: "var(--font-dm-sans,sans-serif)",
          fontSize: "0.64rem", fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          textDecoration: "none",
          whiteSpace: "nowrap",
          background: "rgba(0,65,249,0.18)",
          border: "1px solid rgba(0,65,249,0.4)",
          padding: "4px 9px",
        }}
      >
        Client Portal
      </Link>
      <form onSubmit={handleSearch} className="hidden lg:flex" style={{ alignItems: "center", gap: 0 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search products…"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRight: "none",
            color: "rgba(255,255,255,0.75)",
            fontFamily: "var(--font-dm-sans,sans-serif)",
            fontSize: "0.72rem",
            padding: "4px 12px",
            outline: "none",
            width: 180,
            height: 26,
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; e.target.style.background = "rgba(0,65,249,0.06)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
        />
        <button
          type="submit"
          style={{
            height: 26, width: 32,
            background: "#0041F9",
            border: "1px solid #0041F9",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#1050FF")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#0041F9")}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.2"/>
            <path d="M8 8l2.5 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      </form>
      </div>
    </div>
  );
}
