/**
 * Interaction Handler Module
 * Manages user input via pointer events (touch and mouse)
 */

export class InteractionHandler {
    constructor() {
        this.isDragging = false;
        this.currentSelection = [];
        this.usedIndices = new Set();
        this.onSelectionComplete = null;
        this.onSelectionChange = null;
    }

    /**
     * Initializes the interaction handler with callbacks
     * @param {Function} onSelectionComplete - Called when user completes a 3-cell selection
     * @param {Function} onSelectionChange - Called when selection changes (for visual feedback)
     */
    initialize(onSelectionComplete, onSelectionChange) {
        this.onSelectionComplete = onSelectionComplete;
        this.onSelectionChange = onSelectionChange;
    }

    /**
     * Handles pointer down event on a cell
     * @param {number} index - Cell index
     * @param {Function} isValidCell - Function to check if cell can be selected
     * @returns {boolean} True if drag started
     */
    handlePointerDown(index, isValidCell) {
        if (!isValidCell(index) || this.usedIndices.has(index)) {
            return false;
        }

        this.isDragging = true;
        this.currentSelection = [index];

        if (this.onSelectionChange) {
            this.onSelectionChange(this.currentSelection, 'add');
        }

        return true;
    }

    /**
     * Handles pointer over event on a cell (during drag)
     * @param {number} index - Cell index
     * @param {Function} isValidCell - Function to check if cell can be selected
     * @returns {boolean} True if cell was added to selection
     */
    handlePointerOver(index, isValidCell) {
        if (!this.isDragging) return false;
        if (!isValidCell(index)) return false;
        if (this.usedIndices.has(index)) return false;
        if (this.currentSelection.includes(index)) return false;
        if (this.currentSelection.length >= 3) return false;

        this.currentSelection.push(index);

        if (this.onSelectionChange) {
            this.onSelectionChange(this.currentSelection, 'add');
        }

        // Auto-complete when 3 cells selected
        if (this.currentSelection.length === 3) {
            this.endDrag();
        }

        return true;
    }

    /**
     * Ends the current drag operation
     */
    endDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;

        if (this.currentSelection.length === 3) {
            // Complete selection - notify game controller
            if (this.onSelectionComplete) {
                this.onSelectionComplete(this.currentSelection);
            }
        } else {
            // Incomplete selection - reset
            this.resetSelection();
        }
    }

    /**
     * Resets the current selection
     */
    resetSelection() {
        if (this.onSelectionChange) {
            this.onSelectionChange(this.currentSelection, 'remove');
        }
        this.currentSelection = [];
    }

    /**
     * Marks indices as used (completed L-shapes)
     * @param {number[]} indices - Array of cell indices to mark as used
     */
    markAsUsed(indices) {
        indices.forEach(i => this.usedIndices.add(i));
        this.currentSelection = [];
    }

    /**
     * Clears all used indices (for reset)
     */
    clearUsedIndices() {
        this.usedIndices.clear();
        this.currentSelection = [];
        this.isDragging = false;
    }

    /**
     * Checks if dragging is in progress
     * @returns {boolean} True if currently dragging
     */
    isDraggingActive() {
        return this.isDragging;
    }

    /**
     * Gets the current selection
     * @returns {number[]} Array of currently selected cell indices
     */
    getCurrentSelection() {
        return [...this.currentSelection];
    }

    /**
     * Gets the count of used cells
     * @returns {number} Number of cells marked as used
     */
    getUsedCount() {
        return this.usedIndices.size;
    }
}
