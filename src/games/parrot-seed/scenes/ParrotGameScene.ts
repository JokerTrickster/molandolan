import * as PIXI from 'pixi.js';
import { interpret } from 'xstate';
import gsap from 'gsap';
import { BaseScene } from '~/scenes/BaseScene';
import { SceneType } from '~/types';
import { EventBus } from '~/core/EventBus';
import { ApiClient } from '~/core/ApiClient';
import { AuthService } from '~/core/AuthService';
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
  private countdownActive: boolean = false;
  private buttonsContainer: PIXI.Container | null = null;

  constructor(app: PIXI.Application) {
    super(app, SceneType.PARROT_GAME);
    this.shuffleEngine = new ShuffleEngine(DifficultyLevel.NORMAL);
  }

  public async init(): Promise<void> {
    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    this.addChild(this.gameContainer);
    this.addChild(this.uiContainer);

    const background = new PIXI.Graphics();
    background.beginFill(0x87CEEB);
    background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    background.endFill();
    this.gameContainer.addChild(background);

    this.createParrots();
    this.createUI();
    this.createSeed();
    this.setupStateMachine();
  }

  private createParrots(): void {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E77E', '#A78BFA'];
    const y = this.app.screen.height / 2;

    for (let i = 0; i < 5; i++) {
      const data: ParrotData = {
        id: i,
        position: { x: 0, y },
        originalPosition: { x: 0, y },
        color: colors[i],
        number: i + 1,
        hasEatenSeed: false,
        isMoving: false
      };

      const parrot = new Parrot(data);
      parrot.setInteractive(false);
      parrot.on('pointerdown', () => this.onParrotClick(i));
      parrot.visible = false;

      this.parrots.push(parrot);
      this.gameContainer.addChild(parrot);
    }
  }

  private updateParrotPositions(count: number): void {
    const w = this.app.screen.width;
    const padding = 50;
    const maxSpacing = 140;
    const spacing = count > 1 ? Math.min(maxSpacing, (w - padding * 2) / (count - 1)) : 0;
    const totalWidth = (count - 1) * spacing;
    const startX = (w - totalWidth) / 2;
    const y = this.app.screen.height * 0.5;
    const scaleFactor = Math.min(1, w / 420);

    for (let i = 0; i < this.parrots.length; i++) {
      if (i < count) {
        const newX = startX + i * spacing;
        this.parrots[i].data.position = { x: newX, y };
        this.parrots[i].data.originalPosition = { x: newX, y };
        this.parrots[i].position.set(newX, y);
        this.parrots[i].scale.set(scaleFactor);
        this.parrots[i].visible = true;
        this.parrots[i].alpha = 1;
        this.parrots[i].showNumber(true);
      } else {
        this.parrots[i].visible = false;
      }
    }
  }

  private createUI(): void {
    const w = this.app.screen.width;
    const s = Math.min(1, w / 400);
    const baseFontSize = Math.round(24 * s);
    const timerFontSize = Math.round(48 * s);
    const msgFontSize = Math.round(28 * s);
    const pad = Math.round(16 * s);

    this.scoreText = new PIXI.Text('점수: 0', {
      fontFamily: 'Arial', fontSize: baseFontSize, fill: 0xFFFFFF,
      fontWeight: 'bold', stroke: 0x000000, strokeThickness: 3
    });
    this.scoreText.position.set(pad, pad);
    this.uiContainer.addChild(this.scoreText);

    this.livesText = new PIXI.Text('❤️❤️❤️', {
      fontFamily: 'Arial', fontSize: baseFontSize, fill: 0xFFFFFF
    });
    this.livesText.position.set(pad, pad + baseFontSize + 8);
    this.uiContainer.addChild(this.livesText);

    this.roundText = new PIXI.Text('라운드: 1', {
      fontFamily: 'Arial', fontSize: baseFontSize, fill: 0xFFFFFF,
      fontWeight: 'bold', stroke: 0x000000, strokeThickness: 3
    });
    this.roundText.anchor.set(1, 0);
    this.roundText.position.set(w - pad, pad);
    this.uiContainer.addChild(this.roundText);

    this.timerText = new PIXI.Text('', {
      fontFamily: 'Arial', fontSize: timerFontSize, fill: 0xFFD700,
      fontWeight: 'bold', stroke: 0x000000, strokeThickness: 5
    });
    this.timerText.anchor.set(0.5);
    this.timerText.position.set(w / 2, Math.round(75 * s));
    this.uiContainer.addChild(this.timerText);

    this.messageText = new PIXI.Text('', {
      fontFamily: 'Arial', fontSize: msgFontSize, fill: 0xFFFFFF,
      fontWeight: 'bold', stroke: 0x000000, strokeThickness: 3,
      wordWrap: true, wordWrapWidth: w - pad * 4, align: 'center'
    });
    this.messageText.anchor.set(0.5);
    this.messageText.position.set(w / 2, Math.round(135 * s));
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
        if (this.buttonsContainer) {
          this.buttonsContainer.destroy({ children: true });
          this.buttonsContainer = null;
        }
        this.updateParrotPositions(context.parrotCount);
        this.shuffleEngine.setCanvasHeight(this.app.screen.height);
        if (context.roundConfig) {
          this.shuffleEngine.setRoundConfig(context.roundConfig);
        }

        const roundTitle = RoundManager.getRoundTitle(context.round);
        const roundDesc = RoundManager.getDifficultyDescription(context.round);
        this.showMessage(`${roundTitle}\n${roundDesc}`);
        this.resetParrots();
        this.updateUI();
        this.startCountdown(3);
        break;

      case GamePhase.FEEDING:
        this.timerText.text = '';
        this.showMessage('잘 보세요! 🌻');
        this.updateUI();
        await this.feedParrot();
        await this.wait(0.5);
        this.stateMachine.send('FEEDING_DONE');
        break;

      case GamePhase.SHUFFLING:
        this.showMessage('잘 따라가세요!');
        this.parrots.forEach(p => p.showNumber(false));
        this.updateUI();
        await this.wait(0.5);
        await this.startShuffle();
        break;

      case GamePhase.SELECTING:
        this.showMessage('어느 앵무새가 먹었나요?');
        this.enableSelection();
        this.updateUI();
        break;

      case GamePhase.RESULT:
        await this.showResult();
        break;

      case GamePhase.GAME_OVER:
        this.showGameOver();
        break;
    }
  }

  private startCountdown(seconds: number): void {
    this.countdownTimer = seconds;
    this.countdownActive = true;
  }

  private async feedParrot(): Promise<void> {
    const context = this.stateMachine.state.context;
    const targetParrot = this.parrots[context.correctParrotId];

    targetParrot.showHighlight(true);

    this.seed.visible = true;
    this.seed.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.2
    );

    await new Promise<void>(resolve => {
      gsap.to(this.seed.position, {
        x: targetParrot.position.x,
        y: targetParrot.position.y - 30,
        duration: 1.0,
        ease: "power2.inOut",
        onComplete: resolve
      });
    });

    this.seed.visible = false;
    await targetParrot.eat();
    targetParrot.showHighlight(false);
  }

  private async startShuffle(): Promise<void> {
    const context = this.stateMachine.state.context;
    const visibleParrots = this.parrots.slice(0, context.parrotCount);
    await this.shuffleEngine.executeShuffle(visibleParrots);
    this.stateMachine.send('SHUFFLE_COMPLETE');
  }

  private enableSelection(): void {
    const context = this.stateMachine.state.context;
    for (let i = 0; i < this.parrots.length; i++) {
      if (i < context.parrotCount) {
        this.parrots[i].setInteractive(true);
        this.parrots[i].alpha = 1;
      }
    }
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

    this.parrots.forEach(p => p.showNumber(true));
    this.parrots[context.correctParrotId].showHighlight(true);

    if (isCorrect) {
      this.showMessage('정답입니다! 🎉');
      gsap.to(this.parrots[context.correctParrotId].scale, {
        x: 1.3, y: 1.3, duration: 0.3, yoyo: true, repeat: 1
      });
    } else {
      this.showMessage('틀렸습니다! 😢');
      if (context.selectedParrotId !== null) {
        gsap.to(this.parrots[context.selectedParrotId], {
          x: "+=10", duration: 0.1, repeat: 5, yoyo: true
        });
      }
    }

    this.updateUI();
    await this.wait(2);

    this.parrots.forEach(p => p.showHighlight(false));
    this.stateMachine.send('NEXT_ROUND');
  }

  private async showGameOver(): Promise<void> {
    const context = this.stateMachine.state.context;
    const eventBus = EventBus.getInstance();
    const w = this.app.screen.width;
    const s = Math.min(1, w / 400);

    this.buttonsContainer = new PIXI.Container();
    this.buttonsContainer.position.set(w / 2, this.app.screen.height / 2 + 80);

    if (context.isCleared) {
      const seconds = (context.clearTimeMs / 1000).toFixed(1);
      this.showMessage(`🎉 클리어!\n${seconds}초`);

      if (AuthService.getInstance().isLoggedIn()) {
        const rank = await ApiClient.getInstance().submitScore('parrot-seed', {
          clearTimeMs: context.clearTimeMs
        });
        if (rank !== null) {
          this.showMessage(`🎉 클리어!\n${seconds}초\n${rank}위 달성!`);
        }
      }
    } else {
      this.showMessage(`게임 오버!\n최종 점수: ${context.score}`);
    }

    const gap = Math.round(60 * s);
    const restartBtn = this.createButton('다시 하기', 0x4ECDC4);
    restartBtn.position.set(0, 0);
    restartBtn.on('pointerdown', () => {
      this.stateMachine.send('RESTART');
    });
    this.buttonsContainer.addChild(restartBtn);

    const rankingBtn = this.createButton('랭킹 보기', 0xFFD700);
    rankingBtn.position.set(0, gap);
    rankingBtn.on('pointerdown', () => {
      eventBus.emit('ranking:show', { gameType: 'parrot-seed' });
    });
    this.buttonsContainer.addChild(rankingBtn);

    const homeBtn = this.createButton('메인으로', 0xFF6B6B);
    homeBtn.position.set(0, gap * 2);
    homeBtn.on('pointerdown', () => {
      eventBus.emit('menu:show');
    });
    this.buttonsContainer.addChild(homeBtn);

    this.uiContainer.addChild(this.buttonsContainer);
    this.updateUI();
  }

  private createButton(label: string, color: number): PIXI.Container {
    const w = this.app.screen.width;
    const s = Math.min(1, w / 400);
    const btnW = Math.round(150 * s);
    const btnH = Math.round(44 * s);
    const container = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    bg.endFill();
    container.addChild(bg);

    const text = new PIXI.Text(label, {
      fontFamily: 'Arial', fontSize: Math.round(20 * s),
      fill: 0xFFFFFF, fontWeight: 'bold'
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
    let hearts = '';
    for (let i = 0; i < context.lives; i++) hearts += '❤️';
    this.livesText.text = hearts;
  }

  public update(deltaTime: number): void {
    if (this.countdownActive && this.countdownTimer > 0) {
      this.timerText.text = Math.ceil(this.countdownTimer).toString();
      this.countdownTimer -= deltaTime;
      if (this.countdownTimer <= 0) {
        this.countdownActive = false;
        this.timerText.text = '';
        this.stateMachine.send('COUNTDOWN_DONE');
      }
    }
  }

  private wait(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
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
