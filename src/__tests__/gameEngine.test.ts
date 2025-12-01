import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  updateGameState,
  getNextHeadPosition,
  wrapPosition,
  isOutOfBounds,
  checkSelfCollision,
  isOppositeDirection,
  getAIDirection,
  INITIAL_SNAKE_LENGTH,
} from '@/lib/gameEngine';

describe('gameEngine', () => {
  describe('createInitialGameState', () => {
    it('creates valid initial state for walls mode', () => {
      const state = createInitialGameState('walls', 20);
      
      expect(state.snake).toHaveLength(INITIAL_SNAKE_LENGTH);
      expect(state.direction).toBe('UP');
      expect(state.score).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.mode).toBe('walls');
      expect(state.gridSize).toBe(20);
    });

    it('creates valid initial state for passthrough mode', () => {
      const state = createInitialGameState('passthrough', 15);
      
      expect(state.mode).toBe('passthrough');
      expect(state.gridSize).toBe(15);
    });

    it('places snake in center of grid', () => {
      const state = createInitialGameState('walls', 20);
      const center = Math.floor(20 / 2);
      
      expect(state.snake[0].x).toBe(center);
      expect(state.snake[0].y).toBe(center);
    });

    it('ensures food does not overlap with snake', () => {
      const state = createInitialGameState('walls', 20);
      const foodOverlaps = state.snake.some(
        segment => segment.x === state.food.x && segment.y === state.food.y
      );
      
      expect(foodOverlaps).toBe(false);
    });
  });

  describe('getNextHeadPosition', () => {
    it('moves up correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'UP');
      
      expect(next).toEqual({ x: 5, y: 4 });
    });

    it('moves down correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'DOWN');
      
      expect(next).toEqual({ x: 5, y: 6 });
    });

    it('moves left correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'LEFT');
      
      expect(next).toEqual({ x: 4, y: 5 });
    });

    it('moves right correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'RIGHT');
      
      expect(next).toEqual({ x: 6, y: 5 });
    });
  });

  describe('wrapPosition', () => {
    it('wraps negative x coordinate', () => {
      const pos = { x: -1, y: 5 };
      const wrapped = wrapPosition(pos, 20);
      
      expect(wrapped).toEqual({ x: 19, y: 5 });
    });

    it('wraps x coordinate beyond grid', () => {
      const pos = { x: 20, y: 5 };
      const wrapped = wrapPosition(pos, 20);
      
      expect(wrapped).toEqual({ x: 0, y: 5 });
    });

    it('wraps negative y coordinate', () => {
      const pos = { x: 5, y: -1 };
      const wrapped = wrapPosition(pos, 20);
      
      expect(wrapped).toEqual({ x: 5, y: 19 });
    });

    it('wraps y coordinate beyond grid', () => {
      const pos = { x: 5, y: 20 };
      const wrapped = wrapPosition(pos, 20);
      
      expect(wrapped).toEqual({ x: 5, y: 0 });
    });
  });

  describe('isOutOfBounds', () => {
    it('detects negative x', () => {
      expect(isOutOfBounds({ x: -1, y: 5 }, 20)).toBe(true);
    });

    it('detects negative y', () => {
      expect(isOutOfBounds({ x: 5, y: -1 }, 20)).toBe(true);
    });

    it('detects x beyond grid', () => {
      expect(isOutOfBounds({ x: 20, y: 5 }, 20)).toBe(true);
    });

    it('detects y beyond grid', () => {
      expect(isOutOfBounds({ x: 5, y: 20 }, 20)).toBe(true);
    });

    it('returns false for valid position', () => {
      expect(isOutOfBounds({ x: 10, y: 10 }, 20)).toBe(false);
    });
  });

  describe('checkSelfCollision', () => {
    it('detects collision with body', () => {
      const head = { x: 5, y: 5 };
      const body = [
        { x: 5, y: 6 },
        { x: 5, y: 5 }, // collision here
        { x: 5, y: 4 },
      ];
      
      expect(checkSelfCollision(head, body)).toBe(true);
    });

    it('returns false when no collision', () => {
      const head = { x: 5, y: 5 };
      const body = [
        { x: 5, y: 6 },
        { x: 5, y: 7 },
        { x: 5, y: 8 },
      ];
      
      expect(checkSelfCollision(head, body)).toBe(false);
    });
  });

  describe('isOppositeDirection', () => {
    it('detects UP-DOWN opposite', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
    });

    it('detects LEFT-RIGHT opposite', () => {
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('returns false for non-opposite directions', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
    });
  });

  describe('updateGameState', () => {
    it('moves snake forward', () => {
      const state = createInitialGameState('walls', 20);
      const updated = updateGameState(state);
      
      expect(updated.snake[0].y).toBe(state.snake[0].y - 1);
    });

    it('does not allow opposite direction', () => {
      const state = createInitialGameState('walls', 20);
      state.direction = 'UP';
      
      const updated = updateGameState(state, 'DOWN');
      
      expect(updated.direction).toBe('UP');
    });

    it('increases score when eating food', () => {
      const state = createInitialGameState('walls', 20);
      // Position food right in front of snake
      state.food = { x: state.snake[0].x, y: state.snake[0].y - 1 };
      
      const updated = updateGameState(state);
      
      expect(updated.score).toBe(state.score + 10);
      expect(updated.snake.length).toBe(state.snake.length + 1);
    });

    it('ends game on wall collision in walls mode', () => {
      const state = createInitialGameState('walls', 20);
      state.snake = [{ x: 0, y: 0 }];
      state.direction = 'UP';
      
      const updated = updateGameState(state);
      
      expect(updated.isGameOver).toBe(true);
    });

    it('wraps around in passthrough mode', () => {
      const state = createInitialGameState('passthrough', 20);
      state.snake = [{ x: 0, y: 0 }];
      state.direction = 'UP';
      
      const updated = updateGameState(state);
      
      expect(updated.isGameOver).toBe(false);
      expect(updated.snake[0].y).toBe(19);
    });

    it('ends game on self collision', () => {
      const state = createInitialGameState('walls', 20);
      state.snake = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 },
      ];
      state.direction = 'RIGHT';
      
      const updated = updateGameState(state);
      
      expect(updated.isGameOver).toBe(true);
    });
  });

  describe('getAIDirection', () => {
    it('moves toward food', () => {
      const state = createInitialGameState('walls', 20);
      state.snake = [{ x: 10, y: 10 }];
      state.food = { x: 12, y: 10 };
      state.direction = 'UP';
      
      const aiDirection = getAIDirection(state);
      
      expect(aiDirection).toBe('RIGHT');
    });

    it('avoids walls in walls mode', () => {
      const state = createInitialGameState('walls', 20);
      state.snake = [{ x: 0, y: 10 }];
      state.food = { x: 5, y: 10 };
      state.direction = 'UP';
      
      const aiDirection = getAIDirection(state);
      
      expect(aiDirection).not.toBe('LEFT');
    });

    it('avoids self collision', () => {
      const state = createInitialGameState('walls', 20);
      state.snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
      ];
      state.food = { x: 10, y: 9 };
      state.direction = 'UP';
      
      const aiDirection = getAIDirection(state);
      
      expect(aiDirection).not.toBe('DOWN');
    });
  });
});
