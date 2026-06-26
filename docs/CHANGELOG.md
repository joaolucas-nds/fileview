# CHANGELOG

> Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/) + [SemVer](https://semver.org/lang/pt-BR/).
> Entradas novas no topo. Só o que foi de fato concluído/entregue.

---

## [Não lançado]

---

## [0.1.1] — 2026-06-05
### Corrigido
- **PDF (FIX-001):** `AppContext.openFile` agora converte o ArrayBuffer em Blob URL antes de armazenar em estado. `PdfViewer` passa a URL string diretamente para `lib.getDocument()`. PDF pode ser aberto, fechado e reaberto sem o erro `"ArrayBuffer at index 0 is already detached"`. `closeFile` revoga a Blob URL para evitar memory leak.
- **CSV (FIX-002):** `commitEdit` agora opera sobre o array `data` original via `__dataIdx` injetado em cada linha do `filtered`. Editar uma célula com filtro ativo não descarta mais as linhas fora do filtro.
- **CSV:** adicionado botão visual ✕ para cancelar edição inline (usa `onMouseDown + preventDefault` para disparar antes do `onBlur`). Esc também continua funcionando.
- **CSV:** adicionado botão "✕ limpar" ao lado do campo de filtro para limpar a busca com um clique.

---

## [0.1.0] — 2026-06-05
### Adicionado
- Viewer de Markdown com renderização visual via `marked` (GFM) — modo **Prévia**
- Editor WYSIWYG de Markdown via Tiptap v2 + `tiptap-markdown` — modo **Editar** — toolbar completa: títulos H1–H4, negrito, itálico, sublinhado, tachado, destaque, código inline, MAIÚSCULO/minúsculo por seleção, alinhamento (esq/centro/dir), listas (marcadores/numerada/tarefas com checkbox), citação, bloco de código com syntax highlighting (lowlight), linha horizontal, tabela (inserir + add col/linha + deletar), seletor de cor de texto, desfazer/refazer; BubbleMenu flutuante ao selecionar texto
- Modo **Fonte** (textarea dark monospace) para Markdown
- Visualizador JSON: árvore recursiva colapsável, cores por tipo (string=verde, number=azul, boolean=roxo, null=cinza), edição inline de valores folha (double-click + Enter/Esc), formatar (prettify) e minificar
- Visualizador CSV: tabela com cabeçalho fixo sticky, ordenação por coluna (asc/desc), filtro por texto global, edição inline de células (double-click + Enter/Esc), adicionar linha vazia, deletar linha (✕)
- Visualizador PDF: renderização página a página via canvas (pdfjs-dist), navegação (← → + input numérico), zoom 50%–300%, reset/ajustar
- SourceEditor: textarea dark monospace para .yaml, .yml, .xml, .svg, .txt, .env, .toml, .log e demais textos
- Sidebar escura com lista de arquivos abertos, indicador de modificado (dot laranja), fechar por arquivo, drop hint lateral
- Tab bar superior com troca de arquivo ativo, botão fechar (✕), indicador de modificado (● laranja)
- Seletor de modo por formato: Prévia/Editar/Fonte (MD) · Árvore/Texto (JSON/YAML/XML/etc.) · Tabela/Texto (CSV)
- Botão "Salvar ↓" (download do arquivo modificado) — aparece apenas quando `isDirty`
- Drop zone global (arrastar arquivo em qualquer ponto da tela abre o arquivo)
- Múltiplos arquivos abertos simultaneamente com modos independentes por arquivo
- Fontes: Outfit (UI) + Space Mono (código/mono) via Google Fonts
- Design tokens como CSS vars em App.css (cores, radii, fontes, dimensões)
