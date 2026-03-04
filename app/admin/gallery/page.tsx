"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { galleryData, GalleryPost } from "@/data/gallery";
import Link from "next/link";

export default function AdminGalleryPage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<GalleryPost[]>(galleryData);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace("/login");
  }, [isLoggedIn, isAdmin, router]);

  const handleDelete = (id: string) => {
    if (confirm("이 게시물을 삭제하시겠습니까?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="px-4 pt-6 pb-6">
      <Link href="/admin" className="text-xs text-primary font-medium">← 관리자</Link>
      <h1 className="text-xl font-black text-foreground mt-1 mb-4">갤러리 관리</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card-bg rounded-xl border border-card-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl">{item.imageUrl}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.caption}</h3>
                  <p className="text-xs text-muted">{item.nickname} · {item.createdAt}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg shrink-0"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
