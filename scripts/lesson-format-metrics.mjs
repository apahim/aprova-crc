#!/usr/bin/env node
// Métricas de formatação visual das lições (fase 8 — rubrica em docs/avaliacoes/fase-8-formatacao-visual.md).
// Banda de extensão calibrada por tipo de sessão: aulas e minis 180–550 · roteiros (revisões/simulados) 90–270.
// Uso: node scripts/lesson-format-metrics.mjs
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = readdirSync(path.join(root, 'src/content')).filter(f => f.startsWith('lessons-')).sort();
const lessons = new Map();
for (const f of files) {
  const o = JSON.parse(readFileSync(path.join(root, 'src/content', f), 'utf8'));
  for (const [id, l] of Object.entries(o)) lessons.set(Number(id), l);
}
const curriculum = JSON.parse(readFileSync(path.join(root, 'src/curriculum.json'), 'utf8'));
const sessionOf = id => curriculum.find(s => s.id === id);
const extBand = id => {
  const s = sessionOf(id);
  if (s?.kind === 'aula' || (s?.kind === 'simulado' && String(s.title ?? '').startsWith('Mini-simulado'))) return [180, 550];
  return [90, 270]; // roteiros: revisões e simulados
};

const words = s => String(s ?? '').split(/\s+/).filter(Boolean).length;
const isNumeric = s => /(R\$|\d\s*[×x]\s*\d|\d+%|=\s*\d|= ?R\$)/.test(s);
const isComparative = s => /(×| x |versus|diferenç|compara)/i.test(s);

const rows = [];
for (const id of [...lessons.keys()].sort((a, b) => a - b)) {
  const l = lessons.get(id);
  const paras = [], items = [];
  let formulas = 0, numericN = 0, compHits = 0, secN = 0;
  for (const sec of l.sections ?? []) {
    secN++;
    if (isComparative(sec.h ?? '')) compHits++;
    if (sec.formula) { formulas++; if (isComparative(sec.formula)) compHits++; }
    for (const p of sec.p ?? []) { paras.push(p); if (isNumeric(p)) numericN++; if (isComparative(p)) compHits++; }
    for (const li of sec.list ?? []) { items.push(li); if (isNumeric(li)) numericN++; if (isComparative(li)) compHits++; }
  }
  const bodyWords = paras.concat(items).reduce((a, s) => a + words(s), 0);
  const w = paras.map(words);
  const longest = w.length ? Math.max(...w) : 0;
  const pct60 = w.length ? Math.round(100 * w.filter(x => x <= 60).length / w.length) : 100;
  const over120 = w.filter(x => x > 120).length;
  const obj = (l.objectives ?? []).length, pit = (l.pitfalls ?? []).length, refs = (l.refs ?? []).length;
  const flags = [];
  if (over120) flags.push('MURI');
  if (w.length && pct60 < 80) flags.push('DENSA');
  if (numericN >= 4 && !formulas) flags.push('CALC');
  const [extLo, extHi] = extBand(id);
  if (bodyWords > extHi) flags.push('EXT-A'); else if (bodyWords < extLo) flags.push('EXT-B');
  if (secN < 3 || secN > 6) flags.push('SEC');
  if (obj < 3 || obj > 5) flags.push('OBJ');
  if (pit < 3 || pit > 6) flags.push('PIT');
  if (!refs) flags.push('REF0');
  if (compHits >= 2) flags.push('TAB');
  if (!items.length && bodyWords > 800) flags.push('LISTA0');
  rows.push({ id, bodyWords, min: bodyWords / 180, secN, paras: w.length, longest, over120, pct60, items: items.length, formulas, obj, pit, refs, numericN, compHits, flags });
}

const all = rows.map(r => r.bodyWords).sort((a, b) => a - b);
const median = all.length % 2 ? all[(all.length - 1) / 2] : (all[all.length / 2 - 1] + all[all.length / 2]) / 2;
console.log(`Lições: ${rows.length} · palavras (corpo): mediana ${median}, mín ${all[0]}, máx ${all[all.length - 1]} · leitura (180 ppm): mediana ${(median / 180).toFixed(1)} min`);
const tally = {};
for (const r of rows) for (const f of r.flags) (tally[f] ??= []).push(r.id);
console.log('\nFlags (rubrica):');
for (const [f, ids] of Object.entries(tally)) console.log(`  ${f}: ${ids.length} → ${ids.join(', ')}`);
console.log(`  (sem flags: ${rows.filter(r => !r.flags.length).length} lições)`);
console.log('\n| id | palavras | min | seções | ¶ | ¶máx | ¶>120 | %≤60 | itens lista | fórmulas | obj | pitfalls | refs | flags |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.id} | ${r.bodyWords} | ${r.min.toFixed(1)} | ${r.secN} | ${r.paras} | ${r.longest} | ${r.over120} | ${r.pct60}% | ${r.items} | ${r.formulas} | ${r.obj} | ${r.pit} | ${r.refs} | ${r.flags.join(' ') || '—'} |`);
