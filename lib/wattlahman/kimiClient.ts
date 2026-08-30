/**
 * WattLahMan's "brain" — picks the single best next appliance to switch off
 * (or decides nothing is worth switching off right now) and a short
 * in-character line explaining the call, via Kimi K3 hosted on Fireworks AI
 * (fireworks.ai/models/fireworks/kimi-k3 - OpenAI-compatible Chat
 * Completions API, confirmed against docs.fireworks.ai).
 *
 * This is deliberately NOT a pure score-maximizer: every appliance carries
 * an `inconvenience` rating (see applianceData.ts), and the brain weighs
 * dailyKwh savings against that rating rather than always chasing the
 * biggest draw or emptying every socket in the room for a couple more
 * points. If nothing on offer clears the bar, it says so and stops.
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
  /** 1 (barely noticed) to 5 (actively disruptive) - see applianceData.ts. */
  inconvenience: number;
}

export type WattlahmanDecision =
  | { action: 'act'; installTargetId: string; message: string }
  | { action: 'skip'; message: string };

const SKIP_MESSAGE = "Not worth the hassle for what's left, lah — I'll leave those be.";

/** Savings per unit of hassle - the tradeoff the brain actually optimizes for, not raw dailyKwh. */
function valueOf(candidate: WattlahmanApplianceState): number {
  return candidate.dailyKwh / candidate.inconvenience;
}

/**
 * Below this, the disruption isn't worth what little it saves (e.g. a
 * washing machine mid-cycle for a modest draw, or a games console for
 * almost nothing) - tuned against the fixed catalog + custom types so a
 * washer (0.6 kWh / inconvenience 4 = 0.15) and a console (0.3 / 3 = 0.1)
 * fall below it while a monitor (1.0 / 3 = 0.33) and an aircon (2.5 / 4 =
 * 0.625) clear it comfortably.
 */
const WORTH_IT_THRESHOLD = 0.2;

const OFFLINE_LEAD_INS = [
  (name: string) => `${name} time's up for now.`,
  (name: string) => `Nobody's using the ${name.toLowerCase()} right now.`,
  () => `Quick win here —`,
  (name: string) => `WattLahMan's tip for the ${name.toLowerCase()}:`,
];

/**
 * The caller already filtered candidates down to switchable, still-on
 * appliances (see ApartmentScene.collectSwitchableAppliances) - this picks
 * the one with the best savings-for-the-hassle tradeoff and grounds the
 * line in that appliance's own energy-saving tip, rather than a generic
 * quip, so "ways to save" content is what WattLahMan is actually saying
 * even without the AI call. Returns a `skip` decision if nothing clears
 * WORTH_IT_THRESHOLD.
 */
function pickOffline(candidates: WattlahmanApplianceState[]): WattlahmanDecision {
  const worthwhile = candidates.filter(c => valueOf(c) >= WORTH_IT_THRESHOLD);
  if (worthwhile.length === 0) return { action: 'skip', message: SKIP_MESSAGE };

  const target = worthwhile.reduce((best, c) => (valueOf(c) > valueOf(best) ? c : best));
  const leadIn = OFFLINE_LEAD_INS[target.installTargetId.length % OFFLINE_LEAD_INS.length];
  return { action: 'act', installTargetId: target.installTargetId, message: `${leadIn(target.name)} ${target.tip}` };
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
): Promise<WattlahmanDecision> {
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
              'valid answer). Each appliance also carries an "inconvenience" rating from 1 (barely noticed ' +
              'if switched off) to 5 (actively disruptive right now, e.g. a washing machine mid-cycle). You ' +
              'are NOT a pure score-maximizer and must NOT just empty every socket in the room or always ' +
              'pick the single biggest energy draw - find the best real-world tradeoff between the dailyKwh ' +
              'saved and how disruptive that is for the resident (roughly: prefer whichever appliance saves ' +
              'the most dailyKwh per point of inconvenience). If none of the given appliances offers a good ' +
              'enough tradeoff to justify switching off right now, respond with installTargetId set to JSON ' +
              'null and a short message explaining you are leaving things be for now. Otherwise pick the ONE ' +
              'appliance with the best tradeoff. Each appliance carries its own official "ways to save" tip - ' +
              'ground your one-line explanation in that specific tip\'s actual advice (paraphrase or quote ' +
              'it) rather than inventing unrelated flavour text, and keep the tone playful (Singlish welcome, ' +
              'e.g. "lah", "leh"). Reply with ONLY a JSON object of the exact shape {"installTargetId": ' +
              '"..." or null, "message": "..."} and nothing else. message must be under 140 characters.',
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

    const parsed = extractJson(content) as { installTargetId?: string | null; message?: string };
    if (typeof parsed.message !== 'string' || !parsed.message.trim()) {
      throw new Error('Kimi response missing a message');
    }
    const message = parsed.message.trim();

    if (parsed.installTargetId === null) {
      return { action: 'skip', message };
    }

    const valid = candidates.some(c => c.installTargetId === parsed.installTargetId);
    if (!valid) throw new Error('Kimi picked an appliance not in the candidate list');

    return { action: 'act', installTargetId: parsed.installTargetId!, message };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Decides the next move: switch a specific appliance off, or skip because
 * nothing on offer is worth the disruption. Never throws — any failure to
 * reach or parse Kimi falls back to the local heuristic, so this always
 * resolves to a usable decision.
 */
export async function decideNextAction(
  candidates: WattlahmanApplianceState[],
  score: number,
  apiKey: string | null,
): Promise<WattlahmanDecision> {
  if (candidates.length === 0) return { action: 'skip', message: SKIP_MESSAGE };
  if (!apiKey) return pickOffline(candidates);

  try {
    return await askKimi(candidates, score, apiKey);
  } catch {
    return pickOffline(candidates);
  }
}
