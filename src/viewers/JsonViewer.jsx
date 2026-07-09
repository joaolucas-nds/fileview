import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

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

function JsonNode({ keyName, value, depth = 0, path = '', onUpdate }) {
  const [collapsed, setCollapsed] = useState(depth > 2)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')

  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  const isLeaf = type !== 'object' && type !== 'array'
  const indent = depth * 18

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

  const renderValue = () => {
    if (editing) {
      return (
        <input
          autoFocus
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
          style={{
            fontSize: '13px', fontFamily: 'var(--font-mono)',
            border: '1px solid var(--accent)', borderRadius: '3px',
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
              <JsonNode key={String(k)} keyName={k} value={v} depth={depth + 1} path={path ? `${path}.${k}` : String(k)} onUpdate={onUpdate} />
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

// Converte o texto digitado de volta pro tipo original do valor. Compartilhado
// por ArrayTable e RowDetailModal (mesma regra do Field/JsonNode).
function parseEditedValue(original, text) {
  const type = original === null ? 'null' : typeof original
  if (type === 'number') return Number(text)
  if (type === 'boolean') return text === 'true'
  if (type === 'null') return null
  return text
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
// Esc cancela. `path` é a chave dotted (ex.: "user.address.city") resolvida pelo
// chamador (SectionContent) e repassada até aqui; sem `path`/`onUpdate` o campo
// permanece read-only (usado, por ex., por chamadores que ainda não repassam isso).
function Field({ label, value, path, onUpdate }) {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  const isPrimitive = ['string', 'number', 'boolean', 'null'].includes(type)
  const canEdit = isPrimitive && !!onUpdate && !!path
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')

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
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
            style={{
              fontSize: '12px', fontFamily: 'var(--font-mono)',
              border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
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

// Botão de paginação
const pageBtn = (disabled) => ({
  padding: '2px 9px', fontSize: '11px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: disabled ? 'var(--text-faint)' : 'var(--text)',
  cursor: disabled ? 'not-allowed' : 'pointer',
})

// Modal de detalhe — mostra o registro completo sem truncamento, campo por campo.
// Edição inline (2026-07-07, sessão 2): duplo clique num valor primitivo edita.
// Strings usam <textarea> (não <input>) porque o caso que motivou este modal
// (DEC-008) é justamente texto longo — Enter insere quebra de linha em vez de
// confirmar; só Esc cancela ou o blur confirma. Number/boolean/null usam Enter
// para confirmar, como em qualquer outro campo do projeto. `path`/`rowIdx` vêm
// do ArrayTable — o path final é `${path}.${rowIdx}.${chave}`, usando o índice
// ORIGINAL da linha no array (não a posição pós-paginação — mesma classe de
// cuidado do FIX-002 no CSV). Sem `onUpdate`/`path`/`rowIdx`, o modal continua
// read-only (uso defensivo, não deveria ocorrer no fluxo atual).
function RowDetailModal({ row, rowIdx, path, onUpdate, onClose }) {
  const canEdit = !!onUpdate && !!path && rowIdx !== undefined && rowIdx !== null
  const [editKey, setEditKey] = useState(null)
  const [editVal, setEditVal] = useState('')

  const startEdit = (k, v) => {
    if (!canEdit || !isEditablePrimitive(v)) return
    setEditVal(v === null ? '' : typeof v === 'string' ? v : String(v))
    setEditKey(k)
  }

  const commitEdit = (k, original) => {
    onUpdate(`${path}.${rowIdx}.${k}`, parseEditedValue(original, editVal))
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
          {Object.entries(row).filter(([k]) => k !== '__dataIdx').map(([k, v]) => {
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
                      background: 'var(--accent-light)', border: '1px solid var(--accent)',
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

// Tabela para arrays de objetos uniformes.
// Colunas com table-layout:fixed + ellipsis de uma linha evitam que texto longo
// (ex: text_content) estique a altura da linha. Paginação evita renderizar
// centenas de linhas de uma vez. Clique na linha abre o registro completo.
//
// Edição inline (2026-07-07, sessão 2): duplo clique numa célula primitiva edita
// direto na tabela. Conflito resolvido: clique simples na linha abre o modal,
// mas um pequeno atraso (`ROW_CLICK_DELAY`) dá tempo do 2º clique de um duplo
// clique chegar e cancelar a abertura — sem o atraso, o 1º clique do duplo
// clique sempre abriria o modal antes do dblclick ser reconhecido (o evento
// `click` do DOM dispara nos dois cliques de um duplo clique, não só o
// `dblclick`). Padrão comum em listas (Explorer, Gmail) para essa ambiguidade.
// `path` é a chave da seção (ex.: "users"); o path de cada célula editada é
// `${path}.${índiceORIGINAL}.${coluna}` — índice original da linha no array
// completo, não a posição pós-paginação (mesma classe de cuidado do FIX-002).
const ROWS_PER_PAGE = 20
const ROW_CLICK_DELAY = 220 // ms — janela para o 2º clique de um duplo clique chegar

function ArrayTable({ value, path, onUpdate }) {
  const keys = arrayKeys(value)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(null) // { row, idx } — idx é o índice ORIGINAL no array
  const [editCell, setEditCell] = useState(null) // { idx, col }
  const [editVal, setEditVal] = useState('')
  const clickTimer = useRef(null)
  const totalPages = Math.max(1, Math.ceil(value.length / ROWS_PER_PAGE))

  const canEdit = !!onUpdate && !!path

  // Reseta a página se o array mudar (troca de arquivo)
  useEffect(() => { setPage(0) }, [value])

  // Limpa o timer pendente se o componente desmontar no meio da janela de espera
  useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current) }, [])

  const pageRows = value.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)

  const scheduleOpenModal = (row, idx) => {
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      setSelected({ row, idx })
      clickTimer.current = null
    }, ROW_CLICK_DELAY)
  }

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

  return (
    <div>
      {value.length > ROWS_PER_PAGE && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '11px', color: 'var(--text-faint)' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={pageBtn(page === 0)}>◀</button>
          <span>
            Linhas {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, value.length)} de {value.length} · página {page + 1}/{totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pageBtn(page >= totalPages - 1)}>▶</button>
        </div>
      )}

      <div style={{ overflowX: 'auto', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed', fontSize: '12px' }}>
          <thead>
            <tr>
              {keys.map(k => (
                <th key={k} title={k} style={{
                  padding: '5px 10px', textAlign: 'left', background: 'var(--gray-light)',
                  border: '0.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontWeight: '500',
                  color: 'var(--amber)', width: '170px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => {
              const originalIdx = page * ROWS_PER_PAGE + i
              return (
                <tr
                  key={originalIdx}
                  onClick={() => scheduleOpenModal(row, originalIdx)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {keys.map(k => {
                    const cellVal = row[k] ?? null
                    const editable = canEdit && isEditablePrimitive(cellVal)
                    const editing = editCell && editCell.idx === originalIdx && editCell.col === k
                    const preview = cellVal === null ? '' : typeof cellVal === 'object' ? JSON.stringify(cellVal) : String(cellVal)
                    return (
                      <td key={k} title={editing ? undefined : preview} style={{
                        padding: editing ? '2px' : '5px 10px', border: '0.5px solid var(--border)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        cursor: editable ? 'text' : 'default',
                      }}
                        onDoubleClick={e => startCellEdit(e, originalIdx, k, cellVal)}
                      >
                        {editing ? (
                          <input
                            autoFocus
                            value={editVal}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={commitCellEdit}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitCellEdit()
                              if (e.key === 'Escape') setEditCell(null)
                            }}
                            style={{
                              width: '100%', fontSize: '12px', fontFamily: 'var(--font-mono)',
                              border: '1px solid var(--accent)', borderRadius: '3px',
                              padding: '3px 6px', background: 'var(--accent-light)',
                              color: 'var(--text)', outline: 'none',
                            }}
                          />
                        ) : (
                          <TypedValue value={cellVal} />
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '5px' }}>
        Clique numa linha para ver o registro completo · duplo clique numa célula edita direto{canEdit ? '' : ' (indisponível para esta seção)'}
      </div>

      {selected && (
        <RowDetailModal
          row={selected.row}
          rowIdx={selected.idx}
          path={path}
          onUpdate={onUpdate}
          onClose={() => setSelected(null)}
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
// `onUpdate` (opcional) é repassado ao Field/ArrayTable com o `path` dotted certo:
// seção primitiva solta → path = section.key; seção objeto → path = "section.key.campo";
// seção array de objetos → path = section.key (o ArrayTable completa com ".idx.coluna").
// Arrays de primitivos (chips) ainda não recebem edição inline nesta sessão.
function SectionContent({ section, onUpdate }) {
  const { value, type, key } = section
  if (type === 'array') {
    return isArrayOfObjects(value)
      ? <ArrayTable value={value} path={key} onUpdate={onUpdate} />
      : <PrimitiveList value={value} />
  }
  if (type === 'object') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        {Object.entries(value).map(([k, v]) => (
          <Field key={k} label={k} value={v} path={`${key}.${k}`} onUpdate={onUpdate} />
        ))}
      </div>
    )
  }
  return <Field label={section.key} value={value} path={section.key} onUpdate={onUpdate} />
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
      const parts = path.split('.')
      let ref = obj
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]]
      ref[parts[parts.length - 1]] = newVal
      updateContent(activeFile.id, JSON.stringify(obj, null, 2))
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
          <JsonNode value={parsed} depth={0} path="" onUpdate={handleUpdate} />
        ) : (
          <div style={{ color: 'var(--text-faint)', fontSize: '13px' }}>Arquivo vazio.</div>
        )}
      </div>
    </div>
  )
}
