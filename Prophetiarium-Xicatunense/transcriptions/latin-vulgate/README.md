# Texto latino das Prophetiae (Vulgata)

Cada ficheiro `PROPHETIA_*.txt` contém o trecho bíblico em **latim** correspondente ao *Prophetiarium Xicatunense*, extraído automaticamente dos ficheiros em `vulgate/` na raiz do repositório.

**Sem numeração** de capítulos ou versículos no corpo: só texto contínuo (versículos da mesma secção separados por espaço; blocos distintos — ex. dois trechos de livros diferentes — separados por linha em branco).

A primeira linha (ou primeiras) do ficheiro indica o título da profecia e a referência; o resto é puro latim.

## Referências completas

Ver [`../../REFERENCIAS_PROPHETIAE.md`](../../REFERENCIAS_PROPHETIAE.md) (livro, capítulo e versículos por profecia).

## Regenerar os `.txt`

Na pasta `transcriptions/`:

```bash
node extract-latin-vulgate.mjs
```

## Junção com neumas (`partitura-notas/`)

Para um único ficheiro por profecia com **latim + sequência GABC**:

```bash
node extract-notas-partitura.mjs
node join-latin-vulgate-notas.mjs
```

Saída: `latin-vulgate-mais-notas/PROPHETIA_*.txt`.
