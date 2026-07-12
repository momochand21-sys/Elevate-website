"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, PhoneCall } from "lucide-react";
import type { CallBooking, CallBookingStatus } from "@/lib/admin/types";

const S = {
  text: "#F5F5F3", muted: "#777", accent: "#0041F9",
  border: "#1a1a1a", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b",
};

const STATUS_COLORS: Record<CallBookingStatus, string> = {
  new: "#f59e0b",
  confirmed: "#0041F9",
  completed: "#22c55e",
  cancelled: "#ef4444",
};
const STATUS_LABELS: Record<CallBookingStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const FILTERS: (CallBookingStatus | "all")[] = ["all", "new", "confirmed", "completed", "cancelled"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<CallBooking[]>([]);
  const [filter, setFilter] = useState<CallBookingStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings").then((r) => r.json()).then(setBookings);
  }, []);

  async function updateStatus(id: string, status: CallBookingStatus) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function deleteBooking(id: string, name: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete booking for "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    if (res.ok) setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return b.name.toLowerCase().includes(q) || b.business.toLowerCase().includes(q) || b.phone.toLowerCase().includes(q);
    });

  const prettyDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1200 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6 }}>Call Bookings</h1>
          <p style={{ fontSize: "0.72rem", color: S.muted }}>{bookings.length} calls booked via the website</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 340 }}>
        <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: S.muted }} />
        <input
          placeholder="Search name, business, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 12px 9px 34px", background: "#0a0a0a", border: "1px solid #1a1a1a", color: S.text, fontSize: "0.8rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          onFocus={(e) => { e.target.style.borderColor = S.accent; }}
          onBlur={(e) => { e.target.style.borderColor = "#1a1a1a"; }}
        />
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px", fontSize: "0.65rem", letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer",
              background: filter === f ? (f === "all" ? S.accent : STATUS_COLORS[f as CallBookingStatus]) : "transparent",
              border: `1px solid ${filter === f ? "transparent" : "#2a2a2a"}`,
              color: filter === f ? "#fff" : S.muted,
              transition: "all 0.15s",
            }}
          >
            {f === "all" ? "All" : STATUS_LABELS[f as CallBookingStatus]}
            {f !== "all" && <span style={{ marginLeft: 6, opacity: 0.7 }}>({bookings.filter((b) => b.status === f).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
              {["Name", "Business", "Phone", "Date & Time", "Notes", "Status", "Booked", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={b.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none", transition: "background 0.12s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a0a"; setHoveredId(b.id); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; setHoveredId(null); }}
              >
                <td style={{ padding: "12px 16px", color: S.text, fontWeight: 500 }}>{b.name}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{b.business || "—"}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>
                  <a href={`tel:${b.phone}`} style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                    <PhoneCall size={12} style={{ opacity: 0.5 }} /> {b.phone}
                  </a>
                </td>
                <td style={{ padding: "12px 16px", color: S.text, fontSize: "0.75rem" }}>{prettyDate(b.date)} · {b.time}</td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem", maxWidth: 220 }}>{b.notes || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value as CallBookingStatus)}
                    style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: STATUS_COLORS[b.status], fontSize: "0.65rem", padding: "4px 8px", cursor: "pointer", outline: "none" }}
                  >
                    {(Object.keys(STATUS_LABELS) as CallBookingStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>{new Date(b.createdAt).toLocaleDateString("en-GB")}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                    <button
                      onClick={(e) => deleteBooking(b.id, b.name, e)}
                      title="Delete booking"
                      style={{ display: hoveredId === b.id ? "flex" : "none", alignItems: "center", padding: "5px 7px", background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: S.danger, fontSize: "0.65rem", cursor: "pointer" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "48px 16px", textAlign: "center", color: S.muted, fontSize: "0.8rem" }}>
                  {search || filter !== "all" ? "No bookings match your filters" : "No calls booked yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
