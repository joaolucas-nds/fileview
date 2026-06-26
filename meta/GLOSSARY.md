# GLOSSARY.md — Termos do Projeto FileView

> Termos próprios que o assistente reexplicaria a cada sessão sem este arquivo.
> Só o que não é óbvio para alguém de fora.

---

## Conceitos do projeto
- **Viewer** — componente React que exibe um arquivo em modo somente leitura (ex: `MarkdownViewer`, `PdfViewer`). Não chama `updateContent`.
- **Editor** — componente que permite modificar o conteúdo (ex: `MarkdownEditor`, `SourceEditor`). Chama `updateContent` no onChange/onUpdate.
- **Mode** — modo de exibição atual de um arquivo. Valores: `preview` (MD renderizado, read-only), `edit` (WYSIWYG Tiptap), `source` (textarea raw dark), `view` (padrão para JSON/CSV — árvore ou tabela).
- **ActiveFile** — objeto derivado em AppContext: `files.find(f => f.id === activeId)`. É o arquivo atualmente em foco.
- **isDirty** — `true` quando `content !== originalContent`. Exibe o dot laranja na tab e na sidebar; habilita botão "Salvar ↓".
- **Blob URL** — URL do tipo `blob:http://localhost:5173/...` criada com `URL.createObjectURL(blob)`. Armazena PDFs no estado React sem risco de ArrayBuffer detachment pelo worker do PDF.js. Deve ser revogada com `URL.revokeObjectURL` ao fechar o arquivo.
- **`__dataIdx`** — campo interno injetado em cada linha do array `filtered` no CsvViewer, que guarda o índice da linha no array `data` original. Garante que `commitEdit` opere sobre a linha correta mesmo com filtros/sort ativos.
- **base URL** — configuração `base` do Vite que define o caminho raiz dos assets no build. Sem `base: './'`, o GitHub Pages serve em branco porque os assets ficam em `/assets/...` (absoluto) mas o app é servido em `/repo-name/`.

## Arquiteturas / módulos
- **AppContext** — Context + Provider em `src/context/AppContext.jsx`. Contém todo o estado da aplicação. Viewers e editors não gerenciam estado de arquivo próprio — apenas estado de UI local (editCell, search, scale, etc.).
- **ViewerRouter** — `src/components/ViewerRouter.jsx`. Lê `activeFile.ext` + `activeMode` e monta o componente correto via `React.lazy + Suspense`.
- **tiptap-markdown** — Extensão community do Tiptap que adiciona serialização Markdown↔Tiptap bidirecional. Saída MD via `editor.storage.markdown.getMarkdown()`.
- **Design tokens** — variáveis CSS em `:root` em `App.css` (ex: `--accent`, `--border`, `--font-mono`). Usadas via `var(--token)` em todos os `style={{}}` inline.
- **CEREBRO.md** — arquivo de instrução do assistente (regras de comportamento, ritual de início de sessão, gatilhos). Vive em `meta/`. Renomeado de CLAUDE.md em 2026-06-25.

## Comandos
- `npm run dev` — servidor de desenvolvimento em `http://localhost:5173`
- `npm run build` — bundle otimizado em `dist/` (para deploy)
- `npm run preview` — serve o build localmente antes de deploy
- `npm install --legacy-peer-deps` — se houver conflito de peer deps entre pacotes Tiptap

## Deploy no GitHub Pages
1. `npm run build` — gera `dist/`
2. Fazer commit e push de `dist/` para o branch `gh-pages` (ou configurar GitHub Actions para fazer isso automaticamente)
3. Em Settings → Pages → Source: selecionar `gh-pages` branch, pasta `/` (root)
4. O app fica em `https://username.github.io/nome-do-repo/`

## Identificadores
- **FIX-N** — bug grave registrado em DECISIONS.md (FIX-001 = PDF ArrayBuffer, FIX-002 = CSV filtered edit)
- **DEC-N** — decisão de arquitetura em DECISIONS.md (DEC-007 = GitHub Pages base)
- **F1, F2…** — fases do ROADMAP
