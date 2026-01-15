/**
 * Game Lobby Component
 * Displays waiting room before game starts
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Copy, 
  Check, 
  Play, 
  LogOut, 
  Crown, 
  Clock,
  Loader2 
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { GameRoom, GamePlayer } from '@/types/games';
import { GAME_TYPE_INFO, DIFFICULTY_LABELS, PLAYER_STATUS_LABELS } from '@/types/games';

interface GameLobbyProps {
  room: GameRoom;
  players: GamePlayer[];
  childId: string;
  isCreator: boolean;
  isReady: boolean;
  onSetReady: (ready: boolean) => void;
  onStartGame: () => Promise<boolean>;
  onLeaveGame: () => void;
  isLoading?: boolean;
}

export function GameLobby({
  room,
  players,
  childId,
  isCreator,
  isReady,
  onSetReady,
  onStartGame,
  onLeaveGame,
  isLoading = false,
}: GameLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const gameInfo = GAME_TYPE_INFO[room.gameType];
  const allPlayersReady = players.every(p => p.status === 'ready');
  const canStart = isCreator && allPlayersReady && players.length >= 2;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    setStarting(true);
    await onStartGame();
    setStarting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Game Info Header */}
      <Card className={cn('border-2', gameInfo.color.replace('bg-', 'border-'))}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{gameInfo.title}</CardTitle>
              <p className="text-muted-foreground">{gameInfo.description}</p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {DIFFICULTY_LABELS[room.difficulty]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{players.length} / {room.maxPlayers}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Grade {room.gradeLevel}</span>
              </div>
            </div>
            
            {/* Room Code */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="font-mono text-lg"
            >
              {room.roomCode}
              {copied ? (
                <Check className="w-4 h-4 ml-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Players ({players.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  player.playerId === childId ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {player.playerName?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {player.playerName || 'Player'}
                      </span>
                      {player.playerId === room.creatorId && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {player.playerId === childId && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {PLAYER_STATUS_LABELS[player.status]}
                    </span>
                  </div>
                </div>
                
                <Badge
                  variant={player.status === 'ready' ? 'default' : 'secondary'}
                  className={cn(
                    player.status === 'ready' && 'bg-green-500 hover:bg-green-600'
                  )}
                >
                  {player.status === 'ready' ? 'Ready!' : 'Waiting'}
                </Badge>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: room.maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-muted text-muted-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Waiting for player...
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onLeaveGame}
          className="flex-1"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Leave Game
        </Button>

        {isCreator ? (
          <Button
            onClick={handleStartGame}
            disabled={!canStart || starting || isLoading}
            className={cn('flex-1', gameInfo.color)}
          >
            {starting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {starting ? 'Starting...' : 'Start Game'}
          </Button>
        ) : (
          <Button
            onClick={() => onSetReady(!isReady)}
            variant={isReady ? 'outline' : 'default'}
            className={cn('flex-1', !isReady && gameInfo.color)}
          >
            {isReady ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Ready! (Click to unready)
              </>
            ) : (
              "I'm Ready!"
            )}
          </Button>
        )}
      </div>

      {/* Status message */}
      {isCreator && !canStart && (
        <p className="text-center text-muted-foreground text-sm">
          {players.length < 2
            ? 'Need at least 2 players to start'
            : 'Waiting for all players to be ready...'}
        </p>
      )}
    </div>
  );
}
