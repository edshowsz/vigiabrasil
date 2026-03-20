import { db } from "@/db";
import { artigos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.org";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const lista = await db
    .select()
    .from(artigos)
    .where(eq(artigos.relevante, true))
    .orderBy(desc(artigos.createdAt))
    .limit(50);

  const items = lista
    .map((artigo) => {
      const url = `${BASE_URL}/artigos/${artigo.id}`;
      const pubDate = artigo.createdAt.toUTCString();
      return `
    <item>
      <title>${escapeXml(artigo.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(artigo.subtitulo)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>Política</category>
      <category>Legislação</category>
      <author>redacao@vigiabrasil.org (Vigia Brasil)</author>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Vigia Brasil — Notícias</title>
    <link>${BASE_URL}</link>
    <description>Portal de notícias automatizado e open source, trazendo os últimos acontecimentos na política do Brasil.</description>
    <language>pt-BR</language>
    <copyright>Copyright ${new Date().getFullYear()} Vigia Brasil</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${BASE_URL}/opengraph-image</url>
      <title>Vigia Brasil</title>
      <link>${BASE_URL}</link>
    </image>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
