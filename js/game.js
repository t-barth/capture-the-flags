/**
 * Main Game Controller
 * Coordinates all modules and manages game state
 */

import { LevelManager } from './game/level-manager.js';
import { GridRenderer } from './game/grid.js';
import { InteractionHandler } from './game/interaction.js';
import { GRID_ROWS, GRID_COLS, FILLED_CELLS, FLAGS_PER_L_SHAPE, L_SHAPE_BOUNDING_BOX, TEXT, indexToCoords } from './utils/config.js';
import { TOTAL_LEVELS } from './data/levels-data.js';
import { TUTORIAL_LEVEL, TUTORIAL_STEPS } from './data/tutorial-data.js';
import { CelebrationManager } from './utils/celebration.js';
import { getThemeForLevel, applyTheme, getThemeDisplay } from './utils/themes.js';

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
    this.isTutorialMode = false;
    this.tutorialStep = 0;

    // Screen elements
    this.overviewScreen = document.getElementById('overview-screen');
    this.gameScreen = document.getElementById('game-screen');
    this.levelGrid = document.getElementById('level-grid');

    // UI elements
    this.successMsg = document.getElementById('success-msg');
    this.nextBtn = document.getElementById('next-btn');
    this.levelIndicator = document.getElementById('level-indicator');
    this.overviewBtn = document.getElementById('overview-btn');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');

    // Tutorial elements
    this.tutorialOverlay = document.getElementById('tutorial-overlay');
    this.tutorialTitle = document.getElementById('tutorial-title');
    this.tutorialText = document.getElementById('tutorial-text');
    this.tutorialProgress = document.getElementById('tutorial-progress');
    this.tutorialPrevBtn = document.getElementById('tutorial-prev');
    this.tutorialNextBtn = document.getElementById('tutorial-next');

    // Setup interaction callbacks
    this.interactionHandler.initialize(
      (selection) => this.onSelectionComplete(selection),
      (selection, action) => this.onSelectionChange(selection, action),
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

    // Tutorial event listeners
    this.tutorialPrevBtn.addEventListener('click', () => this.previousTutorialStep());
    this.tutorialNextBtn.addEventListener('click', () => this.nextTutorialStep());

    // Global pointer up to end drag
    window.addEventListener('pointerup', () => this.interactionHandler.endDrag());

    // Grid pointer leave to end drag
    document.getElementById('grid').addEventListener('pointerleave', () => this.interactionHandler.endDrag());

    // Global pointermove for mobile touch support
    document.getElementById('grid').addEventListener('pointermove', (e) => {
      if (!this.interactionHandler.isDraggingActive()) return;

      e.preventDefault();

      // Get element under the pointer
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element && element.classList.contains('cell') && element.dataset.cellIndex) {
        const index = parseInt(element.dataset.cellIndex);
        this.onPointerMove(index);
      }
    });
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

    // Convert minimal level data to puzzle format
    this.currentPuzzle = this.levelManager.levelToPuzzle(level);

    // Reset interaction state
    this.interactionHandler.clearUsedIndices();

    // Apply theme for current level
    const currentLevelNumber = this.levelManager.getCurrentLevelNumber();
    const theme = getThemeForLevel(currentLevelNumber);
    applyTheme(theme);

    // Update level indicator with theme
    this.updateLevelIndicator();

    // Render the puzzle
    this.gridRenderer.render(
      this.currentPuzzle,
      (index, e) => this.onPointerDown(index, e),
      (index) => this.onPointerMove(index),
    );
  }

  /**
   * Updates the level indicator display
   */
  updateLevelIndicator() {
    if (this.levelIndicator) {
      const current = this.levelManager.getCurrentLevelNumber();
      const total = this.levelManager.getTotalLevels();
      const themeDisplay = getThemeDisplay(current);
      this.levelIndicator.textContent = `${themeDisplay} - Level ${current} / ${total}`;
    }
  }

  /**
   * Handles pointer down on a cell
   */
  onPointerDown(index, e) {
    this.interactionHandler.handlePointerDown(index, (i) => !this.gridRenderer.isDeadZone(i));
  }

  /**
   * Handles pointer move/over on a cell
   */
  onPointerMove(index) {
    this.interactionHandler.handlePointerOver(index, (i) => !this.gridRenderer.isDeadZone(i));
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
    const flagCount = selection.filter((i) => flagPositions.includes(i)).length;

    // Must have exactly FLAGS_PER_L_SHAPE flags
    if (flagCount !== FLAGS_PER_L_SHAPE) return false;

    // Check if selection forms an L-shape
    const coords = selection.map((i) => indexToCoords(i));

    const rowDiff = Math.max(...coords.map((p) => p.r)) - Math.min(...coords.map((p) => p.r));
    const colDiff = Math.max(...coords.map((p) => p.c)) - Math.min(...coords.map((p) => p.c));

    // Valid L-shape: spans L_SHAPE_BOUNDING_BOX area
    return rowDiff === L_SHAPE_BOUNDING_BOX - 1 && colDiff === L_SHAPE_BOUNDING_BOX - 1;
  }

  /**
   * Called when level is completed successfully
   */
  onLevelComplete() {
    if (this.isTutorialMode) {
      // Tutorial completed - mark tutorial as done to unlock level 1
      this.completedLevels.add('tutorial');
      this.saveCompletedLevels();

      this.successMsg.innerHTML = '🎉 Tutorial abgeschlossen! Bereit für die echten Level?';
      CelebrationManager.levelComplete();

      setTimeout(() => {
        this.exitTutorial();
      }, 2000);
    } else {
      // Regular level completed
      const currentLevel = this.levelManager.getCurrentLevelNumber();
      this.markLevelCompleted();
      this.successMsg.innerHTML = TEXT.SUCCESS_MESSAGE;
      this.nextBtn.disabled = false;
      this.nextBtn.classList.add('unlocked');

      // Trigger celebration based on level milestone
      if (currentLevel % 25 === 0 || currentLevel === 100) {
        // Epic celebration for major milestones (25, 50, 75, 100)
        CelebrationManager.milestoneComplete();
      } else if (currentLevel % 10 === 0) {
        // Bigger celebration for every 10th level
        CelebrationManager.milestoneComplete();
      } else {
        // Regular celebration
        CelebrationManager.levelComplete();
      }
    }
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

    // Update progress bar
    this.updateProgressBar();

    // Add tutorial button (spans full row)
    const tutorialBtn = document.createElement('button');
    tutorialBtn.className = 'level-btn tutorial-btn-grid';
    tutorialBtn.textContent = 'Tutorial';
    tutorialBtn.addEventListener('click', () => this.startTutorial());
    this.levelGrid.appendChild(tutorialBtn);

    const currentLevel = this.levelManager.getCurrentLevelNumber();
    const unlockedLevel = this.getUnlockedLevel();

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const btn = document.createElement('button');
      btn.className = 'level-btn';
      btn.textContent = i;

      const isCompleted = this.completedLevels.has(i);
      const isUnlocked = i <= unlockedLevel;

      // Add state classes
      if (isCompleted) {
        btn.classList.add('completed');
      }
      if (i === currentLevel) {
        btn.classList.add('current');
      }
      if (!isUnlocked) {
        btn.classList.add('locked');
      }

      // Add click handler only for unlocked levels
      if (isUnlocked) {
        btn.addEventListener('click', () => this.selectLevel(i));
      } else {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          // Optional: Show feedback that level is locked
        });
      }

      this.levelGrid.appendChild(btn);
    }
  }

  /**
   * Gets the highest unlocked level (last completed + 1)
   * @returns {number} The highest level number that can be played
   */
  getUnlockedLevel() {
    if (this.completedLevels.size === 0) {
      return 0; // New player - no levels unlocked yet (only tutorial)
    }

    // Filter out non-numeric entries (like 'tutorial')
    const numericLevels = [...this.completedLevels].filter((level) => typeof level === 'number');

    if (numericLevels.length === 0) {
      return 1; // Tutorial completed, level 1 is now unlocked
    }

    // Find the highest completed level
    const maxCompleted = Math.max(...numericLevels);
    return maxCompleted + 1;
  }

  /**
   * Checks if the tutorial has been completed
   * @returns {boolean} True if tutorial is completed
   */
  isTutorialCompleted() {
    return this.completedLevels.size > 0;
  }

  /**
   * Handles level selection from overview
   */
  selectLevel(levelNumber) {
    // Check if level is unlocked
    const unlockedLevel = this.getUnlockedLevel();
    if (levelNumber > unlockedLevel) {
      return; // Level is locked, don't allow access
    }

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
   * Updates the progress bar based on completed levels
   */
  updateProgressBar() {
    if (!this.progressFill || !this.progressText) return;

    // Count only numeric levels (exclude 'tutorial')
    const completedCount = [...this.completedLevels].filter(
      (level) => typeof level === 'number'
    ).length;

    const percentage = (completedCount / TOTAL_LEVELS) * 100;

    // Update progress bar
    this.progressFill.style.width = `${percentage}%`;

    // Update progress text
    this.progressText.textContent = `${completedCount} / ${TOTAL_LEVELS} abgeschlossen`;
  }

  /**
   * Starts the tutorial mode
   */
  startTutorial() {
    this.isTutorialMode = true;
    this.tutorialStep = 0;

    // Load tutorial level
    const tutorialPuzzle = this.levelManager.levelToPuzzle(TUTORIAL_LEVEL);
    this.currentPuzzle = tutorialPuzzle;

    // Reset interaction state
    this.interactionHandler.clearUsedIndices();

    // Update UI
    this.levelIndicator.textContent = 'Tutorial';
    this.successMsg.innerHTML = '';
    this.nextBtn.style.display = 'none'; // Hide next button in tutorial

    // Show game screen
    this.showGameScreen();

    // Render the puzzle
    this.gridRenderer.render(
      this.currentPuzzle,
      (index, e) => this.onPointerDown(index, e),
      (index) => this.onPointerMove(index),
    );

    // Show first tutorial step
    this.showTutorialStep();
  }

  /**
   * Shows the current tutorial step
   */
  showTutorialStep() {
    const step = TUTORIAL_STEPS[this.tutorialStep];

    this.tutorialTitle.textContent = step.title;
    this.tutorialText.textContent = step.text;
    this.tutorialProgress.textContent = `${this.tutorialStep + 1} / ${TUTORIAL_STEPS.length}`;

    // Update button states
    this.tutorialPrevBtn.disabled = this.tutorialStep === 0;

    if (this.tutorialStep === TUTORIAL_STEPS.length - 1) {
      this.tutorialNextBtn.textContent = "Los geht's!";
    } else {
      this.tutorialNextBtn.textContent = 'Weiter →';
    }

    this.tutorialOverlay.classList.remove('hidden');
  }

  /**
   * Goes to the next tutorial step
   */
  nextTutorialStep() {
    if (this.tutorialStep < TUTORIAL_STEPS.length - 1) {
      this.tutorialStep++;
      this.showTutorialStep();
    } else {
      // Last step - close tutorial overlay and let user play
      this.tutorialOverlay.classList.add('hidden');
    }
  }

  /**
   * Goes to the previous tutorial step
   */
  previousTutorialStep() {
    if (this.tutorialStep > 0) {
      this.tutorialStep--;
      this.showTutorialStep();
    }
  }

  /**
   * Exits tutorial mode
   */
  exitTutorial() {
    this.isTutorialMode = false;
    this.tutorialOverlay.classList.add('hidden');
    this.nextBtn.style.display = ''; // Show next button again
    this.showLevelOverview();
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
