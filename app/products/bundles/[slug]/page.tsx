import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BUNDLES, getBundle } from "@/lib/bundles";
import BundleDetailView from "@/components/sections/BundleDetailView";

export function generateStaticParams() {
  return BUNDLES.map(b => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const bundle = getBundle(params.slug);
  if (!bundle) return { title: "Bundle | Elevate Workwear Solutions" };
  return {
    title: `${bundle.name} | Elevate Workwear Solutions`,
    description: bundle.description,
  };
}

export default function BundleDetailPage({ params }: { params: { slug: string } }) {
  const bundle = getBundle(params.slug);
  if (!bundle) notFound();

  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-28 pb-0">
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          {[
            { label: "Bundle Deals", href: "/bundle-deals" },
            { label: bundle.name,    href: ""              },
          ].map((crumb, i, arr) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href} className="font-mono text-[8px] tracking-[0.18em] uppercase transition-colors duration-200 text-white/30 hover:text-white/65">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase" style={{ color: "rgba(0,65,249,0.8)" }}>{crumb.label}</span>
              )}
              {i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem" }}>/</span>}
            </span>
          ))}
        </nav>
      </div>

      {/* Layout */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        <BundleDetailView bundle={bundle} />
      </div>
    </main>
  );
}
