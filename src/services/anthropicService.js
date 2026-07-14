// Anthropic AI explanation service. Uses streaming via fetch + ReadableStream.
// In a Claude artifact context the request is proxied; outside that context it
// will fail CORS and we render a static fallback based on the score bucket.

const SYSTEM_PROMPT = `You are an expert fishing guide on Lake Eufaula (Walter F. George Reservoir) on the Alabama–Georgia line, with 20 years of experience. You explain fishing conditions in plain, confident language — like a trusted guide talking to an angler before they launch the boat. Be specific to Lake Eufaula geography and seasonal patterns: the riverine upper end, the big creek arms like Cowikee and Barbour, the ledges and grass lines mid-lake, and the deep water near the Walter F. George Dam. Never use bullet points or lists. Write in short paragraphs. Maximum 220 words.`;

function buildUserMessage(args) {
  const {
    species, score, label, zone, waterTemp, airTemp, pressure, pressureTrend,
    wind, windDir, clouds, precip, time, sunRelation, moonPhase, moonIllum,
    solunarStatus, inflowStatus, topFactors, lowFactors,
  } = args;
  return [
    `Species: ${species}`,
    `Current Bite Score: ${score}/100 (${label})`,
    `Lake Zone: ${zone}`,
    '',
    'Current conditions:',
    `- Water temp: ${waterTemp}°F (estimated)`,
    `- Air temp: ${airTemp}°F`,
    `- Barometric pressure: ${pressure} mb, ${pressureTrend}`,
    `- Wind: ${wind} mph ${windDir || ''}`.trim(),
    `- Cloud cover: ${clouds}%`,
    `- Precipitation: ${precip} in/hr`,
    `- Time: ${time} (${sunRelation})`,
    `- Moon phase: ${moonPhase}, ${moonIllum}% illumination`,
    `- Solunar: ${solunarStatus}`,
    `- Dam generation / inflow: ${inflowStatus}`,
    '',
    `Top scoring factors: ${topFactors}`,
    `Suppressing factors: ${lowFactors}`,
    '',
    'Explain why the bite score is what it is. Describe where on the lake to focus given the selected zone. State what technique or presentation the conditions favor. End with one Lake Eufaula-specific local tip for this species.',
  ].join('\n');
}

export function fallbackExplanation(species, score, zone) {
  if (score >= 76) {
    return `Conditions are stacking in your favor for ${species} right now. The combination of timing, weather, and water makes this a window worth fishing hard. Focus on high-percentage water in the ${zone} area — ledge drops, grass edges, and creek mouths with bait on them. Be efficient, cover water, and trust the active bite. Eufaula tip: when the dam is generating, the fish position on current-swept structure — use that seam.`;
  }
  if (score >= 56) {
    return `It's a workable bite for ${species} — not red-hot but well above tough. Lean into the factors running favorable. Around the ${zone} area, look for the cleanest combination of bait, depth, and shade. Slow down a notch from a hot-bite pace and stay disciplined on your best three or four spots. Eufaula tip: the causeway and major creek mouths concentrate fish when the main lake goes quiet.`;
  }
  if (score >= 31) {
    return `Conditions are fair for ${species} — fish are catchable but selective. Focus on structure transitions and slow your presentation. In the ${zone} area, deeper and steadier water usually holds the bite when surface conditions waver. Downsize, lengthen your soaks, and expect short flurries rather than steady action. Eufaula tip: a river-channel ledge with brush on it beats a mile of pretty bank on a slow day.`;
  }
  return `Today is tough for ${species}. Fish deep, slow, and expect short windows. Pick the ${zone} structure you know best, work it methodically, and don't burn fuel running. Bait or finesse presentations on the deepest available cover will outproduce moving baits. Eufaula tip: one quality fish off a proven ledge or deep brush pile is the realistic goal — quantity isn't on the menu today.`;
}

// Streams an explanation. Yields incremental text chunks via the onToken callback.
// Returns a Promise that resolves to the full text. Aborts on signal.
export async function streamExplanation(args, onToken, signal) {
  const userMessage = buildUserMessage(args);
  const timeout = setTimeout(() => {
    // 15-second cap
    if (signal && !signal.aborted) {
      try { signal.dispatchEvent?.(new Event('abort')); } catch {}
    }
  }, 15000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        stream: true,
      }),
    });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Server-Sent Events: each event is separated by \n\n; each line starts
      // with `event:` or `data:`. We parse data lines as JSON.
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      for (const evt of events) {
        const dataLine = evt.split('\n').find(l => l.startsWith('data:'));
        if (!dataLine) continue;
        const payload = dataLine.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          if (json.type === 'content_block_delta' && json.delta?.text) {
            full += json.delta.text;
            onToken?.(json.delta.text);
          }
        } catch {
          // Ignore unparseable events
        }
      }
    }
    return full;
  } finally {
    clearTimeout(timeout);
  }
}
