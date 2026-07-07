# HISTORY.md — Conhecimento Consolidado

> Arquivo-baú para conhecimento denso já aprendido e estável.
> Lido sob demanda, não no início de sessão.
> **Renomeado de `HISTORICO.md` em 2026-07-03** (DEC-009) — mesmo conteúdo, só o nome muda, para alinhar com a convenção "nomes de arquivo em inglês" já usada no resto do projeto. Apague o `HISTORICO.md` antigo do Projeto Claude depois de subir este.

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
- F2 Estabilidade: ~4 sessões ✓ (bugs corrigidos, deploy funcionando, JSON formulário completo)
- F3 Novos formatos: ~1 sessão por formato
- F4 Desktop/Electron: ~2-3 sessões

---

## 2. Decisão sobre Context API vs Zustand (2026-06-05)

Context API foi escolhida sobre Zustand/Redux pela simplicidade — o estado tem uma hierarquia linear (`files[]` + `activeId` + `modes{}`), sem necessidade de selectors complexos ou middleware. Re-renders são aceitáveis dado o volume de dados (tipicamente < 20 arquivos abertos simultaneamente).

Se o projeto crescer para casos de uso com centenas de arquivos ou estado muito granular por célula (ex: seleção de múltiplas células no CSV), migrar para Zustand seria a próxima decisão arquitetural natural.

---

## 3. Por que o GitHub Pages ficava em branco (2026-06-25 a 2026-06-27)

Dois problemas sobrepostos que juntos causavam a página em branco sem nenhum erro óbvio, mais um terceiro problema de cache descoberto depois da correção dos dois primeiros:

**Problema 1 — `base` ausente no Vite:** sem `base: './'` em `vite.config.js`, o Vite gera URLs absolutas para os assets no build (ex: `<script src="/assets/index-abc.js">`). Em deploy local ou no domínio raiz funciona. Em subpasta (ex: `usuario.github.io/fileview/`), o browser tenta carregar `usuario.github.io/assets/index-abc.js` — que não existe — e o JavaScript nunca carrega. Página em branco, nenhum erro no terminal.

**Problema 2 — código-fonte servido sem build:** o GitHub Pages, quando configurado para servir de um branch/pasta com o código-fonte, tenta entregar os arquivos `.jsx` e `vite.config.js` diretamente como HTML/JS. O browser recebe JSX bruto, não consegue interpretá-lo e exibe uma página em branco.

**Solução para os dois:** `base: './'` no vite.config.js + `.github/workflows/deploy.yml` que faz o build no servidor do GitHub e publica apenas o `dist/` — nunca o código-fonte. Em GitHub Settings → Pages → Source: selecionar "GitHub Actions" (não uma branch).

**Problema 3 (descoberto em 2026-06-27, depois da correção acima):** mesmo com o workflow correto e o build passando no log do Actions ("442 modules transformed... built in 4.21s"), o site continuou em branco. Diagnóstico pelo console do browser (F12): erro `GET https://usuario.github.io/src/main.jsx 404` — ou seja, o Pages ainda estava servindo o `index.html` do código-fonte (que referencia `/src/main.jsx` diretamente), não o `index.html` gerado pelo build em `dist/`. Causa provável: o GitHub Pages tinha ficado "preso" numa configuração de publicação anterior (cache de CDN). **Solução:** em Settings → Pages, alternar Source de "GitHub Actions" para "Deploy from a branch" e imediatamente de volta para "GitHub Actions" — isso força o Pages a reconfigurar do zero. Em seguida, disparar manualmente o workflow (aba Actions → "Run workflow"). Depois disso, o site passou a funcionar corretamente.

**Lição geral:** um workflow de deploy verde no Actions NÃO garante que o Pages está servindo o conteúdo certo — o cache/CDN do GitHub Pages pode ficar dessincronizado da fonte configurada. Se o site continuar em branco após confirmar que o build está correto, suspeitar do Pages, não do workflow.

---

## 4. Adoção da atualização do Kit de Contexto Universal — KCM (2026-07-03)

O sistema de documentação deste projeto (`meta/CEREBRO.md` + os demais docs) é gerado e mantido por um kit de templates externo que evolui com o tempo. Em 2026-07-03, uma atualização do kit foi trazida ao Projeto (arquivos `*__template-update.md`/`.txt`) para comparação e adoção.

**Processo seguido:** leitura completa e comparação linha a linha entre a versão em uso do `CEREBRO.md` (227 linhas) e a versão nova (240 linhas), e entre as Instruções do Projeto em uso e o template novo (`instrucoes-dev__template-update.txt`). O registro completo da decisão está em DEC-009 (DECISIONS.md) — aqui fica só o resumo de conhecimento consolidado, para consulta futura sem precisar reler o DEC inteiro.

**O que mudou de fato no comportamento do assistente a partir desta data:**
- Recomendação explícita de configuração (modelo/esforço/pensamento) ao fim de cada sessão.
- Formalização por escrito de que docs rolantes (STATUS/CHANGELOG/IDEAS/HISTORY) são sempre entregues como arquivo inteiro, nunca como patch ASU — já era a prática, agora está documentado.
- Distinção explícita entre "editar arquivo existente" (patch ASU) e "arquivo novo" (entregar pronto para baixar, nunca embutido em YAML).
- `HISTORICO.md` renomeado para `HISTORY.md` (este arquivo).

**O que foi deliberadamente mantido divergente do kit (e por quê):** a nomenclatura dos arquivos ASU deste projeto (`AAAA-MM-DD_NNN_descricao.yaml`) diverge do padrão sugerido pela atualização (`AAMMDD-asuNNNN.yaml`). Foi um pedido explícito do usuário em 2026-06-27, já em uso em 3 ASUs reais, e inclui uma descrição legível no nome do arquivo — vantagem real de auditoria que o padrão compacto do kit não tem. Mantido como está; ver DEC-009 para a pergunta em aberto sobre se isso deve mudar no futuro.

**Padrão observado, útil para próximas atualizações do kit:** o kit tende a formalizar por escrito práticas que um projeto maduro já adota na prática (ex.: a distinção de escopo do ASU já era seguida aqui antes de virar regra explícita). Isso sugere que acompanhar atualizações do kit é mais sobre confirmar/documentar boas práticas emergentes do que sobre mudanças disruptivas — reduz o risco de tratar cada atualização como algo que exige grande retrabalho.
