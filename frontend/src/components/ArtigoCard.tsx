import Link from "next/link";
import type { Artigo } from "@/db/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Link href={`/artigos/${artigo.id}`} className="block group">
      <Card
        className={`transition-all duration-150 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/30 ${
          featured ? "py-5 sm:py-6" : "py-4"
        }`}
      >
        <CardHeader className="gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-brand-light text-brand dark:bg-brand/10 dark:text-brand">
              Câmara
            </Badge>
            <span className="text-xs text-muted-foreground">
              <time>{tempoAtras(artigo.createdAt)}</time>
            </span>
          </div>

          <h2
            className={`font-serif font-semibold leading-snug text-card-foreground group-hover:text-brand transition-colors ${
              featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            }`}
          >
            {artigo.titulo}
          </h2>
        </CardHeader>

        <CardContent className="-mt-2">
          <p
            className={`leading-relaxed text-muted-foreground ${
              featured ? "text-[15px] line-clamp-3" : "text-sm line-clamp-2"
            }`}
          >
            {artigo.subtitulo}
          </p>

          {featured && artigo.lide && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70 line-clamp-2">
              {artigo.lide}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
