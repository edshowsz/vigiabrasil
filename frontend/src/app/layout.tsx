import type { Metadata } from "next";
import { Inter, Newsreader, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.org";

export const metadata: Metadata = {
  title: {
    default: "Vigia Brasil — Notícias",
    template: "%s",
  },
  description:
    "Portal de noticias automatizado e open source, trazendo os últimos acontecimentos na política do Brasil.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Vigia Brasil",
    title: "Vigia Brasil — Notícias",
    description:
      "Portal de noticias automatizado e open source, trazendo os últimos acontecimentos na política do Brasil.",
    url: BASE_URL,
    images: [`${BASE_URL}/opengraph-image`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vigia Brasil",
    description:
      "Portal de noticias automatizado e open source, trazendo os últimos acontecimentos na política do Brasil.",
    images: [`${BASE_URL}/opengraph-image`],
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
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn(inter.variable, newsreader.variable, "font-sans", geist.variable)}>
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
        <Script
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
        />
        <Script id="swg-basic-init" strategy="afterInteractive">
          {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAowrc7fCw:openaccess",
                clientOptions: { theme: "light", lang: "pt-BR" },
              });
            });
          `}
        </Script>
      </head>
      <body className="font-sans bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${BASE_URL}/#website`,
                  name: "Vigia Brasil",
                  url: BASE_URL,
                  description:
                    "Portal de notícias automatizado e open source sobre proposições legislativas da Câmara dos Deputados.",
                  inLanguage: "pt-BR",
                  publisher: { "@id": `${BASE_URL}/#organization` },
                },
                {
                  "@type": "NewsMediaOrganization",
                  "@id": `${BASE_URL}/#organization`,
                  name: "Vigia Brasil",
                  url: BASE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${BASE_URL}/opengraph-image`,
                    width: 1200,
                    height: 630,
                  },
                  sameAs: [
                    "https://x.com/viabordo",
                    "https://github.com/edshowsz/vigiabrasil",
                  ],
                },
              ],
            }),
          }}
        />
        <Header />
        <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Vigia Brasil</span>
            <div className="flex gap-4">
              <a href="/termos" className="text-xs text-muted-foreground hover:text-brand transition-colors">Termos de Serviço</a>
              <a href="/privacidade" className="text-xs text-muted-foreground hover:text-brand transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
