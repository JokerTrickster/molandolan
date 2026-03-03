import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneType } from '@/types';
import { EventBus } from '@/core/EventBus';

export class MenuScene extends BaseScene {
  private titleText!: PIXI.Text;
  private playButton!: PIXI.Container;
  private eventBus: EventBus;

  constructor(app: PIXI.Application) {
    super(app, SceneType.MENU);
    this.eventBus = EventBus.getInstance();
  }

  public async init(): Promise<void> {
    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x667EEA);
    background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    background.endFill();
    this.addChild(background);

    // Create title
    this.titleText = new PIXI.Text('떡먹는 용만이', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFFFFF,
      align: 'center',
      fontWeight: 'bold',
    });
    this.titleText.anchor.set(0.5);
    this.titleText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.3
    );
    this.addChild(this.titleText);

    // Create subtitle
    const subtitle = new PIXI.Text('Dragon Feeding Game', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFE66D,
      align: 'center',
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.38
    );
    this.addChild(subtitle);

    // Create play button
    this.createPlayButton();

    // Create instructions
    const instructions = new PIXI.Text(
      '🐉 용이 떡을 먹고 색이 변해요!\n🦜 앵무새가 원하는 색을 맞춰주세요!\n👆 터치하여 떡을 수집하세요!',
      {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xFFFFFF,
        align: 'center',
        lineHeight: 24,
      }
    );
    instructions.anchor.set(0.5);
    instructions.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.7
    );
    this.addChild(instructions);
  }

  private createPlayButton(): void {
    this.playButton = new PIXI.Container();

    // Button background
    const buttonBg = new PIXI.Graphics();
    buttonBg.beginFill(0x4ECDC4);
    buttonBg.drawRoundedRect(-100, -30, 200, 60, 30);
    buttonBg.endFill();
    this.playButton.addChild(buttonBg);

    // Button text
    const buttonText = new PIXI.Text('시작하기', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
    });
    buttonText.anchor.set(0.5);
    this.playButton.addChild(buttonText);

    // Position button
    this.playButton.position.set(
      this.app.screen.width / 2,
      this.app.screen.height * 0.5
    );

    // Make interactive
    this.playButton.eventMode = 'static';
    this.playButton.cursor = 'pointer';

    // Add hover effect
    this.playButton.on('pointerover', () => {
      this.playButton.scale.set(1.1);
    });

    this.playButton.on('pointerout', () => {
      this.playButton.scale.set(1);
    });

    // Add click handler
    this.playButton.on('pointerdown', () => {
      this.playButton.scale.set(0.95);
    });

    this.playButton.on('pointerup', () => {
      this.playButton.scale.set(1);
      this.eventBus.emit('game:start');
    });

    this.addChild(this.playButton);
  }

  public update(_deltaTime: number): void {
    // Animate title
    this.titleText.scale.set(
      1 + Math.sin(Date.now() * 0.001) * 0.02
    );

    // Animate play button
    if (this.playButton) {
      this.playButton.rotation = Math.sin(Date.now() * 0.002) * 0.02;
    }
  }

  public destroy(): void {
    this.eventBus.off('game:start', () => {});
    super.destroy();
  }
}