import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneType } from '@/types';
import { EventBus } from '@/core/EventBus';
import { ApiClient } from '@/core/ApiClient';
import { AuthService } from '@/core/AuthService';

export class GameOverScene extends BaseScene {
  private eventBus: EventBus;
  private finalScore: number = 0;
  private highScore: number = 0;
  private scoreText!: PIXI.Text;
  private rankText!: PIXI.Text;
  private retryButton!: PIXI.Container;
  private menuButton!: PIXI.Container;
  private rankingButton!: PIXI.Container;

  constructor(app: PIXI.Application) {
    super(app, SceneType.GAME_OVER);
    this.eventBus = EventBus.getInstance();
  }

  public async init(): Promise<void> {
    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x2C3E50);
    background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    background.endFill();
    this.addChild(background);

    // Game Over title
    const titleText = new PIXI.Text('게임 종료!', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFFFFF,
      align: 'center',
      fontWeight: 'bold',
    });
    titleText.anchor.set(0.5);
    titleText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.2
    );
    this.addChild(titleText);

    // Score display
    this.scoreText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xFFE66D,
      align: 'center',
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.35
    );
    this.addChild(this.scoreText);

    // High score display
    const highScoreText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x95E77E,
      align: 'center',
    });
    highScoreText.anchor.set(0.5);
    highScoreText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.45
    );
    this.addChild(highScoreText);

    // Rank display
    this.rankText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFD700,
      align: 'center',
      fontWeight: 'bold',
    });
    this.rankText.anchor.set(0.5);
    this.rankText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.5
    );
    this.addChild(this.rankText);

    // Create buttons
    this.createButtons();

    // Load high score
    this.highScore = this.getHighScore();
    highScoreText.text = `최고 점수: ${this.highScore}`;
  }

  private createButtons(): void {
    // Retry button
    this.retryButton = this.createButton('다시 하기', 0x4ECDC4);
    this.retryButton.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.6
    );
    this.retryButton.on('pointerup', () => {
      this.eventBus.emit('game:start');
    });
    this.addChild(this.retryButton);

    // Ranking button
    this.rankingButton = this.createButton('랭킹 보기', 0xFFD700);
    this.rankingButton.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.7
    );
    this.rankingButton.on('pointerup', () => {
      this.eventBus.emit('ranking:show', { gameType: 'dragon-feeding' });
    });
    this.addChild(this.rankingButton);

    // Menu button
    this.menuButton = this.createButton('메인 메뉴', 0xFF6B6B);
    this.menuButton.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.8
    );
    this.menuButton.on('pointerup', () => {
      this.eventBus.emit('menu:show');
    });
    this.addChild(this.menuButton);
  }

  private createButton(text: string, color: number): PIXI.Container {
    const button = new PIXI.Container();

    // Button background
    const buttonBg = new PIXI.Graphics();
    buttonBg.beginFill(color);
    buttonBg.drawRoundedRect(-100, -30, 200, 60, 30);
    buttonBg.endFill();
    button.addChild(buttonBg);

    // Button text
    const buttonText = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
    });
    buttonText.anchor.set(0.5);
    button.addChild(buttonText);

    // Make interactive
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Add hover effect
    button.on('pointerover', () => {
      button.scale.set(1.1);
    });

    button.on('pointerout', () => {
      button.scale.set(1);
    });

    button.on('pointerdown', () => {
      button.scale.set(0.95);
    });

    return button;
  }

  public async setScore(score: number): Promise<void> {
    this.finalScore = score;
    this.scoreText.text = `최종 점수: ${this.finalScore}`;

    // Update high score if needed
    if (this.finalScore > this.highScore) {
      this.highScore = this.finalScore;
      this.saveHighScore(this.highScore);
    }

    // Submit ranking
    if (AuthService.getInstance().isLoggedIn()) {
      const rank = await ApiClient.getInstance().submitScore('dragon-feeding', {
        score: this.finalScore
      });
      if (rank !== null) {
        this.rankText.text = `${rank}위 달성!`;
      }
    }
  }

  private getHighScore(): number {
    const stored = localStorage.getItem('dragonFeedingHighScore');
    return stored ? parseInt(stored, 10) : 0;
  }

  private saveHighScore(score: number): void {
    localStorage.setItem('dragonFeedingHighScore', score.toString());
  }

  public update(_deltaTime: number): void {
    // Animate buttons
    if (this.retryButton) {
      this.retryButton.rotation = Math.sin(Date.now() * 0.002) * 0.01;
    }
    if (this.menuButton) {
      this.menuButton.rotation = -Math.sin(Date.now() * 0.002) * 0.01;
    }
  }

  public destroy(): void {
    super.destroy();
  }
}