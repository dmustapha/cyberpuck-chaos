# Audio Assets

This directory contains the audio assets for Cyber Air Hockey.

## Required Files

### Music (in `/music/`)
- `menu-ambient.mp3` - Atmospheric synthwave for menus (2-3 min, loopable, 80-100 BPM)
- `gameplay-action.mp3` - Energetic synthwave for gameplay (3-4 min, loopable, 120-140 BPM)

### Sound Effects (in `/sfx/`)
- `paddle-hit-1.mp3`, `paddle-hit-2.mp3`, `paddle-hit-3.mp3` - Paddle hit variations
- `wall-bounce-1.mp3`, `wall-bounce-2.mp3` - Wall bounce variations
- `goal-scored.mp3` - Celebratory synth fanfare
- `countdown-beep.mp3` - Digital beep for 3-2-1 countdown
- `countdown-go.mp3` - "Go!" synth stinger
- `victory-fanfare.mp3` - Triumphant synthwave flourish
- `defeat-sound.mp3` - Dramatic but brief defeat sound
- `button-click.mp3` - UI interaction feedback

## Recommended Sources (Royalty-Free)

1. **Pixabay** (https://pixabay.com/music/) - Free synthwave loops and SFX
2. **Freesound.org** (https://freesound.org/) - CC-licensed arcade sounds
3. **Uppbeat** (https://uppbeat.io/) - Royalty-free synthwave music
4. **OpenGameArt** (https://opengameart.org/) - Game-ready audio

## Audio Specifications

- **Format**: MP3 (128-192 kbps for music, 96-128 kbps for SFX)
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo for music, Mono or Stereo for SFX
- **Normalization**: -3 dB peak, -14 LUFS for consistent levels

## Style Guidelines

- **Synthwave/Retro-Futuristic** aesthetic
- Analog synth textures (saw waves, square waves)
- Punchy 808-style drums for gameplay track
- Atmospheric pads for menu track
- Satisfying impact sounds with subtle reverb

## Testing

The audio system will gracefully handle missing files - you'll see console warnings but the game will still work. Add files incrementally and test each one.
