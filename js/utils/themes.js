/**
 * Visual Themes System
 * Provides different visual themes that rotate every 20 levels
 */

export const THEMES = {
  ocean: {
    name: 'Ocean',
    levels: [1, 20],
    emoji: '🌊',
    colors: {
      background: 'linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)',
      gridBackground: 'linear-gradient(145deg, #f1faee 0%, #e8f4f8 100%)',
      cellBase: 'linear-gradient(145deg, #f1faee 0%, #d4e9f0 100%)',
      cellHover: 'linear-gradient(145deg, #cce7f2 0%, #b8dce8 100%)',
      selected: 'linear-gradient(145deg, #bde0fe 0%, #a2d2ff 100%)',
      completed: 'linear-gradient(145deg, #06d6a0 0%, #0cb891 100%)',
      completedBorder: '#06d6a0',
      deadZone: 'linear-gradient(145deg, #1d3557 0%, #14213d 100%)',
      flag: '⚓',
      particle: 'rgba(168, 218, 220, 0.08)',
    },
    description: 'Sail the seas and capture maritime flags!',
  },
  forest: {
    name: 'Forest',
    levels: [21, 40],
    emoji: '🌲',
    colors: {
      background: 'linear-gradient(135deg, #95d5b2 0%, #52b788 100%)',
      gridBackground: 'linear-gradient(145deg, #f4fdf7 0%, #e8f5e9 100%)',
      cellBase: 'linear-gradient(145deg, #d8f3dc 0%, #c7e9c7 100%)',
      cellHover: 'linear-gradient(145deg, #b7e4c7 0%, #95d5b2 100%)',
      selected: 'linear-gradient(145deg, #b7e4c7 0%, #95d5b2 100%)',
      completed: 'linear-gradient(145deg, #74c69d 0%, #52b788 100%)',
      completedBorder: '#40916c',
      deadZone: 'linear-gradient(145deg, #2d6a4f 0%, #1b4332 100%)',
      flag: '🍄',
      particle: 'rgba(149, 213, 178, 0.08)',
    },
    description: 'Explore the enchanted forest and find hidden flags!',
  },
  sunset: {
    name: 'Sunset',
    levels: [41, 60],
    emoji: '🌅',
    colors: {
      background: 'linear-gradient(135deg, #ff9e80 0%, #ff6e40 50%, #d84315 100%)',
      gridBackground: 'linear-gradient(145deg, #fff3e0 0%, #ffe0b2 100%)',
      cellBase: 'linear-gradient(145deg, #ffe0b2 0%, #ffcc80 100%)',
      cellHover: 'linear-gradient(145deg, #ffcc80 0%, #ffb74d 100%)',
      selected: 'linear-gradient(145deg, #ffb74d 0%, #ffa726 100%)',
      completed: 'linear-gradient(145deg, #ff9e80 0%, #ff6e40 100%)',
      completedBorder: '#f4511e',
      deadZone: 'linear-gradient(145deg, #bf360c 0%, #e64a19 100%)',
      flag: '☀️',
      particle: 'rgba(255, 158, 128, 0.08)',
    },
    description: 'Chase the golden hour and capture sunset flags!',
  },
  midnight: {
    name: 'Midnight',
    levels: [61, 80],
    emoji: '🌙',
    colors: {
      background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
      gridBackground: 'linear-gradient(145deg, #283593 0%, #1a237e 100%)',
      cellBase: 'linear-gradient(145deg, #3949ab 0%, #303f9f 100%)',
      cellHover: 'linear-gradient(145deg, #5c6bc0 0%, #3f51b5 100%)',
      selected: 'linear-gradient(145deg, #7986cb 0%, #5c6bc0 100%)',
      completed: 'linear-gradient(145deg, #64b5f6 0%, #42a5f5 100%)',
      completedBorder: '#1e88e5',
      deadZone: 'linear-gradient(145deg, #000051 0%, #1a237e 100%)',
      flag: '⭐',
      particle: 'rgba(156, 204, 101, 0.08)',
    },
    description: 'Navigate the starry night and capture celestial flags!',
  },
  electric: {
    name: 'Electric',
    levels: [81, 100],
    emoji: '⚡',
    colors: {
      background: 'linear-gradient(135deg, #00e676 0%, #00c853 50%, #00bfa5 100%)',
      gridBackground: 'linear-gradient(145deg, #e0f2f1 0%, #b2dfdb 100%)',
      cellBase: 'linear-gradient(145deg, #b2dfdb 0%, #80cbc4 100%)',
      cellHover: 'linear-gradient(145deg, #80cbc4 0%, #4db6ac 100%)',
      selected: 'linear-gradient(145deg, #4db6ac 0%, #26a69a 100%)',
      completed: 'linear-gradient(145deg, #1de9b6 0%, #00e676 100%)',
      completedBorder: '#00c853',
      deadZone: 'linear-gradient(145deg, #004d40 0%, #00251a 100%)',
      flag: '💎',
      particle: 'rgba(29, 233, 182, 0.08)',
    },
    description: 'Harness the power and capture electric flags!',
  },
};

/**
 * Gets the theme for a given level number
 * @param {number} levelNumber - The level number (1-100)
 * @returns {Object} Theme object
 */
export function getThemeForLevel(levelNumber) {
  if (levelNumber >= 1 && levelNumber <= 20) return THEMES.ocean;
  if (levelNumber >= 21 && levelNumber <= 40) return THEMES.forest;
  if (levelNumber >= 41 && levelNumber <= 60) return THEMES.sunset;
  if (levelNumber >= 61 && levelNumber <= 80) return THEMES.midnight;
  if (levelNumber >= 81 && levelNumber <= 100) return THEMES.electric;

  // Default to ocean for tutorial or out of range
  return THEMES.ocean;
}

/**
 * Applies a theme to the game
 * @param {Object} theme - Theme object from THEMES
 */
export function applyTheme(theme) {
  const root = document.documentElement;

  // Update CSS custom properties
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-grid-bg', theme.colors.gridBackground);
  root.style.setProperty('--theme-cell-base', theme.colors.cellBase);
  root.style.setProperty('--theme-cell-hover', theme.colors.cellHover);
  root.style.setProperty('--theme-selected', theme.colors.selected);
  root.style.setProperty('--theme-completed', theme.colors.completed);
  root.style.setProperty('--theme-completed-border', theme.colors.completedBorder);
  root.style.setProperty('--theme-dead-zone', theme.colors.deadZone);
  root.style.setProperty('--theme-particle', theme.colors.particle);

  // Update flag emoji
  root.style.setProperty('--theme-flag', `"${theme.colors.flag}"`);

  // Add theme class to body
  document.body.className = `theme-${theme.name.toLowerCase()}`;
}

/**
 * Gets the theme name for display
 * @param {number} levelNumber - The level number
 * @returns {string} Theme name with emoji
 */
export function getThemeDisplay(levelNumber) {
  const theme = getThemeForLevel(levelNumber);
  return `${theme.emoji} ${theme.name}`;
}
