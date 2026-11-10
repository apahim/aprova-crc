# Fase 8 — Formatação visual das lições (8a — avaliação)

**Data:** 10/11/2026 · **Escopo:** fase A do plano `~/.opencode/plan/aprova-crc-formatacao-visual.md` — auditoria de como as 85 lições **aparecem e leem na tela** (hierarquia, densidade mobile, escaneabilidade, consistência), complementando as fases 1–5 (conteúdo) · **Natureza:** somente leitura — nenhum JSON de conteúdo, CSS ou componente alterado · **Aprovação:** usuário ("yes").

**Decisões do usuário incorporadas:** (1) auditar também a demanda por tabelas comparativas; (2) fases A (avaliação) e B (execução de conteúdo); (3) inspeção nos dois temas; (4) **inspeção visual por LLM descartada** — tentativas anteriores de inspecionar as capturas falharam; os prints ficam como evidência para conferência humana.

## Método

1. **Censo quantitativo** — `scripts/lesson-format-metrics.mjs` (reexecutável como gate de regressão): palavras do corpo (`p`+`list` das seções; não conta objetivos/pitfalls/refs), tempo de leitura (180 ppm), maior parágrafo, % de parágrafos ≤60 palavras, parágrafos >120, nº de seções, blocos `formula` (cruzados com heurística de lição de cálculo), objectives/pitfalls/refs, flag "candidata a tabela" (palavras-chave comparativas).
2. **Contraste WCAG 2.1 (AA)** — `scripts/wcag-contrast.mjs` (novo, reexecutável): extrai as variáveis dos dois temas direto de `src/style.css` (sem cores hardcodeadas) e calcula as razões dos 15 pares texto/fundo efetivamente usados na lição e nas superfícies principais.
3. **Amostra estratificada em 390px, dois temas** — capturas em `docs/avaliacoes/fase-8-prints/` (12 PNGs).
4. **Leitura de professor** — onde a formatação prejudica retenção.

> **Nota de método (restrição de inspeção):** nenhum achado desta fase dependeu de leitura das imagens. Todos derivam de verificações determinísticas — métricas do JSON, contraste calculado sobre as variáveis dos dois temas, e inspeção do CSS e do DOM renderizado (`main.tsx`). Os prints permanecem como referência para verificação humana.

## Censo quantitativo

**85 lições · corpo (p+list):** mediana 289 palavras (P25 228 · P75 377 · P5 118 · P95 456), mín 96 (s82) · máx 521 (s53) · leitura a 180 ppm: mediana 1,6 min, máx 2,9 min. **363 seções** (4,3/lição em média). **32/85 lições com ≥1 bloco `formula`** — todas em s1–70; roteiros de revisão/simulado não usam fórmulas (por natureza). Estrutura auxiliar 100% dentro da rubrica: objectives 3–5 e pitfalls 3–6 em 85/85; nenhuma lição sem refs.

### Calibração da dimensão extensão

A banda original da rubrica (~600–1.100 palavras 🟢) assumia "lição de apostila"; o corpus real vai de 96 a 521 — **nenhuma lição alcança 600**. A função didática declarada (grade da fase 6: lição de ~2–3 min + consulta a normas + prática) é de roteiro pré-prática, e a profundidade de conteúdo já foi auditada nas fases 1–5. Banda **calibrada por tipo de sessão**:

| Tipo | Banda 🟢 | Faixa real |
|---|---|---|
| Aulas + minis (64 sessões) | 180–550 | 216–521 |
| Roteiros de revisão/simulado (21 sessões) | 90–270 | 96–266 |

Sob a banda calibrada: **zero lições 🔴 por extensão** — a flag EXT-B do censo (69 lições <400) dissolve-se, e a dimensão passa a guarda de regressão (aviso não-bloqueante do validador na fase B).

### Heatmap (censo completo)

Legenda: palavras = corpo (p+list) · min = leitura a 180 ppm · ¶máx = maior parágrafo em palavras · %≤60 = parágrafos ≤60 palavras · flags: MURI ¶>120 · DENSA %≤60<80 · CALC numérica sem `formula` · SEC fora de 3–6 seções · TAB candidata a tabela comparativa · EXT-B <400 (dissolvida pela calibração).

| id | palavras | min | seções | ¶ | ¶máx | ¶>120 | %≤60 | itens lista | fórmulas | obj | pitfalls | refs | flags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 319 | 1.8 | 5 | 8 | 45 | 0 | 100% | 4 | 1 | 4 | 4 | 2 | EXT-B |
| 2 | 252 | 1.4 | 4 | 7 | 46 | 0 | 100% | 4 | 1 | 4 | 4 | 1 | EXT-B |
| 3 | 228 | 1.3 | 4 | 5 | 53 | 0 | 100% | 4 | 1 | 4 | 4 | 2 | EXT-B |
| 4 | 228 | 1.3 | 5 | 6 | 46 | 0 | 100% | 5 | 1 | 4 | 4 | 3 | EXT-B |
| 5 | 220 | 1.2 | 4 | 4 | 41 | 0 | 100% | 8 | 0 | 4 | 4 | 1 | EXT-B |
| 6 | 260 | 1.4 | 4 | 7 | 50 | 0 | 100% | 4 | 0 | 4 | 4 | 3 | EXT-B |
| 7 | 248 | 1.4 | 4 | 6 | 44 | 0 | 100% | 5 | 0 | 4 | 4 | 3 | EXT-B TAB |
| 8 | 258 | 1.4 | 5 | 5 | 52 | 0 | 100% | 5 | 0 | 4 | 4 | 3 | EXT-B |
| 9 | 256 | 1.4 | 4 | 6 | 48 | 0 | 100% | 5 | 0 | 4 | 4 | 2 | EXT-B |
| 10 | 216 | 1.2 | 4 | 4 | 47 | 0 | 100% | 8 | 0 | 4 | 4 | 4 | EXT-B TAB |
| 11 | 424 | 2.4 | 7 | 9 | 47 | 0 | 100% | 8 | 1 | 4 | 4 | 7 | SEC |
| 12 | 463 | 2.6 | 5 | 11 | 73 | 0 | 91% | 0 | 1 | 4 | 4 | 2 | TAB |
| 13 | 277 | 1.5 | 4 | 6 | 55 | 0 | 100% | 4 | 1 | 4 | 4 | 3 | EXT-B |
| 14 | 291 | 1.6 | 4 | 8 | 54 | 0 | 100% | 5 | 0 | 4 | 4 | 3 | EXT-B |
| 15 | 240 | 1.3 | 4 | 4 | 53 | 0 | 100% | 8 | 0 | 4 | 4 | 5 | EXT-B TAB |
| 16 | 433 | 2.4 | 5 | 9 | 68 | 0 | 89% | 4 | 3 | 4 | 5 | 2 | — |
| 17 | 324 | 1.8 | 4 | 5 | 67 | 0 | 60% | 4 | 1 | 4 | 5 | 3 | DENSA EXT-B |
| 18 | 284 | 1.6 | 4 | 5 | 74 | 0 | 80% | 3 | 1 | 4 | 5 | 3 | EXT-B |
| 19 | 384 | 2.1 | 4 | 5 | 171 | 1 | 60% | 0 | 1 | 4 | 5 | 3 | MURI DENSA EXT-B TAB |
| 20 | 269 | 1.5 | 4 | 3 | 64 | 0 | 67% | 9 | 0 | 4 | 5 | 2 | DENSA EXT-B |
| 21 | 314 | 1.7 | 4 | 4 | 64 | 0 | 50% | 9 | 1 | 4 | 5 | 2 | DENSA EXT-B |
| 22 | 272 | 1.5 | 4 | 4 | 73 | 0 | 0% | 0 | 2 | 4 | 5 | 2 | DENSA EXT-B |
| 23 | 329 | 1.8 | 4 | 4 | 110 | 0 | 25% | 5 | 1 | 4 | 5 | 2 | DENSA EXT-B |
| 24 | 400 | 2.2 | 5 | 8 | 81 | 0 | 88% | 3 | 1 | 4 | 5 | 3 | — |
| 25 | 227 | 1.3 | 4 | 3 | 53 | 0 | 100% | 9 | 0 | 4 | 5 | 4 | EXT-B |
| 26 | 333 | 1.9 | 4 | 4 | 57 | 0 | 100% | 10 | 0 | 4 | 5 | 2 | EXT-B |
| 27 | 246 | 1.4 | 4 | 4 | 61 | 0 | 75% | 7 | 0 | 4 | 5 | 1 | DENSA EXT-B |
| 28 | 279 | 1.6 | 4 | 5 | 71 | 0 | 80% | 5 | 1 | 4 | 5 | 1 | EXT-B TAB |
| 29 | 402 | 2.2 | 5 | 6 | 84 | 0 | 83% | 7 | 0 | 4 | 5 | 2 | CALC TAB |
| 30 | 473 | 2.6 | 5 | 8 | 92 | 0 | 63% | 3 | 2 | 4 | 5 | 5 | DENSA TAB |
| 31 | 513 | 2.9 | 5 | 10 | 68 | 0 | 90% | 8 | 2 | 4 | 5 | 3 | TAB |
| 32 | 449 | 2.5 | 5 | 9 | 87 | 0 | 89% | 5 | 1 | 4 | 5 | 3 | TAB |
| 33 | 434 | 2.4 | 5 | 7 | 66 | 0 | 86% | 8 | 3 | 4 | 5 | 2 | TAB |
| 34 | 350 | 1.9 | 4 | 7 | 59 | 0 | 100% | 4 | 1 | 4 | 5 | 2 | EXT-B TAB |
| 35 | 249 | 1.4 | 5 | 6 | 42 | 0 | 100% | 10 | 0 | 4 | 5 | 2 | EXT-B |
| 36 | 418 | 2.3 | 5 | 10 | 55 | 0 | 100% | 4 | 1 | 4 | 5 | 1 | TAB |
| 37 | 456 | 2.5 | 6 | 11 | 73 | 0 | 91% | 8 | 1 | 4 | 5 | 3 | — |
| 38 | 288 | 1.6 | 4 | 5 | 50 | 0 | 100% | 10 | 1 | 4 | 5 | 2 | EXT-B TAB |
| 39 | 377 | 2.1 | 5 | 7 | 52 | 0 | 100% | 4 | 2 | 4 | 5 | 2 | EXT-B TAB |
| 40 | 217 | 1.2 | 4 | 5 | 39 | 0 | 100% | 10 | 0 | 4 | 5 | 2 | EXT-B TAB |
| 41 | 311 | 1.7 | 4 | 6 | 54 | 0 | 100% | 4 | 0 | 4 | 5 | 4 | EXT-B |
| 42 | 357 | 2.0 | 4 | 5 | 68 | 0 | 80% | 8 | 0 | 4 | 5 | 3 | EXT-B |
| 43 | 429 | 2.4 | 4 | 9 | 104 | 0 | 89% | 0 | 0 | 4 | 5 | 3 | — |
| 44 | 331 | 1.8 | 4 | 5 | 58 | 0 | 100% | 7 | 0 | 4 | 5 | 5 | EXT-B |
| 45 | 266 | 1.5 | 5 | 3 | 50 | 0 | 100% | 12 | 0 | 4 | 5 | 4 | EXT-B |
| 46 | 289 | 1.6 | 4 | 6 | 67 | 0 | 83% | 5 | 0 | 4 | 5 | 4 | EXT-B |
| 47 | 320 | 1.8 | 4 | 6 | 63 | 0 | 83% | 4 | 0 | 4 | 5 | 3 | EXT-B |
| 48 | 396 | 2.2 | 4 | 7 | 77 | 0 | 86% | 4 | 1 | 4 | 5 | 3 | EXT-B |
| 49 | 357 | 2.0 | 4 | 9 | 57 | 0 | 100% | 0 | 1 | 4 | 5 | 4 | EXT-B TAB |
| 50 | 216 | 1.2 | 4 | 4 | 48 | 0 | 100% | 10 | 0 | 4 | 5 | 2 | EXT-B |
| 51 | 361 | 2.0 | 4 | 7 | 68 | 0 | 86% | 4 | 0 | 4 | 5 | 4 | EXT-B |
| 52 | 334 | 1.9 | 5 | 8 | 57 | 0 | 100% | 0 | 1 | 4 | 5 | 7 | EXT-B TAB |
| 53 | 521 | 2.9 | 6 | 10 | 94 | 0 | 70% | 5 | 0 | 5 | 5 | 10 | DENSA TAB |
| 54 | 332 | 1.8 | 4 | 6 | 60 | 0 | 100% | 5 | 0 | 4 | 5 | 4 | EXT-B |
| 55 | 229 | 1.3 | 4 | 4 | 45 | 0 | 100% | 10 | 0 | 4 | 5 | 2 | EXT-B |
| 56 | 453 | 2.5 | 5 | 5 | 72 | 0 | 80% | 15 | 0 | 4 | 5 | 3 | — |
| 57 | 403 | 2.2 | 5 | 6 | 50 | 0 | 100% | 12 | 0 | 4 | 5 | 3 | — |
| 58 | 402 | 2.2 | 5 | 7 | 92 | 0 | 86% | 6 | 0 | 4 | 5 | 4 | — |
| 59 | 351 | 1.9 | 5 | 7 | 60 | 0 | 100% | 5 | 0 | 4 | 5 | 3 | EXT-B |
| 60 | 166 | 0.9 | 3 | 3 | 37 | 0 | 100% | 6 | 0 | 3 | 3 | 2 | EXT-B |
| 61 | 391 | 2.2 | 5 | 8 | 58 | 0 | 100% | 3 | 0 | 4 | 5 | 1 | EXT-B |
| 62 | 382 | 2.1 | 5 | 6 | 59 | 0 | 100% | 9 | 0 | 4 | 5 | 2 | EXT-B |
| 63 | 370 | 2.1 | 5 | 7 | 62 | 0 | 86% | 5 | 0 | 4 | 5 | 2 | EXT-B |
| 64 | 364 | 2.0 | 5 | 6 | 99 | 0 | 83% | 5 | 0 | 4 | 5 | 4 | CALC EXT-B |
| 65 | 169 | 0.9 | 3 | 3 | 60 | 0 | 100% | 6 | 0 | 3 | 3 | 3 | EXT-B TAB |
| 66 | 305 | 1.7 | 5 | 6 | 55 | 0 | 100% | 4 | 2 | 4 | 5 | 1 | EXT-B TAB |
| 67 | 255 | 1.4 | 4 | 5 | 48 | 0 | 100% | 4 | 2 | 4 | 5 | 1 | EXT-B TAB |
| 68 | 270 | 1.5 | 4 | 5 | 70 | 0 | 80% | 4 | 1 | 4 | 5 | 1 | EXT-B TAB |
| 69 | 338 | 1.9 | 5 | 6 | 80 | 0 | 67% | 3 | 1 | 4 | 5 | 1 | DENSA EXT-B TAB |
| 70 | 377 | 2.1 | 6 | 7 | 72 | 0 | 71% | 4 | 0 | 4 | 5 | 1 | DENSA EXT-B |
| 71 | 165 | 0.9 | 3 | 3 | 45 | 0 | 100% | 5 | 0 | 3 | 4 | 1 | EXT-B |
| 72 | 127 | 0.7 | 3 | 2 | 38 | 0 | 100% | 5 | 0 | 3 | 3 | 1 | EXT-B |
| 73 | 160 | 0.9 | 4 | 3 | 49 | 0 | 100% | 4 | 0 | 3 | 4 | 1 | EXT-B |
| 74 | 177 | 1.0 | 3 | 2 | 61 | 0 | 50% | 7 | 0 | 3 | 4 | 7 | DENSA EXT-B |
| 75 | 187 | 1.0 | 3 | 2 | 64 | 0 | 50% | 6 | 0 | 3 | 4 | 2 | DENSA EXT-B TAB |
| 76 | 105 | 0.6 | 3 | 2 | 41 | 0 | 100% | 5 | 0 | 3 | 3 | 1 | EXT-B |
| 77 | 98 | 0.5 | 3 | 2 | 35 | 0 | 100% | 4 | 0 | 3 | 3 | 1 | EXT-B |
| 78 | 174 | 1.0 | 4 | 3 | 56 | 0 | 100% | 4 | 0 | 3 | 4 | 1 | EXT-B |
| 79 | 170 | 0.9 | 3 | 2 | 59 | 0 | 100% | 7 | 0 | 3 | 4 | 4 | EXT-B |
| 80 | 158 | 0.9 | 4 | 2 | 44 | 0 | 100% | 10 | 0 | 3 | 4 | 4 | EXT-B TAB |
| 81 | 102 | 0.6 | 3 | 2 | 36 | 0 | 100% | 4 | 0 | 3 | 3 | 1 | EXT-B |
| 82 | 96 | 0.5 | 3 | 2 | 37 | 0 | 100% | 4 | 0 | 3 | 3 | 1 | EXT-B |
| 83 | 118 | 0.7 | 3 | 2 | 38 | 0 | 100% | 4 | 0 | 3 | 3 | 1 | EXT-B |
| 84 | 175 | 1.0 | 4 | 3 | 49 | 0 | 100% | 4 | 0 | 3 | 4 | 1 | EXT-B |
| 85 | 230 | 1.3 | 4 | 4 | 60 | 0 | 100% | 5 | 0 | 4 | 5 | 1 | EXT-B |

## Auditoria de contraste (WCAG 2.1, AA)

Texto grande (≥24px, ou ≥18,66px negrito) exige 3:1; demais texto, 4,5:1. Saída íntegra do script (15 pares × 2 temas):

| Par | Uso | px | AA | Claro | Escuro |
|---|---|---|---|---|---|
| h1 da página (--text/--panel) | título da sessão/lição | 28 | 3 | 14.06:1 ✅ | 14.33:1 ✅ |
| Corpo da lição (p, li) (--body/--panel) | parágrafos e itens de lista | 15 | 4.5 | 6.15:1 ✅ | 11.10:1 ✅ |
| Muted (--muted/--panel) | lead e linha de referências | 15 | 4.5 | 4.45:1 ❌ | 7.71:1 ✅ |
| Muted-2 (--muted-2/--panel) | legendas pequenas (n/5, privacidade) | 11 | 4.5 | 3.08:1 ❌ | 5.36:1 ✅ |
| Eyebrow (--eyebrow/--panel) | rótulo de seção da página | 11 | 4.5 | 4.86:1 ✅ | 9.44:1 ✅ |
| Accent-text (--accent-text/--panel) | botão secundário, grade de tempo | 13 | 4.5 | 7.28:1 ✅ | 9.35:1 ✅ |
| Ok (--ok/--panel) | ícone de concluído | 20 | 4.5 | 4.06:1 ❌ | 8.83:1 ✅ |
| Bad-text (--bad-text/--panel) | mensagem de erro/limpar progresso | 13 | 4.5 | 5.83:1 ✅ | 8.26:1 ✅ |
| Nav-idle (--nav-idle/--panel) | navegação inferior inativa | 11 | 4.5 | 3.21:1 ❌ | 6.54:1 ✅ |
| Fórmula (--accent-text/--accent-soft) | bloco de fórmula da lição | 15 | 4.5 | 6.51:1 ✅ | 8.00:1 ✅ |
| Notice (--soft-text/--soft-bg) | aviso ao pé da lição | 13 | 4.5 | 4.85:1 ✅ | 7.94:1 ✅ |
| Explanation (--explanation-text/--explanation-bg) | explicação pós-questão | 13 | 4.5 | 7.07:1 ✅ | 10.01:1 ✅ |
| On-accent (--on-accent/--accent) | hero e botão primário | 14 | 4.5 | 7.28:1 ✅ | 5.23:1 ✅ |
| Hero-muted (--hero-muted/--accent) | textos pequenos do hero | 12 | 4.5 | 5.76:1 ✅ | 3.85:1 ❌ |
| Result (--text/--result-bg) | painel de resultado do quiz | 15 | 4.5 | 12.67:1 ✅ | 13.39:1 ✅ |

Falhas AA: 5

**Falhas AA (4 de texto + 1 nuance) — todas na camada render (backlog APP):**

| Par | Tema | Razão | Onde aparece |
|---|---|---|---|
| `--muted`/`--panel` | claro | 4,45:1 | lead da sessão e **linha de referências das lições** (15px) — falha marginal, único par de leitura da lição |
| `--muted-2`/`--panel` | claro | 3,08:1 | legendas de 11px (n/5 do seletor de semana, nota de privacidade) |
| `--nav-idle`/`--panel` | claro | 3,21:1 | labels inativos da navegação inferior (11px) |
| `--hero-muted`/`--accent` | escuro | 3,85:1 | textos pequenos do hero (12px) |
| `--ok`/`--panel` | claro | 4,06:1 | **nuance:** usado só em ícone (✓ de concluída) — como componente não textual o critério é 1.4.11 (3:1) e passa; falharia se virasse texto |

Todos os pares de leitura das lições passam nos dois temas: corpo 6,15/11,10 · fórmula 6,51/8,00 · explicação do quiz 7,07/10,01 · aviso 4,85/7,94 · títulos 14,06/14,33. O bloco `formula` já é visualmente distinto (fundo `--accent-soft`, centrado, peso 750) e contrastado.

**Valores sugeridos** (mesma família de matiz, ajuste uniforme de canais até ≥4,5:1 — para o backlog APP): `--muted` claro #687c73→**#677b72** (4,51) · `--muted-2` claro #85978d→**#687a70** (4,56) · `--nav-idle` claro #82948a→**#687a70** (4,56) · `--hero-muted` escuro #c9e3d6→**#daf4e7** (4,50).

## Bug de render achado na inspeção do CSS

```css
.option.incorrect{border-color:var(--bad-border);background:var(--panel)1ee}
```

`var(--panel)1ee` é um typo (o alvo era `var(--bad-soft)` — variável definida nos dois temas e **nunca referenciada**). Efeito por substituição de `var()`:

- **Claro:** `#fff` + `1ee` → `#fff1ee` — acidentalmente idêntico a `--bad-soft` claro; funciona por sorte.
- **Escuro:** `#161d18` + `1ee` → token inválido → em *computed-value time* o `background` decai ao valor inicial (transparente) → **a opção incorreta perde o fundo suave no tema escuro**, restando só a borda.

Correção de 1 linha (backlog APP): `background:var(--bad-soft)`.

## Amostra estratificada (prints — referência humana)

Capturas a 390px nos dois temas (tema fixado via cópia servida do build com `localStorage` presetado), em `docs/avaliacoes/fase-8-prints/`:

| Lição | Critério de estratificação | Arquivos |
|---|---|---|
| s19 · IRPJ, CSLL e tributos diferidos | pior caso de densidade (¶ 171 palavras; única MURI) | `s19-{light,dark}.png` |
| s26 · Princípios de Contabilidade e Estrutura Conceitual | próximo da mediana (333; rica em listas) | `s26-{light,dark}.png` |
| s33 · Custeio variável, margem de contribuição e ponto de equilíbrio | mais rica em fórmulas (3 blocos) | `s33-{light,dark}.png` |
| s53 · Auditoria: procedimentos e relatórios | maior lição (521 palavras) | `s53-{light,dark}.png` |
| s74 · Revisão de Contabilidade Geral | roteiro de revisão temática (DENSA 50%) | `s74-{light,dark}.png` |
| s82 · Simulado C: questões 26 a 50 | menor lição (96 palavras) | `s82-{light,dark}.png` |

## Achados classificados (conteúdo × render)

### Conteúdo (JSON) — alvo da fase B

| Prioridade | Lições | Achado | Intervenção |
|---|---|---|---|
| **P0** | s19 | ¶ de 171 palavras funde o exemplo numérico trimestral (IRPJ 15% + adicional + CSLL 12%/9%) com a regra de transição da LC 224/2025 (acréscimo de 10% acima de R$ 5 mi, anterioridade nonagesimal, proporcionalização do 2º trimestre); 0 itens de lista | Quebrar em 2–3 ¶; exemplo numérico em passos (`list`); presunções em bloco `formula` |
| **P1** | 17, 20, 21, 22, 23, 27, 30, 53, 69, 70, 74, 75 | DENSA: %≤60 abaixo de 80 (50–75%; s22 com 0% — 4 ¶ todos >60 e zero listas) | Quebrar parágrafos; s22/s74/s75 também converter enumerações soterradas em `list` |
| **P1** | 29, 64 | CALC: seções "Exemplo(s) numéricos" sem nenhum bloco `formula` | Destacar as fórmulas dos exemplos (passivo de arrendamento; multa de 40% do FGTS etc.) |
| **P1** | 11 | SEC: 7 seções | Fundir "Moeda estrangeira (CPC 02)" + "Instrumentos financeiros: categorias de mensuração (CPC 48)" (ou reequilibrar para 6) |
| **P2** | 7, 10, 12, 15, 28, 31, 32, 33, 34, 36, 38, 39, 40, 49, 52, 65, 66, 67, 68, 80 (TAB sem P0/P1) | 26 lições candidatas a tabela comparativa; sem schema de tabela, o teto da fase B é converter prosa comparativa em listas paralelas | Converter onde houver enumeração soterrada; a tabela em si é fase C (schema/render) |
| **P2** | todas | Refs com grafias duplicadas (121 únicas): "CPC 16 (R1)" × "CPC 16 (R1) – Estoques"; "ITG 2000 (R1)" × "…– Escrituração Contábil"; "CPC 00 (R2)" × "…– Estrutura Conceitual"; "Edital … vigente" × "…do CFC"; 3 títulos de seção >55 chars (s11, s31, s53 — ~3 linhas a 350px) | Normalizar uma grafia por norma; encurtar os 3 títulos |

### Render (CSS/componentes) — backlog APP (a fase 8 não altera)

1. **Bug `.option.incorrect`** — fundo inválido no tema escuro (detalhe acima); correção de 1 linha.
2. **Contraste AA** — 4 pares reprovados (tabela acima), com valores sugeridos.
3. **Lacunas de schema (fase C, decisão futura):** tabelas comparativas (maior valor — 26 lições candidatas), ênfase inline, bloco de exemplo resolvido.

## Rubrica calibrada (gate da fase B)

| Dimensão | Limiar | Situação no censo |
|---|---|---|
| Densidade mobile | ≥80% dos ¶ ≤60 palavras; nenhum >120 | 13 violações (s19 também >120) |
| Escaneabilidade | enumerações em `list`, não em prosa | s12 e s22 com 0 itens; 26 TAB |
| Fórmulas | lição de cálculo (heurística CALC) com ≥1 `formula` | 2 violações (s29, s64) |
| Hierarquia | 3–6 seções, títulos informativos | 1 violação (s11, 7) |
| Consistência | objectives 3–5 · pitfalls 3–6 · refs ≥1 | 0 violações (85/85) |
| Extensão | aulas+minis 180–550 · roteiros 90–270 (calibrada; era ~600–1.100) | 0 violações |
| Render | contraste AA nos dois temas; `formula` visualmente distinto | 4 falhas AA + 1 bug de fundo (backlog APP) |

## Verificação (gate da fase)

- Diff confinado a `docs/` e `scripts/` — **zero mudanças em JSONs de conteúdo, CSS ou componentes**.
- `node scripts/validate-content.mjs`: **OK** (58/58 aulas com lição e banco).
- Scripts reexecutáveis e determinísticos: `node scripts/lesson-format-metrics.mjs` e `node scripts/wcag-contrast.mjs` — as tabelas deste relatório são suas saídas íntegras.
- 12 prints intactos em `docs/avaliacoes/fase-8-prints/` (nenhuma imagem foi lida ou alterada nesta fase).

## Arquivos desta fase

- `docs/avaliacoes/fase-8-formatacao-visual.md` — este relatório (entregável da fase A).
- `scripts/wcag-contrast.mjs` — novo: razões WCAG AA dos dois temas, direto de `style.css`.
- `scripts/lesson-format-metrics.mjs` + `docs/avaliacoes/fase-8-prints/` — censo e capturas (commit `a160e13`).
