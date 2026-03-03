import { Game } from '@/core/Game';

// Initialize and start the game
async function init() {
  const container = document.getElementById('game-container');
  if (!container) {
    throw new Error('Game container not found');
  }

  try {
    // Update loading progress
    updateLoadingProgress(30);

    // Create game instance
    const game = new Game({
      backgroundColor: 0x667EEA,
      antialias: true,
    });

    updateLoadingProgress(60);

    // Initialize game
    await game.init(container);

    updateLoadingProgress(90);

    // Start game
    game.start();

    updateLoadingProgress(100);

    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        game.pause();
      } else {
        game.resume();
      }
    });

    // Handle cleanup on page unload
    window.addEventListener('beforeunload', () => {
      game.destroy();
    });

    console.log('Game started successfully!');
  } catch (error) {
    console.error('Failed to initialize game:', error);
    showErrorMessage('게임을 시작할 수 없습니다. 페이지를 새로고침해주세요.');
  }
}

function updateLoadingProgress(percent: number) {
  const progressBar = document.getElementById('loading-progress');
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
}

function showErrorMessage(message: string) {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.innerHTML = `
      <div style="color: #FF6B6B; text-align: center; padding: 20px;">
        <h2>오류 발생</h2>
        <p>${message}</p>
      </div>
    `;
  }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}