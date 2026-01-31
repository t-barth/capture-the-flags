/**
 * Game Configuration
 * Central location for all game constants and parameters
 */

// ===== Grid Configuration =====
export const GRID_ROWS = 5; // Number of rows
export const GRID_COLS = 5; // Number of columns
export const TOTAL_CELLS = GRID_ROWS * GRID_COLS; // Total cells in grid

// ===== L-Shape Configuration =====
export const L_SHAPE_SIZE = 3; // Number of cells per L-shape
export const L_SHAPE_BOUNDING_BOX = 2; // L-shape spans a 2x2 area

// ===== Calculated Game Rules =====
// Note: For a valid puzzle, (TOTAL_CELLS - DEAD_ZONES) must be divisible by L_SHAPE_SIZE
export const DEAD_ZONES = 4; // Number of dead zones
export const FILLED_CELLS = TOTAL_CELLS - DEAD_ZONES; // Cells to fill with L-shapes
export const TOTAL_L_SHAPES = FILLED_CELLS / L_SHAPE_SIZE; // Number of L-shapes

// ===== Game Rules =====
export const FLAGS_PER_L_SHAPE = 1; // Each L-shape must have exactly 1 flag
export const CELLS_PER_SELECTION = L_SHAPE_SIZE; // Player must select 3 cells

// ===== Visual Configuration =====
export const CELL_SIZE_PX = 75; // Cell width/height in pixels
export const GRID_GAP_PX = 15; // Gap between cells in pixels
export const CONNECTION_WIDTH_H_PX = 17; // Horizontal connection width
export const CONNECTION_HEIGHT_H_PX = 20; // Horizontal connection height
export const CONNECTION_WIDTH_V_PX = 20; // Vertical connection width
export const CONNECTION_HEIGHT_V_PX = 17; // Vertical connection height

// ===== L-Shape Patterns (Dynamic) =====
/**
 * Generates all 8 possible L-shape patterns based on current grid dimensions
 * Patterns are relative offsets from a starting cell index
 * @returns {number[][]} Array of 8 L-shape patterns
 */
export function getLShapePatterns() {
  const W = GRID_COLS; // Width needed for calculations

  return [
    [0, 1, W], // ┐ shape (corner top-right)
    [0, 1, W + 1], // ┘ shape (corner bottom-right)
    [0, W, W + 1], // └ shape (corner bottom-left)
    [1, W, W + 1], // ┌ shape (corner top-left)
    [0, W, -1], // └ rotated (left variant)
    [0, -1, W - 1], // L extended top-left
    [0, W, 2 * W], // | extended down
    [0, 1, -W + 1], // L extended up
  ];
}

// ===== Helper Functions =====

/**
 * Converts a cell index to row/column coordinates
 * @param {number} index - Cell index
 * @returns {Object} Object with r (row) and c (column) properties
 */
export function indexToCoords(index) {
  return {
    r: Math.floor(index / GRID_COLS),
    c: index % GRID_COLS,
  };
}

/**
 * Converts row/column coordinates to cell index
 * @param {number} row - Row number
 * @param {number} col - Column number
 * @returns {number} Cell index
 */
export function coordsToIndex(row, col) {
  return row * GRID_COLS + col;
}

/**
 * Checks if an index is within grid bounds
 * @param {number} index - Cell index to check
 * @returns {boolean} True if index is valid
 */
export function isValidIndex(index) {
  return index >= 0 && index < TOTAL_CELLS;
}

/**
 * Calculates Manhattan distance between two indices
 * @param {number} index1 - First cell index
 * @param {number} index2 - Second cell index
 * @returns {number} Manhattan distance (sum of row and column differences)
 */
export function manhattanDistance(index1, index2) {
  const coords1 = indexToCoords(index1);
  const coords2 = indexToCoords(index2);
  return Math.abs(coords1.r - coords2.r) + Math.abs(coords1.c - coords2.c);
}

// ===== Game Text (Localization Ready) =====
export const TEXT = {
  TITLE: '🚩 Capture the Flag',
  BUTTON_NEXT: 'Nächstes Level',
  BUTTON_RESET: 'Reset',
  SUCCESS_MESSAGE: '🏁 Flaggen gesichert!',
  DEAD_ZONE_MARKER: '•',
};
