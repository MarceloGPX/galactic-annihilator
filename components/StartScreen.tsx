import React from 'react';
import { ControlMode, RankingEntry } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface StartScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
  bestRanking: RankingEntry | null;
  lastRunStats: RankingEntry | null;
  controlMode: ControlMode;
}

const RankingDisplay: React.FC<{ title: string; ranking: RankingEntry | null }> = ({ title, ranking }) => {
    const { t } = useTranslation();
    if (!ranking) return null;
    return (
        <div className="mb-6 p-4 border border-yellow-400/50 rounded-lg bg-black/30 w-full max-w-md">
          <h2 className="text-2xl font-bold text-yellow-300 mb-2">{title}</h2>
          <div className="flex justify-around text-lg">
            <span className="text-white">{t('points')}: <span className="font-bold text-yellow-200">{ranking.score}</span></span>
            <span className="text-white">{t('phase')}: <span className="font-bold text-purple-300">{ranking.phase}</span></span>
            <span className="text-white">{t('time')}: <span className="font-bold text-cyan-300">{new Date(ranking.gameTime).getMinutes().toString().padStart(2, '0')}:{new Date(ranking.gameTime).getSeconds().toString().padStart(2, '0')}</span></span>
          </div>
        </div>
    );
};

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onOpenSettings, bestRanking, lastRunStats, controlMode }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-black/50 rounded-lg shadow-2xl shadow-cyan-500/20 border-2 border-cyan-400">
      <h1 className="text-5xl md:text-7xl font-bold text-cyan-400 tracking-widest" style={{textShadow: '0 0 15px #22d3ee'}}>{t('galactic_annihilator_1')}</h1>
      <h1 className="text-5xl md:text-7xl font-bold text-yellow-300 mb-4 tracking-widest" style={{textShadow: '0 0 15px #facc15'}}>{t('galactic_annihilator_2')}</h1>
      
      {lastRunStats && JSON.stringify(lastRunStats) !== JSON.stringify(bestRanking) && (
        <RankingDisplay title={t('last_run')} ranking={lastRunStats} />
      )}
      
      <RankingDisplay title={t('best_score')} ranking={bestRanking} />

      <p className="text-lg text-gray-300 mb-8 max-w-md">
        {controlMode === 'keyboard' ? (
          <>
            {t('start_instructions_1')} <span className="font-bold text-cyan-300">A</span> {t('start_instructions_2')} <span className="font-bold text-cyan-300">D</span>.
            <br/>
            {t('start_instructions_3')} <span className="font-bold text-cyan-300">{t('mouse')}</span>.
          </>
        ) : (
          <>
            {t('start_instructions_touch_move')}
            <br />
            {t('start_instructions_joystick_2')}
          </>
        )}
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
            onClick={onStart}
            className="w-full px-10 py-4 bg-cyan-500 text-black font-bold text-2xl rounded-md border-2 border-cyan-300
                    hover:bg-yellow-300 hover:text-black hover:scale-105 transition-all duration-300
                    shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(250,204,21,0.8)]"
        >
            {t('start_mission')}
        </button>
        <button
            onClick={onOpenSettings}
            className="w-full px-10 py-3 bg-gray-700 text-white font-bold text-xl rounded-md border-2 border-gray-500
                       hover:bg-purple-600 hover:border-purple-400 hover:scale-105 transition-all duration-300"
        >
            {t('settings')}
        </button>
      </div>
    </div>
  );
};

export default StartScreen;