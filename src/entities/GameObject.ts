import * as PIXI from 'pixi.js';
import { Vector2, Size2D } from '@/types';

export abstract class GameObject extends PIXI.Container {
  public id: string;
  public size: Size2D;
  protected sprite: PIXI.Sprite | null = null;

  constructor(id: string, position: Vector2, size: Size2D) {
    super();
    this.id = id;
    this.position.set(position.x, position.y);
    this.size = size;
  }

  public abstract update(deltaTime: number): void;

  public setSprite(texture: PIXI.Texture): void {
    if (this.sprite) {
      this.removeChild(this.sprite);
    }

    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.width = this.size.width;
    this.sprite.height = this.size.height;
    this.addChild(this.sprite);
  }

  public getPosition(): Vector2 {
    return { x: this.position.x, y: this.position.y };
  }

  public setPosition(position: Vector2): void {
    this.position.set(position.x, position.y);
  }

  public getBounds(): PIXI.Rectangle {
    return new PIXI.Rectangle(
      this.position.x - this.size.width / 2,
      this.position.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );
  }

  public checkCollision(other: GameObject): boolean {
    const bounds1 = this.getBounds();
    const bounds2 = other.getBounds();

    return bounds1.x < bounds2.x + bounds2.width &&
           bounds1.x + bounds1.width > bounds2.x &&
           bounds1.y < bounds2.y + bounds2.height &&
           bounds1.y + bounds1.height > bounds2.y;
  }

  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    super.destroy();
  }
}