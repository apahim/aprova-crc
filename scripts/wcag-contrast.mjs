#!/usr/bin/env node
// Razões de contraste WCAG 2.1 dos pares texto/fundo usados na UI (fase 8 — docs/avaliacoes/fase-8-formatacao-visual.md).
// Uso: node scripts/wcag-contrast.mjs
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(path.join(root, 'src/style.css'), 'utf8');

// Blocos de variáveis dos dois temas (primeiro :root é o bloco de cores; dark é o segundo)
const themes = {};
for (const [name, re] of [['light', /:root\{([^}]*)\}/], ['dark', /\[data-theme=dark\]\{([^}]*)\}/]]) {
  const vars = {};
  for (const m of re.exec(css)[1].matchAll(/(--[a-z0-9-]+):(#[0-9a-fA-F]{3,8})/g)) vars[m[1]] = m[2];
  themes[name] = vars;
}

// Luminância relativa WCAG 2.1 (suporta hex de 3 e 6 dígitos)
const lum = hex => {
  const h = hex.slice(1);
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };

// [rótulo, uso, var cor, var fundo, px, peso] — pares efetivamente usados na lição e nas superfícies principais
const pairs = [
  ['h1 da página', 'título da sessão/lição', '--text', '--panel', 28, 400],
  ['Corpo da lição (p, li)', 'parágrafos e itens de lista', '--body', '--panel', 15, 400],
  ['Muted', 'lead e linha de referências', '--muted', '--panel', 15, 400],
  ['Muted-2', 'legendas pequenas (n/5, privacidade)', '--muted-2', '--panel', 11, 400],
  ['Eyebrow', 'rótulo de seção da página', '--eyebrow', '--panel', 11, 800],
  ['Accent-text', 'botão secundário, grade de tempo', '--accent-text', '--panel', 13, 750],
  ['Ok', 'ícone de concluído', '--ok', '--panel', 20, 400],
  ['Bad-text', 'mensagem de erro/limpar progresso', '--bad-text', '--panel', 13, 400],
  ['Nav-idle', 'navegação inferior inativa', '--nav-idle', '--panel', 11, 400],
  ['Fórmula', 'bloco de fórmula da lição', '--accent-text', '--accent-soft', 15, 750],
  ['Notice', 'aviso ao pé da lição', '--soft-text', '--soft-bg', 13, 400],
  ['Explanation', 'explicação pós-questão', '--explanation-text', '--explanation-bg', 13, 400],
  ['On-accent', 'hero e botão primário', '--on-accent', '--accent', 14, 650],
  ['Hero-muted', 'textos pequenos do hero', '--hero-muted', '--accent', 12, 400],
  ['Result', 'painel de resultado do quiz', '--text', '--result-bg', 15, 400],
];

// WCAG AA: texto grande ≥24px (ou ≥18,66px negrito ≥700) exige 3:1; demais 4,5:1
const limit = (px, weight) => (px >= 24 || (px >= 18.66 && weight >= 700)) ? 3 : 4.5;

console.log('| Par | Uso | px | AA | Claro | Escuro |');
console.log('|---|---|---|---|---|---|');
let fails = 0;
for (const [label, use, fg, bg, px, weight] of pairs) {
  const lim = limit(px, weight);
  const cells = [];
  for (const theme of ['light', 'dark']) {
    const r = ratio(themes[theme][fg], themes[theme][bg]);
    const ok = r >= lim;
    if (!ok) fails++;
    cells.push(`${r.toFixed(2)}:1 ${ok ? '✅' : '❌'}`);
  }
  console.log(`| ${label} (${fg}/${bg}) | ${use} | ${px} | ${lim} | ${cells.join(' | ')} |`);
}
console.log(`\nFalhas AA: ${fails}`);
