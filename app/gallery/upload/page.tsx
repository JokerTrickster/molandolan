"use client";

import { useState } from "react";
import Link from "next/link";

export default function GalleryUploadPage() {
  const [caption, setCaption] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="px-4 pt-12 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-black text-foreground">업로드 완료!</h2>
        <p className="text-sm text-muted mt-2">갤러리에 게시되었습니다.</p>
        <Link
          href="/gallery"
          className="inline-block mt-6 bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-3 rounded-2xl"
        >
          갤러리로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/gallery"
          className="inline-flex items-center text-sm text-primary font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          갤러리
        </Link>
      </div>

      <div className="px-4 pb-6">
        <h1 className="text-lg font-black text-foreground mb-4">새 게시물 업로드</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">이미지 / 동영상</label>
            <div className="border-2 border-dashed border-card-border rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm text-muted">탭하여 파일을 선택하세요</p>
              <p className="text-xs text-muted mt-1">JPG, PNG, MP4 (최대 10MB)</p>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label htmlFor="caption" className="block text-sm font-bold text-foreground mb-2">설명</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="게시물에 대한 설명을 작성하세요..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
          >
            업로드하기
          </button>
        </form>
      </div>
    </div>
  );
}
