import { useEffect, useCallback } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import Underline from '@tiptap/extension-underline'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import { useApp } from '../context/AppContext'

const lowlight = createLowlight(common)

// --- Toolbar Button ---
function Btn({ onClick, active, title, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '4px 7px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: active ? 'var(--gray-light)' : 'transparent',
        color: active ? 'var(--text)' : disabled ? 'var(--text-faint)' : 'var(--text-muted)',
        border: active ? '1px solid var(--border)' : '1px solid transparent',
        lineHeight: 1,
        minWidth: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .1s',
        fontFamily: 'var(--font-mono)',
      }}
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = 'var(--gray-light)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
}

function Toolbar({ editor }) {
  if (!editor) return null
  const chain = () => editor.chain().focus()

  const insertTable = () => {
    chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px',
      padding: '6px 12px', borderBottom: '1px solid var(--border)',
      background: 'var(--surface)', flexShrink: 0,
    }}>
      {/* Headings */}
      <select
        value={
          editor.isActive('heading', { level: 1 }) ? '1' :
          editor.isActive('heading', { level: 2 }) ? '2' :
          editor.isActive('heading', { level: 3 }) ? '3' :
          editor.isActive('heading', { level: 4 }) ? '4' : '0'
        }
        onChange={e => {
          const v = parseInt(e.target.value)
          if (v === 0) chain().setParagraph().run()
          else chain().toggleHeading({ level: v }).run()
        }}
        style={{
          fontSize: '12px', padding: '4px 6px', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', background: 'var(--surface)',
          color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-ui)',
          height: '28px',
        }}
      >
        <option value="0">Parágrafo</option>
        <option value="1">Título 1</option>
        <option value="2">Título 2</option>
        <option value="3">Título 3</option>
        <option value="4">Título 4</option>
      </select>

      <Sep />

      {/* Formatting */}
      <Btn onClick={() => chain().toggleBold().run()} active={editor.isActive('bold')} title="Negrito (Ctrl+B)"><b>B</b></Btn>
      <Btn onClick={() => chain().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico (Ctrl+I)"><i>I</i></Btn>
      <Btn onClick={() => chain().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado (Ctrl+U)"><u>U</u></Btn>
      <Btn onClick={() => chain().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado"><s>S</s></Btn>
      <Btn onClick={() => chain().toggleHighlight().run()} active={editor.isActive('highlight')} title="Destaque">🖊</Btn>
      <Btn onClick={() => chain().toggleCode().run()} active={editor.isActive('code')} title="Código inline">{`<>`}</Btn>

      <Sep />

      {/* Case transformations */}
      <Btn
        onClick={() => {
          const { from, to } = editor.state.selection
          const text = editor.state.doc.textBetween(from, to)
          chain().insertContentAt({ from, to }, text.toUpperCase()).run()
        }}
        title="TUDO MAIÚSCULO"
      >AA</Btn>
      <Btn
        onClick={() => {
          const { from, to } = editor.state.selection
          const text = editor.state.doc.textBetween(from, to)
          chain().insertContentAt({ from, to }, text.toLowerCase()).run()
        }}
        title="tudo minúsculo"
      >aa</Btn>

      <Sep />

      {/* Alignment */}
      <Btn onClick={() => chain().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar à esquerda">⬅</Btn>
      <Btn onClick={() => chain().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centralizar">↔</Btn>
      <Btn onClick={() => chain().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar à direita">➡</Btn>

      <Sep />

      {/* Lists */}
      <Btn onClick={() => chain().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista com marcadores">• —</Btn>
      <Btn onClick={() => chain().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">1.</Btn>
      <Btn onClick={() => chain().toggleTaskList().run()} active={editor.isActive('taskList')} title="Lista de tarefas">☑</Btn>

      <Sep />

      {/* Blocks */}
      <Btn onClick={() => chain().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">"</Btn>
      <Btn onClick={() => chain().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloco de código">{`{ }`}</Btn>
      <Btn onClick={() => chain().setHorizontalRule().run()} title="Linha horizontal">—</Btn>

      <Sep />

      {/* Table */}
      <Btn onClick={insertTable} title="Inserir tabela">⊞</Btn>
      {editor.isActive('table') && (
        <>
          <Btn onClick={() => chain().addColumnAfter().run()} title="Adicionar coluna">+col</Btn>
          <Btn onClick={() => chain().addRowAfter().run()} title="Adicionar linha">+lin</Btn>
          <Btn onClick={() => chain().deleteTable().run()} title="Deletar tabela">✕tab</Btn>
        </>
      )}

      <Sep />

      {/* Color */}
      <input
        type="color"
        defaultValue="#FF4D00"
        title="Cor do texto"
        style={{ width: '28px', height: '28px', padding: '2px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface)' }}
        onChange={e => chain().setColor(e.target.value).run()}
      />
      <Btn onClick={() => chain().unsetColor().run()} title="Remover cor">✕cor</Btn>

      <Sep />

      {/* History */}
      <Btn onClick={() => chain().undo().run()} disabled={!editor.can().undo()} title="Desfazer">↩</Btn>
      <Btn onClick={() => chain().redo().run()} disabled={!editor.can().redo()} title="Refazer">↪</Btn>
    </div>
  )
}

export default function MarkdownEditor() {
  const { activeFile, updateContent } = useApp()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Markdown.configure({ html: false, tightLists: true }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Placeholder.configure({ placeholder: 'Comece a escrever…' }),
      TextStyle,
      Color,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: activeFile?.content || '',
    onUpdate: ({ editor }) => {
      if (activeFile) {
        const md = editor.storage.markdown.getMarkdown()
        updateContent(activeFile.id, md)
      }
    },
  })

  // When switching to a different file, update editor content
  useEffect(() => {
    if (editor && activeFile) {
      const currentMd = editor.storage.markdown?.getMarkdown?.() || ''
      if (currentMd !== activeFile.content) {
        editor.commands.setContent(activeFile.content || '')
      }
    }
  }, [activeFile?.id])

  return (
    <div className="tiptap-editor" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar editor={editor} />

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div style={{
            display: 'flex', gap: '2px', padding: '4px',
            background: 'var(--sidebar-bg)', borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            {[
              { label: <b>B</b>, cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
              { label: <i>I</i>, cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
              { label: <u>U</u>, cmd: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
              { label: <s>S</s>, cmd: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
              { label: '🖊', cmd: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight') },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.cmd}
                style={{
                  padding: '4px 8px', borderRadius: '4px', fontSize: '13px',
                  color: item.active ? '#fff' : '#A8A69E',
                  background: item.active ? '#FF4D00' : 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </BubbleMenu>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EditorContent editor={editor} style={{ height: '100%' }} />
      </div>
    </div>
  )
}
