"use client";

import { useRef, useEffect } from "react";

export default function PixiGameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    let destroyed = false;

    (async () => {
      const { Game } = await import("~/core/Game");
      if (destroyed) return;

      const game = new Game({ backgroundColor: 0x667eea });
      gameRef.current = game;
      await game.init(containerRef.current!);
      if (destroyed) {
        game.destroy();
        return;
      }
      game.start();
    })();

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden bg-[#667EEA]"
      style={{ aspectRatio: "3/4", maxHeight: "70vh" }}
    />
  );
}
