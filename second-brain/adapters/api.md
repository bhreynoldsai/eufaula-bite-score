# Adapter — direct API use

For scripts and apps that call a model directly. The brain becomes the system
prompt; nothing else changes between providers.

## The shape

```js
import { readFileSync } from 'node:fs';

// Strip the human-facing preamble above the '---' in SYSTEM_PROMPT.md
const raw = readFileSync('second-brain/SYSTEM_PROMPT.md', 'utf8');
const instructions = raw.slice(raw.indexOf('\n---\n') + 5).trim();
const bundle = readFileSync('second-brain/dist/brain-bundle.md', 'utf8');

const system = `${instructions}\n\n---\n\nSECOND BRAIN BUNDLE\n\n${bundle}`;
```

## Anthropic

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const res = await client.messages.create({
  model: 'claude-sonnet-5',
  max_tokens: 2048,
  system,                                   // top-level parameter, not a message
  messages: [{ role: 'user', content: question }],
});
console.log(res.content[0].text);
```

## OpenAI

```js
import OpenAI from 'openai';

const client = new OpenAI();
const res = await client.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    { role: 'system', content: system },    // first message, not a parameter
    { role: 'user', content: question },
  ],
});
console.log(res.choices[0].message.content);
```

That difference — system as a parameter vs. as the first message — is the only
thing you have to change. The text is byte-identical.

## Caching

The brain is stable across calls and large enough to be worth caching if you
make many requests:

- **Anthropic:** mark the system block with `cache_control: { type: 'ephemeral' }`
  (requires passing `system` as an array of content blocks rather than a string).
- **OpenAI:** prompt caching applies automatically to long shared prefixes —
  keep the brain first and the varying question last.

Either way: put the bundle at the *front* of the prompt and never interleave
per-request data into it, or the cache prefix breaks on every call.

## Keeping it honest

If the app writes anything back — logs a decision, records a preference — write
it to `brain/` as Markdown, not to a database the other assistants can't read.
That's the whole premise.
