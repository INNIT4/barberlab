import { MapPin, ExternalLink, Phone } from "lucide-react";
import { formatPhoneForDisplay } from "@/lib/public/whatsapp";

export function LocationSection({
  address,
  addressNotes,
  googleMapsUrl,
  phone,
  accent,
}: {
  address: string | null;
  addressNotes: string | null;
  googleMapsUrl: string | null;
  phone: string | null;
  accent: string;
}) {
  if (!address && !phone) return null;

  return (
    <section
      id="ubicacion"
      className="border-t border-[color:var(--ink)]/10 bg-[color:var(--paper)] py-16 text-[color:var(--ink)] sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10 max-w-2xl">
          <p className="stamp" style={{ color: accent }}>
            Visítanos
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Dónde estamos
          </h2>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {address ? (
            <div className="rounded-2xl border border-[color:var(--ink)]/10 bg-[color:var(--card)] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-1 h-5 w-5 flex-shrink-0"
                  style={{ color: accent }}
                />
                <div className="flex-1">
                  <p className="stamp text-[color:var(--muted-foreground)]">
                    Dirección
                  </p>
                  <p className="mt-1 break-words text-base font-medium">
                    {address}
                  </p>
                  {addressNotes ? (
                    <p className="mt-2 text-sm text-[color:var(--ink)]/70">
                      {addressNotes}
                    </p>
                  ) : null}
                  {googleMapsUrl ? (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                      style={{ color: accent }}
                    >
                      Abrir en Google Maps
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {phone ? (
            <div className="rounded-2xl border border-[color:var(--ink)]/10 bg-[color:var(--card)] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Phone
                  className="mt-1 h-5 w-5 flex-shrink-0"
                  style={{ color: accent }}
                />
                <div className="flex-1">
                  <p className="stamp text-[color:var(--muted-foreground)]">
                    Teléfono
                  </p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="mt-1 block text-base font-medium transition-colors hover:opacity-80"
                  >
                    {formatPhoneForDisplay(phone)}
                  </a>
                  <p className="mt-2 text-sm text-[color:var(--ink)]/70">
                    Llámanos durante nuestros horarios de atención.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
