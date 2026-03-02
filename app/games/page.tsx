import { gamesData } from "@/data/games";
import GameCard from "@/components/games/GameCard";

export default function GamesPage() {
  return (
    <div>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-black text-foreground">플래시 게임</h1>
        <p className="text-xs text-muted mt-1">모바일에서 간편하게 즐기는 미니게임</p>
      </div>

      <div className="px-4 space-y-4 pb-6">
        {gamesData.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
