import { ImageResponse } from "next/og";
import { db } from "@/db";
import { artigos } from "@/db/schema";
import { eq } from "drizzle-orm";

export const alt = "Vigia Brasil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artigoId = parseInt(id, 10);

  const [artigo] = await db
    .select()
    .from(artigos)
    .where(eq(artigos.id, artigoId))
    .limit(1);

  const titulo = artigo?.titulo ?? "Artigo não encontrado";
  const subtitulo = artigo?.subtitulo ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          padding: 60,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#f8fafc",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: 1000,
              marginBottom: 24,
            }}
          >
            {titulo.length > 90 ? titulo.slice(0, 90) + "…" : titulo}
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 28,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {subtitulo.length > 140
              ? subtitulo.slice(0, 140) + "…"
              : subtitulo}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                backgroundColor: "#ea580c",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 24,
                fontWeight: 800,
                marginRight: 16,
              }}
            >
              VB
            </div>
            <span style={{ color: "#ea580c", fontSize: 28, fontWeight: 600 }}>
              vigiabrasil.org
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
