import Link from "next/link";
import { GameInfo } from "@/data/games";

export default function GameCard({ game }: { game: GameInfo }) {
  return (
    <Link href={`/games/${game.id}`} className="block">
      <article className="bg-card-bg rounded-2xl border border-card-border overflow-hidden hover:shadow-md transition-shadow active:scale-[0.98] transition-transform">
        <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center text-5xl`}>
          {game.icon}
        </div>
        <div className="p-4">
          <h3 className="text-base font-bold text-foreground">{game.title}</h3>
          <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              game.difficulty === "쉬움" ? "bg-green-100 text-green-700" :
              game.difficulty === "보통" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {game.difficulty}
            </span>
            <span className="text-[10px] text-muted">⏱ {game.playTime}</span>
          </div>
          <button className="w-full mt-3 bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            플레이하기
          </button>
        </div>
      </article>
    </Link>
  );
}
