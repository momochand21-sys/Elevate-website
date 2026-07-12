"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Helpers ─────────────────────────────────────────────────────── */
const MONO = "var(--font-jetbrains,monospace)";
const BEBAS = "var(--font-bebas,'Bebas Neue')";
const SANS = "var(--font-dm-sans,sans-serif)";
const ACCENT = "#0041F9";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/** Local YYYY-MM-DD (avoids timezone shifting from toISOString) */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Time slots from 09:00 to 17:00 in 30-minute steps */
function buildSlots(): string[] {
  const out: string[] = [];
  for (let h = 9; h <= 17; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 17) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
}
const ALL_SLOTS = buildSlots();

export default function BookCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const todayIso = isoDate(today);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoPrev = viewMonth > monthStart;

  /* Build the calendar grid for the current viewMonth (Monday-first) */
  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // convert Sun=0 → Mon-first offset
    const arr: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [viewMonth]);

  /* Slots available for the chosen day — hide past times if the day is today */
  const slots = useMemo(() => {
    if (!selectedDate) return ALL_SLOTS;
    if (selectedDate !== todayIso) return ALL_SLOTS;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return ALL_SLOTS.filter((s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m > mins + 30; // need at least 30 min lead time
    });
  }, [selectedDate, todayIso]);

  const canSubmit = !!selectedDate && !!selectedTime && name.trim().length > 1 && phone.trim().length >= 7;

  function reset() {
    setSelectedDate(""); setSelectedTime(""); setName(""); setPhone(""); setNotes("");
    setError(""); setDone(false); setSubmitting(false);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function close() { onClose(); setTimeout(reset, 300); }

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/book-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), date: selectedDate, time: selectedTime, notes: notes.trim() }),
      });
      if (res.ok) { setDone(true); }
      else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Something went wrong. Please try again."); }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const prettyDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "5vh 16px 40px" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 560, background: "#0a0a0a", border: "1px solid #1c1c1c", position: "relative" }}
          >
            {/* Header */}
            <div style={{ padding: "26px 28px 18px", borderBottom: "1px solid #161616", position: "relative" }}>
              <p style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>
                Schedule a Call
              </p>
              <h2 style={{ fontFamily: BEBAS, fontSize: "2rem", letterSpacing: "0.04em", color: "#F5F5F3", lineHeight: 0.95 }}>
                Book a Call With Our Team
              </h2>
              <button onClick={close} aria-label="Close"
                style={{ position: "absolute", top: 22, right: 22, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>
                ✕
              </button>
            </div>

            {done ? (
              /* ── Success ── */
              <div style={{ padding: "40px 28px 44px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h3 style={{ fontFamily: BEBAS, fontSize: "1.7rem", letterSpacing: "0.04em", color: "#F5F5F3", marginBottom: 10 }}>You're Booked In</h3>
                <p style={{ fontFamily: SANS, fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 380, margin: "0 auto 8px" }}>
                  Thanks {name.split(" ")[0]} — we'll call you on <strong style={{ color: "#F5F5F3" }}>{prettyDate}</strong> at <strong style={{ color: "#F5F5F3" }}>{selectedTime}</strong>.
                </p>
                <p style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 16 }}>
                  We'll ring {phone}
                </p>
                <button onClick={close}
                  style={{ marginTop: 28, padding: "12px 28px", background: "transparent", border: `1px solid ${ACCENT}`, color: ACCENT, fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}>
                  Done
                </button>
              </div>
            ) : (
              <div style={{ padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
                {/* ── Step 1: Calendar ── */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <p style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                      1 — Pick a Date
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => canGoPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                        disabled={!canGoPrev}
                        style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid #2a2a2a", color: canGoPrev ? "#bbb" : "#333", cursor: canGoPrev ? "pointer" : "default", fontSize: "0.7rem" }}>‹</button>
                      <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.08em", color: "#F5F5F3", minWidth: 120, textAlign: "center" }}>
                        {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                      </span>
                      <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                        style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid #2a2a2a", color: "#bbb", cursor: "pointer", fontSize: "0.7rem" }}>›</button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                    {WEEKDAYS.map((w) => (
                      <div key={w} style={{ textAlign: "center", fontFamily: MONO, fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", paddingBottom: 4 }}>{w}</div>
                    ))}
                    {cells.map((d, i) => {
                      if (!d) return <div key={`e${i}`} />;
                      const iso = isoDate(d);
                      const isPast = d < today;
                      const isSel = iso === selectedDate;
                      return (
                        <button key={iso} disabled={isPast}
                          onClick={() => { setSelectedDate(iso); setSelectedTime(""); }}
                          style={{
                            aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: MONO, fontSize: "0.72rem",
                            background: isSel ? ACCENT : isPast ? "transparent" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isSel ? ACCENT : "rgba(255,255,255,0.06)"}`,
                            color: isSel ? "#fff" : isPast ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.75)",
                            cursor: isPast ? "default" : "pointer", transition: "all 0.12s",
                          }}>
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Step 2: Time slots ── */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                      <p style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
                        2 — Pick a Time <span style={{ color: "rgba(255,255,255,0.25)" }}>· {prettyDate}</span>
                      </p>
                      {slots.length === 0 ? (
                        <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>No more slots today — please choose another day.</p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6 }}>
                          {slots.map((s) => {
                            const isSel = s === selectedTime;
                            return (
                              <button key={s} onClick={() => setSelectedTime(s)}
                                style={{ padding: "9px 0", fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.05em",
                                  background: isSel ? ACCENT : "rgba(255,255,255,0.03)",
                                  border: `1px solid ${isSel ? ACCENT : "rgba(255,255,255,0.08)"}`,
                                  color: isSel ? "#fff" : "rgba(255,255,255,0.7)", cursor: "pointer", transition: "all 0.12s" }}>
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Step 3: Details ── */}
                <AnimatePresence>
                  {selectedDate && selectedTime && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                      <p style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
                        3 — Your Details
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                          style={inputStyle} />
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" type="tel" inputMode="tel"
                          style={inputStyle} />
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you'd like to discuss? (optional)" rows={2}
                          style={{ ...inputStyle, resize: "vertical" }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <p style={{ fontFamily: MONO, fontSize: "0.62rem", color: "#f87171" }}>{error}</p>}

                {/* Submit */}
                <button onClick={submit} disabled={!canSubmit || submitting}
                  style={{ width: "100%", padding: "15px 0", marginTop: 2,
                    background: canSubmit ? (submitting ? "rgba(0,65,249,0.55)" : ACCENT) : "transparent",
                    border: `1px solid ${canSubmit ? ACCENT : "rgba(255,255,255,0.14)"}`,
                    color: canSubmit ? "#fff" : "rgba(255,255,255,0.35)",
                    fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase",
                    cursor: canSubmit && !submitting ? "pointer" : "default", transition: "all 0.2s" }}>
                  {submitting ? "Booking…" : selectedDate && selectedTime ? "Confirm Booking →" : "Pick a date & time"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F3",
  fontFamily: SANS, fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
};
