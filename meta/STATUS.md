# STATUS.md — Estado Atual

> Arquivo **rolante**: descreve só o AGORA. Item resolvido SAI daqui.
> Médio e longo prazo ficam no ROADMAP.

---

## Versão Atual
**[0.1.1]** — 2026-06-25 — Bugfixes: PDF (FIX-001) + CSV cancel + CSV filtered edit (FIX-002) + GitHub Pages (DEC-007)

## ✅ Funcionando
- **Markdown:** preview renderizado (igual ao Claude), editor WYSIWYG Tiptap completo (toolbar + BubbleMenu ao selecionar texto), modo fonte (textarea dark)
- **JSON:** árvore recursiva colapsável, cores por tipo de dado, edição inline de valores folha (double-click + Enter/Esc), formatar/minificar
- **CSV:** tabela com cabeçalho fixo sticky, ordenação por coluna (asc/desc), filtro com botão "limpar", edição inline com botão ✕ cancelar (Enter confirma, Esc/✕ cancela), adicionar linha, deletar linha — edição opera sobre `data` original mesmo com filtro ativo
- **PDF:** renderização por canvas via pdfjs-dist, navegação por páginas, zoom 50%–300% — **Blob URL, sem erro de ArrayBuffer detachado**
- **GitHub Pages:** deploy automático via GitHub Actions (`.github/workflows/deploy.yml`) — **build roda no servidor do GitHub, publica apenas o `dist/`**
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
- [ ] **JSON modo formulário/cards** — chaves de 1º nível viram seções; arrays de objetos viram tabela automática. Ver IDEAS.
- [ ] **JSON Table View** — terceiro modo ("Tabela") quando o JSON é `array of objects` uniforme.
- [ ] **CSV Tab navigation** — Tab confirma e move para a próxima célula, como planilha.
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.

## 📁 Arquivos Críticos (não mexer sem contexto)
- `src/context/AppContext.jsx` — estado global; PDFs devem ser Blob URL, nunca ArrayBuffer.
- `src/editors/MarkdownEditor.jsx` — configuração Tiptap; `StarterKit.configure({ codeBlock: false })` obrigatório.
- `src/App.css` — todas as CSS vars e classes `.md-output`/`.tiptap-editor`; mudança reflete em tudo.
- `vite.config.js` — `base: './'` obrigatório para GitHub Pages; não remover.
- `.github/workflows/deploy.yml` — pipeline de deploy automático; não remover.

## 💬 Última Sessão
**2026-06-25** — Aplicados FIX-001 (PDF Blob URL), FIX-002 (CSV `__dataIdx` + botão cancelar), DEC-007 (GitHub Pages `base: './'`). Adicionado `.github/workflows/deploy.yml` para deploy automático via GitHub Actions (resolve o "ainda em branco" no Pages). Instruções renomeadas de CLAUDE.md para CEREBRO.md. Meta/ consolidado — duplicatas eliminadas. Próximo: atacar JSON modo formulário/cards.
