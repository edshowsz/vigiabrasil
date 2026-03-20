import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.org";

export const metadata: Metadata = {
  title: "Política de Privacidade — Vigia Brasil",
  description: "Política de privacidade do portal Vigia Brasil.",
  alternates: { canonical: `${BASE_URL}/privacidade` },
};

export default function PrivacidadePage() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground space-y-2">{children}</div>
    </section>
  );

  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Política de Privacidade</h1>
      <p className="text-sm text-muted-foreground mt-1">Última atualização: março de 2026</p>

      <Section title="1. Informações que coletamos">
        <p>O Vigia Brasil não exige cadastro ou login. Coletamos apenas dados anônimos de navegação por meio do <strong className="text-foreground">Google Analytics</strong> (GA4), incluindo: páginas visitadas, tempo de sessão, localização geográfica aproximada (país/estado), tipo de dispositivo e navegador. Nenhum dado pessoal identificável é coletado diretamente por nós.</p>
      </Section>

      <Section title="2. Como usamos os dados">
        <p>Os dados de analytics são utilizados exclusivamente para entender o uso do portal, melhorar a experiência e avaliar o desempenho do conteúdo. Não vendemos nem compartilhamos dados com terceiros para fins comerciais.</p>
      </Section>

      <Section title="3. Cookies">
        <p>Utilizamos cookies do Google Analytics para análise de uso. Você pode desativar cookies nas configurações do seu navegador ou usar a extensão <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Google Analytics Opt-out</a>.</p>
      </Section>

      <Section title="4. Google Publisher Center e Google News">
        <p>Este portal está integrado ao Google Publisher Center e ao Google News para distribuição de conteúdo. O Google pode coletar dados sobre a leitura de artigos conforme sua própria <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Política de Privacidade</a>.</p>
      </Section>

      <Section title="5. Retenção de dados">
        <p>Os dados coletados pelo Google Analytics são retidos por 14 meses, conforme configuração padrão do serviço.</p>
      </Section>

      <Section title="6. Seus direitos (LGPD)">
        <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a solicitar informações sobre os dados coletados, bem como sua exclusão. Para exercer esses direitos, entre em contato pelo e-mail abaixo.</p>
      </Section>

      <Section title="7. Segurança">
        <p>O portal utiliza HTTPS em todas as conexões. Não armazenamos dados sensíveis de usuários em nossos servidores.</p>
      </Section>

      <Section title="8. Alterações">
        <p>Esta política pode ser atualizada periodicamente. A data de última atualização será sempre indicada no topo desta página.</p>
      </Section>

      <Section title="9. Contato">
        <p>Dúvidas sobre privacidade podem ser enviadas para <a href="mailto:contato@vigiabrasil.org" className="text-brand hover:underline">contato@vigiabrasil.org</a>.</p>
      </Section>
    </article>
  );
}
