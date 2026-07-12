"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/admin/types";

const S = {
  text: "#F5F5F3", muted: "#777", accent: "#0041F9",
  border: "#1a1a1a", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "#777",
  contacted: "#f59e0b",
  interested: "#22c55e",
  not_interested: "#ef4444",
  converted: "#8b5cf6",
};
const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Not Reached Out",
  contacted: "Reached Out",
  interested: "Interested",
  not_interested: "Not Interested",
  converted: "Converted",
};

const FILTERS: (LeadStatus | "all")[] = ["all", "new", "contacted", "interested", "not_interested", "converted"];

const SOURCES = ["Cold Call", "Referral", "Website", "LinkedIn", "Walk-in", "Email", "Other"];

const emptyForm = { company: "", contact: "", email: "", phone: "", address: "", source: "", notes: "" };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads").then((r) => r.json()).then(setLeads);
  }, []);

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      setLeads((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    }
  }

  async function updateStatus(id: string, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/admin/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function deleteLead(id: string, company: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete lead "${company}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    if (res.ok) setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  // Convert a lead into a full Customer record (handy once they say yes)
  async function convertToCustomer(lead: Lead) {
    if (!confirm(`Add "${lead.company}" as a customer?`)) return;
    setConvertingId(lead.id);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: lead.company, contact: lead.contact, email: lead.email,
        phone: lead.phone, address: lead.address,
        notes: lead.notes ? `${lead.notes}\n\n(Converted from lead, source: ${lead.source || "unknown"})` : `(Converted from lead, source: ${lead.source || "unknown"})`,
      }),
    });
    if (res.ok) {
      await updateStatus(lead.id, "converted");
    }
    setConvertingId(null);
  }

  const filtered = leads
    .filter((l) => filter === "all" || l.status === filter)
    .filter((l) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return l.company.toLowerCase().includes(q) || l.contact.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    });

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1200 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6 }}>Leads</h1>
          <p style={{ fontSize: "0.72rem", color: S.muted }}>{leads.length} potential clients</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: showForm ? "transparent" : S.accent, border: showForm ? "1px solid #2a2a2a" : "none", color: showForm ? S.muted : "#fff", fontSize: "0.7rem", cursor: "pointer" }}
        >
          {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Lead</>}
        </button>
      </div>

      {/* Add lead form */}
      {showForm && (
        <form onSubmit={addLead} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "20px", marginBottom: 28 }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>New Lead</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
            {[
              { key: "company", label: "Company *", placeholder: "e.g. Acme Cleaning Ltd" },
              { key: "contact", label: "Contact Name", placeholder: "e.g. Jane Smith" },
              { key: "email", label: "Email", placeholder: "jane@acme.com" },
              { key: "phone", label: "Phone", placeholder: "07000 000000" },
              { key: "address", label: "Address / Postcode", placeholder: "e.g. Manchester, M1 1AA" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>{label}</label>
                <input
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  required={key === "company"}
                  style={{ width: "100%", padding: "8px 10px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: S.text, fontSize: "0.8rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: S.text, fontSize: "0.8rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              >
                <option value="">— Select —</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any context — what they need, when to follow up, etc."
              rows={3}
              style={{ width: "100%", padding: "8px 10px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: S.text, fontSize: "0.8rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !form.company.trim()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: S.accent, border: "none", color: "#fff", fontSize: "0.7rem", cursor: saving ? "default" : "pointer", opacity: saving || !form.company.trim() ? 0.6 : 1 }}
          >
            <Plus size={13} /> {saving ? "Adding…" : "Add Lead"}
          </button>
        </form>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 340 }}>
        <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: S.muted }} />
        <input
          placeholder="Search company, contact, email…"
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
              background: filter === f ? (f === "all" ? S.accent : STATUS_COLORS[f as LeadStatus]) : "transparent",
              border: `1px solid ${filter === f ? "transparent" : "#2a2a2a"}`,
              color: filter === f ? "#fff" : S.muted,
              transition: "all 0.15s",
            }}
          >
            {f === "all" ? "All" : STATUS_LABELS[f as LeadStatus]}
            {f !== "all" && <span style={{ marginLeft: 6, opacity: 0.7 }}>({leads.filter((l) => l.status === f).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
              {["Company", "Contact", "Email", "Phone", "Source", "Status", "Added", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none", transition: "background 0.12s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a0a"; setHoveredId(l.id); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; setHoveredId(null); }}
              >
                <td style={{ padding: "12px 16px", color: S.text, fontWeight: 500 }}>{l.company}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{l.contact || "—"}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{l.email || "—"}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{l.phone || "—"}</td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>{l.source || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value as LeadStatus)}
                    style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: STATUS_COLORS[l.status], fontSize: "0.65rem", padding: "4px 8px", cursor: "pointer", outline: "none" }}
                  >
                    {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>{new Date(l.createdAt).toLocaleDateString("en-GB")}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                    {l.status !== "converted" && (
                      <button
                        onClick={() => convertToCustomer(l)}
                        disabled={convertingId === l.id}
                        title="Add as customer"
                        style={{ display: hoveredId === l.id ? "flex" : "none", alignItems: "center", gap: 4, padding: "5px 8px", background: "transparent", border: "1px solid rgba(34,197,94,0.35)", color: S.success, fontSize: "0.65rem", cursor: "pointer" }}
                      >
                        <UserPlus size={12} /> {convertingId === l.id ? "…" : "Customer"}
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteLead(l.id, l.company, e)}
                      title="Delete lead"
                      style={{ display: hoveredId === l.id ? "flex" : "none", alignItems: "center", padding: "5px 7px", background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: S.danger, fontSize: "0.65rem", cursor: "pointer" }}
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
                  {search || filter !== "all" ? "No leads match your filters" : "No leads yet — add your first potential client"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
