import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  });
  if (!post) return { title: "Post no encontrado" };
  return {
    title: `${post.title} — Blog BarberApp`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  });

  if (!post || !post.published) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <Link
        href="/blog"
        className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] underline underline-offset-4"
      >
        ← Volver al blog
      </Link>

      <span className="mt-6 inline-block rounded-full bg-[oklch(0.94_0.04_150)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.38_0.12_150)]">
        {post.category}
      </span>

      <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight">
        {post.title}
      </h1>

      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        {format(post.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
      </p>

      <div className="prose mt-10 max-w-none text-sm leading-relaxed whitespace-pre-line text-[color:var(--foreground)]">
        {post.content}
      </div>
    </div>
  );
}
