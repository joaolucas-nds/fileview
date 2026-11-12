# STATUS.md — Estado Atual

> Arquivo **rolante**: descreve só o AGORA. Item resolvido SAI daqui.
> Médio e longo prazo ficam no ROADMAP.

---

## Versão Atual
**[0.1.8]** — 2026-11-11 — PDF no visualizador nativo do navegador (`<iframe>`), sem `pdfjs-dist` (DEC-012). Build verde; **conferido na tela pelo dono em 2026-11-12: 6/6 ok.**
**[0.1.7]** — 2026-11-11 — Abas: cada arquivo aberto tem rolagem e estado de UI próprios (FIX-003). **Conferido na tela pelo dono: 6/6 ok.**
**[0.1.6]** — 2026-07-07 — CSV: navegação por Tab entre células durante a edição. **Confirmado aplicado** (o `CsvViewer.jsx` do snapshot do Projeto de 2026-11-06 contém `commitValue`/`commitAndMove`, o handler de Tab e o rodapé novo). O commit posterior `f626337` ("correcao asu0003", 2026-07-24) não foi inspecionado — ver Backlog.
**[0.1.5]** — 2026-07-07 — JSON Formulário: edição inline no `RowDetailModal` e nas células do `ArrayTable`. **Confirmado aplicado** (conferido no disco: `JsonViewer.jsx` bate com o `260707-asu0002.yaml`).

## ✅ Funcionando
- **Markdown:** preview renderizado (igual ao Claude), editor WYSIWYG Tiptap completo (toolbar + BubbleMenu ao selecionar texto), modo fonte (textarea dark)
- **JSON — Árvore:** árvore recursiva colapsável, cores por tipo de dado, edição inline de valores folha (double-click + Enter/Esc), formatar/minificar
- **JSON — Formulário:** chaves de 1º nível viram cards/tabs/painel; arrays de objetos viram tabela paginada (20 linhas/página) com colunas truncadas (ellipsis); campos primitivos (Cards/Tabs/Painel) editáveis com duplo clique (Enter confirma, Esc cancela); **células do ArrayTable editáveis com duplo clique direto na tabela**; **clique numa linha abre o `RowDetailModal` com o registro completo, também editável (duplo clique num valor → textarea para string, input para number/boolean/null)** — path resolvido via índice ORIGINAL da linha no array, não a posição pós-paginação; sub-switcher `Cards | Tabs | Painel` persistido em localStorage; cards de tabela ocupam a largura total da grade
- **CSV:** tabela com cabeçalho fixo sticky, ordenação por coluna (asc/desc), filtro com botão "limpar", edição inline com botão ✕ cancelar (Enter confirma, Esc/✕ cancela), **Tab confirma e move para a próxima célula (Shift+Tab volta), seguindo a ordem visível — pula de coluna em coluna e, na borda, para a linha seguinte/anterior**, adicionar linha, deletar linha — edição opera sobre `data` original mesmo com filtro ativo
- **PDF:** visualizador nativo do navegador dentro da aba do FileView (`<iframe>` com a Blob URL, DEC-012) — zoom, Ctrl+roda, busca, seleção de texto, impressão e miniaturas vêm do navegador. Só leitura (DEC-004).
- **GitHub Pages:** deploy automático via GitHub Actions (`.github/workflows/deploy.yml`, Node 24) — build roda no servidor do GitHub, publica apenas o `dist/`. Confirmado funcionando em produção em `https://joaolucas-nds.github.io/fileview/`.
- **Sidebar:** lista de arquivos abertos, indicador de modificado (dot laranja), fechar por arquivo, drag-and-drop lateral
- **Tabs:** troca de arquivo ativo, fechar por tab, indicador de modificado (● laranja); cada aba com rolagem e estado de UI próprios desde 0.1.7 (voltar a uma aba reabre do topo — lembrar a posição está no IDEAS)
- **Multi-arquivo:** múltiplos arquivos abertos simultaneamente, modos independentes por arquivo
- **Drop global:** arrastar arquivo em qualquer parte da tela
- **Outros formatos:** .yaml, .yml, .xml, .svg, .txt, .env, .toml, .log abrem em SourceEditor (textarea dark editável)
- **Salvar:** botão "Salvar ↓" aparece quando `isDirty`; dispara download do arquivo
- **Sistema de documentação (meta/) — modo Code desde 2026-11-10 (DEC-011):** CEREBRO.md (base KCM v1.135.0) + 10 docs + `SPEC.md` + `workorders/` + logs; `CLAUDE.md`, `.claude/` (skills `/apply-wo`, `/wrap`, `/sondar`) e `INSTRUCOES-DO-PROJETO.md` na raiz. ASU desligado.

## 🔧 Em Progresso
- Nada em andamento no produto. **Volta atrás combinada:** se o visual nativo do PDF não agradar, a opção C (abrir o PDF numa aba nova do navegador) está registrada em IDEAS → Adiadas.

## ❌ Quebrado / Com Problema
- Nenhum bug conhecido no produto.

## 📋 Backlog (curto prazo — itens acionáveis)
- [ ] **Busca Ctrl+F no SourceEditor** — highlight de ocorrências no textarea.
- [ ] **Tooltips customizados** na toolbar do editor MD.
- [ ] **Testar no navegador (nunca confirmado):** CSV — Tab/Shift+Tab (bordas, com filtro e ordenação ativos); JSON Formulário — edição inline em `Field`, células do `ArrayTable` e `RowDetailModal` (string, number, boolean, null, texto longo; sensação dos 220 ms do DEC-010). **Suspeita a confirmar:** número digitado inválido vira `NaN` em `parseEditedValue` e `JSON.stringify` grava `null`; `null` editado volta sempre `null`; boolean ≠ `"true"` vira `false` (ver IDEAS).
- [ ] **Atualizar o `README.md` e decidir a versão do `package.json`** — README sem o modo Formulário, edição inline e Tab do CSV; `package.json` ainda em `0.1.0` (CHANGELOG está em 0.1.8). Decidir se a versão do package acompanha o CHANGELOG.

## 💬 Última conversa
**2026-11-11 (chat + Code, wo0003)** — DEC-012: PDF no visualizador nativo do navegador (`<iframe>`), `pdfjs-dist` removido (commit `3b9cea3`, empurrado), versão 0.1.8. Build verde; conferência na tela pendente (roteiro do dono). Detalhe em `logs/2026-11-11.md`.

**2026-11-11 (chat + Code, wo0002)** — FIX-003: `key={activeFile.id}` em `ViewerRouter.jsx` (commit `3d108e5`, empurrado), versão 0.1.7. Build verde; conferência na tela pendente (roteiro do dono). Voltar a uma aba reabre do topo; lembrar a posição virou ideia no IDEAS. Detalhe em `logs/2026-11-11.md`.

**2026-11-10 (anterior, chat)** — Só processo, **nenhum código do produto alterado**. Merge do KCM v1.135.0 + migração ASU → modo Code (DEC-011): `CLAUDE.md`, `.claude/`, `INSTRUCOES-DO-PROJETO.md` (commit `6925a88`); CEREBRO/CONTEXT/GLOSSARY/LOG-TEMPLATE/.gitignore/.flatdropignore reescritos pelo chat e versionados por esta wo0001; `meta/ASU/` fora do repo. Resolvidos de passagem: `f626337` era só docs (`git show --stat`), `HISTORICO.md` já tinha saído, `PROJECT_INSTRUCTIONS.md` virou `INSTRUCOES-DO-PROJETO.md`. Próximo passo: escolher a frente de produto — o bug do scroll por aba (Quebrado) é candidato. Detalhe em `logs/2026-11-10.md`.
