import { RoundConfig } from '../types';

/**
 * Manages the 5-round progressive difficulty system
 * Round 1: 3 identical parrots (easy)
 * Round 2: 3 parrots with increased speed and movement
 * Round 3: 4 parrots
 * Round 4: 4 parrots with higher difficulty
 * Round 5: 5 parrots (maximum difficulty)
 */
export class RoundManager {
  private static readonly ROUND_CONFIGS: RoundConfig[] = [
    {
      roundNumber: 1,
      parrotCount: 3,
      shuffleSpeed: 1.0,
      shuffleDuration: 10,
      complexityLevel: 1
    },
    {
      roundNumber: 2,
      parrotCount: 3,
      shuffleSpeed: 1.3,
      shuffleDuration: 12,
      complexityLevel: 2
    },
    {
      roundNumber: 3,
      parrotCount: 4,
      shuffleSpeed: 1.5,
      shuffleDuration: 13,
      complexityLevel: 2
    },
    {
      roundNumber: 4,
      parrotCount: 4,
      shuffleSpeed: 1.5,
      shuffleDuration: 14,
      complexityLevel: 3
    },
    {
      roundNumber: 5,
      parrotCount: 5,
      shuffleSpeed: 1.5,
      shuffleDuration: 15,
      complexityLevel: 4
    }
  ];

  /**
   * Get configuration for a specific round
   * @param round Round number (1-5)
   * @returns Round configuration
   */
  public static getRoundConfig(round: number): RoundConfig {
    const index = Math.min(Math.max(round - 1, 0), this.ROUND_CONFIGS.length - 1);
    return this.ROUND_CONFIGS[index];
  }

  /**
   * Check if game is completed (after round 5)
   * @param round Current round number
   * @returns True if game is completed
   */
  public static isGameComplete(round: number): boolean {
    return round > this.ROUND_CONFIGS.length;
  }

  /**
   * Get total number of rounds
   * @returns Total rounds (5)
   */
  public static getTotalRounds(): number {
    return this.ROUND_CONFIGS.length;
  }

  /**
   * Calculate score multiplier based on round
   * @param round Round number
   * @returns Score multiplier
   */
  public static getScoreMultiplier(round: number): number {
    return 1 + (round - 1) * 0.5; // 1x, 1.5x, 2x, 2.5x, 3x
  }

  /**
   * Get round title for display
   * @param round Round number
   * @returns Localized round title
   */
  public static getRoundTitle(round: number): string {
    const titles = [
      '쉬운 시작',      // Round 1: Easy Start
      '속도 증가',      // Round 2: Speed Increase
      '앵무새 추가',    // Round 3: More Parrots
      '도전 모드',      // Round 4: Challenge Mode
      '최종 라운드'     // Round 5: Final Round
    ];
    const index = Math.min(Math.max(round - 1, 0), titles.length - 1);
    return titles[index];
  }

  /**
   * Get difficulty description for UI
   * @param round Round number
   * @returns Difficulty description
   */
  public static getDifficultyDescription(round: number): string {
    const descriptions = [
      '앵무새 3마리 - 천천히 섞기',
      '앵무새 3마리 - 빠르게 섞기',
      '앵무새 4마리 - 보통 속도',
      '앵무새 4마리 - 빠른 속도',
      '앵무새 5마리 - 최고 난이도'
    ];
    const index = Math.min(Math.max(round - 1, 0), descriptions.length - 1);
    return descriptions[index];
  }
}