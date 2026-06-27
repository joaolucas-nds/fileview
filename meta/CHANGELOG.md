# CHANGELOG

> Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/) + [SemVer](https://semver.org/lang/pt-BR/).
> Entradas novas no topo. Só o que foi de fato concluído/entregue.

---

## [Não lançado]
### Adicionado
- `.github/workflows/deploy.yml` — GitHub Actions para build e deploy automático no GitHub Pages a cada push na main.

---

## [0.1.1] — 2026-06-25
### Corrigido
- **PDF (FIX-001):** `AppContext.openFile` converte ArrayBuffer em Blob URL antes de armazenar. `PdfViewer` passa a URL string para `lib.getDocument()`. PDF pode ser aberto, fechado e reaberto sem o erro `"ArrayBuffer at index 0 is already detached"`. `closeFile` revoga a Blob URL para evitar memory leak.
- **CSV (FIX-002):** `commitEdit` opera sobre o array `data` original via `__dataIdx` injetado em cada linha do `filtered`. Editar célula com filtro ativo não descarta mais linhas fora do filtro.
- **CSV:** adicionado botão visual ✕ para cancelar edição inline (`onMouseDown + preventDefault` para disparar antes do `onBlur`). Esc também funciona.
- **CSV:** adicionado botão "✕ limpar" no campo de filtro.
- **Deploy (DEC-007):** `vite.config.js` com `base: './'` — corrige página em branco no GitHub Pages causada por URLs absolutas de assets.

### Alterado
- Instrução do assistente renomeada de `CLAUDE.md` para `CEREBRO.md`.
- Documentação de contexto consolidada em `meta/` (duplicatas eliminadas).

---

## [0.1.0] — 2026-06-05
### Adicionado
- Viewer de Markdown com renderização via `marked` (GFM) — modo **Prévia**
- Editor WYSIWYG de Markdown via Tiptap v2 + `tiptap-markdown` — modo **Editar** — toolbar: H1–H4, negrito, itálico, sublinhado, tachado, destaque, código inline, MAIÚSCULO/minúsculo, alinhamento, listas (marcadores/numerada/tarefas), citação, bloco de código com syntax highlighting, linha horizontal, tabela, cor de texto, desfazer/refazer; BubbleMenu ao selecionar texto
- Modo **Fonte** (textarea dark) para Markdown
- Visualizador JSON: árvore colapsável, cores por tipo, edição inline de folhas (double-click + Enter/Esc), formatar/minificar
- Visualizador CSV: tabela com cabeçalho fixo, sort por coluna, filtro, edição inline, adicionar/deletar linhas
- Visualizador PDF: canvas via pdfjs-dist, navegação por páginas, zoom 50%–300%
- SourceEditor: textarea dark para .yaml, .yml, .xml, .svg, .txt, .env, .toml, .log e outros
- Sidebar escura com lista de arquivos, indicador de modificado, fechar, drag-and-drop lateral
- Tab bar com troca de arquivo ativo, fechar, indicador de modificado
- Seletor de modo por formato (Prévia/Editar/Fonte · Árvore/Texto · Tabela/Texto)
- Botão "Salvar ↓" (download) quando `isDirty`
- Drop zone global
- Múltiplos arquivos abertos com modos independentes por arquivo
- Fontes: Outfit + Space Mono via Google Fonts; design tokens como CSS vars em App.css
