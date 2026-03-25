# Physics Playground Landing Page

## Overview
An addictive, physics-based landing page featuring 30+ interactive pucks with real collision physics. Users control a paddle with their cursor to hit pucks, creating particle explosions and visual feedback.

## Tech Stack
- **Canvas 2D API** - 60fps physics rendering
- **Custom Physics Engine** (`usePhysics` hook) - Real momentum transfer, collisions, bounces
- **GSAP** - Counter animations, screen shake, celebration effects
- **Framer Motion** - Scroll animations, feature reveals, button interactions

## Features

### Hero Section (100vh)
- 30 pucks with real physics simulation
- Cursor-controlled paddle with momentum transfer
- Puck-to-puck and puck-to-wall collisions
- Energy conservation and damping
- Visual trails and speed sparks
- Target detection for CTA button

### Live Stats Bar (Sticky)
- **Pucks Hit** - Counts collisions between paddle and pucks
- **Top Speed** - Tracks maximum puck velocity
- **Chaos Level** - Average speed of all pucks (0-100%)
- GSAP-animated counters with smooth transitions

### Features Grid
- Framer Motion stagger animations on scroll
- Glassmorphic cards with hover effects
- Icon + title + description layout
- Gradient borders and glow effects

### Visual Design
- **Colors**: Black (#030308) + Cyan (#00f0ff) gradient spectrum
- **Fonts**: Orbitron (variable font from layout)
- **Effects**: 
  - Puck trails (ghosting)
  - Collision sparks (speed-based)
  - Particle explosions (on CTA hits)
  - Radial glows and gradients
  - Screen shake on collision

## Physics Implementation

### Core Mechanics
1. **Collision Detection** - Circle-to-circle distance checks
2. **Collision Resolution** - Momentum transfer using impulse method
3. **Wall Bounces** - Energy loss on boundary collisions
4. **Friction** - Velocity damping (0.995 factor)
5. **Trail System** - Last 8 positions with alpha fade

### Performance
- 60fps rendering on Canvas 2D
- Optimized collision checks (early exit on separation)
- RequestAnimationFrame loop
- Device pixel ratio scaling for crisp rendering

## File Structure
```
src/
├── app/landing-v3/
│   ├── page.tsx          # Main landing page component
│   └── README.md         # This file
├── components/landing/
│   └── PhysicsCanvas.tsx # Canvas renderer + particle system
└── hooks/
    └── usePhysics.ts     # Physics simulation engine
```

## Usage
```tsx
// Navigate to /landing-v3
// Move cursor to control paddle
// Hit pucks into "PLAY NOW" button for explosions
// Watch live stats update in real-time
```

## Interaction Flow
1. User moves cursor → Paddle follows with velocity
2. Paddle hits puck → Momentum transfer + counter increment
3. Puck hits CTA → Particle explosion + celebration
4. Click CTA → GSAP scale animation + navigation

## Customization

### Adjust Physics Constants
Edit `src/hooks/usePhysics.ts`:
```typescript
const FRICTION = 0.995;        // Velocity damping
const BOUNCE_DAMPING = 0.85;   // Wall bounce energy loss
const COLLISION_FORCE = 1.2;   // Collision impact multiplier
const PUCK_RADIUS = 12;        // Puck size
const PADDLE_RADIUS = 40;      // Paddle size
```

### Change Visual Style
Edit `src/components/landing/PhysicsCanvas.tsx`:
- Puck colors: `colors` array
- Glow intensity: Gradient stops
- Trail length: `TRAIL_LENGTH` constant
- Particle count: `createExplosion` count parameter

## Known Optimizations
- Uses device pixel ratio for retina displays
- Particle cleanup (removes when alpha < 0)
- Trail length limited to 8 positions
- Collision checks skip on velocity separation
- requestAnimationFrame for optimal frame timing

## Future Enhancements
- [ ] Add sound effects on collision
- [ ] Mobile touch optimization
- [ ] Puck power-ups (speed boost, size change)
- [ ] Multiplayer cursor battles
- [ ] Leaderboard integration
- [ ] Replay system
- [ ] Custom puck skins
- [ ] Gravity well effects
