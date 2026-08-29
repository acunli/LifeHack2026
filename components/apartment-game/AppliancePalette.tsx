'use client';

/**
 * AppliancePalette - drag source for custom appliances (issue: "add
 * appliances that the user can add, drag and drop a placeholder"). Drag one
 * of these onto the game canvas to drop a placeholder there; click it to
 * install and see its stats, same as the 5 fixed appliances.
 */

import { customApplianceTypes } from '@/lib/game/data/customApplianceTypes';

export default function AppliancePalette() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        marginTop: '0.75rem',
        maxWidth: '768px',
      }}
    >
      {customApplianceTypes.map(type => (
        <div
          key={type.type}
          draggable
          onDragStart={e => {
            e.dataTransfer.setData('text/plain', type.type);
            e.dataTransfer.effectAllowed = 'copy';
          }}
          title={`Drag onto the room to add a ${type.name}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.6rem',
            backgroundColor: '#1f1f1f',
            border: '1px dashed #555',
            borderRadius: '8px',
            color: '#ccc',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            cursor: 'grab',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{type.icon}</span>
          {type.name}
        </div>
      ))}
    </div>
  );
}
