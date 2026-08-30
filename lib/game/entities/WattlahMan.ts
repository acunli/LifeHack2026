/**
 * WattlahMan - the summonable helper mascot from `2D Character Pack.v01`.
 *
 * Like Player, each direction is a handful of trimmed frames rather than a
 * clean spritesheet grid (see wattlahmanSpriteFrames.ts) - frames are
 * registered onto plain image textures by PreloadScene, and this class just
 * swaps `texture + frame index` to animate.
 *
 * He carries a real Arcade physics body, collided by the scene against the
 * same wall/furniture group the player uses (see
 * ApartmentScene.handleWattlahmanSummon) - an earlier version tweened
 * straight to the target and walked straight through furniture. Movement is
 * a per-frame "seek" driven from `update()` rather than a tween, so Arcade
 * physics can actually stop or deflect him at a collider the way it does the
 * player; there's no real pathfinding, so a target on the far side of a
 * large obstacle can still stall him out, which is what the walk timeout
 * below guards against.
 */

import * as Phaser from 'phaser';
import { WATTLAHMAN_SHEETS, WATTLAHMAN_SCALE, WattlahmanFacing } from '../data/wattlahmanSpriteFrames';

const WALK_SPEED = 90; // px/s - a little more deliberate than the player's stride
const WALK_FRAME_MS = 90;
const ARRIVE_DISTANCE = 6;
/**
 * Bails out of a walk rather than leaving the loop stuck forever if he's
 * wedged against furniture. Scaled per-leg from the leg's own distance
 * (2x the time a clear walk would take, floored at a second) rather than a
 * fixed cap - routed legs from pathfinding.ts range from a single 16px grid
 * cell up to a long straight corridor, and a flat cap sized for the former
 * would cut the latter off mid-stride.
 */
const WALK_TIMEOUT_MULTIPLIER = 2;
const MIN_WALK_TIMEOUT_MS = 1000;
const BUBBLE_MAX_WIDTH = 168;
const BUBBLE_COLOR = 0xffe066; // --amber
const BUBBLE_BORDER = 0xe6b800; // --amber-deep
const BUBBLE_TEXT_COLOR = '#0d1813'; // --bg-deep

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

interface WalkState {
  targetX: number;
  targetY: number;
  facing: WattlahmanFacing;
  frame: number;
  frameElapsed: number;
  elapsed: number;
  timeoutMs: number;
  resolve: () => void;
}

export default class WattlahMan {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private facing: WattlahmanFacing = 'front';
  private walk?: WalkState;
  private bubble?: Phaser.GameObjects.Container;
  private bubbleTimer?: Phaser.Time.TimerEvent;
  private destroyed = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    const idle = WATTLAHMAN_SHEETS.front.idle;
    this.sprite = scene.physics.add.sprite(x, y, idle.key, 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(WATTLAHMAN_SCALE);
    this.sprite.setDepth(910); // above the player (900), always visible
    this.sprite.setCollideWorldBounds(true);

    // A small hitbox at the feet - just enough that he can't fully overlap
    // a big piece of furniture (the original bug report). It's deliberately
    // much tighter than Player's: pathfinding.ts routes him through a grid
    // with only a 2px safety margin per side (some appliance nooks in this
    // room, the microwave especially, are only ~13px wider than any real
    // body at all - a bigger margin makes that nook provably unreachable by
    // any route). A real body wider than that margin - even the 9px-wide
    // (halfWidth 4.5px) box tried here first - disagreed with the grid
    // often enough to wedge him at doorway corners the grid considered
    // clear, since Phaser centers a `setSize` box on the sprite regardless
    // of scale (confirmed against Phaser's own Body.setSize/updateBounds).
    // A world-space body of ~3px (half 1.5px, comfortably under the grid's
    // 2px margin) keeps the two in sync.
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(1, 1);
    body.setOffset(6.5, 15);

    if (!prefersReducedMotion()) {
      this.sprite.setScale(0);
      scene.tweens.add({
        targets: this.sprite,
        scale: WATTLAHMAN_SCALE,
        duration: 260,
        ease: 'Back.easeOut',
      });
    }
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  /** The physics-enabled game object, for the scene to collide against furniture/walls. */
  getPhysicsObject(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  /**
   * Steers toward (x, y) frame by frame, cycling walk frames for the
   * dominant facing, and resolves on arrival, on timeout, or immediately if
   * he's destroyed mid-walk. Call `update()` every scene tick for this to
   * make progress.
   */
  walkTo(targetX: number, targetY: number): Promise<void> {
    return new Promise(resolve => {
      const dx = targetX - this.sprite.x;
      const dy = targetY - this.sprite.y;
      const distance = Math.hypot(dx, dy);
      if (distance < ARRIVE_DISTANCE) {
        // Snap rather than just no-op-resolving: pathfinding.ts can hand
        // back a chain of legs shorter than ARRIVE_DISTANCE (a 4px grid,
        // simplified down to short turn segments), and skipping the
        // position update on every one of those silently stalled him in
        // place for the whole route.
        this.sprite.setPosition(targetX, targetY);
        resolve();
        return;
      }

      const facing = this.facingToward(dx, dy);
      this.setPose(facing, 'walk');

      if (prefersReducedMotion()) {
        this.sprite.setPosition(targetX, targetY);
        this.setPose(facing, 'idle');
        resolve();
        return;
      }

      const timeoutMs = Math.max(MIN_WALK_TIMEOUT_MS, (distance / WALK_SPEED) * 1000 * WALK_TIMEOUT_MULTIPLIER);
      this.walk = { targetX, targetY, facing, frame: 0, frameElapsed: 0, elapsed: 0, timeoutMs, resolve };
    });
  }

  /** Drives the current walk (if any); no-op otherwise. Call once per scene tick. */
  update(deltaMs: number): void {
    if (!this.walk || this.destroyed) return;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const w = this.walk;
    w.elapsed += deltaMs;

    const dx = w.targetX - this.sprite.x;
    const dy = w.targetY - this.sprite.y;
    const distance = Math.hypot(dx, dy);

    if (distance < ARRIVE_DISTANCE || w.elapsed > w.timeoutMs) {
      body.setVelocity(0, 0);
      this.setPose(w.facing, 'idle');
      this.walk = undefined;
      w.resolve();
      return;
    }

    const facing = this.facingToward(dx, dy);
    if (facing !== w.facing) {
      w.facing = facing;
      this.setPose(facing, 'walk');
      w.frame = 0;
    }

    body.setVelocity((dx / distance) * WALK_SPEED, (dy / distance) * WALK_SPEED);

    w.frameElapsed += deltaMs;
    if (w.frameElapsed >= WALK_FRAME_MS) {
      w.frameElapsed = 0;
      const frameCount = WATTLAHMAN_SHEETS[facing].walk.frames.length;
      w.frame = (w.frame + 1) % frameCount;
      this.sprite.setFrame(w.frame);
    }
  }

  private facingToward(dx: number, dy: number): WattlahmanFacing {
    return Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? 'back' : 'front') : dx < 0 ? 'left' : 'right';
  }

  /** Pops a speech bubble above his head for `durationMs`, then fades it out. */
  say(message: string, durationMs = 2200): Promise<void> {
    return new Promise(resolve => {
      this.clearBubble();

      const padding = 10;
      const text = this.scene.add.text(0, 0, message, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: BUBBLE_TEXT_COLOR,
        align: 'center',
        wordWrap: { width: BUBBLE_MAX_WIDTH },
      });
      text.setOrigin(0.5, 1);

      const boxWidth = text.width + padding * 2;
      const boxHeight = text.height + padding * 2;
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(BUBBLE_COLOR, 1);
      graphics.lineStyle(2, BUBBLE_BORDER, 1);
      graphics.fillRoundedRect(-boxWidth / 2, -boxHeight, boxWidth, boxHeight, 6);
      graphics.strokeRoundedRect(-boxWidth / 2, -boxHeight, boxWidth, boxHeight, 6);
      // Tail pointing down at his head.
      graphics.fillTriangle(-6, 0, 6, 0, 0, 8);

      text.setPosition(0, -padding);

      const container = this.scene.add.container(this.sprite.x, this.sprite.y - this.bubbleAnchorHeight(), [
        graphics,
        text,
      ]);
      container.setDepth(1200);
      this.bubble = container;

      const reduced = prefersReducedMotion();
      if (!reduced) {
        container.setScale(0);
        this.scene.tweens.add({ targets: container, scale: 1, duration: 180, ease: 'Back.easeOut' });
      }

      this.bubbleTimer = this.scene.time.delayedCall(durationMs, () => {
        if (reduced) {
          this.clearBubble();
          resolve();
          return;
        }
        this.scene.tweens.add({
          targets: container,
          alpha: 0,
          scale: 0.85,
          duration: 160,
          onComplete: () => {
            this.clearBubble();
            resolve();
          },
        });
      });
    });
  }

  private bubbleAnchorHeight(): number {
    const idleHeight = WATTLAHMAN_SHEETS[this.facing].idle.frames[0]?.height ?? 18;
    return idleHeight * WATTLAHMAN_SCALE + 4;
  }

  private clearBubble(): void {
    this.bubbleTimer?.remove();
    this.bubbleTimer = undefined;
    this.bubble?.destroy();
    this.bubble = undefined;
  }

  private setPose(facing: WattlahmanFacing, pose: 'idle' | 'walk'): void {
    this.facing = facing;
    const { key } = WATTLAHMAN_SHEETS[facing][pose];
    this.sprite.setTexture(key, 0);
    // Keep the bubble anchored correctly if a facing change happens mid-say.
    if (this.bubble) this.bubble.setY(this.sprite.y - this.bubbleAnchorHeight());
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    const pendingResolve = this.walk?.resolve;
    this.walk = undefined;
    this.clearBubble();
    this.scene.tweens.killTweensOf(this.sprite);
    pendingResolve?.();
    this.sprite.destroy();
  }
}
