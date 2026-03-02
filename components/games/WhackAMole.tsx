"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const GAME_DURATION = 30;
const GRID_SIZE = 9;

interface Mole {
  index: number;
  type: "normal" | "golden";
  timestamp: number;
}

export default function WhackAMole() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [hitEffects, setHitEffects] = useState<Record<number, boolean>>({});
  const [highScore, setHighScore] = useState(0);
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const spawnMole = useCallback(() => {
    setMoles((prev) => {
      const occupied = new Set(prev.map((m) => m.index));
      const available = Array.from({ length: GRID_SIZE }, (_, i) => i).filter(
        (i) => !occupied.has(i)
      );
      if (available.length === 0) return prev;

      const randomIndex = available[Math.floor(Math.random() * available.length)];
      const isGolden = Math.random() < 0.15;
      const newMole: Mole = {
        index: randomIndex,
        type: isGolden ? "golden" : "normal",
        timestamp: Date.now(),
      };

      setTimeout(() => {
        setMoles((cur) => cur.filter((m) => m.timestamp !== newMole.timestamp));
      }, 1200 + Math.random() * 600);

      return [...prev, newMole];
    });
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setMoles([]);
    setHitEffects({});
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("over");
          setMoles([]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") {
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
      return;
    }
    spawnMole();
    moleTimerRef.current = setInterval(spawnMole, 700 + Math.random() * 400);
    return () => {
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    };
  }, [gameState, spawnMole]);

  useEffect(() => {
    if (gameState === "over" && score > highScore) {
      setHighScore(score);
    }
  }, [gameState, score, highScore]);

  const whackMole = (mole: Mole) => {
    const points = mole.type === "golden" ? 3 : 1;
    setScore((s) => s + points);
    setMoles((prev) => prev.filter((m) => m.timestamp !== mole.timestamp));

    setHitEffects((prev) => ({ ...prev, [mole.index]: true }));
    setTimeout(() => {
      setHitEffects((prev) => ({ ...prev, [mole.index]: false }));
    }, 300);
  };

  const getMoleAtIndex = (index: number): Mole | undefined => {
    return moles.find((m) => m.index === index);
  };

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center justify-between bg-card-bg rounded-2xl border border-card-border p-3 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-muted">시간</div>
          <div className={`text-sm font-bold ${timeLeft <= 5 ? "text-red-500" : "text-foreground"}`}>
            {timeLeft}초
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">점수</div>
          <div className="text-sm font-bold text-primary">{score}점</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">최고</div>
          <div className="text-sm font-bold text-accent">{highScore}점</div>
        </div>
        {gameState === "playing" ? (
          <div className="text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg animate-pulse">
            진행중!
          </div>
        ) : (
          <button
            onClick={startGame}
            className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            {gameState === "over" ? "다시하기" : "시작!"}
          </button>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: GRID_SIZE }).map((_, index) => {
          const mole = getMoleAtIndex(index);
          const hasHitEffect = hitEffects[index];

          return (
            <button
              key={index}
              onClick={() => mole && whackMole(mole)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all duration-150 relative overflow-hidden ${
                hasHitEffect
                  ? "bg-yellow-200 scale-95"
                  : mole
                  ? "bg-amber-100 border-2 border-amber-300 active:scale-90 shadow-md"
                  : "bg-amber-50 border-2 border-amber-200/50"
              }`}
              disabled={gameState !== "playing"}
            >
              {/* Hole */}
              <div className="absolute bottom-1 w-3/4 h-3 bg-amber-900/20 rounded-full" />

              {mole ? (
                <div className={`transition-transform duration-150 ${hasHitEffect ? "scale-0" : "animate-bounce"}`}>
                  {mole.type === "golden" ? (
                    <span className="relative">
                      👑
                      <span className="absolute -top-1 -right-1 text-[8px] bg-yellow-400 text-yellow-900 font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        3
                      </span>
                    </span>
                  ) : (
                    "🐹"
                  )}
                </div>
              ) : (
                <div className="text-2xl opacity-20">🕳️</div>
              )}

              {hasHitEffect && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-amber-600 animate-ping">💥</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-muted mt-3">
        🐹 일반 두더지: 1점 · 👑 황금 두더지: 3점
      </p>

      {/* Idle State */}
      {gameState === "idle" && (
        <div className="mt-6 text-center">
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-8 rounded-2xl text-base hover:opacity-90 transition-opacity active:scale-95"
          >
            게임 시작하기
          </button>
          <p className="text-xs text-muted mt-3">
            {GAME_DURATION}초 안에 최대한 많은 두더지를 잡으세요!
          </p>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === "over" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-3xl p-8 text-center w-full max-w-xs shadow-2xl">
            <div className="text-5xl mb-3">
              {score >= 20 ? "🏆" : score >= 10 ? "🎉" : "👏"}
            </div>
            <h2 className="text-xl font-black text-foreground">게임 종료!</h2>
            <div className="mt-4">
              <div className="text-3xl font-black text-primary">{score}점</div>
              {score >= highScore && score > 0 && (
                <div className="text-xs font-bold text-accent mt-1">🌟 최고 기록!</div>
              )}
            </div>
            <div className="mt-2 text-xs text-muted">
              {score >= 20
                ? "놀라운 실력이에요!"
                : score >= 10
                ? "잘했어요!"
                : "다시 도전해보세요!"}
            </div>
            <button
              onClick={startGame}
              className="mt-6 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              다시 플레이하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
