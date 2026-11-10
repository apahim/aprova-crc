# Fase 1 — Contabilidade Geral (sessões 1–30)

**Data:** 10/11/2026 · **Escopo:** bloco de Contabilidade Geral (sessões 1–30) · **Método:** censo — 30 lições, 25 bancos de aula (150 questões) e minis 20/25 (24 questões) lidos integralmente; gabaritos conferidos um a um; citações normativas verificadas na fonte.

## Rubrica — estado inicial

| Dimensão | Avaliação | Evidência principal |
|---|---|---|
| Cobertura do edital | ⚠️ Lacunas | CPC 02 (câmbio), CPC 36 (consolidação) e CPC 48 (instrumentos financeiros básicos) ausentes das lições |
| Sequenciamento | ✅ Bom | Progressão clássica: patrimônio → lançamentos → regimes → balanço → DRE → demais demonstrações → mensuração |
| Precisão técnica | ✅ Forte | 174/174 gabaritos corretos, sem erros de cálculo; citações verificadas (LC 224/2025 correta; Res. CFC 750/93 corretamente tratada como revogada em 2016) |
| Objetivos de aprendizagem | ✅ Bom | Todas as lições com objetivos específicos e verificáveis |
| Qualidade da teoria | ⚠️ Rasa | ~309 palavras no corpo das seções (média) ≈ 5 min de leitura, contra 40 min de teoria prometidos; exemplos numéricos pontuais, pouco encadeados |
| Dose de prática | ❌ Insuficiente | 174 questões ≈ 8,7 h (a 3 min/questão) contra ~27 h prometidas (~33%) |
| Gabarito e feedback | ⚠️ Irregular | Explicações corretas, mas 22 puramente calculísticas (sem regra explícita nem eliminação dos distratores); banco 29 como boa referência |
| Mecânicas de aprendizagem | ⚠️ | Semana 6 (sessões 26–30) sem revisão nem mini; revisão por erros funciona, mas não há reforço programado |

Legenda: ✅ adequado · ⚠️ parcial · ❌ deficiente

## Achados

### P0 (bloqueadores) — nenhum
Nenhum gabarito incorreto, nenhum erro numérico, nenhuma citação normativa falsa.

### P1 (alta prioridade)
1. **Dose de prática** muito abaixo do prometido (25 bancos × 6 questões).
2. **Lacunas de edital**: variações cambiais (CPC 02), noções de consolidação (CPC 36) e categorias de mensuração de instrumentos financeiros (CPC 48) sem cobertura em lição nem em questões.
3. **Teoria sem exemplos encadeados**: ficha de estoques passo a passo (PEPS × média), sequência completa compra → venda → devolução → recebimento com ICMS, DFC fechada a partir de um balancete e cronograma do passivo de arrendamento.

### P2 (refinamento)
- s19: LC 224/2025 citada corretamente, mas sem a nuance de vigência (IRPJ vs. CSLL).
- s21: extinção do ativo diferido afirmada sem base legal precisa.
- s23: "destinação total do lucro" na S.A. apresentada sem as exceções legais.
- Explicações em padrão desigual entre bancos.

## Plano de atualização — executado

### P1.1 — Ampliação dos bancos (executado)
25 bancos de aula ampliados de 6 para **10 questões** (+100 questões), **append-only** (acréscimo apenas ao fim; IDs posicionais preservados).

- Distribuição de gabaritos: **máximo 3 questões por letra** em todos os bancos (o banco 19, que já tinha C=3 nas originais, recebeu novas questões desviadas da letra C).
- Áreas preservadas por banco: Contabilidade Geral (220), Teoria da Contabilidade (banco 11) e Contabilidade Tributária (bancos 17 e 19).
- Novas questões no padrão "regra + cálculo + eliminação dos distratores"; gabarito conferido individualmente (regra, contas e cálculo).
- Alvo: objetivos e `pitfalls` não cobertos pelas 6 questões originais.

### P1.2 — Lacunas de edital (executado)
- **s11**: novas seções "Moeda estrangeira (CPC 02)" e "Instrumentos financeiros: categorias de mensuração (CPC 48)" (+ referências).
- **s30**: nova seção "Consolidação: noções (CPC 36)".
- Bancos 11 e 30 receberam as questões correspondentes (incluídas nas +100 do P1.1).

### P1.3 — Exemplos resolvidos (executado)
- **s12**: ficha de estoques completa — PEPS (CMV 3.450; EF 750) × média ponderada (CMV 3.500; EF 700), com leitura do efeito em preços crescentes.
- **s16**: sequência completa de lançamentos com ICMS 18% — compra (custo 8.200), venda (16.000; ICMS 2.880), baixa do CMV e recebimento com desconto financeiro.
- **s24**: DFC fechada a partir de balancete mínimo — FCO 71.000, FCI −40.000, FCF 20.000, variação 51.000 e caixa final 71.000.
- **s29**: cronograma do passivo de arrendamento (juros sobre o saldo de abertura; amortização = pagamento − juros; saldo zerando no 3º ano).

### P2 (executado)
- **s19**: vigência da LC 224/2025 — IRPJ a partir do 1º trimestre de 2026; CSLL apenas do 2º trimestre (anterioridade nonagesimal), com limite anual de receita proporcionalizado em R$ 3,75 milhões.
- **s21**: base legal precisa — inciso V do art. 179 da Lei 6.404/76 revogado pela Lei 11.941/2009; saldo de 31/12/2008 não alocável mantido até a completa amortização, sujeito ao teste de recuperação do art. 183, § 3º (art. 299-A).
- **s23**: exceções à destinação total — retenção para investimento no orçamento de capital (art. 196) e suspensão do dividendo obrigatório por situação financeira difícil (art. 191).
- **P2.3 (parcial)**: 22 explicações puramente calculísticas reescritas ao padrão "regra + cálculo + eliminação dos distratores" (bancos 1, 4, 9, 11, 13, 14, 16, 17, 18, 19 e 29). As demais explicações curtas já continham a regra e foram mantidas.

### Compatibilidade de progresso (respeitada)
- Nenhuma questão inserida no meio, reordenada ou excluída; edições in place apenas em texto de lições e no campo `explanation`.
- `best`/`total` gravados antes da ampliação ficam defasados nos 25 bancos (cosmético; sem perda de respostas).

## Ferramenta

`scripts/validate-content.mjs` estendido:
- **Duplicatas entre arquivos**: indexa stems normalizados de todas as fontes (bancos, minis, simulados) e rejeita repetições.
- **Concentração de gabarito**: alerta quando uma letra concentra ≥ 4 respostas e > 35% do banco (minis e bancos por sessão).
- Bancos por sessão passam a aceitar de 6 a 12 questões (antes: exatamente 6).

## Resultado pós-execução

| Métrica | Antes | Depois |
|---|---|---|
| Questões nos bancos CG | 150 (25 × 6) | 250 (25 × 10) |
| Questões CG no total (com minis 20/25) | 174 | 274 |
| Tempo de prática estimado (3 min/questão) | ≈ 8,7 h (~33% do prometido) | ≈ 13,7 h (~51%) |
| Máximo de gabaritos por letra, por banco | 2 | 3 |
| Bancos no padrão 10 questões | 0 | 25 |
| Explicações puramente calculísticas | 22 | 0 |
| Lições com CPC 02 / CPC 48 / CPC 36 | 0 | s11 / s11 / s30 |

Teoria: média de ~309 palavras no corpo das seções; as novas seções e exemplos encadeados elevam as lições-alvo (s11, s12, s16, s24, s29, s30), mas a profundidade da teoria segue sendo o principal limite estrutural do bloco — ver APP backlog.

## Verificação (gate da fase)

- `node scripts/validate-content.mjs`: **OK** (58/58; sem duplicatas; sem alerta de concentração).
- `npm run build`: **limpo** (1.595 módulos).
- Smoke: `#/`, `#/sessao/11` e `#/sessao/19/quiz` respondem 200 no preview da build; conteúdo novo confirmado nos bundles de `dist/assets` (quizzes 01-10, 11-20, 21-30 e lessons 01-15, 16-30).
- Spot-check de fases anteriores: Fase 0 é baseline; o validator completo revalidou todo o conteúdo (85 sessões).

## APP backlog (acumulado nesta fase)

1. **Semana 6 sem revisão/mini** (sessões 26–30 todas aulas) — requer mudança em `miniSessions`.
2. **Divisão fixa 40/60/20 min** na UI — ficou ainda mais desconectada do volume real após a prática dobrar (lições de ~5 min de leitura; bancos de 10 questões ≈ 30 min).
3. **`best`/`total` defasados** nos 25 bancos CG ampliados (cosmético).
4. **Timer do simulado** a 180 s/questão e lead do mini hardcode ("12 questões").
5. **Fase 5**: corrigir sub-representação da letra D no `simulado-c.json` (D=9 de 50).

## Arquivos alterados

- `src/content/quizzes-01-10.json` — bancos 1, 2, 3, 4, 6, 7, 8, 9 (6 → 10)
- `src/content/quizzes-11-20.json` — bancos 11, 12, 13, 14, 16, 17, 18, 19 (6 → 10)
- `src/content/quizzes-21-30.json` — bancos 21, 22, 23, 24, 26, 27, 28, 29, 30 (6 → 10)
- `src/content/lessons-01-15.json` — s11 e s12
- `src/content/lessons-16-30.json` — s16, s19, s21, s23, s24, s29, s30
- `scripts/validate-content.mjs` — duplicatas, concentração de gabarito, faixa 6–12
