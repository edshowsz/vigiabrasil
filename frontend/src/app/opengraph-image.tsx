import { ImageResponse } from "next/og";

export const alt = "Vigia Brasil — Portal de notícias automatizado";
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
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 40,
              fontWeight: 800,
              marginRight: 24,
              border: "3px solid rgba(255,255,255,0.4)",
            }}
          >
            VB
          </div>
          <span
            style={{
              color: "white",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            VIGIA BRASIL
          </span>
        </div>
        <div
          style={{
            width: 160,
            height: 3,
            backgroundColor: "rgba(255,255,255,0.4)",
            borderRadius: 2,
            marginBottom: 32,
          }}
        />
        <div
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: 30,
            textAlign: "center",
            maxWidth: 850,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          Portal de notícias automatizado, trazendo os últimos acontecimentos na
          política do Brasil.
        </div>
      </div>
    ),
    { ...size },
  );
}
