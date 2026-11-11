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
- **Sistema de documentação (meta/) — modo Code desde 2026-11-10 (DEC-011):** CEREBRO.md (base KCM v1.135.0) + 10 docs + `SPEC.md` + `workorders/` + logs; `CLAUDE.md`, `.claude/` (skills `/apply-wo`, `/wrap`, `/sondar`) e `INSTRUCOES-DO-PROJETO.md` na raiz. ASU desligado.

## 🔧 Em Progresso
- Nada em andamento no produto. A conversa de 2026-11-10 foi de processo: merge do KCM v1.135.0 e migração ASU → Code (esta wo0001 é o registro).

## ❌ Quebrado / Com Problema
- **Abas compartilham a posição de rolagem** `[relatado pelo dono, 2026-11-10]` — com 2 arquivos abertos, rolar um deles faz o outro abrir já rolado (no fim). Causa não investigada; suspeita a confirmar lendo o código: o container de rolagem do viewer é o mesmo elemento para todas as abas e não guarda posição por arquivo.

## 📋 Backlog (curto prazo — itens acionáveis)
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.
- [ ] **Testar no navegador (nunca confirmado):** CSV — Tab/Shift+Tab (bordas, com filtro e ordenação ativos); JSON Formulário — edição inline em `Field`, células do `ArrayTable` e `RowDetailModal` (string, number, boolean, null, texto longo; sensação dos 220 ms do DEC-010). **Suspeita a confirmar:** número digitado inválido vira `NaN` em `parseEditedValue` e `JSON.stringify` grava `null`; `null` editado volta sempre `null`; boolean ≠ `"true"` vira `false` (ver IDEAS).
- [ ] **Atualizar o `README.md` e decidir a versão do `package.json`** — README sem o modo Formulário, edição inline e Tab do CSV; `package.json` ainda em `0.1.0` (CHANGELOG está em 0.1.6). Decidir se a versão do package acompanha o CHANGELOG.

## 💬 Última conversa
**2026-11-10 (chat, com a pasta vinculada)** — Só processo, **nenhum código do produto alterado**. Merge do KCM v1.135.0 + migração ASU → modo Code (DEC-011): `CLAUDE.md`, `.claude/`, `INSTRUCOES-DO-PROJETO.md` (commit `6925a88`); CEREBRO/CONTEXT/GLOSSARY/LOG-TEMPLATE/.gitignore/.flatdropignore reescritos pelo chat e versionados por esta wo0001; `meta/ASU/` fora do repo. Resolvidos de passagem: `f626337` era só docs (`git show --stat`), `HISTORICO.md` já tinha saído, `PROJECT_INSTRUCTIONS.md` virou `INSTRUCOES-DO-PROJETO.md`. Próximo passo: escolher a frente de produto — o bug do scroll por aba (Quebrado) é candidato. Detalhe em `logs/2026-11-10.md`.
