/**
 * Level Generator Module
 * Generates valid puzzle grids filled with L-shaped triominoes
 */

import {
    TOTAL_CELLS,
    FILLED_CELLS,
    DEAD_ZONES,
    L_SHAPE_SIZE,
    L_SHAPE_BOUNDING_BOX,
    getLShapePatterns,
    indexToCoords,
    isValidIndex,
    manhattanDistance
} from './config.js';

/**
 * Validates if given indices form a valid L-shape on the grid
 * @param {number[]} indices - Array of cell indices
 * @param {Array} grid - Current grid state
 * @returns {boolean} True if indices form a valid L-shape
 */
function isValidL(indices, grid) {
    // Check if any index is out of bounds or already occupied (including dead zones)
    if (indices.some(i => !isValidIndex(i) || grid[i] !== null)) {
        return false;
    }

    // Convert indices to row/col coordinates
    const coords = indices.map(i => indexToCoords(i));

    // Calculate bounding box dimensions
    const rD = Math.max(...coords.map(p => p.r)) - Math.min(...coords.map(p => p.r));
    const cD = Math.max(...coords.map(p => p.c)) - Math.min(...coords.map(p => p.c));

    // Check if all cells are adjacent to at least one other cell
    const adj = indices.every(i =>
        indices.some(j => i !== j && manhattanDistance(i, j) === 1)
    );

    // Valid L-shape: spans L_SHAPE_BOUNDING_BOX area, has L_SHAPE_SIZE unique cells, all adjacent
    return rD === L_SHAPE_BOUNDING_BOX - 1 &&
           cD === L_SHAPE_BOUNDING_BOX - 1 &&
           new Set(indices).size === L_SHAPE_SIZE &&
           adj;
}

/**
 * Attempts to fill the grid with valid L-shapes using backtracking
 * @param {Array} grid - Current grid state (null = empty, number/string = filled)
 * @param {number} index - Current position being filled
 * @returns {boolean} True if grid was successfully filled
 */
function attemptFill(grid, index) {
    // Base case: reached end of grid
    if (index === TOTAL_CELLS) {
        // Valid solution: count L-shape cells (exclude dead zones)
        const filledCells = grid.filter(v => v !== null && v !== 'DEAD_ZONE').length;
        return filledCells === FILLED_CELLS;
    }

    // Skip if current cell is already filled (including dead zones)
    if (grid[index] !== null) {
        return attemptFill(grid, index + 1);
    }

    // Try each pattern in random order
    for (let p of getLShapePatterns().sort(() => Math.random() - 0.5)) {
        const shape = p.map(off => index + off);

        if (isValidL(shape, grid)) {
            // Mark cells as part of this shape
            const id = Math.random();
            shape.forEach(i => grid[i] = id);

            // Recursively try to fill rest of grid
            if (attemptFill(grid, index + 1)) {
                return true;
            }

            // Backtrack: unmark cells
            shape.forEach(i => grid[i] = null);
        }
    }

    // Try leaving this cell empty (dead zone) and continue
    return attemptFill(grid, index + 1);
}

/**
 * Generates a complete puzzle with L-shapes and flag positions
 * @param {number} maxAttempts - Maximum attempts to find valid configuration
 * @returns {Object} Puzzle object with grid, deadZoneIndices, and xPositions
 */
export function generatePuzzle(maxAttempts = 50) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Pre-select random positions for dead zones
        const deadZoneIndices = [];
        const availableIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);

        // Randomly select DEAD_ZONES positions
        for (let i = 0; i < DEAD_ZONES; i++) {
            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            deadZoneIndices.push(availableIndices[randomIndex]);
            availableIndices.splice(randomIndex, 1);
        }

        // Initialize grid with pre-marked dead zones
        const grid = Array(TOTAL_CELLS).fill(null);
        deadZoneIndices.forEach(idx => {
            grid[idx] = 'DEAD_ZONE'; // Mark as dead zone (not null)
        });

        if (attemptFill(grid, 0)) {
            // Group cells by shape ID (exclude dead zones)
            const shapes = {};
            grid.forEach((id, idx) => {
                if (id !== null && id !== 'DEAD_ZONE') {
                    if (!shapes[id]) shapes[id] = [];
                    shapes[id].push(idx);
                }
            });

            // Place one flag randomly in each L-shape
            const xPositions = Object.values(shapes).map(shapeIndices =>
                shapeIndices[Math.floor(Math.random() * L_SHAPE_SIZE)]
            );

            return {
                grid,
                deadZoneIndex: deadZoneIndices[0], // Backward compatibility
                deadZoneIndices,
                xPositions
            };
        }
    }

    // If all attempts failed, return null (caller should retry with simpler config)
    console.warn('Failed to generate puzzle after', maxAttempts, 'attempts');
    return null;
}
