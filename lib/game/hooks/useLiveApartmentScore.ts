'use client';

/**
 * The live apartment score - the same appliance-install/power-state tracking
 * EnergyScoreOverlay used to own on its own, now shared so every surface
 * that shows "the score" (the in-game overlay, the /home dashboard, and by
 * extension WattLahMan's own read of it) is reading one number, not three.
 * Before this, /home ran a second, entirely separate scoring system (a
 * static mock apartment with its own fictional appliances), so WattLahMan
 * switching something off in the real room never moved what /home showed -
 * see git history on app/home/page.tsx for the fix.
 */

import { useEffect, useState } from 'react';
import {
  gameEvents,
  GAME_EVENTS,
  AppliancePayload,
  ApplianceInstalledPayload,
  AppliancePowerChangedPayload,
  ApplianceRemovedPayload,
} from '@/lib/game/utils/gameEvents';
import { calculateEnergyScore } from '@/lib/game/utils/energyCalculator';
import { readAuditProgress } from '@/lib/game/utils/auditProgress';
import { socketDefinitions } from '@/lib/game/data/socketDefinitions';
import { applianceCatalog } from '@/lib/game/data/applianceData';
import { readRawSession } from '@/lib/session';
import type { ApartmentScoreResult } from '@/lib/scoring';

export interface LiveInstalledEntry {
  installTargetId: string;
  appliance: AppliancePayload;
  isOn: boolean;
}

export interface LiveApartmentScore {
  installed: LiveInstalledEntry[];
  onCount: number;
  result: ApartmentScoreResult & { totalDailyKwh: number };
}

export function useLiveApartmentScore(): LiveApartmentScore {
  const [installed, setInstalled] = useState<LiveInstalledEntry[]>([]);

  useEffect(() => {
    const restoreFrame = requestAnimationFrame(() => {
      const roomNumber = readRawSession()?.roomNumber?.trim() || 'demo';
      const progress = readAuditProgress(roomNumber);
      const restored = progress.connectedTargetIds.flatMap((targetId) => {
        const socket = socketDefinitions.find(candidate => candidate.id === targetId);
        if (!socket) return [];
        const definition = applianceCatalog[socket.applianceId];
        return [{
          installTargetId: targetId,
          appliance: {
            id: definition.id,
            name: definition.name,
            dailyKwh: definition.dailyKwh,
            hoursPerDay: definition.hoursPerDay,
            tip: definition.tip,
            isCustom: false,
          },
          isOn: progress.powerByTargetId[targetId] !== false,
        }];
      });
      setInstalled(prev => {
        const entries = new Map(prev.map(entry => [entry.installTargetId, entry]));
        restored.forEach(entry => entries.set(entry.installTargetId, entry));
        return [...entries.values()];
      });
    });

    const handleInstalled = (payload: ApplianceInstalledPayload) => {
      setInstalled(prev =>
        prev.some(e => e.installTargetId === payload.installTargetId)
          ? prev
          : [...prev, { installTargetId: payload.installTargetId, appliance: payload.appliance, isOn: true }]
      );
    };
    const handlePowerChanged = (payload: AppliancePowerChangedPayload) => {
      setInstalled(prev =>
        prev.map(e => (e.installTargetId === payload.installTargetId ? { ...e, isOn: payload.isOn } : e))
      );
    };
    const handleRemoved = (payload: ApplianceRemovedPayload) => {
      setInstalled(prev => prev.filter(e => e.installTargetId !== payload.installTargetId));
    };

    gameEvents.on(GAME_EVENTS.APPLIANCE_INSTALLED, handleInstalled);
    gameEvents.on(GAME_EVENTS.APPLIANCE_POWER_CHANGED, handlePowerChanged);
    gameEvents.on(GAME_EVENTS.APPLIANCE_REMOVED, handleRemoved);
    return () => {
      cancelAnimationFrame(restoreFrame);
      gameEvents.off(GAME_EVENTS.APPLIANCE_INSTALLED, handleInstalled);
      gameEvents.off(GAME_EVENTS.APPLIANCE_POWER_CHANGED, handlePowerChanged);
      gameEvents.off(GAME_EVENTS.APPLIANCE_REMOVED, handleRemoved);
    };
  }, []);

  const onCount = installed.filter(e => e.isOn).length;
  const result = calculateEnergyScore(installed.filter(e => e.isOn).map(e => e.appliance.dailyKwh));

  return { installed, onCount, result };
}
