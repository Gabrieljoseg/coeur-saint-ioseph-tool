/**
 * Compara letra embebida no GABC com o texto extraído do PDF (camada de texto).
 * Uso: node review-gabc-vs-pdf.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PX = path.join(__dirname, '..');
const PDF = path.join(PX, 'pdf-original/Prophetiarium Xicatunense (1).pdf');
const TRAN = __dirname;

const regexOuter =
  /((([^\(\r\n]+)($|\())|\()([^\)]*)($|\))(?:(\s+)|(?=(?:\([^\)]*\))+(\s*))|)/g;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function extractGabcLyrics(gabcText) {
  const sep = gabcText.indexOf('%%');
  const body = sep >= 0 ? gabcText.slice(sep + 2) : gabcText;
  const flat = body.replace(/\s+/g, ' ').trim();
  const parts = [];
  regexOuter.lastIndex = 0;
  let m;
  while ((m = regexOuter.exec(flat))) {
    const syl = (m[3] || '').trim();
    if (syl) parts.push(syl);
  }
  return parts.join(' ');
}

function normalizeForCompare(s) {
  let t = s
    .toLowerCase()
    .normalize('NFC')
    .replace(/\u00ad/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // PDF extrai hífens de sílabação: juntar "princí-pi-o" → "principio" após lower... actually keep letters only sequence
  t = t.replace(/([a-záéíóúýàèìòùäëïöüæœǽ])-+\s*([a-záéíóúýàèìòùäëïöüæœǽ])/gi, '$1$2');
  t = t.replace(/([a-záéíóúýàèìòùäëïöüæœǽ])-+\s*([a-záéíóúýàèìòùäëïöüæœǽ])/gi, '$1$2');
  t = t.replace(/([a-záéíóúýàèìòùäëïöüæœǽ])-+\s*([a-záéíóúýàèìòùäëïöüæœǽ])/gi, '$1$2');
  t = t.replace(/[^a-záéíóúýàèìòùäëïöüæœǽ0-9\s]/gi, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function pdfFullText() {
  const py = `
from pypdf import PdfReader
import sys
r = PdfReader(sys.argv[1])
print(''.join((p.extract_text() or '') + '\\n' for p in r.pages), end='')
`;
  const r = spawnSync('python3', ['-c', py, PDF], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr || 'pypdf failed');
  return r.stdout;
}

function sliceProphetia(full, roman) {
  const tag = `PROPHETIA ${roman}`;
  const idx = full.indexOf(tag);
  if (idx < 0) return '';
  const order = ROMAN.indexOf(roman);
  const next = ROMAN[order + 1];
  const idx2 = next ? full.indexOf(`PROPHETIA ${next}`, idx + 4) : full.length;
  return full.slice(idx, idx2 > 0 ? idx2 : full.length);
}

function stripPdfNoise(chunk) {
  return chunk
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, ' ')
    .replace(/Prophetia\s+[IVX]+\s+\d+/gi, ' ')
    .replace(/PROPHETIA\s+[IVX]+[^\n]*/gi, ' ')
    .replace(/GEN\.[^\n]*/gi, ' ')
    .replace(/EXOD\.[^\n]*/gi, ' ')
    .replace(/IS\.[^\n]*/gi, ' ')
    .replace(/BAR\.[^\n]*/gi, ' ')
    .replace(/EZECH\.[^\n]*/gi, ' ')
    .replace(/EXODI[^\n]*/gi, ' ')
    .replace(/JONÆ[^\n]*/gi, ' ')
    .replace(/DEUT\.[^\n]*/gi, ' ')
    .replace(/DAN\.[^\n]*/gi, ' ')
    .replace(/\bI\s*$/gm, ' ')
    .replace(/\bN\s+/g, ' in ');
}

/** Heurísticas de mapeamento PDF→latim (erros comuns da extração) */
function fixPdfExtract(s) {
  return s
    .replace(/\?/g, 't')
    .replace(/=/g, 'st')
    .replace(/\brv\b/g, 'v')
    .replace(/véDere/gi, 'vésper')
    .replace(/no\?em/gi, 'noctem')
    .replace(/no\?i/gi, 'nocti')
    .replace(/fa\?um/gi, 'factum')
    .replace(/fa\?a/gi, 'facta')
    .replace(/fa\?úmque/gi, 'factúmque')
    .replace(/perfé\?i/gi, 'perfécti')
    .replace(/Déciem/gi, 'spéciem')
    .replace(/Déci-/gi, 'spéci-')
    .replace(/Déci /gi, 'spéci ')
    .replace(/bé=ias/gi, 'béstias')
    .replace(/fru\?um/gi, 'fructum')
    .replace(/no=ram/gi, 'nostram')
    .replace(/bé=i-is/gi, 'béstiis')
    .replace(/=ellas/gi, 'stellas')
    .replace(/\bfi\b/gi, 'fiat')
    .replace(/ﬁ/g, 'f')
    .replace(/\s+/g, ' ');
}

function tokenSet(s) {
  return new Set(s.split(' ').filter(Boolean));
}

function jaccard(a, b) {
  const A = tokenSet(a);
  const B = tokenSet(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const uni = A.size + B.size - inter;
  return uni ? inter / uni : 0;
}

function main() {
  console.log('A extrair PDF…');
  const full = pdfFullText();
  const rows = [];

  for (const roman of ROMAN) {
    const file = `PROPHETIA_${roman}.gabc`;
    const fp = path.join(TRAN, file);
    if (!fs.existsSync(fp)) continue;
    const gabc = fs.readFileSync(fp, 'utf8');
    const lyrics = extractGabcLyrics(gabc);
    const chunk = sliceProphetia(full, roman);
    const pdfClean = fixPdfExtract(stripPdfNoise(chunk));
    const ng = normalizeForCompare(lyrics);
    const np = normalizeForCompare(pdfClean);
    const jac = jaccard(ng, np);
    const ratio = np.length ? ng.length / np.length : 0;

    let prefix = 0;
    const lim = Math.min(ng.length, np.length);
    for (let i = 0; i < lim; i++) {
      if (ng[i] === np[i]) prefix++;
      else break;
    }

    rows.push({ roman, file, jac, ratio, prefix, lenG: ng.length, lenP: np.length, lyrics: ng.slice(0, 200), pdf: np.slice(0, 200) });
  }

  console.log('\n=== Resumo (tokens ≈ palavras normalizadas) ===\n');
  for (const r of rows) {
    console.log(
      `${r.roman.padEnd(5)} Jaccard≈${r.jac.toFixed(3)}  lenG/lenP=${r.ratio.toFixed(2)}  prefixChar=${r.prefix}/${Math.min(r.lenG, r.lenP)}  (gabc ${r.lenG} vs pdf ${r.lenP} chars)`,
    );
  }

  const outMd = path.join(PX, 'REVISAO_GABC_VS_PDF.md');
  let md = `# Revisão: GABC (transcriptions) vs texto do PDF\n\n`;
  md += `**Data:** gerado por \`transcriptions/review-gabc-vs-pdf.mjs\`.\n\n`;
  md += `## Limitações\n\n`;
  md += `- **Neumas:** o PDF não expõe notação musical como texto; esta revisão compara **só a letra** (latim) embutida no GABC com a **camada de texto** extraída do PDF (sublinhado silabificado, com erros de OCR/fonte: \`?\`, \`=\`, \`ﬁ\`, etc.).\n`;
  md += `- **Heurísticas:** aplicam-se correções parciais ao PDF (\`?→t\`, \`=→st\`, *factum*, *noctem*, *spéciem*, *béstias*, etc.); ainda podem restar divergências.\n`;
  md += `- **Jaccard** = sobreposição de *tokens* (palavras) após normalização; valores &lt; 0,85 sugerem revisão manual linha a linha na partitura.\n\n`;
  md += `## Resultados numéricos\n\n`;
  md += `| Profecia | Jaccard (tokens) | |GABC|/|PDF| chars | Prefixo (chars iguais desde o início) |\n`;
  md += `|----------|------------------|----------------|----------------------------------------|\n`;
  for (const r of rows) {
    md += `| ${r.roman} | ${r.jac.toFixed(3)} | ${r.ratio.toFixed(2)} | ${r.prefix} / ${Math.min(r.lenG, r.lenP)} |\n`;
  }
  md += `\n## Amostra (primeiros ~200 caracteres normalizados)\n\n`;
  for (const r of rows) {
    md += `### ${r.roman}\n\n**GABC:** \`${r.lyrics.slice(0, 180)}…\`\n\n**PDF (corrigido):** \`${r.pdf.slice(0, 180)}…\`\n\n`;
  }
  fs.writeFileSync(outMd, md, 'utf8');
  console.log('\nEscrito', outMd);
}

main();
