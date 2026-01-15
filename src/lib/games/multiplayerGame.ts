/**
 * Multiplayer Game Engine
 * Handles real-time game state, question generation, and scoring
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';
import type {
  GameRoom,
  GamePlayer,
  GameQuestion,
  GameAnswer,
  GameType,
  GameDifficulty,
  GameSettings,
  GameState,
} from '@/types/games';

export class MultiplayerGame {
  private channel: RealtimeChannel | null = null;
  private roomId: string | null = null;
  private playerId: string | null = null;
  private onStateChange: ((state: Partial<GameState>) => void) | null = null;

  /**
   * Create a new game room
   */
  async createRoom(
    gameType: GameType,
    creatorId: string,
    gradeLevel: number,
    difficulty: GameDifficulty = 'medium',
    settings: GameSettings = {}
  ): Promise<GameRoom | null> {
    const { data, error } = await supabase
      .from('game_rooms')
      .insert([{
        game_type: gameType,
        creator_id: creatorId,
        grade_level: gradeLevel,
        difficulty,
        settings: settings as Json,
        status: 'waiting',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating game room:', error);
      return null;
    }

    // Auto-join creator to the room
    await this.joinRoom(data.id, creatorId);

    return this.mapRoomFromDb(data);
  }

  /**
   * Join an existing game room
   */
  async joinRoom(roomId: string, playerId: string): Promise<boolean> {
    // Check if already in room
    const { data: existing } = await supabase
      .from('game_players')
      .select('id')
      .eq('room_id', roomId)
      .eq('player_id', playerId)
      .maybeSingle();

    if (existing) {
      this.roomId = roomId;
      this.playerId = playerId;
      this.subscribeToRoom(roomId);
      return true;
    }

    // Check room capacity
    const { data: room } = await supabase
      .from('game_rooms')
      .select('max_players, status')
      .eq('id', roomId)
      .single();

    if (!room || room.status !== 'waiting') {
      return false;
    }

    const { count } = await supabase
      .from('game_players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if ((count ?? 0) >= room.max_players) {
      return false;
    }

    // Join the room
    const { error } = await supabase.from('game_players').insert({
      room_id: roomId,
      player_id: playerId,
      status: 'joined',
    });

    if (error) {
      console.error('Error joining room:', error);
      return false;
    }

    this.roomId = roomId;
    this.playerId = playerId;
    this.subscribeToRoom(roomId);

    return true;
  }

  /**
   * Join room by room code
   */
  async joinByCode(roomCode: string, playerId: string): Promise<GameRoom | null> {
    const { data: room } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (!room) {
      return null;
    }

    const joined = await this.joinRoom(room.id, playerId);
    return joined ? this.mapRoomFromDb(room) : null;
  }

  /**
   * Set player ready status
   */
  async setReady(ready: boolean): Promise<void> {
    if (!this.roomId || !this.playerId) return;

    await supabase
      .from('game_players')
      .update({ status: ready ? 'ready' : 'joined' })
      .eq('room_id', this.roomId)
      .eq('player_id', this.playerId);

    // Broadcast status change
    this.channel?.send({
      type: 'broadcast',
      event: 'player_ready',
      payload: { playerId: this.playerId, ready },
    });
  }

  /**
   * Start the game (creator only)
   */
  async startGame(): Promise<boolean> {
    if (!this.roomId) return false;

    // Generate questions
    const questions = await this.generateQuestions();
    if (!questions.length) return false;

    // Insert questions
    const { error: qError } = await supabase.from('game_questions').insert(
      questions.map((q, i) => ({
        room_id: this.roomId,
        question_number: i + 1,
        question_text: q.questionText,
        question_type: q.questionType,
        options: q.options,
        correct_answer: q.correctAnswer,
        points: q.points,
        time_limit_seconds: q.timeLimitSeconds,
        subject: q.subject,
      }))
    );

    if (qError) {
      console.error('Error inserting questions:', qError);
      return false;
    }

    // Update room status
    const { error: rError } = await supabase
      .from('game_rooms')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', this.roomId);

    if (rError) {
      console.error('Error starting game:', rError);
      return false;
    }

    // Update all players to playing status
    await supabase
      .from('game_players')
      .update({ status: 'playing' })
      .eq('room_id', this.roomId);

    // Broadcast game start
    this.channel?.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { roomId: this.roomId },
    });

    return true;
  }

  /**
   * Submit an answer
   */
  async submitAnswer(
    questionId: string,
    answer: string,
    timeTakenMs: number
  ): Promise<{ isCorrect: boolean; pointsEarned: number }> {
    if (!this.roomId || !this.playerId) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    // Get the question to check answer
    const { data: question } = await supabase
      .from('game_questions')
      .select('correct_answer, points, time_limit_seconds')
      .eq('id', questionId)
      .single();

    if (!question) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    const isCorrect = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
    
    // Calculate points with time bonus
    let pointsEarned = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, 1 - timeTakenMs / (question.time_limit_seconds * 1000));
      pointsEarned = Math.round(question.points * (1 + timeBonus * 0.5));
    }

    // Insert answer
    await supabase.from('game_answers').insert({
      room_id: this.roomId,
      question_id: questionId,
      player_id: this.playerId,
      answer_text: answer,
      is_correct: isCorrect,
      time_taken_ms: timeTakenMs,
      points_earned: pointsEarned,
    });

    // Update player score directly
    const { data: currentPlayer } = await supabase
      .from('game_players')
      .select('score, correct_answers, total_answers')
      .eq('room_id', this.roomId)
      .eq('player_id', this.playerId)
      .single();

    if (currentPlayer) {
      await supabase
        .from('game_players')
        .update({
          score: (currentPlayer.score || 0) + pointsEarned,
          correct_answers: (currentPlayer.correct_answers || 0) + (isCorrect ? 1 : 0),
          total_answers: (currentPlayer.total_answers || 0) + 1,
        })
        .eq('room_id', this.roomId)
        .eq('player_id', this.playerId);
    }

    // Broadcast answer
    this.channel?.send({
      type: 'broadcast',
      event: 'answer_submitted',
      payload: { playerId: this.playerId, isCorrect, pointsEarned },
    });

    return { isCorrect, pointsEarned };
  }

  /**
   * End the game and calculate results
   */
  async endGame(): Promise<void> {
    if (!this.roomId) return;

    // Get final scores
    const { data: players } = await supabase
      .from('game_players')
      .select('player_id, score')
      .eq('room_id', this.roomId)
      .order('score', { ascending: false });

    if (!players?.length) return;

    // Calculate ranks and XP
    const finalScores: Record<string, number> = {};
    const xpAwarded: Record<string, number> = {};

    players.forEach((p, i) => {
      finalScores[p.player_id] = p.score;
      // XP based on rank: 1st=100, 2nd=75, 3rd=50, others=25
      xpAwarded[p.player_id] = i === 0 ? 100 : i === 1 ? 75 : i === 2 ? 50 : 25;
      
      // Update rank
      supabase
        .from('game_players')
        .update({ rank: i + 1, status: 'finished', finished_at: new Date().toISOString() })
        .eq('room_id', this.roomId!)
        .eq('player_id', p.player_id);
    });

    // Get game duration
    const { data: room } = await supabase
      .from('game_rooms')
      .select('started_at')
      .eq('id', this.roomId)
      .single();

    const duration = room?.started_at
      ? Math.round((Date.now() - new Date(room.started_at).getTime()) / 1000)
      : 0;

    // Insert game result
    await supabase.from('game_results').insert({
      room_id: this.roomId,
      winner_id: players[0].player_id,
      final_scores: finalScores,
      total_questions: 10, // Default
      duration_seconds: duration,
      xp_awarded: xpAwarded,
    });

    // Update room status
    await supabase
      .from('game_rooms')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', this.roomId);

    // Broadcast game end
    this.channel?.send({
      type: 'broadcast',
      event: 'game_end',
      payload: { finalScores, winner: players[0].player_id },
    });
  }

  /**
   * Leave the current game
   */
  async leaveGame(): Promise<void> {
    if (this.roomId && this.playerId) {
      await supabase
        .from('game_players')
        .update({ status: 'left' })
        .eq('room_id', this.roomId)
        .eq('player_id', this.playerId);

      this.channel?.send({
        type: 'broadcast',
        event: 'player_left',
        payload: { playerId: this.playerId },
      });
    }

    this.cleanup();
  }

  /**
   * Subscribe to state changes
   */
  onStateUpdate(callback: (state: Partial<GameState>) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.roomId = null;
    this.playerId = null;
    this.onStateChange = null;
  }

  // Private methods

  private subscribeToRoom(roomId: string): void {
    this.channel = supabase
      .channel(`game:${roomId}`)
      .on('broadcast', { event: 'player_ready' }, (payload) => {
        this.onStateChange?.({ isLoading: false });
      })
      .on('broadcast', { event: 'game_start' }, () => {
        this.onStateChange?.({ isLoading: false });
      })
      .on('broadcast', { event: 'answer_submitted' }, () => {
        // Trigger UI refresh
        this.onStateChange?.({ isLoading: false });
      })
      .on('broadcast', { event: 'game_end' }, (payload) => {
        this.onStateChange?.({ isLoading: false });
      })
      .on('broadcast', { event: 'next_question' }, (payload) => {
        this.onStateChange?.({ 
          currentQuestionIndex: payload.payload.questionIndex,
          timeRemaining: payload.payload.timeLimit,
        });
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `room_id=eq.${roomId}` },
        () => {
          this.onStateChange?.({ isLoading: false });
        }
      )
      .subscribe();
  }

  private async generateQuestions(): Promise<Partial<GameQuestion>[]> {
    // Get room info for question generation
    const { data: room } = await supabase
      .from('game_rooms')
      .select('game_type, grade_level, difficulty, settings')
      .eq('id', this.roomId!)
      .single();

    if (!room) return [];

    const totalQuestions = (room.settings as GameSettings)?.totalQuestions || 10;
    const timePerQuestion = (room.settings as GameSettings)?.timePerQuestion || 30;

    // Generate questions based on game type
    return this.generateQuestionsForType(
      room.game_type as GameType,
      room.grade_level,
      room.difficulty as GameDifficulty,
      totalQuestions,
      timePerQuestion
    );
  }

  private generateQuestionsForType(
    gameType: GameType,
    gradeLevel: number,
    difficulty: GameDifficulty,
    count: number,
    timeLimit: number
  ): Partial<GameQuestion>[] {
    const questions: Partial<GameQuestion>[] = [];
    
    for (let i = 0; i < count; i++) {
      switch (gameType) {
        case 'math_race':
          questions.push(this.generateMathQuestion(gradeLevel, difficulty, timeLimit));
          break;
        case 'spelling_bee':
          questions.push(this.generateSpellingQuestion(gradeLevel, difficulty, timeLimit));
          break;
        case 'science_quiz':
          questions.push(this.generateScienceQuestion(gradeLevel, difficulty, timeLimit));
          break;
        default:
          questions.push(this.generateMathQuestion(gradeLevel, difficulty, timeLimit));
      }
    }

    return questions;
  }

  private generateMathQuestion(
    gradeLevel: number,
    difficulty: GameDifficulty,
    timeLimit: number
  ): Partial<GameQuestion> {
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    const maxNum = (gradeLevel + 1) * 5 * difficultyMultiplier;
    
    const operations = gradeLevel < 3 ? ['+', '-'] : ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let a: number, b: number, answer: number;

    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
      case '÷':
        b = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        break;
      default:
        a = 1;
        b = 1;
        answer = 2;
    }

    // Generate wrong options
    const options = [answer.toString()];
    while (options.length < 4) {
      const wrong = answer + (Math.floor(Math.random() * 10) - 5);
      if (wrong !== answer && wrong > 0 && !options.includes(wrong.toString())) {
        options.push(wrong.toString());
      }
    }
    options.sort(() => Math.random() - 0.5);

    return {
      questionText: `What is ${a} ${operation} ${b}?`,
      questionType: 'multiple_choice',
      options,
      correctAnswer: answer.toString(),
      points: 10 * difficultyMultiplier,
      timeLimitSeconds: timeLimit,
      subject: 'math',
    };
  }

  private generateSpellingQuestion(
    gradeLevel: number,
    difficulty: GameDifficulty,
    timeLimit: number
  ): Partial<GameQuestion> {
    // Word banks by grade level
    const wordBanks: Record<number, string[]> = {
      0: ['cat', 'dog', 'sun', 'run', 'fun', 'hat', 'bat', 'mat'],
      1: ['tree', 'book', 'play', 'rain', 'snow', 'jump', 'read'],
      2: ['house', 'mouse', 'cloud', 'friend', 'school', 'happy'],
      3: ['beautiful', 'different', 'important', 'together', 'sometimes'],
      4: ['knowledge', 'necessary', 'separate', 'definition', 'experience'],
      5: ['environment', 'government', 'temperature', 'immediately'],
    };

    const level = Math.min(gradeLevel, 5);
    const words = wordBanks[level] || wordBanks[0];
    const word = words[Math.floor(Math.random() * words.length)];

    // Create a scrambled hint
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');

    return {
      questionText: `Unscramble the letters: ${scrambled.toUpperCase()}`,
      questionType: 'spelling',
      options: null,
      correctAnswer: word,
      points: 10 + word.length,
      timeLimitSeconds: timeLimit + 10, // Extra time for spelling
      subject: 'reading',
    };
  }

  private generateScienceQuestion(
    gradeLevel: number,
    difficulty: GameDifficulty,
    timeLimit: number
  ): Partial<GameQuestion> {
    const scienceQuestions = [
      {
        q: 'What planet is known as the Red Planet?',
        options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
        answer: 'Mars',
      },
      {
        q: 'What do plants need to make food?',
        options: ['Sunlight', 'Darkness', 'Ice', 'Metal'],
        answer: 'Sunlight',
      },
      {
        q: 'What is the largest organ in the human body?',
        options: ['Skin', 'Heart', 'Brain', 'Liver'],
        answer: 'Skin',
      },
      {
        q: 'What gas do plants release?',
        options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'],
        answer: 'Oxygen',
      },
      {
        q: 'How many legs does a spider have?',
        options: ['8', '6', '10', '4'],
        answer: '8',
      },
    ];

    const question = scienceQuestions[Math.floor(Math.random() * scienceQuestions.length)];

    return {
      questionText: question.q,
      questionType: 'multiple_choice',
      options: question.options,
      correctAnswer: question.answer,
      points: 10,
      timeLimitSeconds: timeLimit,
      subject: 'science',
    };
  }

  private mapRoomFromDb(data: Record<string, unknown>): GameRoom {
    return {
      id: data.id as string,
      gameType: data.game_type as GameType,
      creatorId: data.creator_id as string | null,
      status: data.status as 'waiting' | 'in_progress' | 'completed' | 'cancelled',
      maxPlayers: data.max_players as number,
      gradeLevel: data.grade_level as number,
      difficulty: data.difficulty as GameDifficulty,
      settings: (data.settings as GameSettings) || {},
      roomCode: data.room_code as string,
      startedAt: data.started_at as string | null,
      endedAt: data.ended_at as string | null,
      createdAt: data.created_at as string,
    };
  }
}

// Singleton instance
export const gameEngine = new MultiplayerGame();
