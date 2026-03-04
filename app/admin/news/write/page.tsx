"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminNewsWritePage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("소식");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace("/login");
  }, [isLoggedIn, isAdmin, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("소식이 등록되었습니다. (API 연동 후 실제 저장)");
    router.push("/admin/news");
  };

  if (!isAdmin) return null;

  return (
    <div className="px-4 pt-6 pb-6">
      <Link href="/admin/news" className="text-xs text-primary font-medium">← 소식 관리</Link>
      <h1 className="text-xl font-black text-foreground mt-2 mb-4">소식 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>소식</option>
            <option>업데이트</option>
            <option>이벤트</option>
            <option>굿즈</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="소식 제목"
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">요약</label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="한 줄 요약"
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">썸네일 (이모지)</label>
          <input
            type="text"
            defaultValue="📰"
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="소식 내용을 작성하세요..."
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
        >
          등록하기
        </button>
      </form>
    </div>
  );
}
