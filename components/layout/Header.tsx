"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-card-border">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            모란도란
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">
                {user?.nickname}
                {isAdmin && (
                  <span className="ml-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">관리자</span>
                )}
              </span>
              <button
                onClick={logout}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
            >
              로그인
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="메뉴"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-card-border shadow-lg">
          <nav className="max-w-md mx-auto py-2">
            {[
              { href: "/", label: "홈" },
              { href: "/news", label: "모란도란 소식" },
              { href: "/shop", label: "굿즈판매" },
              { href: "/games", label: "미니 게임" },
              { href: "/gallery", label: "갤러리" },
              ...(isAdmin ? [{ href: "/admin", label: "관리자 페이지" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
