"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#030303", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
      cursor: "default",
    }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            fontSize: "2.2rem", letterSpacing: "0.1em",
            color: "#F5F5F3", marginBottom: 6,
          }}>ELEVATE</p>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555" }}>
            Admin Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: "0.6rem", letterSpacing: "0.18em",
              textTransform: "uppercase", color: "#777", marginBottom: 8,
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                width: "100%", padding: "12px 16px",
                background: "#111", border: "1px solid #1f1f1f",
                borderRadius: 0, color: "#F5F5F3",
                fontSize: "0.9rem", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#0041F9"; }}
              onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "0.75rem", color: "#ef4444", marginBottom: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px 0",
              background: loading ? "#003acc" : "#0041F9",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              color: "#fff", fontSize: "0.7rem", letterSpacing: "0.18em",
              textTransform: "uppercase", fontFamily: "inherit",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
