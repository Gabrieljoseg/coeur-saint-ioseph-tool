#!/usr/bin/env node
/**
 * Junta, por profecia:
 *   - transcriptions/latin-vulgate/PROPHETIA_*.txt
 *   - partitura-notas/PROPHETIA_*.txt (sequência GABC)
 * → latin-vulgate-mais-notas/PROPHETIA_*.txt
 *
 * Correr depois de atualizar latim ou de `node extract-notas-partitura.mjs`.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LV_DIR = path.join(__dirname, 'latin-vulgate');
const PN_DIR = path.join(ROOT, 'partitura-notas');
const OUT_DIR = path.join(ROOT, 'latin-vulgate-mais-notas');

const SEP = '--- sequência ---\n';

function extractNotasSection(partituraNotasRaw) {
  const i = partituraNotasRaw.indexOf(SEP);
  if (i < 0) {
    return { header: partituraNotasRaw.trim(), sequencia: '' };
  }
  const sequencia = partituraNotasRaw.slice(i + SEP.length).trim();
  return { header: partituraNotasRaw.slice(0, i).trim(), sequencia };
}

function buildCombined(baseName, latinRaw, pnRaw) {
  const { sequencia } = pnRaw
    ? extractNotasSection(pnRaw)
    : { sequencia: '' };

  let blocoB;
  if (!pnRaw) {
    blocoB =
      '(Ficheiro partitura-notas em falta — correr node extract-notas-partitura.mjs.)';
  } else if (!sequencia) {
    blocoB =
      '(Sequência vazia ou só aviso de GABC incompleto — ver partitura-notas e transcriptions/PROPHETIA_*.gabc.)';
  } else {
    blocoB = sequencia;
  }

  return `================================================================================
${baseName} — Latin-vulgate + partitura-notas (repositório Prophetiarium-Xicatunense)
================================================================================

### A) TEXTO LATINO
Fonte: transcriptions/latin-vulgate/${baseName}.txt

${latinRaw.trim()}

---

### B) SEQUÊNCIA DE NEUMAS (GABC, ordem da partitura digital)
Fonte: partitura-notas/${baseName}.txt

${blocoB}

================================================================================
Nota: (A) é texto contínuo da Vulgata local; (B) são tokens (c3)(h)(,)… do .gabc.
Não há alinhamento automático palavra-a-neuma neste ficheiro — só a junção das duas fontes.
Regenerar: node transcriptions/join-latin-vulgate-notas.mjs
================================================================================
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const latinFiles = fs
  .readdirSync(LV_DIR)
  .filter((f) => /^PROPHETIA_[IVX]+\.txt$/i.test(f))
  .sort();

if (latinFiles.length === 0) {
  console.error('Nenhum PROPHETIA_*.txt em', LV_DIR);
  process.exit(1);
}

for (const f of latinFiles) {
  const base = f.replace(/\.txt$/i, '');
  const latinPath = path.join(LV_DIR, f);
  const pnPath = path.join(PN_DIR, f);
  const latinRaw = fs.readFileSync(latinPath, 'utf8');
  const pnRaw = fs.existsSync(pnPath) ? fs.readFileSync(pnPath, 'utf8') : '';
  const out = buildCombined(base, latinRaw, pnRaw);
  fs.writeFileSync(path.join(OUT_DIR, f), out, 'utf8');
  console.log('Wrote', path.join('latin-vulgate-mais-notas', f));
}

fs.writeFileSync(
  path.join(OUT_DIR, 'README.md'),
  `# Latin-vulgate + partitura-notas

Cada \`PROPHETIA_*.txt\` **junta**:

1. **Texto latino** — cópia de [\`../transcriptions/latin-vulgate/\`](../transcriptions/latin-vulgate/)
2. **Sequência de neumas GABC** — cópia da parte após \`--- sequência ---\` em [\`../partitura-notas/\`](../partitura-notas/)

## Regenerar

Após alterar o latim ou o GABC:

\`\`\`bash
cd Prophetiarium-Xicatunense/transcriptions
node extract-notas-partitura.mjs
node join-latin-vulgate-notas.mjs
\`\`\`

Para profecias sem GABC completo, o bloco (B) indica que a sequência está vazia ou em falta.
`,
  'utf8',
);

console.log('Done →', OUT_DIR);
