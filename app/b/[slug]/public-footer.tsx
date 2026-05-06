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
    <footer className="border-t-2 border-double border-[color:var(--ink)]/30 bg-[color:var(--paper-deep)]/50 py-12 text-[color:var(--ink)]">
      <div aria-hidden className="-mt-12 mb-12 h-1" style={{ background: accent }} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {cancellationPolicy ? (
          <div className="mb-10 max-w-3xl rounded-2xl border border-[color:var(--ink)]/10 bg-[color:var(--card)] p-5 shadow-sm">
            <p className="stamp" style={{ color: accent }}>
              Política de cancelación
            </p>
            <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-[color:var(--ink)]/80">
              {cancellationPolicy}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-xl font-semibold">{name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              © {new Date().getFullYear()} · Todos los derechos reservados
            </p>
          </div>

          {hasSocial ? (
            <div className="flex items-center gap-2">
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ink)]/15 transition-colors hover:bg-[color:var(--ink)]/5"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ink)]/15 transition-colors hover:bg-[color:var(--ink)]/5"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ink)]/15 transition-colors hover:bg-[color:var(--ink)]/5"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
          Powered by{" "}
          <a href="https://barberlab.app" className="underline underline-offset-4">
            BarberLab
          </a>
        </p>
      </div>
    </footer>
  );
}
