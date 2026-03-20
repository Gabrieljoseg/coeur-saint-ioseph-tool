# Por que PROPHETIA IV–XII não têm partitura no projeto?

**Não há ficheiros “escondidos”.** O que falta é **transcrição GABC** a partir do PDF.

| Profecia | `transcriptions/PROPHETIA_*.gabc` | `corpus-profetias/` / `partitura-notas/` |
|----------|-------------------------------------|------------------------------------------|
| I, II, III | **Completo** | Análise e notas geradas |
| IV a XII | **Só cabeçalho; corpo vazio** (ou lixo antigo removido pelo validador) | Só *stub* + README a explicar |

## Onde está o texto latino (para quando fores transcrever)?

- Texto contínuo (Vulgata local): `transcriptions/latin-vulgate/PROPHETIA_IV.txt` … `PROPHETIA_XII.txt`
- Referências bíblicas: `REFERENCIAS_PROPHETIAE.md`
- Partitura impressa: `pdf-original/Prophetiarium Xicatunense (1).pdf`

## O que fazer para “aparecer” IV em diante

1. Abrir o PDF na secção **PROPHETIA IV** (e seguintes).
2. Transcrever neuma a neuma para GABC no ficheiro certo, por exemplo:
   - `transcriptions/PROPHETIA_IV.gabc`
   - … até `PROPHETIA_XII.gabc`
3. Usar como modelo o estilo de `PROPHETIA_II.gabc` ou `PROPHETIA_III.gabc` (clave, sílabas `palavra(neuma)`, divisões `(,) (;) (:) (::)`).
4. Regenerar artefactos:
   ```bash
   cd Prophetiarium-Xicatunense/transcriptions
   node build-corpus-profetias.mjs
   node extract-notas-partitura.mjs
   ```

**Nota:** Eu (ferramenta) **não** consigo ler as neumas do PDF como texto; isso é trabalho humano (ou OMR + revisão). Por isso IV–XII ficaram por fazer — não foi omissão de pasta, foi falta de `.gabc` preenchido.
