// Multiplayer Learning Games Type Definitions

export type GameType = 'math_race' | 'spelling_bee' | 'science_quiz' | 'story_builder' | 'geography_challenge';
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type PlayerStatus = 'joined' | 'ready' | 'playing' | 'finished' | 'left';
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'spelling';

export interface GameRoom {
  id: string;
  gameType: GameType;
  creatorId: string | null;
  status: GameStatus;
  maxPlayers: number;
  gradeLevel: number;
  difficulty: GameDifficulty;
  settings: GameSettings;
  roomCode: string;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface GameSettings {
  timePerQuestion?: number;
  totalQuestions?: number;
  allowPowerUps?: boolean;
  shuffleQuestions?: boolean;
  showLeaderboard?: boolean;
}

export interface GamePlayer {
  id: string;
  roomId: string;
  playerId: string;
  score: number;
  rank: number | null;
  correctAnswers: number;
  totalAnswers: number;
  status: PlayerStatus;
  joinedAt: string;
  finishedAt: string | null;
  // Joined data
  playerName?: string;
  avatarConfig?: Record<string, unknown>;
}

export interface GameQuestion {
  id: string;
  roomId: string;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  options: string[] | null;
  correctAnswer: string;
  points: number;
  timeLimitSeconds: number;
  subject: string | null;
}

export interface GameAnswer {
  id: string;
  roomId: string;
  questionId: string;
  playerId: string;
  answerText: string;
  isCorrect: boolean;
  timeTakenMs: number;
  pointsEarned: number;
  answeredAt: string;
}

export interface GameResult {
  id: string;
  roomId: string;
  winnerId: string | null;
  finalScores: Record<string, number>;
  totalQuestions: number;
  durationSeconds: number;
  xpAwarded: Record<string, number>;
  createdAt: string;
}

export interface GameState {
  room: GameRoom | null;
  players: GamePlayer[];
  questions: GameQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, GameAnswer[]>; // playerId -> answers
  timeRemaining: number;
  isLoading: boolean;
  error: string | null;
}

// Game type metadata
export const GAME_TYPE_INFO: Record<GameType, {
  title: string;
  description: string;
  icon: string;
  color: string;
  subjects: string[];
  minPlayers: number;
  maxPlayers: number;
}> = {
  math_race: {
    title: 'Math Race',
    description: 'Solve math problems faster than your opponents!',
    icon: 'Calculator',
    color: 'bg-blue-500',
    subjects: ['math'],
    minPlayers: 2,
    maxPlayers: 6,
  },
  spelling_bee: {
    title: 'Spelling Bee',
    description: 'Compete to spell words correctly!',
    icon: 'BookOpen',
    color: 'bg-purple-500',
    subjects: ['reading', 'language'],
    minPlayers: 2,
    maxPlayers: 8,
  },
  science_quiz: {
    title: 'Science Quiz Battle',
    description: 'Test your science knowledge against others!',
    icon: 'FlaskConical',
    color: 'bg-green-500',
    subjects: ['science'],
    minPlayers: 2,
    maxPlayers: 6,
  },
  story_builder: {
    title: 'Story Builder',
    description: 'Collaborate to create an amazing story!',
    icon: 'Pen',
    color: 'bg-orange-500',
    subjects: ['reading', 'writing'],
    minPlayers: 2,
    maxPlayers: 4,
  },
  geography_challenge: {
    title: 'Geography Challenge',
    description: 'Race to identify countries, capitals, and landmarks!',
    icon: 'Globe',
    color: 'bg-teal-500',
    subjects: ['social_studies'],
    minPlayers: 2,
    maxPlayers: 6,
  },
};

export const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const PLAYER_STATUS_LABELS: Record<PlayerStatus, string> = {
  joined: 'Joined',
  ready: 'Ready',
  playing: 'Playing',
  finished: 'Finished',
  left: 'Left',
};
