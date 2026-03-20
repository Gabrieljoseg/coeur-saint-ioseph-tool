# Revisão detalhada: GABC (`transcriptions/`) vs PDF *Prophetiarium Xicatunense*

**Ficheiros:** `pdf-original/Prophetiarium Xicatunense (1).pdf` · `transcriptions/PROPHETIA_*.gabc`  
**Data:** revisão assistida por comparação automática da **letra** + inspeção de excertos extraídos do PDF.

---

## 1. O que **não** dá para validar automaticamente

| Aspeto | Motivo |
|--------|--------|
| **Forma das neumas** (podatus, clivis, divisões, episema, etc.) | No PDF as notas são **gráfico/tipos musicais**; a extração de texto devolve lixo (`oF.sFo«…`) ou nada útil na linha das notas. |
| **Fidelidade melódica 1:1** | Exige confronto **visual** partitura ↔ GABC (ou áudio), não disponível neste processo. |

**Conclusão:** a revisão abaixo cobre sobretudo **texto latino** (subentendido na partitura e explícito no GABC).

---

## 2. Método usado para a **letra**

1. **Extração de sílabas do GABC** — mesmo critério que `regexOuter` em `util.js` / jgabc: sequência de grupos `palavra(neumas)`.
2. **Concatenação das sílabas** (sem espaços) e **normalização** (minúsculas, NFC, só letras/números).
3. **Referência A — `latin-vulgate/PROPHETIA_*.txt`** — texto contínuo gerado a partir da Vulgata local (`vulgate/`), alinhado às referências do livro.
4. **Referência B — PDF (pypdf)** — texto da camada digital; sujeito a erros (`?`, `=`, `ﬁ`, linhas partidas, **mistura com fonte de neumas** no fim de algumas secções).

Igualdade **GABC = Vulgata (ficheiro .txt)** após normalização ⇒ letra do canto alinhada ao extracto bíblico usado no repositório.  
Quando o **PDF** omite um trecho que o `.txt` tem (ex.: versículo não cantado), o GABC deve seguir o **PDF / partitura**, não o extracto completo.

---

## 3. Resultado global (letra normalizada, sílabas concatenadas)

| Profecia | vs `latin-vulgate/*.txt` | Nota |
|----------|---------------------------|------|
| **I** | **Igual** | Coincide com o extracto. |
| **II** | **Diferente no início** | O **GABC** (e o **PDF**) começam em *Noë vero cum quingentórum…*; o ficheiro **latin-vulgate** inclui ainda *Et facti sunt omnes dies Lamech…* (Gn 5,31 — primeira parte). O livro litúrgico **corta** esse incipit; o GABC está **coerente com o PDF**. |
| **III** | **Diferente no início** | O **GABC** (e o **PDF**) usam o incipit ***In diébus illis: Tentávit Deus Abraham***. A **Vulgata Clementina** em `Genesis` começa *Quæ postquam gesta sunt, tentávit…* O `latin-vulgate/PROPHETIA_III.txt` segue a Vulgata; o **GABC segue a edição impressa do Prophetiarium** (confirmado no texto extraído do PDF: *di- é-bus il- lis : Tentávit*). |
| **IV** | **Igual** | Texto completo alinhado ao extracto. |
| **V** | **Igual** | Idem. |
| **VI** | **Igual** | Idem. |
| **VII** | **Igual** | Idem. |
| **VIII** | **Igual** | Idem. |
| **IX** | **Diferente no fim** | O extracto em `latin-vulgate/PROPHETIA_IX.txt` termina em *Phase (id est tránsitus) Dómini* (Ex 12,1–11). O **GABC continua** com *Et transíbo per terram Ægýpti…* **até *Ego Dóminus*** (versículos posteriores a 12,11). Isto **alonga** a leção face ao título “12,1–11” e ao `.txt`; é preciso **confirmar na partitura em papel** se essa extensão está no PDF (a extração PDF após essa frase degenera em símbolos de notação). |
| **X** | **Igual** | Alinhado ao extracto. |
| **XI** | **Igual** | *Dt 31,22–30*; revisão 2026: primeira ocorrência de *Israël* unificada a `Is(h)ra(h)ël(h)` como nas outras profecias (antes `Is(h)ra(d)ël`). |
| **XII** | **Igual** (letra) | GABC completo *Daniel 3,1–24* alinhado a `latin-vulgate/PROPHETIA_XII.txt`; nota da Vulgata *Quæ sequúntur…* cantada como texto normal (sem `[` `]` no GABC, para compatibilidade Gregorio). **Neumas:** rever face ao PDF. |

---

## 4. Amostras PDF vs GABC (confirmação manual dos casos especiais)

### PROPHETIA II — incipit

- **PDF (extraído):** *Oë vero cum quingentórum esset annórum…* (equiv. *Noë vero…*).
- **GABC:** `(c4) Noë(g) vero(g) cum(g) quingentórum…`  
**Veredito letra:** **coerente** com o PDF; omissão da linha de Lamech é **intencional** na edição, não erro do GABC.

### PROPHETIA III — incipit

- **PDF (extraído):** *… di- é-bus il- lis : Tentávit Deus Abraham…*
- **GABC:** *In diébus illis: Tentávit Deus Abraham…*  
**Veredito letra:** **coerente** com o PDF (incipit litúrgico, não o primeiro versículo da Vulgata no Genesis 22).

### PROPHETIA IX — cauda

- **GABC** inclui trecho **depois** de *Phase (id est tránsitus) Dómini* com *Et transíbo per terram Ægýpti…* e *Ego Dóminus*.
- **`latin-vulgate/PROPHETIA_IX.txt`** para em *Dómini* após *tránsitus*.
- **PDF:** antes da zona corrompida lê-se *… Phái se (id eşt, tránsi iitus) Dómi…*; o resto da página mistura **neumas em fonte própria** na extração.  
**Veredito:** **revisão visual obrigatória** no PDF para saber se esses versículos extra estão na partitura; se o PDF parar em 12,11, o GABC estaria **longo** em relação à edição.

---

## 5. Neumas e articulação musical

Sem leitura humana da partitura, só se afirma:

- Os ficheiros **I–XI** (exceto nota do IX) usam **clave, divisões e notação GABC** de forma **internamente consistente** (padrão Gregorio/jgabc).
- **XII** não tem notação válida.

Para auditoria neumática completa: abrir o PDF página a página ao lado do `.gabc` no **Illuminare Score Editor**, **GABC Editor** ou **Gregorio**.

---

## 6. Recomendações

1. ~~**Substituir `PROPHETIA_XII.gabc`**~~ — ficheiro revisto (2026): letra completa; **neumas** ainda sujeitas a confronto visual com o PDF.  
2. **Documentar** em `REFERENCIAS_PROPHETIAE.md` ou `latin-vulgate/README.md`:
   - que **II** omite a primeira frase de Gn 5,31 no canto;
   - que **III** usa incipit *In diébus illis* e não *Quæ postquam*;
   - que **IX** pode incluir texto **além** de 12,11 — alinhar título/comentário e `PROPHETIA_IX.txt` ao que o PDF realmente imprime.  
3. **Regenerar** artefactos derivados após correções:  
   `node extract-notas-partitura.mjs` · `node join-latin-vulgate-notas.mjs` · `node build-corpus-profetias.mjs`

---

## 7. Script de apoio

`transcriptions/review-gabc-vs-pdf.mjs` — comparação bruta PDF completo vs GABC (útil para regressão; a camada PDF inclui rubricas e lixo, por isso os índices globais são menos fiáveis que a análise por profecia acima).
