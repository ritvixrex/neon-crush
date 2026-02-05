import React, { useEffect, useState } from 'react';
import { useGameState } from '../state/GameStateManager';
import { getLevel, getTotalLevels } from '../levels';

const LevelComplete = () => {
    const {
        levelResult,
        retryLevel,
        nextLevel,
        goToWorldMap,
        currentLevel
    } = useGameState();

    const [animatedStars, setAnimatedStars] = useState(0);
    const [showContent, setShowContent] = useState(false);

    const level = getLevel(currentLevel);
    const isLastLevel = currentLevel >= getTotalLevels();

    // Animate stars appearing
    useEffect(() => {
        setShowContent(false);
        setAnimatedStars(0);

        const contentTimer = setTimeout(() => setShowContent(true), 300);

        if (levelResult?.stars) {
            const starTimers = [];
            for (let i = 1; i <= levelResult.stars; i++) {
                starTimers.push(
                    setTimeout(() => setAnimatedStars(i), 500 + i * 400)
                );
            }
            return () => {
                clearTimeout(contentTimer);
                starTimers.forEach(t => clearTimeout(t));
            };
        }

        return () => clearTimeout(contentTimer);
    }, [levelResult]);

    if (!levelResult) return null;

    return (
        <div className="popup-overlay">
            <div className={`popup-container level-complete ${showContent ? 'show' : ''}`}>
                {/* Confetti effect */}
                <div className="confetti-container">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6'][i % 5]
                            }}
                        />
                    ))}
                </div>

                {/* Header */}
                <div className="complete-header">
                    <h1 className="complete-title">
                        <span className="title-text">SWEET!</span>
                    </h1>
                    <div className="complete-subtitle">Level {levelResult.levelId} Complete!</div>
                </div>

                {/* Stars */}
                <div className="stars-earned">
                    {[1, 2, 3].map(star => (
                        <div
                            key={star}
                            className={`star-large ${animatedStars >= star ? 'earned animate' : 'empty'}`}
                            style={{ animationDelay: `${star * 0.1}s` }}
                        >
                            <span className="star-emoji">⭐</span>
                        </div>
                    ))}
                </div>

                {/* Score */}
                <div className="score-display">
                    <div className="score-label">SCORE</div>
                    <div className="score-value">{levelResult.score.toLocaleString()}</div>
                </div>

                {/* Character */}
                <div className="character-celebration">
                    <span className="character-emoji">🧚‍♀️</span>
                    <div className="celebration-sparkles">✨</div>
                </div>

                {/* Buttons */}
                <div className="complete-buttons">
                    <button className="btn-secondary" onClick={retryLevel}>
                        <span className="btn-icon">🔄</span>
                        <span>Retry</span>
                    </button>
                    <button className="btn-secondary" onClick={goToWorldMap}>
                        <span className="btn-icon">🗺️</span>
                        <span>Map</span>
                    </button>
                    {!isLastLevel && (
                        <button className="btn-primary candy-btn candy-btn-green" onClick={nextLevel}>
                            <span className="btn-icon">▶</span>
                            <span>Next</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LevelComplete;
