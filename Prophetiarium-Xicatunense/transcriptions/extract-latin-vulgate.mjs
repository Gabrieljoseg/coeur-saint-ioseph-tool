#!/usr/bin/env node
/**
 * Extrai trechos da Vulgata (pasta vulgate/) para latin-vulgate/PROPHETIA_*.txt
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const VULGATE_DIR = path.join(ROOT, 'vulgate');
const OUT_DIR = path.join(__dirname, 'latin-vulgate');

function parseBook(filePath) {
  const map = new Map(); // "ch:v" -> text
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const tab = line.indexOf('\t');
    if (tab < 0) continue;
    const tab2 = line.indexOf('\t', tab + 1);
    if (tab2 < 0) continue;
    const ch = parseInt(line.slice(0, tab), 10);
    const v = parseInt(line.slice(tab + 1, tab2), 10);
    const text = line.slice(tab2 + 1);
    if (Number.isNaN(ch) || Number.isNaN(v)) continue;
    map.set(`${ch}:${v}`, text);
  }
  return map;
}

function versesFromMap(map, segments) {
  const blocks = [];
  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const para = [];
    for (let v = seg.v0; v <= seg.v1; v++) {
      const key = `${seg.ch}:${v}`;
      const t = map.get(key);
      if (t === undefined) {
        para.push('[texto em falta na Vulgata local]');
      } else {
        para.push(t.trim());
      }
    }
    blocks.push(para.join(' '));
  }
  return blocks.join('\n\n').trim() + '\n';
}

const books = {
  Genesis: parseBook(path.join(VULGATE_DIR, 'Genesis')),
  Exodus: parseBook(path.join(VULGATE_DIR, 'Exodus')),
  Isaias: parseBook(path.join(VULGATE_DIR, 'Isaias')),
  Baruch: parseBook(path.join(VULGATE_DIR, 'Baruch')),
  Ezechiel: parseBook(path.join(VULGATE_DIR, 'Ezechiel')),
  Jonas: parseBook(path.join(VULGATE_DIR, 'Jonas')),
  Deuteronomium: parseBook(path.join(VULGATE_DIR, 'Deuteronomium')),
  Daniel: parseBook(path.join(VULGATE_DIR, 'Daniel')),
};

const prophetiae = [
  {
    file: 'PROPHETIA_I.txt',
    header:
      'PROPHETIA I — Genesis 1,1–31 ; 2,1–2\nFonte: vulgate/Genesis (Vulgata Clementina neste repositório)\n',
    build: () =>
      books.Genesis,
    segments: () => [
      { label: 'Genesis 1,1–31', ch: 1, v0: 1, v1: 31 },
      { label: 'Genesis 2,1–2', ch: 2, v0: 1, v1: 2 },
    ],
  },
  {
    file: 'PROPHETIA_II.txt',
    header:
      'PROPHETIA II — Genesis 5,31 ; 6,1–22 ; 7,1–24 ; 8,1–21\n',
    build: () => books.Genesis,
    segments: () => [
      { label: 'Genesis 5,31', ch: 5, v0: 31, v1: 31 },
      { label: 'Genesis 6,1–22', ch: 6, v0: 1, v1: 22 },
      { label: 'Genesis 7,1–24', ch: 7, v0: 1, v1: 24 },
      { label: 'Genesis 8,1–21', ch: 8, v0: 1, v1: 21 },
    ],
  },
  {
    file: 'PROPHETIA_III.txt',
    header: 'PROPHETIA III — Genesis 22,1–19\n',
    build: () => books.Genesis,
    segments: () => [{ label: 'Genesis 22,1–19', ch: 22, v0: 1, v1: 19 }],
  },
  {
    file: 'PROPHETIA_IV.txt',
    header:
      'PROPHETIA IV — Exodus 14,21–31 ; 5,1\nOrdem: primeiro o Mar Vermelho, depois a embaixada a Faraó.\n',
    build: () => books.Exodus,
    segments: () => [
      { label: 'Exodus 14,21–31', ch: 14, v0: 21, v1: 31 },
      { label: 'Exodus 5,1', ch: 5, v0: 1, v1: 1 },
    ],
  },
  {
    file: 'PROPHETIA_V.txt',
    header: 'PROPHETIA V — Isaias 54,17 ; 55,1–11\n',
    build: () => books.Isaias,
    segments: () => [
      { label: 'Isaias 54,17', ch: 54, v0: 17, v1: 17 },
      { label: 'Isaias 55,1–11', ch: 55, v0: 1, v1: 11 },
    ],
  },
  {
    file: 'PROPHETIA_VI.txt',
    header: 'PROPHETIA VI — Baruch 3,9–38\n',
    build: () => books.Baruch,
    segments: () => [{ label: 'Baruch 3,9–38', ch: 3, v0: 9, v1: 38 }],
  },
  {
    file: 'PROPHETIA_VII.txt',
    header: 'PROPHETIA VII — Ezechiel 37,1–14\n',
    build: () => books.Ezechiel,
    segments: () => [{ label: 'Ezechiel 37,1–14', ch: 37, v0: 1, v1: 14 }],
  },
  {
    file: 'PROPHETIA_VIII.txt',
    header: 'PROPHETIA VIII — Isaias 4,1–6\n',
    build: () => books.Isaias,
    segments: () => [{ label: 'Isaias 4,1–6', ch: 4, v0: 1, v1: 6 }],
  },
  {
    file: 'PROPHETIA_IX.txt',
    header: 'PROPHETIA IX — Exodus 12,1–11\n',
    build: () => books.Exodus,
    segments: () => [{ label: 'Exodus 12,1–11', ch: 12, v0: 1, v1: 11 }],
  },
  {
    file: 'PROPHETIA_X.txt',
    header: 'PROPHETIA X — Jonas 3,1–10\n',
    build: () => books.Jonas,
    segments: () => [{ label: 'Jonas 3,1–10', ch: 3, v0: 1, v1: 10 }],
  },
  {
    file: 'PROPHETIA_XI.txt',
    header: 'PROPHETIA XI — Deuteronomium 31,22–30\n',
    build: () => books.Deuteronomium,
    segments: () => [{ label: 'Deuteronomium 31,22–30', ch: 31, v0: 22, v1: 30 }],
  },
  {
    file: 'PROPHETIA_XII.txt',
    header: 'PROPHETIA XII — Daniel 3,1–24\n',
    build: () => books.Daniel,
    segments: () => [{ label: 'Daniel 3,1–24', ch: 3, v0: 1, v1: 24 }],
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const p of prophetiae) {
  const map = p.build();
  const body = versesFromMap(map, p.segments());
  const out = p.header + '\n' + body;
  fs.writeFileSync(path.join(OUT_DIR, p.file), out, 'utf8');
  console.log('Wrote', p.file);
}

console.log('Done →', OUT_DIR);
