// src/components/GameCanvas.tsx
import { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import { CHAR, RENDER_CONFIG } from '../engine/constants';

interface GameCanvasProps {
  gameState: GameState | null;
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { tileSize } = RENDER_CONFIG;
    const width = gameState.map[0]?.length || 16;
    const height = gameState.map.length || 16;

    canvas.width = width * tileSize;
    canvas.height = height * tileSize;

    ctx.fillStyle = RENDER_CONFIG.floorColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = gameState.map[y]?.[x] || CHAR.EMPTY;
        const posX = x * tileSize;
        const posY = y * tileSize;

        ctx.fillStyle = RENDER_CONFIG.floorColor;
        ctx.fillRect(posX, posY, tileSize, tileSize);
        ctx.strokeStyle = '#3a3a5a';
        ctx.strokeRect(posX, posY, tileSize, tileSize);

        switch (char) {
          case CHAR.WALL:
            ctx.fillStyle = RENDER_CONFIG.wallColor;
            ctx.fillRect(posX + 2, posY + 2, tileSize - 4, tileSize - 4);
            break;

          case CHAR.TARGET:
            ctx.fillStyle = RENDER_CONFIG.targetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
            ctx.fill();
            break;

          case CHAR.BOX:
            ctx.fillStyle = RENDER_CONFIG.boxColor;
            ctx.fillRect(posX + 4, posY + 4, tileSize - 8, tileSize - 8);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(posX + 6, posY + 6, tileSize - 12, tileSize - 12);
            break;

          case CHAR.PLAYER:
            ctx.fillStyle = RENDER_CONFIG.playerColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
            ctx.fill();
            break;

          case CHAR.BOX_ON_TARGET:
            ctx.fillStyle = RENDER_CONFIG.targetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = RENDER_CONFIG.boxOnTargetColor;
            ctx.fillRect(posX + 4, posY + 4, tileSize - 8, tileSize - 8);
            break;

          case CHAR.PLAYER_ON_TARGET:
            ctx.fillStyle = RENDER_CONFIG.targetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = RENDER_CONFIG.playerOnTargetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      }
    }
  }, [gameState]);

  if (!gameState) {
    return <div className="text-center p-10 text-sky-400 text-xl">Loading...</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      className="block mx-auto border-2 border-slate-600 rounded"
      style={{ maxWidth: '100%' }}
    />
  );
}
