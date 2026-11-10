# Fase 8 — Formatação visual das lições (8c — render e schema)

**Data:** 10/11/2026 · **Escopo:** fase C do plano `~/.opencode/plan/aprova-crc-formatacao-visual.md` — correção do bug de CSS, ajustes de contraste AA e schema de tabelas comparativas (tipo + render + CSS + validador + conversão das lições com comparações 2D reais) · **Natureza:** lições (`lessons-*.json`), `src/content/index.ts`, `src/main.tsx`, `src/style.css` e os 3 scripts de gate — **nenhum quiz, mini, simulado, currículo ou lógica de progresso foi alterado** · **Aprovação:** usuário ("ok execute c").

> **Nota de método:** como nas fases 8a/8b, nenhum resultado depende de inspeção de imagens. Os 12 prints de `docs/avaliacoes/fase-8-prints/` seguem como referência humana; toda verificação aqui é determinística (matemática WCAG sobre as variáveis dos dois temas, contagens sobre o JSON, inspeção de CSS/DOM e smoke do bundle).

## 1. Bug de CSS — duas ocorrências do mesmo typo

O relatório 8a identificou `background:var(--panel)1ee` em `.option.incorrect`: o sufixo `1ee` gruda no valor substituído. No tema claro, `#fff` + `1ee` → `#fff1ee`, que por acaso é exatamente `--bad-soft` claro (funciona por sorte); no escuro, `#161d18` + `1ee` → token inválido → fundo decai a transparente, e a opção incorreta perde o realce.

**Durante a 8c foi encontrada a segunda ocorrência do mesmo typo**, não catalogada na 8a: `.review-link` (botão "revisar erros" pós-quiz) tinha `background:var(--panel)1ee` — mesmo acidente no claro (`#fff1ee`) e mesma perda no escuro.

| Seletor | Antes | Depois | Efeito |
|---|---|---|---|
| `.option.incorrect` | `var(--panel)1ee` | `var(--bad-soft)` | restaura o fundo suave da opção incorreta no tema escuro |
| `.review-link` | `var(--panel)1ee` | `var(--bad-soft)` | preserva o claro e restaura o fundo no escuro; par `--bad-text/--bad-soft` verificado AA (claro 5,29 · escuro 7,46) e incluído no script de contraste |

`--bad-soft` era definida nos dois temas e não era referenciada em lugar nenhum — confirmando que era o alvo original dos dois.

## 2. Contraste AA — 5 ajustes (4 planejados + 1 extra)

Valores anteriores da auditoria 8a; ajuste pelo menor degrau que cruza 4,5:1:

| Par | Tema | Uso | Antes | Depois |
|---|---|---|---|---|
| `--muted` #687c73 → **#677b72** | claro | lead e linha de referências | 4,45 ❌ | **4,51 ✅** |
| `--muted-2` #85978d → **#687a70** | claro | legendas de 11px (n/5, privacidade) | 3,08 ❌ | **4,56 ✅** |
| `--nav-idle` #82948a → **#687a70** | claro | navegação inferior inativa (11px) | 3,21 ❌ | **4,56 ✅** |
| `--hero-muted` #c9e3d6 → **#daf4e7** | escuro | textos pequenos do hero (12px) | 3,85 ❌ | **4,50 ✅** |
| `--ok` #1a8f68 → **#128760** | claro | `.phase-count.all-done` (11px) | 4,06 ❌ | **4,51 ✅** |

O quinto ajuste é **extra**: a 8a classificara `--ok` como "ícone de concluído" (20px, exigência 3:1), mas o mesmo token colore o rótulo de texto `.phase-count.all-done` na revisão — 11px, exigência 4,5:1. O novo valor mantém o ícone ✅ e corrige o rótulo. Resultado final: **0 falhas AA em 20 pares × 2 temas** (15 originais + 4 de tabela + 1 de review-link).

## 3. Schema de tabelas comparativas

**Tipo** (`src/content/index.ts`): `LessonTable = {head: string[]; rows: string[][]}`, opcional em `LessonSection.table`.

**Render** (`src/main.tsx`): dentro da seção, a ordem é `formula` → parágrafos → **tabela** → lista — a tabela entra logo após a exposição, e a lista fecha com conclusões (padrão de s33: dados → quadro absorção × variável → diferença e regra). Marcação semântica: `<table class="ltable">` com `<th scope="col">`; wrapper `<div class="twrap">` com `overflow-x:auto` e `-webkit-overflow-scrolling:touch` — em 390px a tabela rola horizontalmente em vez de quebrar o layout.

**CSS** (`src/style.css`): cabeçalho com o mesmo par do bloco `formula` (`--accent-text` sobre `--accent-soft`, 12px/750, `white-space:nowrap`); células `--body` sobre `--panel` (13px, `vertical-align:top`); zebra `--soft-bg` nas linhas pares (claro 5,63 · escuro 10,47 — AA); primeira coluna em `--text` peso 650 (chave da linha).

**Validador** (`scripts/validate-content.mjs`, bloqueante): `head` com strings não vazias; `rows` não vazio; toda linha com o mesmo nº de células da `head`, todas strings não vazias.

**Métricas** (`scripts/lesson-format-metrics.mjs`): células contam na extensão do corpo, mas não nas heurísticas de densidade/comparação — a tabela já é o formato escaneável; o flag TAB mede demanda de conversão, não defeito.

## 4. Conversões — 19 tabelas em 16 lições

Critério: **somente comparações genuinamente 2D** (≥2 itens × ≥2 atributos, células curtas). Enumerações sequenciais (cálculo passo a passo, passos do CPC 47, sequência da DRE) e checklists de revisão continuam em lista — formato correto.

| Lição | Tabelas |
|---|---|
| s7 | exemplo competência × caixa (item a item) |
| s12 ×2 | PEPS × média ponderada (custeio; ficha de estoques) |
| s22 | despesas por função × natureza |
| s23 | DLPA × DMPL (abrangência e movimentações) |
| s29 | cronograma do passivo de arrendamento (ano × juros × amortização × saldo) |
| s30 | vínculo com a investida × avaliação × norma (coligada, controlada, operação e empreendimento em conjunto); lista-resumo da seção de consolidação removida (coberta pela tabela e pelo ¶ de não controladores) |
| s31 | quadro-resumo das classificações de custos (fixos×variáveis, diretos×indiretos, primário×transformação) |
| s33 | absorção × variável (custo unitário, CMV e lucro do mesmo exemplo) |
| s34 ×2 | ordem × processo (acumulação e produção típica); coproduto/subproduto/sucata — o ¶ de critérios de rateio ganhou seção própria "Rateio dos custos conjuntos" (4→5 seções, dentro da rubrica 3–6) |
| s38 | análise vertical × horizontal |
| s49 | bens públicos do art. 99 (categoria × destinação × exemplos) |
| s52 | risco inerente × controle × detecção |
| s53 | tipos de opinião (com a linha de parágrafos de ênfase) |
| s66 | juros simples × compostos |
| s67 | desconto comercial × racional |
| s68 ×2 | cronograma do SAC (parcela × juros × amortização × pagamento, com linha de totais); comparação SAC × Price (parcelas, saldo, custo) |

**Não convertidas (deliberado):** checklists de revisão e roteiros (s10, s15, s36, s40, s80) e listas de cálculo sequencial (s19, s28, s39, s64, s65, s69, s75) — em todos esses casos a lista é o formato certo, e converter seria forma sem ganho de leitura.

## 5. Censo (antes → depois)

| Métrica | 8b | 8c |
|---|---|---|
| TAB (sinal de demanda de tabela) | 27 | **23** |
| Lições sem nenhum flag | 58 | **62** |
| Corpo: mediana / máx | 289 / 507 | 289 / 514 |
| Avisos de formatação no validador | 0 | **0** |

TAB caiu com a conversão de s7, s12, s29 e s67; as 23 restantes mantêm palavras-chave comparativas em prosa ou listas (ex.: "×" na regra de estoques da s33) — comportamento esperado da heurística, que segue como sinal de demanda futura, não como defeito.

## 6. Verificação (gate da fase)

- `node scripts/validate-content.mjs`: **OK** (58/58) — zero avisos de formatação; validação de tabela passando.
- `node scripts/wcag-contrast.mjs`: **0 falhas AA** em 20 pares × 2 temas.
- `node scripts/lesson-format-metrics.mjs`: somente TAB (23, sinal); 62 lições sem flags; mediana de corpo preservada.
- `npm run build`: **limpo** (tsc -b sem erros).
- **Diff confinado** a `lessons-*.json` + `src/content/index.ts` + `src/main.tsx` + `src/style.css` + 3 scripts — zero mudanças em quizzes, minis, simulados, currículo ou progresso.
- Formatação dos JSON preservada por arquivo (round-trip byte a byte verificado na 8b); patches com asserções de âncora.
- Verificação estrutural das 19 tabelas: todas com largura de linha = nº de colunas (script de conferência).
- Smoke do bundle: `twrap`/`ltable` e o render da tabela no bundle do app; conteúdo novo presente nos chunks de lição ("Parágrafos de ênfase…", "Empreendimento controlado em conjunto", "R$ 3.151,49"); strings antigas das listas convertidas ausentes.
- Preview da build: `GET /` → **200**, HTML servindo o bundle novo.

## Arquivos alterados

- `src/content/index.ts` — tipo `LessonTable` e `table?` em `LessonSection`
- `src/main.tsx` — render da tabela (¶ → tabela → lista; `th scope="col"`)
- `src/style.css` — 2 correções do typo `1ee`, 5 ajustes de contraste, estilos `.twrap`/`.ltable`
- `src/content/lessons-01-15.json` — s7, s12 (3 tabelas)
- `src/content/lessons-16-30.json` — s22, s23, s29, s30 (4 tabelas)
- `src/content/lessons-31-55.json` — s31, s33, s34 ×2, s38, s49, s52, s53 (8 tabelas)
- `src/content/lessons-56-85.json` — s66, s67, s68 ×2 (4 tabelas)
- `scripts/validate-content.mjs` — validação de shape de tabela
- `scripts/lesson-format-metrics.mjs` — células de tabela na extensão do corpo
- `scripts/wcag-contrast.mjs` — 4 pares de tabela + par review-link
