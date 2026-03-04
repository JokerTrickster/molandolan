"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminProductWritePage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("인형");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace("/login");
  }, [isLoggedIn, isAdmin, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("굿즈가 등록되었습니다. (API 연동 후 실제 저장)");
    router.push("/admin/products");
  };

  if (!isAdmin) return null;

  return (
    <div className="px-4 pt-6 pb-6">
      <Link href="/admin/products" className="text-xs text-primary font-medium">← 굿즈 관리</Link>
      <h1 className="text-xl font-black text-foreground mt-2 mb-4">굿즈 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">상품명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="상품 이름"
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>인형</option>
            <option>악세서리</option>
            <option>생활용품</option>
            <option>문구</option>
            <option>의류</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">가격 (원)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">상품 이미지</label>
          <div className="border-2 border-dashed border-card-border rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <div className="text-3xl mb-1">📷</div>
            <p className="text-xs text-muted">탭하여 이미지 선택</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상품 설명을 작성하세요..."
            rows={5}
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
