import { useState, useMemo } from 'react'
import Papa from 'papaparse'
import { useApp } from '../context/AppContext'

export default function CsvViewer() {
  const { activeFile, updateContent } = useApp()
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')
  const [editCell, setEditCell] = useState(null) // { row, col }
  const [editVal, setEditVal] = useState('')

  const { data, headers } = useMemo(() => {
    if (!activeFile?.content) return { data: [], headers: [] }
    const result = Papa.parse(activeFile.content, { header: true, skipEmptyLines: true })
    return { data: result.data, headers: result.meta.fields || [] }
  }, [activeFile?.content])

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(q))
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

  const startEdit = (rowIdx, colIdx, val) => {
    setEditCell({ row: rowIdx, col: colIdx })
    setEditVal(val)
  }

  const commitEdit = () => {
    if (!editCell) return
    const { row, col } = editCell
    const colName = headers[col]
    // Rebuild CSV
    const newData = filtered.map((r, ri) =>
      ri === row ? { ...r, [colName]: editVal } : r
    )
    const csv = Papa.unparse(newData)
    updateContent(activeFile.id, csv)
    setEditCell(null)
  }

  const addRow = () => {
    const emptyRow = Object.fromEntries(headers.map(h => [h, '']))
    const newData = [...data, emptyRow]
    updateContent(activeFile.id, Papa.unparse(newData))
  }

  const deleteRow = (rowIdx) => {
    const newData = filtered.filter((_, i) => i !== rowIdx)
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
        >
          + Linha
        </button>
      </div>

      {/* Table */}
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
                  <th
                    key={i}
                    onClick={() => handleSort(i)}
                    style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}
                  >
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
              {filtered.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {ri + 1}
                  </td>
                  {headers.map((h, ci) => (
                    <td key={ci} style={tdStyle} onDoubleClick={() => startEdit(ri, ci, row[h] ?? '')}>
                      {editCell?.row === ri && editCell?.col === ci ? (
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditCell(null) }}
                          style={{
                            width: '100%', border: '1px solid var(--accent)',
                            borderRadius: '3px', padding: '2px 6px',
                            background: 'var(--accent-light)', fontSize: '13px',
                            fontFamily: 'var(--font-ui)', outline: 'none', color: 'var(--text)',
                          }}
                        />
                      ) : (
                        <span>{row[h] ?? ''}</span>
                      )}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button
                      onClick={() => deleteRow(ri)}
                      style={{
                        fontSize: '11px', color: 'var(--text-faint)', padding: '2px 5px',
                        borderRadius: '3px', cursor: 'pointer', border: 'none', background: 'transparent',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-light)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent' }}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{
        padding: '4px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)', fontSize: '11px', color: 'var(--text-faint)',
        flexShrink: 0,
      }}>
        Dica: dê duplo clique numa célula para editar · clique no cabeçalho para ordenar
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
  maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
}
