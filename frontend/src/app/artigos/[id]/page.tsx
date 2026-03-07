import { db } from "@/db";
import { artigos, proposicoes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

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
    openGraph: {
      title: artigo.titulo,
      description: artigo.subtitulo,
      type: "article",
      publishedTime: artigo.createdAt.toISOString(),
      url: `${BASE_URL}/artigos/${artigo.id}`,
      siteName: "Vigia Brasil",
    },
    twitter: {
      card: "summary_large_image",
      title: artigo.titulo,
      description: artigo.subtitulo,
      images: [`${BASE_URL}/artigos/${artigo.id}/opengraph-image`],
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
    author: {
      "@type": "Organization",
      name: "Vigia Brasil",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Vigia Brasil",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/artigos/${artigo.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <svg
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
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
      </Link>

      {/* Article header */}
      <header className="mt-5 mb-10">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="font-medium text-accent dark:text-accent-dark">Câmara</span>
          <span>·</span>
          <time>{dataFormatada}</time>
        </div>

        <h1 className="mt-3 font-[family-name:var(--font-newsreader)] text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-100">
          {artigo.titulo}
        </h1>

        <p className="mt-3 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          {artigo.subtitulo}
        </p>
      </header>

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

      {/* Source reference */}
      <div className="mt-10 rounded-lg border border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Fonte
        </p>
        <a
          href={linkCamara}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-dark"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          {nomeProposicao}
        </a>
        {proposicao && (
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 line-clamp-2">
            {proposicao.ementa}
          </p>
        )}
        {proposicao?.urlInteiroTeor && (
          <a
            href={proposicao.urlInteiroTeor}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-accent dark:hover:text-accent-dark"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Ver inteiro teor (PDF)
          </a>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-5 py-4">
      </footer>
      </article>
    </>
  );
}
