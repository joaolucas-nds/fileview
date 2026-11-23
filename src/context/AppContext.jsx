import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [files, setFiles] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [modes, setModes] = useState({})

  // Desfazer por arquivo (spec 261123, fase 2a). A pilha guarda CONTEUDOS
  // inteiros: toda edicao passa por updateContent, entao o mesmo mecanismo cobre
  // CSV, JSON e Texto sem cada viewer saber de desfazer. Fica num ref (nao em
  // estado) para updateContent ler e gravar sem depender da renderizacao;
  // histVersion so existe para os botoes ↶ ↷ re-renderizarem.
  const HISTORY_LIMIT = 50 // passos por arquivo — cada passo e o arquivo inteiro
  const COALESCE_MS = 800 // digitacao continua (Texto, Markdown) vira um passo so
  const filesRef = useRef(files)
  filesRef.current = files
  const histRef = useRef({}) // id -> { past: [], future: [], lastAt: 0 }
  const [histVersion, setHistVersion] = useState(0)

  // Fechar ou recarregar a aba do navegador com alteracao nao salva: o navegador
  // mostra o aviso padrao dele (o texto e do navegador, nao nosso). Analise
  // 261117, G1 — antes, tudo se perdia sem pergunta.
  const anyDirty = files.some(f => f.isDirty)
  useEffect(() => {
    if (!anyDirty) return
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [anyDirty])

  const openFile = useCallback(async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    // Evita duplicata: se já aberto pelo mesmo nome, só foca
    setFiles(prev => {
      const existing = prev.find(f => f.name === file.name)
      if (existing) { setActiveId(existing.id); return prev }
      return prev
    })

    let content
    if (ext === 'pdf') {
      // PDF vira Blob URL (string): é o que o <iframe> do PdfViewer abre (DEC-012).
      // Origem da regra (FIX-001): quando o PDF.js desenhava o PDF, o transfer do
      // ArrayBuffer para o worker o DETACHAVA; guardar a URL, nunca o buffer, evita isso.
      // closeFile revoga a URL — revogar antes de fechar deixa o iframe em branco.
      const buf = await file.arrayBuffer()
      const blob = new Blob([buf], { type: 'application/pdf' })
      content = URL.createObjectURL(blob)
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
    // Arquivo com alteracao nao salva: pergunta antes de descartar (analise
    // 261117, G1). Vale para o ✕ da aba e o da barra lateral, que chamam aqui.
    const target = files.find(f => f.id === id)
    if (target?.isDirty && !window.confirm(`"${target.name}" tem alterações não salvas. Fechar e descartar?`)) return
    setFiles(prev => {
      const fileToClose = prev.find(f => f.id === id)
      // Revogar Blob URL do PDF para não vazar memória
      if (fileToClose?.ext === 'pdf' && typeof fileToClose.content === 'string') {
        URL.revokeObjectURL(fileToClose.content)
      }
      const next = prev.filter(f => f.id !== id)
      setActiveId(cur => {
        if (cur !== id) return cur
        return next.length
          ? next[Math.max(0, next.findIndex(f => f.id === id) - 1)]?.id || next[0].id
          : null
      })
      return next
    })
    delete histRef.current[id]
    setModes(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [files])

  // `opts.coalesce`: quem grava tecla a tecla (SourceEditor, MarkdownEditor)
  // pede para juntar a digitacao — o estado anterior so entra na pilha se a
  // ultima gravacao foi ha mais de COALESCE_MS. Edicao discreta (celula, campo)
  // vira sempre um passo proprio.
  const updateContent = useCallback((id, newContent, opts = {}) => {
    const cur = filesRef.current.find(f => f.id === id)
    if (!cur || cur.content === newContent) return
    const h = histRef.current[id] || (histRef.current[id] = { past: [], future: [], lastAt: 0 })
    const now = Date.now()
    if (!opts.coalesce || now - h.lastAt > COALESCE_MS) {
      h.past.push(cur.content)
      if (h.past.length > HISTORY_LIMIT) h.past.shift()
    }
    h.lastAt = opts.coalesce ? now : 0
    h.future = []
    filesRef.current = filesRef.current.map(f => f.id === id ? { ...f, content: newContent } : f)
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, content: newContent, isDirty: newContent !== f.originalContent } : f
    ))
    setHistVersion(v => v + 1)
  }, [])

  // Desfazer/refazer: troca o conteudo pelo da pilha. isDirty sai da
  // comparacao com o original, entao desfazer ate a abertura apaga o ●.
  const stepHistory = useCallback((id, from, to) => {
    const h = histRef.current[id]
    const cur = filesRef.current.find(f => f.id === id)
    if (!h || !cur || h[from].length === 0) return
    const content = h[from].pop()
    h[to].push(cur.content)
    h.lastAt = 0
    filesRef.current = filesRef.current.map(f => f.id === id ? { ...f, content } : f)
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, content, isDirty: content !== f.originalContent } : f
    ))
    setHistVersion(v => v + 1)
  }, [])
  const undo = useCallback((id) => stepHistory(id, 'past', 'future'), [stepHistory])
  const redo = useCallback((id) => stepHistory(id, 'future', 'past'), [stepHistory])
  const canUndo = (id) => (histRef.current[id]?.past.length || 0) > 0
  const canRedo = (id) => (histRef.current[id]?.future.length || 0) > 0

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
      undo, redo, canUndo, canRedo, histVersion,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
