# GLOSSARY.md — Termos do Projeto FileView

> Termos próprios que o assistente reexplicaria a cada sessão sem este arquivo.
> Só o que não é óbvio para alguém de fora.

---

## Conceitos do projeto
- **Viewer** — componente React que exibe um arquivo em modo somente leitura (ex: `MarkdownViewer`, `PdfViewer`). Não chama `updateContent`.
- **Editor** — componente que permite modificar o conteúdo (ex: `MarkdownEditor`, `SourceEditor`). Chama `updateContent` no onChange/onUpdate.
- **Mode** — modo de exibição atual de um arquivo. Valores possíveis: `preview` (MD renderizado, read-only), `edit` (WYSIWYG Tiptap), `source` (textarea raw dark), `view` (padrão para JSON/CSV — árvore ou tabela).
- **ActiveFile** — objeto derivado em AppContext: `files.find(f => f.id === activeId)`. É o arquivo atualmente em foco.
- **isDirty** — `true` quando `content !== originalContent`. Exibe o dot laranja na tab e na sidebar; habilita o botão "Salvar ↓".
- **Blob URL** — URL do tipo `blob:http://localhost:5173/...` criada com `URL.createObjectURL(blob)`. Armazena o conteúdo de PDFs no estado React sem risco de ArrayBuffer detachment pelo worker do PDF.js. Deve ser revogada com `URL.revokeObjectURL` ao fechar o arquivo para evitar memory leak.
- **`__dataIdx`** — campo interno injetado em cada linha do array `filtered` no CsvViewer, que guarda o índice da linha no array `data` original. Garante que `commitEdit` opere sobre a linha correta mesmo com filtros/sort ativos.

## Arquiteturas / módulos
- **AppContext** — Context + Provider em `src/context/AppContext.jsx`. Contém todo o estado da aplicação. Viewers e editors não gerenciam estado de arquivo próprio — apenas estado de UI local (editCell, search, scale, etc.).
- **ViewerRouter** — `src/components/ViewerRouter.jsx`. Lê `activeFile.ext` + `activeMode` e monta o componente correto via `React.lazy + Suspense`.
- **tiptap-markdown** — Extensão community do Tiptap (`npm: tiptap-markdown`) que adiciona serialização Markdown↔Tiptap bidirecional. Saída Markdown acessada via `editor.storage.markdown.getMarkdown()`.
- **Design tokens** — variáveis CSS definidas em `:root` em `App.css` (ex: `--accent`, `--border`, `--font-mono`, `--radius-sm`). Usadas via `var(--token)` em todos os `style={{}}` inline dos componentes.

## Comandos
- `npm run dev` — inicia servidor de desenvolvimento em `http://localhost:5173`
- `npm run build` — gera bundle otimizado em `dist/` (deploy estático)
- `npm run preview` — serve o build localmente para testar antes de deploy
- `npm install --legacy-peer-deps` — se houver conflito de peer deps entre pacotes Tiptap

## Identificadores
- **FIX-N** — bug grave registrado em DECISIONS.md (FIX-001 = PDF ArrayBuffer, FIX-002 = CSV filtered edit)
- **DEC-N** — decisão de arquitetura em DECISIONS.md (DEC-002 = escolha do Tiptap, etc.)
- **F1, F2…** — fases do ROADMAP
