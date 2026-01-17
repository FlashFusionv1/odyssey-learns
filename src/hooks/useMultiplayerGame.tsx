/**
 * Hook for managing multiplayer game state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { gameEngine, MultiplayerGame } from '@/lib/games/multiplayerGame';
import type {
  GameRoom,
  GamePlayer,
  GameQuestion,
  GameState,
  GameType,
  GameDifficulty,
  GameSettings,
} from '@/types/games';

interface UseMultiplayerGameReturn {
  // State
  room: GameRoom | null;
  players: GamePlayer[];
  questions: GameQuestion[];
  currentQuestion: GameQuestion | null;
  currentQuestionIndex: number;
  timeRemaining: number;
  isLoading: boolean;
  error: string | null;
  
  // Player state
  isCreator: boolean;
  isReady: boolean;
  myScore: number;
  myRank: number | null;
  
  // Actions
  createRoom: (gameType: GameType, gradeLevel: number, difficulty?: GameDifficulty, settings?: GameSettings) => Promise<GameRoom | null>;
  joinRoom: (roomId: string) => Promise<boolean>;
  joinByCode: (code: string) => Promise<GameRoom | null>;
  setReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<boolean>;
  submitAnswer: (answer: string) => Promise<{ isCorrect: boolean; pointsEarned: number }>;
  nextQuestion: () => void;
  leaveGame: () => Promise<void>;
  
  // Utility
  refetch: () => Promise<void>;
}

export function useMultiplayerGame(childId: string): UseMultiplayerGameReturn {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answerStartTimeRef = useRef<number>(0);

  // Computed values
  const isCreator = room?.creatorId === childId;
  const myPlayer = players.find(p => p.playerId === childId);
  const myScore = myPlayer?.score ?? 0;
  const myRank = myPlayer?.rank ?? null;
  const currentQuestion = questions[currentQuestionIndex] ?? null;

  // Fetch room data
  const fetchRoomData = useCallback(async (roomId: string) => {
    setIsLoading(true);
    
    try {
      // Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      setRoom({
        id: roomData.id,
        gameType: roomData.game_type as GameType,
        creatorId: roomData.creator_id,
        status: roomData.status as 'waiting' | 'in_progress' | 'completed' | 'cancelled',
        maxPlayers: roomData.max_players,
        gradeLevel: roomData.grade_level,
        difficulty: roomData.difficulty as GameDifficulty,
        settings: (roomData.settings as GameSettings) || {},
        roomCode: roomData.room_code,
        startedAt: roomData.started_at,
        endedAt: roomData.ended_at,
        createdAt: roomData.created_at,
      });

      // Fetch players with child info
      const { data: playersData } = await supabase
        .from('game_players')
        .select(`
          *,
          children:player_id (name, avatar_config)
        `)
        .eq('room_id', roomId)
        .order('score', { ascending: false });

      if (playersData) {
        setPlayers(
          playersData.map(p => ({
            id: p.id,
            roomId: p.room_id,
            playerId: p.player_id,
            score: p.score,
            rank: p.rank,
            correctAnswers: p.correct_answers,
            totalAnswers: p.total_answers,
            status: p.status as 'joined' | 'ready' | 'playing' | 'finished' | 'left',
            joinedAt: p.joined_at,
            finishedAt: p.finished_at,
            playerName: (p.children as { name: string } | null)?.name,
            avatarConfig: (p.children as { avatar_config: Record<string, unknown> } | null)?.avatar_config,
          }))
        );
      }

      // Fetch questions if game in progress - use safe view that excludes correct_answer
      if (roomData.status === 'in_progress') {
        // Use game_questions_safe view to prevent cheating (excludes correct_answer)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: questionsData } = await (supabase as any)
          .from('game_questions_safe')
          .select('*')
          .eq('room_id', roomId)
          .order('question_number');

        if (questionsData) {
          setQuestions(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            questionsData.map((q: any) => ({
              id: q.id,
              roomId: q.room_id,
              questionNumber: q.question_number,
              questionText: q.question_text,
              questionType: q.question_type as 'multiple_choice' | 'true_false' | 'fill_blank' | 'spelling',
              options: q.options as string[] | null,
              correctAnswer: '', // Server-side verification only - never expose to client
              points: q.points,
              timeLimitSeconds: q.time_limit_seconds,
              subject: q.subject,
            }))
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create room
  const createRoom = useCallback(
    async (
      gameType: GameType,
      gradeLevel: number,
      difficulty: GameDifficulty = 'medium',
      settings: GameSettings = {}
    ): Promise<GameRoom | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const newRoom = await gameEngine.createRoom(gameType, childId, gradeLevel, difficulty, settings);
        
        if (newRoom) {
          setRoom(newRoom);
          await fetchRoomData(newRoom.id);
        }
        
        return newRoom;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create room');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [childId, fetchRoomData]
  );

  // Join room
  const joinRoom = useCallback(
    async (roomId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const success = await gameEngine.joinRoom(roomId, childId);
        
        if (success) {
          await fetchRoomData(roomId);
        } else {
          setError('Unable to join room. It may be full or already started.');
        }
        
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join room');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [childId, fetchRoomData]
  );

  // Join by code
  const joinByCode = useCallback(
    async (code: string): Promise<GameRoom | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const joinedRoom = await gameEngine.joinByCode(code, childId);
        
        if (joinedRoom) {
          setRoom(joinedRoom);
          await fetchRoomData(joinedRoom.id);
        } else {
          setError('Invalid room code or room is no longer available.');
        }
        
        return joinedRoom;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join room');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [childId, fetchRoomData]
  );

  // Set ready status
  const handleSetReady = useCallback(
    async (ready: boolean) => {
      await gameEngine.setReady(ready);
      setIsReady(ready);
    },
    []
  );

  // Start game
  const startGame = useCallback(async (): Promise<boolean> => {
    if (!isCreator) return false;

    setIsLoading(true);
    const success = await gameEngine.startGame();
    
    if (success && room) {
      await fetchRoomData(room.id);
      startQuestionTimer();
    }
    
    setIsLoading(false);
    return success;
  }, [isCreator, room, fetchRoomData]);

  // Start question timer
  const startQuestionTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const question = questions[currentQuestionIndex];
    if (!question) return;

    setTimeRemaining(question.timeLimitSeconds);
    answerStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [questions, currentQuestionIndex]);

  // Submit answer
  const submitAnswer = useCallback(
    async (answer: string): Promise<{ isCorrect: boolean; pointsEarned: number }> => {
      if (!currentQuestion) {
        return { isCorrect: false, pointsEarned: 0 };
      }

      const timeTaken = Date.now() - answerStartTimeRef.current;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const result = await gameEngine.submitAnswer(currentQuestion.id, answer, timeTaken);
      
      // Refresh player data
      if (room) {
        await fetchRoomData(room.id);
      }

      return result;
    },
    [currentQuestion, room, fetchRoomData]
  );

  // Next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      startQuestionTimer();
    } else {
      // Game over
      gameEngine.endGame();
    }
  }, [currentQuestionIndex, questions.length, startQuestionTimer]);

  // Leave game
  const leaveGame = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    await gameEngine.leaveGame();
    
    setRoom(null);
    setPlayers([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(0);
    setIsReady(false);
  }, []);

  // Refetch
  const refetch = useCallback(async () => {
    if (room) {
      await fetchRoomData(room.id);
    }
  }, [room, fetchRoomData]);

  // Subscribe to game state changes
  useEffect(() => {
    gameEngine.onStateUpdate((state) => {
      if (state.currentQuestionIndex !== undefined) {
        setCurrentQuestionIndex(state.currentQuestionIndex);
      }
      if (state.timeRemaining !== undefined) {
        setTimeRemaining(state.timeRemaining);
      }
      if (room) {
        fetchRoomData(room.id);
      }
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [room, fetchRoomData]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`game-state:${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${room.id}` },
        () => fetchRoomData(room.id)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `room_id=eq.${room.id}` },
        () => fetchRoomData(room.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, fetchRoomData]);

  return {
    room,
    players,
    questions,
    currentQuestion,
    currentQuestionIndex,
    timeRemaining,
    isLoading,
    error,
    isCreator,
    isReady,
    myScore,
    myRank,
    createRoom,
    joinRoom,
    joinByCode,
    setReady: handleSetReady,
    startGame,
    submitAnswer,
    nextQuestion,
    leaveGame,
    refetch,
  };
}
