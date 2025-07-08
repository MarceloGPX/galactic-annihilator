import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import SettingsScreen from './components/SettingsScreen';
import { Difficulty, Quality, RankingEntry, ControlMode } from './types';

export type GameStatus = 'NOT_STARTED' | 'PLAYING' | 'GAME_OVER';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('NOT_STARTED');
  const [lastRunStats, setLastRunStats] = useState<RankingEntry | null>(null);
  const [bestRanking, setBestRanking] = useState<RankingEntry | null>(() => {
    try {
      const saved = localStorage.getItem('galactic_annihilator_ranking');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [quality, setQuality] = useState<Quality>('high');
  const [controlMode, setControlMode] = useState<ControlMode>(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return isTouchDevice ? 'touch' : 'keyboard';
  });

  const handleStart = useCallback(() => {
    setIsSettingsOpen(false);
    setGameStatus('PLAYING');
    setLastRunStats(null);
  }, []);

  const handleGoHome = useCallback(() => {
    setGameStatus('NOT_STARTED');
  }, []);

  const handleGameOver = useCallback((stats: RankingEntry) => {
    setGameStatus('GAME_OVER');
    setLastRunStats(stats);

    if (!bestRanking || stats.score > bestRanking.score) {
      setBestRanking(stats);
      try {
        localStorage.setItem('galactic_annihilator_ranking', JSON.stringify(stats));
      } catch (error) {
        console.error("Failed to save ranking:", error);
      }
    }
  }, [bestRanking]);

  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

  const renderContent = () => {
    if (isSettingsOpen) {
      return (
        <SettingsScreen
          difficulty={difficulty}
          quality={quality}
          controlMode={controlMode}
          onDifficultyChange={setDifficulty}
          onQualityChange={setQuality}
          onControlModeChange={setControlMode}
          onClose={handleCloseSettings}
        />
      );
    }

    switch (gameStatus) {
      case 'NOT_STARTED':
        return <StartScreen onStart={handleStart} onOpenSettings={handleOpenSettings} bestRanking={bestRanking} lastRunStats={lastRunStats} controlMode={controlMode} />;
      case 'PLAYING':
        return (
          <Game
            onGameOver={handleGameOver}
            onRestart={handleStart}
            onGoHome={handleGoHome}
            difficulty={difficulty}
            quality={quality}
            controlMode={controlMode}
          />
        );
      case 'GAME_OVER':
        return <GameOverScreen stats={lastRunStats!} onGoHome={handleGoHome} />;
      default:
        return <StartScreen onStart={handleStart} onOpenSettings={handleOpenSettings} bestRanking={bestRanking} lastRunStats={lastRunStats} controlMode={controlMode}/>;
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black font-sans text-white overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default App;