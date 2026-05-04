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
      className="border-t border-[oklch(0.25_0.02_60)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            Visítanos
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Dónde estamos
          </h2>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {address ? (
            <div className="rounded-2xl border border-[oklch(0.25_0.02_60)] bg-[oklch(0.18_0.01_60)] p-6">
              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-1 h-5 w-5 flex-shrink-0"
                  style={{ color: accent }}
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.7_0.04_60)]">
                    Dirección
                  </p>
                  <p className="mt-1 text-base font-medium">{address}</p>
                  {addressNotes ? (
                    <p className="mt-2 text-sm text-[oklch(0.8_0.02_80)]">
                      {addressNotes}
                    </p>
                  ) : null}
                  {googleMapsUrl ? (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
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
            <div className="rounded-2xl border border-[oklch(0.25_0.02_60)] bg-[oklch(0.18_0.01_60)] p-6">
              <div className="flex items-start gap-3">
                <Phone
                  className="mt-1 h-5 w-5 flex-shrink-0"
                  style={{ color: accent }}
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.7_0.04_60)]">
                    Teléfono
                  </p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="mt-1 block text-base font-medium transition-colors hover:text-white"
                  >
                    {formatPhoneForDisplay(phone)}
                  </a>
                  <p className="mt-2 text-sm text-[oklch(0.8_0.02_80)]">
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
