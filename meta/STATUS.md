# STATUS.md — Estado Atual

> Arquivo **rolante**: descreve só o AGORA. Item resolvido SAI daqui.
> Médio e longo prazo ficam no ROADMAP.

---

## Versão Atual
**[0.1.4]** — 2026-07-07 (pendente de aplicar) — JSON Formulário: edição inline dos campos (Field), nos 3 layouts.
*A versão do produto só passa a valer de fato depois que você aplicar `260707-asu0001.yaml` — este STATUS já reflete o estado PÓS-aplicação, para não ficar defasado assim que você rodar o ASU.*

## ✅ Funcionando
- **Markdown:** preview renderizado (igual ao Claude), editor WYSIWYG Tiptap completo (toolbar + BubbleMenu ao selecionar texto), modo fonte (textarea dark)
- **JSON — Árvore:** árvore recursiva colapsável, cores por tipo de dado, edição inline de valores folha (double-click + Enter/Esc), formatar/minificar
- **JSON — Formulário:** chaves de 1º nível viram cards/tabs/painel; arrays de objetos viram tabela paginada (20 linhas/página) com colunas truncadas (ellipsis) e clique-na-linha abrindo modal com o registro completo sem corte; arrays simples viram lista de chips; sub-switcher `Cards | Tabs | Painel` persistido em localStorage; cards de tabela ocupam a largura total da grade; **campos primitivos (Cards/Tabs/Painel) são editáveis com duplo clique — mesmo padrão da Árvore (Enter confirma, Esc cancela)**
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
- [ ] **RowDetailModal: edição inline** — o modal de registro completo do ArrayTable continua read-only; estender o mesmo padrão de edição do Field (double-click) para dentro do modal. (IDEAS 2026-07-01)
- [ ] **ArrayTable: edição inline nas células** — hoje só o Field (Cards/Tabs/Painel) ficou editável nesta sessão; as células da tabela (arrays de objetos) continuam read-only.
- [ ] **CSV Tab navigation** — Tab confirma e move para a próxima célula, como planilha.
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.
- [ ] **Apagar `meta/HISTORICO.md` do Projeto Claude** depois de subir o `meta/HISTORY.md` novo — pendência antiga, ainda não confirmada como feita.

## 📁 Arquivos Críticos (não mexer sem contexto)
- `src/context/AppContext.jsx` — estado global; PDFs devem ser Blob URL, nunca ArrayBuffer.
- `src/editors/MarkdownEditor.jsx` — configuração Tiptap; `StarterKit.configure({ codeBlock: false })` obrigatório.
- `src/App.css` — todas as CSS vars e classes `.md-output`/`.tiptap-editor`; mudança reflete em tudo.
- `src/viewers/JsonViewer.jsx` — Árvore + FormView (Cards/Tabs/Painel) + ArrayTable (paginação+modal) + edição inline do Field (nova nesta sessão). `parseSections`/`SectionContent` compartilhados pelos 3 layouts; `handleUpdate` (no componente principal) é a mesma função usada pela Árvore e agora também pelo Field do Formulário — path dotted resolvido em `SectionContent`. `ROWS_PER_PAGE = 20` controla a paginação da tabela.
- `vite.config.js` — `base: './'` obrigatório para GitHub Pages; não remover.
- `.github/workflows/deploy.yml` — pipeline de deploy automático; node-version 24; não remover.
- `meta/CEREBRO.md` — regras de comportamento; qualquer atualização do kit deve ser mesclada aqui, não sobrescrita.

## 💬 Última Sessão
**2026-07-07** — Duas coisas: (1) resolvida a pendência do DEC-009 (nomenclatura de ASU) — migrado de `AAAA-MM-DD_NNN_descricao.yaml` para o padrão do kit `AAMMDD-asuNNNN.yaml`; este é o primeiro ASU com o nome novo (`260707-asu0001.yaml`). (2) Implementada a edição inline dos campos no JSON Formulário — `Field` (usado nos 3 layouts) ganhou duplo-clique → input → Enter/Esc, reaproveitando o `handleUpdate` que a Árvore já usava; `SectionContent`/`CardLayout`/`TabLayout`/`PanelLayout`/`FormView` passaram a repassar `onUpdate` até o Field. Escopo deliberadamente NÃO incluiu o `RowDetailModal` nem as células do `ArrayTable` (ideias registradas à parte, para não misturar duas mudanças de escopo diferentes no mesmo ASU) — `replace_file` usado (padrão já estabelecido para este arquivo, que segue mudando estruturalmente a cada sessão). Próximo passo ao retomar: aplicar `260707-asu0001.yaml`, testar os 3 layouts com edição de campo, depois atacar RowDetailModal/ArrayTable edição inline ou CSV Tab navigation.
