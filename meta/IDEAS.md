# IDEAS.md — Brainstorm e Visão

> Segundo cérebro do projeto. Captura tudo, mesmo solto ou no meio de outro assunto.
> **Nunca perde:** ideia implementada → Concluídas; descartada → Descartadas com motivo.

---

## 💡 Ideias Ativas — Usuário

### 2026-06 — CSV: mais prático, eficiente e intuitivo
A tabela atual funciona mas não é fluida como planilha real. Melhorias desejadas: ~~Tab para mover entre células~~ (implementado em 2026-07-07, ver Concluídas), seleção de múltiplas células, copiar/colar bloco de células, resize de colunas arrastando o header, freeze de linha de cabeçalho (já tem) e possível freeze da primeira coluna. Itens ainda em aberto: seleção múltipla, copiar/colar bloco, resize de coluna, freeze da primeira coluna.

### 2026-11-10 — Abas: fechar com o botão do meio do mouse
`[relatado pelo dono]` Como nas abas do navegador: clique do meio numa aba (e no item da Sidebar) fecha o arquivo. Mesma regra do ✕ atual — arquivo com alteração não salva precisa de confirmação ou do mesmo comportamento que o ✕ já tem.

### 2026-11-10 — Abas: atalhos de teclado para fechar e alternar
`[relatado pelo dono]` Fechar a aba ativa e alternar entre abas pelo teclado, no espírito de Ctrl+W e Ctrl+PgDn/PgUp. **Confirmado em 2026-11-11 (pesquisa do chat):** no Windows o Chrome reserva Ctrl+N, Ctrl+W, Ctrl+T, Ctrl+Tab, Ctrl+Shift+Tab e Ctrl+PgUp/PgDn — a página nem recebe esses atalhos (proposital: impede um site de prender o usuário numa aba). Saídas: atalhos próprios (ex.: Alt+W, Alt+←/→) e o clique do meio (ideia acima). Atalhos como Ctrl+P e Ctrl+S chegam à página primeiro e podem ser usados.

---

## 🤖 Ideias Ativas — Assistente

### 2026-11-11 — Ctrl+roda como zoom do conteúdo (MD, JSON, CSV, texto)
O Chrome entrega Ctrl+roda à página primeiro: um listener de `wheel` com `{passive: false}` que chama `preventDefault()` quando `ctrlKey` é verdadeiro troca o zoom da página pelo zoom do FileView (é o que Google Maps e Canva fazem; a pinça do touchpad chega como o mesmo evento). Aplicaria um tamanho de fonte por aba nos viewers de texto. O PDF já tem isso de graça desde a 0.1.8 (DEC-012).

### 2026-11-11 — Abas: lembrar a posição de rolagem de cada aba
Depois do FIX-003 cada aba volta ao topo ao ser reaberta. O comportamento de navegador é lembrar onde se estava. Caminho provável: um `Map` por `id:modo` com o `scrollTop`, gravado por `onScrollCapture` num contêiner em volta do viewer e restaurado depois de montar — o elemento que rola muda de viewer para viewer e o conteúdo do PDF/Markdown chega depois da montagem, então precisa de um pequeno «esperar o conteúdo». Avaliar junto: preservar também filtro/ordenação do CSV e zoom do PDF.

### 2026-07-01 — ArrayTable: seletor de colunas visíveis
Para tabelas com muitas colunas (10+), permitir esconder/mostrar colunas via um menu "Colunas" — padrão usado por Airtable e Notion database view. Reduz a necessidade de scroll horizontal quando nem todas as colunas importam para a inspeção atual. Ficou de fora do DEC-008 por ser escopo maior; registrar aqui para retomar se o caso de uso aparecer de novo.

### 2026-07-07 — PrimitiveList (arrays de primitivos): edição inline
Arrays simples (chips) no FormView continuam read-only — a edição inline nesta sessão cobriu Field, ArrayTable e RowDetailModal, mas não os chips de `PrimitiveList`. Escopo pequeno (cada chip é um valor primitivo isolado, sem a complexidade de índice-original de linha de tabela), mas ficou de fora para não estender ainda mais a sessão 2. Path seria `${section.key}.${índice}` diretamente.

### 2026-11-07 — CSV: Tab na última célula da última linha cria uma linha nova
Hoje, nas bordas da tabela, Tab/Shift+Tab só fecha a edição (decisão de escopo mínimo da sessão 3 de 2026-07-07). Excel/Sheets criam/avançam para a próxima linha. Se vier: `addRow` + abrir a 1ª célula da linha nova. Cuidado com filtro ativo — a linha nova (vazia) pode não passar no filtro e "sumir" da vista; mesma classe de risco do FIX-002.

### 2026-11-07 — JSON Formulário: validar o tipo ao editar (number/boolean/null)
`parseEditedValue` (JsonViewer.jsx) faz `Number(text)` — texto inválido vira `NaN`, que `JSON.stringify` grava como `null` (perde o dado em silêncio); `null` editado volta sempre `null` (não dá para trocar o tipo); boolean diferente de `"true"` vira `false`. Ideia: rejeitar entrada inválida (borda vermelha, sem commit) e/ou oferecer troca de tipo. Confirmar o comportamento no navegador antes de mexer.

### 2026-11-07 — README: atualizar e ilustrar
O README não cita o modo Formulário, a edição inline nem o Tab do CSV. Capturas que valem: (1) Formulário nos 3 layouts com um `ArrayTable`; (2) `RowDetailModal` com um campo em edição (textarea); (3) CSV com uma célula em edição + rodapé de dicas; (4) Árvore JSON com um nó em edição. Imagens não geradas — são capturas do usuário.

### 2026-06-05 — JSON: botão "copiar caminho" por nó
Em cada nó da árvore, um botão que copia o caminho completo (ex: `users[0].address.city`) para o clipboard. Útil ao trabalhar com APIs ou escrever queries JSONPath.

### 2026-06-05 — Busca Ctrl+F dentro do documento
Para SourceEditor e MarkdownViewer: campo de busca flutuante que destaca ocorrências e permite navegar (↑↓). Para JSON, busca por chave ou valor na árvore ou nos campos do formulário.

### 2026-06-05 — Suporte a .xlsx via SheetJS
SheetJS é a biblioteca padrão para Excel no browser. XlsxViewer similar ao CsvViewer com suporte a múltiplas abas.

### 2026-06-05 — Tema escuro/claro alternável
Sidebar já é dark; conteúdo é light. Toggle para tema completamente dark persistindo em localStorage. CSS vars já centralizadas — é só toggle de classe no `<html>`.

### 2026-06-05 — Versão desktop com Electron ou Tauri
Abrir arquivos diretamente do sistema sem drag-and-drop, associar extensões no SO, salvar direto no disco.

### 2026-06-05 — Tooltips customizados na toolbar do MD editor
O `title` HTML já existe em todos os botões. Tooltips visuais com delay melhorariam a UX para novos usuários.

---

## 🛌 Adiadas
> Decisão consciente de não fazer agora. Cada item com **o gatilho que a traz de volta**: ideia adiada sem gatilho é ideia perdida.
- **PDF: abrir numa aba nova do navegador em vez de embutido** (opção C da conversa de 2026-11-11) — adiada porque o dono escolheu a B (iframe, DEC-012) — **volta quando** o dono disser que não gostou do visual nativo dentro do FileView.

---

## ✅ Concluídas

- **Análise de viabilidade técnica e de mercado** — pesquisada em 2026-05. Ver HISTORY.md.
- **MVP v0.1.0** — todos os viewers + editor MD WYSIWYG, 2026-06-05. Ver CHANGELOG.
- **FIX-001 (PDF Blob URL)** — ArrayBuffer detachado resolvido em 0.1.1.
- **FIX-002 (CSV edição com filtro)** — `__dataIdx` + edita no `data` original, 0.1.1.
- **Botão cancelar edição CSV** — botão ✕ com `onMouseDown + preventDefault`, 0.1.1.
- **Botão "✕ limpar" no filtro CSV** — 0.1.1.
- **GitHub Pages fix** — `base: './'` em vite.config.js + GitHub Actions deploy, 0.1.1/0.1.2.
- **JSON modo formulário/cards** — FormView com Cards, Tabs e Painel; arrays → tabela automática, 0.1.2.
- **JSON Formulário: UX de tabelas grandes** — truncamento com ellipsis, paginação, modal de registro completo, cards de tabela em largura total. Ver DEC-008. 0.1.3.
- **Adoção da atualização do KCM (2026-07-03)** — CEREBRO.md e Instruções do Projeto mesclados com o template novo. Ver DEC-009.
- **JSON formulário: edição inline dos campos** — `Field` (Cards/Tabs/Painel) editável via duplo clique, reaproveitando `handleUpdate` da Árvore. 2026-07-07. Ver STATUS/CHANGELOG 0.1.4.
- **Nomenclatura de ASU migrada para o padrão do kit** (`AAMMDD-asuNNNN.yaml`) — pendência do DEC-009 resolvida em 2026-07-07.
- **JSON formulário: edição inline no RowDetailModal e nas células do ArrayTable** — 2026-07-07 (sessão 2). Ver DEC-010, STATUS/CHANGELOG 0.1.5.
- **CSV: navegação por Tab entre células** — Tab confirma e move para a próxima coluna/linha (Shift+Tab volta), seguindo a ordem visível (`filtered`). 2026-07-07 (sessão 3). Ver STATUS/CHANGELOG 0.1.6.
- **Migração ASU → modo Code** — 2026-11-10, junto do merge do KCM v1.135.0. Ver DEC-011.

---

## 🚫 Descartadas

- **Editar conteúdo de PDF** — impossível no browser sem engine proprietária paga. Ver DEC-004.
- **react-json-view** — sem manutenção desde 2021, incompatível com React 18. Ver DEC-003.
- **TypeScript imediato** — aumentaria fricção no estágio atual; revisitar na F3.
- **Virtualização de linhas (react-window) no ArrayTable** — complexidade desnecessária para o volume atual de dados (centenas de linhas); paginação simples resolve. Ver DEC-008. Revisitar se algum JSON real chegar a dezenas de milhares de itens.
- **PDF: anotações overlay via `pdf-lib`** (ideia de 2026-06-05) — descartada em 2026-11-11: com o PDF no visualizador nativo (DEC-012) não há canvas próprio onde desenhar. Volta só se o PDF voltar a ser desenhado pelo FileView.

---

## 📣 Feedback para o Kit

> Observações sobre o Kit de Contexto Universal (KCM) em si — material para evoluir o kit, não o Fileview.

- **2026-07-03 — Auto-criação de arquivo de nicho:** a versão antiga do CEREBRO.md ("se um arquivo referenciado ainda não existir, o assistente o CRIA") era mais simples de aplicar do que a nova distinção "camada universal vs. nicho" — mas a nova é mais correta para projetos que não usam CHANGELOG/ROADMAP. Sem atrito para o Fileview (usamos todos os arquivos), só um registro de que a mudança faz sentido.
- **2026-07-03 — Seção "Recomendação de configuração" é um bom acréscimo** — faltava uma diretriz explícita para isso; antes ficava a critério de cada conversa perguntar ou não. Ponto forte do template novo.
- **2026-07-03 — Nomenclatura ASU sugerida pelo kit (`AAMMDD-asuNNNN.yaml`) é mais compacta, mas perde a descrição no nome do arquivo** — para um projeto com múltiplos ASUs ao longo de semanas, ter a descrição no nome (`..._json-table-ux.yaml`) é bem mais útil para auditar de relance do que abrir cada arquivo ou manter um índice à parte. Sugestão para o kit: considerar o formato com descrição como alternativa válida, não só o compacto — ou ao menos mencionar explicitamente que é customizável por projeto (o texto atual soa como um padrão fixo).
- **2026-07-07 — Migração efetiva para o padrão do kit, com o trade-off aceito conscientemente** — depois de usar a convenção própria em 3 ASUs, o usuário decidiu migrar para `AAMMDD-asuNNNN.yaml` mesmo assim. O ponto acima (perda de auditabilidade por nome) segue válido como observação para o kit, mas na prática deste projeto o usuário priorizou aderência ao padrão do kit sobre a vantagem de auditoria — registrado para reforçar que a crítica de 2026-07-03 é uma preferência, não um bloqueio real à adoção do padrão compacto.
- **2026-11-07 — Transferência de conversa (HANDOFF-BRIEF) chegou como pedido ad hoc.** Não confirmei se o `CEREBRO.md` tem gatilho/formato para isso (a busca no Projeto veio sem trechos). Se não tiver, vale propor ao kit: gatilho "conversa pesada → HANDOFF-BRIEF" + template de seções (onde estamos · feito e por quê · pendências com 1º passo · próxima frente e indecisões · armadilhas · ritual + config). Também registrar o modo "handoff incremental": o usuário pediu patches ASU até para docs rolantes (STATUS/IDEAS), contrariando o padrão "rolante = arquivo inteiro" — a regra atual não prevê essa exceção.
- **2026-11-10 — O carimbo de modos decide «sobra» só pelo arquivo, e aqui teria apagado o fluxo vivo.** O pacote v1.135.0 veio com `ASU nao`; a regra do manifesto («marcador presente + modo `nao` = sobra, remova») mandava apagar a seção ASU do CEREBRO de um projeto que ainda vivia de ASU (`meta/ASU/`, DEC-009, quatro `asuNNNN.yaml`). O dono estava migrando de propósito, mas não tinha avisado. Sugestão: antes de declarar sobra, conferir se o projeto USA o modo (artefatos dele no repo); se usa, é pergunta para o dono, não remoção.
- **2026-11-10 — A pergunta de 2026-11-07 sobre o HANDOFF-BRIEF está respondida pelo kit:** o v1.135.0 já nomeia `AAMMDD-HANDOFF-BRIEF.md` no bloco de fecho e diz que ele nunca é versionado.
- **2026-11-10 — Desvio registrado: pasta de arquivo `zz_notas-arquivadas/`** (o kit diz `notas-arquivadas/`). Nome do dono, mantido; está em «Técnicas específicas» do CEREBRO e nas Instruções.
- **2026-11-10 — Custo do CEREBRO v1.135.0:** ~106 KB contra ~36 KB do anterior. É lido sob demanda (as Instruções são o que roda todo turno), mas o tamanho torna a comparação bloco a bloco cara; um índice de seções no topo ajudaria.

## 🔧 Feedback para o ASU

> Observações sobre a ferramenta ASU em si (o Atualizador Automático de Scripts) — separado do Kit de Contexto, é outra ferramenta.
> **Encerrada em 2026-11-10:** o ASU foi desligado (DEC-011). As entradas abaixo ficam como histórico; os três pontos «não verificado» do asu0004 não serão mais conferidos.

- Nenhum problema ou limitação da ferramenta ASU em si foi encontrado até agora nas 5 instruções geradas (`2026-06-28_001_json-form-view.yaml`, `2026-07-01_001_json-table-ux.yaml`, uma anterior de atualização do Node, `260707-asu0001.yaml`, `260707-asu0002.yaml`). Todas usaram `replace_file` (reescrita completa do arquivo-alvo) em vez de patches cirúrgicos menores — isso funcionou bem porque o `JsonViewer.jsx` mudou estruturalmente demais para valer a pena um patch localizado a cada vez, mas é um padrão de uso a observar: se o arquivo continuar crescendo, `replace_file` vai ficar cada vez mais caro (todo o arquivo precisa ser reescrito por completo a cada ajuste pequeno). Considerar migrar para patches `replace_context_block` mais cirúrgicos assim que o `JsonViewer.jsx` estabilizar.
- **2026-07-07 — Validação de sintaxe antes de entregar `replace_file`:** a partir do `260707-asu0002.yaml`, passou a fazer parte do processo rodar o conteúdo do `new_content` pelo Babel (`transformSync` com `@babel/preset-react`) antes de gerar o YAML, além da checagem byte a byte já praticada desde a sessão anterior. Pega erros de sintaxe JSX/JS que a checagem byte a byte sozinha não pega (ela só garante que o texto extraído do YAML bate com o arquivo fonte, não que o arquivo fonte em si é válido). Vale manter como prática padrão para qualquer `replace_file`/`create_file` em `.jsx`/`.js` deste projeto.
- **2026-07-07 (sessão 3) — Primeiro uso de `replace_context_block` neste projeto (`260707-asu0003.yaml`, em `CsvViewer.jsx`) — funcionou bem e a checagem ficou mais rigorosa.** Diferente do `JsonViewer.jsx` (sempre `replace_file`, porque muda estruturalmente a cada sessão), o `CsvViewer.jsx` está estável há semanas e a mudança (navegação Tab) é pequena e localizada — caso de uso exatamente do que o `replace_context_block` foi feito para resolver. Como a instrução tinha 3 modificações cirúrgicas encadeadas na mesma execução (uma depende do resultado da anterior), a checagem byte-a-byte sozinha não bastava — antes de gerar o YAML, simulei a aplicação da instrução inteira em Python contra o arquivo real do mount (mesma lógica de before/after/new_content que a ferramenta usaria) e comparei o resultado final byte a byte com o arquivo esperado, além da validação de sintaxe via Babel. Vale generalizar essa prática (simular a instrução completa antes de entregar, não só validar anchors isoladamente) para qualquer ASU com mais de uma modificação no mesmo arquivo.
- **2026-11-07 — `261107-asu0004.yaml`: primeiro ASU que patcha Markdown e docs rolantes (STATUS/IDEAS).** Estratégias: `replace_line_pattern` (usando `.+`/`.*` no lugar de ã/—/box-drawing nas âncoras), `replace_context_block`, `insert_before_pattern`/`insert_after_pattern` e um `occurrence: 1` consciente (FIX-001, cujo `**Data:**` repete no FIX-002). A sandbox não tinha o mount: simulei contra cópias em disco de só 3 dos 5 arquivos. **Não verificado contra a ferramenta real:** (a) `replace_line_pattern` com `new_content` de várias linhas; (b) newline final em `insert_*`; (c) `insert_after_pattern` na última linha do arquivo (IDEAS). Conferir no dry-run e anotar aqui o resultado.
