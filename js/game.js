/**
 * Main Game Controller
 * Coordinates all modules and manages game state
 */

import { LevelManager } from './game/level-manager.js';
import { GridRenderer } from './game/grid.js';
import { InteractionHandler } from './game/interaction.js';
import {
    GRID_ROWS,
    GRID_COLS,
    FILLED_CELLS,
    FLAGS_PER_L_SHAPE,
    L_SHAPE_BOUNDING_BOX,
    TEXT,
    indexToCoords
} from './utils/config.js';
import { TOTAL_LEVELS } from './data/levels-data.js';

const STORAGE_KEY = 'ctf_completed_levels';

class CaptureTheFlagGame {
    constructor() {
        // Sync CSS variables with JS config
        document.documentElement.style.setProperty('--grid-rows', GRID_ROWS);
        document.documentElement.style.setProperty('--grid-cols', GRID_COLS);

        // Initialize modules
        this.levelManager = new LevelManager();
        this.gridRenderer = new GridRenderer(document.getElementById('grid'));
        this.interactionHandler = new InteractionHandler();

        // Game state
        this.currentPuzzle = null;
        this.completedLevels = this.loadCompletedLevels();

        // Screen elements
        this.overviewScreen = document.getElementById('overview-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.levelGrid = document.getElementById('level-grid');

        // UI elements
        this.successMsg = document.getElementById('success-msg');
        this.nextBtn = document.getElementById('next-btn');
        this.solutionDisplay = document.getElementById('solution-display');
        this.levelIndicator = document.getElementById('level-indicator');
        this.overviewBtn = document.getElementById('overview-btn');

        // Setup interaction callbacks
        this.interactionHandler.initialize(
            (selection) => this.onSelectionComplete(selection),
            (selection, action) => this.onSelectionChange(selection, action)
        );

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for buttons and pointer events
     */
    setupEventListeners() {
        // Button event listeners
        this.nextBtn.addEventListener('click', () => this.generateLevel());
        this.overviewBtn.addEventListener('click', () => this.showLevelOverview());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetCurrentLevel());
        document.getElementById('solution-btn').addEventListener('click', () => this.showSolution());

        // Global pointer up to end drag
        window.addEventListener('pointerup', () => this.interactionHandler.endDrag());

        // Grid pointer leave to end drag
        document.getElementById('grid').addEventListener('pointerleave', () => this.interactionHandler.endDrag());
    }

    /**
     * Loads the next level
     */
    generateLevel() {
        const level = this.levelManager.nextLevel();

        if (level) {
            this.loadLevel(level);
        } else {
            // No more levels - show completion message
            this.successMsg.innerHTML = '🎉 All levels completed! You won!';
            this.nextBtn.disabled = true;
        }
    }

    /**
     * Loads a specific level
     * @param {Object} level - Level data to load
     */
    loadLevel(level) {
        // Clear success message
        this.successMsg.innerHTML = '';

        // Disable and reset next button
        this.nextBtn.disabled = true;
        this.nextBtn.classList.remove('unlocked');

        // Hide solution display
        this.solutionDisplay.classList.remove('visible');

        // Convert minimal level data to puzzle format
        this.currentPuzzle = this.levelManager.levelToPuzzle(level);

        // Reset interaction state
        this.interactionHandler.clearUsedIndices();

        // Update level indicator
        this.updateLevelIndicator();

        // Render the puzzle
        this.gridRenderer.render(
            this.currentPuzzle,
            (index, e) => this.onPointerDown(index, e),
            (index) => this.onPointerOver(index)
        );
    }

    /**
     * Updates the level indicator display
     */
    updateLevelIndicator() {
        if (this.levelIndicator) {
            const current = this.levelManager.getCurrentLevelNumber();
            const total = this.levelManager.getTotalLevels();
            this.levelIndicator.textContent = `Level ${current} / ${total}`;
        }
    }

    /**
     * Handles pointer down on a cell
     */
    onPointerDown(index, event) {
        this.interactionHandler.handlePointerDown(
            index,
            (i) => !this.gridRenderer.isDeadZone(i)
        );
    }

    /**
     * Handles pointer over on a cell
     */
    onPointerOver(index) {
        this.interactionHandler.handlePointerOver(
            index,
            (i) => !this.gridRenderer.isDeadZone(i)
        );
    }

    /**
     * Called when selection changes (for visual feedback)
     */
    onSelectionChange(selection, action) {
        if (action === 'add') {
            this.gridRenderer.highlightCells(selection);
        } else if (action === 'remove') {
            this.gridRenderer.unhighlightCells(selection);
        }
    }

    /**
     * Called when user completes a 3-cell selection
     */
    onSelectionComplete(selection) {
        // Check if selection is valid
        if (this.isValidSelection(selection)) {
            // Mark as completed
            this.gridRenderer.markCompleted(selection);
            this.interactionHandler.markAsUsed(selection);

            // Check win condition (all cells filled)
            if (this.interactionHandler.getUsedCount() === FILLED_CELLS) {
                this.onLevelComplete();
            }
        } else {
            // Invalid selection - reset
            this.interactionHandler.resetSelection();
        }
    }

    /**
     * Validates if the selection is a correct L-shape with exactly one flag
     */
    isValidSelection(selection) {
        // Count flags in selection
        const flagPositions = this.gridRenderer.getFlagPositions();
        const flagCount = selection.filter(i => flagPositions.includes(i)).length;

        // Must have exactly FLAGS_PER_L_SHAPE flags
        if (flagCount !== FLAGS_PER_L_SHAPE) return false;

        // Check if selection forms an L-shape
        const coords = selection.map(i => indexToCoords(i));

        const rowDiff = Math.max(...coords.map(p => p.r)) - Math.min(...coords.map(p => p.r));
        const colDiff = Math.max(...coords.map(p => p.c)) - Math.min(...coords.map(p => p.c));

        // Valid L-shape: spans L_SHAPE_BOUNDING_BOX area
        return rowDiff === L_SHAPE_BOUNDING_BOX - 1 && colDiff === L_SHAPE_BOUNDING_BOX - 1;
    }

    /**
     * Called when level is completed successfully
     */
    onLevelComplete() {
        this.markLevelCompleted();
        this.successMsg.innerHTML = TEXT.SUCCESS_MESSAGE;
        this.nextBtn.disabled = false;
        this.nextBtn.classList.add('unlocked');
    }

    /**
     * Resets the current level
     */
    resetCurrentLevel() {
        this.interactionHandler.clearUsedIndices();
        this.successMsg.innerHTML = '';
        this.nextBtn.disabled = true;
        this.nextBtn.classList.remove('unlocked');
        this.gridRenderer.reset();
        this.solutionDisplay.classList.remove('visible');
    }

    /**
     * Shows the level overview screen
     */
    showLevelOverview() {
        this.gameScreen.classList.add('hidden');
        this.overviewScreen.classList.remove('hidden');
        this.renderLevelOverview();
    }

    /**
     * Shows the game screen
     */
    showGameScreen() {
        this.overviewScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
    }

    /**
     * Renders the level overview grid with all 100 levels
     */
    renderLevelOverview() {
        this.levelGrid.innerHTML = '';

        const currentLevel = this.levelManager.getCurrentLevelNumber();

        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;

            // Add state classes
            if (this.completedLevels.has(i)) {
                btn.classList.add('completed');
            }
            if (i === currentLevel) {
                btn.classList.add('current');
            }

            // Add click handler
            btn.addEventListener('click', () => this.selectLevel(i));

            this.levelGrid.appendChild(btn);
        }
    }

    /**
     * Handles level selection from overview
     */
    selectLevel(levelNumber) {
        const level = this.levelManager.goToLevel(levelNumber);
        if (level) {
            this.loadLevel(level);
            this.showGameScreen();
        }
    }

    /**
     * Loads completed levels from localStorage
     */
    loadCompletedLevels() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch (e) {
            console.error('Failed to load completed levels:', e);
            return new Set();
        }
    }

    /**
     * Saves completed levels to localStorage
     */
    saveCompletedLevels() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.completedLevels]));
        } catch (e) {
            console.error('Failed to save completed levels:', e);
        }
    }

    /**
     * Marks current level as completed
     */
    markLevelCompleted() {
        const currentLevel = this.levelManager.getCurrentLevelNumber();
        this.completedLevels.add(currentLevel);
        this.saveCompletedLevels();
    }

    /**
     * Shows the solution for the current puzzle
     */
    showSolution() {
        if (!this.currentPuzzle) return;

        // Build solution text
        let solutionText = '=== LEVEL INFO ===\n\n';

        const deadZones = this.currentPuzzle.deadZoneIndices;
        const flags = this.currentPuzzle.xPositions;

        solutionText += `Dead Zones (${deadZones.length}):\n`;
        solutionText += `  Indices: [${deadZones.join(', ')}]\n`;
        solutionText += `  Coords: ${deadZones.map(i => {
            const c = indexToCoords(i);
            return `(${c.r},${c.c})`;
        }).join(', ')}\n\n`;

        solutionText += `Flags (${flags.length}):\n`;
        solutionText += `  Indices: [${flags.join(', ')}]\n`;
        solutionText += `  Coords: ${flags.map(i => {
            const c = indexToCoords(i);
            return `(${c.r},${c.c})`;
        }).join(', ')}\n`;

        // Display solution
        this.solutionDisplay.textContent = solutionText;
        this.solutionDisplay.classList.add('visible');

        // Also log to console
        console.log(solutionText);
    }

    /**
     * Starts the game
     */
    start() {
        // Show level overview as starting screen
        this.showLevelOverview();
    }
}

// Initialize and start the game when DOM is ready
const game = new CaptureTheFlagGame();
game.start();
