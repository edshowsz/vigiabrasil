import { db } from "@/db";
import { artigos } from "@/db/schema";
import { desc } from "drizzle-orm";
import ArtigoCard from "@/components/ArtigoCard";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const lista = await db
    .select()
    .from(artigos)
    .orderBy(desc(artigos.createdAt))
    .limit(50);

  if (lista.length === 0) {
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

  const [destaque, ...restante] = lista;

  return (
    <div className="space-y-5">
      {/* Section title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Últimas publicações
        </h2>
        <span className="text-xs text-zinc-300 dark:text-zinc-700">
          {lista.length} artigo{lista.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-3">
        <ArtigoCard artigo={destaque} featured />
        {restante.map((artigo) => (
          <ArtigoCard key={artigo.id} artigo={artigo} />
        ))}
      </div>
    </div>
  );
}
