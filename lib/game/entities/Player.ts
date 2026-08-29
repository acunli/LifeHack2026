/**
 * Player - Adam sprite with WASD/Arrow movement.
 *
 * The Adam sheet is 4 static facings, not a walk cycle - see AGENTS.md asset
 * facts. Movement swaps the facing frame based on the last-pressed
 * direction; there is no run animation to play.
 *
 * AGENTS.md documents the frame order as "left, back, right, front", but
 * pixel-inspecting the sheet shows the opposite for the two profile frames:
 * frame 0's face points toward the right edge of its cell (facing right)
 * and frame 2's points left. Frames 1 (back) and 3 (front) match the doc.
 */

import * as Phaser from 'phaser';

type Facing = 'left' | 'back' | 'right' | 'front';

const FACING_FRAME: Record<Facing, number> = {
  right: 0,
  back: 1,
  left: 2,
  front: 3,
};

const SPEED = 140;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: Facing = 'front';
  /**
   * Walk bob.
   *
   * The character sheet has one frame per facing and no walk cycle, so there
   * is no animation to play. Nudging the draw origin while moving gives the
   * sprite some weight without new art. Origin rather than position, so the
   * physics body stays put and collisions are unaffected.
   */
  private bobPhase = 0;
  private virtualX = 0;
  private virtualY = 0;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_adam', FACING_FRAME.front);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2);
    this.setOrigin(0.5, 1); // anchor at feet for natural top-down layering
    this.setCollideWorldBounds(true);

    // Collision box covers just the feet, not the whole sprite height,
    // so the player can stand close to furniture like a real top-down game.
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(3, 24);

    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('W,A,S,D') as unknown as typeof this.keys;
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    let vx = Phaser.Math.Clamp((left ? -1 : 0) + (right ? 1 : 0) + this.virtualX, -1, 1);
    let vy = Phaser.Math.Clamp((up ? -1 : 0) + (down ? 1 : 0) + this.virtualY, -1, 1);

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    body.setVelocity(vx * SPEED, vy * SPEED);

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      // Stepped, not smooth — a continuous sine reads as floating rather than
      // walking at this pixel scale.
      this.bobPhase = (this.bobPhase + 1) % 20;
      this.setOrigin(0.5, this.bobPhase < 10 ? 1 : 1.035);
    } else {
      this.bobPhase = 0;
      this.setOrigin(0.5, 1);
    }

    if (vy < 0) this.setFacing('back');
    else if (vy > 0) this.setFacing('front');
    else if (vx < 0) this.setFacing('left');
    else if (vx > 0) this.setFacing('right');
  }

  setVirtualDirection(x: number, y: number): void {
    this.virtualX = Phaser.Math.Clamp(x, -1, 1);
    this.virtualY = Phaser.Math.Clamp(y, -1, 1);
  }

  private setFacing(facing: Facing): void {
    if (this.facing === facing) return;
    this.facing = facing;
    this.setFrame(FACING_FRAME[facing]);
  }

  getFacing(): Facing {
    return this.facing;
  }
}
