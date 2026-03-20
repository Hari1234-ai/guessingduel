export type GameStatus = 'setup' | 'playing' | 'finished';

export type Feedback = 'Too High' | 'Too Low' | 'Correct!' | null;

export interface Player {
  name: string;
  secretNumber: number;
  attempts: number;
  history: { guess: number; feedback: Feedback }[];
}

export interface GameRange {
  min: number;
  max: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  range: GameRange;
  currentTurn: 'player1' | 'player2';
  status: GameStatus;
  winner: 'player1' | 'player2' | null;
  roomCode: string | null;
  playerId: 'player1' | 'player2' | null;
}
