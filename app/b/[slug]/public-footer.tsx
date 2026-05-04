function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

export function PublicFooter({
  name,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  cancellationPolicy,
  accent,
}: {
  name: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  cancellationPolicy: string | null;
  accent: string;
}) {
  const hasSocial = instagramUrl || facebookUrl || tiktokUrl;

  return (
    <footer className="border-t border-[oklch(0.25_0.02_60)] bg-[oklch(0.12_0.01_60)] py-14">
      <div className="mx-auto max-w-6xl px-6">
        {cancellationPolicy ? (
          <div className="mb-12 max-w-3xl rounded-2xl border border-[oklch(0.25_0.02_60)] bg-[oklch(0.18_0.01_60)] p-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: accent }}
            >
              Política de cancelación
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[oklch(0.85_0.02_80)]">
              {cancellationPolicy}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-xl font-semibold">{name}</p>
            <p className="mt-1 text-xs text-[oklch(0.7_0.04_60)]">
              © {new Date().getFullYear()} · Todos los derechos reservados
            </p>
          </div>

          {hasSocial ? (
            <div className="flex items-center gap-3">
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.3_0.02_60)] transition-colors hover:bg-[oklch(0.25_0.02_60)]"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              ) : null}
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.3_0.02_60)] transition-colors hover:bg-[oklch(0.25_0.02_60)]"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              ) : null}
              {tiktokUrl ? (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.3_0.02_60)] transition-colors hover:bg-[oklch(0.25_0.02_60)]"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="mt-10 text-center text-[11px] uppercase tracking-wider text-[oklch(0.6_0.03_60)]">
          Powered by{" "}
          <a href="https://barberapp.mx" className="underline underline-offset-4">
            BarberApp
          </a>
        </p>
      </div>
    </footer>
  );
}
