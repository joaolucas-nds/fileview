import { useMemo } from 'react'
import { marked } from 'marked'
import { useApp } from '../context/AppContext'

// Configure marked
marked.setOptions({ gfm: true, breaks: false })

export default function MarkdownViewer() {
  const { activeFile } = useApp()

  const html = useMemo(() => {
    if (!activeFile) return ''
    try {
      return marked.parse(activeFile.content || '')
    } catch {
      return '<p style="color:red">Erro ao renderizar o Markdown.</p>'
    }
  }, [activeFile?.content])

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      padding: '2.5rem 3rem',
    }}>
      <div
        className="md-output"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
