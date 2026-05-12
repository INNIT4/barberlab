type ServiceInfo = {
  name: string;
  priceMxn: number;
};

export function JsonLd({
  name,
  phone,
  address,
  slug,
  services,
}: {
  name: string;
  phone: string | null;
  address: string | null;
  slug: string;
  services: ServiceInfo[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name,
    url: `https://barberlab.app/b/${slug}`,
    ...(phone && { telephone: phone }),
    ...(address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        addressCountry: "MX",
      },
    }),
    ...(services.length > 0 && {
      makesOffer: services.map((s) => ({
        "@type": "Offer",
        name: s.name,
        price: s.priceMxn,
        priceCurrency: "MXN",
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
