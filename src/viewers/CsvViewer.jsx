import { useState, useMemo } from 'react'
import Papa from 'papaparse'
import { useApp } from '../context/AppContext'

export default function CsvViewer() {
  const { activeFile, updateContent } = useApp()
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')
  // editCell guarda { dataIdx, col } — índice no array DATA original, não no filtered
  const [editCell, setEditCell] = useState(null)
  const [editVal, setEditVal] = useState('')

  const { data, headers } = useMemo(() => {
    if (!activeFile?.content) return { data: [], headers: [] }
    const result = Papa.parse(activeFile.content, { header: true, skipEmptyLines: true })
    return { data: result.data, headers: result.meta.fields || [] }
  }, [activeFile?.content])

  // filtered injeta __dataIdx para manter referência ao índice original
  const filtered = useMemo(() => {
    let rows = data.map((row, i) => ({ ...row, __dataIdx: i }))
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(row =>
        headers.some(h => String(row[h] ?? '').toLowerCase().includes(q))
      )
    }
    if (sortCol !== null) {
      rows.sort((a, b) => {
        const av = a[headers[sortCol]] ?? ''
        const bv = b[headers[sortCol]] ?? ''
        const an = Number(av), bn = Number(bv)
        const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, search, sortCol, sortDir, headers])

  const handleSort = (i) => {
    if (sortCol === i) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(i); setSortDir('asc') }
  }

  const startEdit = (dataIdx, colIdx, val) => {
    setEditCell({ dataIdx, col: colIdx })
    setEditVal(val)
  }

  // Confirma edição no data ORIGINAL usando dataIdx (FIX-002)
  const commitEdit = () => {
    if (!editCell) return
    const { dataIdx, col } = editCell
    const colName = headers[col]
    const newData = data.map((r, i) =>
      i === dataIdx ? { ...r, [colName]: editVal } : r
    )
    updateContent(activeFile.id, Papa.unparse(newData))
    setEditCell(null)
  }

  // onMouseDown + preventDefault dispara ANTES do onBlur do input
  const cancelEdit = () => setEditCell(null)

  const addRow = () => {
    const emptyRow = Object.fromEntries(headers.map(h => [h, '']))
    updateContent(activeFile.id, Papa.unparse([...data, emptyRow]))
  }

  const deleteRow = (dataIdx) => {
    const newData = data.filter((_, i) => i !== dataIdx)
    updateContent(activeFile.id, Papa.unparse(newData))
  }

  if (!activeFile) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
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
          {filtered.length} / {data.length} linhas · {headers.length} colunas
        </span>
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

      {/* Tabela */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {headers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Arquivo CSV vazio ou inválido.
          </div>
        ) : (
          <table style={{ borderCollapse: 'collapse', minWidth: '100%', fontSize: '13px' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ ...thStyle, width: '36px', color: 'var(--text-faint)' }}>#</th>
                {headers.map((h, i) => (
                  <th key={i} onClick={() => handleSort(i)}
                    style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {h}
                      {sortCol === i && (
                        <span style={{ fontSize: '10px', color: 'var(--accent)' }}>
                          {sortDir === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ ...thStyle, width: '36px' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const dataIdx = row.__dataIdx
                return (
                  <tr key={dataIdx} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {dataIdx + 1}
                    </td>
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
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        onClick={() => deleteRow(dataIdx)}
                        style={{
                          fontSize: '11px', color: 'var(--text-faint)', padding: '2px 5px',
                          borderRadius: '3px', cursor: 'pointer', border: 'none', background: 'transparent',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-light)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent' }}
                      >✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{
        padding: '4px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)', fontSize: '11px', color: 'var(--text-faint)', flexShrink: 0,
      }}>
        Duplo clique numa célula para editar · Enter confirma · Esc ou ✕ cancela · clique no cabeçalho para ordenar
      </div>
    </div>
  )
}

const thStyle = {
  padding: '8px 12px', textAlign: 'left', fontWeight: '500',
  background: 'var(--gray-light)', borderBottom: '2px solid var(--border)',
  borderRight: '1px solid var(--border)', whiteSpace: 'nowrap',
  fontSize: '12px', color: 'var(--text)',
}
const tdStyle = {
  padding: '6px 12px', borderRight: '1px solid var(--border)',
  maxWidth: '300px',
}
