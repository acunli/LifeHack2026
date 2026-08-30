/**
 * WattLahMan's "brain" — picks the single best next appliance to switch off
 * and a short in-character line explaining it, via Kimi K3 hosted on
 * Fireworks AI (fireworks.ai/models/fireworks/kimi-k3 - OpenAI-compatible
 * Chat Completions API, confirmed against docs.fireworks.ai).
 *
 * This calls Fireworks directly from the browser (no backend exists in this
 * project to proxy it through). Fireworks' REST API is documented as
 * Bearer-token auth with no CORS guidance published for direct browser use,
 * so a fetch from here may still be blocked depending on their server-side
 * CORS policy. Either way this degrades to `pickOffline`, a deterministic
 * local heuristic, so WattLahMan always has something to do and say — the
 * AI call only upgrades the *reasoning and flavour text*, it is never
 * load-bearing for the feature working at all.
 */

const KIMI_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const KIMI_MODEL = 'accounts/fireworks/models/kimi-k3';
const REQUEST_TIMEOUT_MS = 8000;

export interface WattlahmanApplianceState {
  installTargetId: string;
  name: string;
  dailyKwh: number;
  /** The appliance's own "ways to save" tip, from applianceData.ts/customApplianceTypes.ts. */
  tip: string;
}

export interface WattlahmanDecision {
  installTargetId: string;
  message: string;
}

const OFFLINE_LEAD_INS = [
  (name: string) => `${name} time's up for now.`,
  (name: string) => `Nobody's using the ${name.toLowerCase()} right now.`,
  () => `Quick win here —`,
  (name: string) => `WattLahMan's tip for the ${name.toLowerCase()}:`,
];

/**
 * The caller already filtered candidates down to switchable, still-on
 * appliances (see ApartmentScene.collectSwitchableAppliances) - this just
 * picks the biggest remaining draw and grounds the line in that appliance's
 * own energy-saving tip, rather than a generic quip, so "ways to save"
 * content is what WattLahMan is actually saying even without the AI call.
 */
function pickOffline(candidates: WattlahmanApplianceState[]): WattlahmanDecision {
  const target = candidates.reduce((worst, c) => (c.dailyKwh > worst.dailyKwh ? c : worst));
  const leadIn = OFFLINE_LEAD_INS[target.installTargetId.length % OFFLINE_LEAD_INS.length];
  return { installTargetId: target.installTargetId, message: `${leadIn(target.name)} ${target.tip}` };
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in response');
  return JSON.parse(body.slice(start, end + 1));
}

async function askKimi(
  candidates: WattlahmanApplianceState[],
  score: number,
  apiKey: string,
): Promise<WattlahmanDecision | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: KIMI_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You are WattLahMan, a cheerful pixel-art energy-saving mascot for a Singapore apartment ' +
              'energy game called WattLah. A resident just summoned you into their apartment because their ' +
              'energy score (0-100, higher is better) is not yet at its best. The caller has already ' +
              'filtered the appliance list down for you: every entry is switched on, and none of them need ' +
              'to run continuously (an always-on appliance like a fridge is never included, and is never a ' +
              'valid answer). Your job is NOT to empty every socket in the room - it is to reach the best ' +
              'achievable score with the fewest, most sensible changes. From the given list, pick the ONE ' +
              'appliance whose installTargetId gets the flat closest to its best score fastest (normally the ' +
              'single biggest remaining dailyKwh draw). Each appliance carries its own official "ways to ' +
              'save" tip - ground your one-line explanation in that specific tip\'s actual advice (paraphrase ' +
              'or quote it) rather than inventing unrelated flavour text, and keep the tone playful ' +
              '(Singlish welcome, e.g. "lah", "leh"). Reply with ONLY a JSON object of the exact shape ' +
              '{"installTargetId": "...", "message": "..."} and nothing else. message must be under 140 ' +
              'characters.',
          },
          {
            role: 'user',
            content: JSON.stringify({ score, appliancesOn: candidates }),
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Kimi API responded ${response.status}`);

    const payload = await response.json();
    const content: unknown = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('Malformed Kimi response');

    const parsed = extractJson(content) as Partial<WattlahmanDecision>;
    const valid = candidates.some(c => c.installTargetId === parsed.installTargetId);
    if (!valid || typeof parsed.message !== 'string' || !parsed.message.trim()) {
      throw new Error('Kimi picked an appliance not in the candidate list');
    }

    return { installTargetId: parsed.installTargetId!, message: parsed.message.trim() };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns the next action to take, or `null` if there is nothing left to
 * improve (no appliances currently on). Never throws — any failure to reach
 * or parse Kimi falls back to the local heuristic.
 */
export async function decideNextAction(
  candidates: WattlahmanApplianceState[],
  score: number,
  apiKey: string | null,
): Promise<WattlahmanDecision | null> {
  if (candidates.length === 0) return null;
  if (!apiKey) return pickOffline(candidates);

  try {
    return await askKimi(candidates, score, apiKey);
  } catch {
    return pickOffline(candidates);
  }
}
