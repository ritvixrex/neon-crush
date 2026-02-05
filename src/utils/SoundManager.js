/**
 * Sound Effects Manager
 * Handles audio playback for game events
 */

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.musicEnabled = true;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        // Create audio context for web audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }

        this.initialized = true;
    }

    // Generate simple tones using Web Audio API
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // Envelope
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    // Sound effect: Candy selected
    playSelect() {
        this.playTone(600, 0.1, 'sine', 0.2);
    }

    // Sound effect: Valid swap
    playSwap() {
        this.playTone(400, 0.08, 'sine', 0.25);
        setTimeout(() => this.playTone(500, 0.08, 'sine', 0.25), 50);
    }

    // Sound effect: Invalid swap
    playInvalidSwap() {
        this.playTone(200, 0.15, 'square', 0.15);
    }

    // Sound effect: Match (basic 3-match)
    playMatch(combo = 1) {
        const baseFreq = 523; // C5
        const freq = baseFreq * (1 + combo * 0.1);
        this.playTone(freq, 0.15, 'sine', 0.3);
        setTimeout(() => this.playTone(freq * 1.25, 0.1, 'sine', 0.25), 80);
    }

    // Sound effect: Special candy created
    playSpecialCreated() {
        this.playTone(523, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 80);
        setTimeout(() => this.playTone(784, 0.15, 'sine', 0.35), 160);
    }

    // Sound effect: Special candy activated
    playSpecialActivated() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playTone(400 + i * 100, 0.1, 'sawtooth', 0.15);
            }, i * 40);
        }
    }

    // Sound effect: Color bomb explosion
    playColorBomb() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playTone(300 + Math.random() * 400, 0.15, 'sawtooth', 0.2);
            }, i * 50);
        }
    }

    // Sound effect: Candy drop/fall
    playDrop() {
        this.playTone(300, 0.05, 'sine', 0.15);
    }

    // Sound effect: Level complete
    playLevelComplete() {
        const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.35);
            }, i * 150);
        });
    }

    // Sound effect: Star earned
    playStar(starNumber = 1) {
        const freq = 600 + starNumber * 100;
        this.playTone(freq, 0.2, 'sine', 0.3);
        setTimeout(() => this.playTone(freq * 1.5, 0.15, 'sine', 0.25), 100);
    }

    // Sound effect: Level failed
    playLevelFailed() {
        this.playTone(300, 0.2, 'sine', 0.3);
        setTimeout(() => this.playTone(250, 0.2, 'sine', 0.3), 200);
        setTimeout(() => this.playTone(200, 0.4, 'sine', 0.25), 400);
    }

    // Sound effect: Button click
    playClick() {
        this.playTone(800, 0.05, 'sine', 0.2);
    }

    // Sound effect: Popup open
    playPopup() {
        this.playTone(500, 0.08, 'sine', 0.2);
        setTimeout(() => this.playTone(700, 0.1, 'sine', 0.2), 50);
    }

    // Sound effect: Cascade bonus
    playCascade(cascadeLevel = 1) {
        const baseFreq = 400 + cascadeLevel * 50;
        this.playTone(baseFreq, 0.1, 'sine', 0.25);
        setTimeout(() => this.playTone(baseFreq * 1.2, 0.1, 'sine', 0.25), 60);
        setTimeout(() => this.playTone(baseFreq * 1.5, 0.12, 'sine', 0.3), 120);
    }

    // Enable/disable sound effects
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Enable/disable music
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
    }

    // Haptic feedback (for mobile)
    vibrate(pattern = [50]) {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Ignore vibration errors
            }
        }
    }

    // Combined feedback: sound + haptic
    playWithHaptic(soundMethod, hapticPattern = [30]) {
        soundMethod.call(this);
        this.vibrate(hapticPattern);
    }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;

// Convenience exports
export const playSelect = () => soundManager.playSelect();
export const playSwap = () => soundManager.playSwap();
export const playInvalidSwap = () => soundManager.playInvalidSwap();
export const playMatch = (combo) => soundManager.playMatch(combo);
export const playSpecialCreated = () => soundManager.playSpecialCreated();
export const playSpecialActivated = () => soundManager.playSpecialActivated();
export const playColorBomb = () => soundManager.playColorBomb();
export const playDrop = () => soundManager.playDrop();
export const playLevelComplete = () => soundManager.playLevelComplete();
export const playStar = (n) => soundManager.playStar(n);
export const playLevelFailed = () => soundManager.playLevelFailed();
export const playClick = () => soundManager.playClick();
export const playPopup = () => soundManager.playPopup();
export const playCascade = (level) => soundManager.playCascade(level);
export const initSound = () => soundManager.init();
export const setSound = (enabled) => soundManager.setEnabled(enabled);
export const setMusic = (enabled) => soundManager.setMusicEnabled(enabled);
export const vibrate = (pattern) => soundManager.vibrate(pattern);
