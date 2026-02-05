import React, { useState } from 'react';
import { useGameState, SCREENS } from '../state/GameStateManager';

const MainMenu = () => {
    const { navigateTo, playerProgress, setShowSettings } = useGameState();
    const [isAnimating, setIsAnimating] = useState(false);

    const handlePlay = () => {
        setIsAnimating(true);
        setTimeout(() => {
            navigateTo(SCREENS.WORLD_MAP);
        }, 300);
    };

    return (
        <div className={`main-menu-premium ${isAnimating ? 'animating-out' : ''}`}>
            {/* Background with gradient and floating decorations */}
            <div className="menu-sky-bg">
                <div className="sun-glow" />
                <div className="clouds">
                    <div className="cloud-item c1">☁️</div>
                    <div className="cloud-item c2">☁️</div>
                </div>
            </div>

            <div className="menu-container">
                {/* Top Stats Bar */}
                <div className="stats-pills">
                    <div className="pill level-pill">
                        <span className="pill-icon">🏆</span>
                        <span className="pill-text">Level {playerProgress.maxUnlockedLevel}</span>
                    </div>
                    <div className="pill stars-pill">
                        <span className="pill-icon">⭐</span>
                        <span className="pill-text">{playerProgress.totalStars.toLocaleString()}</span>
                    </div>
                    <button
                        className="settings-circle-btn"
                        onClick={() => setShowSettings(true)}
                    >
                        ⚙️
                    </button>
                </div>

                {/* Game Logo Area */}
                <div className="logo-area">
                    <h1 className="saga-logo">
                        <span className="candy-text">CANDY</span>
                        <span className="crush-text">CRUSH</span>
                        <div className="saga-badge">SAGA</div>
                    </h1>
                </div>

                {/* Character & Main Action */}
                <div className="main-action">
                    <div className="character-display">
                        <div className="tiffi-avatar">🧚‍♀️</div>
                        <div className="avatar-shadow" />
                    </div>

                    <button
                        className="premium-play-btn"
                        onClick={handlePlay}
                    >
                        <div className="play-btn-inner">
                            <span className="play-icon">▶</span>
                            <span className="play-text">PLAY</span>
                        </div>
                        <div className="btn-glow" />
                    </button>
                </div>

                {/* Footer Navigation */}
                <div className="menu-footer-nav">
                    <div className="nav-item">
                        <div className="nav-icon">🗺️</div>
                        <span>Map</span>
                    </div>
                    <div className="nav-item">
                        <div className="nav-icon">🛒</div>
                        <span>Shop</span>
                    </div>
                    <div className="nav-item">
                        <div className="nav-icon">👥</div>
                        <span>Social</span>
                    </div>
                    <div className="nav-item">
                        <div className="nav-icon">📅</div>
                        <span>Events</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
