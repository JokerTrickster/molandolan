import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject';
import { Vector2, GameColor } from '@/types';
import { EventBus } from '@/core/EventBus';

export class Parrot extends GameObject {
  public color: GameColor;
  public requestedFood: GameColor | null = null;
  public requestTimer: number = 0;
  public satisfied: boolean = false;
  private speechBubble: PIXI.Container;
  private requestBubble: PIXI.Graphics;
  private requestColorIndicator: PIXI.Graphics;
  private eventBus: EventBus;
  private requestInterval: number = 5; // seconds
  private animationTime: number = 0;

  constructor(id: string, position: Vector2, color: GameColor) {
    super(id, position, { width: 60, height: 60 });
    this.color = color;
    this.eventBus = EventBus.getInstance();

    // Create parrot visual
    this.createVisual();

    // Create speech bubble
    this.speechBubble = new PIXI.Container();
    this.requestBubble = new PIXI.Graphics();
    this.requestColorIndicator = new PIXI.Graphics();
    this.speechBubble.addChild(this.requestBubble);
    this.speechBubble.addChild(this.requestColorIndicator);
    this.speechBubble.visible = false;
    this.speechBubble.position.set(0, -50);
    this.addChild(this.speechBubble);
  }

  private createVisual(): void {
    const body = new PIXI.Graphics();

    // Draw parrot body
    const color = parseInt(this.color.replace('#', '0x'));
    body.beginFill(color);
    body.drawEllipse(0, 0, 25, 30);
    body.endFill();

    // Draw wings
    body.beginFill(color);
    body.drawEllipse(-20, 0, 15, 20);
    body.drawEllipse(20, 0, 15, 20);
    body.endFill();

    // Draw beak
    body.beginFill(0xFFA500);
    body.moveTo(0, 0);
    body.lineTo(-8, 5);
    body.lineTo(0, 10);
    body.lineTo(8, 5);
    body.closePath();
    body.endFill();

    // Draw eyes
    body.beginFill(0xFFFFFF);
    body.drawCircle(-8, -5, 6);
    body.drawCircle(8, -5, 6);
    body.endFill();

    body.beginFill(0x000000);
    body.drawCircle(-8, -5, 3);
    body.drawCircle(8, -5, 3);
    body.endFill();

    this.addChild(body);
  }

  public update(deltaTime: number): void {
    this.animationTime += deltaTime;
    this.requestTimer += deltaTime;

    // Idle animation (flapping wings)
    this.scale.x = 1 + Math.sin(this.animationTime * 4) * 0.05;

    // Request new food periodically
    if (!this.satisfied && this.requestTimer >= this.requestInterval) {
      this.requestNewFood();
    }

    // Update speech bubble
    if (this.requestedFood && !this.satisfied) {
      this.speechBubble.scale.set(
        1 + Math.sin(this.animationTime * 3) * 0.05
      );
    }
  }

  public requestNewFood(): void {
    // Select a random color different from the parrot's own color
    const availableColors = Object.values(GameColor).filter(
      c => c !== this.color
    );
    const randomColor = availableColors[
      Math.floor(Math.random() * availableColors.length)
    ];

    this.requestedFood = randomColor;
    this.requestTimer = 0;
    this.satisfied = false;

    this.updateSpeechBubble();
    this.speechBubble.visible = true;

    this.eventBus.emit('parrot:request', {
      parrotId: this.id,
      requestedColor: randomColor
    });
  }

  private updateSpeechBubble(): void {
    this.requestBubble.clear();

    // Draw speech bubble
    this.requestBubble.beginFill(0xFFFFFF);
    this.requestBubble.lineStyle(2, 0x000000);
    this.requestBubble.drawRoundedRect(-25, -20, 50, 40, 10);
    this.requestBubble.endFill();

    // Draw bubble tail
    this.requestBubble.beginFill(0xFFFFFF);
    this.requestBubble.moveTo(0, 20);
    this.requestBubble.lineTo(-5, 30);
    this.requestBubble.lineTo(5, 30);
    this.requestBubble.closePath();
    this.requestBubble.endFill();

    // Draw requested color indicator
    if (this.requestedFood) {
      this.requestColorIndicator.clear();
      const color = parseInt(this.requestedFood.replace('#', '0x'));
      this.requestColorIndicator.beginFill(color);
      this.requestColorIndicator.drawCircle(0, 0, 12);
      this.requestColorIndicator.endFill();
    }
  }

  public checkMatch(foodColor: GameColor): boolean {
    if (!this.requestedFood || this.satisfied) {
      return false;
    }

    const matches = foodColor === this.requestedFood;

    if (matches) {
      this.showSatisfaction();
      return true;
    }

    return false;
  }

  public showSatisfaction(): void {
    this.satisfied = true;
    this.speechBubble.visible = false;

    // Happy animation
    const hearts = new PIXI.Graphics();
    hearts.beginFill(0xFF69B4);
    hearts.moveTo(0, -5);
    hearts.bezierCurveTo(-5, -10, -10, -5, -10, 0);
    hearts.bezierCurveTo(-10, 5, 0, 10, 0, 10);
    hearts.bezierCurveTo(0, 10, 10, 5, 10, 0);
    hearts.bezierCurveTo(10, -5, 5, -10, 0, -5);
    hearts.endFill();
    hearts.position.set(0, -40);
    hearts.alpha = 1;
    this.addChild(hearts);

    // Animate hearts floating up
    let floatTime = 0;
    const floatAnimation = setInterval(() => {
      floatTime += 0.05;
      hearts.position.y -= 2;
      hearts.alpha -= 0.03;
      hearts.scale.set(1 + floatTime);

      if (hearts.alpha <= 0) {
        clearInterval(floatAnimation);
        this.removeChild(hearts);
      }
    }, 50);

    this.eventBus.emit('parrot:satisfied', {
      parrotId: this.id,
      color: this.requestedFood
    });

    // Request new food after a delay
    setTimeout(() => {
      this.requestNewFood();
    }, 3000);
  }

  public reset(): void {
    this.satisfied = false;
    this.requestedFood = null;
    this.requestTimer = 0;
    this.speechBubble.visible = false;
  }

  public destroy(): void {
    this.speechBubble.destroy();
    super.destroy();
  }
}