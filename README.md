# Aprova CRC

Site estático mobile-first para estudos do Exame de Suficiência do CFC. 17 semanas, 85 sessões de 2h, sem login. O progresso (sessões concluídas e melhores resultados) fica salvo localmente no navegador — nada é enviado a servidores.

## Conteúdo

- Calendário completo das 85 sessões, alinhado às 13 áreas de conhecimento do edital (prova com 50 questões, 4 alternativas, nota de corte 25/50).
- Aulas com teoria, exemplos numéricos e pegadinhas frequentes; prática com questões comentadas em cada sessão.
- Mini-simulados por bloco (12 questões) e simulados A, B e C (50 questões cada), no formato do exame.
- Progresso salvo no navegador (localStorage): retomada da próxima sessão pendente, marcação de sessões concluídas, melhor resultado por sessão e contagem por semana. Há link para apagar todo o progresso na página inicial.

Todas as questões são **originais e extraoficiais**. Confira o edital da edição em que for prestar o exame antes de usar o conteúdo como referência definitiva.

## Rodar localmente

```sh
npm install
npm run dev
```

## Publicar no GitHub Pages

O deploy é automático via GitHub Actions a cada push na branch `main`:

1. Uma única vez: em **Settings → Pages → Build and deployment**, escolha **GitHub Actions** como fonte.
2. Faça push para `main`; acompanhe a execução em **Actions → Deploy GitHub Pages**.
3. O site fica em `https://SEU_USUARIO.github.io/aprova-crc/`.

Para validar a estrutura do conteúdo (currículo, lições e bancos de questões):

```sh
node scripts/validate-content.mjs
```

## Estrutura de conteúdo

- `src/curriculum.json` — as 85 sessões (id, semana, dia, bloco, título, tipo).
- `src/content/lessons-*.json` — conteúdo didático por sessão (objetivos, seções, pegadinhas, referências).
- `src/content/quizzes-*.json` — bancos de prática por sessão (6 questões cada).
- `src/content/minis.json` — mini-simulados por bloco.
- `src/content/simulado-[a|b|c].json` — simulados completos de 50 questões.

## Tecnologia

React, Vite, TypeScript, CSS próprio e GitHub Actions. Sem banco de dados, autenticação, rastreamento ou dependência de API externa. O progresso persiste em localStorage, por navegador/dispositivo, sem sincronização entre dispositivos.
