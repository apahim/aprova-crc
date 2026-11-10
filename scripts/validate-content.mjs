#!/usr/bin/env node
// Valida a estrutura do currículo e de todos os bancos de conteúdo.
// Uso: node scripts/validate-content.mjs
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => JSON.parse(readFileSync(path.join(root, f), 'utf8'));
const errors = [], warnings = [];

// --- Currículo ---
const curriculum = read('src/curriculum.json');
const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
if (!Array.isArray(curriculum) || curriculum.length !== 85) errors.push(`curriculum: ${curriculum.length} sessões (esperado 85)`);
const seen = new Set();
curriculum.forEach((s, i) => {
  if (seen.has(s.id)) errors.push(`curriculum: id duplicado ${s.id}`);
  seen.add(s.id);
  if (s.id !== i + 1) errors.push(`curriculum: id ${s.id} fora de ordem (esperado ${i + 1})`);
  if (s.week !== Math.floor(i / 5) + 1) errors.push(`curriculum: semana inconsistente no id ${s.id}`);
  if (s.day !== days[i % 5]) errors.push(`curriculum: dia inconsistente no id ${s.id} (${s.day})`);
  if (!['aula', 'revisao', 'simulado'].includes(s.kind)) errors.push(`curriculum: kind inválido no id ${s.id}`);
});

// --- Questões (formato comum) ---
const stemIndex = new Map(); // indexa stems normalizados p/ detectar duplicatas entre arquivos
const trackStem = (stem, where) => {
  const key = stem.toLowerCase().replace(/\s+/g, ' ').trim();
  const prev = stemIndex.get(key);
  if (prev) errors.push(`questão duplicada: ${where} e ${prev}`);
  else stemIndex.set(key, where);
};
const warnBalance = (qs, where) => {
  const counts = [0, 0, 0, 0];
  qs.forEach(q => { if (Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3) counts[q.correct]++; });
  const worst = Math.max(...counts);
  if (worst >= 4 && worst / qs.length > 0.35) warnings.push(`${where}: gabarito concentrado [${counts.join(', ')}]`);
};
const checkQ = (q, where) => {
  if (typeof q.stem !== 'string' || !q.stem.trim()) errors.push(`${where}: stem vazio`);
  else trackStem(q.stem, where);
  if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${where}: deve ter exatamente 4 opções`);
  else if (q.options.some(o => typeof o !== 'string' || !o.trim())) errors.push(`${where}: opção vazia`);
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) errors.push(`${where}: correct inválido (${q.correct})`);
  if (typeof q.explanation !== 'string' || !q.explanation.trim()) errors.push(`${where}: explanation vazia`);
};

// --- Simulados A/B/C ---
for (const f of ['simulado-a.json', 'simulado-b.json', 'simulado-c.json']) {
  const qs = read(`src/content/${f}`);
  if (!Array.isArray(qs) || qs.length !== 50) errors.push(`${f}: ${qs?.length ?? 0} questões (esperado 50)`);
  (Array.isArray(qs) ? qs : []).forEach((q, i) => checkQ(q, `${f}[${i}]`));
  if (Array.isArray(qs)) {
    const letters = qs.map(q => q.correct);
    const counts = [0, 1, 2, 3].map(l => letters.filter(x => x === l).length);
    if (counts.some(c => c > 20)) warnings.push(`${f}: distribuição de corretos desequilibrada [${counts.join(', ')}]`);
    if (new Set(qs.map(q => q.stem)).size !== qs.length) errors.push(`${f}: stems duplicados`);
  }
}

// --- Mini-simulados (sessões kind "simulado" com título "Mini-simulado …") ---
const minis = {...read('src/content/minis-a.json'), ...read('src/content/minis-b.json')};
const miniExpect = Object.fromEntries(curriculum.filter(s => s.kind === 'simulado' && String(s.title || '').startsWith('Mini-simulado')).map(s => [String(s.id), 12]));
for (const id of Object.keys(minis)) if (!(id in miniExpect)) errors.push(`minis[${id}]: banco sem sessão "Mini-simulado" correspondente no currículo`);
for (const [id, n] of Object.entries(miniExpect)) {
  const qs = minis[id];
  if (!Array.isArray(qs) || qs.length !== n) errors.push(`minis[${id}]: ${qs?.length ?? 0} questões (esperado ${n})`);
  (Array.isArray(qs) ? qs : []).forEach((q, i) => checkQ(q, `minis[${id}][${i}]`));
  if (Array.isArray(qs)) warnBalance(qs, `minis[${id}]`);
}

// --- Bancos por sessão (quizzes-*.json, dinâmico) ---
const contentFiles = readdirSync(path.join(root, 'src/content'));
const quizChunks = contentFiles.filter(f => f.startsWith('quizzes-'));
const quizIds = new Set();
for (const f of quizChunks) {
  const o = read(`src/content/${f}`);
  for (const [id, qs] of Object.entries(o)) {
    if (quizIds.has(id)) errors.push(`${f}: id ${id} duplicado entre arquivos`);
    quizIds.add(id);
    if (!Array.isArray(qs) || qs.length < 6 || qs.length > 12) errors.push(`${f}[${id}]: ${qs?.length ?? 0} questões (esperado 6 a 12)`);
    (Array.isArray(qs) ? qs : []).forEach((q, i) => checkQ(q, `${f}[${id}][${i}]`));
    if (Array.isArray(qs)) warnBalance(qs, `${f}[${id}]`);
  }
}

// --- Lições (lessons-*.json, dinâmico) ---
const lessonChunks = contentFiles.filter(f => f.startsWith('lessons-'));
const lessonIds = new Set();
const fmtWarn = (id, msg) => warnings.push(`formatação s${id}: ${msg} (rubrica fase 8 — docs/avaliacoes/fase-8-formatacao-visual.md)`);
const extBandOf = id => {
  const s = curriculum.find(x => x.id === Number(id));
  if (s?.kind === 'aula' || (s?.kind === 'simulado' && String(s.title ?? '').startsWith('Mini-simulado'))) return [180, 550];
  return [90, 270]; // roteiros: revisões e simulados
};
for (const f of lessonChunks) {
  const o = read(`src/content/${f}`);
  for (const [id, l] of Object.entries(o)) {
    if (lessonIds.has(id)) errors.push(`${f}: id ${id} duplicado entre arquivos`);
    lessonIds.add(id);
    if (!Array.isArray(l?.objectives) || !l.objectives.length) errors.push(`${f}[${id}]: sem objectives`);
    if (!Array.isArray(l?.sections) || !l.sections.length) errors.push(`${f}[${id}]: sem sections`);
    if (!Array.isArray(l?.pitfalls) || !l.pitfalls.length) errors.push(`${f}[${id}]: sem pitfalls`);
    // rubrica de formatação (fase 8) — avisos não-bloqueantes
    const words = s => String(s ?? '').split(/\s+/).filter(Boolean).length;
    const paras = [], items = [];
    let formulas = 0, numericN = 0;
    for (const sec of l.sections ?? []) {
      if (!sec.h) errors.push(`${f}[${id}].sections: seção sem título (h)`);
      if (sec.formula) formulas++;
      for (const p of sec.p ?? []) { paras.push(p); if (/(R\$|\d\s*[×x]\s*\d|\d+%|=\s*\d|= ?R\$)/.test(p)) numericN++; }
      for (const li of sec.list ?? []) { items.push(li); if (/(R\$|\d\s*[×x]\s*\d|\d+%|=\s*\d|= ?R\$)/.test(li)) numericN++; }
      if (sec.table) {
        const t = sec.table;
        if (!Array.isArray(t.head) || !t.head.length || t.head.some(x => typeof x !== 'string' || !x.trim())) {
          errors.push(`${f}[${id}].sections.table: head inválida (strings não vazias)`);
        } else if (!Array.isArray(t.rows) || !t.rows.length) {
          errors.push(`${f}[${id}].sections.table: sem rows`);
        } else {
          t.rows.forEach((r, j) => {
            if (!Array.isArray(r) || r.length !== t.head.length || r.some(c => typeof c !== 'string' || !c.trim())) {
              errors.push(`${f}[${id}].sections.table.rows[${j}]: ${Array.isArray(r) ? r.length : '≈'} células (esperado ${t.head.length})`);
            }
          });
        }
      }
    }
    const secN = (l.sections ?? []).length;
    const w = paras.map(words);
    const longest = w.length ? Math.max(...w) : 0;
    const pct60 = w.length ? Math.round(100 * w.filter(x => x <= 60).length / w.length) : 100;
    if (longest > 120) fmtWarn(id, `parágrafo de ${longest} palavras (muri)`);
    if (w.length && pct60 < 80) fmtWarn(id, `só ${pct60}% dos parágrafos ≤60 palavras`);
    if (numericN >= 4 && !formulas) fmtWarn(id, `lição de cálculo sem bloco formula`);
    if (secN < 3 || secN > 6) fmtWarn(id, `${secN} seções (rubrica: 3–6)`);
    const bodyWords = paras.concat(items).reduce((a, s) => a + words(s), 0);
    const [lo, hi] = extBandOf(id);
    if (bodyWords < lo || bodyWords > hi) fmtWarn(id, `${bodyWords} palavras (banda ${lo}–${hi})`);
  }
}

// --- Cobertura ---
const aulas = curriculum.filter(s => s.kind === 'aula').map(s => String(s.id));
const missL = aulas.filter(id => !lessonIds.has(id));
const missQ = aulas.filter(id => !quizIds.has(id));
console.log(`Aulas com lição: ${aulas.length - missL.length}/${aulas.length} · com banco de questões: ${aulas.length - missQ.length}/${aulas.length}`);
if (missL.length) warnings.push('Lições pendentes (ids): ' + missL.join(', '));
if (missQ.length) warnings.push('Bancos pendentes (ids): ' + missQ.join(', '));
warnings.forEach(w => console.warn('AVISO:', w));

if (errors.length) {
  console.error(`\n${errors.length} ERRO(S):`);
  errors.slice(0, 60).forEach(e => console.error(' -', e));
  process.exit(1);
}
console.log('Conteúdo validado: OK');
