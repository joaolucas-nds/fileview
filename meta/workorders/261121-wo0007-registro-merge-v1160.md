# WO 0007 — registrar o merge do KCM v1.160.1 (STATUS honesto, IDEAS) e versionar o que o chat gravou

> **Tipo:** WO de DOC (registro).
> **Config sugerida:** Sonnet, `/effort low`.
> **Pre-requisito:** escrita sobre `08aff46`. `git status --short` ao comecar: so os arquivos do chat abaixo (modificados ou novos) + `.claude/settings.json` + esta WO.
> **Base:** merge do KCM v1.160.1 aprovado pelo dono em 2026-11-21 (inventarios de fusao, SETUP.md, licenca MIT).
> **Arquivos que o chat gravou no disco e esta WO versiona** (sha1 medido ao gravar; Edicao 0 confere — diferente = PARE):
>   - `meta/CEREBRO.md` — `7a37fccf52da576ba60299151e291e9200659fb7`
>   - `meta/GUIA-DO-KIT.md` — `520c89ad510835080582cd2044d140706cb130c6`
>   - `INSTRUCOES-DO-PROJETO.md` — `106d553b964c3e9303299c43e59a0b6d45d25de4`
>   - `meta/CONTEXT.md` — `662430e9624d4af1a55ca6fdae8c2384e3f38d32`
>   - `meta/LOG-TEMPLATE.md` — `29868af33000d2165aea24ca6d364697e4263447`
>   - `meta/SETUP.md` — `b023303f03537ace3f0357fcfe1d6bb33fe35fc5`
>   - `LICENSE` — `0d00c40dd8afddd2193df521e0af23d0526815e3`
>   - `.gitignore` — `1575ebfc52a7e7409dc4b766090ac4eb44d5a796`
>   - `.claude/skills/apply-wo/SKILL.md` — `768470b6afc5d6887f92a932ed11da40a7bfbaeb`
>   - `.claude/skills/wrap/SKILL.md` — `3863088e14c698e9a868ac92c1f53f3461969fc2`
>   - `.claude/skills/sondar/SKILL.md` — `6064ed5f96d3b73045834641ba6addc0510535f0`
>   - `meta/workorders/_TEMPLATE.md` — `bccfe97e79d1220a82f573575d1fe37cdd117241`
>   - `logs/2026-11-21.md` — `c99c6eb9dbac13735005e474e5c74334d70d6a42`
>   - `.claude/settings.json` — `6271e6fba59a05cb495ff1f8ceaf41209f583b7d` (o chat o entrega inteiro: o Code nao edita as proprias permissoes; so versione)
> **Ancora semantica:** ancora que nao bater EXATAMENTE = PARE e reporte.
> **Idempotencia:** texto novo inteiro presente e ancora ausente = ja aplicada (PULE e diga). Formas «trocar» (texto novo contem a ancora): 2, 3.
> **Ancoras lidas em:** recortadas por script, neste turno, sobre `08aff46`: `meta/STATUS.md` (1), `meta/IDEAS.md` (2, 3 — a 3 e a ultima linha nao vazia do arquivo). O trecho literal de cada uma e o bloco **Ancora**. Simulado a partir do texto desta WO: ancora = 1 ocorrencia.
> **Cercas:** ancora e texto novo vao em cerca de QUATRO crases (molde v1.160.1) — delimite por elas.
> **Proximo comando:** nenhum.

> **Canal dos meta neste ciclo = CODE** para STATUS e IDEAS; o resto o chat ja gravou — so confira o hash e versione.

---

## 1. Por que

O merge do KCM v1.160.1 foi gravado pelo chat (fusao do CEREBRO e das Instrucoes, GUIA-DO-KIT novo, skills e molde de WO do pacote, CONTEXT com «Build e validacao», SETUP.md, LICENSE MIT). Faltam os registros do Code: o topo do STATUS diz «conferencia na tela pendente» para a 0.1.10, que o dono conferiu 7/7 em 2026-11-20; e o IDEAS ganha o feedback para o kit e o rodape do molde novo.

---

## Edicao 0 — conferir hashes

````
sha1sum meta/CEREBRO.md meta/GUIA-DO-KIT.md INSTRUCOES-DO-PROJETO.md meta/CONTEXT.md meta/LOG-TEMPLATE.md meta/SETUP.md LICENSE .gitignore .claude/skills/apply-wo/SKILL.md .claude/skills/wrap/SKILL.md .claude/skills/sondar/SKILL.md meta/workorders/_TEMPLATE.md logs/2026-11-21.md .claude/settings.json
````

## Edicao 1 — `meta/STATUS.md` · 0.1.10 conferida

**Substituir.** Ancora:

````
**[0.1.10]** — 2026-11-17 — Fase 1 da grade (DEC-013): fechar com alteração não salva pergunta; CSV com lixeira + Desfazer, «+ Linha» visível com filtro, 3º clique tira a ordenação; CSV e JSON regravam no formato do arquivo (fim de linha, recuo, quebra final). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-17).
````

**Por:**

````
**[0.1.10]** — 2026-11-17 — Fase 1 da grade (DEC-013): fechar com alteração não salva pergunta; CSV com lixeira + Desfazer, «+ Linha» visível com filtro, 3º clique tira a ordenação; CSV e JSON regravam no formato do arquivo (fim de linha, recuo, quebra final). Build verde; **conferido na tela pelo dono em 2026-11-20: 7/7 ok.**
````

## Edicao 2 — `meta/IDEAS.md` · feedback para o Kit (merge v1.160.1)

**Substituir (a ancora fica, as linhas novas entram depois).** Ancora:

````
- **2026-11-10 — Custo do CEREBRO v1.135.0:** ~106 KB contra ~36 KB do anterior. É lido sob demanda (as Instruções são o que roda todo turno), mas o tamanho torna a comparação bloco a bloco cara; um índice de seções no topo ajudaria.
````

**Por:**

````
- **2026-11-10 — Custo do CEREBRO v1.135.0:** ~106 KB contra ~36 KB do anterior. É lido sob demanda (as Instruções são o que roda todo turno), mas o tamanho torna a comparação bloco a bloco cara; um índice de seções no topo ajudaria.
- **2026-11-21 — O índice de seções no topo do CEREBRO (v1.160.1) resolve o ponto acima:** comparar seção a seção ficou barato; a fusão saiu mecânica (base do pacote + transplante) e o inventário mediu-se por script (linhas do pacote ausentes no resultado: 1, o marcador «(vazio)»).
- **2026-11-21 — O CEREBRO e as Instruções da v1.160.1 vieram SEM a linha do sistema operacional** (Windows/CMD) que o pacote da v1.135.0 trazia — parece que a escolha do SO não entrou na geração. Transplantada do vivo; vale conferir no gerador.
- **2026-11-21 — A regra «o que sai para caber no teto sai do transplante, nunca do pacote» pegou um corte do próprio chat:** no merge da v1.135.0 a linha «Entregáveis de repo» do pacote tinha saído das Instruções para caber as linhas próprias. Voltou nesta fusão.
````

## Edicao 3 — `meta/IDEAS.md` · rodape «Fim do IDEAS»

**Substituir (a ancora fica, o rodape entra depois).** Ancora:

````
- **2026-11-07 — `261107-asu0004.yaml`: primeiro ASU que patcha Markdown e docs rolantes (STATUS/IDEAS).** Estratégias: `replace_line_pattern` (usando `.+`/`.*` no lugar de ã/—/box-drawing nas âncoras), `replace_context_block`, `insert_before_pattern`/`insert_after_pattern` e um `occurrence: 1` consciente (FIX-001, cujo `**Data:**` repete no FIX-002). A sandbox não tinha o mount: simulei contra cópias em disco de só 3 dos 5 arquivos. **Não verificado contra a ferramenta real:** (a) `replace_line_pattern` com `new_content` de várias linhas; (b) newline final em `insert_*`; (c) `insert_after_pattern` na última linha do arquivo (IDEAS). Conferir no dry-run e anotar aqui o resultado.
````

**Por:**

````
- **2026-11-07 — `261107-asu0004.yaml`: primeiro ASU que patcha Markdown e docs rolantes (STATUS/IDEAS).** Estratégias: `replace_line_pattern` (usando `.+`/`.*` no lugar de ã/—/box-drawing nas âncoras), `replace_context_block`, `insert_before_pattern`/`insert_after_pattern` e um `occurrence: 1` consciente (FIX-001, cujo `**Data:**` repete no FIX-002). A sandbox não tinha o mount: simulei contra cópias em disco de só 3 dos 5 arquivos. **Não verificado contra a ferramenta real:** (a) `replace_line_pattern` com `new_content` de várias linhas; (b) newline final em `insert_*`; (c) `insert_after_pattern` na última linha do arquivo (IDEAS). Conferir no dry-run e anotar aqui o resultado.

---

> **Fim do IDEAS.** Acréscimo entra sob o título da seção certa, nunca aqui embaixo: o fim do arquivo é a seção de feedback, e o que cai nela se perde do lugar dele.
````

---

## Fora de escopo

- Nada de produto. A fase 2 da grade vem na proxima WO.
- Nao editar CEREBRO, GUIA, Instrucoes, CONTEXT, SETUP, LICENSE, skills nem `settings.json` — sao do chat (so versionar).

## Depois de aplicar — conferencia antes do commit

- [ ] `git status --short` → exatamente 17 entradas: `M .claude/settings.json`, `M .claude/skills/apply-wo/SKILL.md`, `M .claude/skills/sondar/SKILL.md`, `M .claude/skills/wrap/SKILL.md`, `M .gitignore`, `M INSTRUCOES-DO-PROJETO.md`, `M meta/CEREBRO.md`, `M meta/CONTEXT.md`, `M meta/IDEAS.md`, `M meta/LOG-TEMPLATE.md`, `M meta/STATUS.md`, `M meta/workorders/_TEMPLATE.md`, `?? LICENSE`, `?? logs/2026-11-21.md`, `?? meta/GUIA-DO-KIT.md`, `?? meta/SETUP.md`, `?? meta/workorders/261121-wo0007-registro-merge-v1160.md`. Qualquer outra: PARE.
- [ ] Saldo de linhas (`wc -l`, simulado a partir deste texto): `meta/IDEAS.md` 123 → 130 (+7) · `meta/STATUS.md` 50 → 50 (+0). Saldo diferente = VERMELHO.
- [ ] Carimbos (unidade = arquivos): `grep -l "Gerado pelo Kit de Contexto Universal v1.160.1" meta/CEREBRO.md meta/GUIA-DO-KIT.md .claude/skills/*/SKILL.md meta/workorders/_TEMPLATE.md | wc -l` → 6.
- [ ] `grep -c "^\*\*\[0.1.10\]\*\*.*7/7 ok" meta/STATUS.md` → 1 · `grep -c "^> \*\*Fim do IDEAS\.\*\*" meta/IDEAS.md` → 1.
- [ ] `python -c "import json;json.load(open('.claude/settings.json'))"` (ou equivalente) → sem erro: JSON invalido desliga TODAS as permissoes em silencio.
- [ ] So doc: sem build; a rede e o `git diff`. Esta conferencia responde «esta la?»; «o texto presta?» e do chat, que o escreveu.

## Relatorio de aplicacao *(quem aplica preenche ao terminar)*

O de sempre, depois do push. Grave em `../AAMMDD-HHMM-code-fileview-apply-wo0007.txt` (`date +%y%m%d-%H%M`).

## Commit — blocos separados, mensagem SEM acento

````
git add .claude/settings.json .claude/skills .gitignore INSTRUCOES-DO-PROJETO.md LICENSE logs/2026-11-21.md meta/CEREBRO.md meta/CONTEXT.md meta/GUIA-DO-KIT.md meta/IDEAS.md meta/LOG-TEMPLATE.md meta/SETUP.md meta/STATUS.md meta/workorders/_TEMPLATE.md meta/workorders/261121-wo0007-registro-merge-v1160.md
````

````
git commit -m "docs(kit): merge do KCM v1.160.1 (wo0007)" -m "CEREBRO e Instrucoes fundidos sobre a base do pacote; GUIA-DO-KIT novo; skills e molde de WO do pacote; CONTEXT com a rede do projeto; SETUP.md; LICENSE MIT; STATUS honesto sobre a 0.1.10."
````

````
git push
````

*Gerado pelo Kit de Contexto Universal v1.160.1 — 2026-11-21 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
