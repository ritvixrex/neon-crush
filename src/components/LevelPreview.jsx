import React from 'react';
import { useGameState } from '../state/GameStateManager';
import { getLevel, getObjectiveText } from '../levels';

const LevelPreview = () => {
    const {
        currentLevel,
        startLevel,
        setShowLevelPreview,
        getLevelProgress
    } = useGameState();

    const level = getLevel(currentLevel);
    const progress = getLevelProgress(currentLevel);

    if (!level) return null;

    const handlePlay = () => {
        startLevel(currentLevel);
    };

    const handleClose = () => {
        setShowLevelPreview(false);
    };

    return (
        <div className="popup-overlay" onClick={handleClose}>
            <div className="popup-container level-preview" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="popup-close" onClick={handleClose}>✕</button>

                {/* Header */}
                <div className="popup-header">
                    <div className="level-badge">
                        <span className="badge-label">LEVEL</span>
                        <span className="badge-number">{level.id}</span>
                    </div>
                    <h2 className="level-title">{level.name}</h2>
                </div>

                {/* Stars display */}
                <div className="stars-display">
                    {[1, 2, 3].map(star => (
                        <div
                            key={star}
                            className={`star-container ${star <= (progress?.stars || 0) ? 'earned' : 'empty'}`}
                        >
                            <span className="star-icon">⭐</span>
                            <span className="star-threshold">
                                {level.stars[star - 1]?.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Objective */}
                <div className="objective-section">
                    <div className="objective-label">GOAL</div>
                    <div className="objective-text">{getObjectiveText(level.objective)}</div>
                </div>

                {/* Level info */}
                <div className="level-info">
                    <div className="info-item">
                        <span className="info-icon">🎯</span>
                        <span className="info-label">Moves</span>
                        <span className="info-value">{level.moveLimit}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">🍬</span>
                        <span className="info-label">Colors</span>
                        <span className="info-value">{level.candyColors}</span>
                    </div>
                </div>

                {/* High score */}
                {progress?.highScore > 0 && (
                    <div className="high-score">
                        <span className="hs-label">Best Score:</span>
                        <span className="hs-value">{progress.highScore.toLocaleString()}</span>
                    </div>
                )}

                {/* Play button */}
                <button className="play-btn candy-btn candy-btn-green" onClick={handlePlay}>
                    <span className="btn-icon">▶</span>
                    <span className="btn-text">PLAY!</span>
                </button>
            </div>
        </div>
    );
};

export default LevelPreview;
