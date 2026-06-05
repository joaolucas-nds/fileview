# FileView

Visualizador e editor de arquivos local — .md, .json, .csv, .pdf e mais.
Construído com React + Vite + Tiptap.

---

## Pré-requisitos

Você precisa ter o **Node.js** instalado (versão 18 ou superior).

Para verificar se já tem:
```bash
node -v
```

Se não tiver, baixe em: https://nodejs.org (escolha a versão LTS)

---

## Como rodar

### 1. Abra o terminal na pasta do projeto

No Windows: clique com botão direito dentro da pasta `fileview` → "Abrir no Terminal"
No Mac/Linux: abra o terminal e use `cd` para navegar até a pasta.

### 2. Instale as dependências (só na primeira vez)

```bash
npm install
```

Aguarde terminar (pode demorar 1-2 minutos na primeira vez).

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O terminal vai mostrar algo como:
```
  ➜  Local:   http://localhost:5173/
```

### 4. Abra no navegador

Acesse: **http://localhost:5173**

Para encerrar o servidor: pressione `Ctrl + C` no terminal.

---

## Como usar

### Abrir arquivos
- Clique em **"↑ Abrir arquivo"** na barra lateral
- Ou **arraste e solte** arquivos diretamente na janela (em qualquer lugar)
- Múltiplos arquivos podem ser abertos ao mesmo tempo

### Formatos suportados

| Formato | Visualização | Edição |
|---------|-------------|--------|
| `.md` | Renderizado bonito (igual ao Claude) | Editor rico WYSIWYG completo |
| `.json` | Árvore interativa com cores por tipo | Edição inline dos valores |
| `.csv` | Tabela com ordenação e filtros | Edição inline de células |
| `.pdf` | Renderização completa, navegação por páginas | — (somente leitura) |
| `.yaml` / `.yml` | Árvore estrutural | Edição no modo Texto |
| `.xml` | Árvore estrutural | Edição no modo Texto |
| `.svg` / `.txt` / `.log` / `.env` / `.toml` | Texto formatado | Editor de texto completo |

### Modos de visualização (aparece no canto superior direito)

**Para .md:**
- **Prévia** — renderização visual completa, como Claude renderiza
- **Editar** — editor WYSIWYG com toolbar completa
- **Fonte** — texto raw do Markdown

**Para .json / .yaml / .xml:**
- **Árvore** — visualização hierárquica interativa
- **Texto** — conteúdo bruto editável

**Para .csv:**
- **Tabela** — tabela interativa com filtros
- **Texto** — CSV bruto editável

### Editor Markdown (modo Editar)

A toolbar do editor inclui:

- **Títulos**: Parágrafo, Título 1, Título 2, Título 3, Título 4
- **Formatação**: Negrito, Itálico, Sublinhado, Tachado, Destaque, Código inline
- **Transformação de texto**: TUDO MAIÚSCULO, tudo minúsculo (selecione o texto primeiro)
- **Alinhamento**: Esquerda, Centro, Direita
- **Listas**: Com marcadores, Numerada, Tarefas (com checkbox)
- **Blocos**: Citação, Bloco de código (com syntax highlighting), Linha horizontal
- **Tabelas**: Inserir tabela 3×3, adicionar colunas/linhas, deletar tabela
- **Cores**: Seletor de cor para texto
- **Histórico**: Desfazer / Refazer
- **Menu flutuante**: Aparece ao selecionar texto (negrito, itálico, sublinhado, tachado, destaque)

### Salvar arquivos

Quando você edita um arquivo, um ponto laranja aparece ao lado do nome.
Clique em **"Salvar ↓"** no canto superior direito para baixar o arquivo atualizado.

### Editor JSON (modo Árvore)

- **Duplo clique** num valor para editar inline
- **Clique no triângulo** para expandir/colapsar nós
- Botões **Formatar** (prettify) e **Minificar** na toolbar
- Validação automática: mostra o erro de parsing se o JSON for inválido

### Tabela CSV

- **Duplo clique** numa célula para editar
- **Clique no cabeçalho** de uma coluna para ordenar
- Campo de **busca/filtro** no topo
- Botão **+ Linha** para adicionar nova linha
- Botão **✕** em cada linha para deletar

---

## Gerar versão final (build)

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos ficam em `dist/`. Você pode servir com qualquer servidor web estático.

Para testar o build localmente:
```bash
npm run preview
```

---

## Estrutura do projeto

```
fileview/
├── package.json              # Dependências do projeto
├── vite.config.js            # Configuração do Vite
├── index.html                # Ponto de entrada HTML
└── src/
    ├── main.jsx              # Inicialização do React
    ├── App.jsx               # Layout principal + tabs
    ├── App.css               # Estilos globais e design tokens
    ├── context/
    │   └── AppContext.jsx    # Estado global (arquivos abertos, modos)
    ├── components/
    │   ├── Sidebar.jsx       # Barra lateral com lista de arquivos
    │   ├── DropZone.jsx      # Tela de boas-vindas / drag-and-drop
    │   └── ViewerRouter.jsx  # Roteador de visualizadores por tipo
    ├── viewers/
    │   ├── MarkdownViewer.jsx  # Renderização MD → HTML bonito
    │   ├── JsonViewer.jsx      # Árvore interativa para JSON
    │   ├── CsvViewer.jsx       # Tabela interativa para CSV
    │   └── PdfViewer.jsx       # Leitor PDF com PDF.js
    └── editors/
        ├── MarkdownEditor.jsx  # Editor WYSIWYG Tiptap completo
        └── SourceEditor.jsx    # Editor de texto raw
```

---

## Dependências principais

| Biblioteca | Função |
|-----------|--------|
| `@tiptap/react` + extensões | Editor WYSIWYG Markdown |
| `tiptap-markdown` | Serialização MD ↔ Tiptap |
| `marked` | Renderização Markdown → HTML |
| `papaparse` | Parser de CSV |
| `pdfjs-dist` | Renderização de PDF no browser |
| `lowlight` | Syntax highlighting nos blocos de código |
| `lucide-react` | Ícones |

---

## Possíveis próximas funcionalidades

- [ ] Suporte a `.xlsx` (planilhas Excel) via SheetJS
- [ ] Export de Markdown para PDF
- [ ] Busca dentro do documento (Ctrl+F)
- [ ] Anotações em PDF
- [ ] Temas claro/escuro alternáveis
- [ ] Versão desktop com Electron (abrir arquivos diretamente do SO)
- [ ] Histórico de arquivos recentes
