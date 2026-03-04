"use client";

import { useState } from "react";
import { GalleryPost, GalleryComment } from "@/data/gallery";

interface Props {
  post: GalleryPost;
  comments: GalleryComment[];
}

export default function GalleryDetail({ post, comments: initialComments }: Props) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: `new-${Date.now()}`,
        userId: "me",
        nickname: "나",
        content: newComment.trim(),
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewComment("");
  };

  return (
    <div className="px-4 pb-6">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 aspect-square rounded-2xl flex items-center justify-center text-8xl mb-4">
        {post.imageUrl}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <span className={`text-xl ${liked ? "scale-110" : ""} transition-transform`}>
            {liked ? "❤️" : "🤍"}
          </span>
          <span className={liked ? "text-red-500 font-bold" : "text-muted"}>
            {likeCount}
          </span>
        </button>
        <span className="text-sm text-muted">💬 {comments.length}</span>
      </div>

      <div className="mb-4">
        <span className="text-sm font-bold text-foreground">{post.nickname}</span>
        <span className="text-sm text-foreground ml-2">{post.caption}</span>
        <div className="text-xs text-muted mt-1">{post.createdAt}</div>
      </div>

      <div className="border-t border-card-border pt-4">
        <h3 className="text-sm font-bold text-foreground mb-3">댓글 {comments.length}개</h3>

        {comments.length === 0 && (
          <p className="text-xs text-muted">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
        )}

        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {comment.nickname[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{comment.nickname}</span>
                  <span className="text-[10px] text-muted">{comment.createdAt}</span>
                </div>
                <p className="text-xs text-foreground mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글 달기..."
            className="flex-1 px-3 py-2 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
}
