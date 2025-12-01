// Centralized mock API service for all backend calls

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  timestamp: string;
}

export interface GameSession {
  id: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  isActive: boolean;
}

// Mock data storage
let currentUser: User | null = null;
const mockUsers = new Map<string, { email: string; password: string; username: string }>();

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 2840, mode: 'walls', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', username: 'NeonViper', score: 2350, mode: 'passthrough', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', username: 'GridCrawler', score: 1920, mode: 'walls', timestamp: new Date(Date.now() - 259200000).toISOString() },
  { id: '4', username: 'PhaseSnake', score: 1680, mode: 'passthrough', timestamp: new Date(Date.now() - 345600000).toISOString() },
  { id: '5', username: 'PixelHunter', score: 1450, mode: 'walls', timestamp: new Date(Date.now() - 432000000).toISOString() },
];

const activeSessions: GameSession[] = [
  { id: '1', username: 'LivePlayer1', score: 420, mode: 'walls', isActive: true },
  { id: '2', username: 'LivePlayer2', score: 680, mode: 'passthrough', isActive: true },
  { id: '3', username: 'LivePlayer3', score: 290, mode: 'walls', isActive: true },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(500);
    
    const userEntry = Array.from(mockUsers.entries()).find(
      ([_, data]) => data.email === email && data.password === password
    );

    if (!userEntry) {
      throw new Error('Invalid credentials');
    }

    currentUser = {
      id: userEntry[0],
      username: userEntry[1].username,
      email: userEntry[1].email,
    };

    return {
      user: currentUser,
      token: `mock-token-${currentUser.id}`,
    };
  },

  async signup(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(500);

    if (Array.from(mockUsers.values()).some(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    if (Array.from(mockUsers.values()).some(u => u.username === username)) {
      throw new Error('Username already taken');
    }

    const userId = `user-${Date.now()}`;
    mockUsers.set(userId, { email, password, username });

    currentUser = { id: userId, username, email };

    return {
      user: currentUser,
      token: `mock-token-${userId}`,
    };
  },

  async logout(): Promise<void> {
    await delay(300);
    currentUser = null;
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    return currentUser;
  },

  // Leaderboard
  async getLeaderboard(mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
    await delay(400);
    
    let results = [...mockLeaderboard];
    if (mode) {
      results = results.filter(entry => entry.mode === mode);
    }
    
    return results.sort((a, b) => b.score - a.score);
  },

  async submitScore(score: number, mode: 'passthrough' | 'walls'): Promise<void> {
    await delay(500);
    
    if (!currentUser) {
      throw new Error('Must be logged in to submit score');
    }

    const entry: LeaderboardEntry = {
      id: `score-${Date.now()}`,
      username: currentUser.username,
      score,
      mode,
      timestamp: new Date().toISOString(),
    };

    mockLeaderboard.push(entry);
  },

  // Active game sessions (spectating)
  async getActiveSessions(): Promise<GameSession[]> {
    await delay(300);
    return [...activeSessions];
  },

  async getSessionById(sessionId: string): Promise<GameSession | null> {
    await delay(200);
    return activeSessions.find(s => s.id === sessionId) || null;
  },
};
