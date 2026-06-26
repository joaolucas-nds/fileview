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
- **TypeScript** — adicionaria segurança mas aumentaria fricção no estágio atual

### Consequências
Bundle simples, dev server instantâneo, lazy loading via `React.lazy` funciona out-of-box. TypeScript a reconsiderar na F3.

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
Toolbar completa via extensões prontas. **Constraint crítico:** `StarterKit.configure({ codeBlock: false })` é obrigatório — conflita silenciosamente com `CodeBlockLowlight`. Ver armadilha #3 em CONTEXT.md.

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
Controle total sobre design e comportamento. O componente atual cobre árvore colapsável, cores por tipo, edição inline de folhas — sem Table View para arrays (ver backlog).

---

## DEC-004 — PDF somente leitura
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
PDF não tem estrutura de texto editável — é layout fixo. Editar conteúdo existente exige engine proprietária paga.

### Decisão
PdfViewer é read-only. Sem aba "Editar" na UI para PDF.

### Alternativas consideradas
- **pdf-lib + overlay de texto** — permite adicionar texto novo, não edita o existente
- **Nutrient SDK (PSPDFKit)** — edição real, mas pago e pesado demais

### Consequências
Expectativa correta desde o início. Funcionalidades futuras sem quebrar esta decisão: anotações overlay, merge/split, formulários.

---

## DEC-005 — Lazy loading dos viewers via React.lazy
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
`pdfjs-dist` (~2MB) e Tiptap + extensões (~500KB) são pesados. Carregar tudo na inicialização tornaria o primeiro load lento.

### Decisão
`ViewerRouter` usa `React.lazy + Suspense` para cada viewer/editor — chunk separado por formato.

### Consequências
PDF.js só é baixado ao abrir o primeiro PDF. Trade-off: ~200ms de delay na primeira abertura de cada formato.

---

## DEC-006 — Modos de visualização independentes por arquivo
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
MD tem 3 modos (preview, WYSIWYG, raw). JSON/YAML/XML têm 2 (árvore, texto). CSV tem 2 (tabela, texto). PDF tem só 1.

### Decisão
`AppContext` guarda `modes: Record<id, string>` independente por arquivo.

### Consequências
Trocar de arquivo preserva o modo de cada um. Sem estado de modo global que vaze entre arquivos.

---

## DEC-007 — vite.config.js: base './' para deploy no GitHub Pages
**Data:** 2026-06-25 · **Status:** aceita

### Contexto
Ao fazer deploy no GitHub Pages (ex: `username.github.io/fileview/`), a página ficava completamente em branco sem nenhum erro visível. O Vite sem configuração de `base` gera URLs absolutas para os assets (ex: `/assets/index-abc.js`). O GitHub Pages serve o app em `/fileview/`, então o browser tentava carregar `username.github.io/assets/index-abc.js` — que não existe — e o JS nunca carregava.

### Decisão
Adicionar `base: './'` em `vite.config.js`. Isso faz o Vite gerar URLs relativas para todos os assets, que funcionam independente do caminho de deploy.

### Alternativas consideradas
- **`base: '/fileview/'`** — mais explícito e estável, mas acopla o config ao nome do repositório; `./'` é mais portátil
- **GitHub Actions com configuração de base dinâmica** — mais correto para projetos maiores, overkill aqui
- **Não usar GitHub Pages** — descartado; o usuário quer hospedar lá

### Consequências
O app passa a funcionar corretamente no GitHub Pages com `npm run build` → publicar `dist/`. Se por algum motivo `./'` causar problemas (raro), substituir por `'/nome-do-repo/'` explicitamente.

---

## FIX-001 — PDF: ArrayBuffer detachado pelo worker do PDF.js
**Data:** 2026-06-05

- **Sintoma:** `⚠ Erro ao abrir PDF: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.`
- **Causa raiz:** PDF.js v4 usa `postMessage` com `transfer` do ArrayBuffer para o worker thread — isso **detacha** o buffer do main thread permanentemente. Na remontagem do componente, o buffer está morto.
- **Solução:** Em `AppContext.openFile`, para PDFs: criar `Blob` e armazenar `URL.createObjectURL(blob)` (string). Em `PdfViewer`, passar a URL string para `lib.getDocument(url)`. Em `closeFile`, revogar com `URL.revokeObjectURL`.
- **Lição:** Nunca armazenar `ArrayBuffer` em estado React quando ele será transferido para Worker. Blob URLs são imunes. Ver armadilha #1 em CONTEXT.md.
- **Arquivos:** `src/context/AppContext.jsx`, `src/viewers/PdfViewer.jsx`

---

## FIX-002 — CSV: edição-enquanto-filtrado descartava linhas fora do filtro
**Data:** 2026-06-05

- **Sintoma:** Ao filtrar e editar uma célula, salvar o CSV descartava as linhas fora do filtro.
- **Causa raiz:** `commitEdit` fazia `filtered.map(...)` e reconstruía o CSV — `newData` continha só as linhas visíveis.
- **Solução:** Injetar `__dataIdx` (índice no `data` original) em cada linha do `filtered`. `editCell` passa a guardar `{ dataIdx, col }`. `commitEdit` opera sobre `data.map((r, i) => i === dataIdx ? ... : r)`.
- **Bônus:** adicionado botão ✕ cancelar edição com `onMouseDown + preventDefault`. Ver armadilha #5 em CONTEXT.md.
- **Lição:** Quando há filter/sort, sempre manter referência ao índice original. Nunca reconstruir dados persistentes a partir de array derivado.
- **Arquivo:** `src/viewers/CsvViewer.jsx`
