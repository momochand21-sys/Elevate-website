"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", success: "#22c55e" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", padding: "10px 12px", background: "#0a0a0a",
        border: "1px solid #1f1f1f", color: S.text, fontSize: "0.85rem",
        outline: "none", fontFamily: "inherit", boxSizing: "border-box",
      }}
      onFocus={(e) => { e.target.style.borderColor = S.accent; }}
      onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
    />
  );
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    company: "", contact: "", email: "", phone: "", address: "",
    notes: "", digitisedLogoStatus: "none" as "none" | "pending" | "complete",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function save() {
    if (!form.company) { setError("Company name is required"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/customers/${data.id}`);
    } else {
      setError("Failed to save");
    }
  }

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 600 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          fontSize: "1.8rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1,
        }}>New Customer</h1>
      </div>

      <Field label="Company Name *">
        <Input value={form.company} onChange={(v) => set("company", v)} placeholder="Acme Ltd" />
      </Field>
      <Field label="Contact Name">
        <Input value={form.contact} onChange={(v) => set("contact", v)} placeholder="John Smith" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Email">
          <Input value={form.email} onChange={(v) => set("email", v)} placeholder="john@acme.com" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(v) => set("phone", v)} placeholder="07700 900000" />
        </Field>
      </div>
      <Field label="Address">
        <textarea
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", background: "#0a0a0a",
            border: "1px solid #1f1f1f", color: S.text, fontSize: "0.85rem",
            outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = S.accent; }}
          onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
        />
      </Field>
      <Field label="Logo Status">
        <select
          value={form.digitisedLogoStatus}
          onChange={(e) => set("digitisedLogoStatus", e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", background: "#0a0a0a",
            border: "1px solid #1f1f1f", color: S.text, fontSize: "0.85rem",
            outline: "none", fontFamily: "inherit",
          }}
        >
          <option value="none">No Logo</option>
          <option value="pending">Pending Digitising</option>
          <option value="complete">Digitised</option>
        </select>
      </Field>
      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", background: "#0a0a0a",
            border: "1px solid #1f1f1f", color: S.text, fontSize: "0.85rem",
            outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = S.accent; }}
          onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
        />
      </Field>

      {error && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginBottom: 12 }}>{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "11px 20px", background: S.accent, border: "none",
          color: "#fff", fontSize: "0.72rem", cursor: "pointer",
        }}
      >
        <Save size={13} /> {saving ? "Saving…" : "Create Customer"}
      </button>
    </div>
  );
}
