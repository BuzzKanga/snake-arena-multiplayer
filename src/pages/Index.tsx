import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockApi, User } from '@/services/mockApi';
import { Play, Trophy, Eye, LogIn, LogOut } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await mockApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await mockApi.logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary text-glow-primary mb-4 animate-fade-in">
            SNAKE ARENA
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Enter the neon grid. Choose your mode.
          </p>

          {!isLoading && (
            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Card className="px-6 py-3 bg-card flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Logged in as</span>
                  <span className="font-bold text-accent">{user.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Card>
              ) : (
                <Button variant="outline" onClick={() => navigate('/auth')} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login / Sign Up
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-8 bg-card hover:bg-muted/50 transition-all cursor-pointer group">
            <div
              onClick={() => navigate('/game?mode=walls')}
              className="space-y-4"
            >
              <div className="text-4xl font-bold text-primary text-glow-primary group-hover:scale-110 transition-transform">
                WALLS
              </div>
              <p className="text-muted-foreground">
                Classic mode. Hit the walls and it's game over.
              </p>
              <Button className="w-full gap-2 group-hover:glow-primary">
                <Play className="w-4 h-4" />
                Play Walls Mode
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-card hover:bg-muted/50 transition-all cursor-pointer group">
            <div
              onClick={() => navigate('/game?mode=passthrough')}
              className="space-y-4"
            >
              <div className="text-4xl font-bold text-secondary text-glow-secondary group-hover:scale-110 transition-transform">
                PASS-THROUGH
              </div>
              <p className="text-muted-foreground">
                Advanced mode. Snake wraps around the grid edges.
              </p>
              <Button variant="secondary" className="w-full gap-2 group-hover:glow-secondary">
                <Play className="w-4 h-4" />
                Play Pass-Through
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/leaderboard')}
            className="gap-2"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/spectate')}
            className="gap-2"
          >
            <Eye className="w-5 h-5" />
            Spectate Live Games
          </Button>
        </div>
      </div>
    </div>
  );
}
