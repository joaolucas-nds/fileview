import { useEffect } from 'react'
import { Undo2, Redo2 } from 'lucide-react'
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
  const { files, activeFile, activeMode, setMode, saveFile, openFile, undo, redo, canUndo, canRedo } = useApp()

  // Desfazer do ARQUIVO (spec 261123, fase 2a). Fora no Markdown em modo
  // Editar: o Tiptap tem desfazer proprio e so rele o conteudo ao trocar de
  // arquivo — um desfazer de fora o deixaria dessincronizado.
  const historyOn = !!activeFile && activeFile.ext !== 'pdf' && !(activeFile.ext === 'md' && activeMode === 'edit')

  // Ctrl+Z desfaz, Ctrl+Y ou Ctrl+Shift+Z refaz — so quando o foco NAO esta
  // num campo de texto (celula em edicao, textarea, editor): ali vale o
  // desfazer do proprio campo.
  useEffect(() => {
    if (!historyOn) return
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return
      const k = e.key.toLowerCase()
      const isUndo = k === 'z' && !e.shiftKey
      const isRedo = (k === 'z' && e.shiftKey) || k === 'y'
      if (!isUndo && !isRedo) return
      const t = e.target
      if (t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      e.preventDefault()
      if (isUndo) undo(activeFile.id)
      else redo(activeFile.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [historyOn, activeFile, undo, redo])

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
                {historyOn && (
                  <>
                    <button onClick={() => undo(activeFile.id)} disabled={!canUndo(activeFile.id)}
                      title="Desfazer (Ctrl+Z)" aria-label="Desfazer" style={histBtn(!canUndo(activeFile.id))}>
                      <Undo2 size={14} />
                    </button>
                    <button onClick={() => redo(activeFile.id)} disabled={!canRedo(activeFile.id)}
                      title="Refazer (Ctrl+Y)" aria-label="Refazer" style={histBtn(!canRedo(activeFile.id))}>
                      <Redo2 size={14} />
                    </button>
                  </>
                )}
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

// Botao ↶/↷ da barra das abas: apagado quando nao ha o que desfazer/refazer.
const histBtn = (disabled) => ({
  display: 'flex', alignItems: 'center', padding: '4px 6px',
  borderRadius: 'var(--radius-sm)', border: '1px solid transparent',
  background: 'transparent', color: disabled ? 'var(--text-faint)' : 'var(--text-muted)',
  cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
})

export default function App() {
  return <AppProvider><Inner /></AppProvider>
}
