# WO 0005 — JSON: edicao que nao serve ao tipo nao grava + caminho em lista (FIX-004); CSV: celula em edicao nao rearranja a tabela (FIX-005)

> **Tipo:** mista — CODIGO (`src/viewers/JsonViewer.jsx`, `src/viewers/CsvViewer.jsx`) + registro nos meta/.
> **Config sugerida:** Sonnet, `/effort medium` (as edicoes sao exatas; a parte de julgamento ja foi feita).
> **Pre-requisito:** escrita sobre `2cc605b`. `git status --short` ao comecar: so os 4 arquivos do chat abaixo + esta WO.
> **Base:** roteiro C do dono (2026-11-12, resultado em 2026-11-17) + prints; relato do dono sobre a celula do CSV. Causas lidas pelo chat no codigo em 2026-11-17.
> **Arquivos que o chat gravou no disco e esta WO versiona** (sha1 medido ao gravar; Edicao 0 confere — diferente = PARE):
>   - `logs/2026-11-12.md` — `c8bbda3744f4c8580297119bc77fdc6bd7cfeba8`
>   - `logs/2026-11-17.md` — `ce9df3c869eb6a18f437f90475c898048a0bcf3b`
>   - `meta/analises/261117-ANALISE-ux-tabelas-e-json.md` — `e0ee3d11b795aef7c391ad875bb939c6b13737ef`
>   - `meta/analises/_TEMPLATE.md` — `34bf231057d93f82c024cb073b16958de276788c`
> **Ancora semantica:** ancora que nao bater EXATAMENTE = PARE e reporte.
> **Idempotencia:** texto novo inteiro presente e ancora ausente = ja aplicada (PULE e diga). Formas «trocar» (texto novo contem a ancora): 29, 31, 32. Remocao (texto novo e pedaco da ancora): 30.
> **Ancoras lidas em:** recortadas por script, neste turno, sobre `2cc605b`: `src/viewers/JsonViewer.jsx` (1–24), `src/viewers/CsvViewer.jsx` (25), `meta/STATUS.md` (26, 27), `meta/CHANGELOG.md` (28), `meta/DECISIONS.md` (29), `meta/IDEAS.md` (30–32). O trecho literal de cada uma e o bloco **Ancora** da edicao. **Aplicar NA ORDEM**: as edicoes 3 e 4 tocam linhas vizinhas (a 4 ancora numa linha que a 3 preserva); simulado em sequencia a partir do texto desta WO: cada ancora = 1 ocorrencia no momento em que e aplicada.
> **Fim de linha:** `JsonViewer.jsx` e **CRLF** na arvore (`git ls-files --eol` → `i/lf w/crlf`); as ancoras foram medidas com o arquivo normalizado para LF — compare normalizando, e grave de volta em CRLF. `CsvViewer.jsx` e os meta/ sao LF.
> **Validacao ja feita pelo chat (nao substitui o build):** o resultado simulado dos dois `.jsx` passou no `esbuild 0.21.5 --loader:.jsx=jsx` sem erro; a `parseEditedValue` nova foi rodada em node com os casos do roteiro (`18,'abc'` → recusa; `18,''` → recusa; `true,'True'` → `true`; `null,'texto'` → `"texto"`; `null,'42'` → `42`; caminho `['config.tema']` grava na chave certa).
> **Proximo comando:** nenhum — conferencia na tela e do dono, pelo roteiro entregue no chat no mesmo turno.

> **Canal dos meta neste ciclo = CODE.** Aplique as edicoes dos meta/ como escritas. A analise e o log ja foram escritos pelo chat — so confira o hash e versione.

---

## 1. Por que

**FIX-004 (JSON).** `parseEditedValue` convertia sem validar: `Number("abc")` = `NaN` → `JSON.stringify` grava `null`, e com o valor ja `null` o tipo de destino ficava `null` para sempre (item 12 do roteiro); `Number("")` = `0` (item 13); `null` nunca mudava (15). O caminho do campo era texto pontuado e o `handleUpdate` fazia `split('.')`: `"config.tema"` virava dois niveis inexistentes, o erro caia no `catch {}` vazio e a edicao sumia (16). A Arvore e o `Field` tinham copias proprias da conversao. Correcao: uma conversao so, que devolve `{ ok, value }` / `{ ok: false, error }`; com erro nada grava e o campo fica aberto com borda vermelha e o motivo no `title`; caminho vira lista de chaves em todos os pontos.

**FIX-005 (CSV).** Com `table-layout` automatico, trocar o texto da celula por `<input>` + ✕ mudava a largura da coluna e a tabela se rearranjava. Correcao: o texto fica (invisivel) segurando a largura; o `<input>` vai por cima da celula e o ✕ fica fora, a direita.

## Inventario — de onde saiu a lista

- **Conversao de tipo:** `grep -n "Number(editVal)\|parseEditedValue" src/viewers/JsonViewer.jsx` sobre `2cc605b` → 4 pontos de conversao (Arvore `JsonNode`, `Field`, `RowDetailModal`, `ArrayTable`) — edicoes 2, 7, 12, 16; a funcao em si, edicao 1.
- **Caminho pontuado:** `grep -n "dotted\|\${path}\|path = ''\|path=\"\"\|path.split"` → 9 linhas: 98, 177, 258, 274, 378, 422, 540, 710, 752 e o default da linha 16 — edicoes 5, 6, 10, 11, 12, 15, 16, 19, 23, 24; mais os tres pontos que MONTAM o caminho no `SectionContent` (edicoes 20, 21, 22).
- **Borda/`title` de erro:** os 4 campos de edicao — edicoes 3/4 (Arvore), 8/9 (`Field`), 13/14 (modal), 17/18 (celula).
Depois de aplicar: `grep -c "split('.')\|dotted\|\${path}" src/viewers/JsonViewer.jsx` → 0.

---

## Edicao 0 — conferir hashes

```
sha1sum logs/2026-11-12.md logs/2026-11-17.md meta/analises/261117-ANALISE-ux-tabelas-e-json.md meta/analises/_TEMPLATE.md
```

## Edicao 1 — `src/viewers/JsonViewer.jsx` · parseEditedValue valida em vez de corromper

**Substituir.** Ancora:

```
// Converte o texto digitado de volta pro tipo original do valor. Compartilhado
// por ArrayTable e RowDetailModal (mesma regra do Field/JsonNode).
function parseEditedValue(original, text) {
  const type = original === null ? 'null' : typeof original
  if (type === 'number') return Number(text)
  if (type === 'boolean') return text === 'true'
  if (type === 'null') return null
  return text
}
```

**Por:**

```
// Converte o texto digitado de volta para um valor JSON. Usado por TODOS os
// pontos de edicao (Arvore, Field, celulas do ArrayTable, RowDetailModal).
// Devolve { ok: true, value } ou { ok: false, error }: com ok === false quem
// chama NAO grava e mantem o campo aberto (FIX-004). Antes, «abc» num numero
// virava NaN, que o JSON.stringify grava como null, e o campo nunca mais
// voltava a ser numero; vazio virava 0; e um null nao saia de null.
// - string: o texto como esta;
// - number: numero finito; vazio ou texto e invalido;
// - boolean: true/false, sem diferenciar maiusculas;
// - null: o tipo sai do que foi digitado (inferValue) — e o unico jeito de
//   um null deixar de ser null.
function parseEditedValue(original, text) {
  const type = original === null ? 'null' : typeof original
  const t = text.trim()
  if (type === 'string') return { ok: true, value: text }
  if (type === 'number') {
    const n = Number(t)
    return t !== '' && Number.isFinite(n) ? { ok: true, value: n } : { ok: false, error: 'Não é um número' }
  }
  if (type === 'boolean') {
    const low = t.toLowerCase()
    return low === 'true' || low === 'false'
      ? { ok: true, value: low === 'true' }
      : { ok: false, error: 'Use true ou false' }
  }
  return { ok: true, value: inferValue(t) }
}

// Tipo de um valor digitado onde antes havia null: vazio ou «null» continua
// null; true/false viram boolean; numero vira number; o resto e string.
function inferValue(t) {
  if (t === '' || t === 'null') return null
  if (t === 'true' || t === 'false') return t === 'true'
  const n = Number(t)
  return Number.isFinite(n) ? n : t
}
```

## Edicao 2 — `src/viewers/JsonViewer.jsx` · Arvore: usa parseEditedValue e guarda o erro

**Substituir.** Ancora:

```
  const startEdit = () => {
    if (!isLeaf) return
    setEditVal(type === 'string' ? value : String(value))
    setEditing(true)
  }

  const commitEdit = () => {
    setEditing(false)
    let parsed
    if (type === 'number') parsed = Number(editVal)
    else if (type === 'boolean') parsed = editVal === 'true'
    else if (type === 'null') parsed = null
    else parsed = editVal
    if (onUpdate) onUpdate(path, parsed)
  }
```

**Por:**

```
  // Erro de tipo da edicao em curso (FIX-004): com erro o valor NAO e gravado,
  // o campo fica aberto com borda vermelha e o motivo no title.
  const [editErr, setEditErr] = useState(null)

  const startEdit = () => {
    if (!isLeaf) return
    setEditVal(type === 'string' ? value : String(value))
    setEditErr(null)
    setEditing(true)
  }

  const commitEdit = () => {
    const r = parseEditedValue(value, editVal)
    if (!r.ok) { setEditErr(r.error); return }
    setEditErr(null)
    setEditing(false)
    if (onUpdate) onUpdate(path, r.value)
  }
```

## Edicao 3 — `src/viewers/JsonViewer.jsx` · Arvore: borda de erro

**Substituir.** Ancora:

```
            fontSize: '13px', fontFamily: 'var(--font-mono)',
            border: '1px solid var(--accent)', borderRadius: '3px',
```

**Por:**

```
            fontSize: '13px', fontFamily: 'var(--font-mono)',
            border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`, borderRadius: '3px',
```

## Edicao 4 — `src/viewers/JsonViewer.jsx` · Arvore: title com o erro

**Substituir.** Ancora:

```
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
          style={{
            fontSize: '13px'
```

**Por:**

```
          title={editErr || undefined}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
          style={{
            fontSize: '13px'
```

## Edicao 5 — `src/viewers/JsonViewer.jsx` · Arvore: caminho como lista de chaves

**Substituir.** Ancora:

```
function JsonNode({ keyName, value, depth = 0, path = '', onUpdate }) {
```

**Por:**

```
function JsonNode({ keyName, value, depth = 0, path = [], onUpdate }) {
```

## Edicao 6 — `src/viewers/JsonViewer.jsx` · Arvore: filho acrescenta a chave

**Substituir.** Ancora:

```
path={path ? `${path}.${k}` : String(k)}
```

**Por:**

```
path={[...path, k]}
```

## Edicao 7 — `src/viewers/JsonViewer.jsx` · Field: usa parseEditedValue e guarda o erro

**Substituir.** Ancora:

```
  const startEdit = () => {
    if (!canEdit) return
    setEditVal(type === 'string' ? value : String(value))
    setEditing(true)
  }

  // Converte o texto digitado de volta pro tipo original antes de gravar
  const commitEdit = () => {
    setEditing(false)
    let parsed
    if (type === 'number') parsed = Number(editVal)
    else if (type === 'boolean') parsed = editVal === 'true'
    else if (type === 'null') parsed = null
    else parsed = editVal
    onUpdate(path, parsed)
  }
```

**Por:**

```
  // Erro de tipo da edicao em curso (FIX-004) — mesma regra da Arvore.
  const [editErr, setEditErr] = useState(null)

  const startEdit = () => {
    if (!canEdit) return
    setEditVal(type === 'string' ? value : String(value))
    setEditErr(null)
    setEditing(true)
  }

  // Converte o texto digitado de volta pro tipo original antes de gravar;
  // texto que nao serve ao tipo nao grava (FIX-004).
  const commitEdit = () => {
    const r = parseEditedValue(value, editVal)
    if (!r.ok) { setEditErr(r.error); return }
    setEditErr(null)
    setEditing(false)
    onUpdate(path, r.value)
  }
```

## Edicao 8 — `src/viewers/JsonViewer.jsx` · Field: borda de erro

**Substituir.** Ancora:

```
              border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
```

**Por:**

```
              border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`, borderRadius: 'var(--radius-sm)',
```

## Edicao 9 — `src/viewers/JsonViewer.jsx` · Field: title com o erro

**Substituir.** Ancora:

```
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
            style={{
              fontSize: '12px'
```

**Por:**

```
            title={editErr || undefined}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
            style={{
              fontSize: '12px'
```

## Edicao 10 — `src/viewers/JsonViewer.jsx` · comentario do Field: caminho em lista

**Substituir.** Ancora:

```
// Esc cancela. `path` é a chave dotted (ex.: "user.address.city") resolvida pelo
```

**Por:**

```
// Esc cancela. `path` é a LISTA de chaves (ex.: ["user", "address", "city"]) resolvida pelo
```

## Edicao 11 — `src/viewers/JsonViewer.jsx` · comentario do modal: caminho em lista

**Substituir.** Ancora:

```
// do ArrayTable — o path final é `${path}.${rowIdx}.${chave}`, usando o índice
```

**Por:**

```
// do ArrayTable — o caminho final é [...path, rowIdx, chave], usando o índice
```

## Edicao 12 — `src/viewers/JsonViewer.jsx` · modal: usa o resultado validado e o caminho em lista

**Substituir.** Ancora:

```
  const startEdit = (k, v) => {
    if (!canEdit || !isEditablePrimitive(v)) return
    setEditVal(v === null ? '' : typeof v === 'string' ? v : String(v))
    setEditKey(k)
  }

  const commitEdit = (k, original) => {
    onUpdate(`${path}.${rowIdx}.${k}`, parseEditedValue(original, editVal))
    setEditKey(null)
  }
```

**Por:**

```
  // Erro de tipo da edicao em curso (FIX-004).
  const [editErr, setEditErr] = useState(null)

  const startEdit = (k, v) => {
    if (!canEdit || !isEditablePrimitive(v)) return
    setEditVal(v === null ? '' : typeof v === 'string' ? v : String(v))
    setEditErr(null)
    setEditKey(k)
  }

  const commitEdit = (k, original) => {
    const r = parseEditedValue(original, editVal)
    if (!r.ok) { setEditErr(r.error); return }
    setEditErr(null)
    onUpdate([...path, rowIdx, k], r.value)
    setEditKey(null)
  }
```

## Edicao 13 — `src/viewers/JsonViewer.jsx` · modal: title com o erro

**Substituir.** Ancora:

```
                    onBlur={() => commitEdit(k, v)}
```

**Por:**

```
                    title={editErr || undefined}
                    onBlur={() => commitEdit(k, v)}
```

## Edicao 14 — `src/viewers/JsonViewer.jsx` · modal: borda de erro

**Substituir.** Ancora:

```
                      background: 'var(--accent-light)', border: '1px solid var(--accent)',
```

**Por:**

```
                      background: 'var(--accent-light)', border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`,
```

## Edicao 15 — `src/viewers/JsonViewer.jsx` · comentario do ArrayTable: caminho em lista

**Substituir.** Ancora:

```
// `${path}.${índiceORIGINAL}.${coluna}` — índice original da linha no array
```

**Por:**

```
// [...path, índiceORIGINAL, coluna] — índice original da linha no array
```

## Edicao 16 — `src/viewers/JsonViewer.jsx` · celula: usa o resultado validado e o caminho em lista

**Substituir.** Ancora:

```
  const startCellEdit = (e, idx, col, val) => {
    e.stopPropagation()
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (!canEdit || !isEditablePrimitive(val)) return
    setEditVal(val === null ? '' : typeof val === 'string' ? val : String(val))
    setEditCell({ idx, col })
  }

  const commitCellEdit = () => {
    if (!editCell) return
    const { idx, col } = editCell
    const original = value[idx]?.[col] ?? null
    onUpdate(`${path}.${idx}.${col}`, parseEditedValue(original, editVal))
    setEditCell(null)
  }
```

**Por:**

```
  // Erro de tipo da edicao em curso (FIX-004).
  const [editErr, setEditErr] = useState(null)

  const startCellEdit = (e, idx, col, val) => {
    e.stopPropagation()
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (!canEdit || !isEditablePrimitive(val)) return
    setEditVal(val === null ? '' : typeof val === 'string' ? val : String(val))
    setEditErr(null)
    setEditCell({ idx, col })
  }

  const commitCellEdit = () => {
    if (!editCell) return
    const { idx, col } = editCell
    const original = value[idx]?.[col] ?? null
    const r = parseEditedValue(original, editVal)
    if (!r.ok) { setEditErr(r.error); return }
    setEditErr(null)
    onUpdate([...path, idx, col], r.value)
    setEditCell(null)
  }
```

## Edicao 17 — `src/viewers/JsonViewer.jsx` · celula: title com o erro

**Substituir.** Ancora:

```
                            onBlur={commitCellEdit}
```

**Por:**

```
                            title={editErr || undefined}
                            onBlur={commitCellEdit}
```

## Edicao 18 — `src/viewers/JsonViewer.jsx` · celula: borda de erro

**Substituir.** Ancora:

```
                              border: '1px solid var(--accent)', borderRadius: '3px',
```

**Por:**

```
                              border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`, borderRadius: '3px',
```

## Edicao 19 — `src/viewers/JsonViewer.jsx` · comentario do SectionContent: caminho em lista

**Substituir.** Ancora:

```
// `onUpdate` (opcional) é repassado ao Field/ArrayTable com o `path` dotted certo:
// seção primitiva solta → path = section.key; seção objeto → path = "section.key.campo";
// seção array de objetos → path = section.key (o ArrayTable completa com ".idx.coluna").
```

**Por:**

```
// `onUpdate` (opcional) é repassado ao Field/ArrayTable com o caminho certo, como
// LISTA de chaves (FIX-004 — chave com ponto, como "config.tema", quebrava o texto
// pontuado): seção primitiva solta → [section.key]; seção objeto → [section.key, campo];
// seção array de objetos → [section.key] (o ArrayTable completa com idx e coluna).
```

## Edicao 20 — `src/viewers/JsonViewer.jsx` · ArrayTable recebe lista

**Substituir.** Ancora:

```
      ? <ArrayTable value={value} path={key} onUpdate={onUpdate} />
```

**Por:**

```
      ? <ArrayTable value={value} path={[key]} onUpdate={onUpdate} />
```

## Edicao 21 — `src/viewers/JsonViewer.jsx` · Field de objeto recebe lista

**Substituir.** Ancora:

```
<Field key={k} label={k} value={v} path={`${key}.${k}`} onUpdate={onUpdate} />
```

**Por:**

```
<Field key={k} label={k} value={v} path={[key, k]} onUpdate={onUpdate} />
```

## Edicao 22 — `src/viewers/JsonViewer.jsx` · Field solto recebe lista

**Substituir.** Ancora:

```
  return <Field label={section.key} value={value} path={section.key} onUpdate={onUpdate} />
```

**Por:**

```
  return <Field label={section.key} value={value} path={[section.key]} onUpdate={onUpdate} />
```

## Edicao 23 — `src/viewers/JsonViewer.jsx` · handleUpdate recebe lista

**Substituir.** Ancora:

```
      const parts = path.split('.')
```

**Por:**

```
      // `path` e a lista de chaves (FIX-004): nunca dividir texto por ponto.
      const parts = path
```

## Edicao 24 — `src/viewers/JsonViewer.jsx` · raiz da Arvore: lista vazia

**Substituir.** Ancora:

```
<JsonNode value={parsed} depth={0} path="" onUpdate={handleUpdate} />
```

**Por:**

```
<JsonNode value={parsed} depth={0} path={[]} onUpdate={handleUpdate} />
```

## Edicao 25 — `src/viewers/CsvViewer.jsx` · celula em edicao por cima, sem mudar a largura

**Substituir.** Ancora:

```
                    {headers.map((h, ci) => (
                      <td key={ci} style={tdStyle}
                        onDoubleClick={() => startEdit(dataIdx, ci, row[h] ?? '')}>
                        {editCell?.dataIdx === dataIdx && editCell?.col === ci ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              autoFocus
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={e => {
                                if (e.key === 'Enter') commitEdit()
                                if (e.key === 'Tab') { e.preventDefault(); commitAndMove(!e.shiftKey) }

                                if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
                              }}
                              style={{
                                flex: 1, minWidth: 0,
                                border: '1px solid var(--accent)', borderRadius: '3px',
                                padding: '2px 6px', background: 'var(--accent-light)',
                                fontSize: '13px', fontFamily: 'var(--font-ui)',
                                outline: 'none', color: 'var(--text)',
                              }}
                            />
                            {/* onMouseDown+preventDefault dispara antes do onBlur do input */}
                            <button
                              onMouseDown={e => { e.preventDefault(); cancelEdit() }}
                              title="Cancelar (Esc)"
                              style={{
                                flexShrink: 0, fontSize: '11px', lineHeight: 1,
                                padding: '3px 6px', borderRadius: '3px',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)', background: 'var(--surface)',
                                cursor: 'pointer',
                              }}
                            >✕</button>
                          </div>
                        ) : (
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row[h] ?? ''}
                          </span>
                        )}
                      </td>
                    ))}
```

**Por:**

```
                    {headers.map((h, ci) => {
                      const isEditing = editCell?.dataIdx === dataIdx && editCell?.col === ci
                      return (
                      <td key={ci} style={isEditing ? { ...tdStyle, position: 'relative' } : tdStyle}
                        onDoubleClick={() => startEdit(dataIdx, ci, row[h] ?? '')}>
                        {/* O texto fica no lugar (invisivel durante a edicao) para a celula
                            manter a largura: o campo de edicao vai POR CIMA dela e o ✕ fica
                            fora, a direita. Antes o input entrava no fluxo da tabela, a
                            coluna mudava de largura e a tabela inteira se rearranjava
                            na horizontal ao abrir uma celula (FIX-005). */}
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', visibility: isEditing ? 'hidden' : 'visible' }}>
                          {row[h] ?? ''}
                        </span>
                        {isEditing && (
                          <>
                            <input
                              autoFocus
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={e => {
                                if (e.key === 'Enter') commitEdit()
                                if (e.key === 'Tab') { e.preventDefault(); commitAndMove(!e.shiftKey) }
                                if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
                              }}
                              style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%',
                                boxSizing: 'border-box', zIndex: 2,
                                border: '1px solid var(--accent)', borderRadius: '3px',
                                padding: '0 11px', background: 'var(--accent-light)',
                                fontSize: '13px', fontFamily: 'var(--font-ui)',
                                outline: 'none', color: 'var(--text)',
                              }}
                            />
                            {/* onMouseDown+preventDefault dispara antes do onBlur do input */}
                            <button
                              onMouseDown={e => { e.preventDefault(); cancelEdit() }}
                              title="Cancelar (Esc)"
                              style={{
                                position: 'absolute', left: '100%', top: '50%',
                                transform: 'translate(4px, -50%)', zIndex: 3,
                                fontSize: '11px', lineHeight: 1,
                                padding: '3px 6px', borderRadius: '3px',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)', background: 'var(--surface)',
                                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                              }}
                            >✕</button>
                          </>
                        )}
                      </td>
                      )
                    })}
```

## Edicao 26 — `meta/STATUS.md` · versao 0.1.9

**Substituir.** Ancora:

```
**[0.1.8]** — 2026-11-11 — PDF no visualizador nativo do navegador (`<iframe>`), sem `pdfjs-dist` (DEC-012). Build verde; **conferido na tela pelo dono em 2026-11-12: 6/6 ok.**
```

**Por:**

```
**[0.1.9]** — 2026-11-17 — JSON: edição que não serve ao tipo não grava mais (era `null`/`0` em silêncio) e chave com ponto passa a ser editável (FIX-004); CSV: abrir uma célula não rearranja mais a tabela (FIX-005). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-17).
**[0.1.8]** — 2026-11-11 — PDF no visualizador nativo do navegador (`<iframe>`), sem `pdfjs-dist` (DEC-012). Build verde; **conferido na tela pelo dono em 2026-11-12: 6/6 ok.**
```

## Edicao 27 — `meta/STATUS.md` · backlog: teste feito, entra a analise

**Substituir.** Ancora:

```
- [ ] **Testar no navegador (nunca confirmado):** CSV — Tab/Shift+Tab (bordas, com filtro e ordenação ativos); JSON Formulário — edição inline em `Field`, células do `ArrayTable` e `RowDetailModal` (string, number, boolean, null, texto longo; sensação dos 220 ms do DEC-010). **Suspeita a confirmar:** número digitado inválido vira `NaN` em `parseEditedValue` e `JSON.stringify` grava `null`; `null` editado volta sempre `null`; boolean ≠ `"true"` vira `false` (ver IDEAS).
```

**Por:**

```
- [ ] **Responder a análise `meta/analises/261117-ANALISE-ux-tabelas-e-json.md`** — direção das tabelas (grade compartilhada CSV + JSON, fases 1→5), biblioteca ou à mão, e se o JSON preserva o recuo original ao salvar. Lá estão também os achados de UX ainda abertos (fechar sem salvar descarta, ✕ duplo no CSV, sem desfazer).
```

## Edicao 28 — `meta/CHANGELOG.md` · entrada 0.1.9

**Substituir.** Ancora:

```
## [0.1.8] — 2026-11-11
```

**Por:**

```
## [0.1.9] — 2026-11-17
### Corrigido
- **JSON — edição que não serve ao tipo não grava mais (FIX-004):** «abc» num número virava `null` (e o campo nunca mais voltava a ser número), vazio virava `0`. Agora o campo fica aberto com borda vermelha e o motivo ao passar o mouse; Esc cancela. `true`/`false` aceitam maiúsculas. Um `null` passa a aceitar qualquer valor (número, true/false ou texto).
- **JSON — chave com ponto no nome** (ex.: `"config.tema"`) **passa a ser editável (FIX-004):** antes a edição sumia sem aviso.
- **CSV — abrir uma célula não rearranja mais a tabela na horizontal (FIX-005):** o campo de edição fica por cima da célula, com a mesma largura, e o ✕ de cancelar ao lado.

---

## [0.1.8] — 2026-11-11
```

## Edicao 29 — `meta/DECISIONS.md` · FIX-004 e FIX-005

**Substituir (a ancora fica, os FIX entram depois).** Ancora:

```
- **Arquivo:** `src/components/ViewerRouter.jsx`
```

**Por:**

```
- **Arquivo:** `src/components/ViewerRouter.jsx`

---

## FIX-004 — JSON: edição gravava `null`/`0` em silêncio e chave com ponto não era editável
**Data:** 2026-11-17 · **Status:** resolvida

- **Sintoma:** `[relatado pelo dono, roteiro de 2026-11-12, prints de 2026-11-17]` «abc» num número virou `null` e, depois disso, digitar número continuava `null`; campo numérico apagado virou `0`; `null` não aceitava outro valor; editar `"config.tema"` não mudava nada.
- **Causa raiz:** (1) `parseEditedValue` convertia sem validar — `Number("abc")` é `NaN`, que o `JSON.stringify` grava como `null`; `Number("")` é `0`; e com o valor já `null`, o tipo de destino passava a ser `null` para sempre. (2) O caminho do campo era texto pontuado (`"config.tema"`) e o `handleUpdate` fazia `split('.')`: a chave com ponto virava dois níveis que não existem, o erro caía no `catch {}` vazio e a edição sumia. A Árvore e o `Field` tinham cópias próprias da mesma conversão.
- **Solução:** `parseEditedValue` devolve `{ ok, value }` ou `{ ok: false, error }` e é a ÚNICA conversão (Árvore, `Field`, células do `ArrayTable`, `RowDetailModal`); com erro, nada grava e o campo fica aberto com borda vermelha e o motivo no `title`. `null` infere o tipo do que se digita (`inferValue`). O caminho virou LISTA de chaves em todos os pontos, e o `handleUpdate` não divide mais texto.
- **Lição:** conversão de tipo que não pode falhar esconde a falha no dado. E caminho de dado em texto com separador quebra no primeiro nome que contém o separador — caminho é lista.
- **Arquivo:** `src/viewers/JsonViewer.jsx`

---

## FIX-005 — CSV: abrir uma célula rearranjava a tabela na horizontal
**Data:** 2026-11-17 · **Status:** resolvida

- **Sintoma:** `[relatado pelo dono, 2026-11-17]` ao abrir uma célula para editar, a coluna mudava de largura e empurrava as outras; o dono não conseguiu printar porque o atalho de captura tira o foco e o `onBlur` fecha a edição.
- **Causa raiz:** a tabela usa `table-layout` automático (a largura da coluna depende do conteúdo) e a edição TROCAVA o texto da célula por um `<input>` com largura própria mais o botão ✕, dentro do fluxo da célula.
- **Solução:** o texto fica no lugar, invisível, segurando a largura; o `<input>` vai por cima da célula (`position: absolute; inset: 0`) e o ✕ fica fora, à direita, também por cima.
- **Lição:** edição em célula não pode mudar a geometria da tabela — o editor se sobrepõe, não substitui. (A grade compartilhada da análise 261117 resolveria de vez com largura de coluna definida.)
- **Arquivo:** `src/viewers/CsvViewer.jsx`
```

## Edicao 30 — `meta/IDEAS.md` · MOVER 1/2: sai a ideia de validar o tipo (ativas)

**Substituir.** Ancora:

```
### 2026-11-07 — JSON Formulário: validar o tipo ao editar (number/boolean/null)
`parseEditedValue` (JsonViewer.jsx) faz `Number(text)` — texto inválido vira `NaN`, que `JSON.stringify` grava como `null` (perde o dado em silêncio); `null` editado volta sempre `null` (não dá para trocar o tipo); boolean diferente de `"true"` vira `false`. Ideia: rejeitar entrada inválida (borda vermelha, sem commit) e/ou oferecer troca de tipo. Confirmar o comportamento no navegador antes de mexer.

### 2026-11-07 — README: atualizar e ilustrar
```

**Por:**

```
### 2026-11-07 — README: atualizar e ilustrar
```

## Edicao 31 — `meta/IDEAS.md` · MOVER 2/2: validar o tipo entra em Concluidas

**Substituir.** Ancora:

```
- **Migração ASU → modo Code** — 2026-11-10, junto do merge do KCM v1.135.0. Ver DEC-011.
```

**Por:**

```
- **Migração ASU → modo Code** — 2026-11-10, junto do merge do KCM v1.135.0. Ver DEC-011.
- **JSON Formulário: validar o tipo ao editar** (ideia de 2026-11-07) — 0.1.9, FIX-004: texto que não serve ao tipo não grava; `null` infere o tipo.
```

## Edicao 32 — `meta/IDEAS.md` · ideia: grade compartilhada (aponta a analise)

**Substituir.** Ancora:

```
## 🤖 Ideias Ativas — Assistente
```

**Por:**

```
## 🤖 Ideias Ativas — Assistente

### 2026-11-17 — Tabelas: grade compartilhada (CSV + arrays do JSON), filtro por coluna, agrupar e vista de cards
Pedido do dono, com a Mapoteca como referência. Raciocínio, achados de UX e fases em `meta/analises/261117-ANALISE-ux-tabelas-e-json.md` (Em discussão) — esta entrada só aponta para lá.
```

---

## Fora de escopo

- Nada da analise 261117 (grade compartilhada, filtro por coluna, desfazer, confirmar ao fechar, ✕ duplo, recuo do JSON): espera a decisao do dono.
- Nao mexer no `catch {}` do `handleUpdate` alem do caminho (J7 da analise).
- Nao mexer na conversao do CSV (o CSV e texto; nao tem tipo).

## Armadilhas desta WO

- `JsonViewer.jsx` CRLF (ver cabecalho).
- As edicoes 3 e 4 sao vizinhas: aplique na ordem.
- A 30 e a 31 sao as DUAS METADES de um MOVER no IDEAS: aplique as duas.

---

## Depois de aplicar — conferencia antes do commit

- [ ] `npm run build` sem erro. Erro → PARE.
- [ ] `git status --short` → exatamente: `M logs/2026-11-12.md`, `M meta/CHANGELOG.md`, `M meta/DECISIONS.md`, `M meta/IDEAS.md`, `M meta/STATUS.md`, `M src/viewers/CsvViewer.jsx`, `M src/viewers/JsonViewer.jsx`, `?? logs/2026-11-17.md`, `?? meta/analises/`, `?? meta/workorders/261117-wo0005-fix-edicao-json-e-celula-csv.md` (10 entradas). Qualquer outra: PARE.
- [ ] Saldo de linhas (`wc -l` antes e depois; simulado pelo chat a partir deste texto, arquivos normalizados para LF): `meta/CHANGELOG.md` 104 → 112 (+8) · `meta/DECISIONS.md` 279 → 301 (+22) · `meta/IDEAS.md` 122 → 123 (+1) · `meta/STATUS.md` 48 → 49 (+1) · `src/viewers/CsvViewer.jsx` 263 → 272 (+9) · `src/viewers/JsonViewer.jsx` 759 → 812 (+53). Saldo diferente = VERMELHO.
- [ ] Contagens (unidade = linhas):
  - `grep -c "split('.')\|dotted\|\${path}" src/viewers/JsonViewer.jsx` → 0
  - `grep -c "^function parseEditedValue\|^function inferValue" src/viewers/JsonViewer.jsx` → 2
  - `grep -c "const \[editErr, setEditErr\]" src/viewers/JsonViewer.jsx` → 4
  - `grep -c "Number(editVal)" src/viewers/JsonViewer.jsx` → 0
  - `grep -c "visibility: isEditing" src/viewers/CsvViewer.jsx` → 1
  - `grep -c "^## FIX-004\|^## FIX-005" meta/DECISIONS.md` → 2 · `grep -c "^## \[0.1.9\]" meta/CHANGELOG.md` → 1 · `grep -c "^### 2026-11-07 — JSON Formulário: validar" meta/IDEAS.md` → 0
- [ ] **Chega no ramo?** JSON: `JsonViewer` → (`JsonNode` | `Field` | `ArrayTable` | `RowDetailModal`) → `commit*` → `parseEditedValue` → `handleUpdate(path lista)`. CSV: `CsvViewer` → celula com `isEditing`. O build responde «compila?»; «grava certo e a tabela nao pula?» e do roteiro do dono.
- [ ] Se rodou `npm run dev`, encerre.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O de sempre, depois do push. Grave em `../AAMMDD-HHMM-code-fileview-apply-wo0005.txt` (`date +%y%m%d-%H%M`).

## Commit — blocos separados, mensagem SEM acento

```
git add src/viewers/JsonViewer.jsx src/viewers/CsvViewer.jsx meta/STATUS.md meta/CHANGELOG.md meta/DECISIONS.md meta/IDEAS.md meta/analises logs/2026-11-12.md logs/2026-11-17.md meta/workorders/261117-wo0005-fix-edicao-json-e-celula-csv.md
```

```
git commit -m "fix(json,csv): edicao que nao serve ao tipo nao grava; celula do CSV nao rearranja a tabela" -m "FIX-004: parseEditedValue valida e devolve ok/erro, caminho do JSON vira lista de chaves. FIX-005: campo de edicao do CSV por cima da celula. Versao 0.1.9. Inclui a analise 261117 de UX das tabelas."
```

```
git push
```

*Gerado pelo Kit de Contexto Universal v1.135.0 — 2026-11-10 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
