# CHANGELOG

> Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/) + [SemVer](https://semver.org/lang/pt-BR/).
> Entradas novas no topo. Só o que foi de fato concluído/entregue.

---

## [Não lançado]

---

## [0.1.3] — 2026-07-01
### Corrigido
- **JSON Formulário — tabelas ilegíveis com colunas de texto longo:** colunas com strings longas (ex: `text_content` de páginas raspadas) esticavam a altura da linha e quebravam o layout. `ArrayTable` agora usa `table-layout: fixed` com largura fixa por coluna e truncamento de uma linha (`text-overflow: ellipsis`), com tooltip nativo (`title`) mostrando o valor completo ao passar o mouse.
- **JSON Formulário — tabela espremida em card estreito:** no layout Cards, uma tabela de 10+ colunas dentro de um card de 260px parecia vazia (só as 1-2 primeiras colunas visíveis). `CardLayout` agora dá largura total (`gridColumn: 1 / -1`) a seções que são arrays de objetos.

### Adicionado
- **JSON Formulário — paginação de tabelas:** arrays com mais de 20 itens são paginados (◀ ▶ + contador "linhas X–Y de Z"), evitando renderizar centenas de linhas de uma vez.
- **JSON Formulário — modal de registro completo:** clicar numa linha da tabela abre um modal mostrando todos os campos do registro sem truncamento, com quebra de linha preservada (`white-space: pre-wrap`) — resolve o caso de campos de texto longo que a tabela trunca.

---

## [0.1.2] — 2026-06-28
### Adicionado
- **JSON — modo Formulário:** novo modo de visualização (`form`) para arquivos `.json`. Cada chave de 1º nível vira uma seção. Conteúdo é renderizado como grid de campos rotulados (objetos), tabela automática (arrays de objetos com schema uniforme) ou lista de chips (arrays de primitivos).
- **JSON — sub-switcher de layout:** barra `Layout: Cards | Tabs | Painel` dentro do modo Formulário. Escolha persistida em `localStorage` (`fv-json-layout`). Cards = grade responsiva de cards; Tabs = aba por seção; Painel = navegação lateral.
- **App.jsx — `jsonModes`:** botão "Formulário" aparece na barra de abas apenas para `.json`. Formatos `yaml/yml/xml/toml/env` continuam com Árvore/Texto (sem Formulário, pois o parser é JSON-only).

### Alterado
- `src/App.jsx` — `jsonModes` separado de `structModes`; `.json` usa `jsonModes`, demais formatos estruturados usam `structModes`.
- `src/viewers/JsonViewer.jsx` — versão completa substituída; modo Árvore preservado integralmente; adicionados `FormView`, `CardLayout`, `TabLayout`, `PanelLayout`, `SectionContent`, `Field`, `TypedValue`, `ArrayTable`, `PrimitiveList`.

---

## [0.1.1] — 2026-06-25
### Corrigido
- **PDF (FIX-001):** `AppContext.openFile` converte ArrayBuffer em Blob URL antes de armazenar. `PdfViewer` passa a URL string para `lib.getDocument()`. PDF pode ser aberto, fechado e reaberto sem o erro `"ArrayBuffer at index 0 is already detached"`. `closeFile` revoga a Blob URL para evitar memory leak.
- **CSV (FIX-002):** `commitEdit` opera sobre o array `data` original via `__dataIdx` injetado em cada linha do `filtered`. Editar célula com filtro ativo não descarta mais linhas fora do filtro.
- **CSV:** adicionado botão visual ✕ para cancelar edição inline (`onMouseDown + preventDefault` para disparar antes do `onBlur`). Esc também funciona.
- **CSV:** adicionado botão "✕ limpar" no campo de filtro.
- **Deploy (DEC-007):** `vite.config.js` com `base: './'` — corrige página em branco no GitHub Pages.

### Adicionado
- `.github/workflows/deploy.yml` — GitHub Actions: build automático + deploy de `dist/` a cada push na main.

### Alterado
- Instrução do assistente renomeada de `CLAUDE.md` para `CEREBRO.md`.
- Documentação de contexto consolidada em `meta/` (duplicatas eliminadas).

---

## [0.1.0] — 2026-06-05
### Adicionado
- Viewer de Markdown com renderização via `marked` (GFM) — modo **Prévia**
- Editor WYSIWYG de Markdown via Tiptap v2 + `tiptap-markdown` — modo **Editar** — toolbar completa
- Modo **Fonte** (textarea dark) para Markdown
- Visualizador JSON: árvore colapsável, cores por tipo, edição inline de folhas, formatar/minificar
- Visualizador CSV: tabela com cabeçalho fixo, sort por coluna, filtro, edição inline, adicionar/deletar linhas
- Visualizador PDF: canvas via pdfjs-dist, navegação por páginas, zoom 50%–300%
- SourceEditor: textarea dark para .yaml, .yml, .xml, .svg, .txt, .env, .toml, .log e outros
- Sidebar, tab bar, seletor de modo, botão "Salvar ↓", drop zone global, multi-arquivo
- Fontes: Outfit + Space Mono via Google Fonts; design tokens como CSS vars em App.css
