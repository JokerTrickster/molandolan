import * as PIXI from 'pixi.js';
import { GameLoop } from './GameLoop';
import { SceneManager } from './SceneManager';
import { EventBus } from './EventBus';
import { GameSelectorScene } from '@/scenes/GameSelectorScene';
import { MenuScene } from '@/scenes/MenuScene';
import { GameScene } from '@/scenes/GameScene';
import { GameOverScene } from '@/scenes/GameOverScene';
import { RankingScene } from '@/scenes/RankingScene';
import { ParrotGameScene } from '@/games/parrot-seed/scenes/ParrotGameScene';
import { SceneType, GameConfig } from '@/types';

export class Game {
  private app!: PIXI.Application;
  private gameLoop!: GameLoop;
  private sceneManager!: SceneManager;
  private eventBus: EventBus;
  private config: GameConfig;
  private isInitialized: boolean = false;

  constructor(config?: Partial<GameConfig>) {
    this.config = {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1099bb,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      ...config
    };

    this.eventBus = EventBus.getInstance();
  }

  public async init(container: HTMLElement): Promise<void> {
    if (this.isInitialized) return;

    // Create PIXI application
    this.app = new PIXI.Application({
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.config.backgroundColor,
      antialias: this.config.antialias,
      resolution: this.config.resolution,
      autoDensity: true,
    });

    // Add canvas to container
    container.appendChild(this.app.view as HTMLCanvasElement);

    // Make canvas responsive
    this.setupResponsive();

    // Initialize scene manager
    this.sceneManager = new SceneManager(this.app);

    // Create scenes
    const selectorScene = new GameSelectorScene(this.app);
    const dragonMenuScene = new MenuScene(this.app);
    const dragonGameScene = new GameScene(this.app);
    const dragonGameOverScene = new GameOverScene(this.app);
    const parrotGameScene = new ParrotGameScene(this.app);
    const rankingScene = new RankingScene(this.app);

    // Add scenes to manager
    this.sceneManager.addScene(selectorScene);
    this.sceneManager.addScene(dragonMenuScene);
    this.sceneManager.addScene(dragonGameScene);
    this.sceneManager.addScene(dragonGameOverScene);
    this.sceneManager.addScene(parrotGameScene);
    this.sceneManager.addScene(rankingScene);

    // Setup game loop
    this.gameLoop = new GameLoop(
      (deltaTime) => this.update(deltaTime),
      () => this.render()
    );

    // Setup event listeners
    this.setupEventListeners();

    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }

    // Start with game selector
    await this.sceneManager.switchTo(SceneType.SELECTOR);

    this.isInitialized = true;
  }

  private setupResponsive(): void {
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.app.renderer.resize(width, height);
      this.config.width = width;
      this.config.height = height;
    };

    window.addEventListener('resize', resize);
    resize();
  }

  private setupEventListeners(): void {
    // Game selection
    this.eventBus.on('game:select', async (data) => {
      if (data.type === 'dragon-feeding') {
        await this.sceneManager.switchTo(SceneType.MENU);
      } else if (data.type === 'parrot-seed') {
        await this.sceneManager.switchTo(SceneType.PARROT_GAME);
      }
    });

    // Scene transitions for dragon game
    this.eventBus.on('game:start', async () => {
      await this.sceneManager.switchTo(SceneType.GAME);
    });

    this.eventBus.on('game:over', async (data) => {
      await this.sceneManager.switchTo(SceneType.GAME_OVER);
      const gameOverScene = this.sceneManager.getCurrentScene() as GameOverScene;
      if (gameOverScene && data) {
        gameOverScene.setScore(data.score);
      }
    });

    this.eventBus.on('menu:show', async () => {
      await this.sceneManager.switchTo(SceneType.SELECTOR);
    });

    this.eventBus.on('ranking:show', async (data) => {
      await this.sceneManager.switchTo(SceneType.RANKING);
      const scene = this.sceneManager.getCurrentScene() as RankingScene;
      if (scene && data?.gameType) {
        scene.setGameType(data.gameType);
      }
    });

    // Game controls
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
    // Update current scene
    this.sceneManager.update(deltaTime);
  }

  private render(): void {
    // PIXI automatically renders via RAF
  }

  public destroy(): void {
    this.gameLoop.stop();
    this.sceneManager.destroy();
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    this.eventBus.clear();
  }
}