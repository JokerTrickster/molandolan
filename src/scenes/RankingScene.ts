import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneType, GameType, RankEntry } from '@/types';
import { EventBus } from '@/core/EventBus';
import { ApiClient } from '@/core/ApiClient';
import { AuthService } from '@/core/AuthService';

const TAB_CONFIG: { type: GameType; label: string }[] = [
  { type: 'parrot-seed', label: '앵무새 게임' },
  { type: 'dragon-feeding', label: '용만이 게임' }
];

export class RankingScene extends BaseScene {
  private eventBus: EventBus;
  private apiClient: ApiClient;
  private authService: AuthService;
  private activeTab: GameType = 'parrot-seed';
  private contentContainer!: PIXI.Container;
  private tabButtons: PIXI.Container[] = [];
  private loadingText!: PIXI.Text;

  constructor(app: PIXI.Application) {
    super(app, SceneType.RANKING);
    this.eventBus = EventBus.getInstance();
    this.apiClient = ApiClient.getInstance();
    this.authService = AuthService.getInstance();
  }

  public setGameType(gameType: GameType): void {
    this.activeTab = gameType;
  }

  public async init(): Promise<void> {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a1a2e);
    bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.endFill();
    this.addChild(bg);

    const title = new PIXI.Text('랭킹', {
      fontFamily: 'Arial',
      fontSize: 42,
      fill: 0xFFD700,
      fontWeight: 'bold'
    });
    title.anchor.set(0.5, 0);
    title.position.set(this.app.screen.width / 2, 30);
    this.addChild(title);

    this.createTabs();

    this.contentContainer = new PIXI.Container();
    this.contentContainer.position.set(0, 140);
    this.addChild(this.contentContainer);

    this.loadingText = new PIXI.Text('로딩중...', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xBDC3C7
    });
    this.loadingText.anchor.set(0.5);
    this.loadingText.position.set(this.app.screen.width / 2, 300);
    this.contentContainer.addChild(this.loadingText);

    const backBtn = this.createBackButton();
    backBtn.position.set(this.app.screen.width / 2, this.app.screen.height - 60);
    this.addChild(backBtn);

    await this.loadRankings();
  }

  private createTabs(): void {
    const tabWidth = 160;
    const gap = 20;
    const totalWidth = TAB_CONFIG.length * tabWidth + (TAB_CONFIG.length - 1) * gap;
    const startX = (this.app.screen.width - totalWidth) / 2;

    TAB_CONFIG.forEach((config, index) => {
      const tab = new PIXI.Container();
      const isActive = config.type === this.activeTab;

      const tabBg = new PIXI.Graphics();
      tabBg.beginFill(isActive ? 0xFFD700 : 0x333355);
      tabBg.drawRoundedRect(0, 0, tabWidth, 40, 12);
      tabBg.endFill();
      tab.addChild(tabBg);

      const tabText = new PIXI.Text(config.label, {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: isActive ? 0x1a1a2e : 0xBDC3C7,
        fontWeight: 'bold'
      });
      tabText.anchor.set(0.5);
      tabText.position.set(tabWidth / 2, 20);
      tab.addChild(tabText);

      tab.position.set(startX + index * (tabWidth + gap), 90);
      tab.eventMode = 'static';
      tab.cursor = 'pointer';
      tab.on('pointerdown', () => {
        this.activeTab = config.type;
        this.refreshTabs();
        this.loadRankings();
      });

      this.tabButtons.push(tab);
      this.addChild(tab);
    });
  }

  private refreshTabs(): void {
    this.tabButtons.forEach((tab, index) => {
      const config = TAB_CONFIG[index];
      const isActive = config.type === this.activeTab;
      const tabBg = tab.getChildAt(0) as PIXI.Graphics;
      const tabText = tab.getChildAt(1) as PIXI.Text;

      tabBg.clear();
      tabBg.beginFill(isActive ? 0xFFD700 : 0x333355);
      tabBg.drawRoundedRect(0, 0, 160, 40, 12);
      tabBg.endFill();

      tabText.style.fill = isActive ? 0x1a1a2e : 0xBDC3C7;
    });
  }

  private async loadRankings(): Promise<void> {
    this.contentContainer.removeChildren();

    this.loadingText = new PIXI.Text('로딩중...', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xBDC3C7
    });
    this.loadingText.anchor.set(0.5);
    this.loadingText.position.set(this.app.screen.width / 2, 160);
    this.contentContainer.addChild(this.loadingText);

    const [topRankings, myRanking] = await Promise.all([
      this.apiClient.getTopRankings(this.activeTab, 5),
      this.apiClient.getMyRanking(this.activeTab)
    ]);

    this.contentContainer.removeChildren();
    this.renderRankings(topRankings, myRanking);
  }

  private renderRankings(
    topRankings: RankEntry[],
    myRanking: { rank: number; entry: RankEntry } | null
  ): void {
    const centerX = this.app.screen.width / 2;
    const rowHeight = 50;
    const startY = 20;
    const isParrot = this.activeTab === 'parrot-seed';
    const myNickname = this.authService.getNickname();

    if (topRankings.length === 0) {
      const empty = new PIXI.Text('아직 기록이 없습니다', {
        fontFamily: 'Arial',
        fontSize: 22,
        fill: 0x95A5A6
      });
      empty.anchor.set(0.5);
      empty.position.set(centerX, startY + 100);
      this.contentContainer.addChild(empty);
      return;
    }

    topRankings.forEach((entry, index) => {
      const y = startY + index * rowHeight;
      const isMe = myNickname !== null && entry.nickname === myNickname;
      this.renderRow(entry, y, centerX, isParrot, isMe);
    });

    const myRank = myRanking?.rank ?? null;
    const isInTop5 = myRank !== null && myRank <= 5;

    if (myRanking && !isInTop5) {
      const separatorY = startY + topRankings.length * rowHeight + 10;
      const dots = new PIXI.Text('...', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x666688
      });
      dots.anchor.set(0.5);
      dots.position.set(centerX, separatorY);
      this.contentContainer.addChild(dots);

      const myY = separatorY + 35;
      this.renderRow(myRanking.entry, myY, centerX, isParrot, true);
    }
  }

  private renderRow(
    entry: RankEntry,
    y: number,
    centerX: number,
    isParrot: boolean,
    isMe: boolean
  ): void {
    const rowWidth = this.app.screen.width - 60;

    if (isMe) {
      const highlight = new PIXI.Graphics();
      highlight.beginFill(0xFFD700, 0.15);
      highlight.drawRoundedRect(centerX - rowWidth / 2, y - 5, rowWidth, 40, 8);
      highlight.endFill();
      this.contentContainer.addChild(highlight);
    }

    const rankColor = entry.rank <= 3 ? 0xFFD700 : 0xBDC3C7;
    const rankText = new PIXI.Text(`${entry.rank}위`, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: rankColor,
      fontWeight: 'bold'
    });
    rankText.position.set(centerX - rowWidth / 2 + 10, y);
    this.contentContainer.addChild(rankText);

    const nameText = new PIXI.Text(`${entry.nickname}님`, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: isMe ? 0xFFD700 : 0xFFFFFF,
      fontWeight: isMe ? 'bold' : 'normal'
    });
    nameText.position.set(centerX - rowWidth / 2 + 80, y);
    this.contentContainer.addChild(nameText);

    let valueStr: string;
    if (isParrot && entry.clearTimeMs != null) {
      valueStr = `${(entry.clearTimeMs / 1000).toFixed(1)}초`;
    } else if (entry.score != null) {
      valueStr = `${entry.score}점`;
    } else {
      valueStr = '-';
    }

    const valueText = new PIXI.Text(valueStr, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xBDC3C7
    });
    valueText.anchor.set(1, 0);
    valueText.position.set(centerX + rowWidth / 2 - 10, y);
    this.contentContainer.addChild(valueText);
  }

  private createBackButton(): PIXI.Container {
    const btn = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(0x333355);
    bg.drawRoundedRect(-80, -25, 160, 50, 16);
    bg.endFill();
    btn.addChild(bg);

    const text = new PIXI.Text('돌아가기', {
      fontFamily: 'Arial',
      fontSize: 22,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => {
      this.eventBus.emit('menu:show');
    });

    return btn;
  }

  public update(_deltaTime: number): void {}

  public destroy(): void {
    this.tabButtons = [];
    super.destroy();
  }
}
