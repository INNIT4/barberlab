import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad — BarberLab",
  description:
    "Aviso de privacidad de BarberLab conforme a la LFPDPPP mexicana.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Aviso de Privacidad
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        Última actualización: Mayo 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[color:var(--foreground)]">
        <section>
          <h2 className="font-serif text-xl font-semibold">
            1. Identidad y domicilio del responsable
          </h2>
          <p className="mt-3">
            BarberLab, con domicilio en Hermosillo, Sonora, México, es el
            responsable del tratamiento de tus datos personales, en cumplimiento
            con la Ley Federal de Protección de Datos Personales en Posesión de
            los Particulares (LFPDPPP). Para cualquier comunicación relacionada
            con este aviso, escribe a: hola@barberlab.app.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            2. Datos personales que recabamos
          </h2>
          <p className="mt-3">
            Recabamos las siguientes categorías de datos personales:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Datos de identificación y contacto:</strong> nombre
              completo, correo electrónico, número de teléfono.
            </li>
            <li>
              <strong>Datos del negocio:</strong> nombre de la barbería,
              dirección, URL personalizada.
            </li>
            <li>
              <strong>Datos de uso:</strong> información sobre tu interacción
              con la plataforma, como páginas visitadas, funciones utilizadas y
              tiempo de sesión.
            </li>
            <li>
              <strong>Datos de facturación:</strong> historial de pagos y plan
              contratado. No almacenamos datos completos de tarjetas de crédito
              o débito.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            3. Finalidades del tratamiento
          </h2>
          <p className="mt-3">
            Tus datos personales serán tratados para las siguientes finalidades:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Crear y administrar tu cuenta de usuario.</li>
            <li>
              Proveer, mantener y mejorar el Servicio de gestión de citas.
            </li>
            <li>Procesar pagos y gestionar tu suscripción.</li>
            <li>
              Enviar comunicaciones relacionadas con el Servicio, como
              confirmaciones de cita, cambios en términos y notificaciones de
              la plataforma.
            </li>
            <li>
              Enviar comunicaciones promocionales y de marketing, siempre que
              hayas otorgado tu consentimiento expreso.
            </li>
            <li>Cumplir con obligaciones legales aplicables.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            4. Transferencia de datos
          </h2>
          <p className="mt-3">
            Tus datos personales pueden ser transferidos a proveedores de
            servicios que nos apoyan en la operación de la plataforma
            (alojamiento en la nube, procesamiento de pagos y envío de correos
            electrónicos). Estos proveedores están obligados a mantener la
            confidencialidad de tus datos y a utilizarlos únicamente para los
            fines del servicio contratado. No vendemos ni compartimos tus datos
            con terceros para fines comerciales ajenos al Servicio.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            5. Derechos ARCO
          </h2>
          <p className="mt-3">
            Tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al
            tratamiento de tus datos personales (derechos ARCO). Para ejercer
            estos derechos, envía una solicitud por escrito a hola@barberlab.app
            con el asunto &ldquo;Derechos ARCO&rdquo;, incluyendo:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Nombre completo y correo electrónico asociado a tu cuenta.</li>
            <li>Descripción clara del derecho que deseas ejercer.</li>
            <li>
              Documentos que acrediten tu identidad (INE o pasaporte mexicano).
            </li>
          </ul>
          <p className="mt-3">
            Responderemos tu solicitud en un plazo máximo de 20 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            6. Uso de cookies y tecnologías similares
          </h2>
          <p className="mt-3">
            Utilizamos cookies propias y de terceros para mejorar tu experiencia
            en la plataforma, recordar tus preferencias, analizar el uso del
            Servicio y autenticar tu sesión. Puedes configurar tu navegador para
            rechazar cookies, aunque algunas funciones del Servicio podrían no
            estar disponibles.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            7. Seguridad de los datos
          </h2>
          <p className="mt-3">
            Implementamos medidas de seguridad técnicas, administrativas y
            físicas para proteger tus datos personales contra acceso no
            autorizado, pérdida, alteración o divulgación. Sin embargo, ningún
            sistema de transmisión o almacenamiento electrónico es 100% seguro.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">
            8. Cambios al aviso de privacidad
          </h2>
          <p className="mt-3">
            Nos reservamos el derecho de modificar este aviso en cualquier
            momento. Las modificaciones serán publicadas en esta página y, en
            caso de cambios sustanciales, te notificaremos por correo
            electrónico con al menos 30 días de anticipación.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">9. Consentimiento</h2>
          <p className="mt-3">
            Al utilizar BarberLab, manifiestas tu consentimiento para el
            tratamiento de tus datos personales conforme a los términos de este
            Aviso de Privacidad. Si no estás de acuerdo, por favor no utilices
            el Servicio.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">10. Contacto</h2>
          <p className="mt-3">
            Si tienes dudas sobre este aviso o el tratamiento de tus datos,
            escríbenos a: hola@barberlab.app.
          </p>
        </section>
      </div>
    </div>
  );
}
