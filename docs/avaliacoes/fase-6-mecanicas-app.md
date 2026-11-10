# Fase 6 — Mecânicas do app (execução do backlog APP)

**Data:** 10/11/2026 · **Escopo:** itens 1–7 do backlog APP acumulado (relatório da fase 5) · **Natureza:** apenas código do app e metadados do currículo — **nenhum banco de conteúdo foi alterado** (nenhuma questão, lição, mini ou simulado) · **Aprovação:** usuário ("ok do them").

## Itens executados

### 1 + 2. Semanas 6 (26–30) e 14 (66–70) sem consolidação
- **Problema:** as duas únicas semanas de ensino cuja sexta-feira é uma aula comum (s30 e s70) não têm mini-simulado nem revisão — os erros da semana nunca são consolidados na própria semana.
- **Solução (regra derivada, sem hardcode):** toda `aula` de sexta (`kind:"aula"` + `day:"Sexta"` — hoje exatamente s30/s70, verificado por script) passa a servir **primeiro até 10 questões erradas nas aulas anteriores da mesma semana** (repetição espaçada, embaralhadas), **depois o banco próprio da aula** (10 questões, na ordem autoral). Sessão resultante: até 20 questões, sem cronômetro.
- Sem erros na semana → comportamento de aula comum, inalterado.
- **`miniSessions` derivado do currículo** (`kind:"simulado"` + título iniciado em "Mini-simulado"): conjunto idêntico ao anterior ({20, 25, 35, 40, 50, 55}), verificado por script; adicionar um mini no futuro passa a exigir apenas currículo + banco, sem tocar em código.
- **Validator alinhado:** `miniExpect` agora é derivado da mesma regra, e chaves de mini sem sessão correspondente no currículo viram erro.

### 3. Grade de tempo 40/60/20 fixa
- **Problema:** a mesma divisão (40 teoria / 60 exercícios / 20 revisão) era exibida para todo tipo de sessão, desconectada do volume real (aulas: lição de ~5–7 min + banco de 10 questões ≈ 30 min; simulados: 25 questões cronometradas).
- **Solução:** `paceGrid()` — grade por tipo de sessão, com rótulos honestos:

| Tipo de sessão | Grade exibida |
|---|---|
| Aula comum | 40 Teoria e normas · 50 Exercícios · 30 Revisão de erros |
| Aula de sexta de consolidação (s30/s70, com erros) | 30 Teoria · 45 Erros da semana · 45 Exercícios do tema |
| Mini-simulado | 35 Mini-prova · 25 Correção · 60 Revisão da semana |
| Revisão semanal (s5/10/15/45/60/65) | 30 Teoria dirigida · 60 Questões e correção · 30 Caderno de erros |
| Revisão temática/final (s74/75/79/80/84/85) | 40 Roteiro teórico · 50 Questões · 30 Caderno de erros |
| Metade de simulado (s71/72/76/77/81/82) | 75 Prova simulada · 45 Correção e anotações |
| Refazer simulado (s73/78/83) | 150 Prova completa · 30 Correção e classificação |

- A grade de 75 min da metade do simulado bate com a instrução da lição s71 ("cronometre 75 minutos para as questões 1 a 25") e com o cronômetro do app (25 × 180 s).
- Durações dinâmicas em toda a UI: "Sessão de 2/3 horas" (lição), "X horas" por sessão no plano, total de horas por semana (semanas 15–17 passam a exibir 11 horas) e total do curso (170h → **173h**, somado de `curriculum.minutes`).

### 4. `best`/`total` defasados em bancos ampliados
- **Solução:** `SessionProgress` ganha `bestTotal` opcional; `applyAttempt` grava o par coerente (`best` com o `total` da tentativa em que ele foi atingido). Exibição usa `bestTotal ?? total` (resultado do quiz e lista do plano).
- Retrocompatível: entradas antigas (sem `bestTotal`) continuam exibindo seu par original coerente ("4/6" de quando o banco tinha 6); a chave de progresso **v1 é mantida**, sem migração.

### 5. Timer de 180 s/questão e lead do mini
- **Decisão de manter 180 s/questão (3 min):** é o ritmo treinado pelo próprio curso — a lição s71 manda cronometrar 75 min para 25 questões e a s85 explicita "ritmo treinado de 3 min/questão" contra os 4,8 min/questão da prova oficial (4 h / 50 questões). Mudar o cronômetro para 288 s contradiria conteúdo aprovado na fase 5.
- O que mudou: constante nomeada `SECONDS_PER_QUESTION` com a racional em comentário; **lead do mini dinâmico** (`mini.length` em vez de "12 questões"); **lead do refazer explícito** ("50 questões… cronômetro de 150 minutos"), coerente com grade e timer.

### 6. Revisões temáticas (s74/75/79/80) sem suporte mecânico
- **Problema:** o `reviewMap` servia os erros do simulado correspondente em qualquer área; sem erros, caía em "REVISÃO GERAL" com 10 questões aleatórias de todo o curso (as semanas 15–17 não têm aulas, então o pool semanal estava vazio) — quebrando a promessa temática dos títulos.
- **Solução:** `themeMap` por sessão, com as duas grafias de área (bancos de aula × simulados):

| Sessão | Tema | Áreas (pool de aulas) |
|---|---|---|
| s74 | Contabilidade Geral | Contabilidade Geral, Teoria da Contabilidade, Teoria da Contabilidade e Princípios, Contabilidade Tributária — 250 questões |
| s75 | Custos e Gerencial | Contabilidade de Custos, Contabilidade Gerencial, Controladoria, Análise das Demonstrações Contábeis (s38–40, bloco gerencial) — 80 |
| s79 | Setor Público | Contabilidade Aplicada ao Setor Público — 80 |
| s80 | Auditoria, Perícia e Ética | Auditoria Contábil, Perícia Contábil, Legislação e Ética Profissional — 80 |

- **Fluxo novo das revisões temáticas:** (1) erros pendentes do tema — primeiro os do simulado correspondente, depois os de aulas/minis de qualquer semana — até 12; (2) sem erros pendentes no tema, 12 questões do tema já vistas nas aulas, embaralhadas (repetição espaçada, mantendo a sessão temática); (3) último recurso preservado (revisão geral).
- **s84 ("Revisão dos temas mais fracos") e s85 ("Revisão final"):** sem filtro temático (como antes), mas o pool de erros passou a ser **todos os pendentes** (priorizando o simulado C, depois A/B e aulas) — coerente com o "mapa de erros consolidado" das lições s83/s84. Sem nenhum erro pendente, mantém a revisão geral de 10 questões.

### 7. Refazer (s73/78/83): 50 questões com orçamento de 150 min em sessão de 120 min
- **Solução (cosmética, como classificado):** `minutes` 120 → **180** nas três sessões (metadado do currículo; IDs, kinds e tópicos intactos). A UI passa a exibir "Sessão de 3 horas", a semana mostra 11 horas e o total do curso 173h — o tempo declarado agora contém a prova completa (150 min no ritmo treinado) + correção.

## Compatibilidade de progresso

- **Nenhum arquivo de banco foi tocado** (`quizzes-*.json`, `minis-*.json`, `simulado-*.json`, `lessons-*.json`): IDs posicionais `s:`/`m:`/`x:` e o banco de erros seguem válidos sem nenhuma condição.
- `curriculum.json`: apenas `minutes` em 3 sessões (73/78/83) — campo de exibição, não referenciado pelo progresso.
- `progress.ts`: campo novo **opcional** (`bestTotal`), chave `aprova-crc:progress:v1` mantida; dados antigos degradam graciosamente.
- Regra 5 do plano mestre (migrar IDs para hash estável) **não** foi executada — continuaria exigindo bump v1→v2 e não houve demanda.

## Verificação (gate da fase)

- `node scripts/validate-content.mjs`: **OK** (58/58 aulas com lição e banco; minis derivados do currículo conferidos).
- `npm run build`: **limpo** (766 ms; `tsc -b` sem erros).
- Diff confinado a `src/main.tsx`, `src/content/index.ts`, `src/progress.ts`, `src/curriculum.json` (3 × `minutes`) e `scripts/validate-content.mjs` — zero mudanças em JSONs de conteúdo.
- Smoke no bundle: mecânicas novas presentes ("PRÁTICA + REVISÃO DA SEMANA", "REVISÃO DOS TEMAS MAIS FRACOS", `bestTotal`, "Prova completa", "Erros da semana", áreas do `themeMap`); hardcodes antigos ausentes ("170h", "Sessão de 120 minutos", "2 horas · ", "12 questões originais" como literal do mini).
- Preview da build: `GET /` → **200**.
- Derivações conferidas por script contra o currículo: sextas com aula = {30, 70}; minis derivados = {20, 25, 35, 40, 50, 55}; pools temáticos = 250/80/80/80 questões.

## Arquivos alterados

- `src/main.tsx` — `themeMap`, `SECONDS_PER_QUESTION`, `paceGrid`, `durLabel`, `totalHours`; `quizFor` (híbrida de sexta, revisões temáticas, leads dinâmicos); exibições `best/bestTotal` e durações dinâmicas.
- `src/progress.ts` — `bestTotal` opcional com par coerente em `applyAttempt`.
- `src/content/index.ts` — `miniSessions` derivado do currículo.
- `src/curriculum.json` — `minutes` 180 nas sessões 73, 78 e 83.
- `scripts/validate-content.mjs` — `miniExpect` derivado do currículo + rejeição de bancos de mini órfãos.
