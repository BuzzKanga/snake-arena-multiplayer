import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SpectatorBoard } from '@/components/SpectatorBoard';
import { mockApi, GameSession } from '@/services/mockApi';
import {
  createInitialGameState,
  updateGameState,
  getAIDirection,
  GameState,
} from '@/lib/gameEngine';
import { ArrowLeft, Eye } from 'lucide-react';

export default function Spectate() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [gameStates, setGameStates] = useState<Map<string, GameState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getActiveSessions();
      setSessions(data);

      // Initialize game states for each session
      const states = new Map<string, GameState>();
      data.forEach(session => {
        states.set(session.id, createInitialGameState(session.mode, 15));
      });
      setGameStates(states);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessions.length === 0) return;

    const interval = setInterval(() => {
      setGameStates(prevStates => {
        const newStates = new Map(prevStates);

        sessions.forEach(session => {
          const currentState = newStates.get(session.id);
          if (!currentState) return;

          // If game over, restart
          if (currentState.isGameOver) {
            newStates.set(session.id, createInitialGameState(session.mode, 15));
            return;
          }

          // Get AI direction and update
          const aiDirection = getAIDirection(currentState);
          const updated = updateGameState(currentState, aiDirection);
          newStates.set(session.id, updated);
        });

        return newStates;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [sessions]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary text-glow-primary flex items-center gap-2">
            <Eye className="w-8 h-8" />
            SPECTATE MODE
          </h1>
          <div className="w-24" />
        </div>

        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">
            Loading live games...
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No active games right now. Check back later!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => {
              const gameState = gameStates.get(session.id);
              if (!gameState) return null;

              return (
                <Card key={session.id} className="p-4 bg-card">
                  <SpectatorBoard
                    gameState={gameState}
                    username={session.username}
                    cellSize={15}
                  />
                  <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
                    <span>Mode: {session.mode}</span>
                    <span className="text-accent">● LIVE</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
