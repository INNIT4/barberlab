import { count } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { organizations } from "@/lib/db/schema";
import { HeroSection } from "@/components/marketing/hero-section";
import { TrustBar } from "@/components/marketing/trust-bar";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";

const MAX_FOUNDERS = 20;

export default async function HomePage() {
  const [{ total }] = await db
    .select({ total: count() })
    .from(organizations);

  const remaining = Math.max(0, MAX_FOUNDERS - total);

  return (
    <>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <TestimonialSection />
      <FaqSection />
      <CtaSection remaining={remaining} />
    </>
  );
}
