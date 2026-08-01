#!/usr/bin/env node
// Create a dated note in brain/notes/ from a template.
//
//   node second-brain/scripts/new-note.mjs decision "Use Vercel over Netlify"
//   node second-brain/scripts/new-note.mjs meeting  "Weekly with the crew"
//   node second-brain/scripts/new-note.mjs project  "Bite Score v2"
//   node second-brain/scripts/new-note.mjs note     "Scoring weight ideas"

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = join(ROOT, 'templates');
const NOTES = join(ROOT, 'brain', 'notes');

const [type, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();

const available = existsSync(TEMPLATES)
  ? readdirSync(TEMPLATES).filter((f) => f.endsWith('.md')).map((f) => basename(f, '.md'))
  : [];

if (!type || !title) {
  console.error(`Usage: node new-note.mjs <type> "<title>"\n\nTypes: ${available.join(', ') || '(none found)'}`);
  process.exit(1);
}

const template = join(TEMPLATES, `${type}.md`);
if (!existsSync(template)) {
  console.error(`error: no template "${type}".  Available: ${available.join(', ')}`);
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 60) || 'untitled';

mkdirSync(NOTES, { recursive: true });

let target = join(NOTES, `${date}-${slug}.md`);
for (let n = 2; existsSync(target); n++) {
  target = join(NOTES, `${date}-${slug}-${n}.md`);
}

const body = readFileSync(template, 'utf8')
  .replaceAll('{{TITLE}}', title)
  .replaceAll('{{DATE}}', date);

writeFileSync(target, body, 'utf8');
console.log(target.startsWith(process.cwd()) ? target.slice(process.cwd().length + 1) : target);
