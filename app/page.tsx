import Link from "next/link";
import { newsData } from "@/data/news";
import { productsData } from "@/data/products";
import { gamesData } from "@/data/games";
import { galleryData } from "@/data/gallery";
import NewsCard from "@/components/news/NewsCard";
import ProductCard from "@/components/shop/ProductCard";
import GameCard from "@/components/games/GameCard";

export default function Home() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary via-purple-600 to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8 text-6xl animate-bounce" style={{ animationDelay: "0s" }}>🎮</div>
          <div className="absolute top-12 right-6 text-4xl animate-bounce" style={{ animationDelay: "0.3s" }}>⭐</div>
          <div className="absolute bottom-8 left-12 text-5xl animate-bounce" style={{ animationDelay: "0.6s" }}>🎪</div>
          <div className="absolute bottom-4 right-10 text-3xl animate-bounce" style={{ animationDelay: "0.9s" }}>🎯</div>
        </div>
        <div className="relative px-6 py-12 text-center text-white">
          <h1 className="text-3xl font-black tracking-tight">모란도란</h1>
          <p className="text-sm mt-2 text-white/80 font-medium">
            소식 · 굿즈 · 미니게임을 한곳에서!
          </p>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="px-4 -mt-5 relative z-10">
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/news", icon: "📰", label: "소식", bg: "bg-violet-50" },
            { href: "/shop", icon: "🛍️", label: "굿즈", bg: "bg-pink-50" },
            { href: "/games", icon: "🎮", label: "게임", bg: "bg-amber-50" },
            { href: "/gallery", icon: "📷", label: "갤러리", bg: "bg-teal-50" },
          ].map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`${cat.bg} rounded-2xl p-4 flex flex-col items-center gap-1.5 border border-card-border hover:shadow-md transition-shadow active:scale-95 transition-transform`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-bold text-foreground">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="px-4 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-foreground">최신 소식</h2>
          <Link href="/news" className="text-xs font-semibold text-primary">
            더보기 →
          </Link>
        </div>
        <div className="space-y-3">
          {newsData.slice(0, 3).map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Popular Goods */}
      <section className="px-4 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-foreground">인기 굿즈</h2>
          <Link href="/shop" className="text-xs font-semibold text-primary">
            더보기 →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {productsData
            .filter((p) => p.inStock)
            .slice(0, 4)
            .map((product) => (
              <div key={product.id} className="w-40 shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      </section>

      {/* Mini Games */}
      <section className="px-4 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-foreground">미니 게임</h2>
          <Link href="/games" className="text-xs font-semibold text-primary">
            더보기 →
          </Link>
        </div>
        <div className="space-y-3">
          {gamesData.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="px-4 mt-8 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-foreground">갤러리</h2>
          <Link href="/gallery" className="text-xs font-semibold text-primary">
            더보기 →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
          {galleryData.slice(0, 6).map((post) => (
            <Link key={post.id} href={`/gallery/${post.id}`}>
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-3xl hover:opacity-80 transition-opacity">
                {post.imageUrl}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
