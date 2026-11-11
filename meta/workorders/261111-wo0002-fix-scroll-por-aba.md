# WO 0002 — cada aba remonta o seu viewer (FIX-003: rolagem e estado de UI compartilhados)

> **Tipo:** mista — 1 edicao de CODIGO + registro nos meta/.
> **Config sugerida:** Sonnet, `/effort medium`.
> **Pre-requisito:** escrita sobre `8200753` (`docs(logs): registra fecho do merge KCM v1.135.0`), arvore limpa.
> **Base:** bug relatado pelo dono em 2026-11-10 (STATUS, «Quebrado»); causa achada pelo chat lendo `src/components/ViewerRouter.jsx`, `src/App.jsx` e os viewers em 2026-11-11.
> **Arquivos que o chat gravou no disco e esta WO versiona:** `logs/2026-11-11.md` — `9d549927c77672009f890d39dd081c6803999b1a` (Edicao 0: `sha1sum logs/2026-11-11.md` antes de tudo; diferente = PARE e reporte).
> **Depende de:** `wo0001` (ja aplicada, `b4c97d4`).
> **Ancora semantica:** se um trecho-ancora nao bater EXATAMENTE, **PARE e reporte**.
> **Idempotencia:** antes de cada edicao, procure o texto NOVO INTEIRO. Ja aplicada = texto novo inteiro presente **e a ancora nao** — salvo nas edicoes em que o texto novo contem a ancora (2a, 2b, 3, 4, 5). Ja aplicada: PULE e diga.
> **Ancoras lidas em:** recortadas por script, neste turno, das linhas reais sobre `8200753`: `src/components/ViewerRouter.jsx` (1), `meta/STATUS.md` (2a–2c), `meta/CHANGELOG.md` (3), `meta/DECISIONS.md` (4), `meta/IDEAS.md` (5). O trecho literal de cada uma e o bloco **Ancora** da propria edicao. Simulacao das 7 edicoes a partir do texto desta WO: ancora = 1 ocorrencia em todas.
> **Fim de linha:** `src/components/ViewerRouter.jsx` esta **CRLF na arvore** (`git ls-files --eol` → `i/lf w/crlf`); a ancora da Edicao 1 e de UMA linha, entao o CRLF nao morde — mas grave as linhas novas com o mesmo fim de linha do arquivo (CRLF), para o `git diff` mostrar so as 4 linhas. Os 4 `meta/` sao LF.
> **Proximo comando:** nenhum — a conferencia na tela e do dono, pelo roteiro que o chat entregou no mesmo turno desta WO.

> **Canal dos meta neste ciclo = CODE.** Esta WO e o registro: aplique as edicoes nos `meta/` como escritas.

---

## 1. Por que

`ViewerRouter` renderiza `<Component />` sem `key`. Com dois arquivos do mesmo tipo e modo abertos, trocar de aba nao troca o componente: o React reaproveita a instancia e o no DOM. O `div` que rola e o mesmo elemento (por isso o `scrollTop` passa de um arquivo para o outro) e os `useState` locais tambem passam — filtro/ordenacao do CSV, zoom do PDF, nos colapsados do JSON. Arquivos de tipos diferentes nao sofrem (componente diferente remonta). `key={activeFile.id}` faz cada aba remontar o seu viewer.

**O que e medido e o que e deduzido:** a ausencia de `key` e o compartilhamento de componente sao **lidos** no codigo (`ViewerRouter.jsx`, `<Component />`). Que isso e a causa do sintoma relatado e **deduzido** (e o mecanismo padrao de reconciliacao do React); a confirmacao e o item 1 do roteiro do dono.

**Efeito colateral aceito:** voltar a uma aba reabre do topo e com filtro/zoom zerados. O `MarkdownEditor` (Tiptap) passa a ser recriado a cada troca de aba — o historico de desfazer deixa de atravessar arquivos (antes um Ctrl+Z podia desfazer edicao de OUTRO arquivo `.md`). Lembrar a posicao por aba fica como ideia (Edicao 5).

---
## Edicao 1 — `src/components/ViewerRouter.jsx` · key por arquivo no componente

**Substituir.** Ancora:

```
      <Component />
```

**Por:**

```
      {/* key = id do arquivo: sem ela, dois arquivos do mesmo tipo reaproveitam a MESMA
          instancia do viewer — o mesmo no de rolagem e o mesmo estado local (filtro, zoom,
          ordenacao). Trocar de aba precisa remontar. Ver FIX-003. */}
      <Component key={activeFile.id} />
```

## Edicao 2a — `meta/STATUS.md` · versao 0.1.7

**Substituir.** Ancora:

```
**[0.1.6]** — 2026-07-07 — CSV: navegação por Tab entre células durante a edição. **Confirmado aplicado** (o `CsvViewer.jsx` do snapshot do Projeto de 2026-11-06 contém `commitValue`/`commitAndMove`, o handler de Tab e o rodapé novo). O commit posterior `f626337` ("correcao asu0003", 2026-07-24) não foi inspecionado — ver Backlog.
*Nenhuma versão nova do produto desde a 0.1.6: a sessão de 2026-11-07 foi só de handoff (documentação), sem mudança de código.*
```

**Por:**

```
**[0.1.7]** — 2026-11-11 — Abas: cada arquivo aberto tem rolagem e estado de UI próprios (FIX-003). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-11).
**[0.1.6]** — 2026-07-07 — CSV: navegação por Tab entre células durante a edição. **Confirmado aplicado** (o `CsvViewer.jsx` do snapshot do Projeto de 2026-11-06 contém `commitValue`/`commitAndMove`, o handler de Tab e o rodapé novo). O commit posterior `f626337` ("correcao asu0003", 2026-07-24) não foi inspecionado — ver Backlog.
```

## Edicao 2b — `meta/STATUS.md` · Tabs: estado por aba

**Substituir.** Ancora:

```
- **Tabs:** troca de arquivo ativo, fechar por tab, indicador de modificado (● laranja)
```

**Por:**

```
- **Tabs:** troca de arquivo ativo, fechar por tab, indicador de modificado (● laranja); cada aba com rolagem e estado de UI próprios desde 0.1.7 (voltar a uma aba reabre do topo — lembrar a posição está no IDEAS)
```

## Edicao 2c — `meta/STATUS.md` · sai o bug (corrigido)

**Substituir.** Ancora:

```
- **Abas compartilham a posição de rolagem** `[relatado pelo dono, 2026-11-10]` — com 2 arquivos abertos, rolar um deles faz o outro abrir já rolado (no fim). Causa não investigada; suspeita a confirmar lendo o código: o container de rolagem do viewer é o mesmo elemento para todas as abas e não guarda posição por arquivo.
```

**Por:**

```
- Nenhum bug conhecido no produto.
```

## Edicao 3 — `meta/CHANGELOG.md` · entrada 0.1.7

**Substituir.** Ancora:

```
## [0.1.6] — 2026-07-07
```

**Por:**

```
## [0.1.7] — 2026-11-11
### Corrigido
- **Abas compartilhavam a posição de rolagem e o estado de UI (FIX-003):** com dois arquivos do mesmo tipo abertos, rolar um fazia o outro abrir já rolado; o filtro e a ordenação do CSV e o zoom do PDF também passavam de um arquivo para o outro. Agora cada aba remonta o seu viewer. Efeito colateral aceito: voltar a uma aba reabre do topo e com filtro/zoom zerados.

---

## [0.1.6] — 2026-07-07
```

## Edicao 4 — `meta/DECISIONS.md` · FIX-003

**Substituir (a ancora fica, o FIX-003 entra depois).** Ancora:

```
- **Arquivo:** `src/viewers/CsvViewer.jsx`
```

**Por:**

```
- **Arquivo:** `src/viewers/CsvViewer.jsx`

---

## FIX-003 — Abas: arquivos do mesmo tipo dividiam a rolagem e o estado de UI
**Data:** 2026-11-11 · **Status:** resolvida

- **Sintoma:** `[relatado pelo dono, 2026-11-10]` com dois arquivos abertos, rolar um deles fazia o outro abrir já rolado (no fim). Pela leitura do código, o mesmo vale para todo estado local do viewer: filtro/ordenação do CSV, zoom do PDF, nós colapsados do JSON.
- **Causa raiz:** `ViewerRouter` renderiza `<Component />` sem `key`. Para dois arquivos do mesmo tipo e modo, `Component` é o mesmo, na mesma posição da árvore — o React reaproveita a instância e o nó DOM. O `div` com `overflow: auto` é o mesmo elemento, então o `scrollTop` fica; os `useState` também. Arquivos de tipos diferentes não sofriam (componente diferente = remonta).
- **Solução:** `<Component key={activeFile.id} />` — trocar de aba remonta o viewer.
- **Alternativas consideradas:** manter todos os viewers montados e esconder os inativos (preserva tudo, mas multiplica instâncias de Tiptap/PDF.js em memória); guardar e restaurar a rolagem por aba (melhor UX, mas o elemento que rola é diferente em cada viewer e o conteúdo chega assíncrono — fica como ideia no IDEAS).
- **Lição:** componente que é TROCADO conforme o item ativo (aba, linha, arquivo) precisa de `key` com a identidade do item; sem ela, estado e DOM vazam entre itens em silêncio.
- **Arquivo:** `src/components/ViewerRouter.jsx`
```

## Edicao 5 — `meta/IDEAS.md` · ideia: lembrar rolagem por aba

**Substituir.** Ancora:

```
## 🤖 Ideias Ativas — Assistente
```

**Por:**

```
## 🤖 Ideias Ativas — Assistente

### 2026-11-11 — Abas: lembrar a posição de rolagem de cada aba
Depois do FIX-003 cada aba volta ao topo ao ser reaberta. O comportamento de navegador é lembrar onde se estava. Caminho provável: um `Map` por `id:modo` com o `scrollTop`, gravado por `onScrollCapture` num contêiner em volta do viewer e restaurado depois de montar — o elemento que rola muda de viewer para viewer e o conteúdo do PDF/Markdown chega depois da montagem, então precisa de um pequeno «esperar o conteúdo». Avaliar junto: preservar também filtro/ordenação do CSV e zoom do PDF.
```

---

## Fora de escopo

- Nao implementar memoria de rolagem por aba (vira ideia na Edicao 5).
- Nao mexer em `package.json` (a versao dele segue pendente de decisao no STATUS).
- Nao tocar em nenhum viewer/editor alem do `ViewerRouter.jsx`.

## Armadilhas desta WO

- `ViewerRouter.jsx` e CRLF na arvore (ver cabecalho).
- O comentario JSX vai DENTRO do `<Suspense>`, logo antes do `<Component ...>`: comentario `{/* */}` como filho e valido ali.

---

## Depois de aplicar — conferencia antes do commit

- [ ] `npm run build` termina sem erro (se `node_modules` faltar: `npm ci` antes). Erro → PARE, nao commite.
- [ ] `git status --short` mostra exatamente: `M meta/CHANGELOG.md`, `M meta/DECISIONS.md`, `M meta/IDEAS.md`, `M meta/STATUS.md`, `M src/components/ViewerRouter.jsx`, `M logs/2026-11-11.md`, `?? meta/workorders/261111-wo0002-fix-scroll-por-aba.md` (7 entradas; `dist/` nao aparece porque o `.gitignore` o ignora desde a wo0001).
- [ ] `git diff --stat src/components/ViewerRouter.jsx` → 1 arquivo, 4 insercoes, 1 remocao (unidade = linhas). Se vier o arquivo inteiro trocado, o fim de linha virou: corrija para CRLF.
- [ ] Saldo de linhas (`wc -l` antes e depois, simulado pelo chat a partir deste texto): `src/components/ViewerRouter.jsx` 52 → 55 (+3) · `meta/STATUS.md` 41 → 41 (+0) · `meta/CHANGELOG.md` 89 → 95 (+6) · `meta/DECISIONS.md` 249 → 261 (+12) · `meta/IDEAS.md` 118 → 121 (+3). Saldo diferente = VERMELHO.
- [ ] Contagens (unidade = linhas; ancoradas em `^`):
  - `grep -c "^      <Component key={activeFile.id} />" src/components/ViewerRouter.jsx` → 1 · `grep -c "^      <Component />" src/components/ViewerRouter.jsx` → 0
  - `grep -c "^\*\*\[0.1.7\]\*\* — 2026-11-11" meta/STATUS.md` → 1 · `grep -c "^\*Nenhuma versão nova do produto" meta/STATUS.md` → 0 · `grep -c "^- \*\*Abas compartilham" meta/STATUS.md` → 0
  - `grep -c "^## \[0.1.7\] — 2026-11-11" meta/CHANGELOG.md` → 1
  - `grep -c "^## FIX-003" meta/DECISIONS.md` → 1
  - `grep -c "^### 2026-11-11 — Abas: lembrar" meta/IDEAS.md` → 1
- [ ] **Chega no ramo?** `App.jsx` → `Inner` → `<ViewerRouter />` → `<Component key={activeFile.id} />`: toda troca de aba passa por esta linha. A conferencia automatica (build) responde «compila?», NAO «o sintoma sumiu?» — essa pergunta e do roteiro do dono (olho na tela).
- [ ] Nada criado fora do repo: se rodou `npm run dev`, encerre o servidor antes de fechar.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O que foi feito · o que fugiu do texto literal · arquivos tocados · saida crua do build e das conferencias (com o comando) · commit e push. Escreva DEPOIS de resolver o push. Grave tambem em `../AAMMDD-HHMM-code-fileview-apply-wo0002.txt` (`date +%y%m%d-%H%M` na hora).

## Commit — blocos separados, mensagem SEM acento

```
git add src/components/ViewerRouter.jsx logs/2026-11-11.md meta/STATUS.md meta/CHANGELOG.md meta/DECISIONS.md meta/IDEAS.md meta/workorders/261111-wo0002-fix-scroll-por-aba.md
```

```
git commit -m "fix(viewer): remonta o viewer a cada aba (FIX-003)" -m "Sem key, arquivos do mesmo tipo reaproveitavam a mesma instancia do viewer: rolagem, filtro, ordenacao e zoom passavam de uma aba para outra. Versao 0.1.7."
```

```
git push
```

*Gerado pelo Kit de Contexto Universal v1.135.0 — 2026-11-10 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
