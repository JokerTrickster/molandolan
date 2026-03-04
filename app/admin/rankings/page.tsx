"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const mockRankings = [
  { id: "1", gameType: "앵무새", nickname: "프로게이머", time: "1:23", date: "2026-03-01" },
  { id: "2", gameType: "카드뒤집기", nickname: "기억왕", time: "2:45", date: "2026-02-28" },
  { id: "3", gameType: "숨은앵무새", nickname: "독수리눈", time: "3:12", date: "2026-02-27" },
  { id: "4", gameType: "앵무새", nickname: "치터의심", time: "0:03", date: "2026-02-26" },
  { id: "5", gameType: "카드뒤집기", nickname: "핵유저", time: "0:01", date: "2026-02-25" },
];

export default function AdminRankingsPage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace("/login");
  }, [isLoggedIn, isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <div className="px-4 pt-6 pb-6">
      <Link href="/admin" className="text-xs text-primary font-medium">← 관리자</Link>
      <h1 className="text-xl font-black text-foreground mt-1 mb-4">랭킹 관리</h1>
      <p className="text-xs text-muted mb-4">부정 의심 기록을 삭제할 수 있습니다</p>

      <div className="space-y-3">
        {mockRankings.map((item) => (
          <div key={item.id} className="bg-card-bg rounded-xl border border-card-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.gameType}
                  </span>
                  <span className="text-sm font-bold text-foreground">{item.nickname}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">기록: {item.time} · {item.date}</p>
              </div>
              <button
                onClick={() => alert("랭킹 기록이 삭제되었습니다. (API 연동 후 실제 삭제)")}
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
