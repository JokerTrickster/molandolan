import * as PIXI from 'pixi.js';
import { interpret } from 'xstate';
import gsap from 'gsap';
import { BaseScene } from '@/scenes/BaseScene';
import { SceneType } from '@/types';
import { EventBus } from '@/core/EventBus';
import { ApiClient } from '@/core/ApiClient';
import { AuthService } from '@/core/AuthService';
import { Parrot } from '../entities/Parrot';
import { ShuffleEngine } from '../core/ShuffleEngine';
import { gameStateMachine } from '../core/GameStateMachine';
import { GamePhase, DifficultyLevel, ParrotData } from '../types';
import { RoundManager } from '../core/RoundManager';

export class ParrotGameScene extends BaseScene {
  private parrots: Parrot[] = [];
  private shuffleEngine: ShuffleEngine;
  private stateMachine: any;
  private gameContainer!: PIXI.Container;
  private uiContainer!: PIXI.Container;
  private scoreText!: PIXI.Text;
  private livesText!: PIXI.Text;
  private roundText!: PIXI.Text;
  private timerText!: PIXI.Text;
  private messageText!: PIXI.Text;
  private seed!: PIXI.Graphics;
  private countdownTimer: number = 0;
  private shuffleTimer: number = 0;

  constructor(app: PIXI.Application) {
    super(app, SceneType.PARROT_GAME);
    this.shuffleEngine = new ShuffleEngine(DifficultyLevel.NORMAL);
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

    // Create parrots
    this.createParrots();

    // Create UI
    this.createUI();

    // Create seed
    this.createSeed();

    // Setup state machine
    this.setupStateMachine();
  }

  private createParrots(): void {
    // Start with max parrots (5) but only show what's needed per round
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E77E', '#A78BFA'];
    const maxParrots = 5;
    const y = this.app.screen.height / 2;

    for (let i = 0; i < maxParrots; i++) {
      const data: ParrotData = {
        id: i,
        position: { x: 0, y }, // Will be set in updateParrotPositions
        originalPosition: { x: 0, y },
        color: colors[i],
        number: i + 1,
        hasEatenSeed: false,
        isMoving: false
      };

      const parrot = new Parrot(data);
      parrot.setInteractive(false);
      parrot.on('pointerdown', () => this.onParrotClick(i));
      parrot.visible = false; // Start hidden

      this.parrots.push(parrot);
      this.gameContainer.addChild(parrot);
    }
  }

  private updateParrotPositions(count: number): void {
    const spacing = 140;
    const startX = (this.app.screen.width - ((count - 1) * spacing)) / 2;
    const y = this.app.screen.height / 2;

    // Update positions and visibility
    for (let i = 0; i < this.parrots.length; i++) {
      if (i < count) {
        const newX = startX + i * spacing;
        this.parrots[i].data.position = { x: newX, y };
        this.parrots[i].data.originalPosition = { x: newX, y };
        this.parrots[i].position.set(newX, y);
        this.parrots[i].visible = true;
        this.parrots[i].alpha = 1;
      } else {
        this.parrots[i].visible = false;
      }
    }
  }

  private createUI(): void {
    // Score
    this.scoreText = new PIXI.Text('점수: 0', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 4
    });
    this.scoreText.position.set(20, 20);
    this.uiContainer.addChild(this.scoreText);

    // Lives
    this.livesText = new PIXI.Text('❤️❤️❤️', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFFFFF
    });
    this.livesText.position.set(20, 60);
    this.uiContainer.addChild(this.livesText);

    // Round
    this.roundText = new PIXI.Text('라운드: 1', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 4
    });
    this.roundText.anchor.set(1, 0);
    this.roundText.position.set(this.app.screen.width - 20, 20);
    this.uiContainer.addChild(this.roundText);

    // Timer
    this.timerText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFD700,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 5
    });
    this.timerText.anchor.set(0.5);
    this.timerText.position.set(this.app.screen.width / 2, 80);
    this.uiContainer.addChild(this.timerText);

    // Message
    this.messageText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 4
    });
    this.messageText.anchor.set(0.5);
    this.messageText.position.set(this.app.screen.width / 2, 150);
    this.uiContainer.addChild(this.messageText);
  }

  private createSeed(): void {
    this.seed = new PIXI.Graphics();
    this.seed.beginFill(0xFFD700);
    this.seed.drawEllipse(0, 0, 15, 20);
    this.seed.endFill();
    this.seed.beginFill(0x8B4513);
    this.seed.drawEllipse(0, 0, 10, 12);
    this.seed.endFill();
    this.seed.visible = false;
    this.gameContainer.addChild(this.seed);
  }

  private setupStateMachine(): void {
    this.stateMachine = interpret(gameStateMachine);

    this.stateMachine.onTransition((state: any) => {
      const phase = state.value as GamePhase;
      this.handlePhaseChange(phase);
    });

    this.stateMachine.start();
    this.stateMachine.send('START');
    this.stateMachine.send('PLAY');
  }

  private async handlePhaseChange(phase: GamePhase): Promise<void> {
    const context = this.stateMachine.state.context;

    switch (phase) {
      case GamePhase.READY:
        // Update parrot positions for current round
        this.updateParrotPositions(context.parrotCount);

        // Update shuffle engine with round config
        if (context.roundConfig) {
          this.shuffleEngine.setRoundConfig(context.roundConfig);
        }

        // Show round info
        const roundTitle = RoundManager.getRoundTitle(context.round);
        const roundDesc = RoundManager.getDifficultyDescription(context.round);
        this.showMessage(`${roundTitle}\n${roundDesc}`);

        this.resetParrots();
        this.countdownTimer = 3;
        break;

      case GamePhase.FEEDING:
        this.showMessage('잘 보세요!');
        await this.feedParrot();
        break;

      case GamePhase.SHUFFLING:
        this.showMessage('');
        this.shuffleTimer = context.roundConfig?.shuffleDuration || 15;
        await this.startShuffle();
        break;

      case GamePhase.SELECTING:
        this.showMessage('어느 앵무새가 먹었나요?');
        this.enableSelection();
        break;

      case GamePhase.RESULT:
        await this.showResult();
        break;

      case GamePhase.GAME_OVER:
        this.showGameOver();
        break;
    }

    this.updateUI();
  }

  private async feedParrot(): Promise<void> {
    const context = this.stateMachine.state.context;
    const selectedParrot = this.parrots[context.correctParrotId];

    // Show seed
    this.seed.visible = true;
    this.seed.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2 - 200
    );

    // Animate seed to parrot
    await new Promise(resolve => {
      gsap.to(this.seed.position, {
        x: selectedParrot.position.x,
        y: selectedParrot.position.y - 30,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: resolve
      });
    });

    // Parrot eats seed
    this.seed.visible = false;
    await selectedParrot.eat();
  }

  private async startShuffle(): Promise<void> {
    const context = this.stateMachine.state.context;
    const visibleParrots = this.parrots.slice(0, context.parrotCount);
    await this.shuffleEngine.executeShuffle(visibleParrots);
    this.stateMachine.send('SHUFFLE_COMPLETE');
  }

  private enableSelection(): void {
    this.parrots.forEach(parrot => {
      parrot.setInteractive(true);
      parrot.alpha = 1;
    });
  }

  private onParrotClick(parrotId: number): void {
    const state = this.stateMachine.state;
    if (state.value === GamePhase.SELECTING) {
      this.parrots.forEach(p => p.setInteractive(false));
      this.parrots[parrotId].showHighlight(true);
      this.stateMachine.send({ type: 'SELECT_PARROT', parrotId });
    }
  }

  private async showResult(): Promise<void> {
    const context = this.stateMachine.state.context;
    const isCorrect = context.selectedParrotId === context.correctParrotId;

    // Highlight correct parrot
    this.parrots[context.correctParrotId].showHighlight(true);

    if (isCorrect) {
      this.showMessage('정답입니다! 🎉');
      // Success animation
      gsap.to(this.parrots[context.correctParrotId].scale, {
        x: 1.2,
        y: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    } else {
      this.showMessage('틀렸습니다! 😢');
      // Wrong animation
      if (context.selectedParrotId !== null) {
        gsap.to(this.parrots[context.selectedParrotId], {
          x: "+=10",
          duration: 0.1,
          repeat: 5,
          yoyo: true
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reset highlights
    this.parrots.forEach(p => p.showHighlight(false));

    this.stateMachine.send('NEXT_ROUND');
  }

  private async showGameOver(): Promise<void> {
    const context = this.stateMachine.state.context;
    const eventBus = EventBus.getInstance();
    const buttonsContainer = new PIXI.Container();
    buttonsContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2 + 80);

    if (context.isCleared) {
      const seconds = (context.clearTimeMs / 1000).toFixed(1);
      this.showMessage(`클리어!\n${seconds}초`);

      if (AuthService.getInstance().isLoggedIn()) {
        const rank = await ApiClient.getInstance().submitScore('parrot-seed', {
          clearTimeMs: context.clearTimeMs
        });
        if (rank !== null) {
          this.showMessage(`클리어!\n${seconds}초\n${rank}위 달성!`);
        }
      }
    } else {
      this.showMessage(`게임 오버!\n최종 점수: ${context.score}`);
    }

    const restartBtn = this.createButton('다시 하기', 0x4ECDC4);
    restartBtn.position.set(0, 0);
    restartBtn.on('pointerdown', () => {
      this.stateMachine.send('RESTART');
      buttonsContainer.destroy();
    });
    buttonsContainer.addChild(restartBtn);

    const rankingBtn = this.createButton('랭킹 보기', 0xFFD700);
    rankingBtn.position.set(0, 70);
    rankingBtn.on('pointerdown', () => {
      eventBus.emit('ranking:show', { gameType: 'parrot-seed' });
    });
    buttonsContainer.addChild(rankingBtn);

    const homeBtn = this.createButton('메인으로', 0xFF6B6B);
    homeBtn.position.set(0, 140);
    homeBtn.on('pointerdown', () => {
      eventBus.emit('menu:show');
    });
    buttonsContainer.addChild(homeBtn);

    this.uiContainer.addChild(buttonsContainer);
  }

  private createButton(label: string, color: number): PIXI.Container {
    const container = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(-80, -25, 160, 50, 16);
    bg.endFill();
    container.addChild(bg);

    const text = new PIXI.Text(label, {
      fontFamily: 'Arial',
      fontSize: 22,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    container.addChild(text);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    return container;
  }

  private resetParrots(): void {
    this.parrots.forEach(parrot => {
      parrot.reset();
      parrot.setInteractive(false);
    });
  }

  private showMessage(text: string): void {
    this.messageText.text = text;
  }

  private updateUI(): void {
    const context = this.stateMachine.state.context;
    this.scoreText.text = `점수: ${context.score}`;
    this.roundText.text = `라운드: ${context.round}`;

    // Update lives display
    let heartsText = '';
    for (let i = 0; i < context.lives; i++) {
      heartsText += '❤️';
    }
    this.livesText.text = heartsText;
  }

  public update(deltaTime: number): void {
    const state = this.stateMachine.state;

    // Update countdown timer
    if (state.value === GamePhase.READY && this.countdownTimer > 0) {
      this.timerText.text = Math.ceil(this.countdownTimer).toString();
      this.countdownTimer -= deltaTime;
    } else if (state.value === GamePhase.SHUFFLING && this.shuffleTimer > 0) {
      this.timerText.text = `${Math.ceil(this.shuffleTimer)}초`;
      this.shuffleTimer -= deltaTime;
      this.stateMachine.send({ type: 'UPDATE_TIME', time: this.shuffleTimer });
    } else {
      this.timerText.text = '';
    }
  }

  public destroy(): void {
    this.shuffleEngine.stop();
    if (this.stateMachine) {
      this.stateMachine.stop();
    }
    this.parrots.forEach(p => p.destroy());
    super.destroy();
  }
}