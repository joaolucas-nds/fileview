# IDEAS.md — Brainstorm e Visão

> Segundo cérebro do projeto. Captura tudo, mesmo solto ou no meio de outro assunto.
> **Nunca perde:** ideia implementada → Concluídas; descartada → Descartadas com motivo.

---

## 💡 Ideias Ativas — Usuário

### 2026-06 — CSV: mais prático, eficiente e intuitivo
A tabela atual funciona mas não é fluida como planilha real. Melhorias desejadas: Tab para mover entre células, seleção de múltiplas células, copiar/colar bloco de células, resize de colunas arrastando o header, freeze de linha de cabeçalho (já tem) e possível freeze da primeira coluna.

---

## 🤖 Ideias Ativas — Assistente

### 2026-07-01 — ArrayTable: seletor de colunas visíveis
Para tabelas com muitas colunas (10+), permitir esconder/mostrar colunas via um menu "Colunas" — padrão usado por Airtable e Notion database view. Reduz a necessidade de scroll horizontal quando nem todas as colunas importam para a inspeção atual. Ficou de fora do DEC-008 por ser escopo maior; registrar aqui para retomar se o caso de uso aparecer de novo.

### 2026-07-01 — RowDetailModal: edição inline
Hoje o modal de registro completo (ArrayTable) é read-only. Com a edição inline dos campos do FormView já implementada em 2026-07-07 (ver Concluídas), este é o próximo passo natural: estender o mesmo padrão (double-click + Enter/Esc) para dentro do modal — precisa resolver o `path` até o campo dentro do array (índice original da linha + nome da coluna), diferente do path do Field solto.

### 2026-07-07 — ArrayTable: edição inline nas células
Ficou de fora da sessão de edição inline do FormView (2026-07-07) por ser escopo maior: cada célula precisa saber o índice ORIGINAL da linha no array (não a posição pós-paginação/filtro — mesma classe de cuidado do FIX-002 no CSV) para montar o `path` correto. Registrar aqui para atacar junto com o RowDetailModal, já que os dois mexem na mesma estrutura de dados (linha de um array de objetos).

### 2026-06-05 — JSON: botão "copiar caminho" por nó
Em cada nó da árvore, um botão que copia o caminho completo (ex: `users[0].address.city`) para o clipboard. Útil ao trabalhar com APIs ou escrever queries JSONPath.

### 2026-06-05 — CSV: Tab navigation entre células
Pressionar Tab enquanto edita confirma e move para a próxima coluna (ou primeira coluna da próxima linha). Shift+Tab volta. Comportamento idêntico ao Excel/Google Sheets.

### 2026-06-05 — Busca Ctrl+F dentro do documento
Para SourceEditor e MarkdownViewer: campo de busca flutuante que destaca ocorrências e permite navegar (↑↓). Para JSON, busca por chave ou valor na árvore ou nos campos do formulário.

### 2026-06-05 — Suporte a .xlsx via SheetJS
SheetJS é a biblioteca padrão para Excel no browser. XlsxViewer similar ao CsvViewer com suporte a múltiplas abas.

### 2026-06-05 — PDF: anotações overlay
`pdf-lib` permite adicionar texto e formas sobre um PDF sem alterar o conteúdo original. Não quebra DEC-004.

### 2026-06-05 — Tema escuro/claro alternável
Sidebar já é dark; conteúdo é light. Toggle para tema completamente dark persistindo em localStorage. CSS vars já centralizadas — é só toggle de classe no `<html>`.

### 2026-06-05 — Versão desktop com Electron ou Tauri
Abrir arquivos diretamente do sistema sem drag-and-drop, associar extensões no SO, salvar direto no disco.

### 2026-06-05 — Tooltips customizados na toolbar do MD editor
O `title` HTML já existe em todos os botões. Tooltips visuais com delay melhorariam a UX para novos usuários.

---

## ✅ Concluídas

- **Análise de viabilidade técnica e de mercado** — pesquisada em 2026-05. Ver HISTORY.md.
- **MVP v0.1.0** — todos os viewers + editor MD WYSIWYG, 2026-06-05. Ver CHANGELOG.
- **FIX-001 (PDF Blob URL)** — ArrayBuffer detachado resolvido em 0.1.1.
- **FIX-002 (CSV edição com filtro)** — `__dataIdx` + edita no `data` original, 0.1.1.
- **Botão cancelar edição CSV** — botão ✕ com `onMouseDown + preventDefault`, 0.1.1.
- **Botão "✕ limpar" no filtro CSV** — 0.1.1.
- **GitHub Pages fix** — `base: './'` em vite.config.js + GitHub Actions deploy, 0.1.1/0.1.2.
- **JSON modo formulário/cards** — FormView com Cards, Tabs e Painel; arrays → tabela automática, 0.1.2.
- **JSON Formulário: UX de tabelas grandes** — truncamento com ellipsis, paginação, modal de registro completo, cards de tabela em largura total. Ver DEC-008. 0.1.3.
- **Adoção da atualização do KCM (2026-07-03)** — CEREBRO.md e Instruções do Projeto mesclados com o template novo. Ver DEC-009.
- **JSON formulário: edição inline dos campos** — `Field` (Cards/Tabs/Painel) editável via duplo clique, reaproveitando `handleUpdate` da Árvore. 2026-07-07. Ver STATUS/CHANGELOG 0.1.4.
- **Nomenclatura de ASU migrada para o padrão do kit** (`AAMMDD-asuNNNN.yaml`) — pendência do DEC-009 resolvida em 2026-07-07.

---

## 🚫 Descartadas

- **Editar conteúdo de PDF** — impossível no browser sem engine proprietária paga. Ver DEC-004.
- **react-json-view** — sem manutenção desde 2021, incompatível com React 18. Ver DEC-003.
- **TypeScript imediato** — aumentaria fricção no estágio atual; revisitar na F3.
- **Virtualização de linhas (react-window) no ArrayTable** — complexidade desnecessária para o volume atual de dados (centenas de linhas); paginação simples resolve. Ver DEC-008. Revisitar se algum JSON real chegar a dezenas de milhares de itens.

---

## 📣 Feedback para o Kit

> Observações sobre o Kit de Contexto Universal (KCM) em si — material para evoluir o kit, não o Fileview.

- **2026-07-03 — Auto-criação de arquivo de nicho:** a versão antiga do CEREBRO.md ("se um arquivo referenciado ainda não existir, o assistente o CRIA") era mais simples de aplicar do que a nova distinção "camada universal vs. nicho" — mas a nova é mais correta para projetos que não usam CHANGELOG/ROADMAP. Sem atrito para o Fileview (usamos todos os arquivos), só um registro de que a mudança faz sentido.
- **2026-07-03 — Seção "Recomendação de configuração" é um bom acréscimo** — faltava uma diretriz explícita para isso; antes ficava a critério de cada conversa perguntar ou não. Ponto forte do template novo.
- **2026-07-03 — Nomenclatura ASU sugerida pelo kit (`AAMMDD-asuNNNN.yaml`) é mais compacta, mas perde a descrição no nome do arquivo** — para um projeto com múltiplos ASUs ao longo de semanas, ter a descrição no nome (`..._json-table-ux.yaml`) é bem mais útil para auditar de relance do que abrir cada arquivo ou manter um índice à parte. Sugestão para o kit: considerar o formato com descrição como alternativa válida, não só o compacto — ou ao menos mencionar explicitamente que é customizável por projeto (o texto atual soa como um padrão fixo).
- **2026-07-07 — Migração efetiva para o padrão do kit, com o trade-off aceito conscientemente** — depois de usar a convenção própria em 3 ASUs, o usuário decidiu migrar para `AAMMDD-asuNNNN.yaml` mesmo assim. O ponto acima (perda de auditabilidade por nome) segue válido como observação para o kit, mas na prática deste projeto o usuário priorizou aderência ao padrão do kit sobre a vantagem de auditoria — registrado para reforçar que a crítica de 2026-07-03 é uma preferência, não um bloqueio real à adoção do padrão compacto.

## 🔧 Feedback para o ASU

> Observações sobre a ferramenta ASU em si (o Atualizador Automático de Scripts) — separado do Kit de Contexto, é outra ferramenta.

- Nenhum problema ou limitação da ferramenta ASU em si foi encontrado até agora nas 3 instruções geradas (`2026-06-28_001_json-form-view.yaml`, `2026-07-01_001_json-table-ux.yaml`, mais uma anterior de atualização do Node no workflow). Todas usaram `replace_file` (reescrita completa do arquivo-alvo) em vez de patches cirúrgicos menores — isso funcionou bem porque o `JsonViewer.jsx` mudou estruturalmente demais para valer a pena um patch localizado a cada vez, mas é um padrão de uso a observar: se o arquivo continuar crescendo, `replace_file` vai ficar cada vez mais caro (todo o arquivo precisa ser reescrito por completo a cada ajuste pequeno). Considerar migrar para patches `replace_context_block` mais cirúrgicos assim que o `JsonViewer.jsx` estabilizar.
