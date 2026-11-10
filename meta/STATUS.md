# STATUS.md — Estado Atual

> Arquivo **rolante**: descreve só o AGORA. Item resolvido SAI daqui.
> Médio e longo prazo ficam no ROADMAP.

---

## Versão Atual
**[0.1.6]** — 2026-07-07 — CSV: navegação por Tab entre células durante a edição. **Confirmado aplicado** (o `CsvViewer.jsx` do snapshot do Projeto de 2026-11-06 contém `commitValue`/`commitAndMove`, o handler de Tab e o rodapé novo). O commit posterior `f626337` ("correcao asu0003", 2026-07-24) não foi inspecionado — ver Backlog.
*Nenhuma versão nova do produto desde a 0.1.6: a sessão de 2026-11-07 foi só de handoff (documentação), sem mudança de código.*
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
- Nada em andamento no produto. A sessão de 2026-11-07 foi de transferência de contexto (handoff) — ver `261107-HANDOFF-BRIEF.md`.

## ❌ Quebrado / Com Problema
- Nenhum bug conhecido no produto.

## 📋 Backlog (curto prazo — itens acionáveis)
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.
- [ ] **Verificar o commit `f626337` ("correcao asu0003", 2026-07-24)** — não há log nem entrada no CHANGELOG sobre o que ele mudou. O `CsvViewer.jsx` do snapshot de 2026-11-06 contém a navegação Tab completa (+ uma linha em branco residual dentro do `onKeyDown`, entre os handlers de Tab e Escape — cosmético). Rodar `git show f626337 --stat` e registrar o que foi.
- [ ] **Testar no navegador (nunca confirmado):** CSV — Tab/Shift+Tab (bordas, com filtro e ordenação ativos); JSON Formulário — edição inline em `Field`, células do `ArrayTable` e `RowDetailModal` (string, number, boolean, null, texto longo; sensação dos 220 ms do DEC-010). **Suspeita a confirmar:** número digitado inválido vira `NaN` em `parseEditedValue` e `JSON.stringify` grava `null`; `null` editado volta sempre `null`; boolean ≠ `"true"` vira `false` (ver IDEAS).
- [ ] **Atualizar o `README.md` e decidir a versão do `package.json`** — README sem o modo Formulário, edição inline e Tab do CSV; `package.json` ainda em `0.1.0` (CHANGELOG está em 0.1.6). Decidir se a versão do package acompanha o CHANGELOG.
- [ ] **Apagar `meta/HISTORICO.md`** — o `_TREE` de 2026-11-06 mostra o arquivo ainda no repo (e o Projeto também o lista), duplicata antiga do `HISTORY.md`. `git rm meta\HISTORICO.md` + remover do Projeto Claude.
- [ ] **`PROJECT_INSTRUCTIONS.md` não está no repo nem no Projeto** (ausente do `_TREE`). A caixa "Instruções do Projeto" do Claude.ai já mostra `AAMMDD-asuNNNN.yaml` (parece sincronizada). Decidir se o arquivo versionado volta para `meta/` — se voltar, lembrar da armadilha dos dois arquivos de instrução em sincronia (CEREBRO × PROJECT_INSTRUCTIONS).


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
**2026-11-07 (sessão 4 — handoff)** — Sessão só de preparação para trocar de conversa; **nenhum código do produto foi alterado**. Entregues o `261107-HANDOFF-BRIEF.md` (arquivo novo; atalho de arranque — a memória continua nestes docs de `meta/`), este patch `261107-asu0004.yaml` e o log `logs/2026-11-07.md`. Por pedido explícito do usuário, STATUS/IDEAS foram atualizados por ASU em vez de arquivo inteiro (exceção à regra dos docs rolantes). Limitação: a sandbox não tinha o mount do Projeto — o estado foi lido via `project_read`; as âncoras do ASU foram simuladas só contra STATUS/IDEAS/DECISIONS (cópias em disco) e CONTEXT/GLOSSARY só tiveram as linhas-alvo conferidas, então **o dry-run do ASU é obrigatório**. Achados: `CsvViewer.jsx` já contém a navegação Tab (0.1.6 aplicada; o commit `f626337` "correcao asu0003" de 2026-07-24 não foi inspecionado); `DECISIONS.md` tinha perdido o cabeçalho `## FIX-001` (restaurado, título reconstruído do corpo); `meta/HISTORICO.md` segue no repo; `PROJECT_INSTRUCTIONS.md` não está no repo; CONTEXT/GLOSSARY estavam velhos (nomenclatura ASU, edição inline, Tab, layout de `meta/ASU/`) — atualizados. Último trabalho de produto: 2026-07-07 (sessão 3, CSV Tab, 0.1.6). Próximo passo: ver `261107-HANDOFF-BRIEF.md`.
