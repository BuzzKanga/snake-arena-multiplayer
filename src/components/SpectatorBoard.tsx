import { useEffect, useRef } from 'react';
import { GameState, Position } from '@/lib/gameEngine';

interface SpectatorBoardProps {
  gameState: GameState;
  username: string;
  cellSize?: number;
}

export function SpectatorBoard({ gameState, username, cellSize = 15 }: SpectatorBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--game-grid))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'hsl(var(--border) / 0.3)';
    ctx.lineWidth = 0.3;
    for (let i = 0; i <= gameState.gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, gameState.gridSize * cellSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(gameState.gridSize * cellSize, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    const food = gameState.food;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'hsl(var(--food-glow))';
    ctx.fillStyle = 'hsl(var(--food))';
    ctx.fillRect(
      food.x * cellSize + 1,
      food.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );

    // Draw snake (spectator color)
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'hsl(var(--spectator-snake))';
    gameState.snake.forEach((segment: Position, index: number) => {
      const opacity = 1 - (index / gameState.snake.length) * 0.3;
      ctx.fillStyle = `hsl(var(--spectator-snake) / ${opacity})`;
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });

    ctx.shadowBlur = 0;
  }, [gameState, cellSize]);

  const canvasSize = gameState.gridSize * cellSize;

  return (
    <div className="relative">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{username}</span>
        <span className="text-sm text-accent">{gameState.score}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border border-muted rounded-md"
      />
    </div>
  );
}
