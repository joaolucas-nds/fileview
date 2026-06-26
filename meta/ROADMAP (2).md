# ROADMAP.md — Plano Intencional de Evolução

> Médio e longo prazo vivem AQUI, não no STATUS.
> Estado: 🟢 concluída · 🟡 em curso/próxima · 🔵 futura · 🚫 descartada

---

## 🟢 F1 — MVP Viewers *(concluída — 2026-06-05)*
**Objetivo:** Ter pelo menos um viewer funcional para cada formato prioritário, rodando localmente.
**Critério de conclusão:** Conseguir abrir e visualizar MD, JSON, CSV e PDF sem erros críticos. Build passando.
- MD: preview (marked), WYSIWYG (Tiptap), fonte (textarea)
- JSON: árvore interativa com edição inline
- CSV: tabela com sort, filter, edit, add/delete row
- PDF: visualização por canvas (pdfjs-dist)
- Sidebar, tabs, drop global, modos por arquivo

---

## 🟡 F2 — Estabilidade + UX *(em curso)*
**Objetivo:** Corrigir todos os bugs conhecidos e tornar cada viewer mais polido para uso diário.
**Critério de conclusão:** Zero bugs em abertura/edição básica; UX adequada para uso real.
- [x] FIX-001: PDF Blob URL (AppContext + PdfViewer)
- [x] FIX-002: CSV editar via `__dataIdx` original
- [x] CSV: botão ✕ cancelar edição + botão limpar filtro
- [x] GitHub Pages: `base: './'` em vite.config.js (DEC-007)
- [ ] JSON: modo formulário/cards — chave de 1º nível → seção; array → tabela inline
- [ ] JSON: Table View automático para arrays de objetos uniformes
- [ ] CSV: Tab navigation entre células (confirm + mover)
- [ ] Busca Ctrl+F no SourceEditor (highlight de ocorrências)
- [ ] Tooltips customizados na toolbar do MD editor

---

## 🔵 F3 — Novos Formatos *(futuro, sem data)*
**Objetivo:** Expandir cobertura de formatos além dos originais.
- [ ] `.xlsx` via SheetJS (múltiplas sheets, leitura + escrita)
- [ ] `.docx` visualização via mammoth.js (read-only)
- [ ] PDF: anotações overlay (highlight, notas) via pdf-lib
- [ ] Tema dark/light alternável (CSS vars já prontas)

---

## 🔵 F4 — Desktop App *(futuro, sem data)*
**Objetivo:** Versão instalável com integração nativa do SO.
- [ ] Empacotamento Electron ou Tauri
- [ ] Abrir arquivos diretamente pelo sistema
- [ ] Associar extensões no SO
- [ ] Salvar no disco diretamente
- [ ] Histórico de arquivos recentes persistente

---

## 🚫 Itens descartados desta visão
- **Editar conteúdo de PDF** — impossível no browser sem SDK pago. Ver DEC-004.
- **Colaboração em tempo real** — fora do escopo; ferramenta local/individual.
- **Backend/servidor** — 100% client-side por decisão. Ver DEC-001.
