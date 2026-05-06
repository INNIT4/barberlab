import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { barbers, organizations, services } from "@/lib/db/schema";
import { buildWhatsAppUrl } from "@/lib/public/whatsapp";
import type { WorkingHours } from "@/lib/data/working-hours";
import { PublicNav } from "./public-nav";
import { Hero } from "./hero";
import { ServicesSection } from "./services-section";
import { TeamSection } from "./team-section";
import { LocationSection } from "./location-section";
import { PublicFooter } from "./public-footer";

const DEFAULT_ACCENT = "#7B1E2B";

async function loadPage(slug: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  });
  if (!org) return null;

  const [catalog, team] = await Promise.all([
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
  ]);

  return { org, catalog, team };
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

  const { org, catalog, team } = data;

  const whatsappUrl = buildWhatsAppUrl(
    org.phone,
    `Hola ${org.name}, quisiera agendar una cita.`
  );

  const accent = org.primaryColor ?? DEFAULT_ACCENT;
  const topBarberHours = (team[0]?.workingHours ?? null) as WorkingHours | null;

  const sheetBarbers = team.map((b) => ({
    id: b.id,
    name: b.name,
    avatarTone: b.avatarTone,
    workingHoursAvailable: !!b.workingHours,
  }));

  const sheetServices = catalog.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    durationMinutes: s.durationMinutes,
    priceMxn: s.priceMxn,
    imageUrl: s.imageUrl,
  }));

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
          <section className="border-t border-[color:var(--ink)]/10 bg-[color:var(--paper)] py-14 text-[color:var(--ink)] sm:py-20">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
              <p
                className="stamp"
                style={{ color: accent }}
              >
                Sobre nosotros
              </p>
              <p className="mt-4 whitespace-pre-line break-words font-serif text-xl leading-relaxed sm:text-2xl">
                {org.about}
              </p>
            </div>
          </section>
        ) : null}

        <ServicesSection
          slug={org.slug}
          services={sheetServices}
          barbers={sheetBarbers}
          accent={accent}
        />

        <TeamSection team={team} whatsappUrl={whatsappUrl} accent={accent} />

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
