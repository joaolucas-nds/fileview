import { useState, useCallback, useMemo, useEffect } from 'react'
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

// Campo label + valor
function Field({ label, value }) {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  const isPrimitive = ['string', 'number', 'boolean', 'null'].includes(type)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      {isPrimitive ? (
        <div style={{ background: 'var(--gray-light)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '3px 8px' }}>
          <TypedValue value={value} />
        </div>
      ) : (
        <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontStyle: 'italic', padding: '3px 0' }}>
          {type === 'array' ? `[ ${value.length} itens ]` : `{ ${Object.keys(value).length} chaves }`}
        </span>
      )}
    </div>
  )
}

// Tabela para arrays de objetos uniformes
function ArrayTable({ value }) {
  const keys = arrayKeys(value)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: '100%', fontSize: '12px' }}>
        <thead>
          <tr>
            {keys.map(k => (
              <th key={k} style={{ padding: '5px 10px', textAlign: 'left', background: 'var(--gray-light)', border: '0.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontWeight: '500', color: 'var(--amber)', whiteSpace: 'nowrap' }}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.map((row, i) => (
            <tr key={i}>
              {keys.map(k => (
                <td key={k} style={{ padding: '5px 10px', border: '0.5px solid var(--border)' }}>
                  <TypedValue value={row[k] ?? null} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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

// Conteúdo de seção — compartilhado pelos 3 layouts
function SectionContent({ section }) {
  const { value, type } = section
  if (type === 'array') {
    return isArrayOfObjects(value) ? <ArrayTable value={value} /> : <PrimitiveList value={value} />
  }
  if (type === 'object') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        {Object.entries(value).map(([k, v]) => <Field key={k} label={k} value={v} />)}
      </div>
    )
  }
  return <Field label={section.key} value={value} />
}

// Layout A — Cards em grade
function CardLayout({ sections }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', padding: '16px' }}>
      {sections.map(s => (
        <div key={s.key} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '7px 12px', background: 'var(--gray-light)', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '500', color: 'var(--amber)' }}>{s.key}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              {s.type === 'array' ? `${s.value.length} itens` : s.type === 'object' ? `${Object.keys(s.value).length} chaves` : s.type}
            </span>
          </div>
          <div style={{ padding: '12px' }}>
            <SectionContent section={s} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Layout B — Tabs
function TabLayout({ sections }) {
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
        {active && <SectionContent section={active} />}
      </div>
    </div>
  )
}

// Layout C — Painel lateral
function PanelLayout({ sections }) {
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
        {active && <SectionContent section={active} />}
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

function FormView({ data }) {
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
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {layout === 'cards' && <div style={{ height: '100%', overflowY: 'auto' }}><CardLayout sections={sections} /></div>}
        {layout === 'tabs' && <TabLayout sections={sections} />}
        {layout === 'painel' && <PanelLayout sections={sections} />}
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
      ? <FormView data={parsed} />
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
