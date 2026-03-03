export class GameLoop {
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;
  private updateCallback: (deltaTime: number) => void;
  private renderCallback: () => void;

  constructor(
    updateCallback: (deltaTime: number) => void,
    renderCallback: () => void
  ) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
    }
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    if (!this.isPaused) {
      // Cap delta time to prevent large jumps
      const cappedDelta = Math.min(deltaTime, 0.1);

      this.updateCallback(cappedDelta);
      this.renderCallback();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  public get running(): boolean {
    return this.isRunning;
  }

  public get paused(): boolean {
    return this.isPaused;
  }
}