# SPEC — Fase 2 da grade de dados: desfazer por arquivo + `DataGrid` compartilhado (CSV e arrays do JSON)

> **Origem:** DEC-013 e `meta/analises/261117-ANALISE-ux-tabelas-e-json.md` (fase 2). ROADMAP F2b.
> **Status:** 2a (`wo0008`, 0.1.11) e 2b (`wo0009`, `686097c`, 0.1.12) aplicadas e conferidas na tela (7/7 e 10/10, com 50 mil linhas sem travar, 2026-11-25); 2c em WO (`wo0010`, versão 0.1.13).
> **Decidido na 2b (2026-11-25):** no campo de edição, Enter grava e DESCE uma linha (convenção de planilha; antes ficava na mesma célula); a barra «Desfazer» da exclusão fica, ao lado do Ctrl+Z; sem virtualização por enquanto — medir com `../261112-roteiro-teste/teste-50k.csv`.

## Problema
O FileView tem duas tabelas escritas à parte (`CsvViewer` e o `ArrayTable` do `JsonViewer`), com geometria instável (a largura da coluna depende do conteúdo), sem célula selecionada (só duplo clique, nada de setas) e sem desfazer além da exclusão de linha do CSV. As fases 3–5 (filtro por coluna, agrupar, cards) precisam de UMA grade por baixo, senão cada recurso é escrito duas vezes.

## Critérios de aceite (verificáveis)

**2a — desfazer por arquivo (`wo0008`)**
- [ ] Depois de qualquer edição no CSV ou no JSON (Árvore/Formulário/Texto), Ctrl+Z desfaz a última e Ctrl+Y (ou Ctrl+Shift+Z) refaz, sem foco num campo de texto.
- [ ] Desfazer até o estado de abertura apaga o indicador de modificado (●); refazer o devolve.
- [ ] Cada arquivo tem a SUA pilha: desfazer na aba A não mexe na aba B.
- [ ] Digitação contínua no modo Texto vira UM passo (não um passo por tecla).
- [ ] Com o foco num campo de texto (célula em edição, textarea), Ctrl+Z é o do campo, não o do arquivo.
- [ ] No Markdown em modo Editar, o desfazer é o do editor (Tiptap); os botões ↶ ↷ da barra somem nesse modo.
- [ ] Botões ↶ ↷ na barra das abas, desabilitados quando não há o que desfazer/refazer.

**2b — `DataGrid` no CSV (a escrever)**
- [ ] O CSV usa um componente `DataGrid` novo sobre TanStack Table v8; nenhum comportamento conferido some: FIX-002 (edita o `data` original com filtro/ordem), Tab/Shift+Tab, FIX-005 (editor por cima da célula), lixeira + Desfazer, «+ Linha» com filtro, 3º clique tira a ordem, formato do arquivo preservado.
- [ ] Largura de coluna definida na abertura (medida no conteúdo, com teto) e estável depois — editar, filtrar e ordenar não mudam a largura.
- [ ] Célula selecionada: clique seleciona (realce), setas movem, Enter ou digitar abre a edição, Esc sai, Delete limpa o valor; F2 edita.
- [ ] 50 mil linhas abrem e rolam sem travar (medir; se não, virtualizar as linhas com TanStack Virtual).

**2c — `ArrayTable` do JSON no `DataGrid` (`wo0010`; decisões na DEC-014: sem paginação, registro pelo nº da linha)**
- [ ] O `ArrayTable` passa a usar o `DataGrid`, com o caminho em lista (FIX-004) e a validação de tipo (`parseEditedValue`); o `RowDetailModal` continua abrindo pela linha.
- [ ] Os roteiros de 2026-11-12 e da 0.1.9 passam de novo, item a item.

## Decisões de design
- **Pilha de desfazer no `AppContext`, por arquivo, de CONTEÚDO:** toda edição passa por `updateContent`, então guardar o conteúdo anterior ali cobre CSV, JSON e Texto de uma vez, sem cada viewer saber de desfazer. Limite de 50 passos por arquivo (memória: cada passo é o arquivo inteiro).
- **Digitação agrupada:** quem digita tecla a tecla (Texto e Markdown) chama `updateContent(id, novo, { coalesce: true })`; dentro de 800 ms de silêncio as teclas viram um passo só.
- **Campo de texto em foco ganha do atalho global**, e o Markdown em Editar fica com o desfazer do Tiptap: o editor dele só relê o conteúdo ao trocar de arquivo, então um desfazer de fora deixaria o editor dessincronizado.
- **TanStack Table v8** (DEC-013) para ordenar/filtrar na 2b; o visual continua nosso.

## Fora de escopo
- Filtro por coluna, ordenação em níveis, agrupar, cards (fases 3–5).
- Desfazer que sobreviva a fechar o arquivo ou recarregar a página.
- Unificar o «Desfazer» da exclusão de linha do CSV com a pilha nova (os dois funcionam; a barra pode sair na 2b).

## Passos
1. **2a** — pilha de desfazer no `AppContext` + atalhos + botões (`wo0008`). Roteiro do dono.
2. **2b** — `DataGrid` + CSV. Roteiro do dono (inclui o de 2026-11-12 para o CSV).
3. **2c** — `ArrayTable` no `DataGrid`. Roteiro do dono (inclui o da 0.1.9).
