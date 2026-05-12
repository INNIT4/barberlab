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
import { HomeJsonLd, FaqJsonLd } from "@/components/marketing/json-ld";

const FAQS = [
  {
    question: "¿Necesito tarjeta de crédito para la prueba?",
    answer:
      "No. El primer mes es libre. Si al final no convence, simplemente no conectas método de pago y la cuenta se pausa.",
  },
  {
    question: "¿Cobran comisión por cada cita?",
    answer:
      "Nunca. Tu precio mensual es fijo y todo lo que cobres por servicios es 100% tuyo. No somos intermediarios de tus ventas.",
  },
  {
    question: "¿Pueden usarlo varios barberos a la vez?",
    answer:
      "Sí. Cada barbero tiene su propia agenda y ve solo sus citas. El plan Starter incluye 1 barbero, Pro hasta 3 y Premium hasta 5.",
  },
  {
    question: "¿Qué pasa si cambio de plan?",
    answer:
      "Puedes subir o bajar de plan cuando quieras desde el panel. El cobro se ajusta al siguiente ciclo.",
  },
  {
    question: "¿Mis clientes necesitan descargar algo?",
    answer:
      "No. Tu página de reservas funciona desde cualquier navegador. Tu cliente abre el link, elige hora y listo.",
  },
  {
    question: "¿Tienen soporte en español?",
    answer:
      "Por supuesto. Te atendemos por WhatsApp y email en horario laboral CST.",
  },
];

const MAX_FOUNDERS = 20;

export default async function HomePage() {
  const [{ total }] = await db
    .select({ total: count() })
    .from(organizations);

  const remaining = Math.max(0, MAX_FOUNDERS - total);

  return (
    <>
      <HomeJsonLd />
      <FaqJsonLd faqs={FAQS} />
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
