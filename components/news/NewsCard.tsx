import Link from "next/link";
import { NewsItem } from "@/data/news";

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.id}`} className="block">
      <article className="bg-card-bg rounded-2xl border border-card-border p-4 hover:shadow-md transition-shadow active:scale-[0.98] transition-transform">
        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
            {item.thumbnail}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1">
              {item.category}
            </span>
            <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
            <time className="text-[10px] text-muted/60 mt-1 block">{item.date}</time>
          </div>
        </div>
      </article>
    </Link>
  );
}
