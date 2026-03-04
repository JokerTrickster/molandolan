import * as PIXI from 'pixi.js';
import { BaseScene } from '~/scenes/BaseScene';
import { SceneType } from '~/types';

export class SceneManager {
  private app: PIXI.Application;
  private scenes: Map<SceneType, BaseScene>;
  private currentScene: BaseScene | null = null;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.scenes = new Map();
  }

  public addScene(scene: BaseScene): void {
    this.scenes.set(scene.sceneType, scene);
  }

  public async switchTo(sceneType: SceneType): Promise<void> {
    const newScene = this.scenes.get(sceneType);
    if (!newScene) {
      throw new Error(`Scene ${sceneType} not found`);
    }

    // Exit current scene
    if (this.currentScene) {
      this.currentScene.onExit();
      this.app.stage.removeChild(this.currentScene);
    }

    this.currentScene = newScene;
    await this.currentScene.initOnce();
    this.app.stage.addChild(this.currentScene);
    this.currentScene.onEnter();
  }

  public update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  public getCurrentScene(): BaseScene | null {
    return this.currentScene;
  }

  public destroy(): void {
    this.scenes.forEach(scene => scene.destroy());
    this.scenes.clear();
    this.currentScene = null;
  }
}