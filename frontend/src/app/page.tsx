import { db } from "@/db";
import { artigos } from "@/db/schema";
import { desc, count, eq } from "drizzle-orm";
import ArtigoCard from "@/components/ArtigoCard";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const PER_PAGE = 20;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10) || 1);
  const offset = (page - 1) * PER_PAGE;

  const [totalResult] = await db.select({ total: count() }).from(artigos).where(eq(artigos.relevante, true));
  const total = totalResult.total;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const lista = await db
    .select()
    .from(artigos)
    .where(eq(artigos.relevante, true))
    .orderBy(desc(artigos.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-800">
          📰
        </div>
        <h2 className="mt-5 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          Nenhum artigo ainda
        </h2>
        <p className="mt-1 max-w-sm text-sm text-zinc-400 dark:text-zinc-500">
          Os artigos aparecerão aqui assim que novas proposições forem
          processadas.
        </p>
      </div>
    );
  }

  const [primeiro, ...restante] = lista;
  const isFeatured = page === 1;

  return (
    <div className="space-y-5">
      {/* Section title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Últimas publicações
        </h2>
        <span className="text-xs text-zinc-300 dark:text-zinc-700">
          {total} artigo{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-3">
        <ArtigoCard artigo={primeiro} featured={isFeatured} />
        {restante.map((artigo) => (
          <ArtigoCard key={artigo.id} artigo={artigo} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4">
          {page > 1 ? (
            <Link
              href={`/?pagina=${page - 1}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Anterior
            </Link>
          ) : (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-100 px-3.5 text-sm font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Anterior
            </span>
          )}

          <span className="px-3 text-sm text-zinc-400 dark:text-zinc-500">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/?pagina=${page + 1}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Próxima
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-100 px-3.5 text-sm font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-700">
              Próxima
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
