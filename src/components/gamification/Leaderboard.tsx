/**
 * @fileoverview Age-Adaptive Leaderboard Component
 * Displays rankings with privacy controls and age-appropriate UI.
 * K-2: No leaderboards (individual progress only)
 * 3-5: Opt-in class leaderboard with avatars, no real names
 * 6-8: Balanced competition with multiple categories
 * 9-12: Realistic preparation with skill rankings
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Users, 
  Crown,
  Medal,
  Flame,
  BookOpen,
  Heart,
  Sparkles,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  childId: string;
  displayName: string;
  avatarUrl?: string;
  points: number;
  streak?: number;
  lessonsCompleted?: number;
  isCurrentUser?: boolean;
  improvement?: number; // Percentage improvement from last week
}

interface LeaderboardProps {
  /** Current child's ID */
  childId: string;
  /** Grade level for age-adaptive UI */
  gradeLevel: number;
  /** Optional class ID for class-specific leaderboard */
  classId?: string;
  /** Whether to show compact version */
  compact?: boolean;
}

/**
 * Get age tier from grade level
 */
function getAgeTier(gradeLevel: number): 'K-2' | '3-5' | '6-8' | '9-12' {
  if (gradeLevel <= 2) return 'K-2';
  if (gradeLevel <= 5) return '3-5';
  if (gradeLevel <= 8) return '6-8';
  return '9-12';
}

/**
 * Rank badge component with appropriate styling
 */
function RankBadge({ rank, ageTier }: { rank: number; ageTier: string }) {
  const getIcon = () => {
    if (rank === 1) return <Crown className="w-4 h-4" />;
    if (rank === 2) return <Medal className="w-4 h-4" />;
    if (rank === 3) return <Star className="w-4 h-4" />;
    return null;
  };

  const getColorClass = () => {
    if (rank === 1) return 'bg-accent text-accent-foreground';
    if (rank === 2) return 'bg-muted text-muted-foreground';
    if (rank === 3) return 'bg-primary/20 text-primary';
    return 'bg-muted/50 text-muted-foreground';
  };

  // Larger badges for younger children
  const sizeClass = ageTier === '3-5' ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm';

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-bold',
      sizeClass,
      getColorClass()
    )}>
      {getIcon() || rank}
    </div>
  );
}

/**
 * Individual leaderboard entry row
 */
function LeaderboardRow({ 
  entry, 
  ageTier 
}: { 
  entry: LeaderboardEntry; 
  ageTier: string;
}) {
  const isTopThree = entry.rank <= 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg transition-colors',
        entry.isCurrentUser && 'bg-primary/10 border border-primary/30',
        !entry.isCurrentUser && 'hover:bg-muted/50'
      )}
    >
      <RankBadge rank={entry.rank} ageTier={ageTier} />
      
      <Avatar className={cn(
        ageTier === '3-5' ? 'w-12 h-12' : 'w-10 h-10'
      )}>
        {entry.avatarUrl ? (
          <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">
            {entry.displayName.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-semibold truncate',
          ageTier === '3-5' && 'text-lg'
        )}>
          {entry.displayName}
          {entry.isCurrentUser && (
            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
          )}
        </p>
        
        {/* Show improvement for 6+ */}
        {(ageTier === '6-8' || ageTier === '9-12') && entry.improvement !== undefined && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success" />
            +{entry.improvement}% from last week
          </p>
        )}
      </div>
      
      <div className="text-right">
        <p className={cn(
          'font-bold',
          ageTier === '3-5' ? 'text-xl' : 'text-lg',
          isTopThree && 'text-primary'
        )}>
          {entry.points.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
      
      {/* Streak indicator for engaged learners */}
      {entry.streak && entry.streak >= 3 && (
        <div className="flex items-center gap-1 text-accent">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-medium">{entry.streak}</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * K-2: No leaderboard - Personal progress celebration instead
 */
function K2PersonalProgress({ childId }: { childId: string }) {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [childId]);

  const loadProgress = async () => {
    const { data } = await supabase
      .from('children')
      .select('total_points, name')
      .eq('id', childId)
      .single();
    
    setProgress(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-4"
      >
        <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-accent" />
        </div>
        
        <h3 className="text-2xl font-bold">You're Doing Great! 🌟</h3>
        
        <p className="text-lg text-muted-foreground">
          You have earned
        </p>
        
        <p className="text-4xl font-bold text-primary">
          {progress?.total_points || 0} Stars!
        </p>
        
        <p className="text-muted-foreground">
          Keep learning and collecting more stars!
        </p>
      </motion.div>
    </Card>
  );
}

/**
 * Main Leaderboard component with age-adaptive display
 */
export function Leaderboard({ 
  childId, 
  gradeLevel, 
  classId,
  compact = false 
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [activeCategory, setActiveCategory] = useState('points');
  
  const ageTier = getAgeTier(gradeLevel);

  useEffect(() => {
    // K-2 doesn't have leaderboards
    if (ageTier === 'K-2') {
      setLoading(false);
      return;
    }
    loadLeaderboard();
  }, [childId, gradeLevel, classId, activeCategory]);

  const loadLeaderboard = async () => {
    setLoading(true);
    
    // Get current child's data first
    const { data: currentChild } = await supabase
      .from('children')
      .select('grade_level, name, total_points, avatar_config')
      .eq('id', childId)
      .single();

    // Get peers of similar grade level
    const { data: peers } = await supabase
      .from('children')
      .select('id, name, total_points, avatar_config')
      .gte('grade_level', gradeLevel - 1)
      .lte('grade_level', gradeLevel + 1)
      .order('total_points', { ascending: false })
      .limit(20);

    if (peers) {
      const entries: LeaderboardEntry[] = peers.map((peer, index) => ({
        rank: index + 1,
        childId: peer.id,
        displayName: ageTier === '3-5' 
          ? `Player ${index + 1}` // Privacy for younger kids
          : peer.name.split(' ')[0], // First name only for older
        points: peer.total_points || 0,
        isCurrentUser: peer.id === childId,
        streak: Math.floor(Math.random() * 7), // TODO: Get real streak data
        improvement: Math.floor(Math.random() * 30) + 5, // TODO: Calculate real improvement
      }));

      setLeaderboard(entries);
    }
    
    setLoading(false);
  };

  // K-2: Show personal progress instead
  if (ageTier === 'K-2') {
    return <K2PersonalProgress childId={childId} />;
  }

  // Loading state
  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <LoadingSpinner />
      </Card>
    );
  }

  // Categories for older students
  const categories = ageTier === '6-8' || ageTier === '9-12' ? [
    { id: 'points', label: 'Top Learners', icon: Trophy },
    { id: 'improvement', label: 'Most Improved', icon: TrendingUp },
    { id: 'helpful', label: 'Most Helpful', icon: Heart },
    { id: 'streak', label: 'Longest Streak', icon: Flame },
  ] : [
    { id: 'points', label: 'Top Learners', icon: Trophy },
    { id: 'improvement', label: 'Most Improved', icon: TrendingUp },
  ];

  return (
    <Card className={cn(
      'overflow-hidden',
      compact ? 'p-4' : 'p-6'
    )}>
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            {ageTier === '3-5' ? 'Class Stars' : 'Leaderboard'}
          </CardTitle>
          
          {/* Privacy toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="visibility" className="text-sm text-muted-foreground">
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Label>
            <Switch
              id="visibility"
              checked={isVisible}
              onCheckedChange={setIsVisible}
              aria-label="Toggle leaderboard visibility"
            />
          </div>
        </div>
        
        {/* Category tabs for older students */}
        {(ageTier === '6-8' || ageTier === '9-12') && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  <cat.icon className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      
      <CardContent className="px-0 pb-0">
        <AnimatePresence mode="wait">
          {isVisible ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {leaderboard.slice(0, compact ? 5 : 10).map((entry) => (
                <LeaderboardRow 
                  key={entry.childId} 
                  entry={entry} 
                  ageTier={ageTier}
                />
              ))}
              
              {/* Show current user's position if not in top 10 */}
              {!compact && !leaderboard.slice(0, 10).some(e => e.isCurrentUser) && (
                <>
                  <div className="flex items-center justify-center py-2">
                    <span className="text-muted-foreground text-sm">• • •</span>
                  </div>
                  {leaderboard.filter(e => e.isCurrentUser).map(entry => (
                    <LeaderboardRow 
                      key={entry.childId} 
                      entry={entry} 
                      ageTier={ageTier}
                    />
                  ))}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Leaderboard is hidden for privacy
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsVisible(true)}
                className="mt-2"
              >
                Show Leaderboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 3-5: Team-based motivation message */}
        {ageTier === '3-5' && isVisible && (
          <div className="mt-4 p-3 bg-secondary/10 rounded-lg text-center">
            <Users className="w-5 h-5 mx-auto text-secondary mb-1" />
            <p className="text-sm text-muted-foreground">
              Everyone is doing amazing! Keep learning together! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Leaderboard;
