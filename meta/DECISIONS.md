# DECISIONS.md — Registro de Decisões

> Cresce devagar. Guarda o PORQUÊ — o que o código sozinho não conta.
> **DEC** = decisão de arquitetura/design · **FIX** = bug grave resolvido.
> Não reescreva entradas antigas; se superada, marque «SUPERADA por DEC-X» e adicione a nova.

---

## DEC-001 — React + Vite sem Next.js nem TypeScript
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
Precisava de setup rápido para SPA 100% client-side, sem servidor, sem rotas de página.

### Decisão
React 18 + Vite 5, sem SSR, sem roteador de páginas, sem TypeScript inicial.

### Alternativas consideradas
- **Next.js** — overkill; SSR não faz sentido para tool local
- **CRA** — deprecated, lento, sem suporte ativo
- **TypeScript** — aumentaria fricção no estágio atual; revisitar na F3

### Consequências
Bundle simples, dev server instantâneo, lazy loading via `React.lazy` out-of-box.

---

## DEC-002 — Tiptap v2 como engine do editor Markdown WYSIWYG
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
Tiptap v2 + extensão community `tiptap-markdown` para serialização MD↔Tiptap.

### Alternativas consideradas
- **Quill** — não serializa MD nativamente
- **Slate** — API de baixo nível; muito código para paridade de features
- **ProseMirror puro** — verboso; Tiptap é wrapper com DX superior
- **@tiptap-pro/extension-markdown** — pago; `tiptap-markdown` (community) cobre o caso

### Consequências
Toolbar completa via extensões prontas. **Constraint crítico:** `StarterKit.configure({ codeBlock: false })` obrigatório — omitir conflita silenciosamente com `CodeBlockLowlight`.

---

## DEC-003 — JSON viewer customizado (sem react-json-view)
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
Componente `JsonNode` recursivo customizado em `JsonViewer.jsx`.

### Alternativas consideradas
- **react-json-view** — sem manutenção desde 2021, incompatível com React 18
- **jsoneditor-react** — wrapper jQuery-era, bundle pesado, difícil de estilizar

### Consequências
Controle total sobre design e comportamento; integrado ao design system.

---

## DEC-004 — PDF somente leitura
**Data:** 2026-06-05 · **Status:** aceita

### Contexto
PDF não tem estrutura de texto editável. Editar conteúdo existente exige engine proprietária paga.

### Decisão
PdfViewer é read-only. Sem aba "Editar" na UI para PDF. Funcionalidades futuras possíveis sem quebrar esta decisão: anotações overlay, merge/split, preencher formulários.

---

## DEC-005 — Lazy loading dos viewers via React.lazy
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
`ViewerRouter` usa `React.lazy + Suspense` para cada viewer/editor — chunk separado por formato.

### Consequências
PDF.js (~2MB) só é baixado ao abrir o primeiro PDF. Trade-off: ~200ms de delay na primeira abertura de cada formato.

---

## DEC-006 — Modos de visualização independentes por arquivo
**Data:** 2026-06-05 · **Status:** aceita

### Decisão
`AppContext` guarda `modes: Record<id, string>` independente por arquivo. Trocar de arquivo preserva o modo de cada um.

---

## DEC-007 — Deploy no GitHub Pages via GitHub Actions
**Data:** 2026-06-25 · **Status:** aceita

### Contexto
O app ficava em branco no GitHub Pages por dois motivos sobrepostos: (1) sem `base: './'` no Vite, os assets têm URLs absolutas (`/assets/index.js`) que não funcionam quando o app é servido em subpasta (`/nome-do-repo/`); (2) servir o código-fonte diretamente sem build — o Pages tenta renderizar `.jsx` como HTML e falha silenciosamente.

### Decisão
Duas correções combinadas:
1. `base: './'` em `vite.config.js` — URLs relativas funcionam em qualquer caminho de deploy.
2. `.github/workflows/deploy.yml` — GitHub Actions faz `npm ci && npm run build` e publica apenas o `dist/` no Pages, nunca o código-fonte.

### Como configurar (uma vez por repositório)
1. Criar o arquivo `.github/workflows/deploy.yml` no projeto.
2. No GitHub: **Settings → Pages → Source → GitHub Actions** (não escolher "Deploy from a branch").
3. Fazer push. O Actions roda automaticamente e o app fica disponível em `https://usuario.github.io/nome-do-repo/`.

### Alternativas consideradas
- **`base: '/nome-do-repo/'`** — mais explícito, mas acopla o config ao nome do repo; `'./'` é mais portátil
- **Push manual do `dist/` para branch `gh-pages`** — funciona mas é manual e frágil
- **Pacote `gh-pages`** — automatiza o push mas ainda requer build local; Actions é mais limpo

### Consequências
A cada `git push` para `main`, o GitHub builda e deploya automaticamente. URL do deploy aparece no log do Actions e em Settings → Pages.

### Nota pós-implementação (2026-06-27)
Mesmo com `deploy.yml` correto e o build passando (verificado no log do Actions: "442 modules transformed... built in 4.21s"), o site continuou em branco por um período — causa: o GitHub Pages tinha ficado preso servindo o conteúdo de uma configuração anterior (cache/CDN antigo de quando talvez tenha sido testado "Deploy from a branch"). Console mostrava 404 em `/src/main.jsx` — sintoma de estar servindo o `index.html` do CÓDIGO-FONTE, não o `index.html` do `dist/` buildado. **Solução aplicada:** em Settings → Pages, alternar Source de "GitHub Actions" para "Deploy from a branch" e IMEDIATAMENTE de volta para "GitHub Actions", depois disparar `workflow_dispatch` manual na aba Actions. Isso forçou um novo ciclo de publicação e resolveu. Lição: se o site ficar em branco MESMO com o workflow verde, suspeitar de cache do Pages preso, não assumir que o workflow está errado.

---

## DEC-008 — Tabelas grandes: truncamento + paginação + modal de detalhe
**Data:** 2026-07-01 · **Status:** aceita

### Contexto
O ArrayTable do JSON Formulário renderizava todas as linhas e colunas sem limite de largura. Com dados reais (162 linhas, 10 colunas, coluna `text_content` com centenas de caracteres por célula), o resultado era ilegível: linhas esticadas verticalmente pelo texto longo, e no layout Cards a tabela ficava espremida num card de 260px mostrando só 1-2 colunas.

Pesquisado o padrão usado por ferramentas profissionais de dados em tabela (Airtable, Notion database view, AG Grid, enterprise data tables): a combinação recorrente é truncamento de célula com ellipsis + paginação + expansão do registro completo ao clicar.

### Decisão
Três mudanças combinadas no `ArrayTable`:
1. `table-layout: fixed` + largura fixa por coluna (170px) + `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` em cada célula. Tooltip nativo via atributo `title` mostra o valor completo no hover.
2. Paginação client-side de 20 linhas por página (`ROWS_PER_PAGE`), com controles ◀ ▶ e contador de posição.
3. Clique na linha abre `RowDetailModal`: overlay com o registro completo, campo por campo, sem truncamento (`white-space: pre-wrap`).

No `CardLayout`, seções que são arrays de objetos (tabelas) ganham `gridColumn: 1 / -1` — ocupam a largura inteira da grade em vez de competir por espaço com cards de campos simples.

### Alternativas consideradas
- **Wrap de texto na célula (sem truncar)** — a linha cresce verticalmente sem limite; volta ao problema original com qualquer célula de texto longo
- **Virtualização de linhas (react-window)** — resolve performance de milhares de linhas, mas é complexidade desnecessária para o volume atual (centenas, não dezenas de milhares); paginação simples já resolve
- **Limitar colunas visíveis com seletor de colunas** — mais próximo de ferramentas como Airtable, mas é feature maior; fica registrado em IDEAS para o futuro

### Consequências
`ArrayTable` sempre renderiza no máximo 20 linhas × N colunas de uma vez, com altura de linha previsível. Arrays com uma única coluna de texto longo (o caso que gerou este DEC) ficam totalmente legíveis. Custo: o valor completo de uma célula exige um clique a mais (abrir o modal) — aceitável, pois a maioria das inspeções é por linha completa, não por célula isolada.

---

## DEC-009 — Adoção da atualização do Kit de Contexto Universal (KCM) de 2026-07-03
**Data:** 2026-07-03 · **Status:** aceita (com uma pergunta em aberto para o usuário)

### Contexto
O KCM — o kit de templates que gera e mantém `meta/CEREBRO.md` e os demais docs de contexto deste projeto — recebeu uma atualização (arquivos `*__template-update.md`/`.txt` subidos ao Projeto). Pedido do usuário: ler, comparar, estudar, adaptar e atualizar o projeto, e gerar uma versão atualizada das Instruções do Projeto.

Comparação feita linha a linha entre `CEREBRO.md` (versão em uso, 227 linhas) e `CEREBRO__template-update.md` (versão nova, 240 linhas), e entre as Instruções do Projeto em uso e `instrucoes-dev__template-update.txt`.

### Decisão
Mesclar as mudanças do kit preservando 100% das customizações específicas do Fileview (referência ao `INSTRUCTION_GUIDE.md`/`PROMPT_IA.md` próprios, ambiente Windows/CMD, a lista real de arquivos `meta/` deste projeto). Mudanças adotadas sem ressalva:

1. **Renomear `HISTORICO.md` → `HISTORY.md`.** O nome novo já é o que o template usa, e alinha com a convenção do próprio projeto ("nomes de arquivo em inglês") que `HISTORICO.md` já vinha violando desde o início. Conteúdo preservado integralmente, só o nome muda; todas as referências cruzadas (CEREBRO.md, Instruções do Projeto, tabela "Como manter os documentos") atualizadas.
2. **Nova seção "Recomendação de configuração (fim de sessão)"** no CEREBRO.md — o assistente passa a recomendar explicitamente modelo/esforço/pensamento (no chat) ou modelo/`/effort` (no Claude Code) para a próxima etapa, ao fim de cada sessão.
3. **Cláusula de auto-criação de arquivo refinada** na Tabela de Gatilhos — antes, qualquer arquivo referenciado e ausente era criado automaticamente; agora só os da "camada universal" (STATUS, IDEAS, DECISIONS) são criados por padrão, arquivos de nicho (CHANGELOG, ROADMAP) não são forçados se o projeto não os usa. Não muda nada na prática para o Fileview (usamos todos os arquivos da lista), mas o comportamento fica mais correto para o caso geral.
4. **Seção "Saída de código via ASU" reescrita**, incorporando: (a) distinção explícita entre editar arquivo existente (patch `.yaml` para baixar) vs. criar arquivo NOVO (entregar pronto para baixar, nunca embutido dentro de um bloco YAML — risco de corromper no escape de caracteres); (b) formalização dos 3 grupos de escopo do ASU — código/doc de heading estável → ASU serve; capítulo longo → ASU para trecho localizado, arquivo inteiro para reescrita profunda; **docs rolantes (STATUS/CHANGELOG/IDEAS/HISTORY) → SEMPRE arquivo inteiro**, nunca patch; (c) cuidado com âncoras não-ASCII (setas, aspas curvas, box-drawing) em `before`/`after` — preferir `.*` ou âncora ASCII vizinha. **Este ponto (c) já era uma prática existente no `INSTRUCTION_GUIDE.md` do projeto (§4.7), então não é novidade real para o Fileview — só ficou também espelhado no CEREBRO.md.** O ponto (b) formaliza por escrito uma prática que este projeto já seguia na prática (nunca usei ASU para STATUS/CHANGELOG/IDEAS/ROADMAP, sempre arquivo inteiro).

### Conflito identificado — NÃO resolvido sozinho, decisão pendente do usuário
O template novo sugere nomear os ASUs como `AAMMDD-asuNNNN.yaml` (ex.: `260701-asu0001.yaml` — data compacta de 6 dígitos + prefixo `asu` + sequência de 4 dígitos, sem descrição no nome).

Este projeto já tem uma convenção **estabelecida por pedido explícito do usuário** em 2026-06-27 ("utilize de identificadores e prename para nomear as instruções para organização e auditar, algo como a data e talvez uma numeração"): `AAAA-MM-DD_NNN_descricao.yaml` (ex.: `2026-07-01_001_json-table-ux.yaml`), já usada em 3 ASUs reais desta conversa.

**Decisão tomada nesta sessão:** manter a convenção do projeto como padrão, por dois motivos — (1) foi um pedido explícito e recente do próprio usuário, não uma escolha arbitrária minha; (2) inclui uma descrição no nome do arquivo, o que é estritamente mais útil para auditoria de relance (o padrão do kit exige abrir o arquivo ou consultar um índice externo para saber o que ele faz). Isso é registrado como um **desvio deliberado do kit** (válvula de desvio registrado, conforme a própria regra de higiene do CEREBRO.md).

**Pergunta em aberto para o usuário:** confirmar se quer manter a convenção do projeto (recomendado) ou migrar para o padrão do kit `AAMMDD-asuNNNN.yaml`. Enquanto não houver resposta, os próximos ASUs deste projeto continuam usando `AAAA-MM-DD_NNN_descricao.yaml`.

### Alternativas consideradas (para a adoção do kit como um todo)
- **Ignorar a atualização do kit** — descartada: aumentaria a divergência entre este projeto e o kit ao longo do tempo, perdendo melhorias genuínas (ex.: a recomendação de configuração é útil e não tinha custo de adoção).
- **Resetar `CEREBRO.md` para o template novo por completo** — descartada: destruiria customizações já testadas e funcionando deste projeto especificamente (nomenclatura de ASU, referências a `INSTRUCTION_GUIDE.md`/`PROMPT_IA.md`, notas de ambiente Windows/CMD).

### Consequências
`CEREBRO.md` cresce de 227 para ~245 linhas. Comportamento muda a partir de agora: recomendação de configuração ao fim de cada sessão; distinção mais clara entre ASU-patch e arquivo-novo-para-baixar; `HISTORICO.md` deixa de existir no Projeto (deletar depois de subir `HISTORY.md`, para não haver duas fontes). Nenhuma mudança de comportamento do PRODUTO (código do Fileview) decorre desta decisão — é puramente sobre como as sessões de trabalho são conduzidas e documentadas.

### Resolução da pergunta em aberto (2026-07-07)
Você decidiu migrar para o padrão sugerido pelo kit: `AAMMDD-asuNNNN.yaml` (data compacta de 6 dígitos + prefixo `asu` + sequência de 4 dígitos), abandonando a convenção própria do projeto `AAAA-MM-DD_NNN_descricao.yaml` usada nos 3 ASUs anteriores (`2026-06-28_001_json-form-view.yaml`, `2026-07-01_001_json-table-ux.yaml`, e um anterior de atualização do Node). A partir desta sessão, novos ASUs usam o nome novo — o primeiro é `260707-asu0001.yaml`.

**Trade-off que fica registrado, não escondido:** o padrão do kit não carrega descrição no nome do arquivo. Auditar de relance qual ASU faz o quê (sem abrir o YAML ou manter um índice à parte) fica mais difícil do que era com o nome descritivo antigo — era exatamente a vantagem que motivou a convenção anterior (ver acima). A contagem `NNNN` reinicia a partir de `0001` sob o novo padrão (não continua a sequência `001/001/001` por dia do padrão antigo, que tinha reinício diário e não global).

### Consequências (atualização)
`meta/CEREBRO.md` e `PROJECT_INSTRUCTIONS.md` precisam ser atualizados na próxima leva para refletir `AAMMDD-asuNNNN.yaml` como convenção vigente (a nota "Mudanças nesta revisão" e a seção "Saída de código via ASU" ainda citam o padrão antigo como escolha do projeto — ficou pendente de ajuste, ver STATUS.md). Nenhum ASU antigo precisa ser renomeado retroativamente.

---

## FIX-001 — PDF: ArrayBuffer detachado pelo worker do PDF.js
**Data:** 2026-06-05

- **Sintoma:** `⚠ Erro ao abrir PDF: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.`
- **Causa raiz:** PDF.js v4 usa `postMessage` com `transfer` do ArrayBuffer para o worker thread — detacha o buffer do main thread permanentemente. Na remontagem, `activeFile.content` está morto.
- **Solução:** `AppContext.openFile` converte PDF em Blob URL (`URL.createObjectURL(blob)`). `PdfViewer` passa a URL string para `lib.getDocument(url)`. `closeFile` revoga com `URL.revokeObjectURL`.
- **Lição:** Nunca armazenar `ArrayBuffer` em estado React quando será transferido para Worker. Blob URLs são imunes. → Armadilha #1 CONTEXT.md.
- **Arquivos:** `src/context/AppContext.jsx`, `src/viewers/PdfViewer.jsx`

---

## FIX-002 — CSV: edição-enquanto-filtrado descartava linhas fora do filtro
**Data:** 2026-06-05

- **Sintoma:** Filtrar + editar + salvar descartava as linhas fora do filtro.
- **Causa raiz:** `commitEdit` reconstruía o CSV a partir do array `filtered` (derivado), não do `data` original.
- **Solução:** Injetar `__dataIdx` em cada linha do `filtered`. `editCell` guarda `{ dataIdx, col }`. `commitEdit` opera sobre `data.map((r, i) => i === dataIdx ? ... : r)`.
- **Bônus:** botão ✕ cancelar edição com `onMouseDown + preventDefault` (dispara antes do `onBlur`). → Armadilha #5 CONTEXT.md.
- **Arquivo:** `src/viewers/CsvViewer.jsx`
