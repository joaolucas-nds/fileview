# CONTEXT.md — FileView

> Arquivo **estável**. Lido no início de cada sessão para ambientar o assistente.
> Muda só em alteração estrutural (stack, arquitetura, nova armadilha descoberta).
> Esta revisão (2026-07-03) foi escrita com detalhe máximo propositalmente — é o handoff para uma conversa nova sem histórico.

---

## Visão Geral
FileView é um visualizador e editor de arquivos que roda **100% no browser, sem servidor** (SPA client-side puro). Resolve o problema de abrir arquivos de desenvolvimento (`.md`, `.json`, `.csv`, `.pdf`, configs) com uma experiência visual adequada — sem precisar do VS Code e sem ver sintaxe bruta. O Markdown renderiza como o Claude renderiza (bonito, com preview real); o JSON vira árvore interativa OU formulário visual (cards/tabs/painel); o CSV vira tabela editável tipo planilha; o PDF renderiza página a página com zoom e navegação.

O projeto nasceu de uma análise de viabilidade (2026-05, ver HISTORY.md seção 1) que constatou: não existe ferramenta gratuita e open-source que combine essas capacidades numa interface só com boa usabilidade. Cada peça (marked, Tiptap, pdfjs-dist, Papa Parse) já existe isoladamente e é madura; o valor do projeto é a integração + a UX.

## Stack Tecnológica

| Camada | Escolha | Versão | Por quê (ver DECISIONS.md para o raciocínio completo) |
|---|---|---|---|
| Linguagem | JavaScript (JSX) | — | Sem TypeScript por ora — DEC-001, revisitar na F3 |
| Framework | React | ^18.3.1 | — |
| Build tool | Vite | ^5.4.10 (dev) / v5.4.21 (build no CI) | Dev server instantâneo, lazy loading nativo — DEC-001 |
| Editor WYSIWYG | Tiptap v2 + extensões | ^2.10.3 | Engine ProseMirror, mesmo stack do Notion/Linear — DEC-002 |
| Serialização MD↔Tiptap | `tiptap-markdown` | ^0.8.10 | Extensão community, cobre o caso sem custo — DEC-002 |
| Renderização MD (view-only) | `marked` | ^13.0.3 | GFM ativado |
| PDF | `pdfjs-dist` | ^4.7.76 | Mozilla, usado no Firefox, 4M downloads/semana — só leitura, DEC-004 |
| CSV | `papaparse` | ^5.4.1 | Parser mais robusto do JS, zero dependências |
| Syntax highlight | `lowlight` | (via Tiptap) | Dentro dos code blocks do editor MD |
| Ícones | `lucide-react` | ^0.462.0 **fixado** | Versões novas renomeiam ícones — armadilha #4 |
| Fontes | Outfit (UI) + Space Mono (código) | via Google Fonts | — |
| Deploy | GitHub Pages via GitHub Actions | Node 24 no runner | `npm run build` → `dist/` → Actions publica — DEC-007 |

`devDependencies`: `@vitejs/plugin-react` ^4.3.1, `vite` ^5.4.10.

## Estrutura do Projeto (árvore real e completa)

```
fileview/
├── package.json
├── package-lock.json
├── vite.config.js              # base: './' obrigatório para GitHub Pages — DEC-007
├── index.html                  # <div id="root"> + <script src="/src/main.jsx">
├── README.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: npm ci && npm run build → dist/ → Pages. Node 24.
├── meta/                       # documentação de contexto — sobe INTEIRA no conhecimento do Projeto Claude
│   ├── CEREBRO.md               # regras de comportamento do assistente (fonte da verdade; Instruções do Projeto são a versão curta)
│   ├── CONTEXT.md                # este arquivo
│   ├── STATUS.md                  # estado atual (rolante)
│   ├── DECISIONS.md                # decisões (DEC) e bugs graves (FIX)
│   ├── CHANGELOG.md                 # histórico de versões (SemVer)
│   ├── IDEAS.md                       # segundo cérebro
│   ├── ROADMAP.md                     # plano por fases
│   ├── GLOSSARY.md                     # termos do projeto
│   ├── HISTORY.md                       # conhecimento consolidado — renomeado de HISTORICO.md em 2026-07-03
│   ├── LOG-TEMPLATE.md                  # molde do log de sessão (referência fixa)
│   ├── INSTRUCTION_GUIDE.md              # guia COMPLETO do formato ASU — não é doc do kit, é do ASU
│   ├── PROMPT_IA.md                       # bloco resumido de instrução do ASU para colar em outros projetos
│   └── demo.yaml                          # exemplo executável do ASU (examples/demo_project fictício, não faz parte do Fileview)
├── logs/                        # logs de sessão — vivem no Git, NÃO sobem no conhecimento do Projeto (lidos sob demanda)
│   ├── 2026-06-05.md
│   ├── 2026-06-25.md
│   ├── 2026-06-28.md
│   ├── 2026-07-01.md
│   └── 2026-07-03.md             # esta sessão
└── src/
    ├── main.jsx                   # ReactDOM.createRoot + <App/> dentro de <React.StrictMode>
    ├── App.jsx                     # layout: <Sidebar/> + tab bar + mode switcher + <ViewerRouter/>; define mdModes/structModes/csvModes/jsonModes
    ├── App.css                      # TODOS os design tokens (CSS vars) + .md-output + .tiptap-editor; nada de CSS Modules
    ├── context/
    │   └── AppContext.jsx             # PEÇA CRÍTICA — única fonte de verdade do estado (ver seção dedicada abaixo)
    ├── components/
    │   ├── Sidebar.jsx                  # lista de arquivos abertos, botão abrir, drop hint lateral, indicador dirty
    │   ├── DropZone.jsx                  # tela de boas-vindas quando nenhum arquivo está aberto (drag-and-drop + click)
    │   └── ViewerRouter.jsx               # decide viewer/editor por `ext` + `mode`, via React.lazy + Suspense
    ├── viewers/
    │   ├── MarkdownViewer.jsx              # marked → dangerouslySetInnerHTML numa div .md-output; read-only
    │   ├── JsonViewer.jsx                    # O ARQUIVO MAIS COMPLEXO do projeto — árvore + FormView completo (ver seção dedicada)
    │   ├── CsvViewer.jsx                       # tabela Papa Parse: sort, filter, edit inline (__dataIdx), add/delete row, botão cancelar
    │   └── PdfViewer.jsx                         # canvas + pdfjs-dist; navegação, zoom; recebe Blob URL (nunca ArrayBuffer)
    └── editors/
        ├── MarkdownEditor.jsx                    # Tiptap WYSIWYG completo: toolbar + BubbleMenu flutuante
        └── SourceEditor.jsx                        # textarea dark monospace; usado como "Fonte"/"Texto" para todo formato de texto
```

## Como o AppContext funciona (CRÍTICO — não mexer sem ler isto inteiro)

`AppContext.jsx` é a **única fonte de verdade**. Nenhum viewer/editor guarda estado de arquivo — só estado de UI local (ex: `editCell`, `search`, `scale`, `page`, `selectedRow`).

**Estado (via `useState` dentro do `AppProvider`):**
- `files` — array de objetos `{ id, name, ext, content, originalContent, isDirty, size }`.
  - `id` = `` `${file.name}-${Date.now()}` `` — string única por sessão de abertura.
  - `ext` = extensão em minúsculo, sem o ponto (`"json"`, `"md"`, etc.), extraída de `file.name.split('.').pop().toLowerCase()`.
  - `content` — **para a maioria dos formatos é uma STRING de texto** (lida via `file.text()`). **Para PDF é uma BLOB URL** (string tipo `blob:http://localhost:5173/uuid`), NUNCA um ArrayBuffer — ver armadilha #1 / FIX-001 abaixo, é o bug mais caro do projeto até agora.
  - `originalContent` — snapshot do `content` no momento da abertura; comparado com `content` atual para calcular `isDirty`.
  - `isDirty` — `content !== originalContent`. Controla o dot laranja na Sidebar/tab e a visibilidade do botão "Salvar ↓".
  - `size` — `file.size` em bytes, só para exibição (`fmt()` na Sidebar formata como B/KB/MB).
- `activeId` — string do `id` do arquivo atualmente em foco (ou `null` se nenhum arquivo aberto).
- `modes` — objeto `Record<id, 'preview'|'edit'|'source'|'view'|'form'>`. Um modo por arquivo, independente — trocar de arquivo preserva o modo de cada um (DEC-006).

**Funções expostas via Context (todas memoizadas com `useCallback`):**
- `openFile(file: File)` — assíncrona. Detecta duplicata por `name` (se já aberto, só troca `activeId`, não duplica). Para `.pdf`: `file.arrayBuffer()` → `new Blob([buf], {type:'application/pdf'})` → `URL.createObjectURL(blob)` vira `content`. Para tudo mais: `file.text()`. Cria o objeto, adiciona a `files`, seta `activeId`, e define o modo inicial em `modes` (`'preview'` se `.md`, senão `'view'`).
- `closeFile(id)` — remove o arquivo do array. **Se for PDF, chama `URL.revokeObjectURL(content)` antes** — senão a Blob URL vaza memória permanentemente (o browser nunca libera sozinho). Reatribui `activeId` para o vizinho (arquivo anterior no array, ou o primeiro se era o primeiro).
- `updateContent(id, newContent)` — usado por TODOS os editors/viewers editáveis. Atualiza `content` e recalcula `isDirty` na mesma chamada.
- `saveFile(id)` — cria um `Blob` do `content` atual, gera URL temporária, dispara `<a download>` clicado via JS, revoga a URL, e marca `isDirty: false` + `originalContent: content` (o arquivo "salvo" vira o novo baseline). PDFs não têm save (são read-only, DEC-004) — a função retorna cedo se `file.ext === 'pdf'`.
- `setMode(id, mode)` — troca o modo de exibição de um arquivo específico.
- `setActiveId(id)` — usado pela Sidebar (clique num item) e pelas tabs (clique numa aba) para focar outro arquivo.

**`ViewerRouter.jsx`** lê `activeFile.ext` + `activeMode` e decide qual componente lazy-carregar:
```
.md    → preview:MarkdownViewer | edit:MarkdownEditor | source:SourceEditor
.pdf   → sempre PdfViewer (não tem modo — só um componente)
.csv   → source:SourceEditor | (padrão) view:CsvViewer
.json/.yaml/.yml/.xml/.toml/.env → source:SourceEditor | (padrão) view:JsonViewer
  (dentro do JsonViewer, o PRÓPRIO componente decide Árvore vs Formulário via `activeMode === 'form'`)
outros (.txt/.svg/.log/etc.) → sempre SourceEditor
```

## Como o JsonViewer funciona (CRÍTICO — arquivo mais complexo do projeto)

`src/viewers/JsonViewer.jsx` tem DOIS modos completamente diferentes, escolhidos por `activeMode`:

### Modo Árvore (`activeMode === 'view'`, comportamento original desde a F1)
- `JsonNode` — componente recursivo. Cada objeto/array vira um nó colapsável (▾/▸ ao clicar no header), cada folha (string/number/boolean/null) é colorida por tipo via `TYPE_COLOR` e editável com **duplo clique** → vira um `<input>` → `Enter` confirma (`commitEdit`) ou `Escape` cancela.
- `handleUpdate(path, newVal)` no componente pai: recebe um `path` tipo `"users.0.address.city"`, faz `path.split('.')`, navega o objeto parseado até o penúltimo segmento, atribui o valor no último, e chama `updateContent` com `JSON.stringify(obj, null, 2)`.
- Toolbar tem botões **Formatar** (prettify com indent 2) e **Minificar** (sem espaços).
- Profundidade > 2 já nasce colapsada (`depth > 2` no `useState` inicial de `collapsed`) — evita árvores gigantes abrindo tudo de uma vez.

### Modo Formulário (`activeMode === 'form'`, adicionado em 0.1.2, refinado em 0.1.3)
Transforma o JSON num formulário visual. Pipeline:
1. `parseSections(data)` — pega as chaves de 1º nível do objeto/array raiz e vira uma lista de `{ key, value, type }`.
2. Para cada seção, `SectionContent` decide a renderização:
   - `type === 'object'` → grid de `Field` (label + valor colorido, `repeat(auto-fill, minmax(140px,1fr))`).
   - `type === 'array'` E `isArrayOfObjects(value)` (todo elemento é objeto não-array) → `ArrayTable` (ver abaixo).
   - `type === 'array'` de primitivos → `PrimitiveList` (chips).
   - primitivo solto → `Field` único.
3. Três layouts alternativos para exibir as seções, trocáveis via sub-switcher `Layout: Cards | Tabs | Painel` (persistido em `localStorage['fv-json-layout']`):
   - **`CardLayout`** — grid responsivo (`minmax(260px,1fr)`). Seções que são `ArrayTable` (arrays de objetos) recebem `gridColumn: '1 / -1'` — ocupam a linha inteira da grade em vez de ficar espremidas num card estreito (era o bug reportado em 2026-07-01: tabela de 10 colunas num card de 260px parecia vazia).
   - **`TabLayout`** — uma aba por chave de 1º nível.
   - **`PanelLayout`** — navegação lateral (148px) + conteúdo à direita.
4. **`ArrayTable`** (o componente mais delicado): renderiza um array de objetos como tabela HTML.
   - `arrayKeys(arr)` — faz a união de todas as chaves presentes em qualquer objeto do array (schema pode variar entre itens).
   - `table-layout: fixed` + cada `<th>`/`<td>` com `width: 170px` (no header) + `overflow:hidden; textOverflow:ellipsis; whiteSpace:nowrap` — **isso é obrigatório**: sem `table-layout: fixed`, o `text-overflow: ellipsis` simplesmente não funciona (o browser expande a coluna para caber o conteúdo). Ver DEC-008.
   - Tooltip nativo via atributo `title` em cada célula/header — mostra o valor completo (ou a chave completa) no hover, sem precisar de biblioteca.
   - **Paginação client-side**: `ROWS_PER_PAGE = 20`. Só mostra os controles ◀/▶ se `value.length > ROWS_PER_PAGE`. `useEffect(() => setPage(0), [value])` reseta a página ao trocar de arquivo/array.
   - **Clique numa linha** → abre `RowDetailModal` com o registro completo, campo por campo, sem truncamento (`white-space: pre-wrap`), objetos aninhados via `JSON.stringify(v, null, 2)`. Filtra a chave interna `__dataIdx` se presente (herdada de outro contexto — na prática o JSON não injeta isso, é defensivo).
   - Esse trio truncamento+paginação+modal é o padrão usado por Airtable/Notion database view/AG Grid — pesquisado e documentado em DEC-008 antes de implementar (princípio #7 do CEREBRO).

## Como o CsvViewer funciona

- `Papa.parse(content, { header: true, skipEmptyLines: true })` → `{ data, headers }`.
- `filtered` é um `useMemo` que **injeta `__dataIdx`** (o índice da linha no `data` original) em cada linha antes de filtrar/ordenar. Isso é o que resolve o FIX-002: editar uma célula enquanto o filtro está ativo precisa saber qual linha do array ORIGINAL corrigir, não a posição visível pós-filtro.
- Edição: duplo clique numa célula → `startEdit(dataIdx, colIdx, val)` → mostra `<input>` + botão `✕` visível ao lado (não só ícone escondido). `commitEdit()` reconstrói `data` inteiro via `.map` trocando só a linha de `dataIdx`, chama `Papa.unparse` e `updateContent`. `cancelEdit()` só fecha o input sem salvar.
- **Armadilha #5 aplicada aqui**: o botão cancelar usa `onMouseDown={e => { e.preventDefault(); cancelEdit() }}` em vez de `onClick` — porque `onBlur` do input dispara ANTES de qualquer `onClick` de um elemento vizinho, então um botão cancelar com `onClick` normal NUNCA seria alcançado (o `onBlur` já teria comitado a edição). `preventDefault()` no `mousedown` impede o input de perder o foco a tempo do `onBlur` disparar.
- Botão "✕ limpar" ao lado do campo de busca limpa o filtro com um clique.

## Como o MarkdownEditor funciona

- Tiptap `useEditor` com uma lista extensa de extensões: `StarterKit` (com **`codeBlock: false` obrigatório** — armadilha #3), `Markdown` (serialização), `Underline`, `Table`+`TableRow`+`TableCell`+`TableHeader`, `TextAlign`, `Highlight`, `Typography`, `Placeholder`, `TextStyle`+`Color`, `CodeBlockLowlight` (com `lowlight` configurado via `createLowlight(common)`).
- `onUpdate` chama `editor.storage.markdown.getMarkdown()` e passa pro `updateContent`.
- Ao trocar de `activeFile.id` (outro arquivo), um `useEffect` compara o markdown atual do editor com `activeFile.content`; se diferente, chama `editor.commands.setContent(...)` — evita re-setar conteúdo desnecessariamente (que resetaria o cursor/histórico de undo).
- `BubbleMenu` aparece ao selecionar texto, com botões rápidos (B/I/U/S/highlight) estilizados como popup escuro flutuante.
- Toolbar completa: seletor de heading (Parágrafo/H1-H4), negrito/itálico/sublinhado/tachado/highlight/código inline, transformação de caso (MAIÚSCULO/minúsculo via `textBetween` + `insertContentAt`), alinhamento, listas (marcadores/numerada/tarefas), blockquote, code block, linha horizontal, tabela (inserir 3×3 + add col/linha + deletar, condicionais a `editor.isActive('table')`), color picker nativo (`<input type=color>`), desfazer/refazer.

## Convenções de Código
- Nomes de arquivos, funções e variáveis em **inglês**; comentários em **PT-BR**.
- Commits em PT-BR, imperativo curto, sem acentos quando destinados ao CMD do Windows (acentos corrompem no `git commit -m` do CMD).
- Estilo: **zero CSS Modules** — tudo em CSS vars globais (`App.css`, seção `:root`) ou `style={{}}` inline. Isso é deliberado, não preguiça — mantém os componentes autocontidos e fáceis de copiar/mover.
- TypeScript: não usado; reconsiderar na F3 (DEC-001).

## Armadilhas Conhecidas (as 6 que já morderam)

1. **PDF — ArrayBuffer detachado pelo worker.** PDF.js v4 faz `postMessage` com `transfer` do ArrayBuffer para o worker thread — isso **detacha permanentemente** o buffer do main thread. Se `content` fosse um ArrayBuffer guardado em estado React, reabrir o mesmo arquivo (ou remontar o componente) causaria `"ArrayBuffer at index 0 is already detached"`. **Solução:** `content` de PDF é sempre uma Blob URL (string), nunca ArrayBuffer. `PdfViewer` passa a string direto para `lib.getDocument(url)` — PDF.js faz o fetch internamente. `closeFile` revoga com `URL.revokeObjectURL`. Ver FIX-001.

2. **CSV — editar enquanto filtrado.** `filtered` é sempre um array DERIVADO de `data`. Reconstruir o CSV a partir do `filtered` descarta qualquer linha que não estivesse visível no filtro no momento do save. Solução: `__dataIdx` injetado em cada linha do `filtered`, e toda edição opera sobre `data` original indexado por esse número. Ver FIX-002.

3. **Tiptap — StarterKit × CodeBlockLowlight.** `StarterKit` inclui um `codeBlock` padrão que colide silenciosamente com a extensão `CodeBlockLowlight` (sem highlight, sem erro visível, o editor simplesmente para de funcionar corretamente nos blocos de código). Obrigatório: `StarterKit.configure({ codeBlock: false })`.

4. **`lucide-react` — versão fixada em `^0.462.0`.** Versões mais novas às vezes renomeiam ícones exportados. Não fazer `npm update` cego nessa lib sem testar cada ícone usado no projeto.

5. **`onBlur` sempre dispara antes de `onClick` de um elemento vizinho.** Qualquer botão "cancelar" ao lado de um input que tem `onBlur={commit}` precisa usar `onMouseDown={e => { e.preventDefault(); cancel() }}` em vez de `onClick` — senão o cancelar nunca é alcançado, porque o blur já commitou primeiro. Usado no CSV (célula) e vale para qualquer editor inline futuro (JSON formulário, por exemplo).

6. **GitHub Pages — página em branco, duas causas sobrepostas.** (a) Sem `base: './'` no `vite.config.js`, o Vite gera URLs absolutas pros assets (`/assets/index.js`), que não existem quando o app é servido em `usuario.github.io/fileview/` (subpasta). (b) Se o GitHub Pages estiver configurado para servir direto de um branch/pasta com o CÓDIGO-FONTE (sem build), ele tenta entregar `.jsx` cru como se fosse HTML/JS — falha silenciosa, tela branca sem erro no console além de 404s de `/src/main.jsx`. **Solução completa:** `base: './'` + `.github/workflows/deploy.yml` fazendo o build no servidor do GitHub e publicando só o `dist/`, com Settings → Pages → Source = "GitHub Actions" (nunca "Deploy from a branch"). Se o Pages ficar preso numa versão de cache antiga mesmo após corrigir, alternar Source para "branch" e voltar para "GitHub Actions" força um novo ciclo de publicação. Ver DEC-007.

**Sub-armadilha de tabela HTML (dentro de DEC-008, não numerada como as 6 principais mas real):** `table-layout: auto` (o padrão do HTML) deixa o browser expandir colunas livremente para caber o conteúdo — isso é **incompatível** com `text-overflow: ellipsis`, que só funciona com `table-layout: fixed` + largura explícita por coluna. Vale lembrar em qualquer tabela HTML nova do projeto.

## Sobre o sistema de documentação (meta/) e o workflow ASU

Este projeto usa o **Kit de Contexto Universal (KCM)** para manter continuidade entre sessões de conversa (cada conversa nova começa sem memória; os arquivos em `meta/` são o "disco" persistente). O comportamento completo do assistente está em `meta/CEREBRO.md` — não repita aqui, é lido à parte.

Mudanças de **código** neste projeto são entregues como instruções **ASU** (Atualizador Automático de Scripts) — um YAML que aplica patches cirúrgicos com backup e rollback automático, em vez de arquivos inteiros reescritos à mão. O formato é documentado em `meta/INSTRUCTION_GUIDE.md` (autocontido, com exemplo completo, tabela de estratégias, seis regras de ouro, tabela de correção de erros). Convenção de nome dos ASUs deste projeto: `AAAA-MM-DD_NNN_descricao.yaml` (ex.: `2026-07-01_001_json-table-ux.yaml`) — ver DEC-009 para o porquê de divergir do padrão sugerido pelo kit.

Documentos **rolantes** (STATUS, CHANGELOG, IDEAS, HISTORY) são sempre entregues como arquivo completo, nunca como ASU — a edição neles é holística (mover item resolvido, reclassificar, checar que nada se perdeu), o que um patch cirúrgico não capta.

## Contexto de Produto
- **Usuário-alvo:** desenvolvedor solo (o autor deste projeto) que lida com `.md`, `.json`, `.csv`, configs no dia a dia e quer uma experiência visual melhor que abrir esses arquivos crus no VS Code.
- **Dor que resolve:** abrir `.md` no browser e ver sintaxe crua; precisar de um app diferente para cada formato; editar um JSON ou CSV sem abrir o VS Code.
- **O que é sucesso:** abrir qualquer arquivo de texto/dados suportado e ter experiência visual imediata; editar e salvar sem fricção; hospedar gratuitamente (GitHub Pages) sem servidor.
- **O que o projeto deliberadamente NÃO é:** editor de código (sem LSP, sem Git, sem terminal integrado); ferramenta colaborativa (sem múltiplos usuários, sem sync); substituto do Word/Excel; app com backend/servidor/banco de dados; editor de CONTEÚDO de PDF (só visualização — ver DEC-004).
