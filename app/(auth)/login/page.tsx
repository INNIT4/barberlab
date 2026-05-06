import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";
import { signInWithGoogleAction } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Iniciar sesión — BarberLab",
  description: "Accede a tu panel de BarberLab.",
};

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Bienvenido de vuelta.
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          Entra a tu panel para ver la agenda del día.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
        <LoginForm />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[color:var(--border)]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
            o
          </span>
          <div className="h-px flex-1 bg-[color:var(--border)]" />
        </div>

        <form action={signInWithGoogleAction}>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            type="submit"
          >
            <GoogleGlyph className="mr-2 h-4 w-4" />
            Continuar con Google
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-[color:var(--muted-foreground)]">
        ¿Todavía no tienes cuenta?{" "}
        <Link
          href="/signup"
          className="font-medium text-[color:var(--foreground)] underline-offset-4 hover:underline"
        >
          Prueba 14 días gratis
        </Link>
      </p>
    </div>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        opacity={0.5}
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12S6.7 21.5 12 21.5c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.9-.1-1.3H12z"
      />
    </svg>
  );
}
