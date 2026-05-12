import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/agenda/", "/ajustes/", "/barberos/", "/clientes/", "/gastos/", "/reportes/", "/servicios/", "/walk-ins/"],
    },
    sitemap: "https://barberlab.app/sitemap.xml",
  };
}
