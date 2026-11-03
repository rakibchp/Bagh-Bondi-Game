# Bagh Bondi

A responsive, browser-playable version of **Bagh Bondi** (Tiger and Goats), a traditional asymmetric strategy game. One player controls four tigers; the other controls twenty goats. The tigers hunt by jumping over goats, while the goats work together to block every tiger.

## Features

- Playable local two-player game with alternating turns
- Interactive five-by-five board with connected movement paths and highlighted legal destinations
- Goat placement phase followed by movement for both sides
- Tiger captures, capture counter, turn indicator, and win detection
- Undo the most recent move or start a fresh game at any time
- In-app rules and strategy guidance
- Responsive layout, keyboard-operable board points, accessible move descriptions, and reduced-motion support
- No account, server state, or extra runtime dependencies required

## Getting started

### Requirements

- Node.js compatible with Next.js 16
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## How to play

1. **Goats place first.** On each goat turn, select an empty point to place one goat. Tigers can move and capture during this phase.
2. **Move along a marked line.** Once all twenty goats have been placed, select one of your pieces and move it to a connected, neighboring empty point.
3. **Tigers capture by jumping.** A tiger can jump over a neighboring goat to an empty point directly beyond it along a board line. Five captures win the game.
4. **Goats win by blocking.** If the tigers have no legal moves, the goats win.

The game uses a four-tiger, twenty-goat setup. The board has orthogonal connections throughout and diagonal connections along the two corner-to-corner paths. Moves are made by clicking or tapping a piece and then a highlighted destination; during goat placement, tap any empty point.

## Project structure

```text
app/
  globals.css       Theme, board styling, responsive layout, and reduced-motion rules
  layout.tsx        Root layout and page metadata
  page.tsx          Interactive game screen and board controls
lib/
  bagh-bondi.ts     Board graph, game state, legal moves, captures, and win conditions
```

The rules engine is kept separate from the React UI so game behavior can be extended independently. The current game is local and pass-and-play; it does not include an AI opponent, online multiplayer, or a persistent leaderboard.

## Development checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
