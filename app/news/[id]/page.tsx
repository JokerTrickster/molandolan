import { newsData } from "@/data/news";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return newsData.map((item) => ({ id: item.id }));
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = newsData.find((item) => item.id === id);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/news"
          className="inline-flex items-center text-sm text-primary font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          소식 목록
        </Link>
      </div>

      <article className="px-4 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {article.category}
          </span>
          <time className="text-[10px] text-muted">{article.date}</time>
        </div>

        <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center text-6xl mb-4">
          {article.thumbnail}
        </div>

        <h1 className="text-xl font-black text-foreground leading-tight">
          {article.title}
        </h1>

        <p className="text-sm text-muted mt-2 leading-relaxed">
          {article.summary}
        </p>

        <div className="mt-6 border-t border-card-border pt-6">
          {article.content.split("\n").map((paragraph, i) => (
            <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-3">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
