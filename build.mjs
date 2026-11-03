#!/usr/bin/env node
// Builds the site's HTML pages.
//
//   node build.mjs --app <path to the app's repository>
//
// - index.html / zh.html come from content/en.json and content/zh.json (the page copy) and the screenshots in img/.
// - The privacy note and terms of use come from the app's own locales (locales/<lang>.json, "legal"),
//   so the site always says exactly what the app says.
// Screenshots are made in the app's repository (tools/sim/store.mjs) and copied into img/ as <lang>-<shot>.jpg.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const appArg = args[args.indexOf('--app') + 1];
if (!args.includes('--app') || !appArg) {
  console.error('usage: node build.mjs --app <path to the app repository>');
  process.exit(1);
}
const app = resolve(appArg);

const STYLE = readFileSync(join(here, 'content', 'style.css'), 'utf8').trim();
const SUPPORT = 'mailto:24kplo@gmail.com';
/** Escape text for HTML; quotes only matter inside attributes. */
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const attr = (s) => esc(s).replace(/"/g, '&quot;');

function shell(c, title, main) {
  return `<!doctype html>
<html lang="${c.htmlLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${attr(c.tagline)}"><link rel="icon" href="img/icon.png"><style>${STYLE}</style></head>
<body><header><div class="wrap"><img src="img/icon.png" alt=""><b>${esc(c.name)}</b><nav><a href="${c.other.page}">${esc(c.other.label)}</a></nav></div></header>
${main}
<footer><div class="wrap"><a href="${c.footer.privacy[0]}">${esc(c.footer.privacy[1])}</a><a href="${c.footer.terms[0]}">${esc(c.footer.terms[1])}</a><a href="${SUPPORT}">${esc(c.footer.support)}</a><p>${esc(c.footer.credits)}</p></div></footer></body></html>
`;
}

function img(c, shot) {
  const file = `img/${c.lang}-${shot}.jpg`;
  if (!existsSync(join(here, file))) throw new Error(`missing screenshot ${file}`);
  return `<img class="shot" src="${file}" alt="">`;
}

function home(c) {
  const feats = c.features.map((f) => `<div class="feat">${img(c, f.shot)}<h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`).join('');
  const main = `<main class="wrap"><section class="hero"><h1>${esc(c.name)}</h1><p>${esc(c.tagline)}</p><span class="buy soon">${esc(c.buy)}</span><span class="price">${esc(c.price)}</span></section>
${img(c, c.hero)}
<p class="intro">${esc(c.intro)}</p>
<section class="feats">${feats}</section>
<section class="need"><h2>${esc(c.needTitle)}</h2><ul>${c.need.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section></main>`;
  return shell(c, c.name, main);
}

/** A legal page from the app's locale: the first "# " line is the title, later ones are headings, the rest paragraphs. */
function legal(c, lines) {
  const title = lines[0].replace(/^#\s*/, '');
  const body = lines.slice(1).map((l) => (l.startsWith('# ') ? `<h2>${esc(l.slice(2))}</h2>` : `<p>${esc(l)}</p>`)).join('\n');
  return shell(c, c.legalTitle.replace('{title}', title), `<main class="legal"><h1>${esc(title)}</h1>\n${body}</main>`);
}

for (const [lang, localeFile, suffix] of [['en', 'en.json', ''], ['zh', 'zh-CN.json', '-zh']]) {
  const c = JSON.parse(readFileSync(join(here, 'content', `${lang}.json`), 'utf8'));
  const locale = JSON.parse(readFileSync(join(app, 'locales', localeFile), 'utf8'));
  writeFileSync(join(here, c.page), home(c));
  writeFileSync(join(here, `privacy${suffix}.html`), legal(c, locale.legal.privacy));
  writeFileSync(join(here, `terms${suffix}.html`), legal(c, locale.legal.terms));
  console.log(`${lang}: ${c.page}, privacy${suffix}.html, terms${suffix}.html`);
}
