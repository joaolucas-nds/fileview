import { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'

// Type colors
const TYPE_COLOR = {
  string: 'var(--green)',
  number: 'var(--blue)',
  boolean: 'var(--purple)',
  null: 'var(--text-faint)',
  array: 'var(--text)',
  object: 'var(--text)',
}

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
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            paddingLeft: `${indent}px`, minHeight: '24px',
            cursor: 'pointer', userSelect: 'none',
          }}
          onClick={() => setCollapsed(c => !c)}
        >
          <span style={{
            fontSize: '10px', color: 'var(--text-faint)',
            transform: collapsed ? 'rotate(-90deg)' : 'none',
            display: 'inline-block', transition: 'transform .12s',
            width: '12px', textAlign: 'center', flexShrink: 0,
          }}>▾</span>

          {keyName !== undefined && (
            <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              "{keyName}"
              <span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>:</span>
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
              <JsonNode
                key={String(k)} keyName={k} value={v}
                depth={depth + 1}
                path={path ? `${path}.${k}` : String(k)}
                onUpdate={onUpdate}
              />
            ))}
            <div style={{ paddingLeft: `${indent}px`, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', minHeight: '20px' }}>
              {bracket[1]}
            </div>
          </>
        )}
      </div>
    )
  }

  // Leaf node
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      paddingLeft: `${indent + 16}px`, minHeight: '22px',
    }}>
      {keyName !== undefined && (
        <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '13px', flexShrink: 0 }}>
          "{keyName}"
          <span style={{ color: 'var(--text-faint)', margin: '0 4px' }}>:</span>
        </span>
      )}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{renderValue()}</span>
    </div>
  )
}

export default function JsonViewer() {
  const { activeFile, updateContent } = useApp()
  const [error, setError] = useState(null)
  const [collapseAll, setCollapseAll] = useState(false)

  let parsed = null
  let parseErr = null
  try {
    if (activeFile?.content) {
      parsed = JSON.parse(activeFile.content)
    }
  } catch (e) {
    parseErr = e.message
  }

  const handleUpdate = useCallback((path, newVal) => {
    if (!activeFile) return
    try {
      const obj = JSON.parse(activeFile.content)
      const parts = path.split('.')
      let ref = obj
      for (let i = 0; i < parts.length - 1; i++) {
        ref = ref[parts[i]]
      }
      ref[parts[parts.length - 1]] = newVal
      updateContent(activeFile.id, JSON.stringify(obj, null, 2))
    } catch {}
  }, [activeFile, updateContent])

  if (!activeFile) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0, fontSize: '12px',
      }}>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>
            Dica: dê duplo clique num valor para editar
          </span>
          <button
            onClick={() => {
              try {
                const pretty = JSON.stringify(JSON.parse(activeFile.content), null, 2)
                updateContent(activeFile.id, pretty)
              } catch {}
            }}
            style={{
              padding: '4px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Formatar
          </button>
          <button
            onClick={() => {
              try {
                const min = JSON.stringify(JSON.parse(activeFile.content))
                updateContent(activeFile.id, min)
              } catch {}
            }}
            style={{
              padding: '4px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Minificar
          </button>
        </div>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {parseErr ? (
          <div style={{
            padding: '16px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)',
            color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '13px',
          }}>
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
