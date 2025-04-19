/**
 * Debug configuration for the Un-Define application
 * This file contains debug flags and settings that can be toggled based on environment
 */

// Toggle debugging features for local development
export const DEBUG_MODE = process.env.NODE_ENV !== 'production';

// Additional debug settings can be added here
export const DEBUG_CONFIG = {
  forceShowAllClues: DEBUG_MODE, // Force all clues to be visible regardless of game state
  showDebugBanner: DEBUG_MODE,   // Show debug banner/notices in the UI
  verboseLogging: DEBUG_MODE,    // Enable verbose console logging
};

// Check if running in development mode and log debug status
if (DEBUG_MODE) {
  console.log('🔧 DEBUG MODE ENABLED: Running in development environment');
  console.log('Debug configuration:', DEBUG_CONFIG);
}

export default {
  DEBUG_MODE,
  DEBUG_CONFIG,
}; 