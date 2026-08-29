'use client';

/**
 * EnergyScoreOverlay - live score badge that updates as appliances (fixed
 * or custom) are installed, removed, or switched on/off. Reuses
 * lib/scoring.ts's computeScore via energyCalculator.ts so this game's
 * score follows the same formula as the rest of the app.
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

const STATUS_COLOR: Record<string, string> = {
  'Energy Saver': '#4ade80',
  Good: '#a3e635',
  Average: '#facc15',
  'Needs Improvement': '#f87171',
};

interface InstalledEntry {
  installTargetId: string;
  appliance: AppliancePayload;
  isOn: boolean;
}

export default function EnergyScoreOverlay() {
  const [installed, setInstalled] = useState<InstalledEntry[]>([]);

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

  return (
    <div
      style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        backgroundColor: 'rgba(0,0,0,0.75)',
        border: `1px solid ${STATUS_COLOR[result.status]}`,
        borderRadius: '8px',
        padding: '0.6rem 0.9rem',
        color: '#fff',
        lineHeight: 'normal',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        minWidth: '150px',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ color: '#888' }}>Score</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: STATUS_COLOR[result.status] }}>
          {result.score}
        </span>
      </div>
      <div style={{ color: STATUS_COLOR[result.status], marginBottom: '0.35rem' }}>
        {result.status}
      </div>
      <div style={{ color: '#aaa' }}>{result.totalDailyKwh} kWh/day</div>
      <div style={{ color: '#666', marginTop: '0.25rem' }}>
        {installed.length} appliance{installed.length === 1 ? '' : 's'} installed · {onCount} on
      </div>
    </div>
  );
}
