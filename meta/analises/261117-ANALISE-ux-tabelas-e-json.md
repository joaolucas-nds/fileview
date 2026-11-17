# ANÁLISE — UX das tabelas (CSV e JSON) e para onde levá-las

> **Status:** Decidida (2026-11-17 — ver «Decisão do dono» no fim; registro em DEC-013)
> **Data:** 2026-11-17
> **Nasceu de:** pedido do dono em 2026-11-17 — «a Mapoteca pode ensinar formas de trabalhar com tabelas (filtrar, ordenar, agrupar); o mesmo para o JSON, com cards para campos repetidos como um banco» + «verifique o código e veja o que foge das recomendações de UX/UI». Os defeitos já CONFIRMADOS (FIX-004, FIX-005) não estão em discussão: vão direto pela wo0005.

## Problema

O FileView mostra CSV e arrays de objetos do JSON como tabela, mas a tabela é só leitura com edição pontual: filtro único em todas as colunas, ordenação de um nível, nada de agrupar, e gestos que fogem do que uma planilha ensina. Para o dono, que usa os dois formatos no dia a dia, isso limita o FileView a «abrir e olhar». Sem mudança, cada melhoria vai ser feita duas vezes (o `CsvViewer` e o `ArrayTable` do `JsonViewer` são dois códigos de tabela diferentes) e os achados de UX abaixo continuam lá.

## Restrições / o que foi medido

**Estado do código, lido em 2026-11-17 sobre `2cc605b`** (`src/viewers/CsvViewer.jsx` 263 linhas, `src/viewers/JsonViewer.jsx` 759, `src/context/AppContext.jsx`, `src/components/Sidebar.jsx`, `src/App.jsx`):

| # | Onde | Achado | Peso |
|---|---|---|---|
| U1 | CSV | Abrir uma célula muda a largura da coluna e a tabela inteira se rearranja na horizontal (`table-layout` automático + `<input>` no fluxo da célula). **Relatado pelo dono; corrigido na wo0005 (FIX-005).** | alto |
| U2 | CSV | O mesmo ✕ significa «cancelar edição» (ao lado do campo) e «excluir linha» (fim da linha), e excluir é um clique sem confirmação nem desfazer. | alto — destrutivo |
| U3 | todos | Não há desfazer (Ctrl+Z) nas edições de CSV e do Formulário do JSON; o único desfazer é o do editor de Markdown. | alto |
| G1 | todos | Fechar aba/arquivo com alteração não salva descarta sem perguntar (`closeFile` não confere `isDirty`); fechar a aba do navegador também (sem `beforeunload`). | alto — perda de dado |
| U11 | CSV | «+ Linha» com filtro ativo: a linha nova é vazia, não casa com o filtro e não aparece — parece que o botão não fez nada. | médio |
| U4 | CSV | Ordenação só alterna ▲/▼; não há como voltar para «sem ordenação» sem fechar o arquivo. | médio |
| U10 | CSV | Sem célula selecionada: nada de setas, de «digitar para editar», de Enter descer para a linha de baixo — tudo que uma planilha ensina. Só duplo clique. | médio |
| J6 | JSON | Qualquer edição regrava o arquivo inteiro com recuo de 2 espaços (o roteiro usou um arquivo com 4). O diff de um arquivo versionado vira o arquivo todo. | médio — pergunta em aberto ao dono |
| J7 | JSON | Edição que falha é engolida (`catch {}` vazio no `handleUpdate`): o valor simplesmente não muda, sem aviso. A wo0005 tira a causa conhecida (chave com ponto); o `catch` mudo continua. | médio |
| G2 | todos | «Salvar ↓» baixa uma CÓPIA na pasta de downloads; não grava no arquivo aberto. | médio — expectativa |
| U12 | CSV | Na ordenação, célula vazia vira `0` (`Number('')`) e se mistura aos números. | baixo |
| G3 | todos | Abrir outro arquivo com o MESMO nome de um já aberto (de outra pasta) só foca o antigo. | baixo |
| J8 | JSON | Não dá para acrescentar/remover chaves nem itens de lista; listas de valores simples (chips) só leitura. | baixo — recurso |

Por que o print da célula aberta não sai: o atalho de captura tira o foco da página, o `onBlur` do campo confirma e fecha a edição — comportamento padrão de edição em célula, não defeito.

**O que a Mapoteca faz** (lido em `Mapoteca/mapoteca/src/lib/components/DataTable.svelte`, `ColumnFilter.svelte`, `src/lib/filter/spec.ts` e no `261117-ESBOCO-F3-agrupar-e-ordenar.html`):
- **M1 — menu por coluna:** ▾ no cabeçalho abre o filtro da coluna; botão direito no cabeçalho abre ordenar / filtrar / limpar / agrupar por esta.
- **M2 — filtro por valores com contagem (facetas):** a lista de valores da coluna, com busca, cada valor em três estados (neutro · incluir · excluir) e a contagem do que aparece com os filtros das OUTRAS colunas. Todo filtro ligado aparece como chip.
- **M3 — padrões e faixas:** curinga palavra a palavra (`aço*`, `*terra`), sem acento e sem caixa; `≥`/`≤` em número.
- **M4 — ordenação em níveis:** Shift+clique soma um nível, o cabeçalho mostra ↑¹ ↓²; até 3 níveis.
- **M5 — agrupar:** até 3 níveis, linha de grupo recolhe/expande, totais por grupo, Alt+clique recolhe todos do nível.
- **M6 — grade estável:** largura de coluna definida (não depende do conteúdo) e linhas virtualizadas de altura fixa — milhares de linhas sem travar.
- **M7 — detalhe ao lado, por cima:** clicar na linha abre o detalhe numa barra que não encolhe a tabela; gestos separados (nada de botão dentro de botão).
- **M8 — um motor de filtro só** (`evaluate`), usado por todas as vistas — a Mapoteca registrou que quatro sistemas de filtro paralelos mataram o projeto anterior.

## Opções consideradas

- **A. Melhorar cada tabela onde está.** Barato no começo; cada recurso (filtro por coluna, agrupar, desfazer) é escrito duas vezes e diverge — exatamente o modo de falha que a Mapoteca registrou (M8). Descartada.
- **B. Uma grade de dados compartilhada (`DataGrid`) para CSV e para arrays de objetos do JSON**, com as linhas como objetos e um adaptador por formato (CSV: `Papa.parse`/`unparse`; JSON: o caminho em lista do FIX-004). Recursos entram uma vez e valem para os dois. Custa uma fase de base antes de recurso novo aparecer.
- **C. Adotar uma biblioteca de grade** (TanStack Table para a lógica; AG Grid Community para tudo pronto). TanStack não tem visual — é a lógica de ordenar/filtrar/agrupar, e o visual continua nosso; AG Grid resolve quase tudo mas pesa e impõe o visual dele. `[a pesquisar antes de decidir: tamanho e licença na versão atual]`
- **D. Vista de cards para «registros repetidos» do JSON** (galeria tipo Airtable/Notion): cada objeto do array vira um card, com campo-título escolhido e campos visíveis escolhidos; mesmos filtros/agrupamentos da grade. Não exclui B — é uma segunda vista sobre os mesmos dados.

## Recomendação

**B, com a lógica possivelmente vinda de C (TanStack Table), e D como vista seguinte.** Em fases, cada uma entregue e conferida na tela:
1. **Segurança antes de recurso** (pequena, independente): G1 (perguntar ao fechar com alteração não salva + `beforeunload`), U2 (excluir linha com ícone próprio e desfazer), U11, U4.
2. **Base da grade compartilhada:** `DataGrid` usado pelo CSV e pelo `ArrayTable`; largura de coluna estável (M6); célula selecionada com teclado (U10); desfazer por arquivo (U3).
3. **Filtro por coluna com facetas e chips** (M1, M2) + ordenação em níveis (M4); padrões e faixas (M3) no fim da fase.
4. **Agrupar com totais** (M5).
5. **Vista de cards** para arrays de objetos do JSON (D).

O porquê: os dois pedidos do dono (tabelas melhores e cards no JSON) são o MESMO dado — linhas de registros — visto de dois jeitos; um componente e um motor de filtro servem os dois, e a Mapoteca já pagou para aprender que motores paralelos divergem. A fase 1 vem antes porque perda de dado (G1, U2) pesa mais que qualquer recurso.

**Melhor argumento contra:** a fase 2 é um refactor do arquivo mais delicado do projeto (`JsonViewer.jsx`) sem nada visível de novo para o dono; se a motivação esfriar no meio, fica uma base sem recurso. Mitigação: a fase 2 entra junto com UM recurso visível (seleção por teclado, U10), e cada fase fecha conferida na tela.

## Riscos

- **Regressão nas edições já conferidas** (FIX-002 do CSV, índice original do `ArrayTable`, Tab do CSV): a grade nova tem de passar no roteiro de 2026-11-12 de novo. Sinal cedo: o roteiro, item a item.
- **Desempenho** com CSV grande se a virtualização ficar para depois. Sinal: medir com um CSV de 50 mil linhas antes da fase 3.
- **Escopo:** agrupar e cards puxam configuração (que coluna, que campo-título) que precisa ser lembrada por arquivo — onde guardar (localStorage por nome de arquivo?) é decisão da fase 4/5.

## Ponto de decisão

Três respostas do dono:
1. **Direção:** grade compartilhada (B) com as fases 1→5 nesta ordem — sim, ou outra ordem?
2. **Biblioteca:** pesquisar TanStack Table/AG Grid (C) antes da fase 2, ou escrever a lógica na mão?
3. **Recuo do JSON (J6):** preservar o recuo original do arquivo ao salvar (recomendado: detectar 2/4 espaços ou tab na abertura) — sim ou não?

## Decisão do dono (2026-11-17)

`[relatado pelo dono]` «fases como recomendado; pesquisar biblioteca; preservar o recuo».

1. **Direção:** grade compartilhada (B), fases 1→5 na ordem recomendada. Fase 1 = wo0006.
2. **Biblioteca:** pesquisada no mesmo dia — resultado abaixo.
3. **Recuo do JSON (J6):** preservar o formato do arquivo ao salvar. A medição mostrou que o CSV tem o MESMO problema e foi incluído junto na fase 1: `Papa.unparse` grava com CRLF e tira a quebra final — medido na VM com `papaparse@5.4.1`: `P.unparse(P.parse('id,nome\n1,Ana\n2,Bo\n',{header:true,skipEmptyLines:true}).data)` → `"id,nome\r\n1,Ana\r\n2,Bo"`; qualquer edição num CSV LF reescrevia o arquivo inteiro.

## Pesquisa de biblioteca (2026-11-17, para a fase 2)

| Opção | Licença | O que cobre do plano | Tamanho | Por que sim / por que não |
|---|---|---|---|---|
| **TanStack Table v8** (`@tanstack/react-table`) | MIT | ordenação multi-coluna, filtro por coluna e global, **facetas** (valores únicos com contagem, mín/máx), **agrupar + agregação**, expandir, larguras de coluna | ~14,6 kB gzip (8.21.3, bundlephobia, citado pela Vercel) | **Headless**: toda a lógica das fases 3–4, nenhum visual imposto — a grade continua com a cara do FileView. Contra: navegação de célula por teclado e edição são nossas (fase 2). v9 está em beta — fica a v8 estável. |
| AG Grid Community | MIT | ordenar, filtrar, editar, virtualização | ~200 kB | **Agrupar e agregação, menu de coluna e área de transferência são Enterprise** (licença paga, US$ 999 por desenvolvedor) — justamente as fases 3–4. Descartada. |
| react-data-grid (adazzle) | MIT | edição de célula, teclado, copiar/colar, ordenação multi-coluna, agrupar, virtualização | pequeno, sem dependências | O mais completo «pronto». Contra: a linha 7 está em beta há anos e as versões recentes declaram React 19 (`[a confirmar no package.json dela antes de usar]`); o FileView está em React 18.3. Segunda opção, se a navegação por teclado da fase 2 sair cara. |
| MUI X Data Grid | MIT (base) | edição, filtro e ordenação de UMA coluna | grande | Agrupar é do plano Premium (pago); traz o visual do Material UI. Descartada. |

**Escolha:** TanStack Table v8 + o visual nosso (e TanStack Virtual quando a medição de desempenho pedir). Registrada em DEC-013.

Fontes: tanstack.com/table (v8 e v9, guias de recursos); vercel.com/i/tanstack-table (tamanho 8.21.3); ag-grid.com (Community vs Enterprise, preço); github.com/ag-grid/ag-grid (tabela de recursos); npm/cloudsmith react-data-grid 7.0.0-beta; mui.com/x (licenças).
