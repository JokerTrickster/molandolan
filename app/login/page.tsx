"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim()) {
      setError("닉네임과 비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await login(nickname.trim(), password);
      if (success) {
        router.push("/");
      } else {
        setError("로그인에 실패했습니다");
      }
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pt-12 pb-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎮</div>
        <h1 className="text-2xl font-black text-foreground">모란도란 로그인</h1>
        <p className="text-sm text-muted mt-1">게임 랭킹 등록, 갤러리 업로드를 위해 로그인하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-bold text-foreground mb-1.5">닉네임</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-foreground mb-1.5">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
          홈으로 돌아가기
        </Link>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-xs text-amber-800 font-medium">테스트 계정</p>
        <p className="text-xs text-amber-700 mt-1">관리자: admin / admin</p>
        <p className="text-xs text-amber-700">일반 사용자: 아무 닉네임 / 아무 비밀번호</p>
      </div>
    </div>
  );
}
