# GLOSSARY.md — Termos do Projeto FileView

> Termos próprios que o assistente reexplicaria a cada sessão sem este arquivo.
> Só o que não é óbvio para alguém de fora.

---

## Conceitos do projeto
- **Viewer** — componente React que exibe um arquivo em modo somente leitura (ex: `MarkdownViewer`, `PdfViewer`). Não chama `updateContent`.
- **Editor** — componente que permite modificar o conteúdo (ex: `MarkdownEditor`, `SourceEditor`). Chama `updateContent` no onChange/onUpdate.
- **Mode** — modo de exibição atual de um arquivo. Valores: `preview` (MD renderizado, read-only), `edit` (WYSIWYG Tiptap), `source` (textarea raw dark), `view` (padrão para JSON/CSV — árvore ou tabela), `form` (JSON — modo Formulário).
- **ActiveFile** — objeto derivado em AppContext: `files.find(f => f.id === activeId)`. É o arquivo atualmente em foco.
- **isDirty** — `true` quando `content !== originalContent`. Exibe o dot laranja na tab e na sidebar; habilita o botão "Salvar ↓".
- **Blob URL** — URL do tipo `blob:http://localhost:5173/...` criada com `URL.createObjectURL(blob)`. Armazena PDFs no estado React sem risco de ArrayBuffer detachment pelo worker do PDF.js. Deve ser revogada com `URL.revokeObjectURL` ao fechar o arquivo.
- **`__dataIdx`** — campo interno injetado em cada linha do array `filtered` no CsvViewer, que guarda o índice da linha no array `data` original. Garante que `commitEdit` opere sobre a linha correta mesmo com filtros/sort ativos.
- **FormView** — o modo Formulário do JsonViewer; converte o JSON num layout visual (Cards/Tabs/Painel) em vez de árvore de nós.
- **ArrayTable** — componente dentro do JsonViewer que renderiza um array de objetos como tabela HTML paginada, com truncamento e modal de detalhe (ver DEC-008).

## Arquiteturas / módulos
- **AppContext** — Context + Provider em `src/context/AppContext.jsx`. Contém todo o estado da aplicação. Viewers e editors não gerenciam estado de arquivo próprio — apenas estado de UI local (editCell, search, scale, etc.).
- **ViewerRouter** — `src/components/ViewerRouter.jsx`. Lê `activeFile.ext` + `activeMode` e monta o componente correto via `React.lazy + Suspense`.
- **tiptap-markdown** — Extensão community do Tiptap que adiciona serialização Markdown↔Tiptap bidirecional. Saída MD via `editor.storage.markdown.getMarkdown()`.
- **Design tokens** — variáveis CSS em `:root` em `App.css` (ex: `--accent`, `--border`, `--font-mono`). Usadas via `var(--token)` em todos os `style={{}}` inline dos componentes.
- **CEREBRO.md** — arquivo de instrução do assistente (regras de comportamento, ritual de início de sessão, gatilhos). Vive em `meta/`. Renomeado de CLAUDE.md em 2026-06-25.
- **GitHub Actions** — pipeline de CI/CD do GitHub que roda `.github/workflows/deploy.yml` a cada push na main. Faz o build do Vite e publica o `dist/` no GitHub Pages automaticamente, sem necessidade de build local ou push manual.

## Kit de Contexto e ASU (termos de processo, não do produto)
- **KCM** — "Kit de Contexto Universal" (ou nome equivalente usado pelo usuário) — o conjunto de templates que originou `CEREBRO.md` e os demais arquivos de `meta/`. Evolui com o tempo; quando atualizado, os arquivos `*__template-update.md`/`.txt` são trazidos ao Projeto para comparação e adoção (ver DEC-009).
- **template-update** — sufixo usado nos arquivos que representam a versão NOVA de um template do KCM, trazida para comparação com a versão em uso no projeto. Não são para uso direto — servem de referência para mesclar mudanças.
- **ASU** — "Atualizador Automático de Scripts". Ferramenta separada do KCM que aplica modificações em arquivos de um projeto a partir de uma instrução YAML validada contra schema, com backup e rollback automático. Documentada em `meta/INSTRUCTION_GUIDE.md`. Usada para TODAS as mudanças de código deste projeto desde 2026-06-27.
- **Instrução ASU** — o arquivo `.yaml` que descreve as modificações a aplicar. Convenção de nome deste projeto: `AAAA-MM-DD_NNN_descricao.yaml` (ver DEC-009 — desvio deliberado do padrão sugerido pelo kit).
- **`replace_file`** — estratégia do ASU que substitui um arquivo inteiro (usada nos 3 ASUs deste projeto até agora, já que `JsonViewer.jsx` mudou estruturalmente a cada vez — ver "Feedback para o ASU" em IDEAS.md).
- **Doc rolante** — categoria de documento (STATUS, CHANGELOG, IDEAS, HISTORY) que é sempre entregue como arquivo inteiro, nunca como patch ASU, porque a edição neles é holística (mover item resolvido, reclassificar, checar que nada se perdeu).

## Comandos
- `npm run dev` — servidor de desenvolvimento em `http://localhost:5173`
- `npm run build` — bundle otimizado em `dist/` (para deploy)
- `npm run preview` — serve o build localmente antes de deploy
- `npm install --legacy-peer-deps` — se houver conflito de peer deps entre pacotes Tiptap
- `python -m src apply <arquivo>.yaml --root <RAIZ> --dry-run` — aplica uma instrução ASU em modo de revisão (sem gravar)
- `python -m src apply <arquivo>.yaml --root <RAIZ>` — aplica a instrução ASU de verdade
- `python -m src rollback <TIMESTAMP> --root <RAIZ>` — desfaz a última aplicação ASU

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
- **DEC-N** — decisão de arquitetura em DECISIONS.md (DEC-007 = GitHub Pages + Actions, DEC-008 = UX de tabelas grandes, DEC-009 = adoção da atualização do KCM)
- **F1, F2…** — fases do ROADMAP
