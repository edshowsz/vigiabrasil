import { db } from "@/db";
import { artigos } from "@/db/schema";
import { desc, count, eq } from "drizzle-orm";
import ArtigoCard from "@/components/ArtigoCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-2xl">
          📰
        </div>
        <h2 className="mt-5 text-lg font-semibold text-foreground">
          Nenhum artigo ainda
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Os artigos aparecerão aqui assim que novas proposições forem
          processadas.
        </p>
      </div>
    );
  }

  const [primeiro, ...restante] = lista;
  const isFeatured = page === 1;

  return (
    <div className="space-y-6">
      {/* Section title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Últimas publicações
        </h2>
        <span className="text-xs text-muted-foreground/60">
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
            <Button variant="outline" size="sm" render={<Link href={`/?pagina=${page - 1}`} />}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Anterior
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Anterior
            </Button>
          )}

          <span className="px-3 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Button variant="outline" size="sm" render={<Link href={`/?pagina=${page + 1}`} />}>
              Próxima
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Próxima
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
