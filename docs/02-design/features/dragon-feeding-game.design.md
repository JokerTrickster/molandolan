# Design: Dragon Feeding Game (떡먹는 용만이)

## 1. Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────┐
│           Browser (Client)              │
├─────────────────────────────────────────┤
│         Game Application                │
│  ┌────────────────────────────────┐    │
│  │      Presentation Layer        │    │
│  │  (UI Components, Canvas)       │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │       Game Engine Core         │    │
│  │  (State, Logic, Physics)       │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │      Resource Manager          │    │
│  │  (Assets, Audio, Storage)      │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Technology Stack
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 5.x
- **Canvas Library**: Pixi.js v7 (WebGL rendering)
- **State Management**: Custom lightweight state machine
- **Asset Management**: PreloadJS compatible loader
- **Audio**: Howler.js (Web Audio API wrapper)
- **Testing**: Vitest + Playwright (E2E)

## 2. Component Design

### Core Components Structure
```
src/
├── core/
│   ├── Game.ts              # Main game controller
│   ├── GameLoop.ts           # RAF-based game loop
│   ├── SceneManager.ts       # Scene transitions
│   └── EventBus.ts           # Global event system
├── entities/
│   ├── Dragon.ts             # Dragon character class
│   ├── Parrot.ts             # Parrot character class
│   ├── RiceCake.ts           # Rice cake entity
│   └── GameObject.ts         # Base entity class
├── systems/
│   ├── RenderSystem.ts       # Canvas rendering
│   ├── PhysicsSystem.ts      # Collision detection
│   ├── InputSystem.ts        # Touch/mouse handling
│   └── AudioSystem.ts        # Sound management
├── scenes/
│   ├── MenuScene.ts          # Main menu
│   ├── GameScene.ts          # Gameplay scene
│   ├── GameOverScene.ts      # End screen
│   └── BaseScene.ts          # Scene interface
├── managers/
│   ├── AssetManager.ts       # Resource loading
│   ├── StateManager.ts       # Game state
│   └── ScoreManager.ts       # Score tracking
└── utils/
    ├── ColorUtils.ts         # Color operations
    ├── MathUtils.ts          # Math helpers
    └── DeviceUtils.ts        # Device detection
```

### Component Interfaces

#### GameObject Interface
```typescript
interface IGameObject {
  id: string;
  position: Vector2;
  size: Size2D;
  sprite: PIXI.Sprite;
  update(deltaTime: number): void;
  render(renderer: PIXI.Renderer): void;
  destroy(): void;
}
```

#### Dragon Component
```typescript
class Dragon extends GameObject {
  currentColor: GameColor;
  targetPosition: Vector2;
  state: DragonState;
  animationController: AnimationController;

  eat(riceCake: RiceCake): void;
  transformColor(newColor: GameColor): void;
  moveToPosition(position: Vector2): void;
  playAnimation(state: DragonState): void;
}
```

#### Parrot Component
```typescript
class Parrot extends GameObject {
  color: GameColor;
  requestedFood: GameColor;
  requestTimer: number;
  satisfied: boolean;
  speechBubble: SpeechBubble;

  requestNewFood(): void;
  checkMatch(foodColor: GameColor): boolean;
  showSatisfaction(): void;
  updateRequest(deltaTime: number): void;
}
```

## 3. Data Models

### Game State Model
```typescript
interface GameState {
  currentScene: SceneType;
  gameData: {
    score: number;
    level: number;
    timeRemaining: number;
    combo: number;
    highScore: number;
  };
  entities: {
    dragon: Dragon;
    parrots: Parrot[];
    riceCakes: RiceCake[];
  };
  config: GameConfig;
}
```

### Color System
```typescript
enum GameColor {
  RED = '#FF6B6B',
  BLUE = '#4ECDC4',
  YELLOW = '#FFE66D',
  GREEN = '#95E77E',
  PURPLE = '#A78BFA'
}

interface ColorTransform {
  from: GameColor;
  to: GameColor;
  duration: number;
  easing: EasingFunction;
}
```

### Level Configuration
```typescript
interface LevelConfig {
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
```

## 4. API Design

### Game API
```typescript
class GameAPI {
  // Core game control
  init(config: GameConfig): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  destroy(): void;

  // State management
  getState(): GameState;
  setState(state: Partial<GameState>): void;
  saveGame(): void;
  loadGame(): void;

  // Event handling
  on(event: GameEvent, handler: EventHandler): void;
  off(event: GameEvent, handler: EventHandler): void;
  emit(event: GameEvent, data?: any): void;
}
```

### Input API
```typescript
interface InputAPI {
  onTouchStart(callback: TouchHandler): void;
  onTouchMove(callback: TouchHandler): void;
  onTouchEnd(callback: TouchHandler): void;
  getPointerPosition(): Vector2;
  isPointerDown(): boolean;
}
```

### Storage API
```typescript
interface StorageAPI {
  saveHighScore(score: number): void;
  getHighScore(): number;
  saveGameState(state: GameState): void;
  loadGameState(): GameState | null;
  clearData(): void;
}
```

## 5. State Management

### Scene State Machine
```
┌──────────┐
│   INIT   │
└────┬─────┘
     ↓
┌──────────┐
│   MENU   │←─────┐
└────┬─────┘      │
     ↓            │
┌──────────┐      │
│   GAME   │      │
└────┬─────┘      │
     ↓            │
┌──────────┐      │
│ GAMEOVER │──────┘
└──────────┘
```

### Dragon State Machine
```
┌──────────┐
│   IDLE   │←─────┐
└────┬─────┘      │
     ↓            │
┌──────────┐      │
│  MOVING  │      │
└────┬─────┘      │
     ↓            │
┌──────────┐      │
│  EATING  │──────┘
└──────────┘
```

### Game Loop State
```typescript
interface GameLoopState {
  isRunning: boolean;
  isPaused: boolean;
  deltaTime: number;
  lastFrameTime: number;
  fps: number;
  frameCount: number;
}
```

## 6. Implementation Order

### Phase 1: Foundation
1. **Project Setup**
   - Initialize TypeScript project with Vite
   - Configure build pipeline
   - Setup development environment

2. **Core Systems**
   - Implement GameLoop with RAF
   - Create EventBus for communication
   - Setup basic SceneManager

3. **Rendering Foundation**
   - Initialize Pixi.js renderer
   - Implement RenderSystem
   - Create basic sprite loading

### Phase 2: Game Entities
1. **Base Classes**
   - Implement GameObject base class
   - Create Vector2 and Size2D utilities
   - Setup collision detection helpers

2. **Character Implementation**
   - Create Dragon class with states
   - Implement Parrot class with requests
   - Add RiceCake spawning system

3. **Interactions**
   - Dragon movement to touch
   - Rice cake collection
   - Color transformation system

### Phase 3: Game Logic
1. **Core Mechanics**
   - Implement color matching logic
   - Add scoring system
   - Create level progression

2. **Polish**
   - Add particle effects
   - Implement sound effects
   - Create animations

3. **Optimization**
   - Performance profiling
   - Mobile optimization
   - Asset optimization

## 7. Performance Considerations

### Rendering Optimization
- Use object pooling for rice cakes and particles
- Batch draw calls using Pixi.js sprite batching
- Implement viewport culling for off-screen objects
- Use texture atlases for all sprites

### Memory Management
- Maximum 50 rice cakes active simultaneously
- Particle pool limited to 100 particles
- Texture size limit: 2048x2048 for mobile
- Audio sprites for sound effects

### Mobile Optimization
- Touch area padding: 44x44px minimum
- Debounced touch input (60Hz max)
- Progressive asset loading by quality
- Adaptive frame rate (30fps fallback)

## 8. Security & Error Handling

### Input Validation
```typescript
class InputValidator {
  validateTouch(x: number, y: number): boolean {
    return x >= 0 && x <= canvas.width &&
           y >= 0 && y <= canvas.height;
  }

  sanitizeScore(score: number): number {
    return Math.max(0, Math.min(score, MAX_SCORE));
  }
}
```

### Error Boundaries
```typescript
class GameErrorBoundary {
  handleError(error: Error): void {
    console.error('Game Error:', error);
    this.showErrorScreen();
    this.reportError(error);
  }

  recoverFromError(): void {
    this.resetGameState();
    this.returnToMenu();
  }
}
```

## 9. Testing Strategy

### Unit Tests
- Entity behavior tests
- Color matching logic
- Score calculation
- State transitions

### Integration Tests
- Scene transitions
- Game loop stability
- Input handling
- Asset loading

### E2E Tests
- Complete game flow
- Touch interactions
- Performance metrics
- Device compatibility

## 10. File Structure

```
molandolan/
├── src/
│   ├── core/
│   ├── entities/
│   ├── systems/
│   ├── scenes/
│   ├── managers/
│   ├── utils/
│   ├── types/
│   └── main.ts
├── assets/
│   ├── sprites/
│   │   ├── dragon/
│   │   ├── parrots/
│   │   └── items/
│   ├── audio/
│   │   ├── bgm/
│   │   └── sfx/
│   └── fonts/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 11. Dependencies

```json
{
  "dependencies": {
    "pixi.js": "^7.3.0",
    "howler": "^2.2.4",
    "@pixi/particle-emitter": "^5.0.8"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/howler": "^2.2.11",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0"
  }
}
```

## 12. Deployment Configuration

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  base: '/dragon-feeding-game/',
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['pixi.js'],
          audio: ['howler']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pixi.js', 'howler']
  }
});
```

### Performance Budget
- Initial bundle: < 500KB
- Lazy-loaded assets: < 2MB
- Time to Interactive: < 3s
- First Contentful Paint: < 1s

---

**Created**: 2026-03-03
**Status**: Design Complete
**Next Step**: Implementation phase (`/pdca do dragon-feeding-game`)