import { newsData } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";

export default function NewsPage() {
  return (
    <div>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-black text-foreground">모란도란 소식</h1>
        <p className="text-xs text-muted mt-1">최신 소식과 이벤트를 확인하세요</p>
      </div>

      <div className="px-4 space-y-3 pb-8">
        {newsData.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
