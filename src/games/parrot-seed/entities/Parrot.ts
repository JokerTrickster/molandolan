import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { Vector2 } from '~/types';
import { ParrotData } from '../types';

export class Parrot extends PIXI.Container {
  public data: ParrotData;
  private body!: PIXI.Graphics;
  private numberText!: PIXI.Text;
  private highlight!: PIXI.Graphics;

  constructor(data: ParrotData) {
    super();
    this.data = data;
    this.position.set(data.position.x, data.position.y);

    this.createVisual();
    this.createHighlight();
    this.createNumber();
  }

  private createVisual(): void {
    this.body = new PIXI.Graphics();

    // Draw parrot body
    const color = parseInt(this.data.color.replace('#', '0x'));
    this.body.beginFill(color);
    this.body.drawEllipse(0, 0, 35, 40);
    this.body.endFill();

    // Draw head
    this.body.beginFill(color);
    this.body.drawCircle(0, -30, 25);
    this.body.endFill();

    // Draw wings
    this.body.beginFill(color, 0.8);
    this.body.drawEllipse(-30, 0, 20, 25);
    this.body.drawEllipse(30, 0, 20, 25);
    this.body.endFill();

    // Draw beak
    this.body.beginFill(0xFFA500);
    this.body.moveTo(0, -25);
    this.body.lineTo(-10, -20);
    this.body.lineTo(0, -15);
    this.body.lineTo(10, -20);
    this.body.closePath();
    this.body.endFill();

    // Draw eyes
    this.body.beginFill(0xFFFFFF);
    this.body.drawCircle(-10, -35, 8);
    this.body.drawCircle(10, -35, 8);
    this.body.endFill();

    this.body.beginFill(0x000000);
    this.body.drawCircle(-10, -35, 4);
    this.body.drawCircle(10, -35, 4);
    this.body.endFill();

    this.addChild(this.body);
  }

  private createHighlight(): void {
    this.highlight = new PIXI.Graphics();
    this.highlight.lineStyle(4, 0xFFD700, 1);
    this.highlight.drawCircle(0, 0, 60);
    this.highlight.alpha = 0;
    this.addChildAt(this.highlight, 0);
  }

  private createNumber(): void {
    this.numberText = new PIXI.Text(this.data.number.toString(), {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 3
    });
    this.numberText.anchor.set(0.5);
    this.numberText.position.set(0, 10);
    this.addChild(this.numberText);
  }

  public async eat(): Promise<void> {
    // Eating animation
    const timeline = gsap.timeline();

    // Open beak
    timeline.to(this.body.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.2,
      ease: "power2.out"
    });

    // Chewing motion
    timeline.to(this.body.scale, {
      keyframes: [
        { x: 1.1, y: 0.9, duration: 0.2 },
        { x: 0.9, y: 1.1, duration: 0.2 },
        { x: 1.1, y: 0.9, duration: 0.2 },
        { x: 1, y: 1, duration: 0.2 }
      ]
    });

    // Happy bounce
    timeline.to(this, {
      y: this.position.y - 20,
      duration: 0.2,
      ease: "power2.out"
    });

    timeline.to(this, {
      y: this.data.position.y,
      duration: 0.2,
      ease: "bounce.out"
    });

    this.data.hasEatenSeed = true;

    return new Promise(resolve => {
      timeline.eventCallback('onComplete', resolve);
    });
  }

  public async moveTo(position: Vector2, duration: number = 1): Promise<void> {
    this.data.isMoving = true;

    return new Promise(resolve => {
      gsap.to(this.position, {
        x: position.x,
        y: position.y,
        duration: duration,
        ease: "power2.inOut",
        onComplete: () => {
          this.data.position = { ...position };
          this.data.isMoving = false;
          resolve();
        }
      });
    });
  }

  public async swapWith(other: Parrot, duration: number = 1): Promise<void> {
    const myPos = { ...this.data.position };
    const otherPos = { ...other.data.position };

    const timeline = gsap.timeline();

    // Move this parrot in an arc
    timeline.to(this.position, {
      x: otherPos.x,
      y: otherPos.y,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const progress = timeline.progress();
        const arcHeight = Math.sin(progress * Math.PI) * 50;
        this.position.y = gsap.utils.interpolate(myPos.y, otherPos.y, progress) - arcHeight;
      }
    }, 0);

    // Move other parrot in opposite arc
    timeline.to(other.position, {
      x: myPos.x,
      y: myPos.y,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const progress = timeline.progress();
        const arcHeight = Math.sin(progress * Math.PI) * 50;
        other.position.y = gsap.utils.interpolate(otherPos.y, myPos.y, progress) + arcHeight;
      }
    }, 0);

    return new Promise(resolve => {
      timeline.eventCallback('onComplete', () => {
        // Update data positions
        this.data.position = otherPos;
        other.data.position = myPos;
        resolve();
      });
    });
  }

  public showHighlight(active: boolean): void {
    gsap.to(this.highlight, {
      alpha: active ? 0.8 : 0,
      duration: 0.3
    });
  }

  public showNumber(visible: boolean): void {
    this.numberText.visible = visible;
  }

  public reset(): void {
    this.position.set(this.data.originalPosition.x, this.data.originalPosition.y);
    this.data.position = { ...this.data.originalPosition };
    this.data.hasEatenSeed = false;
    this.data.isMoving = false;
    this.showHighlight(false);
    this.body.scale.set(1, 1);
  }

  public setInteractive(enabled: boolean): void {
    this.eventMode = enabled ? 'static' : 'none';
    this.cursor = enabled ? 'pointer' : 'auto';
  }

  public destroy(): void {
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.position);
    gsap.killTweensOf(this.highlight);
    super.destroy();
  }
}