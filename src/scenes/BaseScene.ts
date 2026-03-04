import * as PIXI from 'pixi.js';
import { SceneType } from '~/types';

export abstract class BaseScene extends PIXI.Container {
  protected app: PIXI.Application;
  public sceneType: SceneType;
  private _initialized = false;

  constructor(app: PIXI.Application, sceneType: SceneType) {
    super();
    this.app = app;
    this.sceneType = sceneType;
  }

  public get initialized(): boolean {
    return this._initialized;
  }

  public async initOnce(): Promise<void> {
    if (this._initialized) return;
    await this.init();
    this._initialized = true;
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