import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Blog — BarberApp",
  description:
    "Consejos, noticias y recursos para barberías mexicanas.",
};

const CATEGORY_COLOR: Record<string, string> = {
  Consejos: "bg-[oklch(0.94_0.04_150)] text-[oklch(0.38_0.12_150)]",
  Noticias: "bg-[oklch(0.94_0.04_240)] text-[oklch(0.38_0.12_240)]",
  Recursos: "bg-[oklch(0.94_0.06_80)] text-[oklch(0.42_0.14_70)]",
  Barbershop: "bg-[oklch(0.94_0.04_300)] text-[oklch(0.38_0.12_300)]",
};

export default async function BlogPage() {
  const posts = await db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      category: blogPosts.category,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        Consejos y recursos para hacer crecer tu barbería.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 py-12 text-center text-sm text-[color:var(--muted-foreground)]">
          Pronto publicaremos artículos. ¡Vuelve en unos días!
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition-shadow hover:shadow-md"
            >
              <span
                className={`inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  CATEGORY_COLOR[post.category] ?? "bg-[oklch(0.94_0.02_260)] text-[oklch(0.38_0.1_260)]"
                }`}
              >
                {post.category}
              </span>
              <h2 className="mt-3 font-serif text-lg font-semibold leading-tight group-hover:underline">
                {post.title}
              </h2>
              <p className="mt-2 flex-1 text-sm text-[color:var(--muted-foreground)]">
                {post.excerpt}
              </p>
              <p className="mt-4 text-[10px] text-[color:var(--muted-foreground)]">
                {format(post.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
