// Game Types and Interfaces

export interface Vector2 {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export enum GameColor {
  RED = '#FF6B6B',
  BLUE = '#4ECDC4',
  YELLOW = '#FFE66D',
  GREEN = '#95E77E',
  PURPLE = '#A78BFA'
}

export enum DragonState {
  IDLE = 'idle',
  MOVING = 'moving',
  EATING = 'eating',
  HAPPY = 'happy',
  SAD = 'sad'
}

export enum SceneType {
  SELECTOR = 'selector',
  MENU = 'menu',
  GAME = 'game',
  PARROT_GAME = 'parrotGame',
  GAME_OVER = 'gameOver',
  RANKING = 'ranking'
}

export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias: boolean;
  resolution: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  duration: number;
  targetScore: number;
  riceCakeSpawnRate: number;
  riceCakeSpeed: number;
  parrotRequestInterval: number;
  availableColors: GameColor[];
  bonusMultiplier: number;
}

export interface GameState {
  currentScene: SceneType;
  gameData: {
    score: number;
    level: number;
    timeRemaining: number;
    combo: number;
    highScore: number;
  };
  config: GameConfig;
}

export interface ColorTransform {
  from: GameColor;
  to: GameColor;
  duration: number;
}

export type GameEvent =
  | 'game:select'
  | 'game:start'
  | 'game:pause'
  | 'game:resume'
  | 'game:over'
  | 'menu:show'
  | 'ranking:show'
  | 'dragon:eat'
  | 'dragon:transform'
  | 'parrot:satisfied'
  | 'parrot:request'
  | 'score:update'
  | 'level:complete';

export type EventHandler = (data?: any) => void;

export interface TouchHandler {
  (event: TouchEvent | MouseEvent): void;
}

export type GameType = 'parrot-seed' | 'dragon-feeding';

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