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
    maxBarbers: number;
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
      "Historial de clientes",
      "Reportes avanzados",
      "Personalización de tu página",
      "Exportación de datos (PDF)",
      "Soporte",
    ],
    limits: { maxBarbers: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para barberías con equipo pequeño.",
    priceMxn: 649,
    highlighted: true,
    badge: "Más popular",
    features: [
      "Hasta 3 barberos",
      "Agenda online ilimitada",
      "Página pública de reservas",
      "Historial de clientes",
      "Reportes avanzados",
      "Personalización de tu página",
      "Exportación de datos (PDF)",
      "Soporte",
    ],
    limits: { maxBarbers: 3 },
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Para barberías consolidadas.",
    priceMxn: 999,
    features: [
      "Hasta 5 barberos",
      "Agenda online ilimitada",
      "Página pública de reservas",
      "Historial de clientes",
      "Reportes avanzados",
      "Personalización de tu página",
      "Exportación de datos (PDF)",
      "Soporte",
    ],
    limits: { maxBarbers: 5 },
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.id, p])
) as Record<PlanId, Plan>;
