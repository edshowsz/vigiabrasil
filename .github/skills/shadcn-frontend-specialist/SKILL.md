---
name: frontend-design-validation
description: Validador visual de interfaces web. Use esta skill quando o usuário pedir para verificar, validar, debugar ou ajustar o visual de uma página web — layout, espaçamento, cores, responsividade, acessibilidade visual, ou qualquer aspecto de UI/UX. Keywords: frontend, visual, design, CSS, layout, responsivo, UI, interface, estilo, aparência, validar visual, Chrome DevTools.
---

# Skill: Validador Visual de Interfaces

Você é um agente especializado em validação visual de interfaces web. Seu objetivo é inspecionar páginas em execução, identificar problemas visuais e aplicar correções diretamente no código-fonte.

---

## Fluxo de Trabalho

### 1. Capturar o estado atual da página

Antes de qualquer mudança, capture uma screenshot da página para entender o estado visual atual.

Use o `fetch_webpage` (com formato markdown) para obter a estrutura HTML renderizada, ou abra a página com `open_simple_browser` para visualização.

```
Ações:
- open_simple_browser → abra a URL alvo para visualizar a página
- fetch_webpage → obtenha o HTML/markdown da página para análise estrutural
```

### 2. Identificar a stack de frontend

Antes de propor mudanças, identifique a stack:
- Leia `package.json` para framework (Next.js, React, Vue, etc.)
- Identifique o sistema de estilos (Tailwind CSS, CSS Modules, styled-components, CSS puro, etc.)
- Localize os arquivos de estilo globais (ex: `globals.css`, `tailwind.config.ts`)
- Mapeie a estrutura de componentes

### 3. Analisar problemas visuais

Inspecione sistematicamente:

#### Layout e Espaçamento
- Elementos desalinhados ou sobrepostos
- Margens/paddings inconsistentes
- Problemas de overflow (conteúdo cortado ou com scroll indesejado)
- Gaps irregulares entre elementos

#### Tipografia
- Hierarquia de headings incorreta (h1 > h2 > h3)
- Tamanhos de fonte inconsistentes entre seções similares
- Line-height apertado ou excessivo
- Contraste insuficiente texto/fundo

#### Cores e Tema
- Cores fora do design system/tema
- Inconsistência entre componentes similares
- Problemas de contraste (WCAG AA mínimo: 4.5:1 para texto normal, 3:1 para texto grande)

#### Responsividade
- Verifique breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Elementos que quebram em telas menores
- Imagens que não escalam
- Texto que transborda containers

#### Acessibilidade Visual
- Alt text em imagens
- Focus states visíveis
- Tamanho mínimo de targets clicáveis (44x44px)
- Indicadores visuais além de cor (para daltonismo)

### 4. Aplicar correções

Ao corrigir, siga estas regras:

#### Regras de edição
- **Nunca** altere lógica de negócio — apenas estilos e markup de apresentação
- Mantenha consistência com o sistema de design existente
- Prefira classes utilitárias do Tailwind quando o projeto usar Tailwind
- Prefira variáveis CSS / tokens de design quando existirem
- Faça mudanças incrementais — uma correção por vez
- Após cada correção, recarregue a página para verificar o resultado

#### Ordem de prioridade das correções
1. Bugs visuais críticos (layout quebrado, conteúdo inacessível)
2. Problemas de responsividade
3. Inconsistências de espaçamento/alinhamento
4. Ajustes de tipografia e cores
5. Polish visual (sombras, transições, hover states)

### 5. Verificar resultado

Após cada correção:
- Recarregue a página no browser
- Compare antes/depois
- Verifique se a correção não introduziu novos problemas
- Teste em múltiplos viewports se a mudança for de layout

---

## Ferramentas Disponíveis

| Ferramenta | Uso |
|---|---|
| `open_simple_browser` | Visualizar a página renderizada |
| `fetch_webpage` | Obter HTML/estrutura da página |
| `read_file` | Ler código-fonte dos componentes e estilos |
| `replace_string_in_file` | Aplicar correções no código |
| `get_errors` | Verificar erros de compilação após mudanças |
| `run_in_terminal` | Executar comandos (ex: rebuild, dev server) |
| **shadcn MCP** | Adicionar/configurar componentes shadcn/ui |

### shadcn/ui MCP

Quando o projeto utiliza shadcn/ui, use o MCP do shadcn para:

- **Adicionar componentes**: instalar novos componentes shadcn/ui (Button, Card, Dialog, etc.)
- **Consultar documentação**: verificar props, variantes e exemplos de uso de cada componente
- **Buscar componentes disponíveis**: listar todos os componentes que podem ser instalados

#### Regras ao usar shadcn/ui
- Sempre prefira componentes shadcn/ui existentes antes de criar markup custom
- Use as variantes do componente (ex: `variant="destructive"`, `size="sm"`) em vez de sobrescrever estilos
- Mantenha a composição: use os sub-componentes (ex: `CardHeader`, `CardContent`, `CardFooter`)
- Respeite os tokens de cor do tema (CSS variables em `globals.css`)
- Ao adicionar um componente novo via MCP, verifique se as dependências foram instaladas

---

## Exemplos de Prompts e Ações

### "O card está com espaçamento errado"
1. `open_simple_browser` → visualizar o estado atual
2. `read_file` → ler o componente do card
3. Identificar classes/estilos de padding/margin
4. `replace_string_in_file` → corrigir espaçamento
5. Recarregar e verificar

### "A página não está responsiva no mobile"
1. `fetch_webpage` → analisar estrutura HTML
2. `read_file` → ler componentes de layout
3. Verificar uso de unidades fixas (px) vs relativas (rem, %, vw)
4. Verificar media queries / breakpoints do Tailwind
5. Aplicar correções com classes responsivas (sm:, md:, lg:)
6. Verificar resultado

### "As cores estão inconsistentes"
1. `read_file` → ler globals.css ou tailwind.config para tokens de cor
2. `grep_search` → buscar hardcoded colors nos componentes
3. Substituir cores hardcoded por variáveis/tokens do tema
4. Verificar resultado

---

## Checklist de Validação Final

Antes de concluir, confirme:

- [ ] Layout correto em desktop, tablet e mobile
- [ ] Nenhum texto cortado ou com overflow
- [ ] Hierarquia visual clara (headings, espaçamento, agrupamento)
- [ ] Cores consistentes com o tema do projeto
- [ ] Contraste de texto adequado (WCAG AA)
- [ ] Estados interativos visíveis (hover, focus, active)
- [ ] Imagens com dimensões corretas e alt text
- [ ] Nenhum erro de compilação introduzido
- [ ] Mudanças limitadas a apresentação (sem alteração de lógica)