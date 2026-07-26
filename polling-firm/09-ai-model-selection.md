# 09 — AI Model Selection (Standing Policy)

How this project uses AI (Claude) models. This is a **standing rule**, not a
one-off recommendation: match the model to the job, and **always switch to the
most effective model for the task** — defaulting up for judgment-heavy work and
down for high-volume bulk work where evals show quality holds.

> Model IDs and pricing below are current as of the project's founding. Re-verify
> against the latest Anthropic model list before locking procurement — newer, more
> capable models should be adopted as they ship (that is what "most effective model"
> means).

---

## The two things we hold firm

1. **AI is upstream-only. Never use a model to generate published polling
   estimates.** Models are for questionnaire drafting, open-end/verbatim coding,
   pipeline automation, and report narrative — never for producing survey numbers,
   and **never "synthetic respondents."** This holds regardless of how capable the
   model is; the most capable model is still the wrong tool for producing survey
   data. (See the guardrail in [README](./README.md) and
   [03-house-methodology.md](./03-house-methodology.md).)
2. **Tier deliberately by volume.** The highest-volume AI task runs on the cheapest
   *capable* model; the lowest-volume, highest-stakes task can afford the flagship.
   Cost scales with volume, so this is where the money is saved or wasted.

---

## Model-by-task guide

| Task | Model | Model ID | Why |
|---|---|---|---|
| **Flagship reasoning** — questionnaire design, analysis narratives, message-testing interpretation, strategy synthesis | Claude Opus 5 | `claude-opus-5` | Most capable for nuanced, judgment-heavy work; the sensible default to start on |
| **Workhorse** — pipeline automation glue, report first-drafts, moderate drafting, modeling-stack code | Claude Sonnet 5 | `claude-sonnet-5` | Near-Opus quality on coding/agentic work at lower cost; default for anything run frequently |
| **Bulk classification** — coding open-end verbatims at scale (100k+), sentiment tagging, fraud/attention screening flags | Claude Haiku 4.5 | `claude-haiku-4-5` | Fastest and cheapest; bulk classification is where token spend concentrates — use the **Batch API** (50% off) here |

## The operating rule

**Start every new AI task on Opus 5, prove out the prompt, then step *down* to
Sonnet 5 or Haiku 4.5 wherever evals show quality holds.** For the bulk open-end
coding pipeline specifically, go straight to Haiku 4.5 + Batch API — that is where
spend would otherwise pile up. "Always switch to the most effective model" cuts
both ways: up to a newer flagship when one ships, down to a cheaper tier when the
task doesn't need the flagship.

## Budgeting reference (per 1M tokens, input / output)

| Model | Input | Output |
|---|---|---|
| Claude Opus 5 | $5 | $25 |
| Claude Sonnet 5 | $3 ($2 intro through 2026-08-31) | $15 ($10 intro) |
| Claude Haiku 4.5 | $1 | $5 |

**Batch API is 50% off** all of the above — use it for any non-latency-sensitive
bulk job (open-end coding is the prime candidate).

## Where this shows up in the build

- Questionnaire-drafting assist → Opus 5, occasional use, low volume.
- Open-end/verbatim coding module in the pipeline → Haiku 4.5 + Batch API, high
  volume. (See [04-technical-architecture.md](./04-technical-architecture.md) §
  AI assist and [11-technical-pipeline-spec.md](./11-technical-pipeline-spec.md).)
- Report-narrative generation → Sonnet 5 default, Opus 5 for a flagship public
  poll's writeup.
