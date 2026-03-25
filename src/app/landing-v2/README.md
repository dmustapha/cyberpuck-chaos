# EPIC Cinematic Landing Page V2

**Location:** `/landing-v2`

An award-worthy, cinematic landing page featuring a 4-second Remotion intro sequence that seamlessly transitions into an interactive experience with Framer Motion animations.

## Features

### Phase 1: Remotion Cinematic Intro (0-4 seconds)
- **Frame 0-30 (0-1s):** "INITIALIZE..." text with pulsing cyan light
- **Frame 30-60 (1-2s):** Hyperspace effect with streaking lines converging
- **Frame 60-90 (2-3s):** Puck formation and rush toward camera with motion blur
- **Frame 90-120 (3-4s):** Title slam with "CYBER" and "AIR HOCKEY" colliding, particle explosion

### Phase 2: Interactive Landing Page
Post-intro content with smooth Framer Motion animations:
- **HeroReveal:** Title persistence, typewriter subtitle, animated CTAs, counter stats
- **FeaturesSection:** Scroll-triggered cards flying in from different angles with glowing borders
- **ArenaPreview:** Top-down 3D arena with animated bouncing puck
- **Interactive Elements:** Mouse cursor trail, particle effects, parallax scrolling

## Technical Stack

- **Remotion Player:** Video-like intro sequence (120 frames @ 30fps)
- **Framer Motion:** Smooth React animations and scroll triggers
- **Custom Animations:** CSS keyframes, transforms, and particle systems

## Components

```
/components/landing/
├── CinematicIntro.tsx      # Remotion composition (4-second intro)
├── HeroReveal.tsx          # Post-intro hero with typewriter & counters
├── FeaturesSection.tsx     # Scroll-triggered feature cards
└── ArenaPreview.tsx        # Animated game table preview
```

## Design System

### Colors
- **Deep Space:** `#030308` (background)
- **Electric Cyan:** `#00f0ff` (primary, glows)
- **Hot White:** `#ffffff` (text, accents)
- **Accent Amber:** `#f59e0b` (highlights)

### Typography
- **Headings:** Orbitron (900 weight for titles)
- **Body:** Inter (regular text, secondary)
- **Monospace:** Orbitron (stats, labels)

### Effects
- **Glows:** Heavy cyan box-shadows (0 0 20px, 0 0 40px, 0 0 60px)
- **Motion Blur:** On fast-moving elements (puck rush)
- **Particle Trails:** Following cursor and background animations
- **Scan Lines:** Subtle moving gradients on panels

## Usage

Simply navigate to `/landing-v2` to see the full cinematic experience.

**Note:** The intro is NOT skippable (by design - it's only 4 seconds and sets the tone).

## Performance

- Intro renders at 30fps for smooth playback
- Framer Motion animations use GPU acceleration
- Particles use CSS transforms for 60fps
- Responsive on all devices (mobile, tablet, desktop)

## Future Enhancements

- Add sound effects to intro (impact slam, whoosh sounds)
- GSAP timeline for even more complex animations
- WebGL shader effects for puck trails
- Video background option for arena preview
