export interface Vector2 {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export enum SceneType {
  PARROT_GAME = 'parrotGame',
  RANKING = 'ranking'
}

export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias: boolean;
  resolution: number;
}

export type GameEvent =
  | 'game:start'
  | 'game:pause'
  | 'game:resume'
  | 'game:over'
  | 'menu:show'
  | 'ranking:show'
  | 'score:update';

export type EventHandler = (data?: any) => void;

export type GameType = 'parrot-seed' | 'memory-card' | 'hidden-parrot';

export interface RankEntry {
  rank: number;
  nickname: string;
  clearTimeMs?: number;
  score?: number;
  createdAt: string;
}

export interface RankingData {
  gameType: GameType;
  topRankings: RankEntry[];
  myRanking: RankEntry | null;
}
