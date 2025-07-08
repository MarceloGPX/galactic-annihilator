import React from 'react';
import { Player, Quality, SkillId } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface SkillsDisplayProps {
  player: Player;
  quality: Quality;
}

const SKILL_ORDER: SkillId[] = ['fireRate', 'damage', 'maxHealth', 'defense', 'agility', 'multishot', 'regen', 'hullRegen'];

const getSkillMeta = (t: (key: string) => string): Record<SkillId, { name: string; maxDots: number }> => ({
    fireRate: { name: t('skill_display_firerate'), maxDots: 5 },
    damage: { name: t('skill_display_damage'), maxDots: 5 },
    maxHealth: { name: t('skill_display_hull'), maxDots: 4 },
    defense: { name: t('skill_display_defense'), maxDots: 5 },
    agility: { name: t('skill_display_agility'), maxDots: 5 },
    multishot: { name: t('skill_display_multishot'), maxDots: 4 },
    regen: { name: t('skill_display_shield_regen'), maxDots: 5 },
    hullRegen: { name: t('skill_display_hull_regen'), maxDots: 5 },
});


const SkillRow: React.FC<{
    name: string;
    level: number;
    maxDots: number;
    value: string;
    quality: Quality;
}> = ({ name, level, maxDots, value, quality }) => {
    return (
        <div className="grid grid-cols-[80px_1fr_auto] items-center gap-x-2 text-xs font-mono">
            <span className="truncate text-purple-200">{name}</span>
            <div className="flex items-center gap-1">
                {Array.from({ length: maxDots }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            i < level ? 'bg-purple-400' : 'bg-gray-600'
                        }`}
                        style={{ boxShadow: i < level && quality !== 'low' ? '0 0 4px #c084fc' : 'none' }}
                    />
                ))}
            </div>
            <span className="text-right text-purple-300 font-semibold w-14">{value}</span>
        </div>
    );
};

export const SkillsDisplay: React.FC<SkillsDisplayProps> = ({ player, quality }) => {
    const { t } = useTranslation();
    const SKILL_META = getSkillMeta(t);
    
    const getSkillValue = (skillId: SkillId): string => {
        switch (skillId) {
            case 'fireRate':
                return `${(1000 / player.fireRate).toFixed(1)}/s`;
            case 'damage':
                return player.damage.toString();
            case 'maxHealth':
                return player.maxHull.toString();
            case 'defense':
                return `${(player.defense * 100).toFixed(0)}%`;
            case 'agility':
                return player.moveSpeed.toFixed(1);
            case 'multishot':
                return `x${player.projectileCount}`;
            case 'regen':
                if (player.shieldRegen <= 0) return '—';
                return `${player.shieldRegen.toFixed(1)}/s`;
            case 'hullRegen':
                if (player.hullRegen <= 0) return '—';
                return `${player.hullRegen.toFixed(1)}/s`;
            default:
                return '';
        }
    };

    const containerClasses = `absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 border-2 border-purple-400/50 rounded-2xl p-3 text-white w-60 flex-col gap-2 pointer-events-none ${quality === 'high' ? 'backdrop-blur-sm' : ''} ${quality !== 'low' ? 'shadow-lg shadow-purple-500/20' : ''} hidden md:flex`;

    return (
        <div className={containerClasses}>
            <h3 className="text-center font-bold text-purple-300 text-base mb-1 tracking-[0.2em] uppercase">
                {t('skills')}
            </h3>
            {SKILL_ORDER.map(skillId => {
                const meta = SKILL_META[skillId];
                if (!meta) return null;
                const level = player.skills[skillId] || 0;
                
                return (
                    <SkillRow
                        key={skillId}
                        name={meta.name}
                        level={level}
                        maxDots={meta.maxDots}
                        value={getSkillValue(skillId)}
                        quality={quality}
                    />
                );
            })}
        </div>
    );
};