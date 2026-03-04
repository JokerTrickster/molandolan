"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { newsData, NewsItem } from "@/data/news";
import Link from "next/link";

export default function AdminNewsPage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>(newsData);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace("/login");
  }, [isLoggedIn, isAdmin, router]);

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/admin" className="text-xs text-primary font-medium">← 관리자</Link>
          <h1 className="text-xl font-black text-foreground mt-1">소식 관리</h1>
        </div>
        <Link
          href="/admin/news/write"
          className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          새 소식 등록
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card-bg rounded-xl border border-card-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-foreground mt-1 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-muted mt-0.5">{item.date}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link
                  href={`/admin/news/write?id=${item.id}`}
                  className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg"
                >
                  수정
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
