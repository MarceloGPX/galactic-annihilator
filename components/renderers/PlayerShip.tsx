

import React from 'react';
import { Player, Quality } from '../../types';
import * as C from '../../constants';

interface PlayerShipProps {
  player: Player;
  quality: Quality;
}

export const PlayerShip: React.FC<PlayerShipProps> = ({ player, quality }) => {
  const isSuperShieldActive = player.activeSpecial?.id === 'superShield';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${(player.position.x / C.GAME_WIDTH) * 100}%`,
        top: `${(player.position.y / C.GAME_HEIGHT) * 100}%`,
        width: `${(player.size.width / C.GAME_WIDTH) * 100}%`,
        height: `${(player.size.height / C.GAME_HEIGHT) * 100}%`,
      }}
    >
      {isSuperShieldActive && quality !== 'low' && (
        <div 
            className="absolute -inset-2 rounded-full bg-cyan-400/50 animate-pulse" 
            style={{
                filter: quality === 'high' ? 'blur(8px)' : 'none',
            }}
        />
      )}
      <svg width="100%" height="100%" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="player-engine" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop stopColor="#FCD34D"/>
                <stop offset="1" stopColor="#F97316"/>
            </linearGradient>
            {quality === 'high' && (
                <filter id="engine-glow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                </filter>
            )}
        </defs>
        {/* Engine Glow */}
        <path d="M22 65 L38 65 L30 75 Z" fill="url(#player-engine)" filter={quality === 'high' ? "url(#engine-glow)" : "none"} className={quality !== 'low' ? "animate-pulse" : ""} />
        {/* Ship Body */}
        <path d="M30 0L55 50L45 60L30 50L15 60L5 50L30 0Z" fill="#0891B2" stroke="#67E8F9" strokeWidth="2"/>
        <path d="M30 15L40 45L30 40L20 45L30 15Z" fill="#0E7490" />
      </svg>
    </div>
  );
};