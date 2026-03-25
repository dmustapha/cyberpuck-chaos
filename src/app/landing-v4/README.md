# Liquid Metal Puck Landing Page (v4)

## Overview
A hypnotic, premium landing experience featuring a 3D liquid metal puck that morphs through five stages as the user scrolls. Built with Three.js, GSAP, and Framer Motion for buttery-smooth animations.

## Visual Concept
Chrome/silver liquid metal object that transforms through scroll, creating a mesmerizing journey from puck to arena.

## Tech Stack
- **Three.js** (@react-three/fiber, @react-three/drei) - 3D rendering and morphing
- **GSAP** - Smooth morph timelines and transitions
- **Framer Motion** - Scroll tracking and UI animations
- **Next.js 16** - React framework with Turbopack

## Scroll Journey

### Stage 1: Puck (0-20%)
**Shape:** Flattened metallic sphere (hockey puck)
**Animation:** Gentle floating and rotation
**Copy:** "AIR HOCKEY - Where precision meets velocity in the ultimate arena"

### Stage 2: Trophy (20-40%)
**Shape:** Extruded trophy with handles
**Animation:** Liquid morph with squash/stretch
**Copy:** "COMPETE - Face opponents worldwide in real-time battles"

### Stage 3: Hexagon Badge (40-60%)
**Shape:** Six-sided badge with rank number
**Animation:** Morphs from trophy, displays "1"
**Copy:** "ASCEND - Rise through elite divisions with every victory"

### Stage 4: Stats Ring (60-80%)
**Shape:** Torus with animated bars
**Animation:** Rotating stats visualization
**Copy:** "EVOLVE - Track performance. Master technique. Dominate."

### Stage 5: Game Table (80-100%)
**Shape:** Rectangular arena with center line
**Animation:** Final transformation, CTA appears
**Copy:** "BEGIN - Your arena awaits"

## Material Properties
```tsx
<meshStandardMaterial
  metalness={1}        // Full metallic
  roughness={0.08}     // Ultra smooth
  envMapIntensity={1.2} // Enhanced reflections
  color="#e8e8e8"      // Chrome silver
/>
```

## Design Principles

### Premium Feel
- Dark gradient background (#0a0a20 → #000)
- Multi-layered ambient glows (blue, purple, cyan)
- Minimal, elegant typography
- Lots of negative space

### Liquid Morphing
- GSAP timelines with squash/stretch physics
- 1.2s morph duration with power3.inOut easing
- Continuous gentle rotation and floating
- Smooth opacity and position transitions

### Typography
- Title: 8xl/9xl, tight tracking, gradient from white to white/40
- Subtitle: lg/xl, white/50, light weight, wide tracking
- CTA: Glass morphism button with animated gradient overlay

### Performance
- WebGL rendering via @react-three/fiber
- HDR environment maps for realistic reflections
- Optimized geometry (no unnecessary vertices)
- Hardware-accelerated transforms

## Component Structure

```
src/app/landing-v4/
  page.tsx                 # Main landing page
  README.md                # This file

src/components/landing/
  LiquidMetalPuck.tsx      # Main scroll container
  MorphShape.tsx           # Canvas wrapper
  MetalPuck3D.tsx          # Three.js 3D object with morphing
  ScrollMorph.tsx          # Scroll utilities and hooks
```

## Usage

### Development
```bash
cd /Users/MAC/Desktop/dev/linera/air-hockey
npm run dev
# Navigate to http://localhost:3000/landing-v4
```

### Customization

#### Change morph stages
Edit `MetalPuck3D.tsx` geometries and scroll thresholds:
```tsx
const geometries = {
  puck: new THREE.SphereGeometry(2, 64, 64),
  trophy: createTrophyGeometry(),
  // Add more shapes...
}
```

#### Adjust scroll ranges
Edit `LiquidMetalPuck.tsx` stages array:
```tsx
const stages: ScrollStage[] = [
  { range: [0, 0.2], title: 'TITLE', subtitle: 'Subtitle' },
  // Modify ranges...
]
```

#### Change materials
Edit `MetalPuck3D.tsx` meshStandardMaterial props:
```tsx
<meshStandardMaterial
  metalness={1}      // 0-1 (plastic to metal)
  roughness={0.08}   // 0-1 (mirror to matte)
  color="#e8e8e8"    // Base color
/>
```

## Performance Tips

1. **Reduce geometry complexity** - Lower segment counts for mobile
2. **Disable shadows** - Not needed for this aesthetic
3. **Use environment presets** - Faster than custom HDR files
4. **Limit morph transitions** - Current 5 stages is optimal

## Accessibility

- Scroll indicator with clear "Scroll" label
- High contrast text (white on dark)
- Reduced motion support (TODO: Add prefers-reduced-motion)
- Keyboard navigation (scroll with arrow keys/space)

## Browser Support

- Chrome 90+ (recommended)
- Safari 15+
- Firefox 88+
- Edge 90+

WebGL 2.0 required for Three.js features.

## Future Enhancements

- [ ] Add prefers-reduced-motion support
- [ ] Implement touch/swipe for mobile
- [ ] Add sound effects on morph transitions
- [ ] Create particle trail behind puck
- [ ] Add HDR environment map for better reflections
- [ ] Implement vertex displacement for liquid ripples

## Credits
Inspired by Apple product pages and premium design systems.
Built with obsessive attention to detail and pixel perfection.
