# Fase 7 — IDs estáveis de questão (migração de progresso v1→v2)

**Data:** 10/11/2026 · **Escopo:** regra 5 do plano mestre — migrar os IDs de questão do banco de erros de posicionais (`s:{sessão}:{índice}`, `x:{letra}:{índice}`, `m:{sessão}:{índice}`, `d:{índice}`) para **hash estável do enunciado**, com bump da chave de progresso `aprova-crc:progress:v1` → `v2` e migração automática · **Natureza:** apenas código do app — **nenhum banco de conteúdo foi alterado** · **Aprovação:** usuário ("yes tackle that").

## Motivação

IDs posicionais quebram silenciosamente quando uma questão é inserida, reordenada ou trocada de banco: o ID passa a apontar para outra questão, e o banco de erros registra/corrige a questão errada. Por isso as regras de compatibilidade até aqui proibiam inserções e reordenações. Com IDs derivados do conteúdo, o progresso fica imune a mudanças estruturais nos bancos.

## Design

### ID estável
- `qid(q) = 'q:' + fnv1a(stem normalizado) + djb2(stem normalizado)` — dois hashes de 32 bits independentes em base 36 (14 caracteres), sobre o **enunciado normalizado com a mesma regra do validador** (minúsculas, espaços colapsados) — o validador já garante unicidade global de enunciados entre bancos, minis e simulados; as 5 questões demo foram conferidas por script contra todo o resto (0 colisões; 807/807 IDs únicos, verificados em implementação independente Python × JS).
- Colisão esperada com 807 questões em 2⁶⁴: ~10⁻¹³. Em caso de colisão futura, o índice adota primeira ocorrência (bancos/simulados vencem a demo) — degradação segura, sem crash.

### `Item.src` — localizador
- Cada questão carrega agora um `src` com o antigo ID posicional (`s:26:3` etc.), gerado no ponto de origem. Os filtros que antes liam o ID (`startsWith('x:A:')`, semana da aula etc.) passaram a ler o `src` — mesma semântica, agora sempre refletindo a localização **atual** da questão.

### Índice global e resolução
- `loadQuestionIndex()` carrega bancos + minis + simulados + demo (chunks lazy, cache em memória, **sem cachear rejeições** — permite retry após falha de rede) e devolve `byId` (hash → questão) e `bySrc` (posicional → questão).
- `resolveItems()` resolve tanto ids estáveis (`q:…`) quanto legados posicionais — necessário durante a janela de migração e em modo degradado. **Trade-off aceito:** com ids por hash, qualquer resolução exige o índice completo (todos os arquivos de questões) em vez de só os arquivos relevantes; custo único por sessão, coberto por cache HTTP (nomes de arquivo com hash).

### Migração v1→v2 (sem perda e sem corrida)
- `loadProgress()` lê `v2`; se só houver `v1`, usa `v1` (esquema antigo ainda funciona); se **ambas** existirem (migação interrompida por falha), mescla defensivamente (v2 vence por chave).
- Na inicialização, `translateProgress()` converte as chaves posicionais em hashes via índice; **órfãs são descartadas** (fixa a inflação eterna do contador "Revisar N questões"); grava `v2` e remove `v1`.
- Enquanto há chaves legadas pendentes, o app exibe "Preparando seu progresso…" (uma única vez, centenas de ms; usuários sem erros pendentes ou já em v2 não veem nada). O gate **elimina por construção** a corrida crítica: sem ele, acertar uma questão gravada sob chave legada apagaria só a chave nova e "ressuscitaria" o erro na tradução posterior.
- Corridas residuais: o tradutor recebe um *getter* do estado (lê o estado mais recente após o `await` do índice) e a navegação fica oculta durante o gate; atualizações de `last` em deep links são preservadas pela comparação antes do `setProgress`.
- `applyAttempt` agora recebe `src` junto do id: ao acertar, remove **ambas** as chaves (hash e eventual gêmeo posicional legado) — rede de segurança para o modo degradado.

### Recalculo de `best`
- A parte "recalcular/ressetar `best` quando `total` mudar" da regra 5 ficou **obsoleta**: a fase 6 introduziu `bestTotal` (par coerente `best`/`total` da tentativa em que o recorde foi feito), que já resolve a exibição. A migração preserva os pares como estão.

## Impacto nas regras de compatibilidade de conteúdo

| Operação | Antes (v1) | Agora (v2) |
|---|---|---|
| Editar texto de lição | livre | livre |
| Editar `explanation`/`area` in place | permitido | permitido |
| **Anexar questões ao fim do banco** | permitido | permitido |
| **Inserir/reordenar questões no meio do banco** | ❌ corrompia o banco de erros | ✅ **seguro** — o ID é o enunciado, não a posição |
| Remover questão | ❌ (ID órfão inflava o contador para sempre) | ❌ continua proibido — vira órfã não resolvável; substituir in place |
| IDs de sessão 1–85 | pinados aos tópicos | inalterado (progresso por sessão não migrou de esquema) |

## Verificação (gate da fase)

- `node scripts/validate-content.mjs`: **OK** (58/58).
- `npm run build`: **limpo** (762 ms; `tsc -b` sem erros).
- **Teste funcional da migração com o código real** (funções de hash extraídas de `src/content/index.ts` e executadas em Node contra os JSONs reais):
  - índice 807/807; round-trip `bySrc → byId → item` 807/807;
  - v1 sintético (7 chaves, 3 órfãs) → 4 hashes, contadores preservados (×2 mantido);
  - caso mesclado (mesma questão sob chave legada + hash) soma contadores; hash órfão é podado;
  - `applyAttempt` limpa hash e `src`;
  - filtros por `src` preservam a semântica (aulas 26–29 = 40 questões; simulado A = 50);
  - hashes conferem com o cálculo independente em Python (pré-implementação).
- Smoke do bundle: chaves `progress:v2` e `progress:v1` (leitura do legado), texto do gate e constantes do hash (FNV 16777619/2166136261, `padStart(7`) presentes; `GET /` no preview → **200**.
- Diff confinado a `src/main.tsx`, `src/content/index.ts` e `src/progress.ts` — **zero mudanças em JSONs de conteúdo**; nenhuma questão, lição ou gabarito tocado.

## Arquivos alterados

- `src/content/index.ts` — `Item.src`, `stemHash`/`qid`, `QuestionIndex` (`loadQuestionIndex`), `resolveItems` por índice (resolve `q:` e legados).
- `src/progress.ts` — chave `v2` (+ leitura/mescla defensiva do legado), `translateProgress`, `hasLegacyIds`, `resetProgress` limpa as duas chaves, `applyAttempt` com `src`.
- `src/main.tsx` — `tag` gera ids estáveis + `src`; filtros de revisão temática/híbrida/semanal por `src`; `submit` envia `src`; gate de boot ("Preparando seu progresso…") com navegação oculta até concluir.
