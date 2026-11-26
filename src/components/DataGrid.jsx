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
