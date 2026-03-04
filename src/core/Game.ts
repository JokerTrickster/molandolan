import * as PIXI from 'pixi.js';
import { GameLoop } from './GameLoop';
import { SceneManager } from './SceneManager';
import { EventBus } from './EventBus';
import { RankingScene } from '~/scenes/RankingScene';
import { ParrotGameScene } from '~/games/parrot-seed/scenes/ParrotGameScene';
import { SceneType, GameConfig } from '~/types';

export class Game {
  private app!: PIXI.Application;
  private gameLoop!: GameLoop;
  private sceneManager!: SceneManager;
  private eventBus: EventBus;
  private config: GameConfig;
  private isInitialized: boolean = false;

  constructor(config?: Partial<GameConfig>) {
    this.config = {
      width: 400,
      height: 600,
      backgroundColor: 0x667EEA,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      ...config
    };

    this.eventBus = EventBus.getInstance();
  }

  public async init(container: HTMLElement): Promise<void> {
    if (this.isInitialized) return;

    const rect = container.getBoundingClientRect();
    this.config.width = rect.width || 400;
    this.config.height = rect.height || 600;

    this.app = new PIXI.Application({
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.config.backgroundColor,
      antialias: this.config.antialias,
      resolution: this.config.resolution,
      autoDensity: true,
    });

    container.appendChild(this.app.view as HTMLCanvasElement);

    this.sceneManager = new SceneManager(this.app);

    const parrotGameScene = new ParrotGameScene(this.app);
    const rankingScene = new RankingScene(this.app);

    this.sceneManager.addScene(parrotGameScene);
    this.sceneManager.addScene(rankingScene);

    this.gameLoop = new GameLoop(
      (deltaTime) => this.update(deltaTime),
      () => this.render()
    );

    this.setupEventListeners();

    await this.sceneManager.switchTo(SceneType.PARROT_GAME);

    this.isInitialized = true;
  }

  private setupEventListeners(): void {
    this.eventBus.on('menu:show', async () => {
      await this.sceneManager.switchTo(SceneType.PARROT_GAME);
    });

    this.eventBus.on('ranking:show', async (data) => {
      await this.sceneManager.switchTo(SceneType.RANKING);
      const scene = this.sceneManager.getCurrentScene() as RankingScene;
      if (scene && data?.gameType) {
        scene.setGameType(data.gameType);
      }
    });

    this.eventBus.on('game:pause', () => {
      this.pause();
    });

    this.eventBus.on('game:resume', () => {
      this.resume();
    });
  }

  public start(): void {
    if (!this.isInitialized) {
      throw new Error('Game must be initialized before starting');
    }
    this.gameLoop.start();
  }

  public pause(): void {
    this.gameLoop.pause();
  }

  public resume(): void {
    this.gameLoop.resume();
  }

  public stop(): void {
    this.gameLoop.stop();
  }

  private update(deltaTime: number): void {
    this.sceneManager.update(deltaTime);
  }

  private render(): void {
    // PIXI automatically renders
  }

  public destroy(): void {
    this.gameLoop.stop();
    this.sceneManager.destroy();
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    this.eventBus.clear();
    this.isInitialized = false;
  }
}
