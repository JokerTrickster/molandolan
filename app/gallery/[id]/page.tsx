import { galleryData, galleryComments } from "@/data/gallery";
import { notFound } from "next/navigation";
import Link from "next/link";
import GalleryDetail from "@/components/gallery/GalleryDetail";

export function generateStaticParams() {
  return galleryData.map((post) => ({ id: post.id }));
}

export default async function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = galleryData.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  const comments = galleryComments[id] || [];

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

      <GalleryDetail post={post} comments={comments} />
    </div>
  );
}
