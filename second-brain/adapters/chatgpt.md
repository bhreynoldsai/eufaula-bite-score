# Adapter — ChatGPT

Same brain, different window. Nothing about the content changes.

## One-time setup (recommended: a Project)

1. Build the bundle:

   ```bash
   node second-brain/scripts/build-context.mjs
   ```

2. Create a **Project** named `Second Brain`.
3. Paste `SYSTEM_PROMPT.md` (everything below the `---`) into the project's
   **instructions** field.
4. Upload `dist/brain-bundle.md` to the project's files.

## Alternative: Custom Instructions (global, all chats)

Custom Instructions are short — they won't hold the bundle. Put a compressed
version there instead:

- **"What would you like ChatGPT to know about you?"** → the *Profile* and
  *Preferences* sections only:

  ```bash
  node second-brain/scripts/build-context.mjs \
    --only profile,preferences --no-notes --stdout
  ```

- **"How would you like ChatGPT to respond?"** → the "How to talk to me" and
  "Keeping the brain current" sections of `SYSTEM_PROMPT.md`.

Then attach the full bundle per-conversation when a chat needs project depth.

## A note on memory

ChatGPT's built-in memory will start saving facts on its own. That's the exact
failure this setup exists to avoid: context that lives in one vendor, can't be
diffed, and silently diverges from what Claude knows. Either turn memory off,
or treat it as a cache — `brain/` stays the record.

## Writing back

Same protocol: when a reply ends with a `BRAIN UPDATE →` block, paste it into
the named file under `brain/`, then rebuild.

## Notes specific to this vendor

- If replies come back with headers and bullet lists you didn't ask for,
  restate the length rule in the conversation — formatting habits reassert
  themselves more often here than in Claude.
- Uploaded files are read per-conversation. For a long research session, paste
  the bundle inline once instead of relying on the file for every turn.
