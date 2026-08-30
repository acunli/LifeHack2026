/** Room-scoped persistence for the apartment energy-audit loop. */

const STORAGE_PREFIX = "wattlah.audit.v1";

export const AUDIT_PROGRESS_EVENT = "wattlah:audit-progress";

export type AuditProgress = {
  connectedTargetIds: string[];
  powerByTargetId: Record<string, boolean>;
};

const EMPTY_PROGRESS: AuditProgress = { connectedTargetIds: [], powerByTargetId: {} };

/**
 * What a fresh room starts with, before the resident has scanned anything.
 * A brand-new room reading 0 kWh clamps to a 100 score on arrival (see
 * lib/scoring.ts's documented clamp behavior - not something to "fix"), which
 * read as fake/inert on a first visit. Real flats already have things
 * running: the fridge (always on, and excluded from WattLahMan's own
 * candidates as essential), the TV, the study monitor, and the washer are
 * seeded on so the opening score is a real, non-trivial reading. The
 * microwave is deliberately left out - one socket stays undiscovered so the
 * "map your biggest energy drains" audit mission still has something to do.
 */
const DEFAULT_PROGRESS: AuditProgress = {
  connectedTargetIds: ['kitchen_fridge', 'living_tv', 'study_desk', 'bathroom_washer'],
  powerByTargetId: {
    kitchen_fridge: true,
    living_tv: true,
    study_desk: true,
    bathroom_washer: true,
  },
};

function storageKey(roomNumber: string): string {
  return `${STORAGE_PREFIX}:${roomNumber.trim().toLowerCase() || "demo"}`;
}

function normalise(value: unknown): AuditProgress {
  if (!value || typeof value !== "object") return EMPTY_PROGRESS;
  const ids = (value as Partial<AuditProgress>).connectedTargetIds;
  if (!Array.isArray(ids)) return EMPTY_PROGRESS;
  const rawPower = (value as Partial<AuditProgress>).powerByTargetId;
  const powerByTargetId = rawPower && typeof rawPower === "object"
    ? Object.fromEntries(
        Object.entries(rawPower).filter((entry): entry is [string, boolean] => (
          typeof entry[1] === "boolean"
        )),
      )
    : {};
  return {
    connectedTargetIds: [
      ...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0)),
    ],
    powerByTargetId,
  };
}

function writeAuditProgress(roomNumber: string, next: AuditProgress): void {
  try {
    window.localStorage.setItem(storageKey(roomNumber), JSON.stringify(next));
    window.dispatchEvent(new Event(AUDIT_PROGRESS_EVENT));
  } catch {
    /* The live scene still works when storage is blocked. */
  }
}

export function readAuditProgress(roomNumber: string): AuditProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(storageKey(roomNumber));
    // No stored record at all means a genuinely fresh room - default it to
    // a realistic starting state rather than empty. Once the resident
    // changes anything, connectAuditTarget/setAuditTargetPower persist the
    // real state, so this default is only ever read once per room.
    return raw ? normalise(JSON.parse(raw)) : DEFAULT_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function connectAuditTarget(
  roomNumber: string,
  targetId: string,
): AuditProgress {
  const current = readAuditProgress(roomNumber);
  if (current.connectedTargetIds.includes(targetId)) return current;

  const next = {
    connectedTargetIds: [...current.connectedTargetIds, targetId],
    powerByTargetId: { ...current.powerByTargetId, [targetId]: true },
  };

  writeAuditProgress(roomNumber, next);

  return next;
}

export function disconnectAuditTarget(
  roomNumber: string,
  targetId: string,
): AuditProgress {
  const current = readAuditProgress(roomNumber);
  const next = {
    connectedTargetIds: current.connectedTargetIds.filter((id) => id !== targetId),
    powerByTargetId: Object.fromEntries(
      Object.entries(current.powerByTargetId).filter(([id]) => id !== targetId),
    ),
  };

  writeAuditProgress(roomNumber, next);

  return next;
}

export function setAuditTargetPower(
  roomNumber: string,
  targetId: string,
  isOn: boolean,
): AuditProgress {
  const current = readAuditProgress(roomNumber);
  if (!current.connectedTargetIds.includes(targetId)) return current;
  const next = {
    ...current,
    powerByTargetId: { ...current.powerByTargetId, [targetId]: isOn },
  };
  writeAuditProgress(roomNumber, next);
  return next;
}
