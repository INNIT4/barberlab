import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[oklch(0.15_0.01_60)] text-[oklch(0.98_0.01_80)] font-sans antialiased">
      {children}
    </div>
  );
}
