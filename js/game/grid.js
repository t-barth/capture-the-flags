/**
 * Grid Renderer Module
 * Handles all grid rendering and visual updates
 */

import {
    TOTAL_CELLS,
    TEXT,
    indexToCoords,
    manhattanDistance
} from '../utils/config.js';

export class GridRenderer {
    constructor(gridElement) {
        this.gridElement = gridElement;
        this.cells = [];
        this.deadZoneIndex = -1; // Backward compatibility
        this.deadZoneIndices = [];
        this.xPositions = [];
    }

    /**
     * Renders the complete grid with flags and dead zones
     * @param {Object} puzzle - Puzzle object with deadZoneIndices and xPositions
     * @param {Function} onPointerDown - Callback for pointer down events
     * @param {Function} onPointerOver - Callback for pointer over events
     */
    render(puzzle, onPointerDown, onPointerMove) {
        this.deadZoneIndices = puzzle.deadZoneIndices || [puzzle.deadZoneIndex];
        this.deadZoneIndex = this.deadZoneIndices[0]; // Backward compatibility
        this.xPositions = puzzle.xPositions;

        this.gridElement.innerHTML = '';
        this.cells = [];

        for (let i = 0; i < TOTAL_CELLS; i++) {
            const cell = document.createElement('div');
            const isDeadZone = this.deadZoneIndices.includes(i);
            cell.className = 'cell' + (isDeadZone ? ' dead-zone' : '');

            // Store index for touch detection
            cell.dataset.cellIndex = i;

            // Set cell content (dead zone marker or flag)
            if (isDeadZone) {
                cell.innerHTML = TEXT.DEAD_ZONE_MARKER;
            } else if (this.xPositions.includes(i)) {
                cell.innerHTML = '<span class="flag-icon">🚩</span>';
            }

            // Attach event handlers
            cell.onpointerdown = (e) => {
                e.preventDefault();
                onPointerDown(i, e);
            };

            // Handle both pointerover (desktop) and pointermove (mobile)
            cell.onpointerover = () => onPointerMove(i);
            cell.onpointermove = (e) => {
                e.preventDefault();
                onPointerMove(i);
            };

            this.gridElement.appendChild(cell);
            this.cells.push(cell);
        }
    }

    /**
     * Highlights selected cells
     * @param {number[]} indices - Array of cell indices to highlight
     */
    highlightCells(indices) {
        indices.forEach(i => {
            if (i >= 0 && i < this.cells.length) {
                this.cells[i].classList.add('selected');
            }
        });
    }

    /**
     * Removes highlight from selected cells
     * @param {number[]} indices - Array of cell indices to unhighlight
     */
    unhighlightCells(indices) {
        indices.forEach(i => {
            if (i >= 0 && i < this.cells.length) {
                this.cells[i].classList.remove('selected');
            }
        });
    }

    /**
     * Marks cells as completed and creates visual connections
     * @param {number[]} indices - Array of cell indices to mark as completed
     */
    markCompleted(indices) {
        indices.forEach(i => {
            if (i >= 0 && i < this.cells.length) {
                this.cells[i].classList.add('completed');
                this.cells[i].classList.remove('selected');
            }
        });
        this.createConnections(indices);
    }

    /**
     * Creates visual connection lines between adjacent cells
     * @param {number[]} indices - Array of cell indices to connect
     */
    createConnections(indices) {
        for (let i of indices) {
            for (let j of indices) {
                if (i === j) continue;

                // Check if cells are adjacent (Manhattan distance = 1)
                if (manhattanDistance(i, j) === 1) {
                    const conn = document.createElement('div');
                    const coords1 = indexToCoords(i);
                    const coords2 = indexToCoords(j);

                    // Determine connection direction (horizontal or vertical)
                    conn.className = 'conn ' + (coords1.r === coords2.r ? 'conn-h' : 'conn-v');

                    // Position the connection - using CSS variables for responsive sizing
                    if (coords1.r === coords2.r) {
                        // Horizontal connection
                        if (coords1.c < coords2.c) {
                            conn.style.left = '100%';
                        } else {
                            conn.style.left = 'calc(-1 * var(--connection-h-width))';
                        }
                    } else {
                        // Vertical connection
                        if (coords1.r < coords2.r) {
                            conn.style.top = '100%';
                        } else {
                            conn.style.top = 'calc(-1 * var(--connection-v-height))';
                        }
                    }

                    this.cells[i].appendChild(conn);
                }
            }
        }
    }

    /**
     * Resets the grid by removing all selections and completions
     */
    reset() {
        this.cells.forEach((cell, i) => {
            if (!this.deadZoneIndices.includes(i)) {
                cell.classList.remove('selected', 'completed');
                // Remove all connection elements
                cell.querySelectorAll('.conn').forEach(conn => conn.remove());
            }
        });
    }

    /**
     * Checks if a cell is a dead zone
     * @param {number} index - Cell index to check
     * @returns {boolean} True if cell is a dead zone
     */
    isDeadZone(index) {
        return this.deadZoneIndices.includes(index);
    }

    /**
     * Gets the flag positions
     * @returns {number[]} Array of indices where flags are placed
     */
    getFlagPositions() {
        return this.xPositions;
    }
}
