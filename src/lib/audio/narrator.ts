/**
 * Lesson Narrator Service
 * 
 * Provides text-to-speech narration for lessons using the Web Speech API.
 * This is a browser-native solution that works without external API calls,
 * making it fast, free, and privacy-friendly.
 */

interface NarrationOptions {
  rate?: number; // Speech rate (0.1 to 10, default 1)
  pitch?: number; // Voice pitch (0 to 2, default 1)
  volume?: number; // Volume (0 to 1, default 1)
  voice?: SpeechSynthesisVoice | null;
}

interface NarrationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  totalLength: number;
}

export class LessonNarrator {
  private utterance: SpeechSynthesisUtterance | null = null;
  private text: string = '';
  private chunks: string[] = [];
  private currentChunkIndex: number = 0;
  private onStateChange?: (state: NarrationState) => void;
  private onTextHighlight?: (startIndex: number, endIndex: number) => void;
  private options: Required<NarrationOptions>;

  constructor(options: NarrationOptions = {}) {
    this.options = {
      rate: options.rate ?? 1.0,
      pitch: options.pitch ?? 1.0,
      volume: options.volume ?? 1.0,
      voice: options.voice ?? null,
    };

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  /**
   * Check if the browser supports speech synthesis
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Get available voices
   */
  static async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Wait for voices to load
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          resolve(window.speechSynthesis.getVoices());
        }, { once: true });
      }
    });
  }

  /**
   * Get the best voice for the given language
   */
  static async getBestVoice(lang: string = 'en-US'): Promise<SpeechSynthesisVoice | null> {
    const voices = await LessonNarrator.getAvailableVoices();
    
    // Try to find a voice that matches the language and is local (better quality)
    const localVoice = voices.find(v => v.lang === lang && v.localService);
    if (localVoice) return localVoice;
    
    // Fall back to any voice that matches the language
    const anyVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (anyVoice) return anyVoice;
    
    // Use default voice
    return voices[0] || null;
  }

  /**
   * Prepare text for narration by splitting into manageable chunks
   * This prevents issues with very long text
   */
  private prepareText(text: string): string[] {
    // Remove markdown formatting for better speech
    let cleanText = text
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove code
      .replace(/\n{3,}/g, '\n\n'); // Normalize newlines

    // Split into sentences for better control
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    
    // Group sentences into chunks (max ~200 chars per chunk for better pacing)
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > 200 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Start narration of the given text
   */
  async start(text: string): Promise<void> {
    if (!LessonNarrator.isSupported()) {
      throw new Error('Speech synthesis not supported');
    }

    // Stop any ongoing narration
    this.stop();

    this.text = text;
    this.chunks = this.prepareText(text);
    this.currentChunkIndex = 0;

    return this.playNextChunk();
  }

  /**
   * Play the next chunk of text
   */
  private playNextChunk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.currentChunkIndex >= this.chunks.length) {
        this.notifyStateChange();
        resolve();
        return;
      }

      const chunk = this.chunks[this.currentChunkIndex];
      this.utterance = new SpeechSynthesisUtterance(chunk);
      
      // Apply options
      this.utterance.rate = this.options.rate;
      this.utterance.pitch = this.options.pitch;
      this.utterance.volume = this.options.volume;
      
      if (this.options.voice) {
        this.utterance.voice = this.options.voice;
      }

      // Set up event handlers
      this.utterance.onstart = () => {
        this.notifyStateChange();
      };

      this.utterance.onboundary = (event) => {
        // This fires when a word boundary is reached
        // We can use this to highlight text
        if (this.onTextHighlight && event.charIndex !== undefined) {
          const startIndex = event.charIndex;
          const endIndex = event.charIndex + (event.charLength || 0);
          this.onTextHighlight(startIndex, endIndex);
        }
      };

      this.utterance.onend = () => {
        this.currentChunkIndex++;
        this.playNextChunk().then(resolve).catch(reject);
      };

      this.utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(event);
      };

      // Start speaking
      window.speechSynthesis.speak(this.utterance);
    });
  }

  /**
   * Pause narration
   */
  pause(): void {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.notifyStateChange();
    }
  }

  /**
   * Resume narration
   */
  resume(): void {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.notifyStateChange();
    }
  }

  /**
   * Stop narration
   */
  stop(): void {
    window.speechSynthesis.cancel();
    this.currentChunkIndex = 0;
    this.utterance = null;
    this.notifyStateChange();
  }

  /**
   * Set narration speed
   */
  setRate(rate: number): void {
    this.options.rate = Math.max(0.1, Math.min(10, rate));
    // If currently playing, restart with new rate
    if (window.speechSynthesis.speaking) {
      const wasPlaying = !window.speechSynthesis.paused;
      const currentIndex = this.currentChunkIndex;
      this.stop();
      this.currentChunkIndex = currentIndex;
      if (wasPlaying) {
        this.playNextChunk();
      }
    }
  }

  /**
   * Set voice
   */
  setVoice(voice: SpeechSynthesisVoice): void {
    this.options.voice = voice;
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current narration state
   */
  getState(): NarrationState {
    return {
      isPlaying: window.speechSynthesis.speaking && !window.speechSynthesis.paused,
      isPaused: window.speechSynthesis.paused,
      currentPosition: this.currentChunkIndex,
      totalLength: this.chunks.length,
    };
  }

  /**
   * Register state change callback
   */
  onStateChangeCallback(callback: (state: NarrationState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Register text highlight callback
   */
  onTextHighlightCallback(callback: (startIndex: number, endIndex: number) => void): void {
    this.onTextHighlight = callback;
  }

  /**
   * Notify listeners of state change
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
