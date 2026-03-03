import * as PIXI from 'pixi.js';
import { SceneType } from '@/types';

export abstract class BaseScene extends PIXI.Container {
  protected app: PIXI.Application;
  public sceneType: SceneType;

  constructor(app: PIXI.Application, sceneType: SceneType) {
    super();
    this.app = app;
    this.sceneType = sceneType;
  }

  public abstract init(): Promise<void>;
  public abstract update(deltaTime: number): void;
  public destroy(): void {
    super.destroy({ children: true });
  }

  public onEnter(): void {
    // Override in subclasses for scene enter logic
  }

  public onExit(): void {
    // Override in subclasses for scene exit logic
  }
}