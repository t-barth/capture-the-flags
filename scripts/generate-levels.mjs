#!/usr/bin/env node
/**
 * Level Generation Script
 * Generates 100 pre-calculated levels and saves them to levels-data.js
 *
 * Usage: node scripts/generate-levels.mjs
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import the level generator and config
// Note: These imports work because we're using .mjs extension
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We need to import from parent directory
const configPath = join(__dirname, '../js/utils/config.js');
const generatorPath = join(__dirname, '../js/utils/level-generator.js');

// Dynamic imports to load ES6 modules
const config = await import(`file://${configPath}`);
const generator = await import(`file://${generatorPath}`);

const { generatePuzzle } = generator;
const { GRID_ROWS, GRID_COLS, DEAD_ZONES, FILLED_CELLS } = config;

console.log('🎮 Generating 100 levels...');
console.log(`Configuration: ${GRID_ROWS}×${GRID_COLS} grid with ${DEAD_ZONES} dead zones\n`);

const levels = [];
const TOTAL_LEVELS = 100;

for (let i = 0; i < TOTAL_LEVELS; i++) {
    const puzzle = generatePuzzle();

    if (!puzzle) {
        console.error(`❌ Failed to generate level ${i + 1}`);
        process.exit(1);
    }

    levels.push({
        deadZones: puzzle.deadZoneIndices,
        flags: puzzle.xPositions
    });

    // Progress indicator
    if ((i + 1) % 10 === 0) {
        console.log(`✅ Generated ${i + 1}/${TOTAL_LEVELS} levels`);
    }
}

// Create the JavaScript module content
const fileContent = `/**
 * Pre-generated Levels Data
 * Contains ${TOTAL_LEVELS} pre-calculated puzzle configurations
 * Generated on: ${new Date().toISOString()}
 * Configuration: ${GRID_ROWS}×${GRID_COLS} grid, ${DEAD_ZONES} dead zones, ${FILLED_CELLS} filled cells
 */

export const LEVELS = ${JSON.stringify(levels, null, 2)};

export const TOTAL_LEVELS = ${TOTAL_LEVELS};
`;

// Write to file
const outputPath = join(__dirname, '../js/data/levels-data.js');
writeFileSync(outputPath, fileContent, 'utf8');

console.log(`\n🎉 Successfully generated ${TOTAL_LEVELS} levels!`);
console.log(`📁 Saved to: js/data/levels-data.js`);
console.log(`📊 File size: ${(fileContent.length / 1024).toFixed(2)} KB`);
