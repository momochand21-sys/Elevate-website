"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  calculateDigitising,
  isEmbroideryFile,
  EMBROIDERY_EXTENSIONS,
  DIGITISING_FEE,
  FREE_ORDER_THRESHOLD,
  type DigitisingResult,
} from "@/lib/digitising";

const reveal = {
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
};

function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem",
      letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:10 }}>
      {children}
    </p>
  );
}

export interface LogoUploadResult {
  hasLogo:       boolean;
  fileName?:     string;
  digitising:    DigitisingResult;
}

interface Props {
  /** If true, digitising is always free (bundle orders) */
  freeDigitising?: boolean;
  /** Garment order total BEFORE digitising — used to check £250 free threshold */
  orderTotal?: number;
  onChange: (result: LogoUploadResult | null) => void;
}

type HasFileAnswer = "yes" | "no" | null;

const EMB_ACCEPT  = ".dst,.pes,.exp,.dsb";
const LOGO_ACCEPT = ".png,.jpg,.jpeg,.pdf,.svg,.ai,.eps";

export default function LogoUploadStep({ freeDigitising, orderTotal = 0, onChange }: Props) {
  const [wantsLogo,   setWantsLogo  ] = useState<"yes"|"no"|null>(null);
  const [hasEmbFile,  setHasEmbFile ] = useState<HasFileAnswer>(null);
  const [fileName,    setFileName   ] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const emit = (opts: {
    wantsLogo: "yes"|"no"|null;
    hasEmbFile: HasFileAnswer;
    fileName: string | null;
  }) => {
    if (!opts.wantsLogo || opts.wantsLogo === "no") {
      onChange({ hasLogo:false, digitising: { status:"no-logo", fee:0, label:"No Logo" } });
      return;
    }
    if (!opts.fileName) { onChange(null); return; }
    const digitising = calculateDigitising({
      hasLogo:    true,
      fileName:   opts.fileName,
      isBundle:   freeDigitising,
      orderTotal,
    });
    onChange({ hasLogo:true, fileName: opts.fileName, digitising });
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    emit({ wantsLogo, hasEmbFile, fileName: file.name });
  };

  const pickWantsLogo = (v: "yes"|"no") => {
    setWantsLogo(v); setHasEmbFile(null); setFileName(null);
    if (v === "no") emit({ wantsLogo:"no", hasEmbFile:null, fileName:null });
    else onChange(null);
  };

  const pickHasEmbFile = (v: HasFileAnswer) => {
    setHasEmbFile(v); setFileName(null);
    onChange(null);
  };

  /* Preview the digitising result for UI feedback */
  const preview: DigitisingResult | null = wantsLogo === "yes" && fileName
    ? calculateDigitising({ hasLogo:true, fileName, isBundle:freeDigitising, orderTotal })
    : null;

  return (
    <div className="flex flex-col gap-5">

      {/* Step A: wants logo? */}
      <div>
        <MonoLabel>Would you like to add a custom logo?</MonoLabel>
        <div className="grid grid-cols-2 gap-2">
          {(["yes","no"] as const).map(v => (
            <button key={v} onClick={() => pickWantsLogo(v)}
              style={{ padding:"13px", border:`1px solid ${wantsLogo===v?"#0041F9":"rgba(255,255,255,0.1)"}`,
                background: wantsLogo===v?"rgba(0,65,249,0.1)":"transparent",
                cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all 0.15s" }}>
              <span style={{ width:13, height:13, borderRadius:"50%",
                border:`1px solid ${wantsLogo===v?"#0041F9":"rgba(255,255,255,0.3)"}`,
                display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                {wantsLogo===v && <span style={{ width:6, height:6, borderRadius:"50%", background:"#0041F9" }}/>}
              </span>
              <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.54rem",
                letterSpacing:"0.1em", textTransform:"uppercase",
                color: wantsLogo===v?"#fff":"rgba(255,255,255,0.45)" }}>
                {v==="yes" ? "Yes, add custom logo" : "No logo needed"}
              </span>
            </button>
          ))}
        </div>
        {/* Plain order note */}
        <p style={{
          fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.78rem",
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.65, marginTop: 10,
        }}>
          All garments are supplied blank and unbranded as standard. Selecting &quot;No logo needed&quot; means no branding, marks, or logos will be applied to your order.
        </p>
      </div>

      {/* Step B: do you have an embroidery file? */}
      <AnimatePresence>
        {wantsLogo === "yes" && (
          <motion.div key="emb-question" {...reveal} className="flex flex-col gap-5">
            <div>
              <MonoLabel>Do you already have an embroidery file?</MonoLabel>
              <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.78rem",
                color:"rgba(255,255,255,0.38)", lineHeight:1.6, marginBottom:10 }}>
                If you have a DST or PES embroidery file, upload it and we&apos;ll stitch it straight away — no extra steps.
                {" "}
                {freeDigitising || orderTotal >= FREE_ORDER_THRESHOLD
                  ? <span style={{ color:"#4ade80" }}>Logo digitising is FREE on this order.</span>
                  : <span>Don&apos;t have one? Just upload your standard logo — we&apos;ll handle the rest for a one-time £{DIGITISING_FEE.toFixed(2)} fee. Future orders using the same logo are free.</span>
                }
              </p>
              <div className="flex flex-col gap-2">
                {([
                  { v:"yes", label:"Yes, I have a DST / PES embroidery file" },
                  { v:"no",  label:"No, I only have my standard logo file" },
                ] as const).map(opt => (
                  <button key={opt.v} onClick={() => pickHasEmbFile(opt.v)}
                    style={{ padding:"12px 14px", border:`1px solid ${hasEmbFile===opt.v?"#0041F9":"rgba(255,255,255,0.08)"}`,
                      background: hasEmbFile===opt.v?"rgba(0,65,249,0.08)":"transparent",
                      cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all 0.15s" }}>
                    <span style={{ width:13, height:13, borderRadius:"50%",
                      border:`1px solid ${hasEmbFile===opt.v?"#0041F9":"rgba(255,255,255,0.25)"}`,
                      display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {hasEmbFile===opt.v && <span style={{ width:6, height:6, borderRadius:"50%", background:"#0041F9" }}/>}
                    </span>
                    <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem",
                      color: hasEmbFile===opt.v?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)" }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step C: file upload */}
            <AnimatePresence>
              {hasEmbFile !== null && (
                <motion.div key="upload" {...reveal}>
                  <MonoLabel>
                    {hasEmbFile === "yes" ? "Upload Embroidery File" : "Upload Logo File"}
                  </MonoLabel>
                  <input ref={fileRef} type="file" className="hidden"
                    accept={hasEmbFile === "yes" ? EMB_ACCEPT : LOGO_ACCEPT}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
                  <button onClick={() => fileRef.current?.click()}
                    style={{ width:"100%", padding:"18px", textAlign:"center",
                      border:`1px dashed ${fileName?"rgba(0,65,249,0.5)":"rgba(255,255,255,0.15)"}`,
                      background: fileName?"rgba(0,65,249,0.04)":"transparent",
                      cursor:"pointer", transition:"all 0.15s" }}>
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.54rem",
                      letterSpacing:"0.12em", textTransform:"uppercase",
                      color: fileName?"#0041F9":"rgba(255,255,255,0.4)" }}>
                      {fileName
                        ? `✓ ${fileName}`
                        : hasEmbFile === "yes"
                        ? `Click to upload (${EMBROIDERY_EXTENSIONS.map(e=>e.toUpperCase().replace(".","")).join(", ")})`
                        : "Click to upload (PNG, JPG, PDF, SVG, AI, EPS)"}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Digitising result */}
            <AnimatePresence>
              {preview && (
                <motion.div key="dig-result" {...reveal}>
                  <div style={{ padding:"12px 14px",
                    border:`1px solid ${preview.fee>0?"rgba(255,255,255,0.1)":"rgba(74,222,128,0.3)"}`,
                    background: preview.fee>0?"rgba(255,255,255,0.02)":"rgba(74,222,128,0.05)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem",
                        letterSpacing:"0.1em", textTransform:"uppercase",
                        color: preview.fee>0?"rgba(255,255,255,0.7)":"#4ade80" }}>
                        Logo Digitising
                      </span>
                      <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.1rem",
                        letterSpacing:"0.04em",
                        color: preview.fee>0?"#F5F5F3":"#4ade80", lineHeight:1 }}>
                        {preview.fee>0 ? `£${preview.fee.toFixed(2)}` : "FREE"}
                      </span>
                    </div>
                    {preview.sublabel && (
                      <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.75rem",
                        color: preview.fee>0?"rgba(255,255,255,0.38)":"rgba(74,222,128,0.7)", lineHeight:1.5 }}>
                        {preview.sublabel}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
