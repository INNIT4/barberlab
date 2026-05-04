import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { barbers, barberServices, organizations, services } from "@/lib/db/schema";
import { buildWhatsAppUrl } from "@/lib/public/whatsapp";
import { PublicNav } from "./public-nav";
import { Hero } from "./hero";
import { ServicesSection } from "./services-section";
import { TeamSection } from "./team-section";
import { LocationSection } from "./location-section";
import { PublicFooter } from "./public-footer";
import { BookingSection } from "./booking-section";

const DEFAULT_ACCENT = "oklch(0.72 0.14 60)";

async function loadPage(slug: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  });
  if (!org) return null;

  const [catalog, team, assignments] = await Promise.all([
    db
      .select()
      .from(services)
      .where(and(eq(services.organizationId, org.id), eq(services.active, true)))
      .orderBy(asc(services.sortOrder), asc(services.createdAt)),
    db
      .select()
      .from(barbers)
      .where(and(eq(barbers.organizationId, org.id), eq(barbers.active, true)))
      .orderBy(asc(barbers.createdAt)),
    db
      .select({
        barberId: barberServices.barberId,
        serviceId: barberServices.serviceId,
      })
      .from(barberServices)
      .innerJoin(barbers, eq(barberServices.barberId, barbers.id))
      .where(eq(barbers.organizationId, org.id)),
  ]);

  const serviceIdsByBarber: Record<string, string[]> = {};
  for (const a of assignments) {
    const list = serviceIdsByBarber[a.barberId] ?? [];
    list.push(a.serviceId);
    serviceIdsByBarber[a.barberId] = list;
  }

  return { org, catalog, team, serviceIdsByBarber };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPage(slug);
  if (!data) return { title: "Barbería no encontrada" };

  const { org } = data;
  const title = `${org.name} — Reserva en línea`;
  const description =
    org.tagline ??
    org.about?.slice(0, 160) ??
    `Agenda tu cita en ${org.name}. Cortes, barba y más.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: org.heroImageUrl ? [{ url: org.heroImageUrl }] : undefined,
    },
  };
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadPage(slug);
  if (!data) notFound();

  const { org, catalog, team, serviceIdsByBarber } = data;

  const whatsappUrl = buildWhatsAppUrl(
    org.phone,
    `Hola ${org.name}, quisiera agendar una cita.`
  );

  const accent = org.primaryColor ?? DEFAULT_ACCENT;
  const topBarberHours = team[0]?.workingHours ?? null;

  return (
    <>
      <PublicNav
        name={org.name}
        logoUrl={org.logoUrl}
        whatsappUrl={whatsappUrl}
        accent={accent}
      />

      <main>
        <Hero
          name={org.name}
          tagline={org.tagline}
          heroImageUrl={org.heroImageUrl}
          whatsappUrl={whatsappUrl}
          address={org.address}
          topBarberHours={topBarberHours}
          accent={accent}
        />

        {org.about ? (
          <section className="border-t border-[oklch(0.25_0.02_60)] py-20 sm:py-28">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                Sobre nosotros
              </p>
              <p className="mt-6 whitespace-pre-line font-serif text-2xl leading-relaxed sm:text-3xl">
                {org.about}
              </p>
            </div>
          </section>
        ) : null}

        <ServicesSection
          services={catalog}
          whatsappUrl={whatsappUrl}
          accent={accent}
        />

        <TeamSection team={team} whatsappUrl={whatsappUrl} accent={accent} />

        <BookingSection
          slug={org.slug}
          services={catalog}
          barbers={team.map((b) => ({
            id: b.id,
            name: b.name,
            avatarTone: b.avatarTone,
          }))}
          accent={accent}
        />

        <LocationSection
          address={org.address}
          addressNotes={org.addressNotes}
          googleMapsUrl={org.googleMapsUrl}
          phone={org.phone}
          accent={accent}
        />
      </main>

      <PublicFooter
        name={org.name}
        instagramUrl={org.instagramUrl}
        facebookUrl={org.facebookUrl}
        tiktokUrl={org.tiktokUrl}
        cancellationPolicy={org.cancellationPolicy}
        accent={accent}
      />
    </>
  );
}
