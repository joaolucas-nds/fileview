# STATUS.md — Estado Atual

> Arquivo **rolante**: descreve só o AGORA. Item resolvido SAI daqui.
> Médio e longo prazo ficam no ROADMAP.

---

## Versão Atual
**[0.1.3]** — 2026-07-01 — JSON Formulário: tabelas com truncamento, paginação e modal de detalhe

## ✅ Funcionando
- **Markdown:** preview renderizado (igual ao Claude), editor WYSIWYG Tiptap completo (toolbar + BubbleMenu ao selecionar texto), modo fonte (textarea dark)
- **JSON — Árvore:** árvore recursiva colapsável, cores por tipo de dado, edição inline de valores folha (double-click + Enter/Esc), formatar/minificar
- **JSON — Formulário:** chaves de 1º nível viram cards/tabs/painel; arrays de objetos viram tabela paginada (20 linhas/página) com colunas truncadas (ellipsis) e clique-na-linha abrindo modal com o registro completo sem corte; arrays simples viram lista de chips; sub-switcher `Cards | Tabs | Painel` persistido em localStorage; cards de tabela ocupam a largura total da grade
- **CSV:** tabela com cabeçalho fixo sticky, ordenação por coluna (asc/desc), filtro com botão "limpar", edição inline com botão ✕ cancelar (Enter confirma, Esc/✕ cancela), adicionar linha, deletar linha — edição opera sobre `data` original mesmo com filtro ativo
- **PDF:** renderização por canvas via pdfjs-dist, navegação por páginas, zoom 50%–300% — Blob URL, sem erro de ArrayBuffer detachado
- **GitHub Pages:** deploy automático via GitHub Actions (`.github/workflows/deploy.yml`, Node 24) — build roda no servidor do GitHub, publica apenas o `dist/`
- **Sidebar:** lista de arquivos abertos, indicador de modificado (dot laranja), fechar por arquivo, drag-and-drop lateral
- **Tabs:** troca de arquivo ativo, fechar por tab, indicador de modificado (● laranja)
- **Multi-arquivo:** múltiplos arquivos abertos simultaneamente, modos independentes por arquivo
- **Drop global:** arrastar arquivo em qualquer parte da tela
- **Outros formatos:** .yaml, .yml, .xml, .svg, .txt, .env, .toml, .log abrem em SourceEditor (textarea dark editável)
- **Salvar:** botão "Salvar ↓" aparece quando `isDirty`; dispara download do arquivo

## 🔧 Em Progresso
- Nada em andamento no momento.

## ❌ Quebrado / Com Problema
- Nenhum bug conhecido.

## 📋 Backlog (curto prazo — itens acionáveis)
- [ ] **JSON formulário: edição inline** — campos ainda são read-only; clicar para editar valor direto no card/tab/painel, e também dentro do RowDetailModal.
- [ ] **CSV Tab navigation** — Tab confirma e move para a próxima célula, como planilha.
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.

## 📁 Arquivos Críticos (não mexer sem contexto)
- `src/context/AppContext.jsx` — estado global; PDFs devem ser Blob URL, nunca ArrayBuffer.
- `src/editors/MarkdownEditor.jsx` — configuração Tiptap; `StarterKit.configure({ codeBlock: false })` obrigatório.
- `src/App.css` — todas as CSS vars e classes `.md-output`/`.tiptap-editor`; mudança reflete em tudo.
- `src/viewers/JsonViewer.jsx` — contém Árvore + FormView (Cards/Tabs/Painel) + ArrayTable (paginação+modal); `parseSections` e `SectionContent` são compartilhados pelos 3 layouts. `ROWS_PER_PAGE = 20` controla o tamanho da página da tabela.
- `vite.config.js` — `base: './'` obrigatório para GitHub Pages; não remover.
- `.github/workflows/deploy.yml` — pipeline de deploy automático; node-version 24; não remover.

## 💬 Última Sessão
**2026-07-01** — Corrigida UX das tabelas no JSON Formulário: `table-layout: fixed` + ellipsis de uma linha por célula evita que texto longo (ex: `text_content`) estique a altura da linha; paginação de 20 linhas evita renderizar centenas de linhas de uma vez; clique na linha abre `RowDetailModal` com o registro completo sem truncamento; `CardLayout` agora dá largura total (`gridColumn: 1 / -1`) para seções que são tabelas, resolvendo o problema de tabela espremida em card de 260px. ASU `2026-07-01_001_json-table-ux.yaml`. Próximo: edição inline nos campos do formulário.
