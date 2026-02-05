import React, { useState, useRef, useEffect } from 'react';
import { useGameState, SCREENS } from '../state/GameStateManager';
import { getLevel, getTotalLevels } from '../levels';
import LevelPreview from '../components/LevelPreview';

const WorldMap = () => {
    const {
        playerProgress,
        isLevelUnlocked,
        getLevelProgress,
        openLevelPreview,
        showLevelPreview,
        setShowSettings,
        navigateTo
    } = useGameState();

    const [selectedLevel, setSelectedLevel] = useState(null);
    const mapRef = useRef(null);
    const totalLevels = getTotalLevels();

    // Scroll to current level on mount
    useEffect(() => {
        const currentLevel = playerProgress.maxUnlockedLevel;
        const levelNode = document.getElementById(`level-node-${currentLevel}`);
        if (levelNode && mapRef.current) {
            levelNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [playerProgress.maxUnlockedLevel]);

    const handleLevelClick = (levelId) => {
        if (isLevelUnlocked(levelId)) {
            setSelectedLevel(levelId);
            openLevelPreview(levelId);
        }
    };

    const renderLevelNode = (levelId) => {
        const isUnlocked = isLevelUnlocked(levelId);
        const progress = getLevelProgress(levelId);
        const level = getLevel(levelId);
        const isCurrent = levelId === playerProgress.maxUnlockedLevel;

        return (
            <div
                key={levelId}
                id={`level-node-${levelId}`}
                className={`level-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${progress?.completed ? 'completed' : ''}`}
                onClick={() => handleLevelClick(levelId)}
            >
                {/* Path connector */}
                {levelId > 1 && (
                    <div className={`path-connector ${isUnlocked ? 'active' : ''}`} />
                )}

                {/* Level bubble */}
                <div className="level-bubble">
                    {isUnlocked ? (
                        <>
                            <span className="level-number">{levelId}</span>
                            {progress?.completed && (
                                <div className="level-stars">
                                    {[1, 2, 3].map(star => (
                                        <span
                                            key={star}
                                            className={`star ${star <= (progress.stars || 0) ? 'earned' : 'empty'}`}
                                        >
                                            ⭐
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <span className="lock-icon">🔒</span>
                    )}
                </div>

                {/* Level name tooltip */}
                {isUnlocked && level && (
                    <div className="level-name-tooltip">
                        {level.name}
                    </div>
                )}

                {/* Current level indicator */}
                {isCurrent && (
                    <div className="current-indicator">
                        <span className="bounce-arrow">👇</span>
                    </div>
                )}
            </div>
        );
    };

    // Generate level positions for the winding path
    const generatePathPositions = () => {
        const positions = [];
        const segmentLength = 3; // Levels per segment before turning

        for (let i = 1; i <= totalLevels; i++) {
            const segment = Math.floor((i - 1) / segmentLength);
            const posInSegment = (i - 1) % segmentLength;
            const isRightward = segment % 2 === 0;

            positions.push({
                levelId: i,
                row: segment,
                col: isRightward ? posInSegment : (segmentLength - 1 - posInSegment)
            });
        }

        return positions;
    };

    const pathPositions = generatePathPositions();

    return (
        <div className="world-map">
            {/* Header */}
            <div className="map-header">
                <button
                    className="back-btn"
                    onClick={() => navigateTo(SCREENS.MAIN_MENU)}
                >
                    ←
                </button>
                <div className="header-stats">
                    <div className="stat stars">
                        <span className="icon">⭐</span>
                        <span className="value">{playerProgress.totalStars}</span>
                    </div>
                </div>
                <button
                    className="settings-btn-small"
                    onClick={() => setShowSettings(true)}
                >
                    ⚙️
                </button>
            </div>

            {/* Map area */}
            <div className="map-scroll-container" ref={mapRef}>
                <div className="map-content">
                    {/* Background decorations */}
                    <div className="map-decorations">
                        <div className="cloud cloud-1">☁️</div>
                        <div className="cloud cloud-2">☁️</div>
                        <div className="candy-decoration candy-1">🍬</div>
                        <div className="candy-decoration candy-2">🍭</div>
                        <div className="candy-decoration candy-3">🧁</div>
                    </div>

                    {/* Level path */}
                    <div className="level-path">
                        {pathPositions.map(({ levelId, row, col }) => (
                            <div
                                key={levelId}
                                className="level-position"
                                style={{
                                    gridRow: row + 1,
                                    gridColumn: col + 1
                                }}
                            >
                                {renderLevelNode(levelId)}
                            </div>
                        ))}
                    </div>

                    {/* World labels */}
                    <div className="world-labels">
                        <div className="world-label world-1">🏰 Candy Kingdom</div>
                        <div className="world-label world-2">🌲 Lollipop Forest</div>
                        <div className="world-label world-3">🏔️ Chocolate Mountains</div>
                    </div>
                </div>
            </div>

            {/* Level Preview Popup */}
            {showLevelPreview && <LevelPreview />}
        </div>
    );
};

export default WorldMap;
