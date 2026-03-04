import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.com.br";

export const metadata: Metadata = {
  title: {
    default: "Vigia Brasil — Legislação Acessível",
    template: "%s",
  },
  description:
    "Acompanhe proposições legislativas da Câmara dos Deputados de forma acessível, com resumos gerados por inteligência artificial.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Vigia Brasil",
    title: "Vigia Brasil — Legislação Acessível",
    description:
      "Acompanhe proposições legislativas da Câmara dos Deputados de forma acessível, com resumos gerados por IA.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary",
    title: "Vigia Brasil",
    description:
      "Proposições legislativas da Câmara dos Deputados explicadas por IA.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H22WMQHZPM"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H22WMQHZPM');
          `}
        </Script>
      </head>
      <body className="font-[family-name:var(--font-inter)] bg-white text-zinc-900 antialiased dark:bg-[#09090b] dark:text-zinc-100">
        <Header />
        <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          {children}
        </main>
        <footer className="border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
              Vigia Brasil &middot; Conteúdo gerado por IA a partir de dados
              públicos da Câmara dos Deputados
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
