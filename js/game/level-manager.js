/**
 * Level Manager Module
 * Manages pre-generated levels and tracks player progress
 */

import { LEVELS, TOTAL_LEVELS } from '../data/levels-data.js';

export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.levels = LEVELS;
        this.totalLevels = TOTAL_LEVELS;
    }

    /**
     * Gets the current level
     * @returns {Object} Current level data
     */
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    /**
     * Gets the current level number (1-indexed)
     * @returns {number} Current level number
     */
    getCurrentLevelNumber() {
        return this.currentLevelIndex + 1;
    }

    /**
     * Converts level data to puzzle format expected by the game
     * @param {Object} level - Minimal level data (deadZones, flags)
     * @returns {Object} Puzzle object with deadZoneIndices and xPositions
     */
    levelToPuzzle(level) {
        return {
            deadZoneIndices: level.deadZones,
            xPositions: level.flags
        };
    }

    /**
     * Advances to the next level
     * @returns {Object|null} Next level data, or null if at end
     */
    nextLevel() {
        if (this.currentLevelIndex < this.totalLevels - 1) {
            this.currentLevelIndex++;
            return this.getCurrentLevel();
        }
        return null;
    }

    /**
     * Goes back to the previous level
     * @returns {Object|null} Previous level data, or null if at beginning
     */
    previousLevel() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            return this.getCurrentLevel();
        }
        return null;
    }

    /**
     * Jumps to a specific level
     * @param {number} levelNumber - Level number (1-indexed)
     * @returns {Object|null} Level data, or null if invalid
     */
    goToLevel(levelNumber) {
        const index = levelNumber - 1;
        if (index >= 0 && index < this.totalLevels) {
            this.currentLevelIndex = index;
            return this.getCurrentLevel();
        }
        return null;
    }

    /**
     * Resets to the first level
     */
    reset() {
        this.currentLevelIndex = 0;
    }

    /**
     * Checks if there's a next level available
     * @returns {boolean}
     */
    hasNextLevel() {
        return this.currentLevelIndex < this.totalLevels - 1;
    }

    /**
     * Checks if there's a previous level available
     * @returns {boolean}
     */
    hasPreviousLevel() {
        return this.currentLevelIndex > 0;
    }

    /**
     * Gets total number of levels
     * @returns {number}
     */
    getTotalLevels() {
        return this.totalLevels;
    }
}
