# Adapter — coding agents (Claude Code, Codex, Cursor, Copilot, Gemini CLI)

Coding agents read a context file from the repo root automatically. Each vendor
looks for a different filename, so the portable move is a small pointer file
per vendor, all pointing at the same brain.

## Pointer file

Write this into whichever filenames your tools look for:

```markdown
# Context

Before answering, read:

- `second-brain/SYSTEM_PROMPT.md` — how I want you to work and write
- `second-brain/dist/brain-bundle.md` — who I am, my active projects, my
  decisions, my stack

Treat the bundle as authoritative about me and stale about the world; every
section is dated. Don't invent preferences or decisions that aren't in it.
```

| Tool | Filename it reads |
|---|---|
| Claude Code | `CLAUDE.md` |
| Codex | `AGENTS.md` |
| Cursor | `.cursorrules` or `.cursor/rules/` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |

Several of these tools now also read `AGENTS.md`, so if you only want one file,
make `AGENTS.md` the real one and have the rest be a single line pointing at it.

## Symlink approach

On macOS and Linux, keep one real file and link the rest:

```bash
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
```

Windows and some CI checkouts don't follow symlinks reliably — if a tool
silently ignores its context file, that's usually why. Fall back to real files
with one line of content each.

## Scope

Repo-level context files are visible to anyone who clones the repo. Keep
anything genuinely private out of a shared repo's brain — put the brain in a
private repo or a home directory (`~/second-brain/`) and point at it by
absolute path instead.

## Keeping it in sync

The bundle is generated. Add a rebuild to whatever you already run before
committing, or just re-run it when the brain has drifted:

```bash
node second-brain/scripts/build-context.mjs
```

`dist/` is gitignored by default, so a shared repo gets the pointer and the
source, not the generated blob.
