"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { productsData, Product } from "@/data/products";
import Link from "next/link";

export default function AdminProductsPage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Product[]>(productsData);

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
          <h1 className="text-xl font-black text-foreground mt-1">굿즈 관리</h1>
        </div>
        <Link
          href="/admin/products/write"
          className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          새 굿즈 등록
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card-bg rounded-xl border border-card-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl">{item.image}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-primary font-bold">{item.price.toLocaleString()}원</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link
                  href={`/admin/products/write?id=${item.id}`}
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
