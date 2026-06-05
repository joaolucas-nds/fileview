import { useApp } from '../context/AppContext'
import { lazy, Suspense } from 'react'

const MarkdownViewer = lazy(() => import('../viewers/MarkdownViewer'))
const MarkdownEditor = lazy(() => import('../editors/MarkdownEditor'))
const JsonViewer    = lazy(() => import('../viewers/JsonViewer'))
const CsvViewer     = lazy(() => import('../viewers/CsvViewer'))
const PdfViewer     = lazy(() => import('../viewers/PdfViewer'))
const SourceEditor  = lazy(() => import('../editors/SourceEditor'))

function Loading() {
  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-faint)', fontSize: '13px',
    }}>
      Carregando…
    </div>
  )
}

export default function ViewerRouter() {
  const { activeFile, activeMode } = useApp()
  if (!activeFile) return null

  const { ext } = activeFile

  let Component = null

  if (ext === 'md') {
    if (activeMode === 'preview') Component = MarkdownViewer
    else if (activeMode === 'edit') Component = MarkdownEditor
    else Component = SourceEditor
  } else if (ext === 'pdf') {
    Component = PdfViewer
  } else if (ext === 'csv') {
    if (activeMode === 'source') Component = SourceEditor
    else Component = CsvViewer
  } else if (['json', 'yaml', 'yml', 'xml', 'toml', 'env'].includes(ext)) {
    if (activeMode === 'source') Component = SourceEditor
    else Component = JsonViewer
  } else {
    // txt, svg, log, and other text files
    Component = SourceEditor
  }

  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )
}
