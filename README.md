# CyberPuck Chaos: AI-Driven Air Hockey on OneChain

Real-time air hockey with an LLM-powered chaos agent that warps the game mid-match. Play solo against AI or challenge friends in multiplayer. Results recorded on-chain.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Move](https://img.shields.io/badge/Move-OneChain-1D4ED8)](https://onelabs.cc/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Hero](docs/images/landing.png)

## Live Demo

**[cyberpuck-chaos.vercel.app](https://cyberpuck-chaos.vercel.app)**

Connect a OneChain wallet to play. AI mode works without a wallet.

---

## What Is CyberPuck Chaos?

An air hockey game where an AI agent watches every match and drops physics modifiers in real time. Speed boosts, paddle shrinks, invisible pucks. The agent decides what to deploy and when based on the current score and match state. All match results are recorded on OneChain Testnet via Move smart contracts.

Built for OneHack 3.0 (GameFi + AI tracks).

---

## Screenshots

| Landing | Game Mode Selection |
|---------|---------------------|
| ![Landing](docs/images/mobile.png) | ![Game Modes](docs/images/game.png) |

---

## Features

- **Chaos Agent**: Anthropic-powered LLM picks modifiers in real time based on match state
- **6 Modifier Types**: Speed boost, paddle grow/shrink, puck grow/shrink, invisible puck
- **AI Opponents**: Three difficulty levels (easy, medium, hard) with configurable score limits
- **Real-time Multiplayer**: Server-authoritative physics at 60Hz, WebSocket sync at 30Hz
- **On-chain Match Records**: Scores, duration, and modifiers deployed are stored on OneChain
- **Wallet Integration**: OneChain dapp-kit for wallet connection and on-chain identity
- **Reconnection Handling**: 5-second grace period for dropped connections mid-game
- **Adaptive Pacing**: Chaos modifier frequency ramps up as the match nears completion

---

## How to Play

**AI Mode**
1. Tap "Play Now" from the landing page
2. Select "VS AI"
3. Pick a difficulty and score limit
4. Drag your paddle to block and strike the puck
5. Watch for chaos modifiers dropping mid-match

**Multiplayer**
1. Select "VS Player"
2. Create a room (generates a code) or join with a friend's code
3. Both players ready up, then a 3-2-1 countdown starts
4. First to the score limit wins. Results go on-chain.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion, GSAP |
| Physics | Matter.js (client + server) |
| State | Zustand |
| Server | Express 5, ws (WebSocket) |
| AI Agent | Anthropic SDK (Claude Haiku 4.5) |
| Blockchain | Move on OneChain Testnet |
| Wallet | @onelabs/dapp-kit |
| Audio | Howler.js |

---

## How It Works

```
Player A ---|                         |--- Physics Engine (60Hz)
            |---> WebSocket Server <--|--- Chaos Agent (LLM)
Player B ---|     (Render)            |--- Room Manager
                      |
                      v
              Express REST API
                      |
                      v
            OneChain Testnet Contract
            (match results + AI decisions)
```

**AI Mode**: Client runs Matter.js physics locally. Server provides chaos modifiers via REST.

**Multiplayer**: Server owns all game state. Clients send paddle positions, server runs physics and broadcasts state 30 times per second. The chaos agent observes both modes and deploys modifiers through the same LLM pipeline.

---

## Smart Contracts

| Module | Network | Description |
|--------|---------|-------------|
| `chaos_puck` | OneChain Testnet | Player profiles, match recording, AI decision logging |

Package ID: `0xcf5aa21a59cb1439a28e6537c830071ebb2589f324bbf2941761471ff41e76f7`

Key functions:
- `create_profile()` — Initialize player profile with ELO rating
- `update_profile_win(elo_gain, modifiers_survived)` — Update stats on win
- `update_profile_loss(elo_loss, modifiers_survived)` — Update stats on loss
- `record_match(player1, player2, scores, duration, modifiers)` — Store match result
- `record_decision(match_id, modifier_type, target, reason)` — Log AI agent decisions

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/games` | Create new game |
| GET | `/api/games` | List open games |
| GET | `/api/games/:id` | Get game by ID or room code |
| POST | `/api/games/:id/join` | Join existing game |
| POST | `/api/games/:id/result` | Submit final score |
| POST | `/api/games/:id/cancel` | Cancel waiting game |
| POST | `/api/chaos/observe` | Get AI modifier decision for current state |
| POST | `/api/record-match` | Record match on OneChain |

---

## Running Locally

### Prerequisites
- Node.js 18+
- An Anthropic API key (for the chaos agent)

### 1. Clone and install

```bash
git clone https://github.com/dmustapha/cyberpuck-chaos.git
cd cyberpuck-chaos
npm install
cd server && npm install && cd ..
```

### 2. Set environment variables

```bash
cp .env.example .env.local
```

Fill in your values. See `.env.example` for all required variables.

For the server:
```bash
cp .env.example server/.env
```

Key variables:
- `ANTHROPIC_API_KEY` — Powers the chaos agent
- `SERVER_PRIVATE_KEY` — Ed25519 key for signing on-chain transactions
- `NEXT_PUBLIC_WS_URL` — WebSocket URL (use `ws://localhost:3001` for local dev)

### 3. Start the server

```bash
cd server && npm run dev
```

### 4. Start the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
cyberpuck-chaos/
├── src/
│   ├── app/
│   │   ├── (cyber)/              # Game routes (home, game, profile, leaderboard, settings)
│   │   ├── providers.tsx         # OneChain dapp-kit setup
│   │   └── globals.css           # Tailwind v4 + cyber theme styles
│   ├── components/
│   │   ├── game/                 # Canvas renderer
│   │   └── cyber/                # Themed UI (game screens, home sections, modals)
│   ├── hooks/                    # Game engine, WebSocket, chaos, input, wallet hooks
│   ├── stores/                   # Zustand stores (game, player, settings, achievements)
│   ├── lib/
│   │   ├── physics/              # Matter.js engine + config
│   │   ├── onechain/             # RPC + package ID config
│   │   ├── cyber/                # Theme tokens + utilities
│   │   └── audio/                # Sound system
│   ├── contexts/                 # Multiplayer WebSocket + audio providers
│   └── types/                    # TypeScript interfaces
├── server/
│   ├── src/
│   │   ├── index.ts              # Express + WebSocket entry
│   │   ├── chaos/                # LLM agent, executor, middleware, skill definitions
│   │   ├── physics/              # Server-side Matter.js engine
│   │   ├── websocket/            # Room manager, message handlers
│   │   └── services/             # Game logic, on-chain recording
│   └── Dockerfile
├── contracts/
│   ├── Move.toml                 # Package manifest
│   └── sources/chaos_puck.move   # Smart contract
├── vercel.json                   # Frontend deploy config
└── .env.example                  # Environment variable template
```

---

## License

MIT
