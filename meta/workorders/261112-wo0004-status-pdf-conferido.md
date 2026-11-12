# WO 0004 — STATUS: registrar a conferencia na tela da 0.1.8

> **Tipo:** WO de DOC (registro).
> **Config sugerida:** Sonnet, `/effort low`.
> **Pre-requisito:** escrita sobre `1ca0b1e`, arvore limpa exceto os 2 arquivos do chat abaixo.
> **Base:** roteiro do dono para a 0.1.8 — 6/6 ok (`[relatado pelo dono]`, 2026-11-12).
> **Arquivos que o chat gravou no disco e esta WO versiona:** `logs/2026-11-12.md` — `d3c084766ffbeed8832a83f5b48ff090b70108cb` (Edicao 0: `sha1sum logs/2026-11-12.md`; diferente = PARE).
> **Ancora semantica:** ancora que nao bater EXATAMENTE = PARE e reporte.
> **Idempotencia:** texto novo inteiro presente e ancora ausente = ja aplicada; PULE e diga.
> **Ancoras lidas em:** `meta/STATUS.md` sobre `1ca0b1e`, recortadas por script neste turno (o bloco **Ancora** de cada edicao e o trecho literal). Simulado: ancora = 1 ocorrencia nas duas; saldo 0 linha.

> **Canal dos meta neste ciclo = CODE.**

---

## 1. Por que

A 0.1.8 foi conferida na tela pelo dono (6/6). O STATUS ainda diz «conferencia na tela pendente» em dois lugares.

## Edicao 1 — `meta/STATUS.md` · 0.1.8 conferida

**Substituir.** Ancora:

```
**[0.1.8]** — 2026-11-11 — PDF no visualizador nativo do navegador (`<iframe>`), sem `pdfjs-dist` (DEC-012). Build verde; **conferência na tela pendente** (roteiro do dono, conversa de 2026-11-11).
```

**Por:**

```
**[0.1.8]** — 2026-11-11 — PDF no visualizador nativo do navegador (`<iframe>`), sem `pdfjs-dist` (DEC-012). Build verde; **conferido na tela pelo dono em 2026-11-12: 6/6 ok.**
```

## Edicao 2 — `meta/STATUS.md` · Em Progresso sem pendencia

**Substituir.** Ancora:

```
- Nada em andamento no produto. A 0.1.8 (DEC-012) está no ar; falta a conferência na tela pelo dono. **Volta atrás combinada:** se o visual nativo não agradar, a opção C (abrir o PDF numa aba nova do navegador) está registrada em IDEAS → Adiadas.
```

**Por:**

```
- Nada em andamento no produto. **Volta atrás combinada:** se o visual nativo do PDF não agradar, a opção C (abrir o PDF numa aba nova do navegador) está registrada em IDEAS → Adiadas.
```

---

## Fora de escopo

- Nada alem destas duas linhas. A secao «Ultima conversa» fica para o `/wrap`, se voce o rodar.

## Depois de aplicar — conferencia antes do commit

- [ ] `git status --short` → exatamente: `?? logs/2026-11-12.md`, `M meta/STATUS.md`, `?? meta/workorders/261112-wo0004-status-pdf-conferido.md`.
- [ ] `wc -l meta/STATUS.md` antes e depois: igual (saldo 0).
- [ ] `grep -c "^\*\*\[0.1.8\]\*\*.*pendente" meta/STATUS.md` → 0 (as 2 linhas de «Última conversa» que ainda dizem «conferência na tela pendente» são relato das wo0002/wo0003 e FICAM) · `grep -c "^\*\*\[0.1.8\]\*\* .*6/6 ok" meta/STATUS.md` → 1 (unidade = linhas).
- [ ] So doc: sem build; a rede e o `git diff`.

## Relatorio de aplicacao

O de sempre (feito · desvios · arquivos · conferencias com comando · commit e push), depois do push. Grave em `../AAMMDD-HHMM-code-fileview-apply-wo0004.txt` (`date +%y%m%d-%H%M`).

## Commit — blocos separados, mensagem SEM acento

```
git add meta/STATUS.md logs/2026-11-12.md meta/workorders/261112-wo0004-status-pdf-conferido.md
```

```
git commit -m "docs(meta): registra conferencia na tela da 0.1.8 (wo0004)"
```

```
git push
```

*Gerado pelo Kit de Contexto Universal v1.135.0 — 2026-11-10 — esta linha e do KIT: nao funda, substitua pela do pacote mais recente.*
