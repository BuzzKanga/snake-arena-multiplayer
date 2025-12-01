// Snake game engine logic

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'passthrough' | 'walls';
export type Position = { x: number; y: number };

export interface GameState {
  snake: Position[];
  direction: Direction;
  food: Position;
  score: number;
  isGameOver: boolean;
  mode: GameMode;
  gridSize: number;
}

export const INITIAL_SNAKE_LENGTH = 3;
export const DEFAULT_GRID_SIZE = 20;

export function createInitialGameState(mode: GameMode, gridSize = DEFAULT_GRID_SIZE): GameState {
  const center = Math.floor(gridSize / 2);
  const snake: Position[] = [];
  
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: center, y: center + i });
  }

  return {
    snake,
    direction: 'UP',
    food: generateFood(snake, gridSize),
    score: 0,
    isGameOver: false,
    mode,
    gridSize,
  };
}

export function generateFood(snake: Position[], gridSize: number): Position {
  let food: Position;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    attempts++;
  } while (
    attempts < maxAttempts &&
    snake.some(segment => segment.x === food.x && segment.y === food.y)
  );

  return food;
}

export function getNextHeadPosition(head: Position, direction: Direction): Position {
  const next = { ...head };

  switch (direction) {
    case 'UP':
      next.y -= 1;
      break;
    case 'DOWN':
      next.y += 1;
      break;
    case 'LEFT':
      next.x -= 1;
      break;
    case 'RIGHT':
      next.x += 1;
      break;
  }

  return next;
}

export function wrapPosition(pos: Position, gridSize: number): Position {
  return {
    x: (pos.x + gridSize) % gridSize,
    y: (pos.y + gridSize) % gridSize,
  };
}

export function isOutOfBounds(pos: Position, gridSize: number): boolean {
  return pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize;
}

export function checkSelfCollision(head: Position, body: Position[]): boolean {
  return body.some(segment => segment.x === head.x && segment.y === head.y);
}

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  return (
    (current === 'UP' && next === 'DOWN') ||
    (current === 'DOWN' && next === 'UP') ||
    (current === 'LEFT' && next === 'RIGHT') ||
    (current === 'RIGHT' && next === 'LEFT')
  );
}

export function updateGameState(state: GameState, newDirection?: Direction): GameState {
  if (state.isGameOver) return state;

  // Update direction if provided and valid
  let direction = state.direction;
  if (newDirection && !isOppositeDirection(state.direction, newDirection)) {
    direction = newDirection;
  }

  const head = state.snake[0];
  let nextHead = getNextHeadPosition(head, direction);

  // Handle passthrough mode
  if (state.mode === 'passthrough') {
    nextHead = wrapPosition(nextHead, state.gridSize);
  }

  // Check wall collision in walls mode
  if (state.mode === 'walls' && isOutOfBounds(nextHead, state.gridSize)) {
    return { ...state, isGameOver: true };
  }

  // Check self collision
  if (checkSelfCollision(nextHead, state.snake)) {
    return { ...state, isGameOver: true };
  }

  // Create new snake
  const newSnake = [nextHead, ...state.snake];

  // Check food collision
  const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y;

  if (!ateFood) {
    newSnake.pop(); // Remove tail if no food eaten
  }

  return {
    ...state,
    snake: newSnake,
    direction,
    food: ateFood ? generateFood(newSnake, state.gridSize) : state.food,
    score: ateFood ? state.score + 10 : state.score,
  };
}

// AI logic for spectator mode
export function getAIDirection(state: GameState): Direction {
  const head = state.snake[0];
  const food = state.food;

  // Calculate distance to food for each possible direction
  const possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const validDirections = possibleDirections.filter(
    dir => !isOppositeDirection(state.direction, dir)
  );

  let bestDirection = state.direction;
  let bestDistance = Infinity;

  for (const dir of validDirections) {
    let nextPos = getNextHeadPosition(head, dir);

    if (state.mode === 'passthrough') {
      nextPos = wrapPosition(nextPos, state.gridSize);
    }

    // Skip if would hit wall in walls mode
    if (state.mode === 'walls' && isOutOfBounds(nextPos, state.gridSize)) {
      continue;
    }

    // Skip if would hit self
    if (checkSelfCollision(nextPos, state.snake)) {
      continue;
    }

    // Calculate Manhattan distance to food
    const distance = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestDirection = dir;
    }
  }

  return bestDirection;
}
