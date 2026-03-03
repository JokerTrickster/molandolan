// Parrot Seed Game Types

import { Vector2 } from '@/types';

export enum GamePhase {
  INIT = 'init',
  MENU = 'menu',
  READY = 'ready',
  FEEDING = 'feeding',
  SHUFFLING = 'shuffling',
  SELECTING = 'selecting',
  RESULT = 'result',
  GAME_OVER = 'gameOver'
}

export enum DifficultyLevel {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

export interface ParrotData {
  id: number;
  position: Vector2;
  originalPosition: Vector2;
  color: string;
  pattern?: string;
  number: number;
  hasEatenSeed: boolean;
  isMoving: boolean;
}

export interface RoundConfig {
  roundNumber: number;
  parrotCount: number;
  shuffleSpeed: number;
  shuffleDuration: number;
  complexityLevel: number;
}

export interface GameContext {
  round: number;
  score: number;
  lives: number;
  correctParrotId: number | null;
  selectedParrotId: number | null;
  difficulty: DifficultyLevel;
  timeRemaining: number;
  combo: number;
  parrotCount: number;
  roundConfig: RoundConfig | null;
  startTime: number;
  clearTimeMs: number;
  isCleared: boolean;
}

export interface ShuffleSequence {
  movements: MovementData[];
  totalDuration: number;
}

export interface MovementData {
  parrotId: number;
  from: Vector2;
  to: Vector2;
  duration: number;
  delay: number;
  curve?: 'linear' | 'bezier' | 'arc';
}

export interface DifficultySettings {
  level: DifficultyLevel;
  shuffleSpeed: number;
  shuffleComplexity: number;
  numberOfSwaps: number;
  overlapRatio: number;
  visualAids: boolean;
}