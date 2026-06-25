# DECISIONS.md — Registro de Decisões

> Cresce devagar. Guarda o PORQUÊ — o que o código sozinho não conta.
> **DEC** = decisão de arquitetura/design · **FIX** = bug grave resolvido.
> Não reescreva entradas antigas; se superada, marque «SUPERADA por DEC-X» e adicione a nova.

---

## DEC-001 — React + Vite sem Next.js nem TypeScript
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
Precisava de setup rápido para SPA 100% client-side, sem servidor, sem rotas de página. Avaliados: Next.js, CRA (deprecated), Vite puro, Vite+React.

### Decisão
React 18 + Vite 5, sem SSR, sem roteador de páginas, sem TypeScript inicial.

### Alternativas consideradas
- **Next.js** — overkill; SSR não faz sentido para tool local; roteamento desnecessário
- **CRA** — deprecated, lento, sem suporte ativo
- **TypeScript** — adicionaria segurança mas aumentaria fricção de iteração no estágio atual

### Consequências
Bundle simples, dev server instantâneo, lazy loading via `React.lazy` funciona out-of-box. Sem rotas, sem SEO (irrelevantes para tool local). TypeScript a reconsiderar na F3.

---

## DEC-002 — Tiptap v2 como engine do editor Markdown WYSIWYG
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
Precisava de editor WYSIWYG que serializa para Markdown, suporta tabelas, code blocks com highlight, listas de tarefas, e é extensível. Avaliados: Tiptap, Quill, Slate, ProseMirror puro.

### Decisão
Tiptap v2 + extensão community `tiptap-markdown` para serialização MD↔Tiptap.

### Alternativas consideradas
- **Quill** — não serializa MD nativamente; pouco extensível
- **Slate** — API de baixo nível; muito código para paridade de features
- **ProseMirror puro** — verboso; Tiptap é wrapper ProseMirror com DX superior
- **@tiptap-pro/extension-markdown** — pago; `tiptap-markdown` (community) cobre o caso

### Consequências
Toolbar completa via extensões prontas (mesmo stack do Notion e Linear). **Constraint crítico:** `StarterKit` deve ser `StarterKit.configure({ codeBlock: false })` — conflita silenciosamente com `CodeBlockLowlight`. Ver armadilha #3 em CONTEXT.md.

---

## DEC-003 — JSON viewer customizado (sem react-json-view)
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
Precisava de visualizador JSON interativo. Avaliadas bibliotecas prontas vs componente customizado.

### Decisão
Componente `JsonNode` recursivo customizado em `JsonViewer.jsx`.

### Alternativas consideradas
- **react-json-view** — sem manutenção desde 2021, problemas com React 18
- **jsoneditor-react** — wrapper do jsoneditor.js (era jQuery), bundle pesado, difícil de estilizar

### Consequências
Controle total sobre design e comportamento; integrado ao design system. O componente atual cobre árvore colapsável, cores por tipo, edição inline de folhas — sem Table View para arrays (ver backlog/IDEAS).

---

## DEC-004 — PDF somente leitura
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
PDF não tem estrutura de texto editável — é layout fixo com vetores e texto posicionado absolutamente. Editar conteúdo existente exige engine proprietária (Adobe, Nutrient SDK — todos pagos).

### Decisão
PdfViewer é read-only. Sem modo "Editar" na UI para arquivos PDF.

### Alternativas consideradas
- **pdf-lib + overlay de texto** — permite adicionar texto novo em posição livre, não edita o existente
- **Nutrient SDK (PSPDFKit)** — edição real, mas pago e pesado demais para este projeto

### Consequências
Expectativa correta desde o início. Funcionalidades futuras possíveis sem quebrar esta decisão: anotações overlay, merge/split, preencher formulários.

---

## DEC-005 — Lazy loading dos viewers via React.lazy
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
`pdfjs-dist` (~2MB) e Tiptap + extensões (~500KB) são pesados. Carregar tudo na inicialização tornaria o primeiro load lento mesmo sem abrir esses formatos.

### Decisão
`ViewerRouter` usa `React.lazy + Suspense` para cada viewer/editor — cada um é um chunk separado.

### Consequências
PDF.js só é baixado ao abrir o primeiro PDF. Trade-off: primeira abertura de cada formato tem ~200ms de delay de parse do chunk (aceitável).

---

## DEC-006 — Modos de visualização independentes por arquivo
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
MD tem 3 modos distintos (preview, WYSIWYG, raw). JSON/YAML/XML têm 2 (árvore, texto). CSV tem 2 (tabela, texto). PDF tem só 1.

### Decisão
`AppContext` guarda `modes: Record<id, string>` independente por arquivo. `App.jsx` exibe os botões relevantes para o arquivo ativo. `ViewerRouter` decide o componente a partir de `ext + mode`.

### Consequências
Trocar de arquivo preserva o modo de cada um. Sem estado de modo global que vaze entre arquivos.

---

## FIX-001 — PDF: ArrayBuffer detachado pelo worker do PDF.js
**Data:** 2026-06-05

- **Sintoma:** `⚠ Erro ao abrir PDF: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.`
- **Causa raiz:** PDF.js v4 usa `postMessage` com `transfer` para enviar o ArrayBuffer ao worker thread. Isso **detacha** o buffer do main thread permanentemente. Na remontagem do componente (ou ao trocar de arquivo e voltar), `activeFile.content` é um ArrayBuffer morto — qualquer acesso lança o erro.
- **Solução:** Em `AppContext.openFile`, para PDFs: criar `Blob` com os bytes e armazenar `URL.createObjectURL(blob)` (string) como `content`. Em `PdfViewer`, passar a URL string diretamente para `lib.getDocument(url)` — PDF.js faz o fetch internamente, sem precisar do ArrayBuffer no main thread. Em `AppContext.closeFile`, revogar com `URL.revokeObjectURL(content)` para evitar memory leak.
- **Lição:** Nunca armazenar em estado React um `ArrayBuffer` que será transferido para um Worker. Blob URLs são imunes a `transfer`/`detachment`. Virou armadilha #1 no CONTEXT.md.
- **Arquivos alterados:** `src/context/AppContext.jsx`, `src/viewers/PdfViewer.jsx`

---

## FIX-002 — CSV: edição-enquanto-filtrado descartava linhas fora do filtro
**Data:** 2026-06-05

- **Sintoma:** Ao filtrar por texto e editar uma célula, salvar o CSV descartava as linhas que não apareciam no filtro.
- **Causa raiz:** `commitEdit` fazia `filtered.map(...)` e reconstruía o CSV — `newData` continha só as linhas visíveis.
- **Solução:** Injetar `__dataIdx` (índice no `data` original) em cada linha ao montar o `filtered`. `editCell` passa a guardar `{ dataIdx, col }`. `commitEdit` opera sobre `data.map((r, i) => i === dataIdx ? ... : r)`.
- **Bônus corrigido junto:** adicionado botão visual ✕ para cancelar edição. Usa `onMouseDown + preventDefault` no botão para disparar antes do `onBlur` do input (que commitaria a edição).
- **Lição:** Quando há filter/sort, sempre manter referência ao índice original. Nunca reconstruir dados persistentes a partir de um array derivado. `onMouseDown + preventDefault` é o padrão para cancelar antes do `onBlur`. Armadilhas #2 e #5 em CONTEXT.md.
- **Arquivo alterado:** `src/viewers/CsvViewer.jsx`
