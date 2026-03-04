import { Parrot } from '../entities/Parrot';
import { DifficultyLevel, ShuffleSequence, MovementData, RoundConfig } from '../types';
import gsap from 'gsap';

export class ShuffleEngine {
  private difficulty: DifficultyLevel;
  private duration: number = 15;
  private isShuffling: boolean = false;
  private shuffleTimeline: gsap.core.Timeline | null = null;
  private roundConfig: RoundConfig | null = null;
  private canvasHeight: number = 600;

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

  public setCanvasHeight(height: number): void {
    this.canvasHeight = height;
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

    for (let i = 0; i < settings.numberOfSwaps; i++) {
      const swapPair = this.getRandomSwapPair(parrots.length);
      const duration = settings.shuffleSpeed;
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

        const arcH = Math.min(80, this.canvasHeight * 0.12);

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
              parrot.position.y = fromY + (toY - fromY) * t - Math.sin(t * Math.PI) * arcH;
              parrot.rotation = Math.sin(t * Math.PI * 2) * 0.2;
            }
          }, startTime);
        } else if (movement.curve === 'bezier') {
          const fromX = movement.from.x;
          const fromY = movement.from.y;
          const toX = movement.to.x;
          const toY = movement.to.y;
          const cpX = (fromX + toX) / 2;
          const cpY = (fromY + toY) / 2 - arcH;

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
              parrot.rotation = Math.sin(t * Math.PI * 2) * 0.2;
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
    if (this.roundConfig) {
      const swapCounts: Record<number, number> = { 1: 4, 2: 6, 3: 7 };
      const numberOfSwaps = swapCounts[this.roundConfig.complexityLevel] ?? 9;
      const minSwapDuration = 0.8;
      const rawSpeed = this.duration / numberOfSwaps;
      const shuffleSpeed = Math.max(rawSpeed, minSwapDuration);
      const overlapRatio = this.roundConfig.complexityLevel <= 1 ? 0 : Math.min(0.2, (this.roundConfig.complexityLevel - 1) * 0.1);

      return {
        shuffleSpeed,
        shuffleComplexity: this.roundConfig.complexityLevel,
        numberOfSwaps,
        overlapRatio,
        visualAids: this.roundConfig.complexityLevel <= 1
      };
    }

    switch (this.difficulty) {
      case DifficultyLevel.EASY:
        return { shuffleSpeed: 1.5, shuffleComplexity: 1, numberOfSwaps: 4, overlapRatio: 0, visualAids: true };
      case DifficultyLevel.NORMAL:
        return { shuffleSpeed: 1.2, shuffleComplexity: 2, numberOfSwaps: 6, overlapRatio: 0.1, visualAids: false };
      case DifficultyLevel.HARD:
        return { shuffleSpeed: 1.0, shuffleComplexity: 3, numberOfSwaps: 9, overlapRatio: 0.2, visualAids: false };
      default:
        return { shuffleSpeed: 1.2, shuffleComplexity: 2, numberOfSwaps: 6, overlapRatio: 0.1, visualAids: false };
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