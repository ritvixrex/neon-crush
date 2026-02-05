import React from 'react';
import { useGameState } from '../state/GameStateManager';

const SettingsModal = () => {
    const {
        playerProgress,
        updateSettings,
        setShowSettings
    } = useGameState();

    const { settings } = playerProgress;

    const handleToggle = (setting) => {
        updateSettings({ [setting]: !settings[setting] });
    };

    const handleClose = () => {
        setShowSettings(false);
    };

    return (
        <div className="popup-overlay" onClick={handleClose}>
            <div className="popup-container settings-modal" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="popup-close" onClick={handleClose}>✕</button>

                {/* Header */}
                <div className="popup-header">
                    <h2 className="settings-title">⚙️ Settings</h2>
                </div>

                {/* Settings list */}
                <div className="settings-list">
                    {/* Sound */}
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-icon">🔊</span>
                            <span className="setting-label">Sound Effects</span>
                        </div>
                        <button
                            className={`toggle-btn ${settings.sound ? 'on' : 'off'}`}
                            onClick={() => handleToggle('sound')}
                        >
                            <span className="toggle-indicator" />
                        </button>
                    </div>

                    {/* Music */}
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-icon">🎵</span>
                            <span className="setting-label">Music</span>
                        </div>
                        <button
                            className={`toggle-btn ${settings.music ? 'on' : 'off'}`}
                            onClick={() => handleToggle('music')}
                        >
                            <span className="toggle-indicator" />
                        </button>
                    </div>

                    {/* Haptics */}
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-icon">📳</span>
                            <span className="setting-label">Vibration</span>
                        </div>
                        <button
                            className={`toggle-btn ${settings.haptics ? 'on' : 'off'}`}
                            onClick={() => handleToggle('haptics')}
                        >
                            <span className="toggle-indicator" />
                        </button>
                    </div>
                </div>

                {/* How to Play section */}
                <div className="how-to-play">
                    <h3 className="htp-title">📖 How to Play</h3>
                    <div className="htp-content">
                        <div className="htp-item">
                            <span className="htp-icon">👆</span>
                            <span className="htp-text">Tap two adjacent candies to swap them</span>
                        </div>
                        <div className="htp-item">
                            <span className="htp-icon">3️⃣</span>
                            <span className="htp-text">Match 3 or more candies of the same color</span>
                        </div>
                        <div className="htp-item">
                            <span className="htp-icon">⚡</span>
                            <span className="htp-text">Match 4+ to create special candies!</span>
                        </div>
                        <div className="htp-item">
                            <span className="htp-icon">⭐</span>
                            <span className="htp-text">Complete objectives to earn stars</span>
                        </div>
                    </div>
                </div>

                {/* Credits */}
                <div className="settings-footer">
                    <p className="credits">Candy Crush Clone v1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
