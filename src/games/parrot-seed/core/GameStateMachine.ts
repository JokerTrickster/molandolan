import { createMachine, assign } from 'xstate';
import { GameContext, GamePhase, DifficultyLevel } from '../types';
import { RoundManager } from './RoundManager';

export const gameStateMachine = createMachine({
  id: 'parrotSeedGame',
  initial: GamePhase.INIT,
  predictableActionArguments: true,
  context: {
    round: 1,
    score: 0,
    lives: 3,
    correctParrotId: null,
    selectedParrotId: null,
    difficulty: DifficultyLevel.NORMAL,
    timeRemaining: 15,
    combo: 0,
    parrotCount: 3,
    roundConfig: null,
    startTime: 0,
    clearTimeMs: 0,
    isCleared: false
  } as GameContext,

  states: {
    [GamePhase.INIT]: {
      on: { START: GamePhase.MENU }
    },

    [GamePhase.MENU]: {
      on: {
        SELECT_DIFFICULTY: {
          actions: assign({ difficulty: (_: GameContext, event: any) => event.difficulty })
        },
        PLAY: GamePhase.READY
      }
    },

    [GamePhase.READY]: {
      entry: assign((context: GameContext) => {
        const roundConfig = RoundManager.getRoundConfig(context.round);
        const updates: Partial<GameContext> = {
          correctParrotId: null,
          selectedParrotId: null,
          timeRemaining: roundConfig.shuffleDuration,
          parrotCount: roundConfig.parrotCount,
          roundConfig: roundConfig
        };
        if (context.round === 1) {
          updates.startTime = Date.now();
        }
        return updates;
      }),
      on: {
        COUNTDOWN_DONE: GamePhase.FEEDING
      }
    },

    [GamePhase.FEEDING]: {
      entry: assign((context: GameContext) => ({
        correctParrotId: Math.floor(Math.random() * context.parrotCount)
      })),
      on: {
        FEEDING_DONE: GamePhase.SHUFFLING
      }
    },

    [GamePhase.SHUFFLING]: {
      on: {
        SHUFFLE_COMPLETE: GamePhase.SELECTING,
        UPDATE_TIME: {
          actions: assign({ timeRemaining: (_: GameContext, event: any) => event.time })
        }
      }
    },

    [GamePhase.SELECTING]: {
      on: {
        SELECT_PARROT: {
          target: GamePhase.RESULT,
          actions: assign({ selectedParrotId: (_: GameContext, event: any) => event.parrotId })
        }
      }
    },

    [GamePhase.RESULT]: {
      entry: [
        assign((context: GameContext) => {
          const isCorrect = context.selectedParrotId === context.correctParrotId;
          if (isCorrect) {
            const roundMultiplier = RoundManager.getScoreMultiplier(context.round);
            const comboBonus = context.combo * 10;
            const baseScore = 100 * roundMultiplier;
            return {
              score: context.score + baseScore + comboBonus,
              combo: context.combo + 1,
              round: context.round + 1
            };
          }
          return { lives: context.lives - 1, combo: 0 };
        })
      ],
      on: {
        NEXT_ROUND: [
          {
            target: GamePhase.GAME_OVER,
            cond: (context: GameContext) => RoundManager.isGameComplete(context.round),
            actions: assign((context: GameContext) => ({
              isCleared: true,
              clearTimeMs: Date.now() - context.startTime
            }))
          },
          {
            target: GamePhase.READY,
            cond: (context: GameContext) => context.lives > 0
          },
          {
            target: GamePhase.GAME_OVER,
            actions: assign({ isCleared: false, clearTimeMs: 0 })
          }
        ]
      }
    },

    [GamePhase.GAME_OVER]: {
      on: {
        RESTART: {
          target: GamePhase.READY,
          actions: assign({
            round: 1,
            score: 0,
            lives: 3,
            correctParrotId: null,
            selectedParrotId: null,
            combo: 0,
            startTime: 0,
            clearTimeMs: 0,
            isCleared: false
          })
        }
      }
    }
  }
});
