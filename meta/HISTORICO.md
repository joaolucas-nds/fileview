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

**Markdown — altíssima.** `marked` para preview; Tiptap/ProseMirror para WYSIWYG. Todas as features da toolbar são nativas ou extensões do Tiptap. Único ponto médio: font-size e tipografia arbitrária não serializam bem para .md puro.

**JSON — alta.** Tree view interativo é o padrão de mercado. Componente recursivo customizado é mais controlável que bibliotecas desatualizadas. Table View para arrays de objetos é bônus viável com detecção automática de schema.

**PDF — alta para visualizar; inviável para editar conteúdo.** `pdfjs-dist` (Mozilla, 4M downloads/semana) resolve visualização. Edição de conteúdo existente exige engine proprietária paga. Anotações overlay via `pdf-lib` são possíveis no futuro.

**CSV — alta.** `papaparse` é o parser CSV mais robusto do JS. Tabela com sort/filter/edit é straightforward.

**Outros (YAML, XML, .env, .toml, .log, .svg, .txt) — alta para texto.** SourceEditor cobre todos. Viewers específicos são bônus futuros de baixo custo.

**DOCX — média para visualizar** (`mammoth.js` converte .docx → HTML), **baixa para editar fielmente** (estrutura interna complexa demais para fidelidade no browser).

### Stack escolhida e rationale
- **React + Vite** — melhor DX para SPA client-side; lazy loading out-of-box
- **Tiptap v2** — engine ProseMirror com DX superior; mesmo stack do Notion e Linear
- **pdfjs-dist** — padrão de mercado para PDF no browser; usado internamente no Firefox
- **Papa Parse** — parser CSV mais robusto do JS; sem dependências
- **Componente JSON customizado** — controle total; bibliotecas disponíveis são desatualizadas

### Estimativa de esforço (realizada)
- F1 MVP (4 formatos): 1 sessão de geração de código assistida ✓
- F2 Estabilidade: ~2-3 sessões *(em andamento)*
- F3 Novos formatos: ~1 sessão por formato
- F4 Desktop/Electron: ~2-3 sessões

---

## 2. Decisão sobre Context API vs Zustand (2026-06-05)

Context API foi escolhida sobre Zustand/Redux pela simplicidade — o estado tem uma hierarquia linear (`files[]` + `activeId` + `modes{}`), sem necessidade de selectors complexos ou middleware. Re-renders são aceitáveis dado o volume de dados (tipicamente < 20 arquivos abertos simultaneamente).

Se o projeto crescer para casos de uso com centenas de arquivos ou estado muito granular por célula (ex: seleção de múltiplas células no CSV), migrar para Zustand seria a próxima decisão arquitetural natural.

---

## 3. Causa raiz do GitHub Pages em branco (2026-06-25)

O Vite sem configuração de `base` gera URLs absolutas para assets no build (`/assets/index-abc123.js`). Em um deploy local ou em `username.github.io` (root), isso funciona. Em `username.github.io/fileview/` (subpasta), o browser tenta carregar `username.github.io/assets/index-abc123.js` — que não existe — e o JavaScript nunca carrega, resultando em página em branco sem nenhum erro óbvio no terminal.

A solução `base: './'` faz o Vite gerar URLs relativas (`./assets/index-abc123.js`), que funcionam corretamente independente do caminho de deploy. Alternativa mais explícita: `base: '/nome-do-repo/'`.
