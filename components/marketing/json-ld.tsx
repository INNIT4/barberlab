export function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BarberLab",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Sistema de citas y gestión para barberías mexicanas. Agenda online, control de clientes, reportes y más.",
    offers: [
      {
        "@type": "Offer",
        name: "Plan Starter",
        price: 0,
        priceCurrency: "MXN",
      },
      {
        "@type": "Offer",
        name: "Plan Pro",
        price: 350,
        priceCurrency: "MXN",
      },
      {
        "@type": "Offer",
        name: "Plan Premium",
        price: 700,
        priceCurrency: "MXN",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "24",
    },
    provider: {
      "@type": "Organization",
      name: "BarberLab",
      url: "https://barberlab.app",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://barberlab.app/contacto",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
