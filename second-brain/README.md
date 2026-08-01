# Second Brain — portable across Claude, ChatGPT, and anything else

A single source of truth about you, your work, and your decisions — written in
plain Markdown so **any** assistant can load it. No vendor-specific syntax, no
lock-in. Move providers by re-pasting one file.

## How it works

```
brain/            ← the only thing that matters. Plain Markdown. Edit by hand.
SYSTEM_PROMPT.md  ← vendor-neutral operating instructions for the assistant
adapters/         ← thin per-vendor wrappers (Claude, ChatGPT, API, CLI)
templates/        ← note shapes so both assistants write back the same way
scripts/          ← build a single pasteable bundle; create notes
dist/             ← generated bundles (gitignored)
```

The rule that keeps it interchangeable: **`brain/` is canonical, everything
else is derived.** Never let one vendor's UI become the place a fact lives.

## Quick start

```bash
# 1. Fill in the files in brain/ (they ship pre-seeded with placeholders)
# 2. Build a single file you can paste or upload anywhere
node second-brain/scripts/build-context.mjs

# → second-brain/dist/brain-bundle.md   (+ size and token estimate)
```

Then follow the adapter for whichever assistant you're in:

| Assistant | Adapter | Where the bundle goes |
|---|---|---|
| Claude (web/desktop) | [`adapters/claude.md`](adapters/claude.md) | Project → *Project knowledge* + custom instructions |
| ChatGPT | [`adapters/chatgpt.md`](adapters/chatgpt.md) | Project → *Instructions* + files, or Custom Instructions |
| Claude Code / Codex / Cursor | [`adapters/cli-agents.md`](adapters/cli-agents.md) | `CLAUDE.md` / `AGENTS.md` pointer file |
| Any API | [`adapters/api.md`](adapters/api.md) | `system` parameter |

## Where to keep this

It currently lives inside the `eufaula-bite-score` repo, which is fine while
the contents are work-safe. The folder is self-contained and has no
dependencies — `cp -r second-brain ~/second-brain` moves it anywhere, and the
scripts resolve paths relative to themselves. If the brain starts holding
anything you wouldn't want in a repo you might share, move it to a private repo
or your home directory before it does.

`dist/` is gitignored, so the generated bundle stays local either way.

## Daily loop

1. **Capture** — dump anything into `brain/07-inbox.md`, unstructured, any time.
2. **Ask** — the assistant answers using the loaded bundle.
3. **Write back** — when a conversation produces a durable fact or decision,
   ask for a *brain update block* (see `SYSTEM_PROMPT.md`). Paste it into the
   named file. This is the step that makes the brain compound instead of decay.
4. **Rebuild** — re-run `build-context.mjs` and re-upload when the bundle drifts.

## Switching providers

There is nothing to migrate. Rebuild the bundle, paste it into the new
assistant along with `SYSTEM_PROMPT.md`, delete the old project. The brain
never lived in the vendor.

## Size discipline

Assistants degrade when the context is bloated. Keep the bundle lean:

```bash
node second-brain/scripts/build-context.mjs --max-chars 40000
node second-brain/scripts/build-context.mjs --only profile,projects,preferences
```

Rough guide: under ~12k tokens the whole brain rides along in every message
cheaply. Above that, split — load the core sections always, and attach project
files only for the conversations that need them.

## Creating notes

```bash
node second-brain/scripts/new-note.mjs decision "Use Vercel over Netlify"
node second-brain/scripts/new-note.mjs meeting  "Weekly with the Eufaula crew"
node second-brain/scripts/new-note.mjs project  "Bite Score v2"
node second-brain/scripts/new-note.mjs note     "Thoughts on scoring weights"
```

Notes land in `brain/notes/` with a dated filename and front matter. They are
included in the bundle by default; exclude them with `--no-notes` once the pile
grows.
