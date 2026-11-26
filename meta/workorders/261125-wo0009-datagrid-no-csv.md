# WO 0009 — Fase 2b da grade: `DataGrid` compartilhado (TanStack Table v8) no CSV

> **Tipo:** mista — CODIGO (arquivo novo `src/components/DataGrid.jsx`, `src/viewers/CsvViewer.jsx` substituido inteiro, dependencia `@tanstack/react-table`) + registro nos meta/ (inclui a 0.1.11, que o `/wrap` da wo0008 nao gravou).
> **Config sugerida:** Sonnet, `/effort medium`.
> **Pre-requisito:** escrita sobre `5eecf73`. `git status --short` ao comecar: so os 4 arquivos do chat abaixo + esta WO.
> **Base:** spec `meta/specs/261123-grade-de-dados-fase2.md`, passo 2b (DEC-013).
> **Arquivos que o chat gravou no disco e esta WO versiona** (Edicao 0: `sha1sum`; diferente = PARE):
>   - `meta/CONTEXT.md` — `b9b9f4728f40bac824e0e01b9e8c276fb03ae0dd`
>   - `meta/GLOSSARY.md` — `850aebb59bb886c47276a18bf7142edbaec30b26`
>   - `meta/specs/261123-grade-de-dados-fase2.md` — `6701975d9c109866bd3e49cffd310598cfa9245d`
>   - `logs/2026-11-25.md` — `2e049824f683cccbcc3c7edb49f211d5231d6859`
> **Guarda do arquivo substituido inteiro:** `src/viewers/CsvViewer.jsx` tem de estar com sha1 `6945c0f04b0f7af8fae6acda79e52281925827d0` (316 linhas, lido pelo chat neste turno). Diferente = PARE.
> **Ancora semantica:** ancora que nao bater EXATAMENTE = PARE e reporte (e grave o relatorio de parada).
> **Idempotencia:** Edicao 1 — se `src/components/DataGrid.jsx` ja existir: igual ao texto abaixo = PULE; diferente = PARE. Edicoes 4–8 sao «trocar» (texto novo contem a ancora): ja aplicada = texto novo inteiro presente.
> **Ancoras lidas em:** recortadas por script, neste turno, sobre `5eecf73`: `meta/STATUS.md` (4, 5), `meta/CHANGELOG.md` (6), `meta/ROADMAP.md` (7, 8). O trecho literal de cada uma e o bloco **Ancora**, em cerca de QUATRO crases. Simulado a partir do texto desta WO: cada ancora = 1 ocorrencia.
> **Fim de linha:** `CsvViewer.jsx` e os meta/ sao LF; `DataGrid.jsx` nasce LF. `package.json`/`package-lock.json` sao CRLF na arvore — quem regrava e o `npm`.
> **Validacao ja feita pelo chat (nao substitui o build):** o `DataGrid.jsx` e o `CsvViewer.jsx` desta WO rodaram na VM com React 18.3.1 + `@tanstack/react-table` 8.21.3 + `lucide-react` 0.462.0 em jsdom 24 — 22/22 verificacoes (ordenacao tri-estado numerica, filtro e contagem, selecao e setas na ordem visivel, Enter/Tab/Esc/Delete/tecla imprimivel, gravacao no indice original com filtro e ordem, larguras estaveis apos edicao longa, «+ Linha», lixeira e Desfazer, LF + quebra final preservados, Ctrl+Z nao capturado pela grade).
> **Proximo comando:** nenhum — conferencia na tela e do dono, pelo roteiro entregue no chat no mesmo turno.

> **Canal dos meta neste ciclo = CODE.** STATUS, CHANGELOG e ROADMAP pelas edicoes 4–8; CONTEXT, GLOSSARY, spec e log ja foram escritos pelo chat (so confira o hash e versione).

---

## 1. Por que

Fase 2b da DEC-013: o CSV passa a usar uma grade compartilhada (`DataGrid`) com a logica do TanStack Table v8 — largura de coluna fixa depois da abertura, celula selecionada com teclado, e a base sobre a qual a 2c leva o `ArrayTable` do JSON e as fases 3–4 constroem filtro por coluna e agrupar. Tudo que ja foi conferido no CSV continua: FIX-002 (grava pelo indice original), FIX-005 (campo por cima da celula), Tab na ordem visivel, lixeira + Desfazer, «+ Linha» com filtro, 3o clique tira a ordem, formato do arquivo.

**Muda de proposito:** no campo de edicao, Enter grava e DESCE uma linha (planilha; antes ficava na mesma celula). Celula vazia nao vale mais 0 na ordenacao (U12 da analise 261117).

---

## Edicao 0 — conferir hashes

````
sha1sum meta/CONTEXT.md meta/GLOSSARY.md meta/specs/261123-grade-de-dados-fase2.md logs/2026-11-25.md src/viewers/CsvViewer.jsx
````

## Edicao 1 — `src/components/DataGrid.jsx` · criar arquivo novo

**Criar arquivo novo** com exatamente este conteudo (318 linhas, LF):

````
import { useState, useMemo, useEffect, useRef } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'

/**
 * Grade de dados compartilhada (DEC-013; spec 261123, fase 2b). Hoje usada pelo
 * CSV; na 2c passa a servir o ArrayTable do JSON. A logica de ordenar e filtrar
 * vem do TanStack Table v8 (headless); o visual e o teclado sao nossos.
 *
 * Identidade da linha = indice dela em `rows` (o dado ORIGINAL, na ordem do
 * arquivo). Toda edicao e devolvida por esse indice, nunca pela posicao
 * visivel — a regra do FIX-002 vale com filtro e ordenacao ativos.
 *
 * @param {string[]} columns       nomes das colunas, na ordem do arquivo
 * @param {object[]} rows          um objeto por registro (chave = coluna)
 * @param {string}   globalFilter  busca em todas as colunas (sem diferenciar maiusculas)
 * @param {(rowIdx:number, col:string, value:string) => void} onCommit
 * @param {(rowIdx:number) => void} [onDeleteRow]   sem ela, nao ha coluna da lixeira
 * @param {{rowIdx:number, col:string, nonce:number}} [editRequest]  abre a edicao de fora (ex.: «+ Linha»)
 * @param {(visible:number) => void} [onVisibleCountChange]
 */
export default function DataGrid({ columns, rows, globalFilter = '', onCommit, onDeleteRow, editRequest, onVisibleCountChange }) {
  const [sorting, setSorting] = useState([])
  // Selecao e edicao guardam a IDENTIDADE da celula (indice original + coluna),
  // nao a posicao: ordenar ou filtrar nao troca a celula selecionada.
  const [selected, setSelected] = useState(null) // { rowId, col }
  const [editing, setEditing] = useState(null)   // { rowId, col }
  const [editVal, setEditVal] = useState('')
  const wrapRef = useRef(null)

  // Largura de cada coluna medida UMA vez, na abertura (cabecalho + ate 200
  // linhas), com piso e teto; depois fica fixa: editar, filtrar e ordenar nao
  // mexem na geometria (spec 261123 — a causa do FIX-005 era a largura seguir
  // o conteudo). O ViewerRouter remonta a grade a cada arquivo (FIX-003).
  const widthKey = columns.join('\u0000')
  const widths = useMemo(() => {
    const sample = rows.slice(0, 200)
    return columns.map(c => {
      const longest = Math.max(String(c).length, ...sample.map(r => String(r[c] ?? '').length))
      return Math.max(64, Math.min(320, Math.round(longest * 7.4 + 28)))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthKey])

  const columnDefs = useMemo(() => columns.map(c => ({
    id: c,
    accessorFn: row => row[c] ?? '',
    header: c,
    sortingFn: compareCells,
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
      String(row.original[colId] ?? '').toLowerCase().includes(String(value).toLowerCase()),
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
  }, [editRequest?.nonce]) // eslint-disable-line react-hooks/exhaustive-deps

  // A celula selecionada fica sempre a vista (setas levam para fora da tela)
  useEffect(() => {
    if (!selected || !wrapRef.current) return
    const el = wrapRef.current.querySelector(`[data-cell="${cssEscape(selected.rowId + '|' + selected.col)}"]`)
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [selected])

  const valueOf = (rowId, col) => String(rows[Number(rowId)]?.[col] ?? '')
  const focusGrid = () => wrapRef.current?.focus({ preventScroll: true })

  const startEdit = (cell, initial) => {
    setSelected(cell)
    setEditing(cell)
    setEditVal(initial ?? valueOf(cell.rowId, cell.col))
  }

  // Grava so se mudou (evita passo vazio na pilha de desfazer)
  const commit = (cell, value) => {
    if (value !== valueOf(cell.rowId, cell.col)) onCommit(Number(cell.rowId), cell.col, value)
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
    if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit(selected); return }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); commit(selected, ''); return }
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
      commit(editing, editVal)
      const down = neighbor(editing, 1, 0, false)
      setSelected(down || editing)
      setEditing(null)
      focusGrid()
    } else if (e.key === 'Tab') {
      // Tab confirma e abre a proxima celula na ordem visivel; na borda, fecha
      e.preventDefault()
      commit(editing, editVal)
      const next = neighbor(editing, 0, e.shiftKey ? -1 : 1, true)
      if (next) startEdit(next)
      else { setEditing(null); focusGrid() }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditing(null)
      focusGrid()
    }
  }

  // Sair do campo clicando fora confirma (padrao de edicao em celula)
  const onEditBlur = () => {
    if (!editing) return
    commit(editing, editVal)
    setEditing(null)
  }

  const cancelEdit = () => { setEditing(null); focusGrid() }

  const totalWidth = 44 + widths.reduce((a, b) => a + b, 0) + (onDeleteRow ? 36 : 0)

  return (
    <div ref={wrapRef} tabIndex={0} onKeyDown={onGridKeyDown}
      style={{ flex: 1, overflow: 'auto', outline: 'none' }}>
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: `${totalWidth}px`, minWidth: '100%', fontSize: '13px' }}>
        <colgroup>
          <col style={{ width: '44px' }} />
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
                {Number(row.id) + 1}
              </td>
              {columns.map(col => {
                const isSel = selected?.rowId === row.id && selected?.col === col
                const isEditing = editing?.rowId === row.id && editing?.col === col
                const value = row.original[col] ?? ''
                return (
                  <td key={col} data-cell={row.id + '|' + col}
                    onMouseDown={() => { if (!isEditing) setSelected({ rowId: row.id, col }) }}
                    onDoubleClick={() => startEdit({ rowId: row.id, col })}
                    style={{
                      ...tdStyle, position: 'relative',
                      boxShadow: isSel && !isEditing ? 'inset 0 0 0 2px var(--accent)' : 'none',
                    }}>
                    {/* O texto fica no lugar (invisivel na edicao); o campo vai POR CIMA
                        da celula e o ✕ fica fora, a direita (FIX-005). */}
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', visibility: isEditing ? 'hidden' : 'visible' }}>
                      {value || '\u00a0'}
                    </span>
                    {isEditing && (
                      <>
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={onEditBlur}
                          onKeyDown={onEditKeyDown}
                          style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            boxSizing: 'border-box', zIndex: 2,
                            border: '1px solid var(--accent)', borderRadius: '3px',
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

/**
 * Ordem de duas celulas: as duas numericas → por numero; senao, por texto.
 * Celula vazia NAO vale 0 (antes `Number('')` misturava vazio aos numeros —
 * analise 261117, U12).
 */
function compareCells(rowA, rowB, id) {
  const a = String(rowA.original[id] ?? ''), b = String(rowB.original[id] ?? '')
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

## Edicao 2 — `src/viewers/CsvViewer.jsx` · substituir o arquivo INTEIRO

**Substituir todo o conteudo por** (144 linhas, LF):

````
import { useState, useMemo } from 'react'
import Papa from 'papaparse'
import { useApp } from '../context/AppContext'
import DataGrid from '../components/DataGrid'

/**
 * Visualizador/editor de CSV. Desde a fase 2b (spec 261123, DEC-013) a tabela
 * em si e o DataGrid compartilhado; aqui ficam o que e do CSV: ler e regravar
 * o arquivo no formato original, a barra (filtro, contagem, «+ Linha») e o
 * «Desfazer» da exclusao de linha.
 */
export default function CsvViewer() {
  const { activeFile, updateContent } = useApp()
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(0)
  // Pedido para a grade abrir uma celula (o «+ Linha» abre a 1a da linha nova)
  const [editRequest, setEditRequest] = useState(null)

  const { data, headers } = useMemo(() => {
    if (!activeFile?.content) return { data: [], headers: [] }
    const result = Papa.parse(activeFile.content, { header: true, skipEmptyLines: true })
    return { data: result.data, headers: result.meta.fields || [] }
  }, [activeFile?.content])

  // Regrava o CSV no formato do arquivo aberto: mesmo fim de linha (o
  // Papa.unparse usa CRLF por padrao) e a quebra final, se havia. Antes toda
  // edicao num CSV LF reescrevia o arquivo inteiro (analise 261117, decisao 3).
  // `columns` fixa a ordem das colunas pelo cabecalho original.
  const serialize = (rows) => {
    const nl = activeFile.content.includes('\r\n') ? '\r\n' : '\n'
    const out = Papa.unparse(rows, { newline: nl, columns: headers })
    return activeFile.content.endsWith('\n') ? out + nl : out
  }

  // A grade devolve o indice ORIGINAL da linha (FIX-002): grava no `data` cru,
  // seja qual for o filtro ou a ordem na tela.
  const commitValue = (dataIdx, col, val) => {
    const newData = data.map((r, i) => (i === dataIdx ? { ...r, [col]: val } : r))
    updateContent(activeFile.id, serialize(newData))
  }

  // + Linha: com filtro ativo a linha nova (vazia) nao passaria no filtro e o
  // botao pareceria nao fazer nada (analise 261117, U11) — limpa o filtro e ja
  // abre a primeira celula da linha nova.
  const addRow = () => {
    const emptyRow = Object.fromEntries(headers.map(h => [h, '']))
    updateContent(activeFile.id, serialize([...data, emptyRow]))
    setSearch('')
    if (headers.length) setEditRequest({ rowIdx: data.length, col: headers[0], nonce: Date.now() })
  }

  // Ultima linha excluida, para o «Desfazer» da barra (analise 261117, U2).
  // O Ctrl+Z do arquivo (fase 2a) tambem desfaz a exclusao.
  const [lastDeleted, setLastDeleted] = useState(null) // { dataIdx, row }

  const deleteRow = (dataIdx) => {
    setLastDeleted({ dataIdx, row: data[dataIdx] })
    updateContent(activeFile.id, serialize(data.filter((_, i) => i !== dataIdx)))
  }

  const undoDelete = () => {
    if (!lastDeleted) return
    const { dataIdx, row } = lastDeleted
    updateContent(activeFile.id, serialize([...data.slice(0, dataIdx), row, ...data.slice(dataIdx)]))
    setLastDeleted(null)
  }

  if (!activeFile) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Barra */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0,
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar linhas…"
          style={{
            padding: '5px 10px', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', fontSize: '13px',
            background: 'var(--bg)', color: 'var(--text)',
            outline: 'none', width: '220px',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            fontSize: '11px', color: 'var(--text-faint)', padding: '3px 7px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--surface)', cursor: 'pointer',
          }}>✕ limpar</button>
        )}
        <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>
          {visibleCount} / {data.length} linhas · {headers.length} colunas
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
        <button
          onClick={addRow}
          style={{
            marginLeft: 'auto', padding: '5px 12px', fontSize: '12px',
            background: 'var(--green-light)', color: 'var(--green)',
            border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontWeight: '500',
          }}
        >+ Linha</button>
      </div>

      {headers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Arquivo CSV vazio ou inválido.
        </div>
      ) : (
        <DataGrid
          columns={headers}
          rows={data}
          globalFilter={search}
          onCommit={commitValue}
          onDeleteRow={deleteRow}
          editRequest={editRequest}
          onVisibleCountChange={setVisibleCount}
        />
      )}

      <div style={{
        padding: '4px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)', fontSize: '11px', color: 'var(--text-faint)', flexShrink: 0,
      }}>
        Clique seleciona · setas movem · Enter, F2 ou digitar edita · Enter confirma e desce · Tab confirma e avança · Esc cancela · Delete limpa · clique no cabeçalho ordena (3º clique tira a ordem) · lixeira exclui (Desfazer na barra ou Ctrl+Z)
      </div>
    </div>
  )
}
````

## Edicao 3 — `package.json` + `package-lock.json` · dependencia

````
npm install @tanstack/react-table@8.21.3
````

(Se `node_modules` faltar, rode `npm ci` antes.)

## Edicao 4 — `meta/STATUS.md` · versoes 0.1.12 e 0.1.11

**Substituir.** Ancora:

````
**[0.1.10]** — 2026-11-17 — Fase 1 da grade (DEC-013): fechar com alteração não salva pergunta; CSV com lixeira + Desfazer, «+ Linha» visível com filtro, 3º clique tira a ordenação; CSV e JSON regravam no formato do arquivo (fim de linha, recuo, quebra final). Build verde; **conferido na tela pelo dono em 2026-11-20: 7/7 ok.**
````

**Por:**

````
**[0.1.12]** — 2026-11-25 — Fase 2b da grade: o CSV usa o `DataGrid` compartilhado (TanStack Table v8) — largura de coluna fixa, célula selecionada com teclado (setas, Enter/F2/digitar edita, Enter grava e desce, Delete limpa), vazio não vale 0 na ordenação. Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-25).
**[0.1.11]** — 2026-11-23 — Fase 2a da grade: desfazer e refazer por arquivo (Ctrl+Z / Ctrl+Y, botões ↶ ↷). **Conferido na tela pelo dono em 2026-11-25: 7/7 ok.** *(Registro feito pela wo0009: o `/wrap` da wo0008 não chegou ao disco.)*
**[0.1.10]** — 2026-11-17 — Fase 1 da grade (DEC-013): fechar com alteração não salva pergunta; CSV com lixeira + Desfazer, «+ Linha» visível com filtro, 3º clique tira a ordenação; CSV e JSON regravam no formato do arquivo (fim de linha, recuo, quebra final). Build verde; **conferido na tela pelo dono em 2026-11-20: 7/7 ok.**
````

## Edicao 5 — `meta/STATUS.md` · backlog: o que falta da fase 2

**Substituir.** Ancora:

````
- [ ] **Fase 2 da grade (DEC-013):** `DataGrid` compartilhado pelo CSV e pelo `ArrayTable`, sobre TanStack Table v8; largura de coluna estável; célula selecionada com teclado; desfazer por arquivo. Plano em `meta/analises/261117-ANALISE-ux-tabelas-e-json.md` e ROADMAP F2b.
````

**Por:**

````
- [ ] **Fase 2c da grade (DEC-013):** o `ArrayTable` do JSON passa a usar o `DataGrid` (caminho em lista do FIX-004, validação de tipo, `RowDetailModal` pela linha). Spec `meta/specs/261123-grade-de-dados-fase2.md`. **Medir antes da fase 3:** abrir `../261112-roteiro-teste/teste-50k.csv` e cronometrar (a grade ainda não virtualiza as linhas).
````

## Edicao 6 — `meta/CHANGELOG.md` · entradas 0.1.12 e 0.1.11

**Substituir.** Ancora:

````
## [0.1.10] — 2026-11-17
````

**Por:**

````
## [0.1.12] — 2026-11-25
### Adicionado
- **CSV — célula selecionada e teclado:** clique seleciona; setas movem; Enter, F2 ou digitar começa a editar (digitar substitui o valor); no campo, Enter grava e desce uma linha, Tab grava e avança, Esc cancela; Delete limpa a célula.

### Modificado
- **CSV — grade nova (`DataGrid`, TanStack Table v8):** a largura das colunas é medida na abertura e não muda mais ao editar, filtrar ou ordenar.
- **CSV — ordenação:** célula vazia não vale mais 0 (antes se misturava aos números).

---

## [0.1.11] — 2026-11-23
### Adicionado
- **Desfazer e refazer por arquivo:** Ctrl+Z e Ctrl+Y (ou Ctrl+Shift+Z) e botões ↶ ↷ na barra das abas, até 50 passos por arquivo. A digitação no modo Texto vira um passo só. Com um campo em edição, vale o desfazer do campo; no Markdown em modo Editar, o do editor.

---

## [0.1.10] — 2026-11-17
````

## Edicao 7 — `meta/ROADMAP.md` · fase 1 concluida

**Substituir.** Ancora:

````
- [ ] Fase 1 — segurança: confirmar ao fechar com alteração, lixeira + Desfazer no CSV, «+ Linha» com filtro, 3º clique tira a ordem, formato do arquivo preservado (wo0006)
````

**Por:**

````
- [x] Fase 1 — segurança: confirmar ao fechar com alteração, lixeira + Desfazer no CSV, «+ Linha» com filtro, 3º clique tira a ordem, formato do arquivo preservado (wo0006) — 0.1.10, conferida 7/7.
````

## Edicao 8 — `meta/ROADMAP.md` · fase 2 em curso

**Substituir.** Ancora:

````
- [ ] Fase 2 — base: `DataGrid` sobre TanStack Table v8, largura de coluna estável, célula selecionada com teclado, desfazer por arquivo
````

**Por:**

````
- [ ] Fase 2 — base: `DataGrid` sobre TanStack Table v8, largura de coluna estável, célula selecionada com teclado, desfazer por arquivo — 2a (desfazer) 0.1.11 conferida; 2b (DataGrid no CSV) 0.1.12; falta 2c (ArrayTable no DataGrid).
````

---

## Fora de escopo

- O `ArrayTable` do JSON (fase 2c). Virtualizacao de linhas (medir antes).
- Filtro por coluna, ordenacao em niveis, agrupar (fases 3–4).
- Tirar a barra «Desfazer» da exclusao (fica, ao lado do Ctrl+Z).

## Armadilhas desta WO

- Edicao 2 substitui o arquivo INTEIRO: confira a guarda de sha1 antes; texto do arquivo vem da cerca de quatro crases, sem a linha de cerca.
- O `npm install` regrava `package.json` e `package-lock.json` com o fim de linha que o npm escolher; o que importa e `git diff --ignore-all-space package.json` mostrar so a linha nova de `@tanstack/react-table`.

---

## Depois de aplicar — conferencia antes do commit

- [ ] `npm run build` sem erro. Erro → PARE.
- [ ] `git status --short` → exatamente: `M meta/CHANGELOG.md`, `M meta/CONTEXT.md`, `M meta/GLOSSARY.md`, `M meta/ROADMAP.md`, `M meta/STATUS.md`, `M meta/specs/261123-grade-de-dados-fase2.md`, `M package-lock.json`, `M package.json`, `M src/viewers/CsvViewer.jsx`, `?? logs/2026-11-25.md`, `?? meta/workorders/261125-wo0009-datagrid-no-csv.md`, `?? src/components/DataGrid.jsx` (12 entradas).
- [ ] Saldo de linhas (`wc -l`, simulado a partir deste texto): `meta/CHANGELOG.md` 124 → 140 (+16) · `meta/ROADMAP.md` 70 → 70 (+0) · `meta/STATUS.md` 50 → 52 (+2) · `src/viewers/CsvViewer.jsx` 316 → 144 · `src/components/DataGrid.jsx` novo, 318. Saldo diferente = VERMELHO.
- [ ] Contagens (unidade = linhas): `grep -c "useReactTable" src/components/DataGrid.jsx` → 2 (o import e a chamada) · `grep -c "__dataIdx" src/viewers/CsvViewer.jsx` → 0 · `grep -c "<DataGrid" src/viewers/CsvViewer.jsx` → 1 · `grep -c '"@tanstack/react-table"' package.json` → 1 · `grep -c "^\*\*\[0.1.11\]\*\*" meta/STATUS.md` → 1 · `grep -c "^## \[0.1.12\]" meta/CHANGELOG.md` → 1.
- [ ] **Chega no ramo?** `ViewerRouter` → `CsvViewer` → `<DataGrid>` → `onCommit` → `commitValue` → `updateContent`. O build responde «compila?»; «a tela se comporta?» e do roteiro do dono — e «presta com 50 mil linhas?» tambem (item de medicao no roteiro).
- [ ] Se rodou `npm run dev`, encerre.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O de sempre, depois do push. Grave em `../AAMMDD-HHMM-code-fileview-apply-wo0009.txt` (`date +%y%m%d-%H%M`).

## Commit — blocos separados, mensagem SEM acento

````
git add src/components/DataGrid.jsx src/viewers/CsvViewer.jsx package.json package-lock.json meta/STATUS.md meta/CHANGELOG.md meta/ROADMAP.md meta/CONTEXT.md meta/GLOSSARY.md meta/specs/261123-grade-de-dados-fase2.md logs/2026-11-25.md meta/workorders/261125-wo0009-datagrid-no-csv.md
````

````
git commit -m "feat(grade): fase 2b - DataGrid compartilhado (TanStack Table) no CSV" -m "Largura de coluna fixa, celula selecionada com teclado, Enter grava e desce, vazio nao vale 0 na ordenacao. Registra tambem a 0.1.11 (fase 2a). Versao 0.1.12."
````

````
git push
````

*Gerado pelo Kit de Contexto Universal v1.160.1 — 2026-11-21 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
