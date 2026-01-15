/**
 * Multiplayer Games Page
 * Main entry point for multiplayer learning games
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/ui/page-container';
import { BackButton } from '@/components/ui/back-button';
import { Loader2 } from 'lucide-react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { GameSelector } from '@/components/games/GameSelector';
import { GameLobby } from '@/components/games/GameLobby';
import { GameQuestion } from '@/components/games/GameQuestion';
import { GameResults } from '@/components/games/GameResults';
import type { GameType, GameDifficulty } from '@/types/games';
import { toast } from 'sonner';

interface MultiplayerGamesProps {
  childId: string;
  gradeLevel: number;
}

export default function MultiplayerGames({ childId, gradeLevel }: MultiplayerGamesProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCodeParam = searchParams.get('join');

  const {
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
    setReady,
    startGame,
    submitAnswer,
    nextQuestion,
    leaveGame,
  } = useMultiplayerGame(childId);

  const [view, setView] = useState<'select' | 'lobby' | 'playing' | 'results'>('select');

  // Auto-join if code provided in URL
  useEffect(() => {
    if (roomCodeParam && !room) {
      handleJoinByCode(roomCodeParam);
    }
  }, [roomCodeParam]);

  // Update view based on room status
  useEffect(() => {
    if (!room) {
      setView('select');
    } else if (room.status === 'waiting') {
      setView('lobby');
    } else if (room.status === 'in_progress') {
      setView('playing');
    } else if (room.status === 'completed') {
      setView('results');
    }
  }, [room?.status]);

  // Show errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateGame = useCallback(async (gameType: GameType, difficulty: GameDifficulty) => {
    const newRoom = await createRoom(gameType, gradeLevel, difficulty, {
      totalQuestions: 10,
      timePerQuestion: 30,
    });
    
    if (newRoom) {
      toast.success(`Game room created! Code: ${newRoom.roomCode}`);
    }
  }, [createRoom, gradeLevel]);

  const handleJoinByCode = useCallback(async (code: string) => {
    const joinedRoom = await joinByCode(code);
    
    if (joinedRoom) {
      toast.success('Joined game successfully!');
    }
  }, [joinByCode]);

  const handleStartGame = useCallback(async (): Promise<boolean> => {
    const success = await startGame();
    if (success) {
      toast.success('Game started!');
    }
    return success;
  }, [startGame]);

  const handleLeaveGame = useCallback(async () => {
    await leaveGame();
    toast.info('Left the game');
    navigate('/games');
  }, [leaveGame, navigate]);

  const handlePlayAgain = useCallback(async () => {
    if (room) {
      // Create a new room with same settings
      await createRoom(room.gameType, room.gradeLevel, room.difficulty, room.settings);
    }
  }, [room, createRoom]);

  const handleGoHome = useCallback(() => {
    leaveGame();
    navigate('/dashboard');
  }, [leaveGame, navigate]);

  // Loading state
  if (isLoading && !room) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {view === 'select' && (
          <>
            <BackButton to="/dashboard" label="Back to Dashboard" />
            <GameSelector
              gradeLevel={gradeLevel}
              onCreateGame={handleCreateGame}
              onJoinByCode={handleJoinByCode}
              isLoading={isLoading}
            />
          </>
        )}

        {view === 'lobby' && room && (
          <GameLobby
            room={room}
            players={players}
            childId={childId}
            isCreator={isCreator}
            isReady={isReady}
            onSetReady={setReady}
            onStartGame={handleStartGame}
            onLeaveGame={handleLeaveGame}
            isLoading={isLoading}
          />
        )}

        {view === 'playing' && currentQuestion && (
          <GameQuestion
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeRemaining={timeRemaining}
            onSubmitAnswer={submitAnswer}
            onNextQuestion={nextQuestion}
            myScore={myScore}
          />
        )}

        {view === 'results' && room && (
          <GameResults
            room={room}
            players={players}
            childId={childId}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </PageContainer>
  );
}
