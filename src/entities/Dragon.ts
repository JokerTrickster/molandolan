import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject';
import { Vector2, GameColor, DragonState } from '@/types';
import { EventBus } from '@/core/EventBus';

export class Dragon extends GameObject {
  public currentColor: GameColor;
  public targetPosition: Vector2 | null = null;
  public state: DragonState;
  private moveSpeed: number = 300; // pixels per second
  private colorSprite: PIXI.Graphics;
  private eventBus: EventBus;
  private animationTime: number = 0;

  constructor(position: Vector2) {
    super('dragon', position, { width: 80, height: 80 });
    this.currentColor = GameColor.RED;
    this.state = DragonState.IDLE;
    this.eventBus = EventBus.getInstance();

    // Create dragon visual
    this.colorSprite = new PIXI.Graphics();
    this.updateColorVisual();
    this.addChild(this.colorSprite);
  }

  private updateColorVisual(): void {
    this.colorSprite.clear();

    // Draw dragon body (circle for now)
    const color = parseInt(this.currentColor.replace('#', '0x'));
    this.colorSprite.beginFill(color);
    this.colorSprite.drawCircle(0, 0, 40);
    this.colorSprite.endFill();

    // Draw eyes
    this.colorSprite.beginFill(0xFFFFFF);
    this.colorSprite.drawCircle(-15, -10, 8);
    this.colorSprite.drawCircle(15, -10, 8);
    this.colorSprite.endFill();

    this.colorSprite.beginFill(0x000000);
    this.colorSprite.drawCircle(-15, -10, 4);
    this.colorSprite.drawCircle(15, -10, 4);
    this.colorSprite.endFill();

    // Draw mouth based on state
    this.colorSprite.lineStyle(3, 0x000000);
    if (this.state === DragonState.HAPPY) {
      this.colorSprite.arc(0, 10, 20, 0, Math.PI);
    } else if (this.state === DragonState.SAD) {
      this.colorSprite.arc(0, 25, 20, Math.PI, 0);
    } else if (this.state === DragonState.EATING) {
      this.colorSprite.beginFill(0x000000);
      this.colorSprite.drawCircle(0, 15, 10);
      this.colorSprite.endFill();
    } else {
      this.colorSprite.moveTo(-10, 15);
      this.colorSprite.lineTo(10, 15);
    }
  }

  public update(deltaTime: number): void {
    this.animationTime += deltaTime;

    // Idle animation (subtle bobbing)
    if (this.state === DragonState.IDLE) {
      this.scale.set(
        1 + Math.sin(this.animationTime * 2) * 0.05,
        1 + Math.cos(this.animationTime * 2) * 0.05
      );
    }

    // Move towards target
    if (this.targetPosition && this.state === DragonState.MOVING) {
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        const moveDistance = this.moveSpeed * deltaTime;
        const ratio = Math.min(moveDistance / distance, 1);

        this.position.x += dx * ratio;
        this.position.y += dy * ratio;

        // Lean towards direction
        this.rotation = Math.atan2(dy, dx) * 0.1;
      } else {
        this.targetPosition = null;
        this.setState(DragonState.IDLE);
        this.rotation = 0;
      }
    }
  }

  public eat(color: GameColor): void {
    this.setState(DragonState.EATING);

    // Eating animation
    this.scale.set(1.2, 1.2);

    setTimeout(() => {
      this.transformColor(color);
      this.scale.set(1, 1);
      this.setState(DragonState.HAPPY);

      setTimeout(() => {
        this.setState(DragonState.IDLE);
      }, 1000);
    }, 300);

    this.eventBus.emit('dragon:eat', { color });
  }

  public transformColor(newColor: GameColor): void {
    const oldColor = this.currentColor;
    this.currentColor = newColor;
    this.updateColorVisual();

    // Color transform effect
    const transformEffect = new PIXI.Graphics();
    transformEffect.beginFill(0xFFFFFF);
    transformEffect.drawCircle(0, 0, 50);
    transformEffect.endFill();
    transformEffect.alpha = 0.5;
    this.addChild(transformEffect);

    // Fade out effect
    const fadeOut = setInterval(() => {
      transformEffect.alpha -= 0.05;
      if (transformEffect.alpha <= 0) {
        clearInterval(fadeOut);
        this.removeChild(transformEffect);
      }
    }, 50);

    this.eventBus.emit('dragon:transform', { from: oldColor, to: newColor });
  }

  public moveToPosition(position: Vector2): void {
    this.targetPosition = position;
    this.setState(DragonState.MOVING);
  }

  public setState(state: DragonState): void {
    if (this.state !== state) {
      this.state = state;
      this.updateColorVisual();
    }
  }

  public playAnimation(state: DragonState): void {
    this.setState(state);

    // Temporary state for animation
    if (state === DragonState.HAPPY || state === DragonState.SAD) {
      setTimeout(() => {
        this.setState(DragonState.IDLE);
      }, 1500);
    }
  }

  public getColor(): GameColor {
    return this.currentColor;
  }

  public destroy(): void {
    this.colorSprite.destroy();
    super.destroy();
  }
}