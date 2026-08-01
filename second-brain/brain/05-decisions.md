# Decision log

_Last updated: 2026-08-01_

Newest first. Every entry is dated and carries its reasoning, because the
reason is what tells you later whether the decision still holds. A decision
without a "revisit if" tends to outlive its justification.

Format:

    ## YYYY-MM-DD — Short title
    **Decision:** What was decided, in one sentence.
    **Why:** The reasoning that mattered. Include what you rejected.
    **Revisit if:** The condition that would reopen this.

---

## 2026-08-01 — Second brain lives in Markdown, not in a vendor

**Decision:** Keep all long-term context in plain Markdown under
`second-brain/brain/`, and treat Claude Projects and ChatGPT Projects as
disposable views built from it.

**Why:** Context stored in a vendor's UI can't be diffed, versioned, or moved,
and it silently forks when you use two assistants. A Markdown core with a build
step means switching providers costs one paste. Rejected: keeping context in
Claude Projects only (locks in), and a database-backed tool (more machinery
than a personal knowledge base earns).

**Revisit if:** The bundle outgrows what fits comfortably in context, at which
point sections get loaded selectively rather than all at once.

---

## YYYY-MM-DD — TODO

**Decision:**
**Why:**
**Revisit if:**
