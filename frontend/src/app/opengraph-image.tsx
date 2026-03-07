import { ImageResponse } from "next/og";

export const alt = "Vigia Brasil — Legislação Acessível";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              backgroundColor: "#ea580c",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 32,
              fontWeight: 800,
              marginRight: 20,
            }}
          >
            VB
          </div>
          <span style={{ color: "#ea580c", fontSize: 48, fontWeight: 700 }}>
            VIGIA BRASIL
          </span>
        </div>
        <div
          style={{
            color: "#e2e8f0",
            fontSize: 32,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Portal de noticias automatizado, trazendo os últimos acontecimentos na política do Brasil.
        </div>
      </div>
    ),
    { ...size },
  );
}
