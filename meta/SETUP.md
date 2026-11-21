# SETUP.md — Guia de Ambiente

> **Opcional, para o humano.** Como instalar, configurar e rodar o projeto do zero nesta máquina, e o que já deu errado. **Não entra no ritual de leitura** do assistente: ele o consulta quando o assunto é ambiente, e acrescenta aqui o passo que resolveu um bloqueio.

---

## Pré-requisitos
- **Node.js + npm.** O deploy (GitHub Actions) usa **Node 24** (`.github/workflows/deploy.yml`). A versão instalada na máquina do dono não foi medida — confira com `node -v`.
- **Git com chave SSH para o GitHub:** o remoto é `git@github.com:joaolucas-nds/fileview.git`.
- **Chrome** para usar e testar (o PDF usa o visualizador nativo dele, DEC-012).
- **Claude Code** (raia de execução), se for aplicar WOs.

## Instalar
1. `git clone git@github.com:joaolucas-nds/fileview.git`
2. `cd fileview`
3. `npm ci` — instala exatamente o `package-lock.json`. Se der conflito de dependências entre pacotes do Tiptap: `npm install --legacy-peer-deps`.

## Rodar
- **Desenvolvimento:** `npm run dev` → `http://localhost:5173`. Servidor fica rodando: feche ao terminar.
- **Build (a rede deste projeto, ver CONTEXT, «Build e validação»):** `npm run build` → `dist/`.
- **Conferir o build localmente:** `npm run preview`.
- **Publicar:** `git push` na `main` — o GitHub Actions builda e publica em `https://joaolucas-nds.github.io/fileview/`.

## Configurar
- Nenhuma variável de ambiente e nenhum `.env`.
- GitHub → Settings → Pages → Source = **GitHub Actions** (não «Deploy from a branch») — DEC-007.
- `vite.config.js` precisa de `base: './'` para o Pages achar os arquivos.
- Claude Code: `.claude/settings.json` é versionado (permissões do projeto); `.claude/settings.local.json` é da máquina e fica fora do Git.

## Já deu errado (e como saiu)
- **[2026-06-25] GitHub Pages em branco** — duas causas juntas: faltava `base: './'` no Vite, e o Pages servia o código-fonte direto do branch → `base: './'` + workflow de build + Source = GitHub Actions; se ficar preso em cache, alternar Source para branch e voltar. Detalhe em DEC-007 e HISTORY §3.
- **[2026-11-10] O chat (VM Linux) não alcança o remoto SSH** (`Host key verification failed`) → `pull`/`push` ficam com o dono ou o Claude Code.
- **[2026-11] Aviso «LF will be replaced by CRLF» no `git add`** — é o `core.autocrlf` do Git no Windows; inofensivo, o repositório guarda LF.
- **[2026-11] Aviso de chunk > 500 kB no build** — o `MarkdownEditor` (Tiptap) é grande; aviso preexistente, não é erro.
