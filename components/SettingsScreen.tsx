import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Difficulty, Quality, ControlMode } from '../types';
import { Language, useTranslation } from '../contexts/LanguageContext';

interface SettingsScreenProps {
  difficulty: Difficulty;
  quality: Quality;
  controlMode: ControlMode;
  onDifficultyChange: (d: Difficulty) => void;
  onQualityChange: (q: Quality) => void;
  onControlModeChange: (c: ControlMode) => void;
  onClose: () => void;
}

const SettingsButton = <T extends string>({
  label,
  value,
  currentValue,
  onClick,
}: {
  label: string;
  value: T;
  currentValue: T;
  onClick: Dispatch<SetStateAction<T>> | ((value: T) => void);
}) => {
  const isSelected = value === currentValue;
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 text-lg font-bold rounded-md border-2 transition-all duration-200 w-full
        ${
          isSelected
            ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]'
            : 'bg-gray-700 text-white border-gray-500 hover:bg-gray-600 hover:border-gray-400'
        }`}
    >
      {label}
    </button>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  difficulty,
  quality,
  controlMode,
  onDifficultyChange,
  onQualityChange,
  onControlModeChange,
  onClose,
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [tempDifficulty, setTempDifficulty] = useState<Difficulty>(difficulty);
  const [tempQuality, setTempQuality] = useState<Quality>(quality);
  const [tempControlMode, setTempControlMode] = useState<ControlMode>(controlMode);


  useEffect(() => {
    setTempDifficulty(difficulty);
    setTempQuality(quality);
    setTempControlMode(controlMode);
  }, [difficulty, quality, controlMode]);

  const handleSave = () => {
    onDifficultyChange(tempDifficulty);
    onQualityChange(tempQuality);
    onControlModeChange(tempControlMode);
    onClose();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-black/70 rounded-lg shadow-2xl shadow-purple-500/20 border-2 border-purple-400 w-full max-w-lg backdrop-blur-sm">
      <h1 className="text-5xl font-bold text-purple-300 mb-8 tracking-widest" style={{ textShadow: '0 0 15px #c084fc' }}>
        {t('settings')}
      </h1>

      <div className="w-full flex flex-col gap-6 mb-8">
        {/* Difficulty Settings */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-2">{t('difficulty')}</h2>
          <div className="grid grid-cols-3 gap-3 w-full">
            <SettingsButton<Difficulty> label={t('easy')} value="easy" currentValue={tempDifficulty} onClick={setTempDifficulty} />
            <SettingsButton<Difficulty> label={t('medium')} value="medium" currentValue={tempDifficulty} onClick={setTempDifficulty} />
            <SettingsButton<Difficulty> label={t('hard')} value="hard" currentValue={tempDifficulty} onClick={setTempDifficulty} />
          </div>
        </div>

        {/* Quality Settings */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-2">{t('graphics_quality')}</h2>
          <div className="grid grid-cols-3 gap-3 w-full">
            <SettingsButton<Quality> label={t('low')} value="low" currentValue={tempQuality} onClick={setTempQuality} />
            <SettingsButton<Quality> label={t('medium_quality')} value="medium" currentValue={tempQuality} onClick={setTempQuality} />
            <SettingsButton<Quality> label={t('high')} value="high" currentValue={tempQuality} onClick={setTempQuality} />
          </div>
        </div>

        {/* Controls Settings */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-2">{t('controls')}</h2>
          <div className="grid grid-cols-2 gap-3 w-full">
            <SettingsButton<ControlMode> label={t('keyboard_mouse')} value="keyboard" currentValue={tempControlMode} onClick={setTempControlMode} />
            <SettingsButton<ControlMode> label={t('touch_joystick')} value="touch" currentValue={tempControlMode} onClick={setTempControlMode} />
          </div>
        </div>
        
        {/* Language Settings */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-2">{t('language')}</h2>
          <div className="grid grid-cols-3 gap-3 w-full">
            <SettingsButton<Language> label={t('portuguese')} value="pt" currentValue={language} onClick={setLanguage} />
            <SettingsButton<Language> label={t('english')} value="en" currentValue={language} onClick={setLanguage} />
            <SettingsButton<Language> label={t('spanish')} value="es" currentValue={language} onClick={setLanguage} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-10 py-3 bg-yellow-400 text-black font-bold text-2xl rounded-md border-2 border-yellow-300
                   hover:bg-yellow-300 hover:scale-105 transition-all duration-300
                   shadow-[0_0_20px_rgba(250,204,21,0.7)]"
      >
        {t('save_and_back')}
      </button>
    </div>
  );
};

export default SettingsScreen;