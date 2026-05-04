export type PlanId = "starter" | "pro" | "premium";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceMxn: number;
  highlighted?: boolean;
  badge?: string;
  features: string[];
  limits: {
    maxBarbers: number | "ilimitados";
  };
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Para el barbero que empieza solo.",
    priceMxn: 349,
    features: [
      "1 barbero",
      "Agenda online ilimitada",
      "Página pública de reservas",
      "Recordatorios por email",
      "Soporte por WhatsApp",
    ],
    limits: { maxBarbers: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para barberías con equipo.",
    priceMxn: 649,
    highlighted: true,
    badge: "Más popular",
    features: [
      "Hasta 5 barberos",
      "Todo lo del plan Starter",
      "Historial de clientes",
      "Reportes de ingresos y asistencia",
      "Personalización de tu página",
      "Soporte prioritario",
    ],
    limits: { maxBarbers: 5 },
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Para barberías en crecimiento.",
    priceMxn: 999,
    features: [
      "Barberos ilimitados",
      "Todo lo del plan Pro",
      "Reportes avanzados por barbero",
      "Segmentación de clientes",
      "Onboarding 1:1 con tu equipo",
      "Soporte por llamada",
    ],
    limits: { maxBarbers: "ilimitados" },
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.id, p])
) as Record<PlanId, Plan>;
