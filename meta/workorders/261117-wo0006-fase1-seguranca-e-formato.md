# WO 0006 — Fase 1 da grade (DEC-013): seguranca contra perda de dado + arquivo regravado no formato original

> **Tipo:** mista — CODIGO (`src/context/AppContext.jsx`, `src/viewers/CsvViewer.jsx`, `src/viewers/JsonViewer.jsx`) + registro nos meta/.
> **Config sugerida:** Sonnet, `/effort medium`.
> **Pre-requisito:** escrita sobre `8e20050`. `git status --short` ao comecar: so os 2 arquivos do chat abaixo + esta WO.
> **Base:** analise `meta/analises/261117-ANALISE-ux-tabelas-e-json.md`, decidida pelo dono em 2026-11-17 (fase 1 + preservar o recuo).
> **Arquivos que o chat gravou no disco e esta WO versiona** (Edicao 0: `sha1sum`; diferente = PARE):
>   - `meta/analises/261117-ANALISE-ux-tabelas-e-json.md` — `a5457a34a171bc08ed26b24ce5dc7222b8332cc7`
>   - `logs/2026-11-17.md` — `4a5943b1f61f310a8a9123f5e6a5a5b626b30db7`
> **Ancora semantica:** ancora que nao bater EXATAMENTE = PARE e reporte.
> **Idempotencia:** texto novo inteiro presente e ancora ausente = ja aplicada (PULE e diga). Formas «trocar» (texto novo contem a ancora): 2, 5, 9, 12, 14, 16, 17, 18.
> **Ancoras lidas em:** recortadas por script, neste turno, sobre `8e20050`: `AppContext.jsx` (1–4), `CsvViewer.jsx` (5–11), `JsonViewer.jsx` (12–13), `STATUS.md` (14–15), `CHANGELOG.md` (16), `DECISIONS.md` (17), `ROADMAP.md` (18). O trecho literal de cada uma e o bloco **Ancora** da edicao. Simulado em sequencia a partir do texto desta WO: cada ancora = 1 ocorrencia.
> **Fim de linha:** `JsonViewer.jsx` e CRLF na arvore (ancoras medidas normalizadas para LF; grave de volta em CRLF). Os demais tocados sao LF.
> **Validacao ja feita pelo chat (nao substitui o build):** os tres `.jsx` simulados passaram no `esbuild 0.21.5`; `serializeLike` e a serializacao do CSV foram rodadas em node (`papaparse@5.4.1`) com arquivos LF, CRLF, com e sem quebra final, recuo 4/tab/minificado — saida = formato de entrada.
> **Proximo comando:** nenhum — conferencia na tela e do dono, pelo roteiro entregue no chat no mesmo turno.

> **Canal dos meta neste ciclo = CODE.** A analise e o log ja foram escritos pelo chat — so confira o hash e versione.

---

## 1. Por que

Fase 1 da DEC-013 — perda de dado antes de recurso novo: fechar com alteracao nao salva descartava sem perguntar (G1); excluir linha no CSV era um clique com o mesmo ✕ do «cancelar», sem desfazer (U2); «+ Linha» com filtro ativo parecia nao fazer nada (U11); ordenacao nao voltava a ordem do arquivo (U4). E a decisao 3 do dono: o arquivo editado volta no formato em que chegou — **medido**: `Papa.unparse` grava CRLF e tira a quebra final; o JSON regravava tudo com 2 espacos.

---

## Edicao 0 — conferir hashes

```
sha1sum meta/analises/261117-ANALISE-ux-tabelas-e-json.md logs/2026-11-17.md
```

## Edicao 1 — `src/context/AppContext.jsx` · import do useEffect

**Substituir.** Ancora:

```
import { createContext, useContext, useState, useCallback } from 'react'
```

**Por:**

```
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
```

## Edicao 2 — `src/context/AppContext.jsx` · aviso do navegador ao sair com alteracao

**Substituir.** Ancora:

```
  const [modes, setModes] = useState({})
```

**Por:**

```
  const [modes, setModes] = useState({})

  // Fechar ou recarregar a aba do navegador com alteracao nao salva: o navegador
  // mostra o aviso padrao dele (o texto e do navegador, nao nosso). Analise
  // 261117, G1 — antes, tudo se perdia sem pergunta.
  const anyDirty = files.some(f => f.isDirty)
  useEffect(() => {
    if (!anyDirty) return
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [anyDirty])
```

## Edicao 3 — `src/context/AppContext.jsx` · fechar arquivo com alteracao pergunta

**Substituir.** Ancora:

```
  const closeFile = useCallback((id) => {
    setFiles(prev => {
```

**Por:**

```
  const closeFile = useCallback((id) => {
    // Arquivo com alteracao nao salva: pergunta antes de descartar (analise
    // 261117, G1). Vale para o ✕ da aba e o da barra lateral, que chamam aqui.
    const target = files.find(f => f.id === id)
    if (target?.isDirty && !window.confirm(`"${target.name}" tem alterações não salvas. Fechar e descartar?`)) return
    setFiles(prev => {
```

## Edicao 4 — `src/context/AppContext.jsx` · closeFile depende de files

**Substituir.** Ancora:

```
    setModes(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [])
```

**Por:**

```
    setModes(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [files])
```

## Edicao 5 — `src/viewers/CsvViewer.jsx` · import do icone de lixeira

**Substituir.** Ancora:

```
import Papa from 'papaparse'
```

**Por:**

```
import Papa from 'papaparse'
import { Trash2 } from 'lucide-react'
```

## Edicao 6 — `src/viewers/CsvViewer.jsx` · ordenacao com terceiro estado (sem ordem)

**Substituir.** Ancora:

```
  const handleSort = (i) => {
    if (sortCol === i) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(i); setSortDir('asc') }
  }
```

**Por:**

```
  // Clique no cabecalho: crescente → decrescente → sem ordenacao (analise
  // 261117, U4 — antes nao havia como voltar a ordem do arquivo).
  const handleSort = (i) => {
    if (sortCol !== i) { setSortCol(i); setSortDir('asc'); return }
    if (sortDir === 'asc') { setSortDir('desc'); return }
    setSortCol(null); setSortDir('asc')
  }
```

## Edicao 7 — `src/viewers/CsvViewer.jsx` · serializa no formato do arquivo

**Substituir.** Ancora:

```
  const commitValue = (dataIdx, col, val) => {
    const colName = headers[col]
    const newData = data.map((r, i) =>
      i === dataIdx ? { ...r, [colName]: val } : r
    )
    updateContent(activeFile.id, Papa.unparse(newData))
  }
```

**Por:**

```
  // Regrava o CSV no formato do arquivo aberto: mesmo fim de linha (o
  // Papa.unparse usa CRLF por padrao) e a quebra final, se havia. Antes toda
  // edicao num CSV LF reescrevia o arquivo inteiro (analise 261117, decisao 3).
  // `columns` fixa a ordem das colunas pelo cabecalho original.
  const serialize = (rows) => {
    const nl = activeFile.content.includes('\r\n') ? '\r\n' : '\n'
    const out = Papa.unparse(rows, { newline: nl, columns: headers })
    return activeFile.content.endsWith('\n') ? out + nl : out
  }

  const commitValue = (dataIdx, col, val) => {
    const colName = headers[col]
    const newData = data.map((r, i) =>
      i === dataIdx ? { ...r, [colName]: val } : r
    )
    updateContent(activeFile.id, serialize(newData))
  }
```

## Edicao 8 — `src/viewers/CsvViewer.jsx` · + Linha visivel e excluir com desfazer

**Substituir.** Ancora:

```
  const addRow = () => {
    const emptyRow = Object.fromEntries(headers.map(h => [h, '']))
    updateContent(activeFile.id, Papa.unparse([...data, emptyRow]))
  }

  const deleteRow = (dataIdx) => {
    const newData = data.filter((_, i) => i !== dataIdx)
    updateContent(activeFile.id, Papa.unparse(newData))
  }
```

**Por:**

```
  // + Linha: com filtro ativo a linha nova (vazia) nao passaria no filtro e o
  // botao pareceria nao fazer nada (analise 261117, U11) — limpa o filtro e ja
  // abre a primeira celula da linha nova.
  const addRow = () => {
    const emptyRow = Object.fromEntries(headers.map(h => [h, '']))
    updateContent(activeFile.id, serialize([...data, emptyRow]))
    setSearch('')
    if (headers.length) startEdit(data.length, 0, '')
  }

  // Ultima linha excluida, para o «Desfazer» da barra (analise 261117, U2):
  // excluir e um clique, entao precisa voltar com outro.
  const [lastDeleted, setLastDeleted] = useState(null) // { dataIdx, row }

  const deleteRow = (dataIdx) => {
    setLastDeleted({ dataIdx, row: data[dataIdx] })
    const newData = data.filter((_, i) => i !== dataIdx)
    updateContent(activeFile.id, serialize(newData))
  }

  const undoDelete = () => {
    if (!lastDeleted) return
    const { dataIdx, row } = lastDeleted
    const newData = [...data.slice(0, dataIdx), row, ...data.slice(dataIdx)]
    updateContent(activeFile.id, serialize(newData))
    setLastDeleted(null)
  }
```

## Edicao 9 — `src/viewers/CsvViewer.jsx` · barra: aviso de exclusao com Desfazer

**Substituir.** Ancora:

```
          {filtered.length} / {data.length} linhas · {headers.length} colunas
        </span>
```

**Por:**

```
          {filtered.length} / {data.length} linhas · {headers.length} colunas
        </span>
        {lastDeleted && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Linha {lastDeleted.dataIdx + 1} excluída ·
            <button onClick={undoDelete} style={{
              fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', cursor: 'pointer',
            }}>Desfazer</button>
          </span>
        )}
```

## Edicao 10 — `src/viewers/CsvViewer.jsx` · excluir linha com icone proprio

**Substituir.** Ancora:

```
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent' }}
                      >✕</button>
```

**Por:**

```
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent' }}
                        title="Excluir linha (dá para desfazer na barra de cima)"
                        aria-label="Excluir linha"
                      ><Trash2 size={13} /></button>
```

## Edicao 11 — `src/viewers/CsvViewer.jsx` · rodape: terceiro clique e lixeira

**Substituir.** Ancora:

```
        Duplo clique numa célula para editar · Tab move entre células (confirma) · Enter confirma · Esc ou ✕ cancela · clique no cabeçalho para ordenar
```

**Por:**

```
        Duplo clique numa célula para editar · Tab move entre células (confirma) · Enter confirma · Esc ou ✕ cancela · clique no cabeçalho ordena (3º clique tira a ordem) · lixeira exclui a linha (Desfazer na barra)
```

## Edicao 12 — `src/viewers/JsonViewer.jsx` · funcao que regrava no formato do arquivo

**Substituir.** Ancora:

```
  return Number.isFinite(n) ? n : t
}
```

**Por:**

```
  return Number.isFinite(n) ? n : t
}

// Regrava o JSON no formato do arquivo aberto (analise 261117, J6): mesmo
// recuo (tab ou N espacos, lido na primeira linha recuada), mesmo fim de linha
// (CRLF ou LF) e a quebra final, se havia; arquivo sem quebra de linha continua
// numa linha so. Antes toda edicao regravava o arquivo inteiro com 2 espacos e
// LF, e o diff de um arquivo versionado virava o arquivo todo.
function serializeLike(obj, original) {
  if (!original.includes('\n')) return JSON.stringify(obj)
  const m = original.match(/\n([ \t]+)\S/)
  const indent = m ? (m[1][0] === '\t' ? '\t' : m[1].length) : 2
  let out = JSON.stringify(obj, null, indent)
  if (original.endsWith('\n')) out += '\n'
  return original.includes('\r\n') ? out.replace(/\n/g, '\r\n') : out
}
```

## Edicao 13 — `src/viewers/JsonViewer.jsx` · handleUpdate usa o formato do arquivo

**Substituir.** Ancora:

```
      updateContent(activeFile.id, JSON.stringify(obj, null, 2))
```

**Por:**

```
      updateContent(activeFile.id, serializeLike(obj, activeFile.content))
```

## Edicao 14 — `meta/STATUS.md` · 0.1.10 e 0.1.9 conferida

**Substituir.** Ancora:

```
**[0.1.9]** — 2026-11-17 — JSON: edição que não serve ao tipo não grava mais (era `null`/`0` em silêncio) e chave com ponto passa a ser editável (FIX-004); CSV: abrir uma célula não rearranja mais a tabela (FIX-005). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-17).
```

**Por:**

```
**[0.1.10]** — 2026-11-17 — Fase 1 da grade (DEC-013): fechar com alteração não salva pergunta; CSV com lixeira + Desfazer, «+ Linha» visível com filtro, 3º clique tira a ordenação; CSV e JSON regravam no formato do arquivo (fim de linha, recuo, quebra final). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-17).
**[0.1.9]** — 2026-11-17 — JSON: edição que não serve ao tipo não grava mais (era `null`/`0` em silêncio) e chave com ponto passa a ser editável (FIX-004); CSV: abrir uma célula não rearranja mais a tabela (FIX-005). Build verde; **conferido na tela pelo dono em 2026-11-17: 13/13 ok.**
```

## Edicao 15 — `meta/STATUS.md` · backlog: analise decidida, proxima fase

**Substituir.** Ancora:

```
- [ ] **Responder a análise `meta/analises/261117-ANALISE-ux-tabelas-e-json.md`** — direção das tabelas (grade compartilhada CSV + JSON, fases 1→5), biblioteca ou à mão, e se o JSON preserva o recuo original ao salvar. Lá estão também os achados de UX ainda abertos (fechar sem salvar descarta, ✕ duplo no CSV, sem desfazer).
```

**Por:**

```
- [ ] **Fase 2 da grade (DEC-013):** `DataGrid` compartilhado pelo CSV e pelo `ArrayTable`, sobre TanStack Table v8; largura de coluna estável; célula selecionada com teclado; desfazer por arquivo. Plano em `meta/analises/261117-ANALISE-ux-tabelas-e-json.md` e ROADMAP F2b.
```

## Edicao 16 — `meta/CHANGELOG.md` · entrada 0.1.10

**Substituir.** Ancora:

```
## [0.1.9] — 2026-11-17
```

**Por:**

```
## [0.1.10] — 2026-11-17
### Adicionado
- **Fechar com alteração não salva pergunta antes:** o ✕ da aba e o da barra lateral pedem confirmação; fechar ou recarregar a aba do navegador mostra o aviso do navegador.
- **CSV — Desfazer exclusão de linha:** a exclusão usa um ícone de lixeira (o ✕ fica só para cancelar edição) e a barra mostra «Linha N excluída · Desfazer».

### Modificado
- **CSV — «+ Linha» com filtro ativo:** limpa o filtro e já abre a primeira célula da linha nova (antes a linha nova não aparecia).
- **CSV — ordenação:** o 3º clique no cabeçalho volta à ordem do arquivo.
- **CSV e JSON regravam no formato do arquivo:** mesmo fim de linha (LF ou CRLF), mesma quebra final e, no JSON, o mesmo recuo (tab ou N espaços). Antes qualquer edição reescrevia o arquivo inteiro.

---

## [0.1.9] — 2026-11-17
```

## Edicao 17 — `meta/DECISIONS.md` · DEC-013 antes do FIX-001

**Substituir.** Ancora:

```
## FIX-001 — PDF: ArrayBuffer detachado ao remontar o viewer
```

**Por:**

```
## DEC-013 — Tabelas: grade compartilhada (CSV + JSON) sobre TanStack Table v8, em fases; arquivos regravados no formato original
**Data:** 2026-11-17 · **Status:** aceita

### Contexto
O dono pediu tabelas melhores (filtrar, ordenar, agrupar — com a Mapoteca como referência) e cards para registros repetidos no JSON; a revisão de UX do código achou perda de dado possível (fechar sem salvar, excluir linha sem desfazer) e arquivos inteiros reescritos a cada edição. Raciocínio completo em `meta/analises/261117-ANALISE-ux-tabelas-e-json.md`.

### Decisão
1. Uma **grade de dados compartilhada** pelo CSV e pelos arrays de objetos do JSON, em cinco fases: (1) segurança — wo0006; (2) base da grade com teclado e desfazer; (3) filtro por coluna com facetas e chips + ordenação em níveis; (4) agrupar com totais; (5) vista de cards.
2. **Lógica de tabela: TanStack Table v8** (MIT, headless, ~15 kB gzip), visual do FileView.
3. **Arquivo editado volta no formato em que chegou** — fim de linha, quebra final e, no JSON, o recuo.

### Alternativas consideradas
- **Melhorar cada tabela onde está** — cada recurso escrito duas vezes e divergindo (a Mapoteca registrou que motores de filtro paralelos mataram o projeto anterior).
- **AG Grid Community** — agrupar, agregação e menu de coluna são Enterprise (pago).
- **react-data-grid** — o mais pronto (teclado, edição), mas em beta há anos e as versões recentes pedem React 19 `[a confirmar]`; segunda opção se o teclado da fase 2 sair caro.
- **MUI X** — agrupar é pago; impõe o visual do Material.

### Consequências
A fase 2 é um refactor do `JsonViewer.jsx` e do `CsvViewer.jsx` sem recurso grande visível — entra junto com a seleção de célula por teclado para não ficar invisível. Cada fase fecha com roteiro do dono. O roteiro de 2026-11-12 (CSV Tab, edição do JSON) e o da 0.1.9 viram a rede de regressão da grade nova.

---

## FIX-001 — PDF: ArrayBuffer detachado ao remontar o viewer
```

## Edicao 18 — `meta/ROADMAP.md` · fase F2b da grade

**Substituir.** Ancora:

```
## 🔵 F3 — Novos Formatos *(futuro, sem data)*
```

**Por:**

```
## 🟡 F2b — Grade de dados *(em curso — DEC-013)*
**Objetivo:** uma grade compartilhada pelo CSV e pelos arrays de objetos do JSON, com o que a Mapoteca ensina (filtro por coluna, ordenar em níveis, agrupar) e uma vista de cards.
**Critério de conclusão:** as cinco fases conferidas na tela pelo dono.
- [ ] Fase 1 — segurança: confirmar ao fechar com alteração, lixeira + Desfazer no CSV, «+ Linha» com filtro, 3º clique tira a ordem, formato do arquivo preservado (wo0006)
- [ ] Fase 2 — base: `DataGrid` sobre TanStack Table v8, largura de coluna estável, célula selecionada com teclado, desfazer por arquivo
- [ ] Fase 3 — filtro por coluna com facetas e chips; ordenação em níveis (Shift+clique)
- [ ] Fase 4 — agrupar (até 3 níveis) com totais
- [ ] Fase 5 — vista de cards para arrays de objetos do JSON

---

## 🔵 F3 — Novos Formatos *(futuro, sem data)*
```

---

## Fora de escopo

- Nada das fases 2–5 (grade compartilhada, teclado, filtro por coluna, agrupar, cards).
- CSV de UMA coluna: a linha nova vazia vira linha vazia e o `skipEmptyLines` a descarta — caso de borda conhecido, nao tratado aqui.
- `closeFile` chama `setActiveId` dentro do atualizador do `setFiles` (efeito colateral em atualizador) — preexistente, nao mexer agora.

## Armadilhas desta WO

- `JsonViewer.jsx` CRLF (ver cabecalho).
- Edicao 4 muda as dependencias do `closeFile` para `[files]` — necessario: sem isso a confirmacao le a lista de arquivos da primeira renderizacao e nunca ve `isDirty`.

---

## Depois de aplicar — conferencia antes do commit

- [ ] `npm run build` sem erro. Erro → PARE.
- [ ] `git status --short` → exatamente: `M logs/2026-11-17.md`, `M meta/CHANGELOG.md`, `M meta/DECISIONS.md`, `M meta/ROADMAP.md`, `M meta/STATUS.md`, `M meta/analises/261117-ANALISE-ux-tabelas-e-json.md`, `M src/context/AppContext.jsx`, `M src/viewers/CsvViewer.jsx`, `M src/viewers/JsonViewer.jsx`, `?? meta/workorders/261117-wo0006-fase1-seguranca-e-formato.md` (10 entradas).
- [ ] Saldo de linhas (`wc -l`, simulado a partir deste texto, normalizado para LF): `meta/CHANGELOG.md` 112 → 124 (+12) · `meta/DECISIONS.md` 301 → 323 (+22) · `meta/ROADMAP.md` 59 → 70 (+11) · `meta/STATUS.md` 49 → 50 (+1) · `src/context/AppContext.jsx` 102 → 117 (+15) · `src/viewers/CsvViewer.jsx` 272 → 316 (+44) · `src/viewers/JsonViewer.jsx` 812 → 826 (+14). Saldo diferente = VERMELHO.
- [ ] Contagens (unidade = linhas):
  - `grep -c "Papa.unparse(rows" src/viewers/CsvViewer.jsx` → 1 · `grep -c "Papa.unparse(newData\|Papa.unparse(\[" src/viewers/CsvViewer.jsx` → 0 (a unica chamada fica no `serialize`; o comentario dele tambem cita «Papa.unparse», por isso o padrao inclui o parentese)
  - `grep -c "JSON.stringify(obj, null, 2)" src/viewers/JsonViewer.jsx` → 0 · `grep -c "^function serializeLike" src/viewers/JsonViewer.jsx` → 1
  - `grep -c "beforeunload" src/context/AppContext.jsx` → 2 · `grep -c "window.confirm" src/context/AppContext.jsx` → 1
  - `grep -c "<Trash2 size={13} />" src/viewers/CsvViewer.jsx` → 1
  - `grep -c "^## DEC-013" meta/DECISIONS.md` → 1 · `grep -c "^## \[0.1.10\]" meta/CHANGELOG.md` → 1 · `grep -c "^## 🟡 F2b" meta/ROADMAP.md` → 1
- [ ] **Chega no ramo?** Fechar: `FileTab`/`Sidebar` ✕ → `closeFile`. CSV: `commitValue`/`addRow`/`deleteRow`/`undoDelete` → `serialize`. JSON: todos os `commit*` → `handleUpdate` → `serializeLike`. O build responde «compila?»; o resto e do roteiro do dono.
- [ ] Se rodou `npm run dev`, encerre.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O de sempre, depois do push. Grave em `../AAMMDD-HHMM-code-fileview-apply-wo0006.txt` (`date +%y%m%d-%H%M`).

## Commit — blocos separados, mensagem SEM acento

```
git add src/context/AppContext.jsx src/viewers/CsvViewer.jsx src/viewers/JsonViewer.jsx meta/STATUS.md meta/CHANGELOG.md meta/DECISIONS.md meta/ROADMAP.md meta/analises/261117-ANALISE-ux-tabelas-e-json.md logs/2026-11-17.md meta/workorders/261117-wo0006-fase1-seguranca-e-formato.md
```

```
git commit -m "feat(grade): fase 1 - confirmar ao fechar, desfazer exclusao no CSV, formato do arquivo preservado (DEC-013)" -m "Fechar com alteracao nao salva pergunta; CSV com lixeira e Desfazer, + Linha visivel com filtro, 3o clique tira a ordem; CSV e JSON regravam com o fim de linha, a quebra final e o recuo originais. Versao 0.1.10."
```

```
git push
```

*Gerado pelo Kit de Contexto Universal v1.135.0 — 2026-11-10 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
