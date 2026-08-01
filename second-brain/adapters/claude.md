# Adapter — Claude (web / desktop / mobile)

The brain is vendor-neutral; this file is only the mechanics of loading it.

## One-time setup

1. Build the bundle:

   ```bash
   node second-brain/scripts/build-context.mjs
   ```

2. In Claude, create a **Project** named something like `Second Brain`.
3. Open the project's **custom instructions** and paste the entire contents of
   `SYSTEM_PROMPT.md` from below the `---` line.
4. Add `dist/brain-bundle.md` to the project's **knowledge** (upload the file
   rather than pasting it — knowledge files are retrieved as needed and don't
   consume your instruction budget).

Every chat started inside that project now has the brain.

## Updating

Re-run the build, then replace the knowledge file. Uploading a second copy
instead of replacing is the usual failure — you end up with two versions of
your preferences and the model picks whichever it retrieves.

```bash
node second-brain/scripts/build-context.mjs
# → replace dist/brain-bundle.md in the project knowledge
```

## Writing back

When Claude ends a reply with a `BRAIN UPDATE →` block, paste it into the named
file under `brain/`. Rebuild when you've accumulated a few.

## If you use Claude Code

Point Claude Code at the brain from the repo root by creating `CLAUDE.md`:

```markdown
# Project context

Read `second-brain/dist/brain-bundle.md` for context about me, my preferences,
and my active projects before answering. Follow the operating instructions in
`second-brain/SYSTEM_PROMPT.md`.
```

Claude Code reads `CLAUDE.md` automatically at session start, so the brain
loads without any pasting. See `cli-agents.md` for the multi-tool version.

## Notes specific to this vendor

- Project knowledge is retrieved, not always fully in context — so keep the
  highest-value facts (profile, preferences) near the top of the bundle where a
  partial read still catches them.
- Claude respects the "no preamble" instruction well; if replies drift back to
  restating your question, the bundle is probably too large and the
  instructions are getting crowded out. Rebuild with `--max-chars`.
