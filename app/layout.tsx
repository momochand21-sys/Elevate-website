import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";
import { BasketProvider } from "@/lib/basket-context";
import { QuoteModalProvider } from "@/lib/quote-modal-context";
import SiteChrome from "@/components/layout/SiteChrome";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["200", "300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elevate Workwear Solutions — Premium B2B Workwear",
  description:
    "Premium B2B workwear supply, custom branding, and corporate kits for businesses across the UK. Trusted by 500+ companies.",
  keywords: "workwear, B2B, uniforms, corporate clothing, custom branding, embroidery, UK",
  openGraph: {
    title: "Elevate Workwear Solutions",
    description: "Premium B2B workwear for businesses that demand excellence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-black text-off-white antialiased">
        <QuoteModalProvider>
          <BasketProvider>
            <SmoothScrollProvider>
              {/* Public marketing chrome — hidden on /admin (the CRM) */}
              <SiteChrome />

              {/* Page content */}
              <main>{children}</main>
            </SmoothScrollProvider>
          </BasketProvider>
        </QuoteModalProvider>
      </body>
    </html>
  );
}
