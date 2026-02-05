import React, { useEffect, useState } from 'react';
import { useGameState, SCREENS } from '../state/GameStateManager';

const SplashScreen = () => {
    const { navigateTo } = useGameState();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.random() * 10 + 2;
            });
        }, 100);

        // Auto-transition after loading
        const timer = setTimeout(() => {
            navigateTo(SCREENS.MAIN_MENU);
        }, 3500);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [navigateTo]);

    return (
        <div className="splash-screen-premium">
            <div className="splash-overlay" />

            {/* 3D Animated Candy Background elements */}
            <div className="candy-scenery">
                <div className="candy-item lollipop-1">🍭</div>
                <div className="candy-item jelly-1">🍬</div>
                <div className="candy-item star-1">⭐</div>
                <div className="candy-item donut-1">🍩</div>
            </div>

            <div className="splash-content">
                <div className="logo-container">
                    <h1 className="main-logo">
                        <span className="word candy">CANDY</span>
                        <span className="word crush">CRUSH</span>
                        <div className="saga-tag">SAGA</div>
                    </h1>
                </div>

                <div className="loading-section">
                    <p className="loading-label">Loading sweet treats...</p>
                    <div className="premium-progress-container">
                        <div
                            className="premium-progress-fill"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            <div className="progress-shimmer" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="splash-version-tag">v1.0.0</div>
        </div>
    );
};

export default SplashScreen;
