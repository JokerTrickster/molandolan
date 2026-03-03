import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneType } from '@/types';
import { EventBus } from '@/core/EventBus';

export class GameSelectorScene extends BaseScene {
  private eventBus: EventBus;

  constructor(app: PIXI.Application) {
    super(app, SceneType.SELECTOR);
    this.eventBus = EventBus.getInstance();
  }

  public async init(): Promise<void> {
    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x2C3E50);
    background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    background.endFill();
    this.addChild(background);

    // Title
    const title = new PIXI.Text('모란도란 게임 월드', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    title.anchor.set(0.5);
    title.position.set(this.app.screen.width / 2, 80);
    this.addChild(title);

    // Subtitle
    const subtitle = new PIXI.Text('플레이할 게임을 선택하세요', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xBDC3C7
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(this.app.screen.width / 2, 140);
    this.addChild(subtitle);

    // Create game cards
    this.createGameCard(
      '떡먹는 용만이',
      '용이 떡을 먹고 색이 변해요!\n앵무새가 원하는 색을 맞춰주세요!',
      0x667EEA,
      this.app.screen.width / 2 - 220,
      this.app.screen.height / 2,
      'dragon-feeding'
    );

    this.createGameCard(
      '해씨먹는 앵무새',
      '해바라기씨를 먹은 앵무새를 찾아요!\n15초간 섞은 후 정답을 맞추세요!',
      0x4ECDC4,
      this.app.screen.width / 2 + 220,
      this.app.screen.height / 2,
      'parrot-seed'
    );

    // Footer
    const footer = new PIXI.Text('🎮 모바일 웹 게임 컬렉션', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x95A5A6
    });
    footer.anchor.set(0.5);
    footer.position.set(this.app.screen.width / 2, this.app.screen.height - 40);
    this.addChild(footer);
  }

  private createGameCard(
    title: string,
    description: string,
    color: number,
    x: number,
    y: number,
    gameType: string
  ): void {
    const card = new PIXI.Container();
    card.position.set(x, y);

    // Card background
    const cardBg = new PIXI.Graphics();
    cardBg.beginFill(color);
    cardBg.drawRoundedRect(-180, -170, 360, 340, 20);
    cardBg.endFill();
    card.addChild(cardBg);

    // Card icon background
    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(0xFFFFFF, 0.2);
    iconBg.drawCircle(0, -50, 50);
    iconBg.endFill();
    card.addChild(iconBg);

    // Game icon (emoji)
    const icon = new PIXI.Text(gameType === 'dragon-feeding' ? '🐉' : '🦜', {
      fontFamily: 'Arial',
      fontSize: 48
    });
    icon.anchor.set(0.5);
    icon.position.set(0, -50);
    card.addChild(icon);

    // Title
    const titleText = new PIXI.Text(title, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    titleText.anchor.set(0.5);
    titleText.position.set(0, 20);
    card.addChild(titleText);

    // Description
    const descText = new PIXI.Text(description, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xFFFFFF,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 320
    });
    descText.anchor.set(0.5);
    descText.position.set(0, 70);
    card.addChild(descText);

    // Play button
    const playButton = new PIXI.Container();
    const playBg = new PIXI.Graphics();
    playBg.beginFill(0xFFFFFF);
    playBg.drawRoundedRect(-60, -18, 120, 36, 18);
    playBg.endFill();
    playButton.addChild(playBg);

    const playText = new PIXI.Text('플레이', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: color,
      fontWeight: 'bold'
    });
    playText.anchor.set(0.5);
    playButton.addChild(playText);
    playButton.position.set(0, 115);
    playButton.eventMode = 'static';
    playButton.cursor = 'pointer';
    playButton.on('pointerdown', () => {
      this.eventBus.emit('game:select', { type: gameType });
    });
    card.addChild(playButton);

    // Ranking button
    const rankBtn = new PIXI.Container();
    const rankBg = new PIXI.Graphics();
    rankBg.beginFill(0xFFD700);
    rankBg.drawRoundedRect(-60, -18, 120, 36, 18);
    rankBg.endFill();
    rankBtn.addChild(rankBg);

    const rankText = new PIXI.Text('랭킹', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x1a1a2e,
      fontWeight: 'bold'
    });
    rankText.anchor.set(0.5);
    rankBtn.addChild(rankText);
    rankBtn.position.set(0, 155);
    rankBtn.eventMode = 'static';
    rankBtn.cursor = 'pointer';
    rankBtn.on('pointerdown', () => {
      this.eventBus.emit('ranking:show', { gameType });
    });
    card.addChild(rankBtn);

    this.addChild(card);
  }

  public update(_deltaTime: number): void {
    // Add any animations if needed
  }

  public destroy(): void {
    super.destroy();
  }
}