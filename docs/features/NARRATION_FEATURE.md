# Voice-Based Lesson Narration Feature

## Overview

The voice-based lesson narration feature provides text-to-speech functionality for all lessons in Odyssey Learns, making content more accessible and engaging for students.

## Features

### 🎙️ Text-to-Speech Narration
- **Browser-based**: Uses the Web Speech API (no external API calls required)
- **Free**: No cost per narration
- **Privacy-friendly**: All processing happens in the browser
- **Automatic text preprocessing**: Removes markdown formatting for better speech

### 🎮 Playback Controls
- **Play/Pause/Stop**: Full control over narration
- **Speed adjustment**: 0.5x to 2.0x playback speed
- **Volume control**: 0% to 100% with mute toggle
- **Progress indicator**: Visual feedback showing narration progress

### 🗣️ Voice Selection
- **Multiple voices**: Choose from all available system voices
- **Language support**: Automatically selects best English voice
- **Voice preferences**: Saved per child profile

### 💾 User Preferences
- **Persistent settings**: Speed, volume, and voice preferences saved
- **Per-child profiles**: Each child can have their own preferences
- **Local storage**: Settings stored in browser localStorage

## Usage

### For Students

1. **Navigate to any lesson** in the Lessons section
2. **Look for the "Lesson Narration" card** above the lesson content
3. **Click Play** to start listening to the lesson
4. **Adjust settings** as needed:
   - Use the speed slider to make narration faster or slower
   - Use the volume slider to adjust audio level
   - Select a different voice from the dropdown if desired

### For Parents

No additional setup required! The feature is automatically available for all children on all lessons.

## Technical Details

### Architecture

```
src/lib/audio/
├── narrator.ts        # Core narration service
└── preferences.ts     # User preferences management

src/hooks/
└── useNarration.ts   # React hook for easy integration

src/components/learning/
└── LessonAudioPlayer.tsx  # UI component
```

### Browser Compatibility

The feature requires the Web Speech API, which is supported in:
- ✅ Chrome/Edge 33+
- ✅ Safari 7+
- ✅ Firefox 49+
- ✅ Opera 21+

**Note**: The feature gracefully degrades if not supported - the player simply won't be shown.

### Performance

- **No network requests**: All processing is local
- **Minimal memory footprint**: ~50KB for the service code
- **Chunking system**: Handles long lessons efficiently by breaking into smaller segments
- **Lazy loading**: Narration only initializes when needed

## Implementation Details

### Text Preprocessing

The narration service automatically:
1. Removes markdown headers (`#`, `##`, etc.)
2. Removes bold/italic formatting (`**text**`, `*text*`)
3. Removes links (`[text](url)`)
4. Removes code blocks (`` `code` ``)
5. Normalizes newlines for better pacing

### Chunking Strategy

For long lessons:
- Text is split into ~200 character chunks
- Chunks are based on sentence boundaries
- Each chunk is narrated sequentially
- Progress indicator updates as chunks complete

### User Preferences

Preferences are stored in `localStorage` with the key:
```
odyssey_narration_preferences_{childId}
```

Default preferences:
```javascript
{
  autoPlay: false,
  rate: 1.0,
  volume: 1.0,
  voiceName: null,
  enabled: true
}
```

## Accessibility

The narration feature improves accessibility for:
- **Younger children** who are still learning to read
- **Students with dyslexia** or other reading difficulties
- **Auditory learners** who learn better by listening
- **Multi-sensory learning** combining reading and listening

### ARIA Labels

All controls include proper ARIA labels:
- `aria-label="Play narration"` on play button
- `aria-label="Pause narration"` on pause button
- `aria-label="Stop narration"` on stop button
- `aria-label="Playback speed"` on speed slider
- `aria-label="Volume"` on volume slider

## Future Enhancements

Planned improvements:
- [ ] Text highlighting synchronized with speech
- [ ] Offline voice download support
- [ ] More language support (Spanish, French, etc.)
- [ ] Automated lesson summaries
- [ ] Pronunciation customization
- [ ] Background narration while browsing

## Troubleshooting

### No sound?
1. Check if system volume is up
2. Check if browser has permission to use audio
3. Try selecting a different voice
4. Refresh the page and try again

### Narration sounds robotic?
- Try selecting a different voice (some are higher quality)
- Local voices typically sound better than cloud voices
- Adjust the speed - slower can sound more natural

### Narration not showing?
- Check browser compatibility (must support Web Speech API)
- Check if browser extensions are blocking the feature
- Try a different browser

## Support

For issues or feature requests:
- Open an issue on GitHub
- Contact support@odysseylearns.com
- Check the troubleshooting guide in the documentation

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-09  
**Author**: Odyssey Learns Development Team
