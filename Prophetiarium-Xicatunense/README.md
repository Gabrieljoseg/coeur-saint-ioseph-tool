# Prophetiarium Xicatunense

Projeto para converter o PDF "Prophetiarium Xicatunense (1).pdf" em formato GABC para uso no aplicativo de canto gregoriano.

## Estrutura do Projeto

- `pdf-original/` - Cópia do PDF original
- `markdown/` - Arquivos markdown com informações sobre as profecias
- `transcriptions/` - Transcrições em formato GABC
- `partitura-notas/` - Sequência de neumas GABC em `.txt` (ver README dentro da pasta; regenerar com `node transcriptions/extract-notas-partitura.mjs`)
- `corpus-profetias/` - Uma pasta por profecia com **letra + partitura + análise** (GABC token a token: claves, divisões, virgas, bemol, episema, heurística podatus/clivis…); ver `corpus-profetias/README.md` e `node transcriptions/build-corpus-profetias.mjs`
- `latin-vulgate-mais-notas/` - **Junção** de `transcriptions/latin-vulgate/` + `partitura-notas/` num único `.txt` por profecia; regenerar com `node transcriptions/join-latin-vulgate-notas.mjs` (idealmente após `extract-notas-partitura.mjs`)
- `references/` - Referências e materiais de apoio

## Objetivo

Extrair os nomes das profecias e capítulos bíblicos do PDF e posteriormente converter as partituras em formato GABC.

**Situação:** partituras GABC completas existem só para **PROPHETIA I–III**. De **IV a XII** o `.gabc` ainda está vazio — não há outra cópia no repositório; falta transcrição a partir do PDF. Ver `transcriptions/PENDENTE_IV_A_XII.md`.