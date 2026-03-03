import { Parrot } from '../entities/Parrot';
import { DifficultyLevel, ShuffleSequence, MovementData, RoundConfig } from '../types';
import gsap from 'gsap';

export class ShuffleEngine {
  private difficulty: DifficultyLevel;
  private duration: number = 15;
  private isShuffling: boolean = false;
  private shuffleTimeline: gsap.core.Timeline | null = null;
  private roundConfig: RoundConfig | null = null;

  constructor(difficulty: DifficultyLevel = DifficultyLevel.NORMAL) {
    this.difficulty = difficulty;
  }

  public setDifficulty(difficulty: DifficultyLevel): void {
    this.difficulty = difficulty;
  }

  public setRoundConfig(config: RoundConfig): void {
    this.roundConfig = config;
    this.duration = config.shuffleDuration;
  }

  public async executeShuffle(parrots: Parrot[]): Promise<void> {
    this.isShuffling = true;

    const sequence = this.generateShuffleSequence(parrots);
    await this.performShuffle(parrots, sequence);

    this.isShuffling = false;
  }

  private generateShuffleSequence(parrots: Parrot[]): ShuffleSequence {
    const movements: MovementData[] = [];
    let totalTime = 0;

    const settings = this.getDifficultySettings();
    const swapInterval = this.duration / settings.numberOfSwaps;

    for (let i = 0; i < settings.numberOfSwaps; i++) {
      const swapPair = this.getRandomSwapPair(parrots.length);
      const duration = swapInterval * settings.shuffleSpeed;
      const delay = totalTime;

      // Create movement for first parrot
      movements.push({
        parrotId: swapPair[0],
        from: { ...parrots[swapPair[0]].data.position },
        to: { ...parrots[swapPair[1]].data.position },
        duration: duration,
        delay: delay,
        curve: this.difficulty === DifficultyLevel.HARD ? 'bezier' : 'arc'
      });

      // Create movement for second parrot
      movements.push({
        parrotId: swapPair[1],
        from: { ...parrots[swapPair[1]].data.position },
        to: { ...parrots[swapPair[0]].data.position },
        duration: duration,
        delay: delay,
        curve: this.difficulty === DifficultyLevel.HARD ? 'bezier' : 'arc'
      });

      // Update positions for next iteration
      const tempPos = parrots[swapPair[0]].data.position;
      parrots[swapPair[0]].data.position = parrots[swapPair[1]].data.position;
      parrots[swapPair[1]].data.position = tempPos;

      totalTime += duration * (1 - settings.overlapRatio);
    }

    return {
      movements,
      totalDuration: totalTime
    };
  }

  private async performShuffle(parrots: Parrot[], sequence: ShuffleSequence): Promise<void> {
    this.shuffleTimeline = gsap.timeline();

    // Group movements by time
    const movementsByTime = new Map<number, MovementData[]>();
    sequence.movements.forEach(movement => {
      const key = movement.delay;
      if (!movementsByTime.has(key)) {
        movementsByTime.set(key, []);
      }
      movementsByTime.get(key)!.push(movement);
    });

    // Execute movements
    movementsByTime.forEach((movements, startTime) => {
      movements.forEach(movement => {
        const parrot = parrots[movement.parrotId];

        if (movement.curve === 'arc') {
          const fromX = movement.from.x;
          const fromY = movement.from.y;
          const toX = movement.to.x;
          const toY = movement.to.y;

          const proxy = { t: 0 };
          this.shuffleTimeline!.to(proxy, {
            t: 1,
            duration: movement.duration,
            ease: "power2.inOut",
            onUpdate: () => {
              const t = proxy.t;
              parrot.position.x = fromX + (toX - fromX) * t;
              const arcHeight = Math.sin(t * Math.PI) * 60;
              parrot.position.y = fromY + (toY - fromY) * t - arcHeight;
              parrot.rotation = Math.sin(t * Math.PI * 2) * 0.3;
            }
          }, startTime);
        } else if (movement.curve === 'bezier') {
          const fromX = movement.from.x;
          const fromY = movement.from.y;
          const toX = movement.to.x;
          const toY = movement.to.y;
          const cpX = (fromX + toX) / 2;
          const cpY = (fromY + toY) / 2 - 50;

          const proxy = { t: 0 };
          this.shuffleTimeline!.to(proxy, {
            t: 1,
            duration: movement.duration,
            ease: "power2.inOut",
            onUpdate: () => {
              const t = proxy.t;
              const inv = 1 - t;
              parrot.position.x = inv * inv * fromX + 2 * inv * t * cpX + t * t * toX;
              parrot.position.y = inv * inv * fromY + 2 * inv * t * cpY + t * t * toY;
              parrot.rotation = Math.sin(t * Math.PI * 2) * 0.3;
            }
          }, startTime);
        } else {
          // Linear movement
          this.shuffleTimeline!.to(parrot.position, {
            x: movement.to.x,
            y: movement.to.y,
            duration: movement.duration,
            ease: "power2.inOut"
          }, startTime);
        }
      });
    });

    return new Promise((resolve) => {
      this.shuffleTimeline!.eventCallback('onComplete', () => {
        parrots.forEach(p => p.rotation = 0);
        resolve();
      });
    });
  }

  private getRandomSwapPair(count: number): [number, number] {
    const first = Math.floor(Math.random() * count);
    let second = Math.floor(Math.random() * count);

    while (second === first) {
      second = Math.floor(Math.random() * count);
    }

    return [first, second];
  }

  private getDifficultySettings() {
    // If we have a round config, use it
    if (this.roundConfig) {
      const baseSwaps = 8 + (this.roundConfig.complexityLevel * 3);
      return {
        shuffleSpeed: 1 / this.roundConfig.shuffleSpeed, // Invert for GSAP duration
        shuffleComplexity: this.roundConfig.complexityLevel * 2,
        numberOfSwaps: Math.min(baseSwaps, Math.floor(this.duration * 1.5)),
        overlapRatio: Math.min(0.4, this.roundConfig.complexityLevel * 0.1),
        visualAids: this.roundConfig.complexityLevel <= 1
      };
    }

    // Fallback to difficulty-based settings
    switch (this.difficulty) {
      case DifficultyLevel.EASY:
        return {
          shuffleSpeed: 1.2,
          shuffleComplexity: 3,
          numberOfSwaps: 10,
          overlapRatio: 0,
          visualAids: true
        };

      case DifficultyLevel.NORMAL:
        return {
          shuffleSpeed: 1.0,
          shuffleComplexity: 5,
          numberOfSwaps: 15,
          overlapRatio: 0.2,
          visualAids: false
        };

      case DifficultyLevel.HARD:
        return {
          shuffleSpeed: 0.8,
          shuffleComplexity: 8,
          numberOfSwaps: 20,
          overlapRatio: 0.4,
          visualAids: false
        };

      default:
        return {
          shuffleSpeed: 1.0,
          shuffleComplexity: 5,
          numberOfSwaps: 15,
          overlapRatio: 0.2,
          visualAids: false
        };
    }
  }

  public pause(): void {
    if (this.shuffleTimeline) {
      this.shuffleTimeline.pause();
    }
  }

  public resume(): void {
    if (this.shuffleTimeline) {
      this.shuffleTimeline.resume();
    }
  }

  public stop(): void {
    if (this.shuffleTimeline) {
      this.shuffleTimeline.kill();
      this.shuffleTimeline = null;
    }
    this.isShuffling = false;
  }

  public get shuffling(): boolean {
    return this.isShuffling;
  }
}