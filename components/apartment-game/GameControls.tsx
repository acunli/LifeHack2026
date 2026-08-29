"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { gameEvents, GAME_EVENTS } from "@/lib/game/utils/gameEvents";

type Direction = { x: number; y: number; label: string; glyph: string };

const DIRECTIONS: Direction[] = [
  { x: 0, y: -1, label: "Move up", glyph: "▲" },
  { x: -1, y: 0, label: "Move left", glyph: "◀" },
  { x: 0, y: 1, label: "Move down", glyph: "▼" },
  { x: 1, y: 0, label: "Move right", glyph: "▶" },
];

function stopMoving() {
  gameEvents.emit(GAME_EVENTS.PLAYER_MOVE_REQUEST, { x: 0, y: 0 });
}

export default function GameControls() {
  function startMoving(
    direction: Direction,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gameEvents.emit(GAME_EVENTS.PLAYER_MOVE_REQUEST, {
      x: direction.x,
      y: direction.y,
    });
  }

  return (
    <>
      <div className="game-keyboard-hint" aria-hidden="true">
        <span>WASD / arrows</span>
        <span className="game-key">E</span>
        <span>scan</span>
      </div>
      <div className="game-touch-controls" aria-label="Apartment controls">
        <div className="game-dpad">
          {DIRECTIONS.map((direction, index) => (
            <button
              key={direction.label}
              type="button"
              aria-label={direction.label}
              className={`game-control game-control-${index}`}
              onPointerDown={(event) => startMoving(direction, event)}
              onPointerUp={stopMoving}
              onPointerCancel={stopMoving}
              onLostPointerCapture={stopMoving}
            >
              {direction.glyph}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="game-control game-action"
          onClick={() => gameEvents.emit(GAME_EVENTS.PLAYER_INTERACT_REQUEST)}
          aria-label="Scan nearby appliance"
        >
          <b>E</b>
          <span>Scan</span>
        </button>
      </div>
    </>
  );
}
