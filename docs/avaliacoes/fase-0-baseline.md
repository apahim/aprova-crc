# Fase 0 — Baseline técnico e de conteúdo

**Data:** 10/11/2026 · **Escopo:** infraestrutura e inventário completo (85 sessões) · **Método:** validação automatizada + inventário dos bancos

Fase sem alterações de conteúdo: registrou o ponto de partida da auditoria didática e fixou as regras de compatibilidade de progresso que valem para todas as fases.

## Verificações de infraestrutura

| Verificação | Resultado |
|---|---|
| `node scripts/validate-content.mjs` | OK — 58/58 aulas com lição e com banco de questões |
| `npm run build` (`tsc -b && vite build`) | Limpo |
| Sessões com lição desenvolvida (sem fallback da UI) | 85/85 |
| Lições sem `pitfalls` (erros e pegadinhas) | 0 |
| Formatação dos JSON de conteúdo | Estável por arquivo: lições com `refs` inline; quizzes 11–44/45–70 e minis com uma linha por questão; quizzes 01–10 em estilo misto |

## Estrutura do semestre

- 85 sessões em 17 semanas: **58 aulas**, **6 mini-simulados** (20, 25, 35, 40, 50, 55) e **21 revisões** (5, 10, 15, 45, 60, 65 e 71–85).
- Cada sessão promete 120 min (40 teoria / 60 exercícios / 20 revisão) — divisão fixa na UI, independente do volume real de conteúdo.
- Estoque inicial de questões: 58 bancos × 6 (348) + 6 minis × 12 (72) + 3 simulados × 50 (150) = **570 questões**.

## Distribuição de gabaritos

Equilibrada nos bancos por sessão, nos minis e nos simulados A e B. **Exceção:** `simulado-c.json` com A=13, B=14, C=14, **D=9** — letra D sub-representada; correção agendada para a Fase 5.

## Blueprint dos simulados

Os três simulados compartilham exatamente a mesma distribuição de áreas (50 questões cada):

| Área | Questões |
|---|---|
| Contabilidade Geral | 11 |
| Contabilidade Aplicada ao Setor Público | 5 |
| Noções de Direito e Legislação Aplicada | 5 |
| Teoria da Contabilidade e Princípios | 4 |
| Contabilidade Gerencial | 4 |
| Legislação e Ética Profissional | 4 |
| Contabilidade de Custos | 3 |
| Auditoria Contábil | 3 |
| Perícia Contábil | 3 |
| Língua Portuguesa Aplicada | 3 |
| Matemática Financeira e Estatística | 3 |
| Controladoria | 2 |

## Regras de compatibilidade de progresso (vigentes em todas as fases)

O progresso fica em `localStorage` (`aprova-crc:progress:v1`) e referencia questões por ID posicional (`s:{sessão}:{índice}`, `x:{letra}:{índice}`, `m:{sessão}:{índice}`). Por isso:

1. **Texto de lições:** edição livre (não afeta progresso).
2. **Questões:** apenas edição in place (mesmo índice) ou acréscimo ao fim do banco. Nunca inserir, reordenar ou excluir.
3. **IDs de sessão 1–85 permanecem fixos** aos seus temas. Resequenciar é mudança de ruptura e exige aprovação explícita (bump v1→v2 com migração).
4. Quando um banco cresce, os `best`/`total` já gravados ficam defasados (efeito cosmético, sem perda de dados; as respostas por índice continuam válidas).

## APP backlog inicial

Itens de mecânica do aplicativo (fora do escopo de conteúdo; decisão do usuário):

- **Semana 6 sem revisão/mini:** as sessões 26–30 são todas aulas. Adicionar um mini exige alterar `miniSessions` em `src/content/index.ts` e criar o banco correspondente.
- **Divisão fixa 40/60/20 min** na tela da sessão (`time-grid` em `main.tsx`), sem relação com o volume real de teoria/prática da sessão.
- **`best`/`total` defasados** quando um banco cresce após tentativas registradas (cosmético).
- **Timer do simulado:** 180 s por questão (`budget = list.length × 180`).
- **Lead do mini hardcode** "12 questões originais" em `main.tsx` (quebra se o tamanho do mini mudar).
