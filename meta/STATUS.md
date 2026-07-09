# STATUS.md — Estado Atual

> Arquivo **rolante**: descreve só o AGORA. Item resolvido SAI daqui.
> Médio e longo prazo ficam no ROADMAP.

---

## Versão Atual
**[0.1.5]** — 2026-07-07 (pendente de aplicar) — JSON Formulário: edição inline no `RowDetailModal` e nas células do `ArrayTable`.
*A versão do produto só passa a valer de fato depois que você aplicar `260707-asu0002.yaml` — este STATUS já reflete o estado PÓS-aplicação.*
**[0.1.4]** — 2026-07-07 — JSON Formulário: edição inline dos campos (Field), nos 3 layouts. **Confirmado aplicado** (conferido no disco: `JsonViewer.jsx` bate com o `260707-asu0001.yaml`).

## ✅ Funcionando
- **Markdown:** preview renderizado (igual ao Claude), editor WYSIWYG Tiptap completo (toolbar + BubbleMenu ao selecionar texto), modo fonte (textarea dark)
- **JSON — Árvore:** árvore recursiva colapsável, cores por tipo de dado, edição inline de valores folha (double-click + Enter/Esc), formatar/minificar
- **JSON — Formulário:** chaves de 1º nível viram cards/tabs/painel; arrays de objetos viram tabela paginada (20 linhas/página) com colunas truncadas (ellipsis); campos primitivos (Cards/Tabs/Painel) editáveis com duplo clique (Enter confirma, Esc cancela); **células do ArrayTable editáveis com duplo clique direto na tabela**; **clique numa linha abre o `RowDetailModal` com o registro completo, também editável (duplo clique num valor → textarea para string, input para number/boolean/null)** — path resolvido via índice ORIGINAL da linha no array, não a posição pós-paginação; sub-switcher `Cards | Tabs | Painel` persistido em localStorage; cards de tabela ocupam a largura total da grade
- **CSV:** tabela com cabeçalho fixo sticky, ordenação por coluna (asc/desc), filtro com botão "limpar", edição inline com botão ✕ cancelar (Enter confirma, Esc/✕ cancela), adicionar linha, deletar linha — edição opera sobre `data` original mesmo com filtro ativo
- **PDF:** renderização por canvas via pdfjs-dist, navegação por páginas, zoom 50%–300% — Blob URL, sem erro de ArrayBuffer detachado
- **GitHub Pages:** deploy automático via GitHub Actions (`.github/workflows/deploy.yml`, Node 24) — build roda no servidor do GitHub, publica apenas o `dist/`. Confirmado funcionando em produção em `https://joaolucas-nds.github.io/fileview/`.
- **Sidebar:** lista de arquivos abertos, indicador de modificado (dot laranja), fechar por arquivo, drag-and-drop lateral
- **Tabs:** troca de arquivo ativo, fechar por tab, indicador de modificado (● laranja)
- **Multi-arquivo:** múltiplos arquivos abertos simultaneamente, modos independentes por arquivo
- **Drop global:** arrastar arquivo em qualquer parte da tela
- **Outros formatos:** .yaml, .yml, .xml, .svg, .txt, .env, .toml, .log abrem em SourceEditor (textarea dark editável)
- **Salvar:** botão "Salvar ↓" aparece quando `isDirty`; dispara download do arquivo
- **Sistema de documentação (meta/):** CEREBRO.md + 9 docs + logs, na versão do Kit de Contexto Universal adotada em 2026-07-03 (DEC-009), agora com a pendência de nomenclatura ASU também resolvida (ver DECISIONS.md).

## 🔧 Em Progresso
- Nada em andamento no momento além de aplicar o ASU desta sessão.

## ❌ Quebrado / Com Problema
- Nenhum bug conhecido no produto.

## 📋 Backlog (curto prazo — itens acionáveis)
- [ ] **CSV Tab navigation** — Tab confirma e move para a próxima célula, como planilha.
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.
- [ ] **Apagar `meta/HISTORICO.md` do Projeto Claude** depois de subir o `meta/HISTORY.md` novo — pendência antiga, ainda não confirmada como feita.

## 📁 Arquivos Críticos (não mexer sem contexto)
- `src/context/AppContext.jsx` — estado global; PDFs devem ser Blob URL, nunca ArrayBuffer.
- `src/editors/MarkdownEditor.jsx` — configuração Tiptap; `StarterKit.configure({ codeBlock: false })` obrigatório.
- `src/App.css` — todas as CSS vars e classes `.md-output`/`.tiptap-editor`; mudança reflete em tudo.
- `src/viewers/JsonViewer.jsx` — Árvore + FormView (Cards/Tabs/Painel) + ArrayTable (paginação+modal, ambos editáveis desde 2026-07-07 sessão 2) + edição inline do Field. `parseSections`/`SectionContent` compartilhados pelos 3 layouts; `handleUpdate` (no componente principal) é a mesma função usada por TODOS os pontos de edição (Árvore, Field, células do ArrayTable, RowDetailModal) — path dotted, incluindo índice de array quando aplicável. `ROWS_PER_PAGE = 20` controla a paginação; `ROW_CLICK_DELAY = 220` (ms) resolve o conflito clique-abre-modal vs duplo-clique-edita-célula (ver DEC-010).
- `vite.config.js` — `base: './'` obrigatório para GitHub Pages; não remover.
- `.github/workflows/deploy.yml` — pipeline de deploy automático; node-version 24; não remover.
- `meta/CEREBRO.md` — regras de comportamento; qualquer atualização do kit deve ser mesclada aqui, não sobrescrita.

## 💬 Última Sessão
**2026-07-07 (sessão 2)** — Verificação confirmou que a sessão 1 (nomenclatura ASU + edição inline do Field) foi aplicada corretamente (`JsonViewer.jsx` no disco bate byte a byte com o `260707-asu0001.yaml` entregue); corrigidos dois arquivos que tinham ficado pendentes na entrega anterior (`STATUS.md` ainda dizia "pendente de aplicar" mesmo já confirmado; `PROJECT_INSTRUCTIONS.md` ainda citava a nomenclatura antiga do ASU). Implementada a edição inline no `RowDetailModal` e nas células do `ArrayTable` — o item que tinha ficado de fora da sessão 1 por exigir resolver o `path` a partir do índice ORIGINAL da linha no array (mesma classe de cuidado do FIX-002 no CSV). Resolvido também um conflito de interação: clique simples na linha abre o modal, mas duplo clique numa célula precisa editar direto sem abrir o modal — resolvido com um debounce de 220ms no clique da linha (DEC-010, registra a decisão e as alternativas descartadas). RowDetailModal usa `<textarea>` para campos string (Enter quebra linha, só Esc cancela ou blur confirma) e `<input>` para number/boolean/null (Enter confirma) — motivado pelo próprio caso de uso do modal (texto longo, DEC-008). Sintaxe do arquivo validada com Babel antes da entrega. Próximo passo: aplicar `260707-asu0002.yaml`, testar edição de célula e do modal num array de objetos real, depois seguir para CSV Tab navigation ou Busca Ctrl+F.
