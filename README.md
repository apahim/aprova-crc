# Aprova CRC

Site estático mobile-first para estudos do Exame de Suficiência CFC. 17 semanas, 85 sessões de 2h, sem login e sem salvar progresso.

## Conteúdo

O calendário das 85 sessões está cadastrado. **Aula 1 tem material demonstrativo ampliado e questões originais**. As demais sessões incluem objetivos e roteiro inicial; **não são 170 horas de aulas completas**. Não publique como curso integral sem revisão e produção didática adicional. Questões de exemplo são originais, não oficiais. Confira o edital de 2027 antes de usar como referência definitiva.

## Rodar localmente

```sh
npm install
npm run dev
```

## Publicar no GitHub Pages pelo iPhone

1. Crie um repositório público `aprova-crc` em https://github.com/new (inicialmente vazio).
2. No Safari, abra https://github.com/SEU_USUARIO/aprova-crc e use **Add file → Upload files**. O upload web de ZIP **não extrai** arquivos automaticamente. Para enviar a estrutura completa, use um editor Git web compatível com upload de pastas ou faça upload dos arquivos descompactados preservando as pastas; no iPhone, isso pode exigir um editor Git com suporte a diretórios. Alternativamente, use github.dev para criar/colar arquivos individualmente.
3. Faça commit na branch `main`.
4. Em **Settings → Pages → Build and deployment**, escolha **GitHub Actions**.
5. Abra **Actions** e aguarde a execução de `Deploy GitHub Pages`.
6. Acesse `https://SEU_USUARIO.github.io/aprova-crc/`.

**Importante:** o GitHub não publica o ZIP diretamente. O projeto precisa estar extraído no repositório.

## Tecnologia

React, Vite, TypeScript, CSS próprio e GitHub Actions. Sem banco de dados, autenticação, rastreamento ou dependência de API externa.
