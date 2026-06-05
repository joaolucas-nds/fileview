import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

const EXT_COLOR = {
  md: '#7C8CF8', json: '#F59E42', csv: '#34D399', pdf: '#F87171',
  yaml: '#A78BFA', yml: '#A78BFA', xml: '#60A5FA', svg: '#F472B6',
  txt: '#A8A69E', env: '#86EFAC', toml: '#FCD34D', log: '#94A3B8',
}
const EXT_EMOJI = {
  md: '📝', json: '📦', csv: '📊', pdf: '📄',
  yaml: '⚙️', yml: '⚙️', xml: '🔖', svg: '🖼️',
  txt: '📃', env: '🔐', toml: '⚙️', log: '📋',
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(1)} MB`
}

export default function Sidebar() {
  const { files, activeId, setActiveId, openFile, closeFile } = useApp()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (list) => Array.from(list).forEach(openFile)

  return (
    <aside style={{
      width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)',
      background: 'var(--sidebar-bg)', display: 'flex',
      flexDirection: 'column', borderRight: '1px solid var(--sidebar-border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '700',
          color: '#fff', letterSpacing: '0.1em', marginBottom: '12px',
        }}>
          FILE<span style={{ color: 'var(--sidebar-accent)' }}>VIEW</span>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '7px', padding: '7px 10px', background: 'var(--sidebar-accent)',
            color: '#fff', borderRadius: 'var(--radius-sm)', fontSize: '12px',
            fontWeight: '500', cursor: 'pointer', border: 'none', transition: 'opacity .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ↑ Abrir arquivo
        </button>
        <input ref={inputRef} type="file" multiple
          accept=".md,.json,.csv,.pdf,.yaml,.yml,.xml,.svg,.txt,.env,.toml,.log"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {files.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#3A3A38', fontSize: '12px', lineHeight: 1.7 }}>
            Nenhum arquivo.<br/>Arraste ou clique em "Abrir".
          </div>
        ) : files.map(file => {
          const isActive = file.id === activeId
          const color = EXT_COLOR[file.ext] || '#A8A69E'
          const emoji = EXT_EMOJI[file.ext] || '📄'
          return (
            <div key={file.id}
              onClick={() => setActiveId(file.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 12px', cursor: 'pointer',
                background: isActive ? '#1E1E1C' : 'transparent',
                borderLeft: `2px solid ${isActive ? color : 'transparent'}`,
                transition: 'background .1s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#181816' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: isActive ? '#F5F4F0' : '#A8A69E', fontSize: '12px',
                  fontFamily: 'var(--font-mono)', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  {file.name}
                  {file.isDirty && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--sidebar-accent)', flexShrink: 0 }} />}
                </div>
                <div style={{ color: '#3E3E3C', fontSize: '10px', marginTop: '1px' }}>
                  {file.ext.toUpperCase()} · {fmt(file.size)}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); closeFile(file.id) }}
                style={{ color: '#3E3E3C', fontSize: '12px', padding: '2px 4px', borderRadius: '3px', flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0, transition: 'opacity .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = '#3E3E3C' }}
                className="sb-close"
              >✕</button>
            </div>
          )
        })}
      </div>

      {/* Drop hint */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        style={{
          padding: '10px 14px', borderTop: '1px solid var(--sidebar-border)',
          fontSize: '11px', textAlign: 'center',
          color: dragging ? 'var(--sidebar-accent)' : '#2E2E2C',
          background: dragging ? '#1A1A18' : 'transparent',
          transition: 'all .15s',
        }}
      >
        {dragging ? '↓ Soltar arquivos' : 'ou arraste arquivos aqui'}
      </div>
      <style>{`.sb-close:hover { opacity: 1 !important; }`}</style>
    </aside>
  )
}
