/** Room-scoped persistence for the apartment energy-audit loop. */

const STORAGE_PREFIX = "wattlah.audit.v1";

export const AUDIT_PROGRESS_EVENT = "wattlah:audit-progress";

export type AuditProgress = {
  connectedTargetIds: string[];
  powerByTargetId: Record<string, boolean>;
};

const EMPTY_PROGRESS: AuditProgress = { connectedTargetIds: [], powerByTargetId: {} };

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
    return raw ? normalise(JSON.parse(raw)) : EMPTY_PROGRESS;
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
