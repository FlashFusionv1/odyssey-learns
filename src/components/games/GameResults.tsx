/**
 * Game Results Component
 * Displays final scores and rankings
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Star, 
  Home, 
  RotateCcw, 
  Share2,
  Sparkles,
  Target,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import type { GamePlayer, GameRoom } from '@/types/games';
import { GAME_TYPE_INFO } from '@/types/games';

interface GameResultsProps {
  room: GameRoom;
  players: GamePlayer[];
  childId: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function GameResults({
  room,
  players,
  childId,
  onPlayAgain,
  onGoHome,
}: GameResultsProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const gameInfo = GAME_TYPE_INFO[room.gameType];
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const myPlayer = players.find(p => p.playerId === childId);
  const isWinner = sortedPlayers[0]?.playerId === childId;
  const myRank = sortedPlayers.findIndex(p => p.playerId === childId) + 1;

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    if (isWinner) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [isWinner]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankLabel = (rank: number) => {
    if (rank === 1) return '1st Place';
    if (rank === 2) return '2nd Place';
    if (rank === 3) return '3rd Place';
    return `${rank}th Place`;
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Your Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={cn(
            'border-2 overflow-hidden',
            isWinner && 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50'
          )}>
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto mb-4"
              >
                {isWinner ? (
                  <div className="relative">
                    <Trophy className="w-24 h-24 text-yellow-500" />
                    <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                ) : (
                  getRankIcon(myRank)
                )}
              </motion.div>
              <CardTitle className="text-3xl">
                {isWinner ? (
                  <span className="text-yellow-600">🎉 You Won! 🎉</span>
                ) : (
                  <span>{getRankLabel(myRank)}</span>
                )}
              </CardTitle>
              <p className="text-muted-foreground">
                {gameInfo.title} - {room.roomCode}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{myPlayer?.score || 0}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">
                    {myPlayer?.correctAnswers || 0}/{myPlayer?.totalAnswers || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">
                    {Math.round(((myPlayer?.correctAnswers || 0) / (myPlayer?.totalAnswers || 1)) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Final Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => {
                  const isMe = player.playerId === childId;
                  const rank = index + 1;

                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        isMe && 'bg-primary/10 border-2 border-primary',
                        rank === 1 && !isMe && 'bg-yellow-50',
                        rank > 1 && !isMe && 'bg-muted/30'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                          {getRankIcon(rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={cn(
                            rank === 1 && 'bg-yellow-100 text-yellow-700',
                            rank === 2 && 'bg-gray-100 text-gray-700',
                            rank === 3 && 'bg-amber-100 text-amber-700',
                            rank > 3 && 'bg-muted'
                          )}>
                            {player.playerName?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {player.playerName || 'Player'}
                            </span>
                            {isMe && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {player.correctAnswers}/{player.totalAnswers} correct
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold">{player.score}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            onClick={onGoHome}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <Button
            onClick={onPlayAgain}
            className={cn('flex-1', gameInfo.color)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </motion.div>
      </div>
    </>
  );
}
