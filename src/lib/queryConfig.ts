/**
 * Enhanced React Query configuration for optimal caching and performance
 * 
 * Updated: 2026-01-17
 * - Added game-specific stale times for multiplayer
 * - Added lesson list caching optimization
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Stale time configurations by data type
 */
export const STALE_TIMES = {
  /** User profile - rarely changes */
  STATIC: 30 * 60 * 1000, // 30 minutes
  /** Lessons, content - occasionally changes */
  CONTENT: 10 * 60 * 1000, // 10 minutes
  /** Lesson list - moderate caching */
  LESSON_LIST: 10 * 60 * 1000, // 10 minutes
  /** Progress, stats - changes frequently */
  DYNAMIC: 2 * 60 * 1000, // 2 minutes
  /** Real-time data - always fresh */
  REALTIME: 0, // Always refetch
  
  // Game-specific stale times
  /** Game room data - very short for realtime sync */
  GAME_ROOM: 5 * 1000, // 5 seconds
  /** Game players list - short for near-realtime */
  GAME_PLAYERS: 3 * 1000, // 3 seconds
  /** Game questions - never stale once loaded */
  GAME_QUESTIONS: Infinity,
  /** Game results - moderate caching */
  GAME_RESULTS: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Garbage collection time configurations
 */
export const GC_TIMES = {
  /** Keep static data in cache longer */
  STATIC: 60 * 60 * 1000, // 1 hour
  /** Standard content */
  CONTENT: 30 * 60 * 1000, // 30 minutes
  /** Dynamic data */
  DYNAMIC: 10 * 60 * 1000, // 10 minutes
  /** Real-time data */
  REALTIME: 5 * 60 * 1000, // 5 minutes
  /** Game data - short GC for memory efficiency */
  GAME: 3 * 60 * 1000, // 3 minutes
} as const;

/**
 * Query key factory for consistent key generation
 */
export const queryKeys = {
  // Auth & Profile
  profile: (userId: string) => ['profile', userId] as const,
  user: () => ['user'] as const,
  
  // Children
  children: (parentId: string) => ['children', parentId] as const,
  child: (childId: string) => ['child', childId] as const,
  childProgress: (childId: string) => ['child-progress', childId] as const,
  
  // Lessons
  lessons: (filters?: Record<string, unknown>) => ['lessons', filters] as const,
  lesson: (lessonId: string) => ['lesson', lessonId] as const,
  lessonProgress: (childId: string, lessonId: string) => 
    ['lesson-progress', childId, lessonId] as const,
  
  // Achievements
  badges: (childId: string) => ['badges', childId] as const,
  rewards: (childId: string) => ['rewards', childId] as const,
  
  // Analytics
  analytics: (childId: string, range: string) => 
    ['analytics', childId, range] as const,
  
  // Room & Decorations
  room: (childId: string) => ['room', childId] as const,
  decorations: () => ['decorations'] as const,
  
  // Social
  connections: (childId: string) => ['connections', childId] as const,
  activities: (childId: string) => ['activities', childId] as const,
  
  // Multiplayer Games
  gameRoom: (roomId: string) => ['game-room', roomId] as const,
  gamePlayers: (roomId: string) => ['game-players', roomId] as const,
  gameQuestions: (roomId: string) => ['game-questions', roomId] as const,
  gameResults: (roomId: string) => ['game-results', roomId] as const,
  availableRooms: (gradeLevel: number) => ['available-rooms', gradeLevel] as const,
} as const;

/**
 * Create an optimized QueryClient with production-ready defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent refetching when window regains focus
        refetchOnWindowFocus: false,
        // Don't refetch when component remounts
        refetchOnMount: false,
        // Don't refetch on reconnect by default
        refetchOnReconnect: 'always',
        // Retry failed requests once
        retry: 1,
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => 
          Math.min(1000 * 2 ** attemptIndex, 30000),
        // Default stale time
        staleTime: STALE_TIMES.CONTENT,
        // Default garbage collection time
        gcTime: GC_TIMES.CONTENT,
        // Network mode
        networkMode: 'offlineFirst',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Network mode for mutations
        networkMode: 'online',
      },
    },
  });
}

/**
 * Prefetch commonly accessed data
 */
export async function prefetchCommonData(
  queryClient: QueryClient,
  userId?: string
): Promise<void> {
  if (!userId) return;
  
  // Import supabase dynamically to avoid circular deps
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Prefetch children list
  queryClient.prefetchQuery({
    queryKey: queryKeys.children(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', userId)
        .is('deleted_at', null);
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIMES.CONTENT,
  });
  
  // Prefetch decorations (static content)
  queryClient.prefetchQuery({
    queryKey: queryKeys.decorations(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_decorations')
        .select('*');
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIMES.STATIC,
  });
}

/**
 * Clear all cached data (useful for logout)
 */
export function clearQueryCache(queryClient: QueryClient): void {
  queryClient.clear();
}
