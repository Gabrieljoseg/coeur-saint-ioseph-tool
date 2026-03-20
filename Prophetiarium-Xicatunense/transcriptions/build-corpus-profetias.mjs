#!/usr/bin/env node
/**
 * Gera Prophetiarium-Xicatunense/corpus-profetias/PROPHETIA_* /
 * com letra (latim), partitura .gabc e análise silaba-a-silaba do GABC.
 *
 * Fonte melódica: transcriptions/*.gabc (o PDF não expõe neumas como texto).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PX_ROOT = path.join(__dirname, '..');
const TRANSCRIPTIONS = __dirname;
const CORPUS = path.join(PX_ROOT, 'corpus-profetias');
const LATIN = path.join(TRANSCRIPTIONS, 'latin-vulgate');

/* Copiado de util.js / transcriber.html.js (jgabc) */
const rog = { syl: 3, gabc: 5, whitespace: 7 };
const regexOuter =
  /((([^\(\r\n]+)($|\())|\()([^\)]*)($|\))(?:(\s+)|(?=(?:\([^\)]*\))+(\s*))|)/g;
const regexGabc =
  /(((?:([`,;:][\d'_]*z?)|([cf]b?[1-4]))+)|([^\s\\]+|(?=\\)))(?:\s+|$|\\(.|$))/gi;
const regexToneModifiers = /(')|(\.{1,2})|(_{1,4}0?)/g;
const regexTones = new RegExp(
  '([/ ,;:`]+)|((?:[fF]|[cC][bB]?)[1-4])|(?:(-)?(([A-M])|([a-m]))(([Vv]{1,3})|(s{1,3})|((<)|(>)|(~))|(w)|(o)|(O)|((x)|(y))|(q)|((R)|(r0)|(r(?![1-5])))|(r[1-5])|(\\+))?((?:' +
    regexToneModifiers.source.replace(/\((?!\?:)/g, '(?:') +
    ')*)(?:\\[([^\\]]*)(?:]|$))?|(z0))',
  'g',
);

const PITCH_ORDER = Object.fromEntries('abcdefghijklm'.split('').map((c, i) => [c, i]));

function splitGabc(gabc) {
  const gSyl = [];
  let match;
  regexGabc.lastIndex = 0;
  while ((match = regexGabc.exec(gabc))) {
    let sylGabc = match[1];
    let hasSyl = match[5];
    const isClef = match[4];
    const isBar = match[3];
    let nextIndex = match.index + match[0].length - 1;
    while (
      match[6] &&
      regexGabc.lastIndex < gabc.length &&
      (regexGabc.lastIndex--, (match = regexGabc.exec(gabc)))
    ) {
      if (nextIndex !== match.index) {
        sylGabc += gabc[nextIndex];
        if (match.index > nextIndex + 1) {
          regexGabc.lastIndex = nextIndex;
          break;
        }
      }
      hasSyl = hasSyl || match[5];
      sylGabc += match[1];
      nextIndex = match.index + match[0].length - 1;
    }
    const tones = [];
    regexTones.lastIndex = 0;
    let tone;
    while ((tone = regexTones.exec(sylGabc))) {
      tones.push(tone[0]);
    }
    gSyl.push({
      hasSyllable: !!hasSyl,
      gabc: '(' + sylGabc + ')',
      isClef: !!isClef,
      isBar: !!isBar,
      tones,
    });
  }
  return gSyl;
}

function describeBarChars(s) {
  const out = [];
  for (const ch of s) {
    switch (ch) {
      case ',':
        out.push('divisio minima (,)');
        break;
      case ';':
        out.push('divisio minor (;)');
        break;
      case ':':
        out.push('divisio maior (:)');
        break;
      case '`':
        out.push('divisio (grave `)');
        break;
      case '/':
        out.push('barra de cântico (/)');
        break;
      case ' ':
        out.push('espaço');
        break;
      default:
        out.push(`símbolo “${ch}”`);
    }
  }
  return out;
}

function analyzeToneMatch(m) {
  const full = m[0];
  if (full === 'z0') {
    return { gabc: full, tipo: 'custos_automatico', descricao: 'z0 — custos automático (Gregorio)' };
  }
  if (m[1]) {
    return {
      gabc: full,
      tipo: 'divisao_ou_separador',
      detalhe: describeBarChars(m[1]),
      descricao: describeBarChars(m[1]).join('; '),
    };
  }
  if (m[2]) {
    const c = m[2].toLowerCase();
    let desc = 'clave ';
    if (c.startsWith('cb')) desc += '*do* com bemol na clave (cb), linha ' + c.slice(2);
    else if (c[0] === 'c') desc += '*do*, linha ' + c.slice(1);
    else if (c[0] === 'f') desc += '*fa*, linha ' + c.slice(1);
    else desc += m[2];
    return { gabc: full, tipo: 'clave', descricao: desc };
  }
  const pitch = m[6] || m[5];
  if (pitch) {
    const upper = !!m[5];
    const virga = m[8] || '';
    const stropha = m[9] || '';
    const liqAsc = m[11];
    const liqDesc = m[12];
    const liqDim = m[13];
    const quilisma = m[14];
    const oriscus = m[15];
    const oriscusInv = m[16];
    const flat = m[18];
    const natural = m[19];
    const ictus = m[27];
    const dot = m[28];
    const episema = m[29];
    const bracket = m[30];

    const partes = [];
    if (flat) partes.push('bemol (x) antes desta altura');
    if (natural) partes.push('becar (y)');
    if (virga) {
      const n = virga.length;
      partes.push(
        n === 1 ? 'virga (v)' : n === 2 ? 'bivirga (vv)' : `trivirga (${n}× v)`,
      );
    }
    if (stropha) {
      partes.push(stropha.length > 1 ? `strophae (${stropha.length})` : 'stropha (s)');
    }
    if (liqAsc) partes.push('liquescência ascendente (<)');
    if (liqDesc) partes.push('liquescência descendente (>)');
    if (liqDim) partes.push('liquescência diminuta (~)');
    if (quilisma) partes.push('quilisma (w)');
    if (oriscus) partes.push('oriscus (o)');
    if (oriscusInv) partes.push('oriscus inverso (O)');
    if (ictus) partes.push("ictus (')");
    if (dot) partes.push(dot.length > 1 ? 'punctum mora duplo (..)' : 'punctum mora (.)');
    if (episema) partes.push(`episema (${episema})`);
    if (bracket !== undefined && bracket !== null && bracket !== '')
      partes.push(`anotação [${bracket}]`);

    let forma = 'punctum';
    if (virga) forma = 'nota com haste (virga)';
    else if (stropha) forma = 'stropha';

    return {
      gabc: full,
      tipo: 'nota',
      altura: pitch,
      altura_tipo: upper ? 'forma superior (maiúscula)' : 'punctum habitual',
      forma_base: forma,
      detalhes_neumaticos: partes,
      descricao: [pitch + (upper ? ' (maiúsc.)' : ''), ...partes].filter(Boolean).join(' · '),
    };
  }
  return { gabc: full, tipo: 'desconhecido', descricao: full };
}

function tokenizeNeumeInner(inner) {
  const tokens = [];
  regexTones.lastIndex = 0;
  let m;
  while ((m = regexTones.exec(inner))) {
    tokens.push(analyzeToneMatch(m));
  }
  return tokens;
}

function classifySyllableCluster(noteTokens) {
  const notes = noteTokens.filter((t) => t.tipo === 'nota' && t.altura && /[a-m]/.test(t.altura));
  if (notes.length === 0) return null;
  if (notes.length === 1) {
    const d = notes[0].detalhes_neumaticos || [];
    if (d.some((x) => x.includes('quilisma'))) return 'neuma com quilisma';
    if (d.some((x) => x.includes('liquescência'))) return 'nota com liquescência';
    if (d.some((x) => x.includes('virga'))) return 'virga';
    if (notes[0].forma_base === 'stropha') return 'stropha';
    return 'punctum';
  }
  const idx = notes.map((n) => PITCH_ORDER[n.altura]).filter((x) => x !== undefined);
  if (idx.length < 2) return 'neuma composto';
  let asc = true;
  let desc = true;
  for (let i = 1; i < idx.length; i++) {
    if (idx[i] <= idx[i - 1]) asc = false;
    if (idx[i] >= idx[i - 1]) desc = false;
  }
  if (notes.length === 2) {
    if (asc) return 'podatus (dois sons ascendentes na sílaba)';
    if (desc) return 'clivis (dois sons descendentes na sílaba)';
    return 'binário (intervalo misto — ver alturas)';
  }
  if (notes.length === 3) {
    if (asc) return 'scandicus (três ascendentes)';
    if (desc) return 'climacus (três descendentes — leitura aproximada)';
    if (idx[0] < idx[1] && idx[1] > idx[2]) return 'torculus (subida e descida)';
    if (idx[0] > idx[1] && idx[1] < idx[2]) return 'porrectus (descida e subida — aprox.)';
  }
  return `neuma de ${notes.length} notas (analisar tokens)`;
}

function parseMixedBody(body) {
  const flat = body.replace(/\s+/g, ' ').trim();
  const syllables = [];
  regexOuter.lastIndex = 0;
  let m;
  while ((m = regexOuter.exec(flat))) {
    const silaba = (m[3] || '').trim();
    const interno = m[5] ?? '';
    const tokens = tokenizeNeumeInner(interno);
    syllables.push({
      silaba: silaba || null,
      gabc_interno: interno,
      gabc_completo: interno ? `(${interno})` : '()',
      tokens,
      aglutinacao_heuristica: classifySyllableCluster(tokens),
    });
  }
  return syllables;
}

function gabcHeaderMeta(text) {
  const lines = text.split(/\r?\n/);
  const meta = {};
  for (const line of lines) {
    const mm = line.match(/^([\w-]+):\s*(.*)$/i);
    if (mm && !line.startsWith('%')) {
      meta[mm[1].toLowerCase()] = mm[2].replace(/;\s*$/, '').trim();
    }
    if (line.trim() === '%%') break;
  }
  return meta;
}

function mdEscape(s) {
  return String(s).replace(/\|/g, '\\|');
}

function buildMarkdownTable(rows) {
  const head = '| # | Sílaba | GABC | Classificação | Tokens (resumo) |\n|---|--------|------|---------------|-------------------|\n';
  const body = rows
    .map((r, i) => {
      const tok = r.tokens
        .map((t) => t.gabc)
        .join(' ')
        .slice(0, 80);
      return `| ${i + 1} | ${mdEscape(r.silaba || '—')} | \`${mdEscape(r.gabc_interno || '')}\` | ${mdEscape(r.aglutinacao_heuristica || '—')} | ${mdEscape(tok)} |`;
    })
    .join('\n');
  return head + body;
}

function buildDetailedMd(rows) {
  const chunks = [];
  let n = 0;
  for (const r of rows) {
    n += 1;
    chunks.push(`### ${n}. ${r.silaba ? `*${r.silaba}*` : '(sem sílaba — clave/divisão)'}\n`);
    chunks.push(`- **GABC:** \`(${r.gabc_interno})\`\n`);
    if (r.aglutinacao_heuristica) {
      chunks.push(`- **Aglutinação (heurística):** ${r.aglutinacao_heuristica}\n`);
    }
    chunks.push('- **Tokens:**\n');
    for (const t of r.tokens) {
      chunks.push(`  - \`${t.gabc}\` — **${t.tipo}**${t.descricao ? ': ' + t.descricao : ''}\n`);
    }
    if (r.tokens.length === 0) chunks.push('  - *(vazio)*\n');
    chunks.push('\n');
  }
  return chunks.join('');
}

const STUB_README = `Esta profecia ainda **não** tem GABC completo em \`transcriptions/\`.

Quando existir \`PROPHETIA_???.gabc\` válido, corra na pasta \`transcriptions/\`:

\`\`\`bash
node build-corpus-profetias.mjs
\`\`\`

O PDF em \`pdf-original/\` não fornece neumas como texto; a análise deriva do GABC.
`;

/** GABC legítimo: clave + sílabas com vogal ligadas a notas a–m */
function isValidGabcBody(body) {
  const t = body.trim();
  if (!t) return false;
  if (/\(space\)/.test(t)) return false;
  if (!/\([cfCF][bB]?[1-4]\)/.test(t)) return false;
  const flat = t.replace(/\s+/g, ' ');
  if (!/[A-Za-zÀ-ÿ\u0100-\u024F][A-Za-zÀ-ÿ\u0100-\u024F'’´]*\([a-m]/i.test(flat)) return false;
  return true;
}

function main() {
  fs.mkdirSync(CORPUS, { recursive: true });

  const gabcFiles = fs
    .readdirSync(TRANSCRIPTIONS)
    .filter((f) => /^PROPHETIA_[IVX]+\.gabc$/i.test(f))
    .sort();

  for (const file of gabcFiles) {
    const base = file.replace(/\.gabc$/i, '');
    const dir = path.join(CORPUS, base);
    fs.mkdirSync(dir, { recursive: true });

    const gabcPath = path.join(TRANSCRIPTIONS, file);
    const fullText = fs.readFileSync(gabcPath, 'utf8');
    const meta = gabcHeaderMeta(fullText);
    const sep = fullText.indexOf('%%');
    const body = sep >= 0 ? fullText.slice(sep + 2) : '';

    const latinPath = path.join(LATIN, `${base}.txt`);
    let latim = '';
    if (fs.existsSync(latinPath)) {
      latim = fs.readFileSync(latinPath, 'utf8');
    }

    fs.writeFileSync(path.join(dir, 'partitura.gabc'), fullText, 'utf8');
    fs.writeFileSync(path.join(dir, 'texto-latino-continuo.txt'), latim || '(ficheiro em falta em latin-vulgate/)\n', 'utf8');

    const trimmedBody = body.trim();
    if (!trimmedBody || !isValidGabcBody(trimmedBody)) {
      fs.writeFileSync(path.join(dir, 'README.md'), STUB_README, 'utf8');
      fs.writeFileSync(
        path.join(dir, 'silabas-neumas.json'),
        JSON.stringify({ aviso: 'GABC vazio ou sem notação', meta }, null, 2) + '\n',
        'utf8',
      );
      console.log(base, '→ stub (sem GABC)');
      continue;
    }

    const rows = parseMixedBody(body);
    const gSyl = splitGabc(body.replace(/\s+/g, ' ').trim());

    const payload = {
      profecia: base,
      fonte_melodica: `transcriptions/${file}`,
      fonte_pdf: 'pdf-original/Prophetiarium Xicatunense (1).pdf (neumas não extraíveis como texto)',
      meta_cabecalho_gabc: meta,
      nota_sobre_pdf:
        'A organização letra + notas baseia-se no GABC; o PDF só traz sublinhado silábico e notação gráfica.',
      total_silabas_ou_segmentos: rows.length,
      splitGabc_elementos: gSyl.length,
      silabas: rows,
    };

    fs.writeFileSync(path.join(dir, 'silabas-neumas.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');

    const mdIntro = `# ${base}

- **Partitura:** \`partitura.gabc\` (cópia de \`transcriptions/${file}\`)
- **Latim contínuo:** \`texto-latino-continuo.txt\` (Vulgata local / extracto)
- **Análise:** este ficheiro + \`silabas-neumas.json\`

## Tabela compacta

${buildMarkdownTable(rows)}

## Detalhe por segmento (tokens GABC)

${buildDetailedMd(rows)}

---
Ver também [\`../GABC-LEGENDA.md\`](../GABC-LEGENDA.md) para divisões, virgas, bemol, episema, etc.
`;

    fs.writeFileSync(path.join(dir, 'silabas-neumas.md'), mdIntro, 'utf8');
    fs.writeFileSync(
      path.join(dir, 'README.md'),
      `# ${base}\n\n- Resumo tabular: [\`silabas-neumas.md\`](./silabas-neumas.md)\n- Dados: [\`silabas-neumas.json\`](./silabas-neumas.json)\n- GABC: [\`partitura.gabc\`](./partitura.gabc)\n\n` +
        payload.nota_sobre_pdf +
        '\n',
      'utf8',
    );

    console.log(base, '→', rows.length, 'segmentos');
  }

  fs.writeFileSync(
    path.join(CORPUS, 'README.md'),
    `# Corpus por profecia (letra + notas GABC)

Cada pasta \`PROPHETIA_*\` contém:

| Ficheiro | Conteúdo |
|----------|----------|
| \`partitura.gabc\` | Transcrição GABC (fonte melódica do projeto) |
| \`texto-latino-continuo.txt\` | Texto bíblico em latim (sem números de versículo) |
| \`silabas-neumas.json\` | Sílaba + tokens analisados (clave, divisões, notas, modificadores) |
| \`silabas-neumas.md\` | Mesma informação em tabelas e listas |
| \`README.md\` | Índice |

**Importante:** o PDF em \`pdf-original/\` **não** contém podatus, clivis, divisões, etc., como texto — só desenho e sublinhado. A análise neumática segue **GABC** e as convenções documentadas em [\`GABC-LEGENDA.md\`](./GABC-LEGENDA.md) (alinhadas a \`util.js\` / jgabc).

## Regenerar

\`\`\`bash
cd Prophetiarium-Xicatunense/transcriptions
node build-corpus-profetias.mjs
\`\`\`
`,
    'utf8',
  );

  console.log('Corpus →', CORPUS);
}

main();
