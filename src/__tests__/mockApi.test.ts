import { describe, it, expect, beforeEach } from 'vitest';
import { mockApi } from '@/services/mockApi';

describe('mockApi', () => {
  beforeEach(async () => {
    // Logout before each test
    await mockApi.logout();
  });

  describe('authentication', () => {
    it('signs up a new user', async () => {
      const result = await mockApi.signup('testuser', 'test@example.com', 'password123');
      
      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeTruthy();
    });

    it('prevents duplicate email signup', async () => {
      await mockApi.signup('user1', 'test@example.com', 'password123');
      
      await expect(
        mockApi.signup('user2', 'test@example.com', 'password456')
      ).rejects.toThrow('Email already exists');
    });

    it('prevents duplicate username signup', async () => {
      await mockApi.signup('testuser', 'test1@example.com', 'password123');
      
      await expect(
        mockApi.signup('testuser', 'test2@example.com', 'password456')
      ).rejects.toThrow('Username already taken');
    });

    it('logs in existing user', async () => {
      await mockApi.signup('testuser', 'test@example.com', 'password123');
      await mockApi.logout();
      
      const result = await mockApi.login('test@example.com', 'password123');
      
      expect(result.user.username).toBe('testuser');
      expect(result.token).toBeTruthy();
    });

    it('rejects invalid credentials', async () => {
      await mockApi.signup('testuser', 'test@example.com', 'password123');
      await mockApi.logout();
      
      await expect(
        mockApi.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('gets current user after login', async () => {
      await mockApi.signup('testuser', 'test@example.com', 'password123');
      
      const user = await mockApi.getCurrentUser();
      
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
    });

    it('returns null for current user when logged out', async () => {
      await mockApi.signup('testuser', 'test@example.com', 'password123');
      await mockApi.logout();
      
      const user = await mockApi.getCurrentUser();
      
      expect(user).toBeNull();
    });
  });

  describe('leaderboard', () => {
    it('returns leaderboard entries', async () => {
      const entries = await mockApi.getLeaderboard();
      
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThan(0);
    });

    it('filters leaderboard by mode', async () => {
      const wallsEntries = await mockApi.getLeaderboard('walls');
      
      expect(wallsEntries.every(e => e.mode === 'walls')).toBe(true);
    });

    it('sorts leaderboard by score descending', async () => {
      const entries = await mockApi.getLeaderboard();
      
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].score).toBeGreaterThanOrEqual(entries[i].score);
      }
    });

    it('submits score when logged in', async () => {
      await mockApi.signup('testuser', 'test@example.com', 'password123');
      
      await expect(
        mockApi.submitScore(500, 'walls')
      ).resolves.not.toThrow();
    });

    it('rejects score submission when not logged in', async () => {
      await expect(
        mockApi.submitScore(500, 'walls')
      ).rejects.toThrow('Must be logged in');
    });
  });

  describe('game sessions', () => {
    it('returns active game sessions', async () => {
      const sessions = await mockApi.getActiveSessions();
      
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions.every(s => s.isActive)).toBe(true);
    });

    it('gets session by id', async () => {
      const sessions = await mockApi.getActiveSessions();
      const firstId = sessions[0].id;
      
      const session = await mockApi.getSessionById(firstId);
      
      expect(session).not.toBeNull();
      expect(session?.id).toBe(firstId);
    });

    it('returns null for non-existent session', async () => {
      const session = await mockApi.getSessionById('non-existent-id');
      
      expect(session).toBeNull();
    });
  });
});
