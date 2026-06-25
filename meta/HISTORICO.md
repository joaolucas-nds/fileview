# HISTORICO.md — Conhecimento Consolidado

> Arquivo-baú para conhecimento denso já aprendido e estável.
> Lido sob demanda, não no início de sessão.

---

## 1. Análise de Viabilidade Técnica e de Mercado (2026-05)

Pesquisa realizada antes de construir o projeto. Resultado também disponível como relatório HTML interativo (`file_viewer_viability_report.html` na raiz do projeto, com abas por formato).

### Conclusão de mercado
Não existe ferramenta **gratuita + open-source** que combine Markdown WYSIWYG, JSON visual, PDF e CSV numa interface só com boa usabilidade. As melhores ferramentas existentes são especializadas:

| Ferramenta | Formato | Modelo |
|---|---|---|
| Typora | MD WYSIWYG | Pago |
| MarkText | MD WYSIWYG | Open source |
| Obsidian | MD (notas) | Freemium |
| JSON Editor Online | JSON | Gratuito |
| JSON Hero | JSON (visual) | Gratuito |
| StackEdit | MD (web) | Open source |

### Viabilidade por formato (resumo)

**Markdown — altíssima.** `marked` para preview; Tiptap/ProseMirror para WYSIWYG. Todas as features da toolbar são nativas ou extensions do Tiptap. Único ponto médio: font-size e tipografia arbitrária não serializam bem para .md puro (aceitável — é feature do viewer, não do formato).

**JSON — alta.** Tree view interativo é o padrão de mercado. Componente recursivo customizado é mais controlável que bibliotecas desatualizadas (react-json-view sem manutenção). Table View para arrays de objetos é bônus viável com detecção automática de schema.

**PDF — alta para visualizar; inviável para editar conteúdo.** `pdfjs-dist` (Mozilla, 4M downloads/semana, usado no Firefox) resolve visualização. Edição de conteúdo existente exige engine proprietária paga — fora do escopo. Anotações overlay via `pdf-lib` são possíveis no futuro.

**CSV — alta.** `papaparse` é o parser CSV mais robusto do JS. Tabela com sort/filter/edit é straightforward.

**Outros (YAML, XML, .env, .toml, .log, .svg, .txt) — alta para texto.** SourceEditor cobre todos com textarea dark. Viewers específicos (ex: YAML como árvore via `js-yaml`) são bônus futuros de baixo custo.

**DOCX — média para visualizar** (`mammoth.js` converte .docx → HTML com boa fidelidade), **baixa para editar fielmente** (estrutura interna do .docx é complexa demais para manter fidelidade de edição no browser).

### Stack escolhida e rationale
- **React + Vite** — melhor DX para SPA client-side; ecossistema rico; lazy loading out-of-box
- **Tiptap v2** — engine ProseMirror com DX superior; mesmo stack do Notion e Linear; extensível sem custo
- **pdfjs-dist** — padrão de mercado para PDF no browser; sem servidor necessário
- **Papa Parse** — parser CSV mais robusto do JS; sem dependências
- **Componente JSON customizado** — controle total sobre design; bibliotecas disponíveis são desatualizadas

### Estimativa de esforço (realizada)
- F1 MVP (4 formatos): 1 sessão de geração de código assistida ✓
- F2 Estabilidade: ~2-3 sessões
- F3 Novos formatos: ~1 sessão por formato
- F4 Desktop/Electron: ~2-3 sessões

---

## 2. Decisão sobre Context API vs Zustand (2026-06-05)

Context API foi escolhida sobre Zustand/Redux pela simplicidade — o estado tem uma hierarquia linear (`files[]` + `activeId` + `modes{}`), sem necessidade de selectors complexos ou middleware. Re-renders são aceitáveis dado o volume de dados (tipicamente < 20 arquivos abertos simultaneamente).

Se o projeto crescer para casos de uso com centenas de arquivos abertos ou estado muito granular por célula (ex: seleção de múltiplas células no CSV), migrar para Zustand seria a próxima decisão arquitetural natural.
