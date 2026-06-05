import { useApp } from '../context/AppContext'

export default function SourceEditor() {
  const { activeFile, updateContent } = useApp()
  if (!activeFile) return null

  const isPdf = activeFile.ext === 'pdf'
  if (isPdf) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: '13px',
      }}>
        PDFs não têm modo de edição de texto.
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '4px 16px', background: 'var(--gray-light)',
        borderBottom: '1px solid var(--border)',
        fontSize: '11px', color: 'var(--text-muted)',
        flexShrink: 0,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>{activeFile.name}</span>
        <span>{activeFile.content.split('\n').length} linhas · {activeFile.content.length} chars</span>
      </div>
      <textarea
        value={activeFile.content}
        onChange={e => updateContent(activeFile.id, e.target.value)}
        spellCheck={false}
        style={{
          flex: 1, border: 'none', outline: 'none', resize: 'none',
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          lineHeight: '1.7', padding: '16px 20px',
          background: '#111110', color: '#E8E6DE',
          caretColor: '#FF4D00',
        }}
      />
    </div>
  )
}
