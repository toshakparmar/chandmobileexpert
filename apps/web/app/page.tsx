import { Hero } from "@/components/Hero";
import { FeaturesBento } from "@/components/FeaturesBento";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { BlurInHeadline } from "@/components/BlurInHeadline";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { TeamSection } from "@/components/TeamSection";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <BlurInHeadline />
      <FeaturesBento />
      <FeaturedProducts />
      <HowItWorks />
      <TeamSection variant="home" />
      <Testimonials />
      <FAQ />
    </>
  );
}
