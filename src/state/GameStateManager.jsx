import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadProgress, saveProgress, getDefaultProgress } from './PlayerProgress';

// Screen types
export const SCREENS = {
    SPLASH: 'splash',
    MAIN_MENU: 'main_menu',
    WORLD_MAP: 'world_map',
    GAME: 'game',
    SETTINGS: 'settings'
};

// Game state context
const GameStateContext = createContext(null);

export const useGameState = () => {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameState must be used within GameStateProvider');
    }
    return context;
};

export const GameStateProvider = ({ children }) => {
    // Current screen
    const [currentScreen, setCurrentScreen] = useState(SCREENS.SPLASH);

    // Player progress (loaded from localStorage)
    const [playerProgress, setPlayerProgress] = useState(getDefaultProgress);

    // Current level being played
    const [currentLevel, setCurrentLevel] = useState(null);

    // Popup states
    const [showLevelPreview, setShowLevelPreview] = useState(false);
    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [showLevelFailed, setShowLevelFailed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Level result data
    const [levelResult, setLevelResult] = useState(null);

    // Load progress on mount
    useEffect(() => {
        const progress = loadProgress();
        setPlayerProgress(progress);
    }, []);

    // Save progress whenever it changes
    useEffect(() => {
        saveProgress(playerProgress);
    }, [playerProgress]);

    // Navigation functions
    const navigateTo = useCallback((screen) => {
        setCurrentScreen(screen);
        // Close all popups when navigating
        setShowLevelPreview(false);
        setShowLevelComplete(false);
        setShowLevelFailed(false);
        setShowSettings(false);
    }, []);

    // Start playing a level
    const startLevel = useCallback((levelId) => {
        setCurrentLevel(levelId);
        setShowLevelPreview(false);
        setCurrentScreen(SCREENS.GAME);
    }, []);

    // Open level preview
    const openLevelPreview = useCallback((levelId) => {
        setCurrentLevel(levelId);
        setShowLevelPreview(true);
    }, []);

    // Complete a level
    const completeLevel = useCallback((levelId, score, stars) => {
        setLevelResult({ levelId, score, stars, success: true });

        // Update progress
        setPlayerProgress(prev => {
            const newProgress = { ...prev };
            const currentLevelData = newProgress.levels[levelId] || {};

            // Update level data
            newProgress.levels[levelId] = {
                completed: true,
                stars: Math.max(currentLevelData.stars || 0, stars),
                highScore: Math.max(currentLevelData.highScore || 0, score)
            };

            // Unlock next level
            if (levelId >= newProgress.maxUnlockedLevel) {
                newProgress.maxUnlockedLevel = levelId + 1;
            }

            // Update total stars
            newProgress.totalStars = Object.values(newProgress.levels)
                .reduce((sum, l) => sum + (l.stars || 0), 0);

            return newProgress;
        });

        setShowLevelComplete(true);
    }, []);

    // Fail a level
    const failLevel = useCallback((levelId, score) => {
        setLevelResult({ levelId, score, stars: 0, success: false });
        setShowLevelFailed(true);
    }, []);

    // Retry current level
    const retryLevel = useCallback(() => {
        setShowLevelComplete(false);
        setShowLevelFailed(false);
        setLevelResult(null);
        // Re-start the same level
        if (currentLevel) {
            setCurrentScreen(SCREENS.GAME);
        }
    }, [currentLevel]);

    // Go to next level
    const nextLevel = useCallback(() => {
        setShowLevelComplete(false);
        setLevelResult(null);
        const nextLevelId = (currentLevel || 1) + 1;
        setCurrentLevel(nextLevelId);
        setCurrentScreen(SCREENS.GAME);
    }, [currentLevel]);

    // Go back to world map
    const goToWorldMap = useCallback(() => {
        setShowLevelComplete(false);
        setShowLevelFailed(false);
        setCurrentLevel(null);
        setLevelResult(null);
        setCurrentScreen(SCREENS.WORLD_MAP);
    }, []);

    // Update settings
    const updateSettings = useCallback((newSettings) => {
        setPlayerProgress(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    }, []);

    // Check if a level is unlocked
    const isLevelUnlocked = useCallback((levelId) => {
        return levelId <= playerProgress.maxUnlockedLevel;
    }, [playerProgress.maxUnlockedLevel]);

    // Get level data
    const getLevelProgress = useCallback((levelId) => {
        return playerProgress.levels[levelId] || null;
    }, [playerProgress.levels]);

    const value = {
        // State
        currentScreen,
        currentLevel,
        playerProgress,
        levelResult,

        // Popup states
        showLevelPreview,
        showLevelComplete,
        showLevelFailed,
        showSettings,

        // Setters
        setShowLevelPreview,
        setShowLevelComplete,
        setShowLevelFailed,
        setShowSettings,

        // Navigation
        navigateTo,
        startLevel,
        openLevelPreview,
        goToWorldMap,

        // Level actions
        completeLevel,
        failLevel,
        retryLevel,
        nextLevel,

        // Progress helpers
        isLevelUnlocked,
        getLevelProgress,
        updateSettings
    };

    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
};

export default GameStateProvider;
