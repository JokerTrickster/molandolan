"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const adminMenus = [
  { href: "/admin/news", icon: "📰", label: "소식 관리", desc: "공지사항, 이벤트 등록/수정/삭제" },
  { href: "/admin/products", icon: "🛍️", label: "굿즈 관리", desc: "상품 등록/수정/삭제" },
  { href: "/admin/gallery", icon: "📷", label: "갤러리 관리", desc: "부적절한 게시물 삭제" },
  { href: "/admin/rankings", icon: "🏆", label: "랭킹 관리", desc: "부정 기록 삭제" },
];

export default function AdminPage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      router.replace("/login");
    }
  }, [isLoggedIn, isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <div className="px-4 pt-6 pb-6">
      <h1 className="text-xl font-black text-foreground">관리자 페이지</h1>
      <p className="text-xs text-muted mt-1">콘텐츠를 관리할 수 있습니다</p>

      <div className="mt-6 space-y-3">
        {adminMenus.map((menu) => (
          <Link key={menu.href} href={menu.href} className="block">
            <div className="bg-card-bg rounded-2xl border border-card-border p-4 hover:shadow-md transition-shadow active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{menu.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{menu.label}</h3>
                  <p className="text-xs text-muted mt-0.5">{menu.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-muted">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
