import type { MetadataRoute } from "next";
import { db } from "@/db";
import { artigos } from "@/db/schema";
import { desc } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lista = await db
    .select({ id: artigos.id, createdAt: artigos.createdAt })
    .from(artigos)
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
