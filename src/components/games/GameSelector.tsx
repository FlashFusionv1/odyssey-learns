/**
 * Game Selector Component
 * Displays available game types for selection
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calculator, 
  BookOpen, 
  FlaskConical, 
  Pen, 
  Globe,
  Users,
  ArrowRight,
  Gamepad2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { GameType, GameDifficulty } from '@/types/games';
import { GAME_TYPE_INFO, DIFFICULTY_LABELS } from '@/types/games';

interface GameSelectorProps {
  gradeLevel: number;
  onCreateGame: (gameType: GameType, difficulty: GameDifficulty) => Promise<void>;
  onJoinByCode: (code: string) => Promise<void>;
  isLoading?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  BookOpen,
  FlaskConical,
  Pen,
  Globe,
};

export function GameSelector({
  gradeLevel,
  onCreateGame,
  onJoinByCode,
  isLoading = false,
}: GameSelectorProps) {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('medium');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = async () => {
    if (!selectedGame) return;
    await onCreateGame(selectedGame, selectedDifficulty);
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    await onJoinByCode(joinCode.trim().toUpperCase());
    setIsJoining(false);
  };

  const gameTypes = Object.entries(GAME_TYPE_INFO) as [GameType, typeof GAME_TYPE_INFO[GameType]][];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Gamepad2 className="w-8 h-8 text-primary" />
          Multiplayer Games
        </h1>
        <p className="text-muted-foreground">
          Challenge your friends and learn together!
        </p>
      </div>

      {/* Join with Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Join a Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g., ABC123)"
              className="font-mono text-lg tracking-wider"
              maxLength={6}
            />
            <Button
              onClick={handleJoinByCode}
              disabled={joinCode.length < 6 || isJoining}
              size="lg"
            >
              {isJoining ? 'Joining...' : 'Join'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create New Game */}
      <Card>
        <CardHeader>
          <CardTitle>Create a New Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameTypes.map(([type, info]) => {
              const Icon = ICON_MAP[info.icon] || Gamepad2;
              const isSelected = selectedGame === type;

              return (
                <button
                  key={type}
                  onClick={() => setSelectedGame(type)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    'hover:border-primary hover:shadow-md',
                    isSelected && 'border-primary bg-primary/5 shadow-md',
                    !isSelected && 'border-border'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', info.color)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{info.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {info.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {info.minPlayers}-{info.maxPlayers} players
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Difficulty Selection */}
          {selectedGame && (
            <div className="space-y-3">
              <h3 className="font-medium">Select Difficulty</h3>
              <div className="flex gap-3">
                {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((diff) => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? 'default' : 'outline'}
                    onClick={() => setSelectedDifficulty(diff)}
                    className="flex-1"
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Create Button */}
          <Button
            onClick={handleCreateGame}
            disabled={!selectedGame || isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Game Room'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
