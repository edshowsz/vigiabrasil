import type { MetadataRoute } from "next";
import { db } from "@/db";
import { artigos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lista = await db
    .select({ id: artigos.id, createdAt: artigos.createdAt })
    .from(artigos)
    .where(eq(artigos.relevante, true))
    .orderBy(desc(artigos.createdAt));

  const artigoEntries: MetadataRoute.Sitemap = lista.map((artigo) => ({
    url: `${BASE_URL}/artigos/${artigo.id}`,
    lastModified: artigo.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...artigoEntries,
  ];
}
