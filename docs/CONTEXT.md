# CONTEXT.md — FileView

> Arquivo **estável**. Lido no início de cada sessão para ambientar o assistente.
> Muda só em alteração estrutural (stack, arquitetura, nova armadilha descoberta).

---

## Visão Geral
FileView é um visualizador e editor de arquivos que roda 100% no browser (sem servidor). Resolve o problema de abrir arquivos de desenvolvimento (.md, .json, .csv, .pdf, configs) com uma experiência visual adequada — sem precisar do VS Code e sem ver sintaxe bruta. O Markdown renderiza como o Claude renderiza; o JSON vira árvore interativa colapsável; o CSV vira tabela editável; o PDF renderiza página a página.

## Stack Tecnológica
- **Linguagem:** JavaScript (JSX) — sem TypeScript por ora
- **Framework:** React 18 + Vite 5
- **Editor WYSIWYG:** Tiptap v2 + `tiptap-markdown` (serialização MD ↔ Tiptap bidirecional)
- **Renderização MD (view-only):** `marked` v13 com GFM ativado
- **PDF:** `pdfjs-dist` v4 (Mozilla PDF.js) — somente leitura via canvas
- **CSV:** `papaparse` v5
- **Syntax highlight:** `lowlight` (dentro dos blocos de código do Tiptap)
- **Ícones:** `lucide-react` ^0.462.0 (fixado — não atualizar sem testar ícones)
- **Fontes:** Outfit (UI) + Space Mono (mono/código) via Google Fonts
- **Deploy:** `npm run dev` local; `npm run build` gera estático em `dist/`

## Estrutura do Projeto
```
fileview/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx                # Bootstrap React
    ├── App.jsx                 # Layout: sidebar + tab bar + mode switcher + ViewerRouter
    ├── App.css                 # Design tokens (CSS vars) + estilos globais + .md-output + .tiptap-editor
    ├── context/
    │   └── AppContext.jsx      # PEÇA CRÍTICA — estado global (ver seção abaixo)
    ├── components/
    │   ├── Sidebar.jsx         # Lista de arquivos + botão abrir + drop hint lateral
    │   ├── DropZone.jsx        # Tela de boas-vindas quando nenhum arquivo aberto
    │   └── ViewerRouter.jsx    # Roteador: ext + mode → viewer/editor (React.lazy)
    ├── viewers/
    │   ├── MarkdownViewer.jsx  # marked → HTML estilizado; read-only
    │   ├── JsonViewer.jsx      # Árvore recursiva customizada; edição inline de folhas
    │   ├── CsvViewer.jsx       # Tabela Papa Parse; sort/filter/edit/add/delete row
    │   └── PdfViewer.jsx       # pdfjs-dist sobre canvas; navegação + zoom
    └── editors/
        ├── MarkdownEditor.jsx  # Tiptap WYSIWYG completo; toolbar + BubbleMenu
        └── SourceEditor.jsx    # Textarea dark para qualquer texto plano
```

## Como o AppContext funciona (CRÍTICO)
AppContext é a **única fonte de verdade** — elimina prop drilling total.

**Estado:**
- `files` — array de `{ id, name, ext, content, originalContent, isDirty, size }`. Para PDFs, `content` é uma **Blob URL** (string), jamais ArrayBuffer.
- `activeId` — string do arquivo em foco.
- `modes` — `Record<id, 'preview'|'edit'|'source'|'view'>` — modo por arquivo, independente.

**Funções expostas via Context:**
- `openFile(File)` — lê o arquivo, cria objeto, adiciona ao array, seta como ativo. PDFs → Blob URL. Textos → `file.text()`.
- `closeFile(id)` — remove; **revoga Blob URL** se for PDF; atualiza `activeId` para vizinho.
- `updateContent(id, str)` — atualiza `content` e recalcula `isDirty`.
- `saveFile(id)` — dispara download via `<a download>`.
- `setMode(id, mode)` — troca modo de visualização do arquivo.
- `setActiveId(id)` — foca outro arquivo (Sidebar e tabs).

**ViewerRouter** lê `activeFile.ext` + `activeMode` e monta o componente via `React.lazy + Suspense`.

## Convenções de Código
- Nomes de arquivos, funções e variáveis em **inglês**; comentários em **PT-BR**
- Commits em PT-BR, imperativo curto
- Estilo: zero CSS modules — tudo em CSS vars globais (`App.css`) ou `style={{}}` inline
- TypeScript: não usado; migração futura considerada mas não prioridade

## Armadilhas Conhecidas

1. **PDF — ArrayBuffer detachado pelo worker** — PDF.js v4 faz `postMessage` com `transfer` do ArrayBuffer para o worker thread, o que o **detacha** do main thread permanentemente. Na remontagem do componente ou ao trocar de arquivo, o buffer está morto → erro `"already detached"`. **Solução obrigatória:** armazenar PDF como `URL.createObjectURL(blob)` em `AppContext.openFile`; passar a string URL para `lib.getDocument(url)` no PdfViewer; revogar com `URL.revokeObjectURL` no `closeFile`. Ver FIX-001.

2. **CSV: editar enquanto filtrado** — O `filtered` é um array derivado; reconstruir o CSV a partir dele descarta as linhas fora do filtro. A versão corrigida injeta `__dataIdx` (índice no `data` original) em cada linha do `filtered`, e `commitEdit` opera sobre `data` via esse índice. Ver FIX-002.

3. **Tiptap: StarterKit × CodeBlockLowlight** — `StarterKit` inclui um `codeBlock` padrão que conflita silenciosamente com `CodeBlockLowlight`. É **obrigatório** `StarterKit.configure({ codeBlock: false })`. Omitir quebra o editor sem erro no console.

4. **lucide-react versão** — fixado em `^0.462.0`. Versões mais novas renomeiam ícones; não atualizar sem testar cada ícone usado no projeto.

5. **onBlur vs cancelar edição (CSV/JSON)** — `onBlur` do input de edição sempre commita. Para cancelar via botão visual, o `onClick` do botão chega depois do `onBlur` e o commit já aconteceu. Solução: usar `onMouseDown + preventDefault` no botão cancelar — isso dispara antes do `onBlur`.

## Contexto de Produto
- **Usuário-alvo:** desenvolvedor solo ou pequena equipe que lida com .md, .json, .csv, configs no dia a dia
- **Dor que resolve:** abrir .md no browser e ver sintaxe crua; precisar de app separado para cada formato
- **O que é sucesso:** abrir qualquer arquivo texto/dados e ter experiência visual imediata; editar e salvar sem fricção
- **O que deliberadamente NÃO é:** editor de código (sem LSP, sem Git); ferramenta colaborativa; substituto do Word/Excel; app hospedado com backend; editor de conteúdo de PDF
