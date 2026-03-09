import { db } from "@/db";
import { artigos, proposicoes } from "@/db/schema";
import { eq, lt, gt, desc, asc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artigoId = parseInt(id, 10);
  if (isNaN(artigoId)) return {};

  const [artigo] = await db
    .select()
    .from(artigos)
    .where(eq(artigos.id, artigoId))
    .limit(1);

  if (!artigo) return {};

  return {
    title: `${artigo.titulo} — Vigia Brasil`,
    description: artigo.subtitulo,
    keywords: ["proposição legislativa", "câmara dos deputados", "política brasileira", "legislação"],
    openGraph: {
      title: artigo.titulo,
      description: artigo.subtitulo,
      type: "article",
      publishedTime: artigo.createdAt.toISOString(),
      section: "Legislação",
      authors: ["Vigia Brasil"],
      url: `${BASE_URL}/artigos/${artigo.id}`,
      siteName: "Vigia Brasil",
      locale: "pt_BR",
      images: [`${BASE_URL}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title: artigo.titulo,
      description: artigo.subtitulo,
      images: [`${BASE_URL}/opengraph-image`],
    },
    alternates: {
      canonical: `${BASE_URL}/artigos/${artigo.id}`,
    },
  };
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artigoId = parseInt(id, 10);
  if (isNaN(artigoId)) notFound();

  const [artigo] = await db
    .select()
    .from(artigos)
    .where(eq(artigos.id, artigoId))
    .limit(1);

  if (!artigo) notFound();

  const [proposicao] = await db
    .select()
    .from(proposicoes)
    .where(eq(proposicoes.id, artigo.idProposicao))
    .limit(1);

  // Previous article (newer by date) & Next article (older by date)
  const [artigoAnterior] = await db
    .select({ id: artigos.id, titulo: artigos.titulo })
    .from(artigos)
    .where(and(eq(artigos.relevante, true), gt(artigos.createdAt, artigo.createdAt)))
    .orderBy(asc(artigos.createdAt))
    .limit(1);

  const [proximoArtigo] = await db
    .select({ id: artigos.id, titulo: artigos.titulo })
    .from(artigos)
    .where(and(eq(artigos.relevante, true), lt(artigos.createdAt, artigo.createdAt)))
    .orderBy(desc(artigos.createdAt))
    .limit(1);

  const linkCamara = `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${artigo.idProposicao}`;
  const nomeProposicao = proposicao
    ? `${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`
    : `Proposição #${artigo.idProposicao}`;

  const dataFormatada = artigo.createdAt.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: artigo.titulo,
    description: artigo.subtitulo,
    datePublished: artigo.createdAt.toISOString(),
    image: `${BASE_URL}/opengraph-image`,
    articleSection: "Legislação",
    inLanguage: "pt-BR",
    author: {
      "@type": "Organization",
      name: "Vigia Brasil",
      url: BASE_URL,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Vigia Brasil",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/artigos/${artigo.id}`,
    },
    isAccessibleForFree: true,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-2xl">
      {/* Back link */}
      <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2" render={<Link href="/" />}>
        <svg
          className="h-4 w-4 transition-transform group-hover/button:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Voltar
      </Button>

      {/* Article header */}
      <header className="mt-4 mb-8">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-brand-light text-brand dark:bg-brand/10 dark:text-brand">
            Câmara
          </Badge>
          <span className="text-xs text-muted-foreground">
            <time>{dataFormatada}</time>
          </span>
        </div>

        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {artigo.titulo}
        </h1>

        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          {artigo.subtitulo}
        </p>
      </header>

      <Separator className="mb-8" />

      {/* Article body */}
      <div className="prose-article">
        <p>{artigo.lide}</p>
        {artigo.corpo
          .split("\n")
          .filter((p) => p.trim())
          .map((paragrafo, i) => (
            <p key={i}>{paragrafo}</p>
          ))}
      </div>

      <Separator className="mt-10 mb-6" />

      {/* Source reference */}
      <Card className="bg-muted/50">
        <CardContent>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fonte
          </p>
          <a
            href={linkCamara}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            {nomeProposicao}
          </a>
          {proposicao && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {proposicao.ementa}
            </p>
          )}
          {proposicao?.urlInteiroTeor && (
            <a
              href={proposicao.urlInteiroTeor}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-brand"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Ver inteiro teor (PDF)
            </a>
          )}
        </CardContent>
      </Card>

      {/* Article navigation */}
      {(artigoAnterior || proximoArtigo) && (
        <nav className="mt-8 grid grid-cols-2 gap-3">
          {artigoAnterior ? (
            <Link
              href={`/artigos/${artigoAnterior.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border px-4 py-4 transition-all hover:border-brand/40 hover:bg-brand-light dark:hover:bg-brand/5"
            >
              <svg
                className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Anterior</span>
                <p className="mt-0.5 text-sm font-medium leading-snug text-foreground line-clamp-1 group-hover:text-brand transition-colors">
                  {artigoAnterior.titulo}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {proximoArtigo ? (
            <Link
              href={`/artigos/${proximoArtigo.id}`}
              className="group flex items-center justify-end gap-3 rounded-lg border border-border px-4 py-4 transition-all hover:border-brand/40 hover:bg-brand-light dark:hover:bg-brand/5"
            >
              <div className="min-w-0 text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Próximo</span>
                <p className="mt-0.5 text-sm font-medium leading-snug text-foreground line-clamp-1 group-hover:text-brand transition-colors">
                  {proximoArtigo.titulo}
                </p>
              </div>
              <svg
                className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}

      <footer className="mt-5 py-4">
      </footer>
      </article>
    </>
  );
}
