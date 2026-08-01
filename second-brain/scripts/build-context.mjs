#!/usr/bin/env node
// Build a single pasteable/uploadable bundle from brain/*.md.
//
//   node second-brain/scripts/build-context.mjs
//   node second-brain/scripts/build-context.mjs --only profile,preferences
//   node second-brain/scripts/build-context.mjs --no-notes --max-chars 40000
//   node second-brain/scripts/build-context.mjs --stdout | pbcopy
//
// No dependencies. The output is plain Markdown with no vendor-specific
// syntax, so the same file loads into Claude, ChatGPT, or an API `system`.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAIN = join(ROOT, 'brain');
const NOTES = join(BRAIN, 'notes');

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`
Usage: node build-context.mjs [options]

  --only a,b,c     Include only these sections (match on the name after the
                   numeric prefix, e.g. "profile" for 01-profile.md). Use
                   "notes" to include the notes directory.
  --no-notes       Exclude brain/notes/ (included by default).
  --max-chars N    Character budget. Sections are dropped from the end —
                   notes first, oldest first — until the bundle fits. What
                   was dropped is always reported, never silent.
  --out PATH       Output file. Default: second-brain/dist/brain-bundle.md
  --stdout         Print to stdout instead of writing a file.
  --help           This.
`.trim());
  process.exit(0);
}

// --- collect ---------------------------------------------------------------

if (!existsSync(BRAIN)) fail(`No brain/ directory at ${BRAIN}`);

const sections = readdirSync(BRAIN)
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map((f) => ({
    kind: 'section',
    name: sectionName(f),
    path: `brain/${f}`,
    body: readFileSync(join(BRAIN, f), 'utf8').trim(),
  }));

const notes = (args.notes && existsSync(NOTES) ? readdirSync(NOTES) : [])
  .filter((f) => f.endsWith('.md') && f !== 'README.md')
  .sort() // dated filenames sort chronologically; oldest first
  .map((f) => ({
    kind: 'note',
    name: sectionName(f),
    path: `brain/notes/${f}`,
    body: readFileSync(join(NOTES, f), 'utf8').trim(),
  }));

let all = [...sections, ...notes];

if (args.only.length) {
  const wanted = new Set(args.only);
  all = all.filter((s) => wanted.has(s.name) || (s.kind === 'note' && wanted.has('notes')));
  const matched = new Set(all.map((s) => (s.kind === 'note' ? 'notes' : s.name)));
  for (const w of wanted) {
    if (!matched.has(w)) warn(`--only "${w}" matched nothing`);
  }
}

if (!all.length) fail('Nothing to bundle — check --only and that brain/ has .md files.');

// --- budget ----------------------------------------------------------------

const dropped = [];
if (args.maxChars) {
  // Drop from the end: notes are ordered oldest-first and sit after the
  // numbered sections, so the least load-bearing content goes first.
  while (all.length > 1 && render(all).length > args.maxChars) {
    dropped.push(all.pop().path);
  }
  if (render(all).length > args.maxChars) {
    warn(`Still over --max-chars with only ${all[0].path} left — budget is too small to enforce.`);
  }
}

// --- render ----------------------------------------------------------------

const out = render(all);

if (args.stdout) {
  process.stdout.write(out);
} else {
  const target = args.out || join(ROOT, 'dist', 'brain-bundle.md');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, out, 'utf8');
  console.log(`Wrote ${rel(target)}`);
}

const tokens = Math.round(out.length / 4);
console.error(
  `${all.length} section${all.length === 1 ? '' : 's'}, ` +
  `${out.length.toLocaleString()} chars, ~${tokens.toLocaleString()} tokens (rough: chars/4)`
);
if (dropped.length) {
  console.error(`Dropped to fit --max-chars ${args.maxChars}: ${dropped.reverse().join(', ')}`);
}
if (tokens > 12000 && !args.maxChars) {
  console.error('Note: over ~12k tokens. Consider --only for day-to-day use and attaching the rest per-conversation.');
}

// --- helpers ---------------------------------------------------------------

function render(items) {
  const today = new Date().toISOString().slice(0, 10);
  const toc = items.map((s) => `- ${s.path}`).join('\n');

  const head = [
    'SECOND BRAIN BUNDLE',
    '',
    `Generated ${today}. This is a concatenation of my personal knowledge base.`,
    'It is authoritative about me — my profile, projects, preferences, stack, and',
    'past decisions — and it is not a general knowledge source. Every section',
    'carries its own "last updated" date; treat old dates as possibly stale and',
    'say so rather than asserting them.',
    '',
    'Sections included:',
    '',
    toc,
    '',
  ].join('\n');

  const body = items
    .map((s) => [`${'='.repeat(72)}`, `FILE: ${s.path}`, `${'='.repeat(72)}`, '', s.body, ''].join('\n'))
    .join('\n');

  return `${head}\n${body}`;
}

function sectionName(file) {
  return basename(file, '.md').replace(/^\d+[-_]/, '');
}

function parseArgs(argv) {
  const a = { only: [], notes: true, maxChars: 0, out: '', stdout: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') a.help = true;
    else if (arg === '--no-notes') a.notes = false;
    else if (arg === '--stdout') a.stdout = true;
    else if (arg === '--only') a.only = requireValue(argv, ++i, '--only').split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--out') a.out = requireValue(argv, ++i, '--out');
    else if (arg === '--max-chars') {
      const n = Number(requireValue(argv, ++i, '--max-chars'));
      if (!Number.isFinite(n) || n <= 0) fail('--max-chars needs a positive number');
      a.maxChars = n;
    } else fail(`Unknown argument: ${arg}  (try --help)`);
  }
  return a;
}

function requireValue(argv, i, flag) {
  if (i >= argv.length || argv[i].startsWith('--')) fail(`${flag} needs a value`);
  return argv[i];
}

function rel(p) {
  return p.startsWith(process.cwd()) ? p.slice(process.cwd().length + 1) : p;
}

function warn(msg) {
  console.error(`warning: ${msg}`);
}

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}
