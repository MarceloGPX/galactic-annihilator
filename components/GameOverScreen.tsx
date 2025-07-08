import React from 'react';
import { RankingEntry } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface GameOverScreenProps {
  stats: RankingEntry;
  onGoHome: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ stats, onGoHome }) => {
  const { t } = useTranslation();
  const time = new Date(0);
  time.setMilliseconds(stats.gameTime);
  const timeString = `${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8 bg-black/50 rounded-lg shadow-2xl shadow-red-500/20 border-2 border-red-500 w-full max-w-4xl">
      <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-red-500 mb-4" style={{textShadow: '0 0 15px #ef4444'}}>{t('game_over')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 md:gap-x-8 my-8 text-center w-full">
        <div className="text-center">
            <p className="text-xl md:text-2xl text-gray-300 mb-2">{t('final_score')}</p>
            <p className="text-5xl md:text-6xl font-bold text-yellow-300" style={{textShadow: '0 0 15px #facc15'}}>{stats.score}</p>
        </div>
        <div className="text-center">
            <p className="text-xl md:text-2xl text-gray-300 mb-2">{t('phase_reached')}</p>
            <p className="text-5xl md:text-6xl font-bold text-purple-300" style={{textShadow: '0 0 15px #c084fc'}}>{stats.phase}</p>
        </div>
        <div className="text-center">
            <p className="text-xl md:text-2xl text-gray-300 mb-2">{t('survival_time')}</p>
            <p className="text-5xl md:text-6xl font-bold text-cyan-300" style={{textShadow: '0 0 15px #22d3ee'}}>{timeString}</p>
        </div>
      </div>
      
      <button
        onClick={onGoHome}
        className="px-10 py-4 bg-cyan-500 text-black font-bold text-2xl rounded-md border-2 border-cyan-300
                   hover:bg-yellow-300 hover:text-black hover:scale-110 transition-all duration-300
                   shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(250,204,21,0.8)]"
      >
        {t('back_to_menu')}
      </button>
    </div>
  );
};

export default GameOverScreen;