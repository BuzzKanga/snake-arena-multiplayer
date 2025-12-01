import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GameBoard } from '@/components/GameBoard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  createInitialGameState,
  updateGameState,
  Direction,
  GameState,
  GameMode,
} from '@/lib/gameEngine';
import { mockApi } from '@/services/mockApi';
import { toast } from 'sonner';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

export default function Game() {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') || 'walls') as GameMode;
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(mode)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<Direction | null>(null);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying || gameState.isGameOver) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        setPendingDirection(direction);
      }
    },
    [isPlaying, gameState.isGameOver]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isPlaying || gameState.isGameOver) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const updated = updateGameState(prev, pendingDirection || undefined);
        setPendingDirection(null);
        return updated;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, gameState.isGameOver, pendingDirection]);

  useEffect(() => {
    if (gameState.isGameOver && isPlaying) {
      setIsPlaying(false);
      handleGameOver();
    }
  }, [gameState.isGameOver]);

  const handleGameOver = async () => {
    try {
      await mockApi.submitScore(gameState.score, mode);
      toast.success(`Score ${gameState.score} submitted!`);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const startGame = () => {
    setGameState(createInitialGameState(mode));
    setIsPlaying(true);
    setPendingDirection(null);
  };

  const resetGame = () => {
    setGameState(createInitialGameState(mode));
    setIsPlaying(false);
    setPendingDirection(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary text-glow-primary">
            SNAKE - {mode.toUpperCase()}
          </h1>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex justify-center">
            <GameBoard gameState={gameState} />
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-card">
              <h2 className="text-xl font-bold mb-4 text-primary">Score</h2>
              <p className="text-5xl font-bold text-center text-accent text-glow-accent">
                {gameState.score}
              </p>
            </Card>

            <Card className="p-6 bg-card">
              <h2 className="text-xl font-bold mb-4 text-primary">Controls</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Arrow Keys or WASD to move</p>
                <p className="mt-4 text-foreground">
                  Mode: <span className="text-accent">{mode}</span>
                </p>
                <p className="text-xs mt-2">
                  {mode === 'passthrough'
                    ? 'Snake wraps around walls'
                    : 'Snake dies when hitting walls'}
                </p>
              </div>
            </Card>

            <div className="space-y-2">
              {!isPlaying && !gameState.isGameOver && (
                <Button
                  onClick={startGame}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Play className="w-4 h-4" />
                  Start Game
                </Button>
              )}

              {(gameState.isGameOver || isPlaying) && (
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
