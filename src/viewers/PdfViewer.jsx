import { useApp } from '../context/AppContext'

/**
 * Mostra o PDF ativo com o visualizador nativo do navegador, embutido num <iframe>.
 *
 * `activeFile.content` e uma Blob URL (ver AppContext.openFile e FIX-001). O
 * navegador cuida de zoom (inclusive Ctrl+roda), busca, selecao de texto,
 * impressao e miniaturas — DEC-012. O ViewerRouter ja remonta este componente
 * a cada aba (key = id do arquivo, FIX-003).
 */
export default function PdfViewer() {
  const { activeFile } = useApp()
  if (!activeFile) return null

  return (
    <iframe
      src={activeFile.content}
      title={activeFile.name}
      style={{ display: 'block', width: '100%', height: '100%', border: 'none', background: '#3A3A38' }}
    />
  )
}
