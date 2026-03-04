import { gamesData } from "@/data/games";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameRenderer from "@/components/games/GameRenderer";

export function generateStaticParams() {
  return gamesData.map((item) => ({ id: item.id }));
}

export default async function GamePlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = gamesData.find((item) => item.id === id);

  if (!game) {
    notFound();
  }

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/games"
          className="inline-flex items-center text-sm text-primary font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          게임 목록
        </Link>
      </div>

      <div className="px-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{game.icon}</span>
          <div>
            <h1 className="text-lg font-black text-foreground">{game.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                game.difficulty === "쉬움" ? "bg-green-100 text-green-700" :
                game.difficulty === "보통" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {game.difficulty}
              </span>
              <span className="text-[10px] text-muted">⏱ {game.playTime}</span>
            </div>
          </div>
        </div>

        <GameRenderer gameId={id} />
      </div>
    </div>
  );
}
