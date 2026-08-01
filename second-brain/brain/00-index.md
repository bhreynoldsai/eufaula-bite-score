# Second Brain — index

_Last updated: 2026-08-01_

This is the map of the brain. Every section below is a file in `brain/`, and
every file is plain Markdown with no vendor-specific syntax.

| File | Holds | Update when |
|---|---|---|
| `01-profile.md` | Who I am, role, where I work, how to reach me | Rarely |
| `02-projects.md` | Active projects, status, next actions | Weekly |
| `03-preferences.md` | How I want an assistant to work and write | When something annoys me twice |
| `04-stack.md` | Tools, services, languages, accounts, environments | When I adopt or drop a tool |
| `05-decisions.md` | Dated decision log with reasoning | Every real decision |
| `06-glossary.md` | People, orgs, product names, internal jargon | On first mention of anything I'd have to explain twice |
| `07-inbox.md` | Raw capture — unsorted, unedited | Constantly |
| `notes/` | Dated long-form notes from templates | As created |

## Conventions

- **Dates are `YYYY-MM-DD`.** Every file carries a `_Last updated:_` line, and
  every log entry is dated. Staleness is the main failure mode of a second
  brain, so it is made visible everywhere.
- **One fact, one home.** If a fact belongs in `02-projects.md`, it does not
  also get pasted into `07-inbox.md`. The inbox is a staging area — things move
  out of it.
- **Write for a stranger.** Assume the reader has no memory of the
  conversation that produced the entry. Expand acronyms once, in the glossary.
- **Prune.** A section that is wrong is worse than a section that is missing.
  Delete finished projects and dead tools rather than letting them accumulate.

## Inbox processing

Once a week, walk `07-inbox.md` top to bottom and move each item to its real
home, or delete it. An inbox that is never emptied stops being read — by you
and by the assistant.
