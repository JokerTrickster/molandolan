"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const EMOJIS = ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐯", "🐸", "🐵", "🐮"];

const ROUND_CONFIGS = [
  { round: 1, pairs: 6, revealTime: 5 },
  { round: 2, pairs: 6, revealTime: 4 },
  { round: 3, pairs: 8, revealTime: 3 },
  { round: 4, pairs: 8, revealTime: 2 },
  { round: 5, pairs: 8, revealTime: 2 },
];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createCards(pairCount: number): Card[] {
  const pairs = shuffleArray(EMOJIS).slice(0, pairCount);
  const cards = [...pairs, ...pairs].map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
  return shuffleArray(cards);
}

export default function MemoryGame() {
  const [currentRound, setCurrentRound] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalTime, setTotalTime] = useState(0);
  const [roundTimer, setRoundTimer] = useState(0);
  const [phase, setPhase] = useState<"idle" | "reveal" | "playing" | "roundClear" | "gameOver" | "gameClear">("idle");
  const [revealCountdown, setRevealCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  const config = ROUND_CONFIGS[currentRound];
  const totalRounds = ROUND_CONFIGS.length;

  const startRound = useCallback((roundIdx: number) => {
    const cfg = ROUND_CONFIGS[roundIdx];
    const newCards = createCards(cfg.pairs);
    setCards(newCards.map((c) => ({ ...c, flipped: true })));
    setSelected([]);
    setMatchedCount(0);
    setRevealCountdown(cfg.revealTime);
    setPhase("reveal");
    setRoundTimer(0);
  }, []);

  const startGame = useCallback(() => {
    setCurrentRound(0);
    setLives(3);
    setTotalTime(0);
    startTimeRef.current = Date.now();
    startRound(0);
  }, [startRound]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (phase !== "reveal") return;
    if (revealCountdown <= 0) {
      setCards((prev) => prev.map((c) => (c.matched ? c : { ...c, flipped: false })));
      setPhase("playing");
      return;
    }
    const t = setTimeout(() => setRevealCountdown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, revealCountdown]);

  useEffect(() => {
    if (phase !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setRoundTimer((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (matchedCount === config.pairs) {
      const elapsed = Date.now() - startTimeRef.current;
      setTotalTime(elapsed);

      if (currentRound < totalRounds - 1) {
        setPhase("roundClear");
      } else {
        setPhase("gameClear");
      }
    }
  }, [matchedCount, config, currentRound, totalRounds, phase]);

  useEffect(() => {
    if (lives <= 0 && phase === "playing") {
      setTotalTime(Date.now() - startTimeRef.current);
      setPhase("gameOver");
    }
  }, [lives, phase]);

  const handleCardClick = (index: number) => {
    if (phase !== "playing") return;
    if (selected.length === 2) return;
    if (cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], flipped: true };
    setCards(newCards);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, matched: true } : card
            )
          );
          setMatchedCount((c) => c + 1);
          setSelected([]);
        }, 400);
      } else {
        setLives((l) => l - 1);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, flipped: false } : card
            )
          );
          setSelected([]);
        }, 800);
      }
    }
  };

  const handleNextRound = () => {
    const next = currentRound + 1;
    setCurrentRound(next);
    startRound(next);
  };

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const gridCols = config.pairs <= 6 ? "grid-cols-4" : "grid-cols-4";

  return (
    <div>
      <div className="flex items-center justify-between bg-card-bg rounded-2xl border border-card-border p-3 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-muted">라운드</div>
          <div className="text-sm font-bold text-foreground">{currentRound + 1}/{totalRounds}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">목숨</div>
          <div className="text-sm font-bold text-red-500">{"❤️".repeat(Math.max(0, lives))}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">매칭</div>
          <div className="text-sm font-bold text-primary">{matchedCount}/{config.pairs}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">시간</div>
          <div className="text-sm font-bold text-foreground">{formatMs(totalTime || (Date.now() - startTimeRef.current))}</div>
        </div>
      </div>

      {phase === "reveal" && (
        <div className="text-center mb-3">
          <span className="inline-block bg-amber-100 text-amber-800 text-sm font-bold px-4 py-1.5 rounded-full">
            카드를 기억하세요! {revealCountdown}초
          </span>
        </div>
      )}

      <div className={`grid ${gridCols} gap-2`}>
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={phase !== "playing" || card.matched}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform ${
              card.matched
                ? "bg-green-100 border-2 border-green-400 scale-95"
                : card.flipped
                ? "bg-white border-2 border-primary shadow-md"
                : "bg-gradient-to-br from-primary to-secondary shadow-sm hover:shadow-md active:scale-95"
            }`}
          >
            {card.flipped || card.matched ? (
              card.emoji
            ) : (
              <span className="text-white text-lg font-bold">?</span>
            )}
          </button>
        ))}
      </div>

      {phase === "roundClear" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-3xl p-8 text-center w-full max-w-xs shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-black text-foreground">라운드 {currentRound + 1} 클리어!</h2>
            <p className="text-sm text-muted mt-2">다음 라운드로 넘어갑니다</p>
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
              <div className="text-2xl font-bold text-primary">{formatMs(totalTime)}</div>
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
            <div className="text-5xl mb-3">💔</div>
            <h2 className="text-xl font-black text-foreground">게임 오버</h2>
            <p className="text-sm text-muted mt-2">라운드 {currentRound + 1}에서 탈락했습니다</p>
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
