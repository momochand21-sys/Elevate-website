import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { OrderItem, BrandingMethod } from "@/lib/admin/types";

/**
 * Branded, customer-safe PDF for a Quote or an Order Confirmation.
 * Shows ONLY customer-facing figures (subtotal, discount, total) — never the
 * internal cost / profit / margin.
 */

export interface PdfDoc {
  kind: "Quote" | "Order Confirmation";
  reference: string;
  company: string;
  contact?: string;
  email?: string;
  phone?: string;
  location?: string;
  date: string;
  status?: string;
  items: OrderItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  notes?: string;
}

const BRAND = "#0041F9";
const INK = "#111111";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const money = (n: number) => `£${Number(n || 0).toFixed(2)}`;
const methodLabel = (m: BrandingMethod) =>
  m === "embroidery" ? "Embroidery" : m === "print" ? "Print" : m === "both" ? "Embroidery + Print" : "—";

const s = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: INK, paddingBottom: 56 },
  accent: { height: 4, backgroundColor: BRAND },
  header: { backgroundColor: "#07070A", paddingVertical: 22, paddingHorizontal: 34, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { color: "#ffffff", fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  brandSub: { color: "#9aa0a6", fontSize: 7, letterSpacing: 2, marginTop: 5 },
  docType: { color: "#ffffff", fontSize: 12, fontFamily: "Helvetica-Bold", letterSpacing: 2, textAlign: "right" },
  docRef: { color: "#7aa0ff", fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginTop: 6, textAlign: "right" },
  docDate: { color: "#9aa0a6", fontSize: 8, marginTop: 4, textAlign: "right" },
  body: { paddingHorizontal: 34, paddingTop: 22 },
  panels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  panel: { width: "48%" },
  panelLabel: { fontSize: 7.5, letterSpacing: 1.5, color: MUTED, marginBottom: 7, textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  rowLabel: { color: MUTED },
  rowValue: { color: INK },
  // table
  tHead: { flexDirection: "row", backgroundColor: "#f6f7f9", borderTopWidth: 1, borderBottomWidth: 1, borderColor: LINE, paddingVertical: 7, paddingHorizontal: 8 },
  tHeadCell: { fontSize: 7.5, letterSpacing: 0.8, color: MUTED, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: LINE, paddingVertical: 8, paddingHorizontal: 8 },
  cProduct: { width: "34%" },
  cQty: { width: "8%", textAlign: "center" },
  cMethod: { width: "18%" },
  cPos: { width: "18%" },
  cUnit: { width: "11%", textAlign: "right" },
  cTotal: { width: "11%", textAlign: "right" },
  prodName: { color: INK },
  prodCode: { color: MUTED, fontSize: 7.5, marginTop: 2 },
  lineTotal: { color: BRAND, fontFamily: "Helvetica-Bold" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalsBox: { width: 240 },
  tlRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  tlLabel: { color: MUTED },
  strike: { color: MUTED, textDecoration: "line-through" },
  grand: { borderTopWidth: 2, borderColor: INK, marginTop: 6, paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  grandValue: { fontFamily: "Helvetica-Bold", fontSize: 14, color: BRAND },
  notes: { marginTop: 22, borderLeftWidth: 2, borderColor: BRAND, paddingLeft: 12, paddingVertical: 4 },
  notesLabel: { fontSize: 7.5, letterSpacing: 1.5, color: MUTED, textTransform: "uppercase", marginBottom: 4 },
  notesText: { color: "#374151", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingVertical: 14, paddingHorizontal: 34, borderTopWidth: 1, borderColor: LINE, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7.5, color: MUTED, letterSpacing: 0.5 },
});

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

export function QuoteOrderDocument({ doc }: { doc: PdfDoc }) {
  const dateStr = new Date(doc.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const hasDiscount = doc.discountPercent > 0;

  return (
    <Document title={`${doc.kind} ${doc.reference}`} author="Elevate Workwear Solutions">
      <Page size="A4" style={s.page}>
        <View style={s.accent} />
        <View style={s.header}>
          <View>
            <Text style={s.brand}>ELEVATE</Text>
            <Text style={s.brandSub}>WORKWEAR SOLUTIONS</Text>
          </View>
          <View>
            <Text style={s.docType}>{doc.kind.toUpperCase()}</Text>
            <Text style={s.docRef}>{doc.reference}</Text>
            <Text style={s.docDate}>{dateStr}</Text>
          </View>
        </View>

        <View style={s.body}>
          <View style={s.panels}>
            <View style={s.panel}>
              <Text style={s.panelLabel}>Prepared For</Text>
              <Field label="Company" value={doc.company} />
              <Field label="Contact" value={doc.contact} />
              <Field label="Email" value={doc.email} />
              <Field label="Phone" value={doc.phone} />
              <Field label="Location" value={doc.location} />
            </View>
            <View style={s.panel}>
              <Text style={s.panelLabel}>Details</Text>
              <Field label="Reference" value={doc.reference} />
              <Field label="Date" value={dateStr} />
              <Field label="Status" value={doc.status} />
            </View>
          </View>

          {/* Items table */}
          <View style={s.tHead}>
            <Text style={[s.tHeadCell, s.cProduct]}>Product</Text>
            <Text style={[s.tHeadCell, s.cQty]}>Qty</Text>
            <Text style={[s.tHeadCell, s.cMethod]}>Branding</Text>
            <Text style={[s.tHeadCell, s.cPos]}>Positions</Text>
            <Text style={[s.tHeadCell, s.cUnit]}>Per Unit</Text>
            <Text style={[s.tHeadCell, s.cTotal]}>Total</Text>
          </View>
          {doc.items.map((it, i) => (
            <View style={s.tRow} key={i} wrap={false}>
              <View style={s.cProduct}>
                <Text style={s.prodName}>{it.productName}</Text>
                {it.productCode ? <Text style={s.prodCode}>{it.productCode}</Text> : null}
              </View>
              <Text style={s.cQty}>{it.qty}</Text>
              <Text style={s.cMethod}>{methodLabel(it.method)}</Text>
              <Text style={s.cPos}>{it.positions.length ? it.positions.join(", ") : "—"}</Text>
              <Text style={s.cUnit}>{money(it.totalPerUnit)}</Text>
              <Text style={[s.cTotal, s.lineTotal]}>{money(it.lineTotal)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={s.totals}>
            <View style={s.totalsBox}>
              <View style={s.tlRow}>
                <Text style={s.tlLabel}>Subtotal</Text>
                <Text style={hasDiscount ? s.strike : undefined}>{money(doc.subtotal)}</Text>
              </View>
              {hasDiscount ? (
                <View style={s.tlRow}>
                  <Text style={{ color: "#c0392b" }}>Discount ({doc.discountPercent}%)</Text>
                  <Text style={{ color: "#c0392b" }}>−{money(doc.discountAmount)}</Text>
                </View>
              ) : null}
              <View style={s.grand}>
                <Text style={s.grandLabel}>Total</Text>
                <Text style={s.grandValue}>{money(doc.total)}</Text>
              </View>
            </View>
          </View>

          {doc.notes ? (
            <View style={s.notes}>
              <Text style={s.notesLabel}>Notes</Text>
              <Text style={s.notesText}>{doc.notes}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Elevate Workwear Solutions · info@elevateworkwear.com</Text>
          <Text style={s.footerText}>{doc.reference}</Text>
        </View>
      </Page>
    </Document>
  );
}
