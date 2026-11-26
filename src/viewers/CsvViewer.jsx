import { useState, useMemo } from 'react'
import Papa from 'papaparse'
import { useApp } from '../context/AppContext'
import DataGrid from '../components/DataGrid'

/**
 * Visualizador/editor de CSV. Desde a fase 2b (spec 261123, DEC-013) a tabela
 * em si e o DataGrid compartilhado; aqui ficam o que e do CSV: ler e regravar
 * o arquivo no formato original, a barra (filtro, contagem, «+ Linha») e o
 * «Desfazer» da exclusao de linha.
 */
export default function CsvViewer() {
  const { activeFile, updateContent } = useApp()
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(0)
  // Pedido para a grade abrir uma celula (o «+ Linha» abre a 1a da linha nova)
  const [editRequest, setEditRequest] = useState(null)

  const { data, headers } = useMemo(() => {
    if (!activeFile?.content) return { data: [], headers: [] }
    const result = Papa.parse(activeFile.content, { header: true, skipEmptyLines: true })
    return { data: result.data, headers: result.meta.fields || [] }
  }, [activeFile?.content])

  // Regrava o CSV no formato do arquivo aberto: mesmo fim de linha (o
  // Papa.unparse usa CRLF por padrao) e a quebra final, se havia. Antes toda
  // edicao num CSV LF reescrevia o arquivo inteiro (analise 261117, decisao 3).
  // `columns` fixa a ordem das colunas pelo cabecalho original.
  const serialize = (rows) => {
    const nl = activeFile.content.includes('\r\n') ? '\r\n' : '\n'
    const out = Papa.unparse(rows, { newline: nl, columns: headers })
    return activeFile.content.endsWith('\n') ? out + nl : out
  }

  // A grade devolve o indice ORIGINAL da linha (FIX-002): grava no `data` cru,
  // seja qual for o filtro ou a ordem na tela.
  const commitValue = (dataIdx, col, val) => {
    const newData = data.map((r, i) => (i === dataIdx ? { ...r, [col]: val } : r))
    updateContent(activeFile.id, serialize(newData))
  }

  // + Linha: com filtro ativo a linha nova (vazia) nao passaria no filtro e o
  // botao pareceria nao fazer nada (analise 261117, U11) — limpa o filtro e ja
  // abre a primeira celula da linha nova.
  const addRow = () => {
    const emptyRow = Object.fromEntries(headers.map(h => [h, '']))
    updateContent(activeFile.id, serialize([...data, emptyRow]))
    setSearch('')
    if (headers.length) setEditRequest({ rowIdx: data.length, col: headers[0], nonce: Date.now() })
  }

  // Ultima linha excluida, para o «Desfazer» da barra (analise 261117, U2).
  // O Ctrl+Z do arquivo (fase 2a) tambem desfaz a exclusao.
  const [lastDeleted, setLastDeleted] = useState(null) // { dataIdx, row }

  const deleteRow = (dataIdx) => {
    setLastDeleted({ dataIdx, row: data[dataIdx] })
    updateContent(activeFile.id, serialize(data.filter((_, i) => i !== dataIdx)))
  }

  const undoDelete = () => {
    if (!lastDeleted) return
    const { dataIdx, row } = lastDeleted
    updateContent(activeFile.id, serialize([...data.slice(0, dataIdx), row, ...data.slice(dataIdx)]))
    setLastDeleted(null)
  }

  if (!activeFile) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Barra */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0,
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar linhas…"
          style={{
            padding: '5px 10px', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', fontSize: '13px',
            background: 'var(--bg)', color: 'var(--text)',
            outline: 'none', width: '220px',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            fontSize: '11px', color: 'var(--text-faint)', padding: '3px 7px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--surface)', cursor: 'pointer',
          }}>✕ limpar</button>
        )}
        <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>
          {visibleCount} / {data.length} linhas · {headers.length} colunas
        </span>
        {lastDeleted && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Linha {lastDeleted.dataIdx + 1} excluída ·
            <button onClick={undoDelete} style={{
              fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', cursor: 'pointer',
            }}>Desfazer</button>
          </span>
        )}
        <button
          onClick={addRow}
          style={{
            marginLeft: 'auto', padding: '5px 12px', fontSize: '12px',
            background: 'var(--green-light)', color: 'var(--green)',
            border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontWeight: '500',
          }}
        >+ Linha</button>
      </div>

      {headers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Arquivo CSV vazio ou inválido.
        </div>
      ) : (
        <DataGrid
          columns={headers}
          rows={data}
          globalFilter={search}
          onCommit={commitValue}
          onDeleteRow={deleteRow}
          editRequest={editRequest}
          onVisibleCountChange={setVisibleCount}
        />
      )}

      <div style={{
        padding: '4px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)', fontSize: '11px', color: 'var(--text-faint)', flexShrink: 0,
      }}>
        Clique seleciona · setas movem · Enter, F2 ou digitar edita · Enter confirma e desce · Tab confirma e avança · Esc cancela · Delete limpa · clique no cabeçalho ordena (3º clique tira a ordem) · lixeira exclui (Desfazer na barra ou Ctrl+Z)
      </div>
    </div>
  )
}
