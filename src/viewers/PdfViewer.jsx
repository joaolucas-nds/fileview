import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

let pdfjsLib = null

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import('pdfjs-dist')
  mod.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href
  pdfjsLib = mod
  return pdfjsLib
}

export default function PdfViewer() {
  const { activeFile } = useApp()
  const [pdf, setPdf] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)
  const renderTaskRef = useRef(null)

  // Load PDF when file changes
  useEffect(() => {
    if (!activeFile || activeFile.ext !== 'pdf') return
    setLoading(true)
    setError(null)
    setPage(1)

    getPdfjs().then(async (lib) => {
      try {
        const data = activeFile.content instanceof ArrayBuffer
          ? new Uint8Array(activeFile.content)
          : activeFile.content
        const loadingTask = lib.getDocument({ data })
        const pdfDoc = await loadingTask.promise
        setPdf(pdfDoc)
        setTotalPages(pdfDoc.numPages)
        setLoading(false)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    })
  }, [activeFile?.id])

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return

    const renderPage = async () => {
      // Cancel any ongoing render
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel() } catch {}
      }

      const pdfPage = await pdf.getPage(page)
      const viewport = pdfPage.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      const task = pdfPage.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = task
      try {
        await task.promise
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') console.error(e)
      }
    }

    renderPage()
  }, [pdf, page, scale])

  const goTo = (n) => setPage(Math.max(1, Math.min(n, totalPages)))

  if (!activeFile) return null

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '24px' }}>📄</div>
      <div style={{ fontSize: '13px' }}>Carregando PDF…</div>
    </div>
  )

  if (error) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{
        padding: '16px 20px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)',
        color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--font-mono)',
      }}>
        ⚠ Erro ao abrir PDF: {error}
      </div>
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        padding: '8px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0,
      }}>
        <button onClick={() => goTo(page - 1)} disabled={page <= 1} style={navBtn(page <= 1)}>
          ←
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Página
          <input
            type="number" min={1} max={totalPages} value={page}
            onChange={e => goTo(parseInt(e.target.value) || 1)}
            style={{
              width: '48px', textAlign: 'center', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '3px 6px', fontSize: '13px',
              fontFamily: 'var(--font-mono)', background: 'var(--bg)', color: 'var(--text)',
            }}
          />
          de {totalPages}
        </span>
        <button onClick={() => goTo(page + 1)} disabled={page >= totalPages} style={navBtn(page >= totalPages)}>
          →
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} style={navBtn(scale <= 0.5)}>−</button>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '40px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button onClick={() => setScale(s => Math.min(3, s + 0.2))} style={navBtn(scale >= 3)}>+</button>
        <button
          onClick={() => setScale(1.2)}
          style={{ ...navBtn(false), fontSize: '11px', padding: '4px 8px' }}
        >Reset</button>
        <button
          onClick={() => setScale(1.0)}
          style={{ ...navBtn(false), fontSize: '11px', padding: '4px 8px' }}
        >Ajustar</button>
      </div>

      {/* Canvas area */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'auto',
        background: '#3A3A38', display: 'flex', justifyContent: 'center',
        padding: '24px',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
            borderRadius: '2px',
            display: 'block',
            maxWidth: '100%',
          }}
        />
      </div>
    </div>
  )
}

const navBtn = (disabled) => ({
  padding: '5px 10px', fontSize: '14px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', color: disabled ? 'var(--text-faint)' : 'var(--text)',
  cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)',
  opacity: disabled ? 0.5 : 1,
})
