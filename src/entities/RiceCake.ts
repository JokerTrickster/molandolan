import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject';
import { Vector2, GameColor } from '@/types';

export class RiceCake extends GameObject {
  public color: GameColor;
  private speed: number;
  private rotationSpeed: number;
  private lifetime: number = 10; // seconds before disappearing
  private age: number = 0;
  private colorGraphics!: PIXI.Graphics;

  constructor(id: string, position: Vector2, color: GameColor, speed: number = 50) {
    super(id, position, { width: 40, height: 40 });
    this.color = color;
    this.speed = speed;
    this.rotationSpeed = (Math.random() - 0.5) * 2;

    this.createVisual();
  }

  private createVisual(): void {
    this.colorGraphics = new PIXI.Graphics();
    this.updateVisual();
    this.addChild(this.colorGraphics);
  }

  private updateVisual(): void {
    this.colorGraphics.clear();

    // Draw rice cake (떡) shape
    const color = parseInt(this.color.replace('#', '0x'));

    // Main body
    this.colorGraphics.beginFill(color);
    this.colorGraphics.drawRoundedRect(-15, -15, 30, 30, 8);
    this.colorGraphics.endFill();

    // Add some texture/pattern
    this.colorGraphics.beginFill(color, 0.8);
    this.colorGraphics.drawCircle(-5, -5, 4);
    this.colorGraphics.drawCircle(5, 5, 4);
    this.colorGraphics.endFill();

    // Add shine effect
    this.colorGraphics.beginFill(0xFFFFFF, 0.3);
    this.colorGraphics.drawEllipse(-5, -8, 8, 4);
    this.colorGraphics.endFill();
  }

  public update(deltaTime: number): void {
    this.age += deltaTime;

    // Fall down
    this.position.y += this.speed * deltaTime;

    // Rotate
    this.rotation += this.rotationSpeed * deltaTime;

    // Fade out when getting old
    if (this.age > this.lifetime - 2) {
      this.alpha = Math.max(0, (this.lifetime - this.age) / 2);
    }

    // Gentle floating animation
    this.position.x += Math.sin(this.age * 2) * 0.5;
  }

  public isExpired(): boolean {
    return this.age >= this.lifetime;
  }

  public isOutOfBounds(screenHeight: number): boolean {
    return this.position.y > screenHeight + this.size.height;
  }

  public collect(): void {
    // Collection animation
    this.scale.set(1.5, 1.5);
    this.alpha = 0.5;

    // Particle effect could be added here
    const particles = new PIXI.Graphics();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const distance = 20;
      particles.beginFill(parseInt(this.color.replace('#', '0x')));
      particles.drawCircle(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        3
      );
      particles.endFill();
    }
    particles.alpha = 0.8;
    this.parent?.addChild(particles);
    particles.position.copyFrom(this.position);

    // Animate particles
    let particleTime = 0;
    const particleAnimation = setInterval(() => {
      particleTime += 0.05;
      particles.scale.set(1 + particleTime * 2);
      particles.alpha -= 0.05;

      if (particles.alpha <= 0) {
        clearInterval(particleAnimation);
        particles.parent?.removeChild(particles);
        particles.destroy();
      }
    }, 50);
  }

  public getColor(): GameColor {
    return this.color;
  }

  public destroy(): void {
    this.colorGraphics.destroy();
    super.destroy();
  }
}