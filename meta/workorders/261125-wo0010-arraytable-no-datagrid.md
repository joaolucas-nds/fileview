# WO 0010 — Fase 2c da grade: `ArrayTable` do JSON no `DataGrid`

> **Tipo:** mista — CODIGO (`src/components/DataGrid.jsx` e `src/viewers/JsonViewer.jsx` substituidos inteiros) + registro nos meta/.
> **Config sugerida:** Sonnet, `/effort medium`.
> **Pre-requisito:** escrita sobre `686097c`. `git status --short` ao comecar: so os 6 arquivos do chat abaixo + esta WO.
> **Base:** spec `meta/specs/261123-grade-de-dados-fase2.md`, passo 2c; DEC-014 (escrita pelo chat neste turno).
> **Arquivos que o chat gravou no disco e esta WO versiona** (Edicao 0: `sha1sum`; diferente = PARE):
>   - `meta/CONTEXT.md` — `77452353641dfe6d4905e3d1345051e1130b15f1`
>   - `meta/GLOSSARY.md` — `c41b69bf1417da2584a92b13524f1034b3ef1eef`
>   - `meta/DECISIONS.md` — `813b0989296fe9dd4dbd663619d507da94ff2ddb`
>   - `meta/IDEAS.md` — `9bfb1be23366d850a75336e105a7f331b0e18ba0`
>   - `meta/specs/261123-grade-de-dados-fase2.md` — `8451f4bca8457d873a9d3a753330b319af66d0a7`
>   - `logs/2026-11-25.md` — `641398c50d2805b54e883022caeec26e9f9b227c`
> **Guarda dos arquivos substituidos inteiros** (Edicao 0; diferente = PARE): `src/components/DataGrid.jsx` = `e46f8977c7b348238e65a8a901b4f7c7f6e8c683` (318 linhas, LF) · `src/viewers/JsonViewer.jsx` = `2880fe64775315369527f5179e14a214b35a93ad` (826 linhas, **CRLF** na arvore).
> **Ancora semantica:** ancora que nao bater EXATAMENTE = PARE e reporte (e grave o relatorio de parada).
> **Idempotencia:** Edicoes 1–2 — arquivo ja com o sha1 de DEPOIS (abaixo) = PULE. Edicoes 3–8 sao «trocar»: ja aplicada = texto novo inteiro presente.
> **Ancoras lidas em:** recortadas por script, neste turno, sobre `686097c`: `meta/STATUS.md` (3–6), `meta/CHANGELOG.md` (7), `meta/ROADMAP.md` (8). O trecho literal de cada uma e o bloco **Ancora**, em cerca de QUATRO crases. Simulado a partir do texto desta WO: cada ancora = 1 ocorrencia.
> **Fim de linha:** `DataGrid.jsx` LF. **`JsonViewer.jsx` e CRLF na arvore: grave o texto da Edicao 2 convertendo cada `\n` em `\r\n`** (ex.: `python -c` com `newline='\r\n'`). sha1 de DEPOIS: `DataGrid.jsx` = `a81d7870f0f55068645aeb5012c9f52a8862d1a8` · `JsonViewer.jsx` (CRLF) = `33131005d2cfbc376201cf4a642aeb32b1e1f72b`. Diferente = VERMELHO.
> **Validacao ja feita pelo chat (nao substitui o build):** os dois arquivos desta WO rodaram na VM (React 18.3.1 + `@tanstack/react-table` 8.21.3 + `lucide-react` 0.462.0, jsdom 24). JSON com `../261112-roteiro-teste/teste.json`: 21/21 (sem paginacao; numero recusa «abc» e aceita 2.5; recuo de 4 espacos mantido; Delete em boolean abre com o motivo; null → 12 e depois recusa texto; Tab; edicao sob ordenacao no indice original; modal pelo nº da linha e por Shift+Enter, mostrando o valor editado; celula objeto nao edita; chave ausente grava valor inferido). CSV (regressao da 2b, mesmo `DataGrid` novo): 22/22.
> **Proximo comando:** nenhum — conferencia na tela e do dono, pelo roteiro entregue no chat no mesmo turno.

> **Canal dos meta neste ciclo = CODE** para STATUS, CHANGELOG e ROADMAP (edicoes 3–8). CONTEXT, GLOSSARY, DECISIONS (DEC-014), IDEAS, spec e log ja foram escritos pelo chat: so confira o hash e versione.

---

## 1. Por que

Fase 2c da DEC-013: a tabela do JSON passa a ser a mesma grade do CSV. Decisoes na DEC-014: sem paginacao (rola por dentro, cabecalho preso); o registro completo abre pelo nº da linha ou Shift+Enter (o clique simples agora seleciona a celula, e o atraso de 220 ms da DEC-010 sai); a validacao de tipo (FIX-004) acontece dentro da grade — `onCommit` pode devolver `{ ok: false, error }` e o campo fica aberto com borda vermelha.

O `DataGrid` so GANHA props opcionais (`toText`, `renderCell`, `canEditCell`, `onOpenRow`, `maxHeight`); o CSV nao passa nenhuma e continua igual (`CsvViewer.jsx` nao muda).

---

## Edicao 0 — conferir hashes

````
sha1sum meta/CONTEXT.md meta/GLOSSARY.md meta/DECISIONS.md meta/IDEAS.md meta/specs/261123-grade-de-dados-fase2.md logs/2026-11-25.md src/components/DataGrid.jsx src/viewers/JsonViewer.jsx
````

## Edicao 1 — `src/components/DataGrid.jsx` · substituir o arquivo INTEIRO

**Substituir todo o conteudo por** (369 linhas, LF):

````
import { useState, useMemo, useEffect, useRef } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'
import { Trash2, Maximize2 } from 'lucide-react'

/**
 * Grade de dados compartilhada (DEC-013; spec 261123, fase 2b). Hoje usada pelo
 * CSV e pelo ArrayTable do JSON (fase 2c). A logica de ordenar e filtrar vem
 * do TanStack Table v8 (headless); o visual e o teclado sao nossos.
 *
 * Identidade da linha = indice dela em `rows` (o dado ORIGINAL, na ordem do
 * arquivo). Toda edicao e devolvida por esse indice, nunca pela posicao
 * visivel — a regra do FIX-002 vale com filtro e ordenacao ativos.
 *
 * @param {string[]} columns       nomes das colunas, na ordem do arquivo
 * @param {object[]} rows          um objeto por registro (chave = coluna)
 * @param {string}   globalFilter  busca em todas as colunas (sem diferenciar maiusculas)
 * @param {(rowIdx:number, col:string, text:string) => (void|{ok:false, error:string})} onCommit
 *        devolvendo { ok: false, error } a grade NAO fecha o campo: borda vermelha
 *        e o motivo no title (validacao de tipo do JSON, FIX-004)
 * @param {(value:any) => string} [toText]  texto da celula para medir, filtrar,
 *        ordenar e abrir a edicao; padrao: o valor como texto, vazio para null
 * @param {(value:any) => any} [renderCell]  como desenhar o valor (padrao: o texto)
 * @param {(value:any) => boolean} [canEditCell]  sem ela, toda celula e editavel
 * @param {(rowIdx:number) => void} [onOpenRow]  com ela, o numero da linha abre o
 *        registro completo (clique ou Shift+Enter)
 * @param {string} [maxHeight]  altura maxima (a grade rola por dentro)
 * @param {(rowIdx:number) => void} [onDeleteRow]   sem ela, nao ha coluna da lixeira
 * @param {{rowIdx:number, col:string, nonce:number}} [editRequest]  abre a edicao de fora (ex.: «+ Linha»)
 * @param {(visible:number) => void} [onVisibleCountChange]
 */
export default function DataGrid({
  columns, rows, globalFilter = '', onCommit, onDeleteRow, editRequest, onVisibleCountChange,
  toText = defaultText, renderCell, canEditCell, onOpenRow, maxHeight,
}) {
  const [sorting, setSorting] = useState([])
  // Selecao e edicao guardam a IDENTIDADE da celula (indice original + coluna),
  // nao a posicao: ordenar ou filtrar nao troca a celula selecionada.
  const [selected, setSelected] = useState(null) // { rowId, col }
  const [editing, setEditing] = useState(null)   // { rowId, col }
  const [editVal, setEditVal] = useState('')
  const [editErr, setEditErr] = useState(null) // motivo recusado pelo onCommit
  const wrapRef = useRef(null)

  // Largura de cada coluna medida UMA vez, na abertura (cabecalho + ate 200
  // linhas), com piso e teto; depois fica fixa: editar, filtrar e ordenar nao
  // mexem na geometria (spec 261123 — a causa do FIX-005 era a largura seguir
  // o conteudo). O ViewerRouter remonta a grade a cada arquivo (FIX-003).
  const widthKey = columns.join('\u0000')
  const widths = useMemo(() => {
    const sample = rows.slice(0, 200)
    return columns.map(c => {
      const longest = Math.max(String(c).length, ...sample.map(r => toText(r[c]).length))
      return Math.max(64, Math.min(320, Math.round(longest * 7.4 + 28)))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthKey])

  const columnDefs = useMemo(() => columns.map(c => ({
    id: c,
    accessorFn: row => toText(row[c]),
    header: c,
    sortingFn: (a, b, id) => compareText(a.getValue(id), b.getValue(id)),
  })), [widthKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getRowId: (_row, index) => String(index),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Clique no cabecalho: crescente → decrescente → sem ordem (analise 261117, U4)
    enableSortingRemoval: true,
    sortDescFirst: false,
    enableMultiSort: false,
    globalFilterFn: (row, colId, value) =>
      String(row.getValue(colId)).toLowerCase().includes(String(value).toLowerCase()),
    getColumnCanGlobalFilter: () => true,
  })

  const visible = table.getRowModel().rows
  const visibleIds = visible.map(r => r.id)

  useEffect(() => { onVisibleCountChange?.(visible.length) }, [visible.length, onVisibleCountChange])

  // Pedido de edicao vindo de fora (ex.: «+ Linha» abre a 1a celula da linha nova)
  useEffect(() => {
    if (!editRequest) return
    const cell = { rowId: String(editRequest.rowIdx), col: editRequest.col }
    setSelected(cell)
    setEditing(cell)
    setEditVal('')
    setEditErr(null)
  }, [editRequest?.nonce]) // eslint-disable-line react-hooks/exhaustive-deps

  // A celula selecionada fica sempre a vista (setas levam para fora da tela)
  useEffect(() => {
    if (!selected || !wrapRef.current) return
    const el = wrapRef.current.querySelector(`[data-cell="${cssEscape(selected.rowId + '|' + selected.col)}"]`)
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [selected])

  const rawOf = (rowId, col) => rows[Number(rowId)]?.[col]
  const valueOf = (rowId, col) => toText(rawOf(rowId, col))
  const editable = (cell) => !canEditCell || canEditCell(rawOf(cell.rowId, cell.col))
  const focusGrid = () => wrapRef.current?.focus({ preventScroll: true })

  const startEdit = (cell, initial) => {
    setSelected(cell)
    if (!editable(cell)) return
    setEditing(cell)
    setEditVal(initial ?? valueOf(cell.rowId, cell.col))
    setEditErr(null)
  }

  // Grava so se mudou (evita passo vazio na pilha de desfazer). Devolve false
  // quando o onCommit recusou o valor: quem chamou deixa o campo aberto.
  const commit = (cell, value) => {
    if (value === valueOf(cell.rowId, cell.col)) return true
    const r = onCommit(Number(cell.rowId), cell.col, value)
    if (r && r.ok === false) { setEditErr(r.error || 'Valor inválido'); return false }
    setEditErr(null)
    return true
  }

  // Vizinha na ordem VISIVEL. Passando da borda da coluna, vai para a linha
  // seguinte/anterior; passando da borda da tabela, devolve null.
  const neighbor = (cell, dRow, dCol, wrap) => {
    let r = visibleIds.indexOf(cell.rowId)
    let c = columns.indexOf(cell.col)
    if (r === -1 || c === -1) return null
    c += dCol
    if (wrap) {
      if (c >= columns.length) { c = 0; r += 1 }
      else if (c < 0) { c = columns.length - 1; r -= 1 }
    } else {
      c = Math.max(0, Math.min(columns.length - 1, c))
    }
    r += dRow
    if (r < 0 || r >= visibleIds.length) return null
    return { rowId: visibleIds[r], col: columns[c] }
  }

  // Teclado com a grade em foco (nenhum campo aberto). Ctrl+Z/Ctrl+Y nao sao
  // tratados aqui: seguem para o desfazer do arquivo (spec 261123, fase 2a).
  const onGridKeyDown = (e) => {
    if (editing || !columns.length) return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (!selected) {
      if (visibleIds.length && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault(); setSelected({ rowId: visibleIds[0], col: columns[0] })
      }
      return
    }
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    if (moves[e.key]) {
      e.preventDefault()
      const next = neighbor(selected, moves[e.key][0], moves[e.key][1], false)
      if (next) setSelected(next)
      return
    }
    if (e.key === 'Enter' && e.shiftKey && onOpenRow) { e.preventDefault(); onOpenRow(Number(selected.rowId)); return }
    if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit(selected); return }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Limpar um valor que o tipo nao aceita vazio (numero, true/false) abre o
      // campo vazio com o motivo, em vez de falhar calado
      e.preventDefault()
      if (!editable(selected)) return
      if (!commit(selected, '')) { setEditing(selected); setEditVal('') }
      return
    }
    if (e.key === 'Escape') { e.preventDefault(); setSelected(null); return }
    if (e.key === 'Tab') {
      const next = neighbor(selected, 0, e.shiftKey ? -1 : 1, true)
      if (next) { e.preventDefault(); setSelected(next) }
      return
    }
    // Tecla imprimivel: comeca a editar SUBSTITUINDO o valor, como numa planilha
    if (e.key.length === 1) { e.preventDefault(); startEdit(selected, e.key) }
  }

  // Teclado dentro do campo de edicao
  const onEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Enter confirma e desce uma linha (planilha); na ultima, fica onde esta
      e.preventDefault()
      if (!commit(editing, editVal)) return
      const down = neighbor(editing, 1, 0, false)
      setSelected(down || editing)
      setEditing(null)
      focusGrid()
    } else if (e.key === 'Tab') {
      // Tab confirma e abre a proxima celula na ordem visivel; na borda, fecha
      e.preventDefault()
      if (!commit(editing, editVal)) return
      const next = neighbor(editing, 0, e.shiftKey ? -1 : 1, true)
      if (next && editable(next)) startEdit(next)
      else if (next) { setEditing(null); setSelected(next); focusGrid() }
      else { setEditing(null); focusGrid() }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditing(null)
      setEditErr(null)
      focusGrid()
    }
  }

  // Sair do campo clicando fora confirma (padrao de edicao em celula). Valor
  // recusado: o campo fica aberto, com a borda vermelha (FIX-004).
  const onEditBlur = () => {
    if (!editing) return
    if (commit(editing, editVal)) setEditing(null)
  }

  const cancelEdit = () => { setEditing(null); setEditErr(null); focusGrid() }

  // Coluna do numero mais larga quando ele tambem e o botao do registro
  const numWidth = onOpenRow ? 60 : 44
  const totalWidth = numWidth + widths.reduce((a, b) => a + b, 0) + (onDeleteRow ? 36 : 0)

  return (
    <div ref={wrapRef} tabIndex={0} onKeyDown={onGridKeyDown}
      style={{ flex: 1, overflow: 'auto', outline: 'none', maxHeight }}>
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: `${totalWidth}px`, minWidth: '100%', fontSize: '13px' }}>
        <colgroup>
          <col style={{ width: `${numWidth}px` }} />
          {widths.map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}
          {onDeleteRow && <col style={{ width: '36px' }} />}
        </colgroup>
        <thead>
          <tr style={{ position: 'sticky', top: 0, zIndex: 4 }}>
            <th style={{ ...thStyle, color: 'var(--text-faint)' }}>#</th>
            {table.getHeaderGroups()[0].headers.map(h => {
              const dir = h.column.getIsSorted()
              return (
                <th key={h.id} onClick={h.column.getToggleSortingHandler()} title={h.id}
                  style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.id}</span>
                    {dir && <span style={{ fontSize: '10px', color: 'var(--accent)', flexShrink: 0 }}>{dir === 'asc' ? '▲' : '▼'}</span>}
                  </div>
                </th>
              )
            })}
            {onDeleteRow && <th style={thStyle} />}
          </tr>
        </thead>
        <tbody>
          {visible.map(row => (
            <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ ...tdStyle, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {onOpenRow ? (
                  <button onClick={() => onOpenRow(Number(row.id))}
                    title="Abrir o registro completo (Shift+Enter)" aria-label="Abrir registro"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', border: 'none', background: 'transparent', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'inherit' }}
                  >{Number(row.id) + 1}<Maximize2 size={10} /></button>
                ) : Number(row.id) + 1}
              </td>
              {columns.map(col => {
                const isSel = selected?.rowId === row.id && selected?.col === col
                const isEditing = editing?.rowId === row.id && editing?.col === col
                const raw = row.original[col]
                const text = toText(raw)
                return (
                  <td key={col} data-cell={row.id + '|' + col}
                    onMouseDown={() => { if (!isEditing) setSelected({ rowId: row.id, col }) }}
                    onDoubleClick={() => startEdit({ rowId: row.id, col })}
                    title={isEditing ? undefined : text}
                    style={{
                      ...tdStyle, position: 'relative',
                      cursor: canEditCell && !canEditCell(raw) ? 'default' : 'cell',
                      boxShadow: isSel && !isEditing ? 'inset 0 0 0 2px var(--accent)' : 'none',
                    }}>
                    {/* O texto fica no lugar (invisivel na edicao); o campo vai POR CIMA
                        da celula e o ✕ fica fora, a direita (FIX-005). */}
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', visibility: isEditing ? 'hidden' : 'visible' }}>
                      {renderCell ? renderCell(raw) : (text || '\u00a0')}
                    </span>
                    {isEditing && (
                      <>
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={onEditBlur}
                          onKeyDown={onEditKeyDown}
                          title={editErr || undefined}
                          aria-invalid={editErr ? true : undefined}
                          style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            boxSizing: 'border-box', zIndex: 2,
                            border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`, borderRadius: '3px',
                            padding: '0 11px', background: 'var(--accent-light)',
                            fontSize: '13px', fontFamily: 'var(--font-ui)',
                            outline: 'none', color: 'var(--text)',
                          }}
                        />
                        {/* onMouseDown+preventDefault dispara antes do onBlur do campo */}
                        <button
                          onMouseDown={e => { e.preventDefault(); cancelEdit() }}
                          title="Cancelar (Esc)"
                          style={{
                            position: 'absolute', left: '100%', top: '50%',
                            transform: 'translate(4px, -50%)', zIndex: 3,
                            fontSize: '11px', lineHeight: 1, padding: '3px 6px', borderRadius: '3px',
                            border: '1px solid var(--border)', color: 'var(--text-muted)',
                            background: 'var(--surface)', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          }}
                        >✕</button>
                      </>
                    )}
                  </td>
                )
              })}
              {onDeleteRow && (
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => onDeleteRow(Number(row.id))}
                    title="Excluir linha (dá para desfazer na barra de cima ou com Ctrl+Z)"
                    aria-label="Excluir linha"
                    style={{ fontSize: '11px', color: 'var(--text-faint)', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent' }}
                  ><Trash2 size={13} /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Texto padrao de uma celula: null/undefined viram vazio. */
function defaultText(v) {
  return v == null ? '' : String(v)
}

/**
 * Ordem de dois textos de celula: os dois numericos → por numero; senao, por
 * texto. Celula vazia NAO vale 0 (antes `Number('')` misturava vazio aos
 * numeros — analise 261117, U12).
 */
function compareText(a, b) {
  const an = a.trim() === '' ? NaN : Number(a), bn = b.trim() === '' ? NaN : Number(b)
  if (!isNaN(an) && !isNaN(bn)) return an - bn
  return a.localeCompare(b)
}

/** Escapa um valor para usar dentro de um seletor de atributo CSS. */
function cssEscape(s) {
  return String(s).replace(/["\\]/g, '\\$&')
}

const thStyle = {
  padding: '8px 12px', textAlign: 'left', fontWeight: '500',
  background: 'var(--gray-light)', borderBottom: '2px solid var(--border)',
  borderRight: '1px solid var(--border)', whiteSpace: 'nowrap', overflow: 'hidden',
  fontSize: '12px', color: 'var(--text)',
}
const tdStyle = {
  padding: '6px 12px', borderRight: '1px solid var(--border)', overflow: 'hidden',
  cursor: 'cell',
}
````

## Edicao 2 — `src/viewers/JsonViewer.jsx` · substituir o arquivo INTEIRO (gravar em CRLF)

**Substituir todo o conteudo por** (717 linhas; grave com CRLF):

````
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import DataGrid from '../components/DataGrid'

// Cores por tipo de dado
const TYPE_COLOR = {
  string: 'var(--green)',
  number: 'var(--blue)',
  boolean: 'var(--purple)',
  null: 'var(--text-faint)',
  array: 'var(--text)',
  object: 'var(--text)',
}

// ─── Modo Árvore (inalterado) ────────────────────────────────────────────────

function JsonNode({ keyName, value, depth = 0, path = [], onUpdate }) {
  const [collapsed, setCollapsed] = useState(depth > 2)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')

  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  const isLeaf = type !== 'object' && type !== 'array'
  const indent = depth * 18

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

  const renderValue = () => {
    if (editing) {
      return (
        <input
          autoFocus
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onBlur={commitEdit}
          title={editErr || undefined}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
          style={{
            fontSize: '13px', fontFamily: 'var(--font-mono)',
            border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`, borderRadius: '3px',
            padding: '1px 6px', background: 'var(--accent-light)',
            color: 'var(--text)', outline: 'none', minWidth: '60px',
          }}
        />
      )
    }
    if (type === 'string') return <span style={{ color: TYPE_COLOR.string }} onDoubleClick={startEdit}>"{value}"</span>
    if (type === 'number') return <span style={{ color: TYPE_COLOR.number }} onDoubleClick={startEdit}>{value}</span>
    if (type === 'boolean') return <span style={{ color: TYPE_COLOR.boolean }} onDoubleClick={startEdit}>{String(value)}</span>
    if (type === 'null') return <span style={{ color: TYPE_COLOR.null }} onDoubleClick={startEdit}>null</span>
    if (type === 'array') return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>[ {value.length} itens ]</span>
    if (type === 'object') {
      const keys = Object.keys(value)
      return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{'{ '}{keys.length} chaves {'}'}</span>
    }
  }

  if (type === 'array' || type === 'object') {
    const entries = type === 'array' ? value.map((v, i) => [i, v]) : Object.entries(value)
    const bracket = type === 'array' ? ['[', ']'] : ['{', '}']
    return (
      <div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: `${indent}px`, minHeight: '24px', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setCollapsed(c => !c)}
        >
          <span style={{ fontSize: '10px', color: 'var(--text-faint)', transform: collapsed ? 'rotate(-90deg)' : 'none', display: 'inline-block', transition: 'transform .12s', width: '12px', textAlign: 'center', flexShrink: 0 }}>▾</span>
          {keyName !== undefined && (
            <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              "{keyName}"<span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>:</span>
            </span>
          )}
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{bracket[0]}</span>
          {collapsed && (
            <>
              <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {type === 'array' ? ` ${value.length} itens ` : ` ${Object.keys(value).length} chaves `}
              </span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{bracket[1]}</span>
            </>
          )}
        </div>
        {!collapsed && (
          <>
            {entries.map(([k, v]) => (
              <JsonNode key={String(k)} keyName={k} value={v} depth={depth + 1} path={[...path, k]} onUpdate={onUpdate} />
            ))}
            <div style={{ paddingLeft: `${indent}px`, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', minHeight: '20px' }}>
              {bracket[1]}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: `${indent + 16}px`, minHeight: '22px' }}>
      {keyName !== undefined && (
        <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '13px', flexShrink: 0 }}>
          "{keyName}"<span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>:</span>
        </span>
      )}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{renderValue()}</span>
    </div>
  )
}

// ─── Modo Formulário ─────────────────────────────────────────────────────────

// Converte dado em seções de 1º nível
function parseSections(data) {
  if (data === null || typeof data !== 'object') return []
  const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v]) : Object.entries(data)
  return entries.map(([key, value]) => ({
    key,
    value,
    type: value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value,
  }))
}

// Array de objetos com schema uniforme → candidato a tabela
function isArrayOfObjects(arr) {
  return Array.isArray(arr) && arr.length > 0 && arr.every(v => v && typeof v === 'object' && !Array.isArray(v))
}

// Union de todas as chaves de um array de objetos
function arrayKeys(arr) {
  const s = new Set()
  arr.forEach(o => Object.keys(o).forEach(k => s.add(k)))
  return [...s]
}

// Tipo primitivo editável (string/number/boolean/null) — usado tanto pelas
// células do ArrayTable quanto pelos campos do RowDetailModal para decidir
// se um valor pode virar input/textarea.
function isEditablePrimitive(v) {
  const t = v === null ? 'null' : typeof v
  return ['string', 'number', 'boolean', 'null'].includes(t)
}

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

// Valor tipado com cor
function TypedValue({ value }) {
  const type = value === null ? 'null' : typeof value
  const colors = { string: 'var(--green)', number: 'var(--blue)', boolean: 'var(--purple)', null: 'var(--text-faint)' }
  return (
    <span style={{ color: colors[type] || 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      {type === 'string' ? `"${value}"` : String(value)}
    </span>
  )
}

// Campo label + valor. Edição inline (2026-07-07): duplo clique no valor primitivo
// abre um input (mesmo padrão da Árvore) — Enter confirma via `onUpdate(path, valor)`,
// Esc cancela. `path` é a LISTA de chaves (ex.: ["user", "address", "city"]) resolvida pelo
// chamador (SectionContent) e repassada até aqui; sem `path`/`onUpdate` o campo
// permanece read-only (usado, por ex., por chamadores que ainda não repassam isso).
function Field({ label, value, path, onUpdate }) {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  const isPrimitive = ['string', 'number', 'boolean', 'null'].includes(type)
  const canEdit = isPrimitive && !!onUpdate && !!path
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      {isPrimitive ? (
        editing ? (
          <input
            autoFocus
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            title={editErr || undefined}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
            style={{
              fontSize: '12px', fontFamily: 'var(--font-mono)',
              border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`, borderRadius: 'var(--radius-sm)',
              padding: '3px 8px', background: 'var(--accent-light)',
              color: 'var(--text)', outline: 'none', width: '100%',
            }}
          />
        ) : (
          <div
            onDoubleClick={startEdit}
            title={canEdit ? 'Duplo clique para editar' : undefined}
            style={{
              background: 'var(--gray-light)', border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '3px 8px',
              cursor: canEdit ? 'text' : 'default',
            }}
          >
            <TypedValue value={value} />
          </div>
        )
      ) : (
        <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontStyle: 'italic', padding: '3px 0' }}>
          {type === 'array' ? `[ ${value.length} itens ]` : `{ ${Object.keys(value).length} chaves }`}
        </span>
      )}
    </div>
  )
}

// Modal de detalhe — mostra o registro completo sem truncamento, campo por campo.
// Edição inline (2026-07-07, sessão 2): duplo clique num valor primitivo edita.
// Strings usam <textarea> (não <input>) porque o caso que motivou este modal
// (DEC-008) é justamente texto longo — Enter insere quebra de linha em vez de
// confirmar; só Esc cancela ou o blur confirma. Number/boolean/null usam Enter
// para confirmar, como em qualquer outro campo do projeto. `path`/`rowIdx` vêm
// do ArrayTable — o caminho final é [...path, rowIdx, chave], usando o índice
// ORIGINAL da linha no array (não a posição pós-paginação — mesma classe de
// cuidado do FIX-002 no CSV). Sem `onUpdate`/`path`/`rowIdx`, o modal continua
// read-only (uso defensivo, não deveria ocorrer no fluxo atual).
function RowDetailModal({ row, rowIdx, path, onUpdate, onClose }) {
  const canEdit = !!onUpdate && !!path && rowIdx !== undefined && rowIdx !== null
  const [editKey, setEditKey] = useState(null)
  const [editVal, setEditVal] = useState('')

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

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-md)',
          maxWidth: '640px', width: '92%', maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
          gap: '10px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Registro completo</span>
          {canEdit && (
            <span style={{ fontSize: '10px', color: 'var(--text-faint)', marginLeft: 'auto' }}>
              Duplo clique num valor para editar
            </span>
          )}
          <button onClick={onClose} style={{
            fontSize: '13px', padding: '2px 9px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent',
          }}>✕</button>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(row).map(([k, v]) => {
            const editable = canEdit && isEditablePrimitive(v)
            const editing = editKey === k
            return (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{k}</span>
                {editing ? (
                  <textarea
                    autoFocus
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    title={editErr || undefined}
                    onBlur={() => commitEdit(k, v)}
                    onKeyDown={e => {
                      // Em campos não-string (number/boolean/null) Enter confirma, como
                      // em qualquer input do projeto. Em string, Enter é quebra de linha
                      // de propósito — o valor pode ser texto longo (ex: text_content).
                      if (e.key === 'Enter' && typeof v !== 'string') { e.preventDefault(); commitEdit(k, v) }
                      if (e.key === 'Escape') setEditKey(null)
                    }}
                    rows={typeof v === 'string' && v.length > 60 ? 5 : 1}
                    style={{
                      background: 'var(--accent-light)', border: `1px solid ${editErr ? 'var(--red)' : 'var(--accent)'}`,
                      borderRadius: 'var(--radius-sm)', padding: '6px 10px',
                      fontSize: '12px', fontFamily: 'var(--font-mono)',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      color: 'var(--text)', outline: 'none', resize: 'vertical',
                    }}
                  />
                ) : (
                  <div
                    onDoubleClick={() => startEdit(k, v)}
                    title={editable ? 'Duplo clique para editar' : undefined}
                    style={{
                      background: 'var(--gray-light)', border: '0.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 10px',
                      fontSize: '12px', fontFamily: 'var(--font-mono)',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      cursor: editable ? 'text' : 'default',
                      color: typeof v === 'string' ? 'var(--green)' : typeof v === 'number' ? 'var(--blue)' : typeof v === 'boolean' ? 'var(--purple)' : 'var(--text-faint)',
                    }}
                  >
                    {v === null || v === undefined ? 'null' : typeof v === 'string' ? `"${v}"` : typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Tabela para arrays de objetos (fase 2c, DEC-013): a mesma grade do CSV
// (`DataGrid`, TanStack Table v8) — largura de coluna fixa, celula selecionada
// com teclado, ordenar pelo cabecalho. Sem paginacao: a grade rola por dentro
// (ate `TABLE_MAX_HEIGHT`) e o cabecalho fica preso no alto.
// O registro completo abre pelo NUMERO da linha (clique ou Shift+Enter); antes
// abria no clique da linha, com um atraso para nao brigar com o duplo clique —
// com a celula selecionavel, o clique simples passou a ser «selecionar».
// `path` e a chave da secao (lista, FIX-004); a celula editada grava em
// [...path, indiceORIGINAL, coluna] — a grade devolve sempre o indice da linha
// no array, nunca a posicao visivel (mesma regra do FIX-002 no CSV). Valor que
// nao serve ao tipo (`parseEditedValue`) volta como { ok: false } e a grade
// mantem o campo aberto com a borda vermelha.
const TABLE_MAX_HEIGHT = '420px'

// Texto de uma celula do JSON: vazio para null/ausente, objeto/array como JSON
function cellText(v) {
  if (v === null || v === undefined) return ''
  return typeof v === 'object' ? JSON.stringify(v) : String(v)
}

function ArrayTable({ value, path, onUpdate }) {
  const keys = useMemo(() => arrayKeys(value), [value])
  // Indice ORIGINAL da linha aberta no modal; o registro e relido de `value` a
  // cada render, entao o modal mostra o valor ja gravado depois de uma edicao
  const [openIdx, setOpenIdx] = useState(null)
  const canEdit = !!onUpdate && !!path

  const commitCell = (idx, col, text) => {
    const r = parseEditedValue(value[idx]?.[col] ?? null, text)
    if (!r.ok) return r
    onUpdate([...path, idx, col], r.value)
  }

  return (
    <div>
      <div style={{ border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <DataGrid
          columns={keys}
          rows={value}
          onCommit={commitCell}
          toText={cellText}
          renderCell={v => (v !== null && typeof v === 'object')
            ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{JSON.stringify(v)}</span>
            : <TypedValue value={v ?? null} />}
          canEditCell={v => canEdit && isEditablePrimitive(v ?? null)}
          onOpenRow={setOpenIdx}
          maxHeight={TABLE_MAX_HEIGHT}
        />
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '5px' }}>
        {value.length} linhas · clique seleciona · setas movem · Enter, F2 ou digitar edita · Enter grava e desce · Tab avança · Esc cancela · clique no cabeçalho ordena · o nº da linha (ou Shift+Enter) abre o registro completo{canEdit ? '' : ' · edição indisponível para esta seção'}
      </div>

      {openIdx !== null && value[openIdx] && (
        <RowDetailModal
          row={value[openIdx]}
          rowIdx={openIdx}
          path={path}
          onUpdate={onUpdate}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </div>
  )
}

// Lista de primitivos para arrays simples
function PrimitiveList({ value }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {value.map((v, i) => (
        <span key={i} style={{ background: 'var(--gray-light)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 7px' }}>
          <TypedValue value={v} />
        </span>
      ))}
    </div>
  )
}

// Conteúdo de seção — compartilhado pelos 3 layouts.
// `onUpdate` (opcional) é repassado ao Field/ArrayTable com o caminho certo, como
// LISTA de chaves (FIX-004 — chave com ponto, como "config.tema", quebrava o texto
// pontuado): seção primitiva solta → [section.key]; seção objeto → [section.key, campo];
// seção array de objetos → [section.key] (o ArrayTable completa com idx e coluna).
// Arrays de primitivos (chips) ainda não recebem edição inline nesta sessão.
function SectionContent({ section, onUpdate }) {
  const { value, type, key } = section
  if (type === 'array') {
    return isArrayOfObjects(value)
      ? <ArrayTable value={value} path={[key]} onUpdate={onUpdate} />
      : <PrimitiveList value={value} />
  }
  if (type === 'object') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        {Object.entries(value).map(([k, v]) => (
          <Field key={k} label={k} value={v} path={[key, k]} onUpdate={onUpdate} />
        ))}
      </div>
    )
  }
  return <Field label={section.key} value={value} path={[section.key]} onUpdate={onUpdate} />
}

// Layout A — Cards em grade.
// Seções que são tabelas (array de objetos) ocupam a largura TOTAL da grade —
// espremer uma tabela de 10 colunas num card de 260px é o que causava a
// aparência de "vazio" no print original. Seções simples continuam em grade.
function CardLayout({ sections, onUpdate }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', padding: '16px' }}>
      {sections.map(s => {
        const isWideTable = s.type === 'array' && isArrayOfObjects(s.value)
        return (
          <div key={s.key} style={{
            background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
            gridColumn: isWideTable ? '1 / -1' : 'auto',
          }}>
            <div style={{ padding: '7px 12px', background: 'var(--gray-light)', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '500', color: 'var(--amber)' }}>{s.key}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                {s.type === 'array' ? `${s.value.length} itens` : s.type === 'object' ? `${Object.keys(s.value).length} chaves` : s.type}
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              <SectionContent section={s} onUpdate={onUpdate} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Layout B — Tabs
function TabLayout({ sections, onUpdate }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = sections[activeIdx]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', overflowX: 'auto', flexShrink: 0 }}>
        {sections.map((s, i) => (
          <button key={s.key} onClick={() => setActiveIdx(i)} style={{
            padding: '8px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: 'none', cursor: 'pointer', flexShrink: 0, background: 'transparent',
            borderBottom: i === activeIdx ? '2px solid var(--accent)' : '2px solid transparent',
            color: i === activeIdx ? 'var(--text)' : 'var(--text-muted)',
          }}>{s.key}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {active && <SectionContent section={active} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}

// Layout C — Painel lateral
function PanelLayout({ sections, onUpdate }) {
  const [activeKey, setActiveKey] = useState(sections[0]?.key)
  const active = sections.find(s => s.key === activeKey) || sections[0]
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: '148px', minWidth: '148px', borderRight: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto' }}>
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveKey(s.key)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px',
            fontSize: '12px', fontFamily: 'var(--font-mono)', border: 'none', cursor: 'pointer', background: 'transparent',
            borderLeft: s.key === activeKey ? '2px solid var(--accent)' : '2px solid transparent',
            color: s.key === activeKey ? 'var(--text)' : 'var(--text-muted)',
          }}>{s.key}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {active?.key}
        </div>
        {active && <SectionContent section={active} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}

// Container do formulário com sub-switcher Cards / Tabs / Painel
const FORM_LAYOUTS = [
  { key: 'cards', label: 'Cards' },
  { key: 'tabs', label: 'Tabs' },
  { key: 'painel', label: 'Painel' },
]

function FormView({ data, onUpdate }) {
  const [layout, setLayout] = useState(() => {
    try { return localStorage.getItem('fv-json-layout') || 'cards' } catch { return 'cards' }
  })

  useEffect(() => {
    try { localStorage.setItem('fv-json-layout', layout) } catch {}
  }, [layout])

  const sections = useMemo(() => parseSections(data), [data])

  if (!sections.length) {
    return <div style={{ padding: '24px', color: 'var(--text-faint)', fontSize: '13px' }}>JSON vazio ou não é objeto/array no nível raiz.</div>
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', color: 'var(--text-faint)', marginRight: '6px' }}>Layout:</span>
        {FORM_LAYOUTS.map(l => (
          <button key={l.key} onClick={() => setLayout(l.key)} style={{
            padding: '3px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px',
            border: layout === l.key ? '1px solid var(--border)' : '1px solid transparent',
            background: layout === l.key ? 'var(--gray-light)' : 'transparent',
            color: layout === l.key ? 'var(--text)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}>{l.label}</button>
        ))}
        <span style={{ fontSize: '10px', color: 'var(--text-faint)', marginLeft: 'auto' }}>
          Duplo clique num campo para editar
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {layout === 'cards' && <div style={{ height: '100%', overflowY: 'auto' }}><CardLayout sections={sections} onUpdate={onUpdate} /></div>}
        {layout === 'tabs' && <TabLayout sections={sections} onUpdate={onUpdate} />}
        {layout === 'painel' && <PanelLayout sections={sections} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

const toolbarBtn = {
  padding: '4px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text-muted)', cursor: 'pointer',
}

export default function JsonViewer() {
  const { activeFile, updateContent, activeMode } = useApp()

  let parsed = null
  let parseErr = null
  try {
    if (activeFile?.content) parsed = JSON.parse(activeFile.content)
  } catch (e) { parseErr = e.message }

  const handleUpdate = useCallback((path, newVal) => {
    if (!activeFile) return
    try {
      const obj = JSON.parse(activeFile.content)
      // `path` e a lista de chaves (FIX-004): nunca dividir texto por ponto.
      const parts = path
      let ref = obj
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]]
      ref[parts[parts.length - 1]] = newVal
      updateContent(activeFile.id, serializeLike(obj, activeFile.content))
    } catch {}
  }, [activeFile, updateContent])

  if (!activeFile) return null

  // Modo Formulário
  if (activeMode === 'form') {
    if (parseErr) {
      return (
        <div style={{ padding: '24px' }}>
          <div style={{ padding: '16px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            ⚠ JSON inválido: {parseErr}
          </div>
        </div>
      )
    }
    return parsed !== null
      ? <FormView data={parsed} onUpdate={handleUpdate} />
      : <div style={{ padding: '24px', color: 'var(--text-faint)', fontSize: '13px' }}>Arquivo vazio.</div>
  }

  // Modo Árvore (padrão — comportamento original)
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, fontSize: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>Dica: dê duplo clique num valor para editar</span>
          <button onClick={() => { try { updateContent(activeFile.id, JSON.stringify(JSON.parse(activeFile.content), null, 2)) } catch {} }} style={toolbarBtn}>Formatar</button>
          <button onClick={() => { try { updateContent(activeFile.id, JSON.stringify(JSON.parse(activeFile.content))) } catch {} }} style={toolbarBtn}>Minificar</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {parseErr ? (
          <div style={{ padding: '16px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            ⚠ JSON inválido: {parseErr}
          </div>
        ) : parsed !== null ? (
          <JsonNode value={parsed} depth={0} path={[]} onUpdate={handleUpdate} />
        ) : (
          <div style={{ color: 'var(--text-faint)', fontSize: '13px' }}>Arquivo vazio.</div>
        )}
      </div>
    </div>
  )
}
````

## Edicao 3 — `meta/STATUS.md` · versoes 0.1.13 e 0.1.12 conferida

**Substituir.** Ancora:

````
**[0.1.12]** — 2026-11-25 — Fase 2b da grade: o CSV usa o `DataGrid` compartilhado (TanStack Table v8) — largura de coluna fixa, célula selecionada com teclado (setas, Enter/F2/digitar edita, Enter grava e desce, Delete limpa), vazio não vale 0 na ordenação. Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-25).
````

**Por:**

````
**[0.1.13]** — 2026-11-25 — Fase 2c da grade: a tabela do JSON (Formulário) usa o mesmo `DataGrid` do CSV — sem paginação (rola por dentro), ordenar pelo cabeçalho, célula selecionada com teclado, valor que não serve ao tipo deixa o campo aberto com borda vermelha; o registro completo abre pelo nº da linha ou Shift+Enter (DEC-014). Build verde; **conferência na tela pendente** (roteiro do dono, conversa 2 de 2026-11-25).
**[0.1.12]** — 2026-11-25 — Fase 2b da grade: o CSV usa o `DataGrid` compartilhado (TanStack Table v8) — largura de coluna fixa, célula selecionada com teclado (setas, Enter/F2/digitar edita, Enter grava e desce, Delete limpa), vazio não vale 0 na ordenação. Build verde; **conferido na tela pelo dono em 2026-11-25: 1 a 9 ok; 50 mil linhas abrem em poucos segundos e rolam sem travar.**
````

## Edicao 4 — `meta/STATUS.md` · o que o Formulario faz hoje

**Substituir.** Ancora:

````
- **JSON — Formulário:** chaves de 1º nível viram cards/tabs/painel; arrays de objetos viram tabela paginada (20 linhas/página) com colunas truncadas (ellipsis); campos primitivos (Cards/Tabs/Painel) editáveis com duplo clique (Enter confirma, Esc cancela); **células do ArrayTable editáveis com duplo clique direto na tabela**; **clique numa linha abre o `RowDetailModal` com o registro completo, também editável (duplo clique num valor → textarea para string, input para number/boolean/null)** — path resolvido via índice ORIGINAL da linha no array, não a posição pós-paginação; sub-switcher `Cards | Tabs | Painel` persistido em localStorage; cards de tabela ocupam a largura total da grade
````

**Por:**

````
- **JSON — Formulário:** chaves de 1º nível viram cards/tabs/painel; arrays de objetos viram tabela no `DataGrid` (o mesmo do CSV, desde 0.1.13): sem paginação, rola por dentro com o cabeçalho preso, ordena pelo cabeçalho, célula selecionada com teclado, edição com validação de tipo (inválido deixa o campo aberto, borda vermelha); **o nº da linha (ou Shift+Enter) abre o `RowDetailModal` com o registro completo, também editável** (textarea para string, input para number/boolean/null); campos primitivos (Cards/Tabs/Painel) editáveis com duplo clique; toda edição grava pelo índice ORIGINAL da linha; sub-switcher `Cards | Tabs | Painel` persistido em localStorage; cards de tabela ocupam a largura total da grade
````

## Edicao 5 — `meta/STATUS.md` · backlog: proxima fase

**Substituir.** Ancora:

````
- [ ] **Fase 2c da grade (DEC-013):** o `ArrayTable` do JSON passa a usar o `DataGrid` (caminho em lista do FIX-004, validação de tipo, `RowDetailModal` pela linha). Spec `meta/specs/261123-grade-de-dados-fase2.md`. **Medir antes da fase 3:** abrir `../261112-roteiro-teste/teste-50k.csv` e cronometrar (a grade ainda não virtualiza as linhas).
````

**Por:**

````
- [ ] **Fase 3 da grade (DEC-013):** filtro por coluna com facetas e chips; ordenação em níveis (Shift+clique). Spec a escrever pelo chat, com a Mapoteca como referência (`ColumnFilter.svelte`, `filter/spec.ts`).
````

## Edicao 6 — `meta/STATUS.md` · ultima conversa

**Substituir.** Ancora:

````
## 💬 Última conversa
````

**Por:**

````
## 💬 Última conversa
**2026-11-25 (chat + Code, wo0008–wo0010)** — Fase 2 da grade: 0.1.11 desfazer por arquivo (conferida 7/7), 0.1.12 `DataGrid` no CSV (`686097c`, conferida 1–9 + 50 mil linhas), 0.1.13 `ArrayTable` no `DataGrid` (DEC-014, wo0010, conferência pendente).

````

## Edicao 7 — `meta/CHANGELOG.md` · entrada 0.1.13

**Substituir.** Ancora:

````
## [0.1.12] — 2026-11-25
````

**Por:**

````
## [0.1.13] — 2026-11-25
### Modificado
- **JSON (Formulário) — tabela nova:** arrays de objetos usam a mesma grade do CSV. Sem paginação (a tabela rola por dentro, cabeçalho preso); clique no cabeçalho ordena; célula selecionada com teclado (setas, Enter/F2/digitar edita, Enter grava e desce, Tab avança, Esc cancela, Delete limpa).
- **JSON — registro completo:** abre pelo número da linha (clique) ou Shift+Enter, não mais pelo clique em qualquer ponto da linha (DEC-014). Depois de editar no registro, ele mostra o valor já gravado.
- **JSON — tipo na tabela:** valor que não serve ao tipo deixa o campo aberto com borda vermelha e o motivo ao passar o mouse; Delete num número ou true/false abre o campo vazio com o motivo.

---

## [0.1.12] — 2026-11-25
````

## Edicao 8 — `meta/ROADMAP.md` · fase 2 concluida

**Substituir.** Ancora:

````
- [ ] Fase 2 — base: `DataGrid` sobre TanStack Table v8, largura de coluna estável, célula selecionada com teclado, desfazer por arquivo — 2a (desfazer) 0.1.11 conferida; 2b (DataGrid no CSV) 0.1.12; falta 2c (ArrayTable no DataGrid).
````

**Por:**

````
- [x] Fase 2 — base: `DataGrid` sobre TanStack Table v8, largura de coluna estável, célula selecionada com teclado, desfazer por arquivo — 2a 0.1.11 e 2b 0.1.12 conferidas; 2c (`ArrayTable` no `DataGrid`) 0.1.13, conferência pendente.
````

---

## Fora de escopo

- Filtro por coluna, ordenacao em niveis, agrupar (fases 3–4); cards (fase 5).
- `PrimitiveList` (chips) editavel — segue em IDEAS.
- Mexer no `CsvViewer.jsx` (nao muda nesta WO).

## Armadilhas desta WO

- Os dois arquivos de codigo sao substituidos INTEIROS: guarda de sha1 antes, sha1 de DEPOIS depois. Texto vem da cerca de quatro crases, sem a linha de cerca.
- `JsonViewer.jsx` e CRLF: gravado em LF, o `git diff` mostra o arquivo todo e o sha1 de DEPOIS nao bate.

---

## Depois de aplicar — conferencia antes do commit

- [ ] `npm run build` sem erro. Erro → PARE.
- [ ] sha1 de DEPOIS dos dois arquivos de codigo = os do cabecalho.
- [ ] `git status --short` → exatamente: `M logs/2026-11-25.md`, `M meta/CHANGELOG.md`, `M meta/CONTEXT.md`, `M meta/DECISIONS.md`, `M meta/GLOSSARY.md`, `M meta/IDEAS.md`, `M meta/ROADMAP.md`, `M meta/STATUS.md`, `M meta/specs/261123-grade-de-dados-fase2.md`, `M src/components/DataGrid.jsx`, `M src/viewers/JsonViewer.jsx`, `?? meta/workorders/261125-wo0010-arraytable-no-datagrid.md` (12 entradas).
- [ ] Saldo de linhas (`wc -l`, simulado a partir deste texto): `meta/CHANGELOG.md` 140 → 148 (+8) · `meta/ROADMAP.md` 70 → 70 (+0) · `meta/STATUS.md` 52 → 55 (+3) · `src/components/DataGrid.jsx` 318 → 369 · `src/viewers/JsonViewer.jsx` 826 → 717. Saldo diferente = VERMELHO.
- [ ] Contagens (unidade = linhas): `grep -c "ROWS_PER_PAGE\|ROW_CLICK_DELAY\|pageBtn" src/viewers/JsonViewer.jsx` → 0 · `grep -c "<DataGrid" src/viewers/JsonViewer.jsx` → 1 · `grep -c "onOpenRow" src/components/DataGrid.jsx` → 6 · `grep -c "^\*\*\[0.1.13\]\*\*" meta/STATUS.md` → 1 · `grep -c "^## \[0.1.13\]" meta/CHANGELOG.md` → 1 · `grep -c "^## DEC-014" meta/DECISIONS.md` → 1.
- [ ] **Chega no ramo?** `JsonViewer` (modo Formulario) → `SectionContent` → `ArrayTable` → `<DataGrid>` → `commitCell` → `parseEditedValue` → `onUpdate` → `handleUpdate` → `updateContent`. O CSV passa pelo mesmo `DataGrid`: o roteiro do dono cobre os dois.
- [ ] Se rodou `npm run dev`, encerre.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O de sempre, depois do push. Grave em `../AAMMDD-HHMM-code-fileview-apply-wo0010.txt` (`date +%y%m%d-%H%M`).

## Commit — blocos separados, mensagem SEM acento

````
git add src/components/DataGrid.jsx src/viewers/JsonViewer.jsx meta/STATUS.md meta/CHANGELOG.md meta/ROADMAP.md meta/CONTEXT.md meta/GLOSSARY.md meta/DECISIONS.md meta/IDEAS.md meta/specs/261123-grade-de-dados-fase2.md logs/2026-11-25.md meta/workorders/261125-wo0010-arraytable-no-datagrid.md
````

````
git commit -m "feat(grade): fase 2c - tabela do JSON no DataGrid" -m "Sem paginacao, ordenar pelo cabecalho, celula selecionada com teclado, validacao de tipo na grade; registro completo pelo numero da linha ou Shift+Enter (DEC-014). Versao 0.1.13."
````

````
git push
````

*Gerado pelo Kit de Contexto Universal v1.160.1 — 2026-11-21 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
