"use client";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import LogoServices from "@/components/sections/LogoServices";
import WhyUs from "@/components/sections/WhyUs";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";
import ProductTeaser from "@/components/sections/ProductTeaser";
import BeyondCatalogue from "@/components/sections/BeyondCatalogue";
import FeaturedBundle from "@/components/sections/FeaturedBundle";

export default function Home() {
  return (
    <>
      <Hero introComplete={true} />
      <About />
      <ProductTeaser />
      <BeyondCatalogue />
      <FeaturedBundle />
      <Services />
      <LogoServices />
      <WhyUs />
      <CTA />
      <Footer />
    </>
  );
}
