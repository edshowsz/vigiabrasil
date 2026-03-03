import Link from "next/link";
import type { Artigo } from "@/db/schema";

function tempoAtras(data: Date): string {
  const agora = new Date();
  const diff = agora.getTime() - data.getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `${minutos}min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `${dias}d`;
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

export default function ArtigoCard({
  artigo,
  featured = false,
}: {
  artigo: Artigo;
  featured?: boolean;
}) {
  return (
    <Link href={`/artigos/${artigo.id}`} className="block">
      <article
        className={`card-hover group rounded-xl border border-zinc-100 bg-white px-5 py-5 dark:border-zinc-800 dark:bg-zinc-900 ${
          featured ? "sm:px-6 sm:py-6" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="font-medium text-accent dark:text-accent-dark">Câmara</span>
          <span>·</span>
          <time>{tempoAtras(artigo.createdAt)}</time>
        </div>

        <h2
          className={`mt-2 font-[family-name:var(--font-newsreader)] font-semibold leading-snug text-zinc-900 group-hover:text-accent dark:text-zinc-200 dark:group-hover:text-accent-dark ${
            featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
          }`}
        >
          {artigo.titulo}
        </h2>

        <p
          className={`mt-1.5 leading-relaxed text-zinc-500 dark:text-zinc-400 ${
            featured ? "text-[15px] line-clamp-3" : "text-sm line-clamp-2"
          }`}
        >
          {artigo.subtitulo}
        </p>

        {featured && artigo.lide && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-400 line-clamp-2 dark:text-zinc-500">
            {artigo.lide}
          </p>
        )}
      </article>
    </Link>
  );
}
