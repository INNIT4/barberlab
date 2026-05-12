import type { MetadataRoute } from "next";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://barberlab.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/precios`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/privacidad`, lastModified: new Date(), priority: 0.2 },
    { url: `${baseUrl}/terminos`, lastModified: new Date(), priority: 0.2 },
    { url: `${baseUrl}/sobre-nosotros`, lastModified: new Date(), priority: 0.5 },
  ];

  let barberPages: MetadataRoute.Sitemap = [];
  try {
    const orgs = await db
      .select({ slug: organizations.slug, updatedAt: organizations.updatedAt })
      .from(organizations)
      .where(and(eq(organizations.plan, "premium"), isNotNull(organizations.slug)));

    barberPages = orgs.map((org) => ({
      url: `${baseUrl}/b/${org.slug}`,
      lastModified: org.updatedAt ?? new Date(),
      priority: 0.6,
    }));
  } catch {
    // DB not available during build — skip dynamic URLs
  }

  return [...staticPages, ...barberPages];
}
