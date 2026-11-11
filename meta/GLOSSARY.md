# GLOSSARY.md — Termos do Projeto FileView

> Termos próprios que o assistente reexplicaria a cada conversa sem este arquivo.
> Só o que não é óbvio para alguém de fora.

> **Mudanças nesta revisão (2026-11-10, DEC-011):** a seção «Kit de Contexto e ASU» virou «Kit de Contexto e modo Code». Os quatro termos do ASU (ASU, Instrução ASU, `replace_file`, `replace_context_block`) e «Doc rolante» (regra que só existia por causa do ASU) foram condensados numa entrada histórica — o detalhe está em HISTORY.md §5. Saíram os três comandos `python -m src ...` do ASU. Entraram WO, `/apply-wo`, `/wrap`, `/sondar`, raia, relatório de trabalho e `INSTRUCOES-DO-PROJETO.md`.

---

## Conceitos do projeto
- **Viewer** — componente React que exibe um arquivo em modo somente leitura (ex: `MarkdownViewer`, `PdfViewer`). Não chama `updateContent`.
- **Editor** — componente que permite modificar o conteúdo (ex: `MarkdownEditor`, `SourceEditor`). Chama `updateContent` no onChange/onUpdate.
- **Mode** — modo de exibição atual de um arquivo. Valores: `preview` (MD renderizado, read-only), `edit` (WYSIWYG Tiptap), `source` (textarea raw dark), `view` (padrão para JSON/CSV — árvore ou tabela), `form` (JSON — modo Formulário).
- **ActiveFile** — objeto derivado em AppContext: `files.find(f => f.id === activeId)`. É o arquivo atualmente em foco.
- **isDirty** — `true` quando `content !== originalContent`. Exibe o dot laranja na tab e na sidebar; habilita o botão "Salvar ↓".
- **Blob URL** — URL do tipo `blob:http://localhost:5173/...` criada com `URL.createObjectURL(blob)`. É como o PDF fica no estado React (`content`) e o que o `<iframe>` do `PdfViewer` abre (DEC-012); nasceu para evitar o ArrayBuffer detachado pelo worker do PDF.js (FIX-001). Deve ser revogada com `URL.revokeObjectURL` ao fechar o arquivo.
- **`__dataIdx`** — campo interno injetado em cada linha do array `filtered` no CsvViewer, que guarda o índice da linha no array `data` original. Garante que `commitEdit` opere sobre a linha correta mesmo com filtros/sort ativos.
- **FormView** — o modo Formulário do JsonViewer; converte o JSON num layout visual (Cards/Tabs/Painel) em vez de árvore de nós.
- **ArrayTable** — componente dentro do JsonViewer que renderiza um array de objetos como tabela HTML paginada, com truncamento e modal de detalhe (ver DEC-008).
- **RowDetailModal** — overlay do `ArrayTable` com o registro completo (aberto por clique na linha, DEC-008). Editável desde 0.1.5: `<textarea>` para string, `<input>` para number/boolean/null (DEC-010).
- **`ROW_CLICK_DELAY`** — constante (220 ms) do `JsonViewer.jsx`: atraso do clique-na-linha antes de abrir o modal, para o duplo clique numa célula poder cancelar e editar (DEC-010). `scheduleOpenModal` agenda; `startCellEdit` cancela.
- **`commitValue` / `commitAndMove`** — funções do `CsvViewer.jsx` (0.1.6): `commitValue` só grava a célula no `data` original; `commitAndMove(forward)` grava e abre a próxima célula (Tab/Shift+Tab) percorrendo `filtered`, a ordem visível.

## Arquiteturas / módulos
- **AppContext** — Context + Provider em `src/context/AppContext.jsx`. Contém todo o estado da aplicação. Viewers e editors não gerenciam estado de arquivo próprio — apenas estado de UI local (editCell, search, scale, etc.).
- **ViewerRouter** — `src/components/ViewerRouter.jsx`. Lê `activeFile.ext` + `activeMode` e monta o componente correto via `React.lazy + Suspense`.
- **tiptap-markdown** — Extensão community do Tiptap que adiciona serialização Markdown↔Tiptap bidirecional. Saída MD via `editor.storage.markdown.getMarkdown()`.
- **Design tokens** — variáveis CSS em `:root` em `App.css` (ex: `--accent`, `--border`, `--font-mono`). Usadas via `var(--token)` em todos os `style={{}}` inline dos componentes.
- **CEREBRO.md** — arquivo de instrução do assistente (regras de comportamento, ritual de turno, gatilhos). Vive em `meta/`. Renomeado de CLAUDE.md em 2026-06-25.
- **GitHub Actions** — pipeline de CI/CD do GitHub que roda `.github/workflows/deploy.yml` a cada push na main. Faz o build do Vite e publica o `dist/` no GitHub Pages automaticamente, sem necessidade de build local ou push manual.

## Kit de Contexto e modo Code (termos de processo, não do produto)
- **KCM** — "Kit de Contexto Universal" — o conjunto de templates que originou `CEREBRO.md` e os demais arquivos de `meta/`. Evolui com o tempo; quando atualizado, chega à pasta-pai como `AAMMDD-kcm-update-vX.Y.Z/` (ver DEC-009 e DEC-011).
- **template-update** — sufixo usado nos arquivos que representam a versão NOVA de um template do KCM, trazida para comparação com a versão em uso no projeto. Não são para uso direto — servem de referência para mesclar mudanças. O `_UPDATE-MANIFEST.md` do pacote dá o destino real de cada um, as linhas revogadas e o carimbo de modos.
- **Raia** — quem faz o quê: **chat** (planejamento — autora docs de curadoria, análises e WOs) e **Claude Code** (execução — código, build, appends nos meta/, commit/push). A divisão de documentos está em DEC-011.
- **WO (work order)** — instrução de APLICAÇÃO escrita pelo chat em `meta/workorders/AAMMDD-woNNNN-desc.md` (âncora literal + texto exato); o Code só posiciona. Numeração sequencial global; modelo em `meta/workorders/_TEMPLATE.md`. Spec diz O QUE construir; WO diz COMO aplicar.
- **`/apply-wo` · `/wrap` · `/sondar`** — skills do Claude Code em `.claude/skills/`: aplicar uma WO (âncora exata ou PARA e reporta) · fechar a tarefa (append em STATUS/DECISIONS, log do dia, commit e push) · exploração sem hipótese prévia (devolve candidatos, nunca veredito).
- **Relatório de trabalho** — `../AAMMDD-HHMM-code-fileview-<ato>-<alvo>.txt`, na pasta-pai (fora do Git), que o Code grava ao fechar cada tarefa. `<ato>` ∈ apply · wrap · probe · explore.
- **`INSTRUCOES-DO-PROJETO.md`** — fonte das Instruções do Projeto, na raiz do repo; o painel do claude.ai é cópia colada à mão. Teto: 7.600 caracteres com o modo Code.
- **FlatDrop / `_MANIFEST_*.md` / `_TREE_*.md`** — ferramenta do usuário que achata o repositório para subir no Projeto do claude.ai e gera um manifesto e uma árvore. Desde 2026-11-10 é **canal de reserva** (o chat trabalha direto na pasta); o `.flatdropignore` deixa `logs/*` e as WOs de fora.
- **HANDOFF-BRIEF** — `AAMMDD-HANDOFF-BRIEF.md`: atalho de arranque para uma conversa nova, nunca versionado. Se divergir dos docs de `meta/`, valem os docs. Depois de absorvido, vai para `zz_notas-arquivadas/`.
- **ASU (histórico)** — "Atualizador Automático de Scripts": ferramenta de patches `.yaml` (`AAMMDD-asuNNNN.yaml`; estratégias `replace_file`, `replace_context_block`) usada em todas as mudanças de código de 2026-06-27 a 2026-11-07. **Desligada em 2026-11-10 (DEC-011).** Armadilhas e convenções: HISTORY.md §5.

## Comandos
- `npm run dev` — servidor de desenvolvimento em `http://localhost:5173`
- `npm run build` — bundle otimizado em `dist/` (para deploy)
- `npm run preview` — serve o build localmente antes de deploy
- `npm install --legacy-peer-deps` — se houver conflito de peer deps entre pacotes Tiptap
- `/apply-wo meta/workorders/<arquivo>.md` — no Claude Code: aplica uma WO
- `/wrap` — no Claude Code: fecha a tarefa (STATUS/DECISIONS, log, commit, push)

## Deploy no GitHub Pages (passo a passo)
1. Garantir que `vite.config.js` tem `base: './'`.
2. Adicionar `.github/workflows/deploy.yml` ao projeto.
3. No GitHub: **Settings → Pages → Source → selecionar "GitHub Actions"** (não branch).
4. Fazer push das mudanças para `main`.
5. Aguardar o Actions terminar (aba Actions no GitHub).
6. O app fica em `https://usuario.github.io/nome-do-repo/`.
7. **Se ficar em branco mesmo com o Actions verde:** o Pages pode ter travado numa versão de cache antiga. Alternar Settings → Pages → Source de "GitHub Actions" para "Deploy from a branch" e IMEDIATAMENTE de volta para "GitHub Actions" força um novo ciclo. Depois disparar `workflow_dispatch` manual na aba Actions.

## Identificadores
- **FIX-N** — bug grave registrado em DECISIONS.md (FIX-001 = PDF ArrayBuffer, FIX-002 = CSV filtered edit)
- **DEC-N** — decisão de arquitetura em DECISIONS.md (DEC-007 = GitHub Pages + Actions, DEC-008 = UX de tabelas grandes, DEC-009 = adoção da atualização do KCM + nomenclatura ASU, DEC-010 = debounce clique × duplo clique no ArrayTable, DEC-011 = migração ASU → modo Code)
- **woNNNN** — número sequencial global de WO em `meta/workorders/` (a primeira é `wo0001`, de 2026-11-10)
- **F1, F2…** — fases do ROADMAP
