import { galleryData } from "@/data/gallery";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import Link from "next/link";

export default function GalleryPage() {
  return (
    <div>
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">갤러리</h1>
          <p className="text-xs text-muted mt-1">모란도란 팬들의 작품과 일상을 공유하세요</p>
        </div>
        <Link
          href="/gallery/upload"
          className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          업로드
        </Link>
      </div>

      <div className="px-2 pb-6">
        <GalleryGrid posts={galleryData} />
      </div>
    </div>
  );
}
