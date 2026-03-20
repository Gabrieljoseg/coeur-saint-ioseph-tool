# Estado das transcrições GABC (PROPHETIA IV–XII)

O repositório tem **corpo musical** em `PROPHETIA_IV.gabc` … `PROPHETIA_XII.gabc`. A letra foi confrontada com `latin-vulgate/PROPHETIA_*.txt` (ver `REVISAO_GABC_VS_PDF.md`).

| Profecia | GABC (corpo) | Nota |
|----------|--------------|------|
| IV–XII | Preenchido | **Neumas** devem ser revistas **face ao PDF**; a revisão automática só cobre o **latim**. |

## Regenerar artefactos

```bash
cd Prophetiarium-Xicatunense/transcriptions
node build-corpus-profetias.mjs
node extract-notas-partitura.mjs
node join-latin-vulgate-notas.mjs
```

## Texto latino de apoio

- `latin-vulgate/PROPHETIA_*.txt`
- `REFERENCIAS_PROPHETIAE.md`
- `pdf-original/Prophetiarium Xicatunense (1).pdf`
