import { useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import ViewerRouter from './components/ViewerRouter'
import DropZone from './components/DropZone'

function ModeBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px',
      fontWeight: '500', cursor: 'pointer', transition: 'all .1s',
      background: active ? 'var(--gray-light)' : 'transparent',
      color: active ? 'var(--text)' : 'var(--text-muted)',
      border: active ? '1px solid var(--border)' : '1px solid transparent',
    }}>
      {label}
    </button>
  )
}

function FileTab({ file }) {
  const { activeId, setActiveId, closeFile } = useApp()
  const isActive = file.id === activeId
  return (
    <div
      onClick={() => setActiveId(file.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '0 12px', height: '100%', cursor: 'pointer',
        borderRight: '1px solid var(--border)', flexShrink: 0,
        minWidth: '100px', maxWidth: '180px',
        background: isActive ? 'var(--bg)' : 'var(--surface)',
        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'background .1s',
      }}
    >
      <span style={{
        fontSize: '12px', fontFamily: 'var(--font-mono)', flex: 1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: isActive ? 'var(--text)' : 'var(--text-muted)',
      }}>
        {file.isDirty && <span style={{ color: 'var(--accent)', marginRight: '3px' }}>●</span>}
        {file.name}
      </span>
      <button
        onClick={e => { e.stopPropagation(); closeFile(file.id) }}
        style={{ color: 'var(--text-faint)', fontSize: '12px', padding: '2px', borderRadius: '3px', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
      >✕</button>
    </div>
  )
}

function Inner() {
  const { files, activeFile, activeMode, setMode, saveFile, openFile } = useApp()

  const handleDrop = (e) => {
    e.preventDefault()
    Array.from(e.dataTransfer.files).forEach(openFile)
  }

  const mdModes = [
    { key: 'preview', label: 'Prévia' },
    { key: 'edit', label: 'Editar' },
    { key: 'source', label: 'Fonte' },
  ]
  const jsonModes = [
    { key: 'view', label: 'Árvore' },
    { key: 'form', label: 'Formulário' },
    { key: 'source', label: 'Texto' },
  ]
  const structModes = [
    { key: 'view', label: 'Árvore' },
    { key: 'source', label: 'Texto' },
  ]
  const csvModes = [
    { key: 'view', label: 'Tabela' },
    { key: 'source', label: 'Texto' },
  ]

  let modeBtns = []
  if (activeFile) {
    if (activeFile.ext === 'md') modeBtns = mdModes
    else if (activeFile.ext === 'json') modeBtns = jsonModes
    else if (['yaml','yml','xml','toml','env'].includes(activeFile.ext)) modeBtns = structModes
    else if (activeFile.ext === 'csv') modeBtns = csvModes
  }

  return (
    <div
      style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tab bar */}
        {files.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', height: 'var(--tab-h)',
            borderBottom: '1px solid var(--border)', background: 'var(--surface)',
            overflowX: 'auto', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', height: '100%', flex: 1, minWidth: 0 }}>
              {files.map(f => <FileTab key={f.id} file={f} />)}
            </div>
            {activeFile && (
              <div style={{ display: 'flex', gap: '4px', padding: '0 12px', flexShrink: 0, alignItems: 'center' }}>
                {modeBtns.map(m => (
                  <ModeBtn key={m.key} label={m.label}
                    active={activeMode === m.key}
                    onClick={() => setMode(activeFile.id, m.key)} />
                ))}
                {activeFile.isDirty && (
                  <button
                    onClick={() => saveFile(activeFile.id)}
                    style={{
                      marginLeft: '6px', padding: '4px 12px',
                      background: 'var(--accent)', color: '#fff',
                      borderRadius: 'var(--radius-sm)', fontSize: '12px',
                      fontWeight: '500', cursor: 'pointer',
                    }}
                  >Salvar ↓</button>
                )}
              </div>
            )}
          </div>
        )}
        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {!activeFile ? <DropZone /> : <ViewerRouter />}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return <AppProvider><Inner /></AppProvider>
}
