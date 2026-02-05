/**
 * Player Progress Management
 * Handles localStorage persistence for player data
 */

const STORAGE_KEY = 'candy_crush_progress';

// Default progress for new players
export const getDefaultProgress = () => ({
    currentLevel: 1,
    maxUnlockedLevel: 1,
    totalStars: 0,
    levels: {},
    settings: {
        sound: true,
        music: true,
        haptics: true
    },
    stats: {
        totalGamesPlayed: 0,
        totalScore: 0,
        totalMatches: 0
    }
});

/**
 * Load player progress from localStorage
 */
export const loadProgress = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to ensure all fields exist
            return {
                ...getDefaultProgress(),
                ...parsed,
                settings: {
                    ...getDefaultProgress().settings,
                    ...parsed.settings
                },
                stats: {
                    ...getDefaultProgress().stats,
                    ...parsed.stats
                }
            };
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
    }
    return getDefaultProgress();
};

/**
 * Save player progress to localStorage
 */
export const saveProgress = (progress) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Failed to save progress:', error);
    }
};

/**
 * Reset all progress (for testing/debug)
 */
export const resetProgress = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to reset progress:', error);
    }
};

/**
 * Get stars for a specific level
 */
export const getLevelStars = (progress, levelId) => {
    return progress.levels[levelId]?.stars || 0;
};

/**
 * Get high score for a specific level
 */
export const getLevelHighScore = (progress, levelId) => {
    return progress.levels[levelId]?.highScore || 0;
};

/**
 * Check if level is completed
 */
export const isLevelCompleted = (progress, levelId) => {
    return progress.levels[levelId]?.completed || false;
};

/**
 * Update game statistics
 */
export const updateStats = (progress, updates) => {
    return {
        ...progress,
        stats: {
            ...progress.stats,
            totalGamesPlayed: (progress.stats.totalGamesPlayed || 0) + (updates.gamesPlayed || 0),
            totalScore: (progress.stats.totalScore || 0) + (updates.score || 0),
            totalMatches: (progress.stats.totalMatches || 0) + (updates.matches || 0)
        }
    };
};
