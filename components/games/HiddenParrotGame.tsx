"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const ROUND_CONFIGS = [
  { round: 1, parrotCount: 3, timeLimit: 60 },
  { round: 2, parrotCount: 4, timeLimit: 50 },
  { round: 3, parrotCount: 5, timeLimit: 40 },
  { round: 4, parrotCount: 5, timeLimit: 30 },
  { round: 5, parrotCount: 6, timeLimit: 25 },
];

const SCENE_THEMES = [
  { bg: "from-green-200 to-emerald-300", label: "숲속", objects: ["🌳", "🌿", "🍃", "🌺", "🍄", "🪨", "🌻", "🦋", "🐛", "🐝", "🌾", "🪵", "🍀", "🌸"] },
  { bg: "from-blue-200 to-cyan-300", label: "바다", objects: ["🌊", "🐚", "🪸", "🦀", "⭐", "🐠", "🪼", "🦑", "🐙", "🫧", "🏖️", "⛵", "🐋", "🦈"] },
  { bg: "from-amber-200 to-yellow-300", label: "사막", objects: ["🌵", "🏜️", "🦎", "🐪", "☀️", "🪨", "🦂", "🏺", "💎", "⛰️", "🌾", "🐍", "🪶", "🏔️"] },
  { bg: "from-purple-200 to-pink-300", label: "우주", objects: ["⭐", "🌙", "🪐", "🚀", "☄️", "🛸", "🌌", "💫", "✨", "🌑", "🛰️", "🌠", "🔭", "👽"] },
  { bg: "from-orange-200 to-red-300", label: "마을", objects: ["🏠", "🏡", "🌲", "🚗", "📮", "🚲", "🏪", "🎪", "🎭", "🧱", "🪟", "🚪", "🪴", "🏘️"] },
];

interface HiddenObject {
  id: number;
  x: number;
  y: number;
  found: boolean;
  isParrot: boolean;
}

function generatePositions(count: number, totalDecoys: number): HiddenObject[] {
  const objects: HiddenObject[] = [];
  const positions: { x: number; y: number }[] = [];

  const getRandomPos = () => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const x = 8 + Math.random() * 84;
      const y = 8 + Math.random() * 84;
      const tooClose = positions.some(
        (p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10
      );
      if (!tooClose) return { x, y };
    }
    return { x: Math.random() * 90 + 5, y: Math.random() * 90 + 5 };
  };

  for (let i = 0; i < count; i++) {
    const pos = getRandomPos();
    positions.push(pos);
    objects.push({ id: i, ...pos, found: false, isParrot: true });
  }

  for (let i = 0; i < totalDecoys; i++) {
    const pos = getRandomPos();
    positions.push(pos);
    objects.push({ id: count + i, ...pos, found: false, isParrot: false });
  }

  return objects;
}

export default function HiddenParrotGame() {
  const [currentRound, setCurrentRound] = useState(0);
  const [objects, setObjects] = useState<HiddenObject[]>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<"idle" | "playing" | "roundClear" | "gameOver" | "gameClear">("idle");
  const [wrongTap, setWrongTap] = useState<{ x: number; y: number } | null>(null);
  const [sceneTheme, setSceneTheme] = useState(0);
  const startTimeRef = useRef(0);
  const totalTimeRef = useRef(0);

  const config = ROUND_CONFIGS[currentRound];

  const startRound = useCallback((roundIdx: number) => {
    const cfg = ROUND_CONFIGS[roundIdx];
    const decoyCount = 8 + roundIdx * 2;
    setObjects(generatePositions(cfg.parrotCount, decoyCount));
    setFoundCount(0);
    setTimeLeft(cfg.timeLimit);
    setSceneTheme(roundIdx % SCENE_THEMES.length);
    setPhase("playing");
    if (roundIdx === 0) {
      startTimeRef.current = Date.now();
      totalTimeRef.current = 0;
    }
  }, []);

  const startGame = useCallback(() => {
    setCurrentRound(0);
    startRound(0);
  }, [startRound]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      totalTimeRef.current = Date.now() - startTimeRef.current;
      setPhase("gameOver");
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (foundCount === config.parrotCount) {
      totalTimeRef.current = Date.now() - startTimeRef.current;
      if (currentRound < ROUND_CONFIGS.length - 1) {
        setPhase("roundClear");
      } else {
        setPhase("gameClear");
      }
    }
  }, [foundCount, config, currentRound, phase]);

  const handleTap = (obj: HiddenObject) => {
    if (phase !== "playing" || obj.found) return;

    if (obj.isParrot) {
      setObjects((prev) =>
        prev.map((o) => (o.id === obj.id ? { ...o, found: true } : o))
      );
      setFoundCount((c) => c + 1);
    } else {
      setWrongTap({ x: obj.x, y: obj.y });
      setTimeLeft((t) => Math.max(0, t - 3));
      setTimeout(() => setWrongTap(null), 500);
    }
  };

  const handleNextRound = () => {
    const next = currentRound + 1;
    setCurrentRound(next);
    startRound(next);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const formatMs = (ms: number) => formatTime(Math.floor(ms / 1000));

  const theme = SCENE_THEMES[sceneTheme];

  return (
    <div>
      <div className="flex items-center justify-between bg-card-bg rounded-2xl border border-card-border p-3 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-muted">라운드</div>
          <div className="text-sm font-bold text-foreground">{currentRound + 1}/{ROUND_CONFIGS.length}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">발견</div>
          <div className="text-sm font-bold text-primary">🦜 {foundCount}/{config.parrotCount}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">남은 시간</div>
          <div className={`text-sm font-bold ${timeLeft <= 10 ? "text-red-500" : "text-foreground"}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">장소</div>
          <div className="text-sm font-bold text-foreground">{theme.label}</div>
        </div>
      </div>

      <div className="text-center mb-2">
        <span className="text-xs text-muted">숨어있는 🦜 앵무새를 찾으세요! 다른 것을 누르면 -3초</span>
      </div>

      <div
        className={`relative w-full aspect-square rounded-2xl bg-gradient-to-br ${theme.bg} border-2 border-white/50 overflow-hidden select-none`}
      >
        {objects.map((obj) => (
          <button
            key={obj.id}
            onClick={() => handleTap(obj)}
            disabled={obj.found || phase !== "playing"}
            className={`absolute text-2xl transition-all duration-300 ${
              obj.found
                ? "scale-125 opacity-100"
                : "hover:scale-110 active:scale-90"
            }`}
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: obj.isParrot && obj.found ? 1 : undefined,
            }}
          >
            {obj.isParrot ? (
              obj.found ? (
                <span className="inline-block animate-bounce">🦜</span>
              ) : (
                <span className="inline-block opacity-40 text-xl" style={{ filter: "hue-rotate(90deg) saturate(0.3)" }}>
                  🦜
                </span>
              )
            ) : (
              <span className="inline-block text-xl opacity-70">
                {theme.objects[obj.id % theme.objects.length]}
              </span>
            )}
          </button>
        ))}

        {wrongTap && (
          <div
            className="absolute text-red-500 font-bold text-lg animate-ping pointer-events-none"
            style={{ left: `${wrongTap.x}%`, top: `${wrongTap.y}%`, transform: "translate(-50%, -50%)" }}
          >
            ✕
          </div>
        )}
      </div>

      {phase === "roundClear" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-3xl p-8 text-center w-full max-w-xs shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-black text-foreground">라운드 {currentRound + 1} 클리어!</h2>
            <p className="text-sm text-muted mt-2">{config.parrotCount}마리 앵무새를 모두 찾았습니다!</p>
            <button
              onClick={handleNextRound}
              className="mt-6 w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              다음 라운드
            </button>
          </div>
        </div>
      )}

      {phase === "gameClear" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-3xl p-8 text-center w-full max-w-xs shadow-2xl">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-xl font-black text-foreground">전체 클리어!</h2>
            <p className="text-sm text-muted mt-2">5라운드를 모두 통과했습니다!</p>
            <div className="mt-4">
              <div className="text-xs text-muted">총 클리어 시간</div>
              <div className="text-2xl font-bold text-primary">{formatMs(totalTimeRef.current)}</div>
            </div>
            <button
              onClick={startGame}
              className="mt-6 w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              다시 플레이하기
            </button>
          </div>
        </div>
      )}

      {phase === "gameOver" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-3xl p-8 text-center w-full max-w-xs shadow-2xl">
            <div className="text-5xl mb-3">⏰</div>
            <h2 className="text-xl font-black text-foreground">시간 초과!</h2>
            <p className="text-sm text-muted mt-2">라운드 {currentRound + 1}에서 시간이 다 됐습니다</p>
            <button
              onClick={startGame}
              className="mt-6 w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              다시 플레이하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
