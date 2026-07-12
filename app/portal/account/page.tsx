"use client";

import { useState } from "react";
import { usePortal } from "@/components/portal/PortalProvider";
import { DUMMY_CUSTOMER } from "@/lib/portal-data";

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ background:"rgba(10,10,16,0.7)", border:"1px solid rgba(255,255,255,0.06)", padding:"24px" }}>
      <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:16 }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value }: { label:string; value:string }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,0.05)", gap:16 }}>
      <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", flexShrink:0 }}>{label}</span>
      <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.6)", textAlign:"right" }}>{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const { customer } = usePortal();
  const c = customer ?? DUMMY_CUSTOMER;
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div style={{ padding:"64px 48px 48px", maxWidth:800 }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>Client Portal</p>
        <h1 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2.2rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>Account Details</h1>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        <Section title="Company Profile">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Field label="Company Name"   value={c.company}/>
            <Field label="Contact Name"   value={c.contact}/>
            <Field label="Job Title"      value={c.jobTitle}/>
            <Field label="Email Address"  value={c.email}/>
            <Field label="Phone Number"   value={c.phone}/>
            <Field label="Account Tier"   value={c.planTier === "premium" ? "Premium B2B" : "Standard"}/>
            <Field label="Member Since"   value={c.createdAt}/>
          </div>
        </Section>

        <Section title="Delivery Address">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Field label="Line 1"   value={c.deliveryAddress.line1}/>
            <Field label="City"     value={c.deliveryAddress.city}/>
            <Field label="Postcode" value={c.deliveryAddress.postcode}/>
            <Field label="Country"  value={c.deliveryAddress.country}/>
          </div>
        </Section>

        <Section title="Billing Address">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Field label="Line 1"   value={c.billingAddress.line1}/>
            <Field label="City"     value={c.billingAddress.city}/>
            <Field label="Postcode" value={c.billingAddress.postcode}/>
            <Field label="Country"  value={c.billingAddress.country}/>
          </div>
        </Section>

        <Section title="Security">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Field label="Password" value="••••••••••••"/>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button onClick={handleSave} style={{ padding:"10px 20px", background:"#0041F9", border:"none", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#fff", transition:"all 0.2s" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#0035CC";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#0041F9";}}>
                {saved ? "✓ Changes Saved" : "Save Changes"}
              </button>
              <button style={{ padding:"10px 20px", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
                Change Password
              </button>
            </div>
          </div>
        </Section>

        <Section title="Account Management">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color:"rgba(255,255,255,0.38)", lineHeight:1.6 }}>
              To update company details, addresses, or branding information, contact your account manager at{" "}
              <a href="mailto:info@elevateworkwear.com" style={{ color:"rgba(0,65,249,0.8)" }}>info@elevateworkwear.com</a>
            </p>
            <div style={{ padding:"10px 14px", background:"rgba(0,65,249,0.06)", border:"1px solid rgba(0,65,249,0.2)", display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#0041F9", boxShadow:"0 0 8px rgba(0,65,249,0.8)", flexShrink:0 }}/>
              <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,65,249,0.8)" }}>
                Premium B2B Account — Dedicated account manager available
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
