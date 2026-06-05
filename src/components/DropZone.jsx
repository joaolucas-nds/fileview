import { useRef } from 'react'
import { useApp } from '../context/AppContext'

const SUPPORTED = ['.md', '.json', '.csv', '.pdf', '.yaml', '.yml', '.xml', '.svg', '.txt', '.env', '.toml', '.log']

export default function DropZone() {
  const { openFile } = useApp()
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    Array.from(e.dataTransfer.files).forEach(openFile)
  }

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none',
        gap: '16px',
      }}
    >
      <input
        ref={inputRef} type="file" multiple
        accept={SUPPORTED.join(',')}
        style={{ display: 'none' }}
        onChange={e => Array.from(e.target.files).forEach(openFile)}
      />

      {/* Icon */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '16px',
        background: 'var(--gray-light)', border: '1.5px dashed var(--border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px',
      }}>
        📂
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>
          Arraste arquivos ou clique para abrir
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {SUPPORTED.join('  ')}
        </p>
      </div>
    </div>
  )
}
