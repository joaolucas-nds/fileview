# STATUS.md — Estado Atual

> Arquivo **rolante**: descreve só o AGORA. Item resolvido SAI daqui.
> Médio e longo prazo ficam no ROADMAP.

---

## Versão Atual
**[0.1.6]** — 2026-07-07 (pendente de aplicar) — CSV: navegação por Tab entre células durante a edição.
*A versão do produto só passa a valer de fato depois que você aplicar `260707-asu0003.yaml` — este STATUS já reflete o estado PÓS-aplicação.*
**[0.1.5]** — 2026-07-07 — JSON Formulário: edição inline no `RowDetailModal` e nas células do `ArrayTable`. **Confirmado aplicado** (conferido no disco: `JsonViewer.jsx` bate com o `260707-asu0002.yaml`).

## ✅ Funcionando
- **Markdown:** preview renderizado (igual ao Claude), editor WYSIWYG Tiptap completo (toolbar + BubbleMenu ao selecionar texto), modo fonte (textarea dark)
- **JSON — Árvore:** árvore recursiva colapsável, cores por tipo de dado, edição inline de valores folha (double-click + Enter/Esc), formatar/minificar
- **JSON — Formulário:** chaves de 1º nível viram cards/tabs/painel; arrays de objetos viram tabela paginada (20 linhas/página) com colunas truncadas (ellipsis); campos primitivos (Cards/Tabs/Painel) editáveis com duplo clique (Enter confirma, Esc cancela); **células do ArrayTable editáveis com duplo clique direto na tabela**; **clique numa linha abre o `RowDetailModal` com o registro completo, também editável (duplo clique num valor → textarea para string, input para number/boolean/null)** — path resolvido via índice ORIGINAL da linha no array, não a posição pós-paginação; sub-switcher `Cards | Tabs | Painel` persistido em localStorage; cards de tabela ocupam a largura total da grade
- **CSV:** tabela com cabeçalho fixo sticky, ordenação por coluna (asc/desc), filtro com botão "limpar", edição inline com botão ✕ cancelar (Enter confirma, Esc/✕ cancela), **Tab confirma e move para a próxima célula (Shift+Tab volta), seguindo a ordem visível — pula de coluna em coluna e, na borda, para a linha seguinte/anterior**, adicionar linha, deletar linha — edição opera sobre `data` original mesmo com filtro ativo
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
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.
- [ ] **Apagar `meta/HISTORICO.md` do Projeto Claude** depois de subir o `meta/HISTORY.md` novo — pendência antiga, ainda não confirmada como feita.
- [ ] **Sincronizar a caixa "Instruções do Projeto" do Claude.ai** com o `PROJECT_INSTRUCTIONS.md` de `meta/` — sinalizado em 2026-07-07 (sessão 2), ainda não decidido/feito.

## 📁 Arquivos Críticos (não mexer sem contexto)
- `src/context/AppContext.jsx` — estado global; PDFs devem ser Blob URL, nunca ArrayBuffer.
- `src/editors/MarkdownEditor.jsx` — configuração Tiptap; `StarterKit.configure({ codeBlock: false })` obrigatório.
- `src/App.css` — todas as CSS vars e classes `.md-output`/`.tiptap-editor`; mudança reflete em tudo.
- `src/viewers/JsonViewer.jsx` — Árvore + FormView (Cards/Tabs/Painel) + ArrayTable (paginação+modal, ambos editáveis desde 2026-07-07 sessão 2) + edição inline do Field. `parseSections`/`SectionContent` compartilhados pelos 3 layouts; `handleUpdate` (no componente principal) é a mesma função usada por TODOS os pontos de edição (Árvore, Field, células do ArrayTable, RowDetailModal) — path dotted, incluindo índice de array quando aplicável. `ROWS_PER_PAGE = 20` controla a paginação; `ROW_CLICK_DELAY = 220` (ms) resolve o conflito clique-abre-modal vs duplo-clique-edita-célula (ver DEC-010).
- `src/viewers/CsvViewer.jsx` — `commitValue` extraída de `commitEdit` (2026-07-07) para ser reaproveitada por `commitAndMove`, que resolve a navegação por Tab; navega sobre `filtered` (ordem visível), não sobre `data` cru — mesmo cuidado do FIX-002 aplicado à navegação, não só à gravação.
- `vite.config.js` — `base: './'` obrigatório para GitHub Pages; não remover.
- `.github/workflows/deploy.yml` — pipeline de deploy automático; node-version 24; não remover.
- `meta/CEREBRO.md` — regras de comportamento; qualquer atualização do kit deve ser mesclada aqui, não sobrescrita.

## 💬 Última Sessão
**2026-07-07 (sessão 3)** — Verificação confirmou que a sessão 2 (RowDetailModal + ArrayTable editáveis) foi aplicada corretamente — `JsonViewer.jsx`, `STATUS.md`, `CHANGELOG.md`, `DECISIONS.md`, `IDEAS.md`, `ROADMAP.md` e `PROJECT_INSTRUCTIONS.md` no disco batem byte a byte com o que foi entregue no `260707-asu0002.yaml` e no pacote meta correspondente — nenhuma pendência desta vez. Implementado o próximo item do backlog: **CSV — navegação por Tab entre células durante a edição** (Tab confirma e move para a próxima coluna, Shift+Tab volta; na borda de coluna, pula para a linha seguinte/anterior). Diferente das duas sessões anteriores, usado **`replace_context_block`** (patch cirúrgico) em vez de `replace_file`, porque o `CsvViewer.jsx` — ao contrário do `JsonViewer.jsx` — não vem mudando estruturalmente a cada sessão; a mudança em si também é pequena e localizada (2 funções + 1 linha de UI). A navegação respeita a ordem **visível** (`filtered` — filtro/ordenação atuais), não a ordem crua de `data`, pela mesma razão do FIX-002 (a posição que o usuário vê não é necessariamente a posição no array original). Antes de gerar o YAML, simulei a aplicação da instrução em Python contra o arquivo real do mount e comparei o resultado byte a byte com o arquivo esperado (além da validação de sintaxe via Babel) — mais rigoroso ainda que a checagem byte-a-byte usada nas sessões anteriores, porque aqui há 3 modificações cirúrgicas encadeadas (uma depender da anterior ter sido aplicada certo) em vez de uma reescrita única. Próximo passo: aplicar `260707-asu0003.yaml`, testar Tab/Shift+Tab num CSV com múltiplas colunas e linhas, incluindo os casos de borda (última coluna da última linha, primeira coluna da primeira linha).
