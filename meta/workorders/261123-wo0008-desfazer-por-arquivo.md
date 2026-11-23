# WO 0008 — Fase 2a da grade: desfazer e refazer por arquivo (Ctrl+Z / Ctrl+Y e botoes ↶ ↷)

> **Tipo:** CODIGO (`src/context/AppContext.jsx`, `src/App.jsx`, `src/editors/SourceEditor.jsx`, `src/editors/MarkdownEditor.jsx`) + versiona a spec e o log do chat. Registro nos meta/ fica para o `/wrap` (ver «Canal»).
> **Config sugerida:** Sonnet, `/effort medium`.
> **Pre-requisito:** escrita sobre `9d45828`. `git status --short` ao comecar: so os 2 arquivos do chat abaixo + esta WO.
> **Base:** spec `meta/specs/261123-grade-de-dados-fase2.md`, passo 2a (DEC-013, fase 2).
> **Arquivos que o chat gravou no disco e esta WO versiona** (Edicao 0: `sha1sum`; diferente = PARE):
>   - `meta/specs/261123-grade-de-dados-fase2.md` — `21f57220f671d1171f76be032f18df8db9c60614`
>   - `logs/2026-11-23.md` — `3263669064e95317d3476558519cfaa58469e1bf`
> **Ancora semantica:** ancora que nao bater EXATAMENTE = PARE e reporte (e grave o relatorio de parada, como a skill manda).
> **Idempotencia:** texto novo inteiro presente e ancora ausente = ja aplicada (PULE e diga). Formas «trocar» (texto novo contem a ancora): 2, 5, 8, 10, 11 — ali «ja aplicada» = o texto novo inteiro presente.
> **Ancoras lidas em:** recortadas por script, neste turno, sobre `9d45828`: `AppContext.jsx` (1–5), `SourceEditor.jsx` (6), `MarkdownEditor.jsx` (7), `App.jsx` (8–11). O trecho literal de cada uma e o bloco **Ancora**, em cerca de QUATRO crases. Simulado em sequencia a partir do texto desta WO: cada ancora = 1 ocorrencia.
> **Fim de linha:** `App.jsx`, `SourceEditor.jsx` e `MarkdownEditor.jsx` sao CRLF na arvore (ancoras medidas normalizadas para LF; grave de volta em CRLF). `AppContext.jsx` e LF.
> **Validacao ja feita pelo chat (nao substitui o build):** os 4 `.jsx` simulados passaram no `esbuild 0.21.5`; a logica da pilha (`updateContent` com e sem `coalesce`, `undo`, `redo`, limite de 50) foi rodada em node, fora do React.
> **Proximo comando:** nenhum — a conferencia na tela e do dono, pelo roteiro entregue no chat no mesmo turno.

> **Canal dos meta neste ciclo = CODE pelo `/wrap`:** esta WO so traz codigo; STATUS (0.1.11), CHANGELOG e a linha da fase no ROADMAP entram no `/wrap` depois do build verde, com o texto: «0.1.11 — Desfazer e refazer por arquivo: Ctrl+Z / Ctrl+Y (ou Ctrl+Shift+Z) e botoes ↶ ↷ na barra das abas; digitacao no modo Texto vira um passo; campo em foco e Markdown em Editar ficam com o desfazer proprio (spec 261123, fase 2a)». Nao e decisao nova (DEC-013 cobre).

---

## 1. Por que

Fase 2a da DEC-013: hoje so a exclusao de linha do CSV tem desfazer. Toda edicao de arquivo passa por `updateContent` no `AppContext`; guardar ali o conteudo anterior, por arquivo, da desfazer a CSV, JSON (Arvore, Formulario, Texto) e texto de uma vez, sem cada viewer saber disso. Decisoes de design na spec.

---

## Edicao 0 — conferir hashes

````
sha1sum meta/specs/261123-grade-de-dados-fase2.md logs/2026-11-23.md
````

## Edicao 1 — `src/context/AppContext.jsx` · import do useRef

**Substituir.** Ancora:

````
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
````

**Por:**

````
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
````

## Edicao 2 — `src/context/AppContext.jsx` · pilha de desfazer por arquivo

**Substituir.** Ancora:

````
  const [modes, setModes] = useState({})

````

**Por:**

````
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

````

## Edicao 3 — `src/context/AppContext.jsx` · updateContent grava o estado anterior

**Substituir.** Ancora:

````
  const updateContent = useCallback((id, newContent) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, content: newContent, isDirty: newContent !== f.originalContent } : f
    ))
  }, [])
````

**Por:**

````
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
````

## Edicao 4 — `src/context/AppContext.jsx` · fechar descarta a pilha do arquivo

**Substituir.** Ancora:

````
    setModes(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [files])
````

**Por:**

````
    delete histRef.current[id]
    setModes(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [files])
````

## Edicao 5 — `src/context/AppContext.jsx` · contexto expoe desfazer

**Substituir.** Ancora:

````
      openFile, closeFile, updateContent, setMode, saveFile, setActiveId,
````

**Por:**

````
      openFile, closeFile, updateContent, setMode, saveFile, setActiveId,
      undo, redo, canUndo, canRedo, histVersion,
````

## Edicao 6 — `src/editors/SourceEditor.jsx` · Texto agrupa a digitacao

**Substituir.** Ancora:

````
        onChange={e => updateContent(activeFile.id, e.target.value)}
````

**Por:**

````
        onChange={e => updateContent(activeFile.id, e.target.value, { coalesce: true })}
````

## Edicao 7 — `src/editors/MarkdownEditor.jsx` · Markdown agrupa a digitacao

**Substituir.** Ancora:

````
        updateContent(activeFile.id, md)
````

**Por:**

````
        updateContent(activeFile.id, md, { coalesce: true })
````

## Edicao 8 — `src/App.jsx` · imports de icone

**Substituir.** Ancora:

````
import { useEffect } from 'react'
````

**Por:**

````
import { useEffect } from 'react'
import { Undo2, Redo2 } from 'lucide-react'
````

## Edicao 9 — `src/App.jsx` · atalhos Ctrl+Z / Ctrl+Y

**Substituir.** Ancora:

````
  const { files, activeFile, activeMode, setMode, saveFile, openFile } = useApp()
````

**Por:**

````
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
````

## Edicao 10 — `src/App.jsx` · botoes desfazer/refazer na barra

**Substituir.** Ancora:

````
                {activeFile.isDirty && (
                  <button
                    onClick={() => saveFile(activeFile.id)}
````

**Por:**

````
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
````

## Edicao 11 — `src/App.jsx` · estilo dos botoes

**Substituir.** Ancora:

````
export default function App() {
````

**Por:**

````
// Botao ↶/↷ da barra das abas: apagado quando nao ha o que desfazer/refazer.
const histBtn = (disabled) => ({
  display: 'flex', alignItems: 'center', padding: '4px 6px',
  borderRadius: 'var(--radius-sm)', border: '1px solid transparent',
  background: 'transparent', color: disabled ? 'var(--text-faint)' : 'var(--text-muted)',
  cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
})

export default function App() {
````

---

## Fora de escopo

- `DataGrid`, selecao de celula, larguras estaveis (fase 2b).
- A barra «Linha N excluida · Desfazer» do CSV continua (os dois desfazeres coexistem; a spec decide na 2b).
- Desfazer que sobreviva a fechar o arquivo ou recarregar.

## Armadilhas desta WO

- Tres arquivos CRLF (ver cabecalho).
- A Edicao 3 escreve `filesRef.current` dentro do `updateContent` de proposito: duas edicoes antes da proxima renderizacao (ex.: Tab no CSV) precisam ler o conteudo ja atualizado.

---

## Depois de aplicar — conferencia antes do commit

- [ ] `npm run build` sem erro. Erro → PARE.
- [ ] `git status --short` → exatamente: `M src/App.jsx`, `M src/context/AppContext.jsx`, `M src/editors/MarkdownEditor.jsx`, `M src/editors/SourceEditor.jsx`, `?? logs/2026-11-23.md`, `?? meta/specs/`, `?? meta/workorders/261123-wo0008-desfazer-por-arquivo.md` (7 entradas).
- [ ] Saldo de linhas (`wc -l`, simulado a partir deste texto, normalizado para LF): `src/App.jsx` 141 → 188 (+47) · `src/context/AppContext.jsx` 117 → 167 (+50) · `src/editors/MarkdownEditor.jsx` 260 → 260 (+0) · `src/editors/SourceEditor.jsx` 45 → 45 (+0). Saldo diferente = VERMELHO.
- [ ] Contagens (unidade = linhas): `grep -c "const histRef = useRef" src/context/AppContext.jsx` → 1 · `grep -c "undo, redo, canUndo, canRedo, histVersion" src/context/AppContext.jsx` → 1 · `grep -c "coalesce: true" src/editors/SourceEditor.jsx src/editors/MarkdownEditor.jsx` → 1 e 1 · `grep -c "<Undo2 size={14} />" src/App.jsx` → 1.
- [ ] **Chega no ramo?** Toda edicao: viewer/editor → `updateContent` (Edicao 3) → `histRef`. Desfazer: tecla em `App.jsx` (Edicao 9) ou botao (Edicao 10) → `undo`/`redo` → `stepHistory`. O build responde «compila?»; «desfaz o passo certo e so no arquivo certo?» e do roteiro do dono.
- [ ] Se rodou `npm run dev`, encerre.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O de sempre, depois do push. Grave em `../AAMMDD-HHMM-code-fileview-apply-wo0008.txt` (`date +%y%m%d-%H%M`). Depois: `/wrap` com o texto do «Canal», acima.

## Commit — blocos separados, mensagem SEM acento

````
git add src/App.jsx src/context/AppContext.jsx src/editors/MarkdownEditor.jsx src/editors/SourceEditor.jsx meta/specs logs/2026-11-23.md meta/workorders/261123-wo0008-desfazer-por-arquivo.md
````

````
git commit -m "feat(grade): fase 2a - desfazer e refazer por arquivo (Ctrl+Z, Ctrl+Y, botoes)" -m "Pilha de conteudos por arquivo no AppContext (50 passos); digitacao agrupada em 800 ms; campo em foco e Markdown em Editar ficam com o desfazer proprio. Spec 261123."
````

````
git push
````

*Gerado pelo Kit de Contexto Universal v1.160.1 — 2026-11-21 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
