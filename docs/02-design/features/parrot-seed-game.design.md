# Design: Parrot Seed Game (해씨먹는 앵무새)

## 1. Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────┐
│           Browser (Client)              │
├─────────────────────────────────────────┤
│         Game Application                │
│  ┌────────────────────────────────┐    │
│  │      Presentation Layer        │    │
│  │   (UI, Canvas, Animations)     │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │       Game Engine Core         │    │
│  │  (State Machine, Game Logic)   │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │      Shuffle Engine            │    │
│  │  (Path Gen, Animation Control) │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │      Resource Manager          │    │
│  │  (Assets, Audio, Storage)      │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Technology Stack
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 5.x (reusing existing setup)
- **Canvas Library**: Pixi.js v7 (already installed)
- **Animation**: GSAP 3.x for complex movements
- **State Management**: XState for game phases
- **Audio**: Howler.js (already installed)
- **Testing**: Vitest + Playwright

## 2. Component Design

### Core Components Structure
```
src/games/parrot-seed/
├── core/
│   ├── ParrotGame.ts         # Main game controller
│   ├── GameStateMachine.ts   # XState machine for phases
│   ├── ShuffleEngine.ts      # Shuffle algorithm & control
│   └── DifficultyManager.ts  # Difficulty settings
├── entities/
│   ├── Parrot.ts             # Individual parrot entity
│   ├── SunflowerSeed.ts      # Seed entity
│   └── ParrotGroup.ts        # Group controller
├── animations/
│   ├── EatingAnimation.ts    # Seed eating animation
│   ├── ShuffleAnimation.ts   # Movement animations
│   └── PathGenerator.ts      # Movement path algorithms
├── scenes/
│   ├── ParrotMenuScene.ts    # Main menu
│   ├── ParrotGameScene.ts    # Game scene
│   ├── ResultScene.ts        # Round result
│   └── ParrotGameOver.ts     # Game over screen
├── ui/
│   ├── Timer.ts              # Countdown timer
│   ├── LivesDisplay.ts       # Lives indicator
│   ├── ScoreDisplay.ts       # Score display
│   └── DifficultySelector.ts # Difficulty UI
└── utils/
    ├── ShuffleAlgorithms.ts  # Different shuffle patterns
    ├── TrackingHelper.ts     # Visual tracking aids
    └── AccessibilityUtils.ts # Color blind modes
```

### Component Interfaces

#### Parrot Entity
```typescript
interface IParrot {
  id: number;                    // 0-4
  position: Vector2;              // Current position
  originalPosition: Vector2;      // Starting position
  color: string;                  // Visual identifier
  pattern?: PatternType;          // Accessibility pattern
  number?: number;                // Display number
  hasEatenSeed: boolean;         // Seed status
  isMoving: boolean;             // Animation state
  currentPath?: MovementPath;     // Active movement

  eat(seed: SunflowerSeed): void;
  moveTo(position: Vector2, duration: number): Promise<void>;
  highlight(active: boolean): void;
  reset(): void;
}
```

#### Shuffle Engine
```typescript
interface IShuffleEngine {
  difficulty: DifficultyLevel;
  duration: number;              // 15 seconds
  currentTime: number;
  isShuffling: boolean;

  generateShuffleSequence(): ShuffleSequence;
  executeSequence(parrots: IParrot[]): Promise<void>;
  pauseShuffle(): void;
  resumeShuffle(): void;
  getMovementSpeed(): number;
}
```

#### Movement Path
```typescript
interface MovementPath {
  from: Vector2;
  to: Vector2;
  duration: number;
  curve?: CurveType;            // linear, bezier, arc
  controlPoints?: Vector2[];     // For curved paths
  delay?: number;
}
```

## 3. Game State Machine

### State Diagram
```
┌──────────┐
│   INIT   │
└────┬─────┘
     ↓
┌──────────┐
│   MENU   │←─────────────────┐
└────┬─────┘                  │
     ↓                        │
┌──────────┐                  │
│   READY  │ (3-2-1 count)    │
└────┬─────┘                  │
     ↓                        │
┌──────────┐                  │
│  FEEDING │ (3 seconds)      │
└────┬─────┘                  │
     ↓                        │
┌──────────┐                  │
│ SHUFFLING│ (15 seconds)     │
└────┬─────┘                  │
     ↓                        │
┌──────────┐                  │
│ SELECTING│                  │
└────┬─────┘                  │
     ↓                        │
┌──────────┐                  │
│  RESULT  │──────────────────┤
└────┬─────┘                  │
     ↓                        │
┌──────────┐                  │
│ GAME_OVER│──────────────────┘
└──────────┘
```

### State Implementation
```typescript
const gameStateMachine = createMachine({
  id: 'parrotGame',
  initial: 'init',
  context: {
    round: 1,
    score: 0,
    lives: 3,
    correctParrotId: null,
    selectedParrotId: null,
    difficulty: 'normal'
  },
  states: {
    init: { /* ... */ },
    menu: { /* ... */ },
    ready: {
      after: {
        3000: 'feeding'
      }
    },
    feeding: {
      entry: 'selectRandomParrot',
      after: {
        3000: 'shuffling'
      }
    },
    shuffling: {
      invoke: {
        src: 'shuffleParrots',
        onDone: 'selecting'
      }
    },
    selecting: {
      on: {
        SELECT_PARROT: {
          target: 'result',
          actions: 'checkAnswer'
        }
      }
    },
    result: {
      on: {
        NEXT_ROUND: [
          {
            target: 'ready',
            cond: 'hasLives'
          },
          {
            target: 'gameOver'
          }
        ]
      }
    },
    gameOver: {
      on: {
        RESTART: 'menu'
      }
    }
  }
});
```

## 4. Shuffle Algorithm Design

### Shuffle Patterns by Difficulty

#### Easy Mode
```typescript
class EasyShufflePattern {
  // Simple swap between adjacent parrots
  generateSwaps(parrots: IParrot[]): SwapSequence[] {
    return [
      { from: 0, to: 1, duration: 1000 },
      { from: 2, to: 3, duration: 1000 },
      { from: 1, to: 2, duration: 1000 },
      // ... total 15 swaps over 15 seconds
    ];
  }
}
```

#### Normal Mode
```typescript
class NormalShufflePattern {
  // Cross patterns and circular rotations
  generateMovements(): MovementSequence {
    return {
      patterns: ['swap', 'rotate', 'cross'],
      speed: 'medium',
      overlapping: true
    };
  }
}
```

#### Hard Mode
```typescript
class HardShufflePattern {
  // Complex multi-parrot movements
  generateChaos(): ComplexMovement {
    return {
      simultaneous: 3,  // 3 parrots move at once
      patterns: ['spiral', 'weave', 'randomWalk'],
      speedVariation: true,
      fakeouts: true    // Parrots appear to swap but don't
    };
  }
}
```

### Path Generation Algorithm
```typescript
class PathGenerator {
  generateBezierPath(from: Vector2, to: Vector2): Path {
    const distance = Vector2.distance(from, to);
    const midpoint = Vector2.lerp(from, to, 0.5);

    // Create arc based on distance
    const controlPoint = {
      x: midpoint.x,
      y: midpoint.y - (distance * 0.3)
    };

    return {
      type: 'bezier',
      points: [from, controlPoint, to],
      duration: this.calculateDuration(distance)
    };
  }

  generateSwapPath(p1: IParrot, p2: IParrot): DualPath {
    // Ensure parrots don't collide during swap
    const offset = 50;
    const p1Path = this.generateArcPath(p1.position, p2.position, offset);
    const p2Path = this.generateArcPath(p2.position, p1.position, -offset);

    return { p1Path, p2Path };
  }
}
```

## 5. Animation System

### Eating Animation
```typescript
class EatingAnimation {
  async play(parrot: IParrot, seed: SunflowerSeed): Promise<void> {
    const timeline = gsap.timeline();

    // Seed moves to parrot
    timeline.to(seed.sprite, {
      x: parrot.position.x,
      y: parrot.position.y - 20,
      duration: 0.5,
      ease: "power2.inOut"
    });

    // Parrot opens beak
    timeline.to(parrot.beak, {
      rotation: 0.3,
      duration: 0.2
    });

    // Seed disappears
    timeline.to(seed.sprite, {
      scale: 0,
      duration: 0.2
    });

    // Chewing animation
    timeline.to(parrot.sprite, {
      scaleX: [1.1, 0.9, 1.1, 1],
      duration: 0.5,
      ease: "none"
    });

    // Happy expression
    timeline.call(() => parrot.showHappy());

    return timeline;
  }
}
```

### Shuffle Animation Controller
```typescript
class ShuffleAnimationController {
  private animations: gsap.core.Timeline[] = [];
  private elapsed: number = 0;

  async executeShuffle(
    parrots: IParrot[],
    duration: number,
    pattern: ShufflePattern
  ): Promise<void> {
    const sequences = pattern.generate(parrots, duration);

    for (const sequence of sequences) {
      const timeline = this.createTimeline(sequence);
      this.animations.push(timeline);
    }

    // Play all animations
    return Promise.all(
      this.animations.map(anim => anim.play())
    );
  }

  pause(): void {
    this.animations.forEach(anim => anim.pause());
  }

  resume(): void {
    this.animations.forEach(anim => anim.resume());
  }
}
```

## 6. Visual Tracking Aids

### Accessibility Features
```typescript
interface AccessibilityOptions {
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  showNumbers: boolean;
  showPatterns: boolean;
  trackingAid: 'none' | 'trail' | 'highlight' | 'slowmo';
  reducedMotion: boolean;
}

class AccessibilityManager {
  applyColorBlindFilter(mode: string): void {
    // Apply color transformation matrix
  }

  addTrackingTrail(parrot: IParrot): void {
    const trail = new PIXI.Graphics();
    // Create semi-transparent trail following parrot
  }

  enableSlowMotion(factor: number = 0.5): void {
    gsap.globalTimeline.timeScale(factor);
  }
}
```

## 7. Performance Optimization

### Rendering Optimization
- Use PIXI.ParticleContainer for multiple parrots
- Implement object pooling for animations
- Batch render calls during shuffle
- Use texture atlases for all sprites

### Animation Optimization
```typescript
class AnimationOptimizer {
  // Use RAF with delta time capping
  private maxDelta = 1000 / 30; // Cap at 30fps minimum

  // Adaptive quality based on performance
  adjustQuality(fps: number): void {
    if (fps < 30) {
      this.reduceParticles();
      this.simplifyPaths();
    } else if (fps > 55) {
      this.enhanceEffects();
    }
  }

  // Path simplification for low-end devices
  simplifyPath(path: Path): Path {
    if (path.type === 'bezier') {
      return { ...path, type: 'linear' };
    }
    return path;
  }
}
```

## 8. Data Models

### Game Session Model
```typescript
interface GameSession {
  id: string;
  startTime: Date;
  difficulty: DifficultyLevel;
  rounds: Round[];
  currentRound: number;
  score: number;
  lives: number;
  combo: number;
  highScore: number;
}

interface Round {
  number: number;
  correctParrotId: number;
  selectedParrotId: number | null;
  isCorrect: boolean;
  responseTime: number;
  shuffleDuration: number;
  score: number;
}

interface DifficultySettings {
  level: 'easy' | 'normal' | 'hard';
  shuffleSpeed: number;        // 1.0 = normal
  shuffleComplexity: number;   // 1-10
  numberOfSwaps: number;       // Total position changes
  overlapRatio: number;        // 0-1 (simultaneous movements)
  visualAids: boolean;         // Show helpers
}
```

## 9. Input System

### Touch/Click Handler
```typescript
class InputManager {
  private isSelectionEnabled: boolean = false;

  enableSelection(): void {
    this.isSelectionEnabled = true;
    this.parrots.forEach(p => p.interactive = true);
  }

  handleParrotClick(parrotId: number): void {
    if (!this.isSelectionEnabled) return;

    // Visual feedback
    this.highlightParrot(parrotId);

    // Disable further selection
    this.isSelectionEnabled = false;

    // Emit selection event
    this.eventBus.emit('parrot:selected', { id: parrotId });
  }

  handleTouchStart(event: TouchEvent): void {
    // Prevent zoom on double tap
    event.preventDefault();

    const touch = event.touches[0];
    const parrot = this.getParrotAtPosition(touch.clientX, touch.clientY);

    if (parrot) {
      this.handleParrotClick(parrot.id);
    }
  }
}
```

## 10. Sound Design

### Audio Events
```typescript
const audioConfig = {
  effects: {
    countdown: 'countdown.mp3',
    eating: 'eating.mp3',
    shuffleStart: 'shuffle_start.mp3',
    shuffleLoop: 'shuffle_loop.mp3',
    correct: 'correct.mp3',
    wrong: 'wrong.mp3',
    gameOver: 'game_over.mp3'
  },
  music: {
    menu: 'menu_bgm.mp3',
    game: 'game_bgm.mp3'
  }
};

class AudioManager {
  private sounds: Map<string, Howl> = new Map();

  playEatingSound(): void {
    const sound = this.sounds.get('eating');
    sound?.play();
  }

  startShuffleMusic(): void {
    const loop = this.sounds.get('shuffleLoop');
    loop?.loop(true);
    loop?.play();
  }

  stopShuffleMusic(): void {
    const loop = this.sounds.get('shuffleLoop');
    loop?.stop();
  }
}
```

## 11. Implementation Order

### Phase 1: Core Setup
1. Create folder structure
2. Setup game state machine
3. Implement Parrot entity
4. Basic scene management

### Phase 2: Game Flow
1. Implement feeding phase
2. Basic shuffle (simple swaps)
3. Selection mechanism
4. Result calculation

### Phase 3: Shuffle Engine
1. Path generation algorithms
2. Difficulty patterns
3. Animation system
4. Performance optimization

### Phase 4: Polish
1. Visual effects
2. Sound integration
3. Accessibility features
4. UI improvements

### Phase 5: Testing
1. Unit tests for shuffle logic
2. Performance testing
3. Device compatibility
4. User testing

## 12. Dependencies

```json
{
  "dependencies": {
    "pixi.js": "^7.3.0",      // Already installed
    "gsap": "^3.12.0",         // Animation library
    "xstate": "^5.0.0",        // State management
    "howler": "^2.2.4"         // Already installed
  },
  "devDependencies": {
    // Existing dependencies
  }
}
```

## 13. File Structure

```
molandolan/
├── src/
│   ├── games/
│   │   └── parrot-seed/
│   │       ├── core/
│   │       ├── entities/
│   │       ├── animations/
│   │       ├── scenes/
│   │       ├── ui/
│   │       ├── utils/
│   │       └── index.ts
│   ├── shared/           # Shared between games
│   │   ├── assets/
│   │   └── utils/
│   └── main.ts          # Game selector
```

---

**Created**: 2026-03-03
**Status**: Design Complete
**Next Step**: Implementation phase (`/pdca do parrot-seed-game`)