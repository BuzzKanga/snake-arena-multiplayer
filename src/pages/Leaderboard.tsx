import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockApi, LeaderboardEntry } from '@/services/mockApi';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'all' | 'walls' | 'passthrough'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedMode]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const mode = selectedMode === 'all' ? undefined : selectedMode;
      const data = await mockApi.getLeaderboard(mode);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-accent" />;
    if (index === 1) return <Medal className="w-5 h-5 text-primary" />;
    if (index === 2) return <Medal className="w-5 h-5 text-secondary" />;
    return null;
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
            LEADERBOARD
          </h1>
          <div className="w-24" />
        </div>

        <Tabs
          value={selectedMode}
          onValueChange={(v) => setSelectedMode(v as typeof selectedMode)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Modes</TabsTrigger>
            <TabsTrigger value="walls">Walls</TabsTrigger>
            <TabsTrigger value="passthrough">Pass-Through</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedMode} className="space-y-2">
            {isLoading ? (
              <Card className="p-8 text-center text-muted-foreground">
                Loading...
              </Card>
            ) : entries.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No scores yet. Be the first!
              </Card>
            ) : (
              entries.map((entry, index) => (
                <Card
                  key={entry.id}
                  className="p-4 bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        {getRankIcon(index) || (
                          <span className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {entry.username}
                        </p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="text-accent">{entry.mode}</span>
                          <span>
                            {formatDistanceToNow(new Date(entry.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary text-glow-primary">
                      {entry.score}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
