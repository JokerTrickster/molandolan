import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneType, GameColor } from '@/types';
import { EventBus } from '@/core/EventBus';
import { Dragon } from '@/entities/Dragon';
import { Parrot } from '@/entities/Parrot';
import { RiceCake } from '@/entities/RiceCake';

export class GameScene extends BaseScene {
  private eventBus: EventBus;
  private dragon!: Dragon;
  private parrots: Parrot[] = [];
  private riceCakes: RiceCake[] = [];
  private score: number = 0;
  private level: number = 1;
  private timeRemaining: number = 60;
  private riceCakeSpawnTimer: number = 0;
  private riceCakeSpawnRate: number = 2; // seconds
  private scoreText!: PIXI.Text;
  private timerText!: PIXI.Text;
  private levelText!: PIXI.Text;
  private gameContainer!: PIXI.Container;
  private uiContainer!: PIXI.Container;

  constructor(app: PIXI.Application) {
    super(app, SceneType.GAME);
    this.eventBus = EventBus.getInstance();
  }

  public async init(): Promise<void> {
    // Create containers
    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    this.addChild(this.gameContainer);
    this.addChild(this.uiContainer);

    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x87CEEB);
    background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    background.endFill();
    this.gameContainer.addChild(background);

    // Create dragon
    this.dragon = new Dragon({
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2
    });
    this.gameContainer.addChild(this.dragon);

    // Create parrots
    this.createParrots();

    // Create UI
    this.createUI();

    // Setup input handling
    this.setupInput();

    // Setup event listeners
    this.setupEventListeners();
  }

  private createParrots(): void {
    const colors = Object.values(GameColor);
    const positions = [
      { x: 100, y: 100 },
      { x: this.app.screen.width - 100, y: 100 },
      { x: 100, y: this.app.screen.height - 150 },
      { x: this.app.screen.width - 100, y: this.app.screen.height - 150 },
      { x: this.app.screen.width / 2, y: 80 }
    ];

    for (let i = 0; i < 5; i++) {
      const parrot = new Parrot(
        `parrot-${i}`,
        positions[i],
        colors[i]
      );
      this.parrots.push(parrot);
      this.gameContainer.addChild(parrot);
    }
  }

  private createUI(): void {
    // Score display
    this.scoreText = new PIXI.Text(`점수: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
    });
    this.scoreText.position.set(20, 20);
    this.uiContainer.addChild(this.scoreText);

    // Timer display
    this.timerText = new PIXI.Text(`시간: ${this.timeRemaining}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
    });
    this.timerText.anchor.set(0.5, 0);
    this.timerText.position.set(this.app.screen.width / 2, 20);
    this.uiContainer.addChild(this.timerText);

    // Level display
    this.levelText = new PIXI.Text(`레벨: ${this.level}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
    });
    this.levelText.anchor.set(1, 0);
    this.levelText.position.set(this.app.screen.width - 20, 20);
    this.uiContainer.addChild(this.levelText);

    // Pause button
    const pauseButton = new PIXI.Graphics();
    pauseButton.beginFill(0x4ECDC4);
    pauseButton.drawCircle(0, 0, 25);
    pauseButton.endFill();
    pauseButton.beginFill(0xFFFFFF);
    pauseButton.drawRect(-8, -12, 6, 24);
    pauseButton.drawRect(2, -12, 6, 24);
    pauseButton.endFill();
    pauseButton.position.set(this.app.screen.width - 40, 80);
    pauseButton.eventMode = 'static';
    pauseButton.cursor = 'pointer';
    pauseButton.on('pointerdown', () => {
      this.eventBus.emit('game:pause');
    });
    this.uiContainer.addChild(pauseButton);
  }

  private setupInput(): void {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      const position = event.global;

      // Check if clicking on a rice cake
      for (const riceCake of this.riceCakes) {
        const bounds = riceCake.getBounds();
        if (bounds.contains(position.x, position.y)) {
          this.collectRiceCake(riceCake);
          return;
        }
      }

      // Otherwise move dragon
      this.dragon.moveToPosition({
        x: position.x,
        y: position.y
      });
    });
  }

  private setupEventListeners(): void {
    this.eventBus.on('parrot:satisfied', () => {
      this.score += 100 * this.level;
      this.updateScore();
    });

    this.eventBus.on('dragon:transform', () => {
      this.checkParrotMatches();
    });
  }

  private collectRiceCake(riceCake: RiceCake): void {
    riceCake.collect();
    this.dragon.eat(riceCake.getColor());

    // Remove rice cake
    const index = this.riceCakes.indexOf(riceCake);
    if (index !== -1) {
      this.riceCakes.splice(index, 1);
      this.gameContainer.removeChild(riceCake);
      riceCake.destroy();
    }
  }

  private checkParrotMatches(): void {
    const dragonColor = this.dragon.getColor();
    for (const parrot of this.parrots) {
      if (parrot.checkMatch(dragonColor)) {
        // Parrot is satisfied!
        this.score += 50;
      }
    }
  }

  private spawnRiceCake(): void {
    const colors = Object.values(GameColor);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomX = Math.random() * (this.app.screen.width - 100) + 50;

    const riceCake = new RiceCake(
      `ricecake-${Date.now()}`,
      { x: randomX, y: -50 },
      randomColor,
      50 + this.level * 10
    );

    this.riceCakes.push(riceCake);
    this.gameContainer.addChild(riceCake);
  }

  public update(deltaTime: number): void {
    // Update game timer
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.eventBus.emit('game:over', { score: this.score });
      return;
    }

    // Update timer display
    this.timerText.text = `시간: ${Math.ceil(this.timeRemaining)}`;

    // Spawn rice cakes
    this.riceCakeSpawnTimer += deltaTime;
    if (this.riceCakeSpawnTimer >= this.riceCakeSpawnRate) {
      this.spawnRiceCake();
      this.riceCakeSpawnTimer = 0;
    }

    // Update dragon
    this.dragon.update(deltaTime);

    // Update parrots
    for (const parrot of this.parrots) {
      parrot.update(deltaTime);
    }

    // Update rice cakes
    for (let i = this.riceCakes.length - 1; i >= 0; i--) {
      const riceCake = this.riceCakes[i];
      riceCake.update(deltaTime);

      // Remove expired or out of bounds rice cakes
      if (riceCake.isExpired() || riceCake.isOutOfBounds(this.app.screen.height)) {
        this.riceCakes.splice(i, 1);
        this.gameContainer.removeChild(riceCake);
        riceCake.destroy();
      }
    }

    // Level progression
    if (this.score >= this.level * 500) {
      this.level++;
      this.levelText.text = `레벨: ${this.level}`;
      this.riceCakeSpawnRate = Math.max(0.5, this.riceCakeSpawnRate - 0.2);
    }
  }

  private updateScore(): void {
    this.scoreText.text = `점수: ${this.score}`;
  }

  public onEnter(): void {
    // Reset game state
    this.score = 0;
    this.level = 1;
    this.timeRemaining = 60;
    this.updateScore();

    // Start parrot requests
    for (const parrot of this.parrots) {
      parrot.requestNewFood();
    }
  }

  public destroy(): void {
    this.dragon.destroy();
    for (const parrot of this.parrots) {
      parrot.destroy();
    }
    for (const riceCake of this.riceCakes) {
      riceCake.destroy();
    }
    this.parrots = [];
    this.riceCakes = [];
    super.destroy();
  }
}