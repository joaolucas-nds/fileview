# IDEAS.md — Brainstorm e Visão

> Segundo cérebro do projeto. Captura tudo, mesmo solto ou no meio de outro assunto.
> **Nunca perde:** ideia implementada → Concluídas; descartada → Descartadas com motivo.

---

## 💡 Ideias Ativas — Usuário

### 2026-06 — CSV: mais prático, eficiente e intuitivo
A tabela atual funciona mas não é fluida como planilha real. Melhorias desejadas: Tab para mover entre células, seleção de múltiplas células, copiar/colar bloco de células, resize de colunas arrastando o header, freeze de linha de cabeçalho (já tem) e possível freeze da primeira coluna.

---

## 🤖 Ideias Ativas — Assistente

### 2026-06-28 — JSON formulário: edição inline dos campos
Os campos do FormView atualmente são read-only. Próximo passo natural: clicar num valor no card/tab/painel e editar inline (igual ao que a Árvore já faz com double-click). Salvar atualiza o JSON via `updateContent`.

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

- **Análise de viabilidade técnica e de mercado** — pesquisada em 2026-05. Ver HISTORICO.md.
- **MVP v0.1.0** — todos os viewers + editor MD WYSIWYG, 2026-06-05. Ver CHANGELOG.
- **FIX-001 (PDF Blob URL)** — ArrayBuffer detachado resolvido em 0.1.1.
- **FIX-002 (CSV edição com filtro)** — `__dataIdx` + edita no `data` original, 0.1.1.
- **Botão cancelar edição CSV** — botão ✕ com `onMouseDown + preventDefault`, 0.1.1.
- **Botão "✕ limpar" no filtro CSV** — 0.1.1.
- **GitHub Pages fix** — `base: './'` em vite.config.js + GitHub Actions deploy, 0.1.1/0.1.2.
- **JSON modo formulário/cards** — FormView com Cards, Tabs e Painel; arrays → tabela automática, 0.1.2.

---

## 🚫 Descartadas

- **Editar conteúdo de PDF** — impossível no browser sem engine proprietária paga. Ver DEC-004.
- **react-json-view** — sem manutenção desde 2021, incompatível com React 18. Ver DEC-003.
- **TypeScript imediato** — aumentaria fricção no estágio atual; revisitar na F3.
