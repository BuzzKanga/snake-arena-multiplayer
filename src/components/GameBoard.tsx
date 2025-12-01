import { useEffect, useRef } from 'react';
import { GameState, Position } from '@/lib/gameEngine';

interface GameBoardProps {
  gameState: GameState;
  cellSize?: number;
}

export function GameBoard({ gameState, cellSize = 20 }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--game-grid))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 0.5;
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

    // Draw food with glow
    const food = gameState.food;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'hsl(var(--food-glow))';
    ctx.fillStyle = 'hsl(var(--food))';
    ctx.fillRect(
      food.x * cellSize + 2,
      food.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );

    // Draw snake with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'hsl(var(--snake-glow))';
    gameState.snake.forEach((segment: Position, index: number) => {
      const opacity = 1 - (index / gameState.snake.length) * 0.3;
      ctx.fillStyle = `hsl(var(--snake-body) / ${opacity})`;
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
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border-2 border-primary rounded-lg glow-primary"
      />
      {gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-destructive text-glow-secondary mb-2">
              GAME OVER
            </h2>
            <p className="text-xl text-foreground">Score: {gameState.score}</p>
          </div>
        </div>
      )}
    </div>
  );
}
