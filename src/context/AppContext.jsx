import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [files, setFiles] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [modes, setModes] = useState({})

  const openFile = useCallback(async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    // Check if file already open by name
    setFiles(prev => {
      const existing = prev.find(f => f.name === file.name)
      if (existing) { setActiveId(existing.id); return prev }
      return prev
    })

    let content
    if (ext === 'pdf') {
      content = await file.arrayBuffer()
    } else {
      content = await file.text()
    }

    const id = `${file.name}-${Date.now()}`
    const fileObj = {
      id, name: file.name, ext, content,
      originalContent: content, isDirty: false, size: file.size,
    }

    setFiles(prev => {
      const exists = prev.find(f => f.name === file.name)
      if (exists) return prev
      return [...prev, fileObj]
    })
    setActiveId(id)
    setModes(prev => ({ ...prev, [id]: ext === 'md' ? 'preview' : 'view' }))
  }, [])

  const closeFile = useCallback((id) => {
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id)
      setActiveId(cur => {
        if (cur !== id) return cur
        return next.length ? next[Math.max(0, next.findIndex(f => f.id === id) - 1)]?.id || next[0].id : null
      })
      return next
    })
    setModes(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [])

  const updateContent = useCallback((id, newContent) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, content: newContent, isDirty: newContent !== f.originalContent } : f
    ))
  }, [])

  const setMode = useCallback((id, mode) => {
    setModes(prev => ({ ...prev, [id]: mode }))
  }, [])

  const saveFile = useCallback((id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (!file || file.ext === 'pdf') return prev
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = file.name; a.click()
      URL.revokeObjectURL(url)
      return prev.map(f => f.id === id ? { ...f, isDirty: false, originalContent: f.content } : f)
    })
  }, [])

  const activeFile = files.find(f => f.id === activeId) || null
  const activeMode = activeId ? (modes[activeId] || 'view') : null

  return (
    <AppContext.Provider value={{
      files, activeId, activeFile, activeMode,
      openFile, closeFile, updateContent, setMode, saveFile, setActiveId,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
