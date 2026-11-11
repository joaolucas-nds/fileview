# WO 0001 — registrar a migracao ASU -> Code (STATUS, DECISIONS, IDEAS, HISTORY) e versionar os docs do chat

> **Tipo:** WO de DOC (registro).
> **Config sugerida:** Sonnet, `/effort medium` — mecanica, ancoras exatas, sem julgamento.
> **Pre-requisito:** escrita sobre `6925a88` (`chore(kit): migra para modo Code (KCM v1.135.0)`). Estado esperado ao comecar: `git status --short` mostra SO os 8 arquivos da lista abaixo (7 modificados/novos + esta WO); nada mais.
> **Base:** conversa de 2026-11-10 (merge do KCM v1.135.0 + decisao do dono de migrar para o modo Code). Detalhe em `logs/2026-11-10.md`.
> **Arquivos que o chat gravou no disco e esta WO versiona** (sha1 medido pelo chat logo depois de gravar):
>   - `meta/CEREBRO.md` — `f2f94f7d36becdbc31297056b44337d91b735f4c`
>   - `meta/CONTEXT.md` — `04a670986e613a2b444a66637a41ee5f3b0a295d`
>   - `meta/GLOSSARY.md` — `cc1a364d4b7b66132c2897c2b07fbeeb63e00d70`
>   - `meta/LOG-TEMPLATE.md` — `49782458bcd3bd86ed4e048a7c1a5b778d22d528`
>   - `.gitignore` — `d103da5baf9b12c0e5411c5a9de39223837f291b`
>   - `.flatdropignore` — `b4800c4156f7d4a1c284d923ea2196b6c8aead24`
>   - `logs/2026-11-10.md` — `df19fb6ca4efbaa71ca5e9ba3ab68c828fc46d8f`
> **Ancora semantica:** se um trecho-ancora nao bater EXATAMENTE, **PARE e reporte** — nunca chute um lugar proximo.
> **Idempotencia:** antes de cada edicao, procure o texto NOVO INTEIRO no arquivo. Ja aplicada = o texto novo inteiro esta la **e a ancora nao** — salvo na forma «trocar», em que a ancora esta dentro do texto novo (edicoes 1d, 1e, 3a, 3c, 3d, 3e, 4: nelas o texto novo comeca pela propria ancora ou e um pedaco dela). Ja aplicada: PULE e diga no relatorio.
> **Ancoras lidas em:** todas recortadas por script das linhas reais dos arquivos, neste turno, sobre `6925a88`: `meta/STATUS.md` (edicoes 1a–1f), `meta/DECISIONS.md` (2a–2c), `meta/IDEAS.md` (3a–3e), `meta/HISTORY.md` (4). O trecho literal de cada uma e o bloco **Ancora** da propria edicao. A simulacao das 15 edicoes, em sequencia e a partir deste texto, numa copia dos 4 arquivos, deu ancora = 1 ocorrencia em todas.
> **Fim de linha:** os 4 arquivos editados sao LF no disco (`git ls-files --eol` → `i/lf w/lf`). As ancoras de varias linhas usam `\n` simples.

> **Canal dos meta neste ciclo = CODE.** Esta WO E o registro: aplique as edicoes nos `meta/` como escritas. Os docs que o chat reescreveu inteiros (CEREBRO, CONTEXT, GLOSSARY, LOG-TEMPLATE) ja estao no disco — NAO os edite, so confira o hash e versione.

---

## 1. Por que

O projeto migrou do modo ASU para o modo Code (decisao do dono, 2026-11-10). O chat ja reescreveu os docs que sao dele; faltam os registros que, na nova divisao, sao do Code: STATUS (estado e pendencias resolvidas), DECISIONS (DEC-011 e Status fechado nos FIX), IDEAS (duas ideias do dono, secao Adiadas, feedback para o Kit) e HISTORY (o periodo ASU como historico). Mais a remocao do arquivo-lixo `git` da raiz.

## 2. Contexto factual

- **Medido** (`git show --stat f626337`): o commit «correcao asu0003» de 2026-07-24 so mexeu em `.flatdropignore`, `logs/2026-07-07.md`, `meta/ASU/*`, `meta/CHANGELOG.md`, `meta/IDEAS.md` — nenhum `src/`.
- **Medido** (`git show --stat 6c7f953`): `PROJECT_INSTRUCTIONS.md` foi apagado em 2026-07-09; hoje a fonte das instrucoes e `INSTRUCOES-DO-PROJETO.md` (commit `6925a88`).
- **Medido** (`ls meta/`): `meta/HISTORICO.md` nao existe mais.
- **Medido** (`git log -- git`): o arquivo `git` da raiz entrou em `ed39394` (2026-06-26); o conteudo e a saida de um `.bat` («CONCLUIDO ... Pressione qualquer tecla»).
- **Relatado pelo dono** (nota `261110-1620.txt`): abas compartilham a posicao de rolagem; e pedidos de fechar aba com o botao do meio e atalhos de teclado. Causa do bug **nao investigada**.
- **Medido** (`wc -c`): `meta/CEREBRO.md` antigo ~36 KB; novo ~106 KB.

## Inventario — de onde saiu a lista de edicoes

15 edicoes em 4 arquivos, mais 1 remocao de arquivo. Saiu de: (a) as 3 pendencias do Backlog do STATUS cujo estado o chat mediu como resolvido; (b) a secao «📁 Arquivos Criticos» do STATUS, que o chat ja pos no CONTEXT (a metade de inserir esta feita; aqui so a de remover); (c) os campos `Status:` ausentes ou vencidos em DECISIONS (`grep -n "Status" meta/DECISIONS.md`: DEC-001..010 tem; FIX-001 e FIX-002 nao; DEC-009 diz «pergunta em aberto», resolvida em 07/07); (d) a nota do dono; (e) a secao «Adiadas» do template v1.135.0 que o IDEAS nao tem.

---
## Edicao 0 — conferir os hashes do chat

Rode, na raiz do repo:

```
sha1sum meta/CEREBRO.md meta/CONTEXT.md meta/GLOSSARY.md meta/LOG-TEMPLATE.md .gitignore .flatdropignore logs/2026-11-10.md
```

Cada hash tem de ser igual ao do cabecalho. Diferente = outro escritor mexeu depois do chat: **PARE e reporte**, nao commite por cima. (Se o Git do Windows reescrever `.gitignore`/`.flatdropignore` com CRLF no checkout, o hash muda so por fim de linha: reporte o hash cru e rode `git diff --stat` neles — se o diff for o esperado, siga e diga no relatorio.)

## Edicao 1a — `meta/STATUS.md` · linha do sistema de documentacao

**Substituir.** Ancora:

```
- **Sistema de documentação (meta/):** CEREBRO.md + 9 docs + logs, na versão do Kit de Contexto Universal adotada em 2026-07-03 (DEC-009), agora com a pendência de nomenclatura ASU também resolvida (ver DECISIONS.md).
```

**Por:**

```
- **Sistema de documentação (meta/) — modo Code desde 2026-11-10 (DEC-011):** CEREBRO.md (base KCM v1.135.0) + 10 docs + `SPEC.md` + `workorders/` + logs; `CLAUDE.md`, `.claude/` (skills `/apply-wo`, `/wrap`, `/sondar`) e `INSTRUCOES-DO-PROJETO.md` na raiz. ASU desligado.
```

## Edicao 1b — `meta/STATUS.md` · Em Progresso

**Substituir.** Ancora:

```
- Nada em andamento no produto. A sessão de 2026-11-07 foi de transferência de contexto (handoff) — ver `261107-HANDOFF-BRIEF.md`.
```

**Por:**

```
- Nada em andamento no produto. A conversa de 2026-11-10 foi de processo: merge do KCM v1.135.0 e migração ASU → Code (esta wo0001 é o registro).
```

## Edicao 1c — `meta/STATUS.md` · bug do scroll por aba

**Substituir.** Ancora:

```
- Nenhum bug conhecido no produto.
```

**Por:**

```
- **Abas compartilham a posição de rolagem** `[relatado pelo dono, 2026-11-10]` — com 2 arquivos abertos, rolar um deles faz o outro abrir já rolado (no fim). Causa não investigada; suspeita a confirmar lendo o código: o container de rolagem do viewer é o mesmo elemento para todas as abas e não guarda posição por arquivo.
```

## Edicao 1d — `meta/STATUS.md` · sai o item do f626337 (resolvido)

**Substituir (remove a 2a linha).** Ancora:

```
- [ ] **Tooltips customizados** na toolbar do editor MD.
- [ ] **Verificar o commit `f626337` ("correcao asu0003", 2026-07-24)** — não há log nem entrada no CHANGELOG sobre o que ele mudou. O `CsvViewer.jsx` do snapshot de 2026-11-06 contém a navegação Tab completa (+ uma linha em branco residual dentro do `onKeyDown`, entre os handlers de Tab e Escape — cosmético). Rodar `git show f626337 --stat` e registrar o que foi.
```

**Por:**

```
- [ ] **Tooltips customizados** na toolbar do editor MD.
```

## Edicao 1e — `meta/STATUS.md` · saem 2 itens resolvidos + Arquivos Criticos (movido p/ CONTEXT)

**Substituir (remove tudo depois da 1a linha).** Ancora:

```
- [ ] **Atualizar o `README.md` e decidir a versão do `package.json`** — README sem o modo Formulário, edição inline e Tab do CSV; `package.json` ainda em `0.1.0` (CHANGELOG está em 0.1.6). Decidir se a versão do package acompanha o CHANGELOG.
- [ ] **Apagar `meta/HISTORICO.md`** — o `_TREE` de 2026-11-06 mostra o arquivo ainda no repo (e o Projeto também o lista), duplicata antiga do `HISTORY.md`. `git rm meta\HISTORICO.md` + remover do Projeto Claude.
- [ ] **`PROJECT_INSTRUCTIONS.md` não está no repo nem no Projeto** (ausente do `_TREE`). A caixa "Instruções do Projeto" do Claude.ai já mostra `AAMMDD-asuNNNN.yaml` (parece sincronizada). Decidir se o arquivo versionado volta para `meta/` — se voltar, lembrar da armadilha dos dois arquivos de instrução em sincronia (CEREBRO × PROJECT_INSTRUCTIONS).


## 📁 Arquivos Críticos (não mexer sem contexto)
- `src/context/AppContext.jsx` — estado global; PDFs devem ser Blob URL, nunca ArrayBuffer.
- `src/editors/MarkdownEditor.jsx` — configuração Tiptap; `StarterKit.configure({ codeBlock: false })` obrigatório.
- `src/App.css` — todas as CSS vars e classes `.md-output`/`.tiptap-editor`; mudança reflete em tudo.
- `src/viewers/JsonViewer.jsx` — Árvore + FormView (Cards/Tabs/Painel) + ArrayTable (paginação+modal, ambos editáveis desde 2026-07-07 sessão 2) + edição inline do Field. `parseSections`/`SectionContent` compartilhados pelos 3 layouts; `handleUpdate` (no componente principal) é a mesma função usada por TODOS os pontos de edição (Árvore, Field, células do ArrayTable, RowDetailModal) — path dotted, incluindo índice de array quando aplicável. `ROWS_PER_PAGE = 20` controla a paginação; `ROW_CLICK_DELAY = 220` (ms) resolve o conflito clique-abre-modal vs duplo-clique-edita-célula (ver DEC-010).
- `src/viewers/CsvViewer.jsx` — `commitValue` extraída de `commitEdit` (2026-07-07) para ser reaproveitada por `commitAndMove`, que resolve a navegação por Tab; navega sobre `filtered` (ordem visível), não sobre `data` cru — mesmo cuidado do FIX-002 aplicado à navegação, não só à gravação.
- `vite.config.js` — `base: './'` obrigatório para GitHub Pages; não remover.
- `.github/workflows/deploy.yml` — pipeline de deploy automático; node-version 24; não remover.
- `meta/CEREBRO.md` — regras de comportamento; qualquer atualização do kit deve ser mesclada aqui, não sobrescrita.
```

**Por:**

```
- [ ] **Atualizar o `README.md` e decidir a versão do `package.json`** — README sem o modo Formulário, edição inline e Tab do CSV; `package.json` ainda em `0.1.0` (CHANGELOG está em 0.1.6). Decidir se a versão do package acompanha o CHANGELOG.
```

## Edicao 1f — `meta/STATUS.md` · Ultima conversa

**Substituir.** Ancora:

```
## 💬 Última Sessão
**2026-11-07 (sessão 4 — handoff)** — Sessão só de preparação para trocar de conversa; **nenhum código do produto foi alterado**. Entregues o `261107-HANDOFF-BRIEF.md` (arquivo novo; atalho de arranque — a memória continua nestes docs de `meta/`), este patch `261107-asu0004.yaml` e o log `logs/2026-11-07.md`. Por pedido explícito do usuário, STATUS/IDEAS foram atualizados por ASU em vez de arquivo inteiro (exceção à regra dos docs rolantes). Limitação: a sandbox não tinha o mount do Projeto — o estado foi lido via `project_read`; as âncoras do ASU foram simuladas só contra STATUS/IDEAS/DECISIONS (cópias em disco) e CONTEXT/GLOSSARY só tiveram as linhas-alvo conferidas, então **o dry-run do ASU é obrigatório**. Achados: `CsvViewer.jsx` já contém a navegação Tab (0.1.6 aplicada; o commit `f626337` "correcao asu0003" de 2026-07-24 não foi inspecionado); `DECISIONS.md` tinha perdido o cabeçalho `## FIX-001` (restaurado, título reconstruído do corpo); `meta/HISTORICO.md` segue no repo; `PROJECT_INSTRUCTIONS.md` não está no repo; CONTEXT/GLOSSARY estavam velhos (nomenclatura ASU, edição inline, Tab, layout de `meta/ASU/`) — atualizados. Último trabalho de produto: 2026-07-07 (sessão 3, CSV Tab, 0.1.6). Próximo passo: ver `261107-HANDOFF-BRIEF.md`.
```

**Por:**

```
## 💬 Última conversa
**2026-11-10 (chat, com a pasta vinculada)** — Só processo, **nenhum código do produto alterado**. Merge do KCM v1.135.0 + migração ASU → modo Code (DEC-011): `CLAUDE.md`, `.claude/`, `INSTRUCOES-DO-PROJETO.md` (commit `6925a88`); CEREBRO/CONTEXT/GLOSSARY/LOG-TEMPLATE/.gitignore/.flatdropignore reescritos pelo chat e versionados por esta wo0001; `meta/ASU/` fora do repo. Resolvidos de passagem: `f626337` era só docs (`git show --stat`), `HISTORICO.md` já tinha saído, `PROJECT_INSTRUCTIONS.md` virou `INSTRUCOES-DO-PROJETO.md`. Próximo passo: escolher a frente de produto — o bug do scroll por aba (Quebrado) é candidato. Detalhe em `logs/2026-11-10.md`.
```

## Edicao 2a — `meta/DECISIONS.md` · status do DEC-009

**Substituir.** Ancora:

```
**Data:** 2026-07-03 · **Status:** aceita (com uma pergunta em aberto para o usuário)
```

**Por:**

```
**Data:** 2026-07-03 · **Status:** aceita (pergunta em aberto resolvida em 2026-07-07; a parte de ASU foi substituída por DEC-011 em 2026-11-10)
```

## Edicao 2b — `meta/DECISIONS.md` · DEC-011 + status do FIX-001

**Substituir (insere a DEC-011 antes do FIX-001).** Ancora:

```
## FIX-001 — PDF: ArrayBuffer detachado ao remontar o viewer
**Data:** 2026-06-05

- **Sintoma:** `⚠ Erro ao abrir PDF: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.`
```

**Por:**

```
## DEC-011 — Migração do modo ASU para o modo Code (KCM v1.135.0)
**Data:** 2026-11-10 · **Status:** aceita

### Contexto
Desde 2026-06-27 toda mudança de código saía do chat como patch ASU (`.yaml`) que o dono aplicava à mão, e os docs iam inteiros para baixar; o Projeto do claude.ai era alimentado pelo FlatDrop. O template-update do KCM v1.135.0 chegou gerado com `Code sim · ASU nao`, o que não batia com o projeto — o chat parou antes de comparar. O dono confirmou: a mudança de forma de trabalho é de propósito. O chat passa a ler e gravar direto na pasta do projeto (app desktop com a pasta vinculada) e o Claude Code passa a executar no repositório.

### Decisão
Modo Code, ASU desligado. Divisão de quem escreve (padrão do kit, adotado sem desvio):
- **Chat** escreve inteiros: `meta/CEREBRO.md`, `meta/CONTEXT.md`, `meta/GLOSSARY.md`, `meta/LOG-TEMPLATE.md`, `INSTRUCOES-DO-PROJETO.md`, `.claude/settings.json`, análises e WOs; cria o log do dia quando ele não existe. Git pelo chat é só leitura.
- **Code** escreve código, `meta/STATUS.md`, `meta/DECISIONS.md`, `meta/CHANGELOG.md` (append) e a sua seção do log; roda o build; commita e empurra.
- `meta/IDEAS.md`, `meta/HISTORY.md`, `meta/ROADMAP.md` e todo doc grande e vivo mudam por WO.
- As Instruções do Projeto têm fonte no repo (`INSTRUCOES-DO-PROJETO.md`); o painel do claude.ai é cópia. FlatDrop vira canal de reserva.

### Alternativas consideradas
- **Manter o ASU** — descartada pelo dono: o chat com a pasta vinculada já grava no disco, e o patch `.yaml` aplicado à mão virou passo a mais.
- **Híbrido ASU + Code** — descartada: duas formas de mudar código no mesmo repo são dois escritores sem regra; o kit orça o ASU como modo próprio.
- **Regerar o pacote com `ASU sim`** — perdeu o sentido quando o dono decidiu migrar.

### Consequências
Commit `6925a88` instalou as superfícies do Code e tirou `meta/ASU/` do repo (os 4 arquivos foram para `../_para-excluir-asu/`). As armadilhas do ASU viraram histórico (HISTORY.md §5). O CEREBRO cresceu de ~36 KB para ~106 KB (base genérica do kit v1.135.0) — o que é deste projeto mora em «Técnicas específicas». Push na `main` continua sendo deploy em produção, agora feito pelo Code.

---

## FIX-001 — PDF: ArrayBuffer detachado ao remontar o viewer
**Data:** 2026-06-05 · **Status:** resolvida

- **Sintoma:** `⚠ Erro ao abrir PDF: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.`
```

## Edicao 2c — `meta/DECISIONS.md` · status do FIX-002

**Substituir.** Ancora:

```
## FIX-002 — CSV: edição-enquanto-filtrado descartava linhas fora do filtro
**Data:** 2026-06-05

- **Sintoma:** Filtrar + editar + salvar descartava as linhas fora do filtro.
```

**Por:**

```
## FIX-002 — CSV: edição-enquanto-filtrado descartava linhas fora do filtro
**Data:** 2026-06-05 · **Status:** resolvida

- **Sintoma:** Filtrar + editar + salvar descartava as linhas fora do filtro.
```

## Edicao 3a — `meta/IDEAS.md` · 2 ideias do dono (abas)

**Substituir (a ancora fica, as ideias entram depois).** Ancora:

```
A tabela atual funciona mas não é fluida como planilha real. Melhorias desejadas: ~~Tab para mover entre células~~ (implementado em 2026-07-07, ver Concluídas), seleção de múltiplas células, copiar/colar bloco de células, resize de colunas arrastando o header, freeze de linha de cabeçalho (já tem) e possível freeze da primeira coluna. Itens ainda em aberto: seleção múltipla, copiar/colar bloco, resize de coluna, freeze da primeira coluna.
```

**Por:**

```
A tabela atual funciona mas não é fluida como planilha real. Melhorias desejadas: ~~Tab para mover entre células~~ (implementado em 2026-07-07, ver Concluídas), seleção de múltiplas células, copiar/colar bloco de células, resize de colunas arrastando o header, freeze de linha de cabeçalho (já tem) e possível freeze da primeira coluna. Itens ainda em aberto: seleção múltipla, copiar/colar bloco, resize de coluna, freeze da primeira coluna.

### 2026-11-10 — Abas: fechar com o botão do meio do mouse
`[relatado pelo dono]` Como nas abas do navegador: clique do meio numa aba (e no item da Sidebar) fecha o arquivo. Mesma regra do ✕ atual — arquivo com alteração não salva precisa de confirmação ou do mesmo comportamento que o ✕ já tem.

### 2026-11-10 — Abas: atalhos de teclado para fechar e alternar
`[relatado pelo dono]` Fechar a aba ativa e alternar entre abas pelo teclado, no espírito de Ctrl+W e Ctrl+PgDn/PgUp. **O próprio dono apontou o problema:** esses atalhos são do navegador. `[a confirmar]` O Chrome não deixa uma página web cancelar Ctrl+W nem a troca de aba por Ctrl+PgUp/PgDn; as saídas prováveis são atalhos próprios (ex.: Alt+W, Alt+←/→) ou o FileView instalado como app (PWA/F4), onde o navegador libera mais atalhos. Medir antes de prometer.
```

## Edicao 3b — `meta/IDEAS.md` · secao Adiadas

**Substituir.** Ancora:

```
## ✅ Concluídas
```

**Por:**

```
## 🛌 Adiadas
> Decisão consciente de não fazer agora. Cada item com **o gatilho que a traz de volta**: ideia adiada sem gatilho é ideia perdida.
- _(nenhuma ainda)_

---

## ✅ Concluídas
```

## Edicao 3c — `meta/IDEAS.md` · concluida: migracao Code

**Substituir (a ancora fica, a linha nova entra depois).** Ancora:

```
- **CSV: navegação por Tab entre células** — Tab confirma e move para a próxima coluna/linha (Shift+Tab volta), seguindo a ordem visível (`filtered`). 2026-07-07 (sessão 3). Ver STATUS/CHANGELOG 0.1.6.
```

**Por:**

```
- **CSV: navegação por Tab entre células** — Tab confirma e move para a próxima coluna/linha (Shift+Tab volta), seguindo a ordem visível (`filtered`). 2026-07-07 (sessão 3). Ver STATUS/CHANGELOG 0.1.6.
- **Migração ASU → modo Code** — 2026-11-10, junto do merge do KCM v1.135.0. Ver DEC-011.
```

## Edicao 3d — `meta/IDEAS.md` · feedback para o Kit

**Substituir (a ancora fica, as linhas novas entram depois).** Ancora:

```
- **2026-11-07 — Transferência de conversa (HANDOFF-BRIEF) chegou como pedido ad hoc.** Não confirmei se o `CEREBRO.md` tem gatilho/formato para isso (a busca no Projeto veio sem trechos). Se não tiver, vale propor ao kit: gatilho "conversa pesada → HANDOFF-BRIEF" + template de seções (onde estamos · feito e por quê · pendências com 1º passo · próxima frente e indecisões · armadilhas · ritual + config). Também registrar o modo "handoff incremental": o usuário pediu patches ASU até para docs rolantes (STATUS/IDEAS), contrariando o padrão "rolante = arquivo inteiro" — a regra atual não prevê essa exceção.
```

**Por:**

```
- **2026-11-07 — Transferência de conversa (HANDOFF-BRIEF) chegou como pedido ad hoc.** Não confirmei se o `CEREBRO.md` tem gatilho/formato para isso (a busca no Projeto veio sem trechos). Se não tiver, vale propor ao kit: gatilho "conversa pesada → HANDOFF-BRIEF" + template de seções (onde estamos · feito e por quê · pendências com 1º passo · próxima frente e indecisões · armadilhas · ritual + config). Também registrar o modo "handoff incremental": o usuário pediu patches ASU até para docs rolantes (STATUS/IDEAS), contrariando o padrão "rolante = arquivo inteiro" — a regra atual não prevê essa exceção.
- **2026-11-10 — O carimbo de modos decide «sobra» só pelo arquivo, e aqui teria apagado o fluxo vivo.** O pacote v1.135.0 veio com `ASU nao`; a regra do manifesto («marcador presente + modo `nao` = sobra, remova») mandava apagar a seção ASU do CEREBRO de um projeto que ainda vivia de ASU (`meta/ASU/`, DEC-009, quatro `asuNNNN.yaml`). O dono estava migrando de propósito, mas não tinha avisado. Sugestão: antes de declarar sobra, conferir se o projeto USA o modo (artefatos dele no repo); se usa, é pergunta para o dono, não remoção.
- **2026-11-10 — A pergunta de 2026-11-07 sobre o HANDOFF-BRIEF está respondida pelo kit:** o v1.135.0 já nomeia `AAMMDD-HANDOFF-BRIEF.md` no bloco de fecho e diz que ele nunca é versionado.
- **2026-11-10 — Desvio registrado: pasta de arquivo `zz_notas-arquivadas/`** (o kit diz `notas-arquivadas/`). Nome do dono, mantido; está em «Técnicas específicas» do CEREBRO e nas Instruções.
- **2026-11-10 — Custo do CEREBRO v1.135.0:** ~106 KB contra ~36 KB do anterior. É lido sob demanda (as Instruções são o que roda todo turno), mas o tamanho torna a comparação bloco a bloco cara; um índice de seções no topo ajudaria.
```

## Edicao 3e — `meta/IDEAS.md` · encerra Feedback para o ASU

**Substituir (a ancora fica, a linha nova entra depois).** Ancora:

```
> Observações sobre a ferramenta ASU em si (o Atualizador Automático de Scripts) — separado do Kit de Contexto, é outra ferramenta.
```

**Por:**

```
> Observações sobre a ferramenta ASU em si (o Atualizador Automático de Scripts) — separado do Kit de Contexto, é outra ferramenta.
> **Encerrada em 2026-11-10:** o ASU foi desligado (DEC-011). As entradas abaixo ficam como histórico; os três pontos «não verificado» do asu0004 não serão mais conferidos.
```

## Edicao 4 — `meta/HISTORY.md` · secao 5: periodo ASU

**Substituir (a ancora fica, a secao 5 entra depois).** Ancora:

```
**Padrão observado, útil para próximas atualizações do kit:** o kit tende a formalizar por escrito práticas que um projeto maduro já adota na prática (ex.: a distinção de escopo do ASU já era seguida aqui antes de virar regra explícita). Isso sugere que acompanhar atualizações do kit é mais sobre confirmar/documentar boas práticas emergentes do que sobre mudanças disruptivas — reduz o risco de tratar cada atualização como algo que exige grande retrabalho.
```

**Por:**

```
**Padrão observado, útil para próximas atualizações do kit:** o kit tende a formalizar por escrito práticas que um projeto maduro já adota na prática (ex.: a distinção de escopo do ASU já era seguida aqui antes de virar regra explícita). Isso sugere que acompanhar atualizações do kit é mais sobre confirmar/documentar boas práticas emergentes do que sobre mudanças disruptivas — reduz o risco de tratar cada atualização como algo que exige grande retrabalho.

## 5. O período ASU (2026-06-27 a 2026-11-07) — convenções e armadilhas

O ASU («Atualizador Automático de Scripts») foi a ferramenta de todas as mudanças de código deste projeto entre 2026-06-27 e 2026-11-07: o chat entregava um `.yaml` de patch, o dono aplicava com `python -m src apply <arquivo>.yaml --root <RAIZ> --dry-run` (e depois sem `--dry-run`). Desligado em 2026-11-10 (DEC-011). Os guias (`INSTRUCTION_GUIDE.md`, `PROMPT_IA.md`, `GUIA_PASSO_A_PASSO.md`, `demo.yaml`) saíram do repo no commit `6925a88`; os `.yaml` aplicados estão em `zz_notas-arquivadas/`.

**Convenções:** nome `AAAA-MM-DD_NNN_descricao.yaml` até 2026-07-01 e `AAMMDD-asuNNNN.yaml` (sequência global, `asu0001`–`asu0004`) a partir de 2026-07-07 (DEC-009); `replace_file` para o `JsonViewer.jsx`, que mudava estruturalmente a cada conversa; `replace_context_block` para arquivo estável (`CsvViewer.jsx`) e, no `asu0004`, para docs; docs rolantes (STATUS/CHANGELOG/IDEAS/HISTORY) iam inteiros, nunca por patch — a edição neles é holística.

**Sub-armadilhas do ASU (aprendidas em 2026-07-07):** (a) em `replace_file`, use bloco `|` simples — o indicador `|2` deslocou o conteúdo 2 espaços e corrompeu o arquivo SEM erro; (b) bater o `new_content` byte a byte com o fonte não prova que o fonte é JS válido — rodar o Babel (`transformSync` + `@babel/preset-react`; em Babel 8 `transform` é assíncrono); (c) com várias modificações encadeadas no mesmo arquivo, simular a instrução INTEIRA em sequência, não cada âncora isolada; (d) âncoras em ASCII (usar `.*`/`.+` no lugar de ã, —, setas, box-drawing); (e) quando uma convenção vive em dois arquivos de instrução (CEREBRO × PROJECT_INSTRUCTIONS), conferir os dois.

**O que ainda vale no modo Code:** (b) e (c) continuam verdadeiros para qualquer WO de código — byte a byte não prova sintaxe (o `npm run build` é a rede), e edições encadeadas no mesmo arquivo se simulam em sequência; (e) virou regra do kit (as Instruções têm uma fonte só, `INSTRUCOES-DO-PROJETO.md`).
```

## Edicao 5 — remover o arquivo `git` da raiz

```
git rm git
```

---

## Fora de escopo

- Nao investigar nem corrigir o bug do scroll por aba — so registrar.
- Nao editar CEREBRO, CONTEXT, GLOSSARY, LOG-TEMPLATE, `.gitignore`, `.flatdropignore` nem `INSTRUCOES-DO-PROJETO.md` (sao do chat; so versionar).
- Nao tocar em `meta/CHANGELOG.md` (ele so registra o PRODUTO; ver a nota no topo dele) nem em `meta/ROADMAP.md`.
- Nao mover nada fora do repo (o pacote do KCM e a nota `261110-1620.txt` o chat arquiva depois).

## Armadilhas desta WO

- Ancoras longas de uma linha so (itens do Backlog, entradas do IDEAS): copie do bloco **Ancora** inteiro; nao reconstrua.
- A 2b insere um bloco que comeca com `## DEC-011` e termina com `---` + linha em branco, imediatamente antes de `## FIX-001`. A linha `---` que ja existia antes do FIX-001 continua no lugar: depois de aplicar, entre o fim da DEC-010 e a DEC-011 ha um `---`, e entre a DEC-011 e o FIX-001 outro.

---

## Depois de aplicar — conferencia antes do commit

- [ ] `git status --short` mostra exatamente: `M .flatdropignore`, `M .gitignore`, `D git`, `M meta/CEREBRO.md`, `M meta/CONTEXT.md`, `M meta/DECISIONS.md`, `M meta/GLOSSARY.md`, `M meta/HISTORY.md`, `M meta/IDEAS.md`, `M meta/LOG-TEMPLATE.md`, `M meta/STATUS.md`, `?? logs/2026-11-10.md`, `?? meta/workorders/261110-wo0001-registro-migracao-code.md` (13 entradas; `git rm` ja poe o `D` no indice). Nada alem.
- [ ] Saldo de linhas (`wc -l`, simulado pelo chat a partir do texto desta WO; unidade = linhas): `meta/STATUS.md` 55 → 41 (−14) · `meta/DECISIONS.md` 226 → 249 (+23) · `meta/IDEAS.md` 100 → 118 (+18) · `meta/HISTORY.md` 92 → 102 (+10). Rode `wc -l` antes e depois; saldo diferente = VERMELHO.
- [ ] Contagens ancoradas (unidade = linhas; todas simuladas):
  - `grep -c "^## 📁 Arquivos Críticos" meta/STATUS.md` → 0 · e em `meta/CONTEXT.md` → 1 (a metade inserida pelo chat)
  - `grep -c "^## 💬 Última conversa" meta/STATUS.md` → 1 · `grep -c "^## 💬 Última Sessão" meta/STATUS.md` → 0
  - `grep -c "^- \[ \] \*\*Verificar o commit" meta/STATUS.md` → 0 · `grep -c "^- \[ \] \*\*Apagar" meta/STATUS.md` → 0
  - `grep -c "^## DEC-011" meta/DECISIONS.md` → 1
  - `grep -c "^\*\*Data:\*\* 2026-06-05 · \*\*Status:\*\* resolvida$" meta/DECISIONS.md` → 2
  - `grep -c "^## 🛌 Adiadas" meta/IDEAS.md` → 1 · `grep -c "^### 2026-11-10 — Abas" meta/IDEAS.md` → 2
  - `grep -c "^## 5\. O período ASU" meta/HISTORY.md` → 1
  - `git ls-files git` → vazio
- [ ] **Leitura** (nao cabe em grep): abra `meta/DECISIONS.md` e confira que a ordem e DEC-010 → `---` → DEC-011 → `---` → FIX-001 → `---` → FIX-002.
- [ ] **WO so de doc:** nao precisa de build — a rede e o `git diff`. Esta pergunta e «esta la?»; «o texto presta?» e do chat, que o escreveu.
- [ ] Nada criado fora do repo por esta WO, exceto o relatorio na pasta-pai.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O que foi feito · o que fugiu do texto literal da WO · arquivos tocados · resultado das conferencias (saida crua + comando) · o commit e o push. Escreva-o DEPOIS de resolver o push. Grave tambem em `../AAMMDD-HHMM-code-fileview-apply-wo0001.txt` (`date +%y%m%d-%H%M` na hora).

## Commit — blocos separados, mensagem SEM acento

```
git add .flatdropignore .gitignore meta/CEREBRO.md meta/CONTEXT.md meta/DECISIONS.md meta/GLOSSARY.md meta/HISTORY.md meta/IDEAS.md meta/LOG-TEMPLATE.md meta/STATUS.md logs/2026-11-10.md meta/workorders/261110-wo0001-registro-migracao-code.md
```

```
git commit -m "docs(meta): registra migracao ASU para modo Code (wo0001)" -m "Chat: CEREBRO na base KCM v1.135.0, CONTEXT, GLOSSARY, LOG-TEMPLATE, .gitignore com dist/, .flatdropignore, log do dia." -m "Code: DEC-011, Status nos FIX, STATUS limpo das pendencias resolvidas, ideias de abas, IDEAS com Adiadas, HISTORY secao 5. Remove arquivo-lixo git da raiz."
```

```
git push
```

*Gerado pelo Kit de Contexto Universal v1.135.0 — 2026-11-10 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
