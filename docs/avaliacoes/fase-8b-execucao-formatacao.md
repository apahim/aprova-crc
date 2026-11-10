# Fase 8 — Formatação visual das lições (8b — execução)

**Data:** 10/11/2026 · **Escopo:** fase B do plano `~/.opencode/plan/aprova-crc-formatacao-visual.md` — aplicar o plano P0/P1/P2 do relatório 8a nos JSONs de lição e promover os limiares da rubrica a **avisos não-bloqueantes do validador** · **Natureza:** somente conteúdo de lições (`lessons-*.json`) e scripts de gate — **nenhum banco de questões, minis ou simulados foi alterado; nenhum CSS/componente** (regra 1 do plano mestre: texto de lição é edição livre) · **Aprovação:** usuário ("yes").

## Edições por prioridade

### P0 — s19 (o único muri)

| Lição | Intervenção |
|---|---|
| s19 · IRPJ, CSLL e tributos diferidos | ¶ de 171 palavras desmontado: fórmula nova (`Base presumida = % de presunção × receita bruta da atividade`), exemplo trimestral em lista de 5 passos, regra da LC 224/2025 em dois ¶ (38 e 51 palavras); ¶ de 70 do lucro real dividido |

### P1 — 15 lições

| Grupo | Lições | Intervenção |
|---|---|---|
| DENSA (12) | 17, 20, 21, 22, 23, 27, 30, 53, 69, 70, 74, 75 | Parágrafos de 61–94 palavras divididos nos pontos naturais; item de lista de 55 palavras da s21 (Ativo Diferido) desdobrado em dois |
| CALC (2) | 29, 64 | Fórmulas acrescentadas: `Passivo de arrendamento = Σ pagamentos ÷ (1 + taxa)ⁿ` (s29) e `Valor da hora extra = (salário ÷ horas mensais) × (1 + adicional)` (s64); ¶ de 84 da s29 deduplicado com o cronograma da última seção |
| SEC (1) | 11 | 7→6 seções: "Moeda estrangeira (CPC 02)" + "Instrumentos financeiros: categorias de mensuração (CPC 48)" fundidas em "Câmbio e instrumentos financeiros (CPC 02 e CPC 48)" — também elimina o título de 59 caracteres |

### P2 — conversões de enumerações soterradas (TAB) + consistência

| Lições | Conversão |
|---|---|
| s7 | Resultado competência × caixa do exemplo em lista paralela + fórmula dos dois regimes |
| s12 | PEPS × média ponderada em listas (duas seções); ¶ de 73 dos ativos biológicos dividido |
| s22 | Sequência legal da DRE em lista de 10 linhas; exemplo encadeado em lista; natureza × função em lista paralela |
| s28 | Três critérios de "ao longo do tempo" em lista |
| s31 | Custos diretos × indiretos em lista; título "Separação de custos fixos e variáveis: método do alto e baixo" → "Método do alto e baixo" |
| s32, s33 | ¶ de 87 (departamentalização) e 66 (GAO) divididos; PEC/PEE/PEF em lista paralela |
| s34 | Ordem × processo, coprodutos/subprodutos/sucatas e critérios de rateio em listas |
| s38, s39, s49, s52 | AV × AH, índices de endividamento/rentabilidade/prazos (estilo da seção Liquidez), bens públicos do art. 99 e RI/RC/RD em listas paralelas |
| s53 | Reestruturação final em 6 seções: "Comunicações do auditor" fundida em "Fraude, erro e comunicações do auditor"; última seção desdobrada em "Continuidade (NBC TA 570)" — com os desfechos em lista — e "Eventos subsequentes e declarações escritas"; ¶ de 94, 70 e 61 divididos |
| s65, s66, s67, s68 | Cálculos de autoavaliação, simples × compostos, desconto comercial × racional e cronograma do SAC em listas |
| — | **Sem edição estrutural** (já escaneáveis; comparações vivem em listas): s10, s15, s36, s40, s74-roteiro, s80 — a demanda de tabela comparativa dessas fica registrada para a fase C |

**Refs normalizadas (29 substituições, 121 → 101 grafias únicas):** grafia canônica = forma dominante (empate → mais curta). Exemplos: "CPC 16 (R1) – Estoques" → "CPC 16 (R1)"; "CPC 26 (R1) – Apresentação…" → "CPC 26 (R1)"; "Edital do Exame de Suficiência do CFC" → "…vigente"; "NBC PG 01" → "…– Código de Ética Profissional do Contador"; "Lei 5.172/66" → "…(Código Tributário Nacional)". **Exceções deliberadas:** anotações contextuais mantidas ("Lei 6.404/76 (custeio por absorção para fins societários)", "Legislação do Imposto de Renda (custo de produção)") e "NBC TSP" genérico da s79 (referência à família de normas, ao lado de Lei 4.320/64, LRF e MCASP).

## Resultado do censo (antes → depois)

| Métrica | 8a | 8b |
|---|---|---|
| MURI (¶ >120) | 1 (s19) | **0** |
| DENSA (%≤60 <80) | 13 | **0** |
| CALC (numérica sem fórmula) | 2 | **0** |
| SEC (fora de 3–6) | 1 (s11) | **0** |
| EXT (banda calibrada por tipo) | 0 | **0** |
| TAB (candidata a tabela — sinal, não defeito) | 26 | 27 |
| Lições sem nenhum flag | 7 | **58** |

Corpo preservado: mediana 289 palavras (inalterada), máx 521 → 507 (deduplicação da s29); conversões p→list não alteram o total de palavras. TAB sobe para 27 porque listas de cálculo contêm "×" — a heurística conta palavras-chave comparativas, e o flag continua sendo sinal de demanda de schema (fase C), não defeito de conteúdo.

## Rubrica no validador (avisos não-bloqueantes)

`scripts/validate-content.mjs` passou a emitir **AVISO** (não erro) por lição para: ¶ >120 · %≤60 <80 · lição de cálculo sem `formula` · fora de 3–6 seções · extensão fora da banda calibrada (aulas+minis 180–550 · roteiros 90–270, lida do currículo). **TAB ficou fora do validador** (deliberado): é demanda de schema para a fase C, não limiar de conteúdo. `scripts/lesson-format-metrics.mjs` alinhado às mesmas bandas calibradas.

## Verificação (gate da fase)

- `node scripts/validate-content.mjs`: **OK** (58/58) — **zero avisos de formatação**.
- `node scripts/lesson-format-metrics.mjs`: somente TAB restante (27 lições, sinal fase C); 58 lições sem flags.
- `npm run build`: **limpo** (1,03 s; `tsc -b` sem erros).
- **Diff confinado** aos 4 `lessons-*.json` + 2 scripts — **zero mudanças em quizzes, minis, simulados, currículo, CSS ou componentes** (regra de compatibilidade da fase).
- Formatação dos JSON preservada por arquivo (2 espaços + refs inline nos dois primeiros; 1 espaço + refs expandidas nos dois últimos) — round-trip verificado byte a byte antes das edições; diffs mínimos.
- Smoke do bundle: novos conteúdos presentes ("Base presumida = % de presunção", "Fraude, erro e comunicações do auditor", "Valor da hora extra", fórmula da s7, "Método do alto e baixo"); antigos ausentes (¶ de 171 palavras, título de 59 caracteres, "Edital … do CFC").
- Preview da build: `GET /` → **200**.
- Spot-check integral: s19 e s53 reconferidos após as edições.

## Arquivos alterados

- `src/content/lessons-01-15.json` — s7, s11, s12 + refs
- `src/content/lessons-16-30.json` — s17, s19, s20, s21, s22, s23, s27, s28, s29, s30 + refs
- `src/content/lessons-31-55.json` — s31, s32, s33, s34, s38, s39, s49, s52, s53 + refs
- `src/content/lessons-56-85.json` — s64, s65, s66, s67, s68, s69, s70, s74, s75 + refs
- `scripts/validate-content.mjs` — avisos não-bloqueantes da rubrica
- `scripts/lesson-format-metrics.mjs` — bandas de extensão calibradas por tipo de sessão
