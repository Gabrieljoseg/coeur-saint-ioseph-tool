#!/usr/bin/env node
/**
 * Gera Prophetiarium-Xicatunense/partitura-notas/PROPHETIA_*.txt
 * com a sequência de elementos GABC entre parênteses (clave, neumas, divisões).
 *
 * O PDF original não contém alturas legíveis como texto — só sublinhado silábico
 * e notação gráfica. A fonte fiel da melodia no repositório é o .gabc.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRANSCRIPTIONS = __dirname;
const OUT_DIR = path.join(TRANSCRIPTIONS, '../partitura-notas');

const FILE_HEADER = `Prophetiarium Xicatunense — notas (sequência GABC)
Fonte: transcriptions/{FILE} (transcrição digital da partitura)

Nota: o ficheiro PDF em pdf-original/ não expõe neumas como texto extraível;
apenas o latim silabificado. Esta lista reproduz, na ordem, os símbolos GABC
do ficheiro .gabc correspondente (equivalente digital à partitura).

Formato: cada token (…) é clave (c4), neuma (h), grupo (hi), divisão (,) (;) (:) (.), fim (::), etc.

--- sequência ---

`;

function isValidGabcToken(inner) {
  const s = inner.trim();
  if (!s) return false;
  if (s === 'space') return false;
  // Clave, divisões
  if (/^c[1-4]$/.test(s)) return true;
  if (/^[,:;]+$/u.test(s)) return true;
  if (s === '::') return true;
  if (/^[,.;:`]+$/u.test(s)) return true;
  // Neumas: letras de altura a–m (GABC), eventualmente r, z, modificadores . ' ! _ etc.
  if (/^[a-mr]/i.test(s)) return true;
  if (/^[!]/u.test(s)) return true;
  return false;
}

function extractParenthesisGroups(gabcBody) {
  const oneLine = gabcBody.replace(/\s+/g, ' ').trim();
  const re = /\(([^)]*)\)/g;
  const groups = [];
  let m;
  while ((m = re.exec(oneLine))) {
    if (isValidGabcToken(m[1])) groups.push(`(${m[1].trim()})`);
  }
  return groups;
}

function wrapLine(groups, width = 96) {
  const lines = [];
  let cur = '';
  for (const g of groups) {
    const add = cur ? `${cur} ${g}` : g;
    if (add.length > width && cur) {
      lines.push(cur);
      cur = g;
    } else {
      cur = add;
    }
  }
  if (cur) lines.push(cur);
  return lines.join('\n');
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const gabcFiles = fs
  .readdirSync(TRANSCRIPTIONS)
  .filter((f) => /^PROPHETIA_[IVX]+\.gabc$/i.test(f))
  .sort();

for (const file of gabcFiles) {
  const full = fs.readFileSync(path.join(TRANSCRIPTIONS, file), 'utf8');
  const sep = full.indexOf('%%');
  const body = sep >= 0 ? full.slice(sep + 2) : full;
  const groups = extractParenthesisGroups(body);
  const base = file.replace(/\.gabc$/i, '');
  const header = FILE_HEADER.split('{FILE}').join(file);
  const emptyNote =
    groups.length === 0
      ? '\n[Neste repositório o ficheiro GABC ainda não contém notação válida — preencher transcriptions/' +
        file +
        ' a partir da partitura do PDF, depois voltar a correr este script.]\n'
      : '';
  const text = `${header}${emptyNote}${groups.length ? wrapLine(groups) : ''}\n`;
  const outName = `${base}.txt`;
  fs.writeFileSync(path.join(OUT_DIR, outName), text, 'utf8');
  console.log('Wrote', outName, `(${groups.length} tokens)`);
}

console.log('Done →', OUT_DIR);
console.log('Opcional: node join-latin-vulgate-notas.mjs  → latin-vulgate-mais-notas/');
