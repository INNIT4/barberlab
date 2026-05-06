import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — BarberLab",
  description:
    "Términos y condiciones del servicio BarberLab para barberías en México.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Términos y Condiciones
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        Última actualización: Mayo 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[color:var(--foreground)]">
        <section>
          <h2 className="font-serif text-xl font-semibold">
            1. Aceptación de los términos
          </h2>
          <p className="mt-3">
            Al acceder o utilizar BarberLab y sus servicios relacionados
            (&ldquo;el Servicio&rdquo;), aceptas estos Términos y Condiciones.
            Si no estás de acuerdo, no utilices el Servicio. BarberLab es
            operado desde México y está dirigido a barberías y negocios de
            cuidado personal en territorio mexicano.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            2. Descripción del Servicio
          </h2>
          <p className="mt-3">
            BarberLab proporciona una plataforma de gestión de citas y agenda
            para barberías, que incluye: panel de administración, página pública
            de reservas, gestión de barberos, servicios, clientes y reportes
            (&ldquo;el Servicio&rdquo;). Nos reservamos el derecho de modificar,
            suspender o descontinuar cualquier aspecto del Servicio en cualquier
            momento.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            3. Cuentas de usuario
          </h2>
          <p className="mt-3">
            Para utilizar el Servicio debes crear una cuenta proporcionando
            información veraz, precisa y completa. Eres responsable de mantener
            la confidencialidad de tu contraseña y de todas las actividades que
            ocurran bajo tu cuenta. Debes notificarnos inmediatamente sobre
            cualquier uso no autorizado de tu cuenta.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            4. Planes, precios y facturación
          </h2>
          <p className="mt-3">
            BarberLab ofrece planes de suscripción con precios publicados en
            nuestra página de precios. Los precios están expresados en pesos
            mexicanos (MXN) e incluyen IVA. Nos reservamos el derecho de
            modificar los precios con aviso previo de al menos 30 días. Las
            suscripciones se renuevan automáticamente al final de cada período
            de facturación, a menos que canceles antes de la fecha de
            renovación.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            5. Cancelación y reembolsos
          </h2>
          <p className="mt-3">
            Puedes cancelar tu suscripción en cualquier momento desde el panel
            de administración. La cancelación será efectiva al final del período
            de facturación actual. No se realizan reembolsos por períodos
            parciales, salvo que la ley aplicable lo exija. Durante el período
            de prueba gratuito no se requiere tarjeta de crédito.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            6. Uso aceptable
          </h2>
          <p className="mt-3">
            Te comprometes a utilizar el Servicio únicamente para fines lícitos
            y de acuerdo con la legislación mexicana aplicable. No podrás:
            utilizar el Servicio para actividades fraudulentas; interferir con
            el funcionamiento del Servicio; acceder sin autorización a sistemas
            o datos de otros usuarios; o revender, sublicenciar o redistribuir
            el Servicio sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            7. Propiedad intelectual
          </h2>
          <p className="mt-3">
            BarberLab, su marca, logo, diseño, código fuente y todos los
            contenidos del Servicio son propiedad exclusiva de BarberLab y están
            protegidos por las leyes de propiedad intelectual mexicanas e
            internacionales. No adquieres ningún derecho de propiedad sobre el
            Servicio o su contenido, salvo el derecho limitado de uso conforme a
            estos términos.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            8. Limitación de responsabilidad
          </h2>
          <p className="mt-3">
            El Servicio se proporciona &ldquo;tal cual&rdquo; y &ldquo;según
            disponibilidad&rdquo;. BarberLab no garantiza que el Servicio sea
            ininterrumpido o libre de errores. En la máxima medida permitida por
            la ley mexicana, BarberLab no será responsable por daños indirectos,
            incidentales, especiales o consecuentes derivados del uso o la
            imposibilidad de uso del Servicio.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            9. Ley aplicable y jurisdicción
          </h2>
          <p className="mt-3">
            Estos términos se rigen por las leyes de los Estados Unidos
            Mexicanos. Cualquier controversia derivada de estos términos será
            sometida a la jurisdicción de los tribunales competentes en
            Hermosillo, Sonora.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">10. Contacto</h2>
          <p className="mt-3">
            Para cualquier duda sobre estos términos, contáctanos en:
            hola@barberlab.app o vía WhatsApp al +52 662 123 4567.
          </p>
        </section>
      </div>
    </div>
  );
}
