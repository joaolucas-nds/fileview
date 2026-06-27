# HISTORICO.md — Conhecimento Consolidado

> Arquivo-baú para conhecimento denso já aprendido e estável.
> Lido sob demanda, não no início de sessão.

---

## 1. Análise de Viabilidade Técnica e de Mercado (2026-05)

Pesquisa realizada antes de construir o projeto. Resultado também disponível como relatório HTML interativo (`file_viewer_viability_report.html` na raiz do projeto).

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

**Markdown — altíssima.** `marked` para preview; Tiptap/ProseMirror para WYSIWYG. Todas as features da toolbar são nativas ou extensões do Tiptap.

**JSON — alta.** Tree view interativo é o padrão de mercado. Componente recursivo customizado é mais controlável que bibliotecas desatualizadas. Table View para arrays de objetos é bônus viável.

**PDF — alta para visualizar; inviável para editar conteúdo.** `pdfjs-dist` (Mozilla, 4M downloads/semana) resolve visualização. Edição de conteúdo existente exige engine proprietária paga. Anotações overlay via `pdf-lib` são possíveis no futuro.

**CSV — alta.** `papaparse` é o parser CSV mais robusto do JS. Tabela com sort/filter/edit é straightforward.

**Outros (YAML, XML, .env, .toml, .log, .svg, .txt) — alta para texto.** SourceEditor cobre todos com textarea dark.

**DOCX — média para visualizar** (`mammoth.js`), **baixa para editar fielmente**.

### Stack escolhida e rationale
- **React + Vite** — melhor DX para SPA client-side; lazy loading out-of-box
- **Tiptap v2** — engine ProseMirror com DX superior; mesmo stack do Notion e Linear
- **pdfjs-dist** — padrão de mercado para PDF no browser; usado internamente no Firefox
- **Papa Parse** — parser CSV mais robusto do JS; sem dependências
- **Componente JSON customizado** — controle total; bibliotecas disponíveis são desatualizadas

### Estimativa de esforço (realizada)
- F1 MVP (4 formatos): 1 sessão de geração de código assistida ✓
- F2 Estabilidade: ~3 sessões ✓ (em andamento — bugs corrigidos, deploy funcionando)
- F3 Novos formatos: ~1 sessão por formato
- F4 Desktop/Electron: ~2-3 sessões

---

## 2. Decisão sobre Context API vs Zustand (2026-06-05)

Context API foi escolhida sobre Zustand/Redux pela simplicidade — o estado tem uma hierarquia linear (`files[]` + `activeId` + `modes{}`), sem necessidade de selectors complexos ou middleware. Re-renders são aceitáveis dado o volume de dados (tipicamente < 20 arquivos abertos simultaneamente).

Se o projeto crescer para casos de uso com centenas de arquivos ou estado muito granular por célula (ex: seleção de múltiplas células no CSV), migrar para Zustand seria a próxima decisão arquitetural natural.

---

## 3. Por que o GitHub Pages ficava em branco (2026-06-25)

Dois problemas sobrepostos que juntos causavam a página em branco sem nenhum erro óbvio:

**Problema 1 — `base` ausente no Vite:** sem `base: './'` em `vite.config.js`, o Vite gera URLs absolutas para os assets no build (ex: `<script src="/assets/index-abc.js">`). Em deploy local ou no domínio raiz funciona. Em subpasta (ex: `usuario.github.io/fileview/`), o browser tenta carregar `usuario.github.io/assets/index-abc.js` — que não existe — e o JavaScript nunca carrega. Página em branco, nenhum erro no terminal.

**Problema 2 — código-fonte servido sem build:** o GitHub Pages, quando configurado para servir de um branch/pasta com o código-fonte, tenta entregar os arquivos `.jsx` e `vite.config.js` diretamente como HTML/JS. O browser recebe JSX bruto, não consegue interpretá-lo e exibe uma página em branco.

**Solução completa:** `base: './'` no vite.config.js + `.github/workflows/deploy.yml` que faz o build no servidor do GitHub e publica apenas o `dist/` — nunca o código-fonte. Em GitHub Settings → Pages → Source: selecionar "GitHub Actions" (não uma branch).
