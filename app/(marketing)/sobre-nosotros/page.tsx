import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre nosotros — BarberApp",
  description: "Conoce la historia de BarberApp, hecho en México para barberías mexicanas.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Hecho en México, para los barberos de México
      </h1>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[color:var(--foreground)]">
        <section>
          <h2 className="font-serif text-xl font-semibold">Nuestra historia</h2>
          <p className="mt-3">
            BarberApp nació en Hermosillo, Sonora, después de ver a docenas de
            barberías perder clientes por no llegar a tiempo, olvidar citas y
            depender de libretas para manejar su agenda.
          </p>
          <p className="mt-3">
            Somos un equipo pequeño de desarrolladores mexicanos que decidimos
            construir la herramienta que nos hubiera gustado tener cuando
            trabajábamos en barberías locales. Sin comisiones por cita, en
            pesos y con soporte en español real.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">Nuestra misión</h2>
          <p className="mt-3">
            Darle a cada barbería de México —desde la de la esquina hasta la
            de 10 barberos— una herramienta profesional para gestionar su
            agenda, cuidar a sus clientes y crecer sin perder el toque
            personal.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">Por qué existimos</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Sin comisiones:</strong> No cobramos un peso por cita.
              Pagas una suscripción fija mensual y listo.
            </li>
            <li>
              <strong>En pesos mexicanos:</strong> Nada de dólares, nada de
              sorpresas con el tipo de cambio.
            </li>
            <li>
              <strong>Soporte en español:</strong> Te atendemos por WhatsApp,
              en tu idioma, en tu horario.
            </li>
            <li>
              <strong>Hecho con orgullo local:</strong> Cada línea de código
              fue escrita en México, pensando en cómo trabajan las barberías
              mexicanas.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
