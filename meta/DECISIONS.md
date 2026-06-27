# DECISIONS.md — Registro de Decisões

> Cresce devagar. Guarda o PORQUÊ — o que o código sozinho não conta.
> **DEC** = decisão de arquitetura/design · **FIX** = bug grave resolvido.
> Não reescreva entradas antigas; se superada, marque «SUPERADA por DEC-X» e adicione a nova.

---

## DEC-001 — React + Vite sem Next.js nem TypeScript
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
Precisava de setup rápido para SPA 100% client-side, sem servidor, sem rotas de página.

### Decisão
React 18 + Vite 5, sem SSR, sem roteador de páginas, sem TypeScript inicial.

### Alternativas consideradas
- **Next.js** — overkill; SSR não faz sentido para tool local
- **CRA** — deprecated, lento, sem suporte ativo
- **TypeScript** — aumentaria fricção no estágio atual; revisitar na F3

### Consequências
Bundle simples, dev server instantâneo, lazy loading via `React.lazy` out-of-box.

---

## DEC-002 — Tiptap v2 como engine do editor Markdown WYSIWYG
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
Tiptap v2 + extensão community `tiptap-markdown` para serialização MD↔Tiptap.

### Alternativas consideradas
- **Quill** — não serializa MD nativamente
- **Slate** — API de baixo nível; muito código para paridade de features
- **ProseMirror puro** — verboso; Tiptap é wrapper com DX superior
- **@tiptap-pro/extension-markdown** — pago; `tiptap-markdown` (community) cobre o caso

### Consequências
Toolbar completa via extensões prontas. **Constraint crítico:** `StarterKit.configure({ codeBlock: false })` obrigatório — omitir conflita silenciosamente com `CodeBlockLowlight`.

---

## DEC-003 — JSON viewer customizado (sem react-json-view)
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
Componente `JsonNode` recursivo customizado em `JsonViewer.jsx`.

### Alternativas consideradas
- **react-json-view** — sem manutenção desde 2021, incompatível com React 18
- **jsoneditor-react** — wrapper jQuery-era, bundle pesado, difícil de estilizar

### Consequências
Controle total sobre design e comportamento; integrado ao design system.

---

## DEC-004 — PDF somente leitura
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
PDF não tem estrutura de texto editável. Editar conteúdo existente exige engine proprietária paga.

### Decisão
PdfViewer é read-only. Sem aba "Editar" na UI para PDF. Funcionalidades futuras possíveis sem quebrar esta decisão: anotações overlay, merge/split, preencher formulários.

---

## DEC-005 — Lazy loading dos viewers via React.lazy
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
`ViewerRouter` usa `React.lazy + Suspense` para cada viewer/editor — chunk separado por formato.

### Consequências
PDF.js (~2MB) só é baixado ao abrir o primeiro PDF. Trade-off: ~200ms de delay na primeira abertura de cada formato.

---

## DEC-006 — Modos de visualização independentes por arquivo
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
`AppContext` guarda `modes: Record<id, string>` independente por arquivo. Trocar de arquivo preserva o modo de cada um.

---

## DEC-007 — Deploy no GitHub Pages via GitHub Actions
**Data:** 2026-06-25 · **Status:** aceita

### Contexto
O app ficava em branco no GitHub Pages por dois motivos sobrepostos: (1) sem `base: './'` no Vite, os assets têm URLs absolutas (`/assets/index.js`) que não funcionam quando o app é servido em subpasta (`/nome-do-repo/`); (2) servir o código-fonte diretamente sem build — o Pages tenta renderizar `.jsx` como HTML e falha silenciosamente.

### Decisão
Duas correções combinadas:
1. `base: './'` em `vite.config.js` — URLs relativas funcionam em qualquer caminho de deploy.
2. `.github/workflows/deploy.yml` — GitHub Actions faz `npm ci && npm run build` e publica apenas o `dist/` no Pages, nunca o código-fonte.

### Como configurar (uma vez por repositório)
1. Criar o arquivo `.github/workflows/deploy.yml` no projeto.
2. No GitHub: **Settings → Pages → Source → GitHub Actions** (não escolher "Deploy from a branch").
3. Fazer push. O Actions roda automaticamente e o app fica disponível em `https://usuario.github.io/nome-do-repo/`.

### Alternativas consideradas
- **`base: '/nome-do-repo/'`** — mais explícito, mas acopla o config ao nome do repo; `'./'` é mais portátil
- **Push manual do `dist/` para branch `gh-pages`** — funciona mas é manual e frágil
- **Pacote `gh-pages`** — automatiza o push mas ainda requer build local; Actions é mais limpo

### Consequências
A cada `git push` para `main`, o GitHub builda e deploya automaticamente. URL do deploy aparece no log do Actions e em Settings → Pages.

---

## FIX-001 — PDF: ArrayBuffer detachado pelo worker do PDF.js
**Data:** 2026-06-05

- **Sintoma:** `⚠ Erro ao abrir PDF: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.`
- **Causa raiz:** PDF.js v4 usa `postMessage` com `transfer` do ArrayBuffer para o worker thread — detacha o buffer do main thread permanentemente. Na remontagem, `activeFile.content` está morto.
- **Solução:** `AppContext.openFile` converte PDF em Blob URL (`URL.createObjectURL(blob)`). `PdfViewer` passa a URL string para `lib.getDocument(url)`. `closeFile` revoga com `URL.revokeObjectURL`.
- **Lição:** Nunca armazenar `ArrayBuffer` em estado React quando será transferido para Worker. Blob URLs são imunes. → Armadilha #1 CONTEXT.md.
- **Arquivos:** `src/context/AppContext.jsx`, `src/viewers/PdfViewer.jsx`

---

## FIX-002 — CSV: edição-enquanto-filtrado descartava linhas fora do filtro
**Data:** 2026-06-05

- **Sintoma:** Filtrar + editar + salvar descartava as linhas fora do filtro.
- **Causa raiz:** `commitEdit` reconstruía o CSV a partir do array `filtered` (derivado), não do `data` original.
- **Solução:** Injetar `__dataIdx` em cada linha do `filtered`. `editCell` guarda `{ dataIdx, col }`. `commitEdit` opera sobre `data.map((r, i) => i === dataIdx ? ... : r)`.
- **Bônus:** botão ✕ cancelar edição com `onMouseDown + preventDefault` (dispara antes do `onBlur`). → Armadilha #5 CONTEXT.md.
- **Arquivo:** `src/viewers/CsvViewer.jsx`
