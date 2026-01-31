# Level Generation Scripts

## Generating Pre-calculated Levels

To regenerate the 100 pre-calculated levels (e.g., after changing grid configuration):

```bash
node scripts/generate-levels.mjs
```

This will:
1. Use the current configuration from `js/utils/config.js`
2. Generate 100 valid, solvable levels
3. Overwrite `js/data/levels-data.js` with the new levels

## Requirements

- Node.js (version 14+ for ES module support)
- No additional dependencies needed

## What Gets Generated

The script creates a file `js/data/levels-data.js` containing:
- An array of 100 level objects
- Each level includes:
  - `levelNumber`: Level identifier (1-100)
  - `grid`: The solution grid with L-shape IDs
  - `deadZoneIndices`: Positions of dead zones
  - `xPositions`: Flag positions (one per L-shape)

## File Size

Typical file size: ~80-90 KB depending on grid configuration

## When to Regenerate

Regenerate levels when you change:
- Grid dimensions (GRID_ROWS, GRID_COLS)
- Number of dead zones (DEAD_ZONES)
- L-shape size (L_SHAPE_SIZE)

After regeneration, commit the new `js/data/levels-data.js` to ensure all players get the same levels.
