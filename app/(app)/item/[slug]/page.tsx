import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import RecipeView, { RecipeFallback } from "@/components/RecipeView";
import { DATA, HINDI } from "@/lib/data";
import { bySlug, slug as toSlug } from "@/lib/season";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return DATA.map((d) => ({ slug: toSlug(d.n) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const it = bySlug((await params).slug);
  if (!it) return {};
  const hi = HINDI[it.n];
  return {
    title: `${it.n} (${hi}) — when it is in season, and what to cook`,
    description: `${it.n}, ${hi}${it.l && it.l !== it.n ? ", " + it.l : ""}: its season in your state, month by month, and dishes from your region, the rest of India and the world.`,
  };
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;
  if (!bySlug(slug)) notFound();
  return (
    <Suspense fallback={<RecipeFallback slug={slug} />}>
      <RecipeView slug={slug} />
    </Suspense>
  );
}
