import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Vigia Brasil — Legislação Acessível",
  description:
    "Acompanhe a legislação brasileira de forma acessível e transparente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${newsreader.variable}`}>
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
