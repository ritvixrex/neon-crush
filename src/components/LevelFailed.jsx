import React, { useEffect, useState } from 'react';
import { useGameState } from '../state/GameStateManager';

const LevelFailed = () => {
    const {
        levelResult,
        retryLevel,
        goToWorldMap,
        currentLevel
    } = useGameState();

    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 200);
        return () => clearTimeout(timer);
    }, []);

    if (!levelResult) return null;

    return (
        <div className="popup-overlay">
            <div className={`popup-container level-failed ${showContent ? 'show' : ''}`}>
                {/* Header */}
                <div className="failed-header">
                    <h1 className="failed-title">
                        <span className="title-icon">😢</span>
                        <span className="title-text">Out of Moves!</span>
                    </h1>
                </div>

                {/* Character */}
                <div className="character-sad">
                    <span className="character-emoji">🧚‍♀️</span>
                    <div className="sad-cloud">💭</div>
                </div>

                {/* Level info */}
                <div className="failed-info">
                    <div className="info-row">
                        <span className="info-label">Level</span>
                        <span className="info-value">{currentLevel}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Score</span>
                        <span className="info-value">{levelResult.score.toLocaleString()}</span>
                    </div>
                </div>

                {/* Message */}
                <p className="failed-message">
                    Don't give up! Try again and match those sweet candies! 🍬
                </p>

                {/* Buttons */}
                <div className="failed-buttons">
                    <button className="btn-secondary" onClick={goToWorldMap}>
                        <span className="btn-icon">🗺️</span>
                        <span>Back to Map</span>
                    </button>
                    <button className="btn-primary candy-btn candy-btn-green" onClick={retryLevel}>
                        <span className="btn-icon">🔄</span>
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelFailed;
