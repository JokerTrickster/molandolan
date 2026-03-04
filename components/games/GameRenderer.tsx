"use client";

import dynamic from "next/dynamic";
import MemoryGame from "@/components/games/MemoryGame";
import HiddenParrotGame from "@/components/games/HiddenParrotGame";

const PixiGameCanvas = dynamic(
  () => import("@/components/games/PixiGameCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-muted text-sm">게임 로딩중...</span>
      </div>
    ),
  }
);

export default function GameRenderer({ gameId }: { gameId: string }) {
  if (gameId === "parrot-seed") return <PixiGameCanvas />;
  if (gameId === "memory") return <MemoryGame />;
  if (gameId === "hidden-parrot") return <HiddenParrotGame />;
  return <p className="text-sm text-muted">알 수 없는 게임입니다.</p>;
}
