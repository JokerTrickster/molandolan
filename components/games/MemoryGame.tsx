"use client";

import { useState, useEffect, useCallback } from "react";

const EMOJIS = ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁"];

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

function createCards(): Card[] {
  const pairs = shuffleArray(EMOJIS).slice(0, 8);
  const cards = [...pairs, ...pairs].map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
  return shuffleArray(cards);
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);

  const initGame = useCallback(() => {
    setCards(createCards());
    setSelected([]);
    setMoves(0);
    setMatchedCount(0);
    setGameStarted(false);
    setGameOver(false);
    setTimer(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (matchedCount === 8 && matchedCount > 0) {
      setGameOver(true);
    }
  }, [matchedCount]);

  const handleCardClick = (index: number) => {
    if (selected.length === 2) return;
    if (cards[index].flipped || cards[index].matched) return;

    if (!gameStarted) setGameStarted(true);

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], flipped: true };
    setCards(newCards);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center justify-between bg-card-bg rounded-2xl border border-card-border p-3 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-muted">시간</div>
          <div className="text-sm font-bold text-foreground">{formatTime(timer)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">시도</div>
          <div className="text-sm font-bold text-foreground">{moves}회</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted">매칭</div>
          <div className="text-sm font-bold text-primary">{matchedCount}/8</div>
        </div>
        <button
          onClick={initGame}
          className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          다시하기
        </button>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform ${
              card.matched
                ? "bg-green-100 border-2 border-green-400 scale-95"
                : card.flipped
                ? "bg-white border-2 border-primary shadow-md"
                : "bg-gradient-to-br from-primary to-secondary shadow-sm hover:shadow-md active:scale-95"
            }`}
            disabled={card.matched}
          >
            {card.flipped || card.matched ? (
              card.emoji
            ) : (
              <span className="text-white text-lg font-bold">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-3xl p-8 text-center w-full max-w-xs shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-black text-foreground">축하합니다!</h2>
            <p className="text-sm text-muted mt-2">모든 카드를 맞추셨습니다!</p>
            <div className="flex justify-center gap-6 mt-4">
              <div>
                <div className="text-xs text-muted">시간</div>
                <div className="text-lg font-bold text-primary">{formatTime(timer)}</div>
              </div>
              <div>
                <div className="text-xs text-muted">시도</div>
                <div className="text-lg font-bold text-primary">{moves}회</div>
              </div>
            </div>
            <button
              onClick={initGame}
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
