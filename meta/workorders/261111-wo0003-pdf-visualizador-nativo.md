# WO 0003 — PDF no visualizador nativo do navegador (iframe), sem pdfjs-dist (DEC-012)

> **Tipo:** mista — CODIGO (`PdfViewer.jsx`, `vite.config.js`, dependencia, comentario do `AppContext.jsx`, README) + registro nos meta/.
> **Config sugerida:** Sonnet, `/effort medium`.
> **Pre-requisito:** escrita sobre `91e1233` (`docs(meta): fecha wo0002 no STATUS e no log do dia`). `git status --short` ao comecar: so os 3 arquivos do chat abaixo modificados + esta WO nao rastreada.
> **Base:** prints do dono de 2026-11-11 (zoom do PDF nao muda o tamanho) e a escolha dele da opcao B; causa lida pelo chat em `src/viewers/PdfViewer.jsx`.
> **Depende de:** `wo0002` (aplicada, `3d108e5`): o `ViewerRouter` ja remonta o viewer por aba.
> **Arquivos que o chat gravou no disco e esta WO versiona** (sha1 medido ao gravar):
>   - `meta/CONTEXT.md` — `ad97618b7d0d561844725212914873059bc13786`
>   - `meta/GLOSSARY.md` — `b0ab50dd454d26a5610dd581dc139f751f1e1e18`
>   - `logs/2026-11-11.md` — `82c99b7019bbe5e4b0f338fed7616c00008a412a`
> **Guarda do arquivo substituido inteiro:** `src/viewers/PdfViewer.jsx` tem de estar com sha1 `2fb9b9bea42b87d85fa67eac17693fb0cedf7ae4` (lido pelo chat neste turno, 152 linhas). Diferente = alguem mexeu: PARE.
> **Ancora semantica:** se um trecho-ancora nao bater EXATAMENTE, **PARE e reporte**.
> **Idempotencia:** antes de cada edicao, procure o texto NOVO INTEIRO. Ja aplicada = texto novo inteiro presente **e a ancora nao** — salvo na forma «trocar», em que o texto novo contem a ancora (6a, 7, 8, 9c, 9e). Na forma REMOCAO o texto novo e um pedaco da ancora (2, 6d, 9b): ali ja aplicada = ancora ausente. Ja aplicada: PULE e diga.
> **Ancoras lidas em:** recortadas por script, neste turno, das linhas reais sobre `91e1233`: `vite.config.js` (2), `src/context/AppContext.jsx` (4), `README.md` (5a, 5b), `meta/STATUS.md` (6a–6d), `meta/CHANGELOG.md` (7), `meta/DECISIONS.md` (8), `meta/IDEAS.md` (9a–9e), `meta/ROADMAP.md` (10). O trecho literal de cada uma e o bloco **Ancora** da edicao. Simulacao a partir do texto desta WO, numa copia: ancora = 1 ocorrencia em todas.
> **Fim de linha:** `README.md` e `package.json` sao CRLF na arvore (`i/lf w/crlf`); os demais tocados sao LF. As ancoras do README sao de UMA linha.
> **Proximo comando:** nenhum — conferencia na tela e do dono, pelo roteiro entregue no chat no mesmo turno.

> **Canal dos meta neste ciclo = CODE.** Aplique as edicoes dos `meta/` como escritas. CONTEXT, GLOSSARY e o log ja foram atualizados pelo chat — so confira o hash e versione.

---

## 1. Por que

O zoom do `PdfViewer` nao funcionava: o `<canvas>` e item de um contêiner flex com `align-items` no padrao (`stretch`) e tem `maxWidth: 100%` — a altura e esticada para a do contêiner e a largura sai da proporcao, entao a escala so muda a nitidez (prints do dono: 240% e 300% com a mesma pagina na tela). Alem disso o canvas nao tem camada de texto (sem busca nem selecao) e Ctrl+roda ampliava a pagina do Chrome. O dono decidiu (opcao B): trocar o visualizador proprio pelo do navegador, num `<iframe>` com a Blob URL que o `AppContext` ja produz. `pdfjs-dist` sai.

**Medido e deduzido:** a causa do zoom e **lida** no codigo (estilos do contêiner e do canvas) e bate com os prints; que o Chrome renderiza Blob URL `application/pdf` em `<iframe>` com o visualizador nativo e o comportamento conhecido do Chrome desktop — **a confirmacao e o roteiro do dono**.

## Inventario — de onde saiu a lista

`git grep -n -i -e "pdfjs" -e "pdf\.js" -e "pdf-lib" -e "PdfViewer" 91e1233 -- . ':!package-lock.json' ':!logs' ':!meta/workorders' ':!dist'` (medido pelo chat): **39 linhas em 14 arquivos** — README 2, CHANGELOG 2, CONTEXT 5, DECISIONS 6, GLOSSARY 2, HISTORY 2, IDEAS 1, ROADMAP 3, STATUS 1, package.json 1, ViewerRouter.jsx 2, AppContext.jsx 1, PdfViewer.jsx 10, vite.config.js 1. Rode o mesmo comando; numero diferente = PARE antes de editar. Ficam como estao (relato/historico): `meta/CHANGELOG.md` (entradas 0.1.0/0.1.1), `meta/HISTORY.md` §1, `meta/DECISIONS.md` FIX-001 e DEC-005, `meta/ROADMAP.md` F1 e FIX-001, `meta/DECISIONS.md` FIX-003 (cita PDF.js como alternativa), `meta/CONTEXT.md` linha da analise de viabilidade. Mudam: `PdfViewer.jsx` (1), `package.json`/lock (3), `vite.config.js` (2), comentario do `AppContext.jsx` (4), README (5a, 5b), STATUS (6b), IDEAS (9b), ROADMAP F3 (10); CONTEXT e GLOSSARY ja mudados pelo chat. `ViewerRouter.jsx` continua importando `PdfViewer` — nada a mudar la.

---

## Edicao 0 — conferir hashes

```
sha1sum meta/CONTEXT.md meta/GLOSSARY.md logs/2026-11-11.md src/viewers/PdfViewer.jsx
```

Os quatro tem de bater com o cabecalho. Diferente = PARE e reporte.

## Edicao 1 — `src/viewers/PdfViewer.jsx` · substituir o arquivo INTEIRO

**Substituir todo o conteudo por** (22 linhas, LF):

```
import { useApp } from '../context/AppContext'

/**
 * Mostra o PDF ativo com o visualizador nativo do navegador, embutido num <iframe>.
 *
 * `activeFile.content` e uma Blob URL (ver AppContext.openFile e FIX-001). O
 * navegador cuida de zoom (inclusive Ctrl+roda), busca, selecao de texto,
 * impressao e miniaturas — DEC-012. O ViewerRouter ja remonta este componente
 * a cada aba (key = id do arquivo, FIX-003).
 */
export default function PdfViewer() {
  const { activeFile } = useApp()
  if (!activeFile) return null

  return (
    <iframe
      src={activeFile.content}
      title={activeFile.name}
      style={{ display: 'block', width: '100%', height: '100%', border: 'none', background: '#3A3A38' }}
    />
  )
}
```

## Edicao 3 — `package.json` + `package-lock.json` · remover a dependencia

```
npm uninstall pdfjs-dist
```

(Atualiza os dois arquivos. Se `node_modules` faltar, rode `npm ci` antes.)

## Edicao 2 — `vite.config.js` · sai o optimizeDeps do pdfjs

**Substituir.** Ancora:

```
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
```

**Por:**

```
  plugins: [react()],
```

## Edicao 4 — `src/context/AppContext.jsx` · comentario da Blob URL

**Substituir.** Ancora:

```
      // ARMADILHA (FIX-001): PDF.js v4 faz postMessage com transfer do ArrayBuffer
      // para o worker, o que o DETACHA do main thread permanentemente.
      // Na remontagem do componente, o buffer estaria morto → erro "already detached".
      // Solução: converter para Blob URL (string) — imune a transfer/detachment.
```

**Por:**

```
      // PDF vira Blob URL (string): é o que o <iframe> do PdfViewer abre (DEC-012).
      // Origem da regra (FIX-001): quando o PDF.js desenhava o PDF, o transfer do
      // ArrayBuffer para o worker o DETACHAVA; guardar a URL, nunca o buffer, evita isso.
      // closeFile revoga a URL — revogar antes de fechar deixa o iframe em branco.
```

## Edicao 5a — `README.md` · README: arvore

**Substituir.** Ancora:

```
    │   └── PdfViewer.jsx       # Leitor PDF com PDF.js
```

**Por:**

```
    │   └── PdfViewer.jsx       # PDF no visualizador nativo do navegador (iframe)
```

## Edicao 5b — `README.md` · remover a linha do `pdfjs-dist` da tabela de dependencias

**Remover a linha inteira** (com o seu fim de linha; o arquivo e CRLF). Linha alvo, unica no arquivo:

```
| `pdfjs-dist` | Renderização de PDF no browser |
```

Comando sugerido (Git Bash; preserva o CRLF das outras linhas): `sed -i '/^| `pdfjs-dist` | Renderização de PDF no browser |\r\?$/d' README.md`

## Edicao 6a — `meta/STATUS.md` · versao 0.1.8

**Substituir.** Ancora:

```
**[0.1.7]** — 2026-11-11 — Abas: cada arquivo aberto tem rolagem e estado de UI próprios (FIX-003). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-11).
```

**Por:**

```
**[0.1.8]** — 2026-11-11 — PDF no visualizador nativo do navegador (`<iframe>`), sem `pdfjs-dist` (DEC-012). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-11).
**[0.1.7]** — 2026-11-11 — Abas: cada arquivo aberto tem rolagem e estado de UI próprios (FIX-003). **Conferido na tela pelo dono: 6/6 ok.**
```

## Edicao 6b — `meta/STATUS.md` · PDF em Funcionando

**Substituir.** Ancora:

```
- **PDF:** renderização por canvas via pdfjs-dist, navegação por páginas, zoom 50%–300% — Blob URL, sem erro de ArrayBuffer detachado
```

**Por:**

```
- **PDF:** visualizador nativo do navegador dentro da aba do FileView (`<iframe>` com a Blob URL, DEC-012) — zoom, Ctrl+roda, busca, seleção de texto, impressão e miniaturas vêm do navegador. Só leitura (DEC-004).
```

## Edicao 6c — `meta/STATUS.md` · Em Progresso

**Substituir.** Ancora:

```
- Nada em andamento no produto. A 0.1.7 (FIX-003, commit `3d108e5`) está no ar; falta só a conferência na tela pelo dono.
```

**Por:**

```
- Nada em andamento no produto. A 0.1.8 (DEC-012) está no ar; falta a conferência na tela pelo dono. **Volta atrás combinada:** se o visual nativo não agradar, a opção C (abrir o PDF numa aba nova do navegador) está registrada em IDEAS → Adiadas.
```

## Edicao 6d — `meta/STATUS.md` · tira do backlog o teste das abas (feito)

**Substituir.** Ancora:

```
- [ ] **Testar no navegador (nunca confirmado):** abas (FIX-003) — abrir 2 arquivos do mesmo tipo, rolar um e trocar: o outro abre no topo, sem filtro/zoom do primeiro; CSV — Tab/Shift+Tab (bordas, com filtro e ordenação ativos); JSON Formulário — edição inline em `Field`, células do `ArrayTable` e `RowDetailModal` (string, number, boolean, null, texto longo; sensação dos 220 ms do DEC-010). **Suspeita a confirmar:** número digitado inválido vira `NaN` em `parseEditedValue` e `JSON.stringify` grava `null`; `null` editado volta sempre `null`; boolean ≠ `"true"` vira `false` (ver IDEAS).
```

**Por:**

```
- [ ] **Testar no navegador (nunca confirmado):** CSV — Tab/Shift+Tab (bordas, com filtro e ordenação ativos); JSON Formulário — edição inline em `Field`, células do `ArrayTable` e `RowDetailModal` (string, number, boolean, null, texto longo; sensação dos 220 ms do DEC-010). **Suspeita a confirmar:** número digitado inválido vira `NaN` em `parseEditedValue` e `JSON.stringify` grava `null`; `null` editado volta sempre `null`; boolean ≠ `"true"` vira `false` (ver IDEAS).
```

## Edicao 7 — `meta/CHANGELOG.md` · entrada 0.1.8

**Substituir.** Ancora:

```
## [0.1.7] — 2026-11-11
```

**Por:**

```
## [0.1.8] — 2026-11-11
### Modificado
- **PDF no visualizador nativo do navegador (DEC-012):** o PDF abre dentro da aba do FileView num `<iframe>`, com o visualizador do próprio navegador — zoom (inclusive Ctrl+roda), busca, seleção de texto, impressão e miniaturas.

### Removido
- **`pdfjs-dist`** e o visualizador próprio por canvas (navegação de página, zoom 50%–300%, «Reset»/«Ajustar»). O zoom dele não funcionava: o canvas era esticado à altura do contêiner, e o tamanho na tela não mudava.

---

## [0.1.7] — 2026-11-11
```

## Edicao 8 — `meta/DECISIONS.md` · DEC-012 antes do FIX-001

**Substituir.** Ancora:

```
## FIX-001 — PDF: ArrayBuffer detachado ao remontar o viewer
```

**Por:**

```
## DEC-012 — PDF no visualizador nativo do navegador (iframe), sem pdfjs-dist
**Data:** 2026-11-11 · **Status:** aceita

### Contexto
O `PdfViewer` desenhava cada página em `<canvas>` com `pdfjs-dist`. O zoom estava quebrado (o canvas era item de flex com `align-items: stretch` e `maxWidth: 100%`: a altura seguia o contêiner, então 240% e 300% tinham o mesmo tamanho na tela — prints do dono, 2026-11-11), não havia busca nem seleção de texto (sem camada de texto), e Ctrl+roda ampliava a página do Chrome em vez do PDF. Com a edição de PDF fora de cogitação (DEC-004), o dono observou que o visualizador do navegador já faz melhor o que o nosso fazia.

### Decisão
O PDF abre dentro da aba do FileView num `<iframe>` apontando para a Blob URL do arquivo; o navegador renderiza. `pdfjs-dist` sai das dependências e o `optimizeDeps` dele sai do `vite.config.js`. **Volta atrás combinada com o dono:** se o visual nativo não agradar, passa-se à opção C (abrir em aba nova do navegador) — registrada em IDEAS → Adiadas.

### Alternativas consideradas
- **A. Consertar o canvas** (duas linhas de estilo + Ctrl+roda com listener `{passive: false}`) — continuaria sem busca, seleção de texto e impressão, e com uma dependência grande para manter.
- **C. Abrir em aba nova do navegador** — o mais simples, mas o PDF sai das abas do FileView. Guardada como volta atrás.

### Consequências
Menos código (o `PdfViewer.jsx` cai de 152 para ~15 linhas) e menos uma dependência no bundle. A aparência passa a ser a do navegador, não a do FileView. Em navegador de celular o PDF pode não aparecer embutido (comportamento conhecido do Chrome Android — não testado aqui). A ideia de anotações sobre PDF (F3, `pdf-lib`) é descartada: sem canvas próprio não há onde desenhar. O DEC-004 (só leitura) continua valendo; a frase dele sobre «anotações overlay» como funcionalidade futura deixa de valer. A Blob URL do FIX-001 continua sendo a regra — agora porque o iframe precisa de uma URL.

---

## FIX-001 — PDF: ArrayBuffer detachado ao remontar o viewer
```

## Edicao 9a — `meta/IDEAS.md` · atalhos: confirmado o que o Chrome reserva

**Substituir.** Ancora:

```
`[relatado pelo dono]` Fechar a aba ativa e alternar entre abas pelo teclado, no espírito de Ctrl+W e Ctrl+PgDn/PgUp. **O próprio dono apontou o problema:** esses atalhos são do navegador. `[a confirmar]` O Chrome não deixa uma página web cancelar Ctrl+W nem a troca de aba por Ctrl+PgUp/PgDn; as saídas prováveis são atalhos próprios (ex.: Alt+W, Alt+←/→) ou o FileView instalado como app (PWA/F4), onde o navegador libera mais atalhos. Medir antes de prometer.
```

**Por:**

```
`[relatado pelo dono]` Fechar a aba ativa e alternar entre abas pelo teclado, no espírito de Ctrl+W e Ctrl+PgDn/PgUp. **Confirmado em 2026-11-11 (pesquisa do chat):** no Windows o Chrome reserva Ctrl+N, Ctrl+W, Ctrl+T, Ctrl+Tab, Ctrl+Shift+Tab e Ctrl+PgUp/PgDn — a página nem recebe esses atalhos (proposital: impede um site de prender o usuário numa aba). Saídas: atalhos próprios (ex.: Alt+W, Alt+←/→) e o clique do meio (ideia acima). Atalhos como Ctrl+P e Ctrl+S chegam à página primeiro e podem ser usados.
```

## Edicao 9b — `meta/IDEAS.md` · MOVER 1/2: sai a ideia de anotacoes em PDF (ativas)

**Substituir.** Ancora:

```
### 2026-06-05 — PDF: anotações overlay
`pdf-lib` permite adicionar texto e formas sobre um PDF sem alterar o conteúdo original. Não quebra DEC-004.

### 2026-06-05 — Tema escuro/claro alternável
```

**Por:**

```
### 2026-06-05 — Tema escuro/claro alternável
```

## Edicao 9c — `meta/IDEAS.md` · MOVER 2/2: anotacoes em PDF entra em Descartadas

**Substituir.** Ancora:

```
- **Virtualização de linhas (react-window) no ArrayTable** — complexidade desnecessária para o volume atual de dados (centenas de linhas); paginação simples resolve. Ver DEC-008. Revisitar se algum JSON real chegar a dezenas de milhares de itens.
```

**Por:**

```
- **Virtualização de linhas (react-window) no ArrayTable** — complexidade desnecessária para o volume atual de dados (centenas de linhas); paginação simples resolve. Ver DEC-008. Revisitar se algum JSON real chegar a dezenas de milhares de itens.
- **PDF: anotações overlay via `pdf-lib`** (ideia de 2026-06-05) — descartada em 2026-11-11: com o PDF no visualizador nativo (DEC-012) não há canvas próprio onde desenhar. Volta só se o PDF voltar a ser desenhado pelo FileView.
```

## Edicao 9d — `meta/IDEAS.md` · Adiadas: opcao C do PDF

**Substituir.** Ancora:

```
- _(nenhuma ainda)_
```

**Por:**

```
- **PDF: abrir numa aba nova do navegador em vez de embutido** (opção C da conversa de 2026-11-11) — adiada porque o dono escolheu a B (iframe, DEC-012) — **volta quando** o dono disser que não gostou do visual nativo dentro do FileView.
```

## Edicao 9e — `meta/IDEAS.md` · ideia: Ctrl+roda como zoom de texto

**Substituir.** Ancora:

```
## 🤖 Ideias Ativas — Assistente
```

**Por:**

```
## 🤖 Ideias Ativas — Assistente

### 2026-11-11 — Ctrl+roda como zoom do conteúdo (MD, JSON, CSV, texto)
O Chrome entrega Ctrl+roda à página primeiro: um listener de `wheel` com `{passive: false}` que chama `preventDefault()` quando `ctrlKey` é verdadeiro troca o zoom da página pelo zoom do FileView (é o que Google Maps e Canva fazem; a pinça do touchpad chega como o mesmo evento). Aplicaria um tamanho de fonte por aba nos viewers de texto. O PDF já tem isso de graça desde a 0.1.8 (DEC-012).
```

## Edicao 10 — `meta/ROADMAP.md` · F3: anotacoes em PDF descartada

**Substituir.** Ancora:

```
- [ ] PDF: anotações overlay (highlight, notas) via pdf-lib, sem tocar no conteúdo original
```

**Por:**

```
- [ ] ~~PDF: anotações overlay (highlight, notas) via pdf-lib~~ — descartado em 2026-11-11 (DEC-012: PDF no visualizador nativo).
```

---

## Fora de escopo

- Nao implementar a opcao C (aba nova) nem Ctrl+roda nos outros viewers — sao ideias (9d, 9e).
- Nao mexer no `AppContext.jsx` alem do comentario (a criacao/revogacao da Blob URL continua igual).
- Nao reescrever o README alem das duas linhas (atualizar o README todo segue no Backlog).
- Nao tocar na versao do `package.json` (`0.1.0`, decisao pendente no STATUS).

## Armadilhas desta WO

- A 9b e a 9c sao as DUAS METADES de um MOVER (a ideia de anotacoes em PDF sai das ativas e entra nas Descartadas): aplique as duas, nesta ordem.
- `README.md` e `package.json` sao CRLF na arvore; o `npm uninstall` regrava o `package.json` (o `git diff` pode acusar fim de linha — o que importa e `git diff --ignore-all-space` mostrar so a linha do `pdfjs-dist`).

---

## Depois de aplicar — conferencia antes do commit

- [ ] `npm run build` sem erro. Erro → PARE.
- [ ] `grep -rn "pdfjs" src vite.config.js package.json` → nenhuma linha. `grep -c '"node_modules/pdfjs-dist"' package-lock.json` → 0.
- [ ] `ls dist/assets | grep -ci pdf` → 0 (o chunk `pdf-*.js` do pdfjs some do build). Unidade = arquivos.
- [ ] `git status --short` mostra exatamente estas 15 entradas: `M README.md`, `M logs/2026-11-11.md`, `M meta/CHANGELOG.md`, `M meta/CONTEXT.md`, `M meta/DECISIONS.md`, `M meta/GLOSSARY.md`, `M meta/IDEAS.md`, `M meta/ROADMAP.md`, `M meta/STATUS.md`, `M package-lock.json`, `M package.json`, `M src/context/AppContext.jsx`, `M src/viewers/PdfViewer.jsx`, `M vite.config.js`, `?? meta/workorders/261111-wo0003-pdf-visualizador-nativo.md`. Qualquer entrada a mais (o `npm` pode criar arquivo): PARE e reporte.
- [ ] Saldo de linhas (`wc -l` antes e depois; simulado pelo chat a partir deste texto): `README.md` 194 → 193 (-1) · `meta/CHANGELOG.md` 95 → 104 (+9) · `meta/DECISIONS.md` 261 → 279 (+18) · `meta/IDEAS.md` 121 → 122 (+1) · `meta/ROADMAP.md` 59 → 59 (+0) · `meta/STATUS.md` 43 → 44 (+1) · `package.json` 40 → 39 (-1) · `src/context/AppContext.jsx` 102 → 102 (+0) · `src/viewers/PdfViewer.jsx` 152 → 22 (-130) · `vite.config.js` 15 → 12 (-3) (o `package.json` simulado como «some a linha do pdfjs-dist»; o lock nao entra no saldo). Saldo diferente = VERMELHO.
- [ ] Contagens ancoradas (unidade = linhas):
  - `grep -c "^## DEC-012" meta/DECISIONS.md` → 1 · `grep -c "^## \[0.1.8\] — 2026-11-11" meta/CHANGELOG.md` → 1 · `grep -c "^\*\*\[0.1.8\]\*\*" meta/STATUS.md` → 1
  - `grep -c "^### 2026-06-05 — PDF: anotações overlay" meta/IDEAS.md` → 0 · `grep -c "^- \*\*PDF: anotações overlay via" meta/IDEAS.md` → 1 · `grep -c "^- _(nenhuma ainda)_" meta/IDEAS.md` → 0 · `grep -c "^### 2026-11-11 — Ctrl+roda" meta/IDEAS.md` → 1
  - `grep -c "^    <iframe" src/viewers/PdfViewer.jsx` → 1 · `grep -c "optimizeDeps" vite.config.js` → 0
- [ ] **Chega no ramo?** `ViewerRouter.jsx` → `ext === 'pdf'` → `PdfViewer` → `<iframe src={activeFile.content}>`. O build responde «compila?»; «o PDF aparece e o zoom funciona?» e do roteiro do dono (olho na tela).
- [ ] Se rodou `npm run dev`, encerre o servidor.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O que foi feito · o que fugiu do texto literal · arquivos tocados · saida crua do build e das conferencias (com o comando) · commit e push. Escreva DEPOIS de resolver o push. Grave tambem em `../AAMMDD-HHMM-code-fileview-apply-wo0003.txt` (`date +%y%m%d-%H%M` na hora).

## Commit — blocos separados, mensagem SEM acento

```
git add README.md package.json package-lock.json vite.config.js src/viewers/PdfViewer.jsx src/context/AppContext.jsx meta/CONTEXT.md meta/GLOSSARY.md meta/STATUS.md meta/CHANGELOG.md meta/DECISIONS.md meta/IDEAS.md meta/ROADMAP.md logs/2026-11-11.md meta/workorders/261111-wo0003-pdf-visualizador-nativo.md
```

```
git commit -m "feat(pdf): usa o visualizador nativo do navegador em iframe (DEC-012)" -m "Remove pdfjs-dist e o canvas proprio, cujo zoom nao mudava o tamanho da pagina. Versao 0.1.8."
```

```
git push
```

*Gerado pelo Kit de Contexto Universal v1.135.0 — 2026-11-10 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
