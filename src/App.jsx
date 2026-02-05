import React from 'react';
import { GameStateProvider, useGameState, SCREENS } from './state/GameStateManager';
import SplashScreen from './screens/SplashScreen';
import MainMenu from './screens/MainMenu';
import WorldMap from './screens/WorldMap';
import GameScreen from './screens/GameScreen';
import SettingsModal from './components/SettingsModal';
import './App.css';

const AppContent = () => {
  const { currentScreen, showSettings } = useGameState();

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.SPLASH:
        return <SplashScreen />;
      case SCREENS.MAIN_MENU:
        return <MainMenu />;
      case SCREENS.WORLD_MAP:
        return <WorldMap />;
      case SCREENS.GAME:
        return <GameScreen />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
      {showSettings && <SettingsModal />}
    </div>
  );
};

const App = () => {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
};

export default App;
