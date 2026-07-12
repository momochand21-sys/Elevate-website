"use client";

import { useState } from "react";
import { usePortal } from "@/components/portal/PortalProvider";
import ElevateLogo from "@/components/ui/ElevateLogo";

export default function PortalLogin() {
  const { login } = usePortal();
  const [email,    setEmail   ] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError   ] = useState("");
  const [loading,  setLoading ] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width:"100%", padding:"12px 16px", background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(255,255,255,0.1)", outline:"none",
    color:"rgba(255,255,255,0.8)", fontFamily:"var(--font-dm-sans,sans-serif)",
    fontSize:"0.9rem", transition:"border-color 0.2s",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-[102px] md:pt-[110px]" style={{ background:"#07070A" }}>
      <div style={{ width:"100%", maxWidth:420 }}>

        {/* Logo */}
        <div style={{ marginBottom:32, display:"flex", flexDirection:"column", gap:8 }}>
          <ElevateLogo variant="nav" />
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)" }}>
            Client Portal
          </p>
        </div>

        <h1 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2rem", letterSpacing:"0.05em", color:"#F5F5F3", marginBottom:6, lineHeight:1 }}>
          Sign In
        </h1>
        <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.38)", marginBottom:28 }}>
          Access your brand assets, orders, and quote history.
        </p>


        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.38)", marginBottom:6 }}>
              Email Address
            </p>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="you@company.com" required style={inp}
              onFocus={e=>{e.target.style.borderColor="rgba(0,65,249,0.6)";}}
              onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";}}
            />
          </div>

          <div>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.38)", marginBottom:6 }}>
              Password
            </p>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••••" required style={inp}
              onFocus={e=>{e.target.style.borderColor="rgba(0,65,249,0.6)";}}
              onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";}}
            />
          </div>

          {error && (
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", color:"#f87171", letterSpacing:"0.08em" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            style={{ padding:"14px", background:loading?"rgba(0,65,249,0.5)":"#0041F9", border:"none", cursor:loading?"default":"pointer", transition:"background 0.2s", marginTop:4 }}
            onMouseEnter={e=>{if(!loading)(e.currentTarget as HTMLElement).style.background="#0035CC";}}
            onMouseLeave={e=>{if(!loading)(e.currentTarget as HTMLElement).style.background="#0041F9";}}>
            <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.62rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#fff" }}>
              {loading ? "Signing In…" : "Sign In"}
            </span>
          </button>
        </form>

        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", marginTop:24, textAlign:"center" }}>
          New client? Contact{" "}
          <a href="mailto:info@elevateworkwear.com" style={{ color:"rgba(0,65,249,0.7)" }}>
            info@elevateworkwear.com
          </a>{" "}
          to set up your account.
        </p>
      </div>
    </div>
  );
}
