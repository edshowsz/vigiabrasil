import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vigiabrasil.org";

export const metadata: Metadata = {
  title: "Termos de Serviço — Vigia Brasil",
  description: "Termos de serviço do portal Vigia Brasil.",
  alternates: { canonical: `${BASE_URL}/termos` },
};

export default function TermosPage() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground space-y-2">{children}</div>
    </section>
  );

  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Termos de Serviço</h1>
      <p className="text-sm text-muted-foreground mt-1">Última atualização: março de 2026</p>

      <Section title="1. Aceitação dos termos">
        <p>Ao acessar e utilizar o Vigia Brasil (<strong className="text-foreground">vigiabrasil.org</strong>), você concorda com estes Termos de Serviço. Caso não concorde, por favor não utilize o serviço.</p>
      </Section>

      <Section title="2. Descrição do serviço">
        <p>O Vigia Brasil é um portal de notícias de acesso gratuito que utiliza inteligência artificial para transformar proposições legislativas e dados de fontes públicas oficiais em artigos jornalísticos acessíveis. O conteúdo tem caráter exclusivamente informativo.</p>
      </Section>

      <Section title="3. Conteúdo gerado por IA">
        <p>Os artigos publicados neste portal são gerados automaticamente por sistemas de inteligência artificial com base em fontes públicas oficiais. Embora nos esforcemos para garantir a precisão das informações, o Vigia Brasil não se responsabiliza por eventuais erros, omissões ou desatualizações no conteúdo. Recomendamos sempre consultar as fontes primárias para decisões importantes.</p>
      </Section>

      <Section title="4. Propriedade intelectual">
        <p>O código-fonte do Vigia Brasil é licenciado sob a licença MIT e está disponível publicamente. As fontes primárias utilizadas para geração de conteúdo são de domínio público ou de acesso aberto.</p>
      </Section>

      <Section title="5. Uso permitido">
        <p>Você pode acessar, ler e compartilhar o conteúdo do portal para fins pessoais, educacionais e não comerciais, desde que cite a fonte. É proibido usar o serviço para fins ilegais ou que violem direitos de terceiros.</p>
      </Section>

      <Section title="6. Disponibilidade">
        <p>O Vigia Brasil é fornecido &quot;como está&quot;, sem garantias de disponibilidade ininterrupta. Podemos interromper, modificar ou encerrar o serviço a qualquer momento sem aviso prévio.</p>
      </Section>

      <Section title="7. Links externos">
        <p>Este portal pode conter links para sites externos, como a Câmara dos Deputados. Não nos responsabilizamos pelo conteúdo ou práticas de privacidade desses sites.</p>
      </Section>

      <Section title="8. Alterações">
        <p>Estes termos podem ser atualizados a qualquer momento. O uso continuado do serviço após alterações constitui aceitação dos novos termos.</p>
      </Section>

      <Section title="9. Contato">
        <p>Dúvidas sobre estes termos podem ser enviadas para <a href="mailto:contato@vigiabrasil.org" className="text-brand hover:underline">contato@vigiabrasil.org</a>.</p>
      </Section>
    </article>
  );
}
