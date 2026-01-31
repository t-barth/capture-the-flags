# JavaScript File Structure

This directory contains all JavaScript code for the Capture the Flag game.

## Directory Layout

```
js/
├── game.js                 # Main game entry point (loaded by index.html)
├── game/                   # Game runtime modules
│   ├── grid.js            # Grid rendering and visual updates
│   ├── interaction.js     # User input and pointer event handling
│   └── level-manager.js   # Level progression and management
├── utils/                  # Shared utilities (used by game AND level generation)
│   ├── config.js          # Game configuration and constants
│   └── level-generator.js # Level generation algorithm (used by scripts)
└── data/                   # Pre-generated game data
    └── levels-data.js     # 100 pre-calculated levels
```

## Module Responsibilities

### `game.js`
Main game controller that coordinates all modules. Entry point loaded by the HTML file.

### `game/` - Runtime Modules
Modules used during gameplay:
- **grid.js**: Renders the grid, handles visual updates, creates connections
- **interaction.js**: Manages pointer events, drag selection, cell tracking
- **level-manager.js**: Loads levels, tracks progression, converts level format

### `utils/` - Shared Utilities
Code shared between game runtime and level generation:
- **config.js**: Central configuration (grid size, L-shape rules, colors, etc.)
- **level-generator.js**: Backtracking algorithm for generating valid puzzles

### `data/` - Generated Data
Pre-calculated game data:
- **levels-data.js**: 100 pre-generated levels (regenerate with `node scripts/generate-levels.mjs`)

## Import Paths

When importing modules, use relative paths:

```javascript
// From game.js
import { LevelManager } from './game/level-manager.js';
import { GRID_ROWS } from './utils/config.js';

// From game/grid.js
import { TOTAL_CELLS } from '../utils/config.js';
import { LEVELS } from '../data/levels-data.js';
```

## Regenerating Levels

When you change configuration (grid size, dead zones, etc.):

```bash
node scripts/generate-levels.mjs
```

This updates `js/data/levels-data.js` with new levels matching your configuration.
