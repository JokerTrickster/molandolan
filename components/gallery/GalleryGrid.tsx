import Link from "next/link";
import { GalleryPost } from "@/data/gallery";

export default function GalleryGrid({ posts }: { posts: GalleryPost[] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <Link key={post.id} href={`/gallery/${post.id}`} className="block">
          <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-4xl relative group hover:opacity-90 transition-opacity rounded-lg overflow-hidden">
            {post.imageUrl}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white text-xs font-bold flex gap-3">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
