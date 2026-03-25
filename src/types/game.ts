export type GameStatus = 'setup' | 'lobby' | 'guest-setup' | 'playing' | 'finished';

export type GameMode = 'numeric' | 'word';
export type GameDifficulty = 'easy' | 'hard';

export type WordLetterStatus = 'correct' | 'present' | 'absent';

export interface WordFeedback {
  status: WordLetterStatus[];
  isCorrect: boolean;
}

export type Feedback = 'Too High' | 'Too Low' | 'Correct!' | 'Time Out' | WordFeedback | null;

export interface Player {
  uid?: string;
  name: string;
  secretNumber: number; // Keep for legacy/numeric
  secretWord?: string;
  attempts: number;
  history: { 
    guess: number | string; 
    feedback: Feedback;
    timestamp?: number;
  }[];
  isAI?: boolean;
  initialSecretNumber?: number;
}

export interface GameRange {
  min: number;
  max: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  mode: GameMode;
  difficulty: GameDifficulty;
  wordLength?: number;
  range: GameRange;
  currentTurn: 'player1' | 'player2';
  status: GameStatus;
  winner: 'player1' | 'player2' | null;
  roomCode: string | null;
  playerId: 'player1' | 'player2' | null;
  matchId: string | null;
  isOpponentPresent: boolean;
  isPlayer1Ready: boolean;
  isPlayer2Ready: boolean;
  turnTimeLeft: number;
}
