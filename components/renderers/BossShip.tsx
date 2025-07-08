

import React from 'react';
import { Boss, Quality } from '../../types';
import * as C from '../../constants';

interface BossShipProps {
  boss: Boss;
  quality: Quality;
}

export const BossShip: React.FC<BossShipProps> = ({ boss, quality }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${(boss.position.x / C.GAME_WIDTH) * 100}%`,
        top: `${(boss.position.y / C.GAME_HEIGHT) * 100}%`,
        width: `${(boss.size.width / C.GAME_WIDTH) * 100}%`,
        height: `${(boss.size.height / C.GAME_HEIGHT) * 100}%`,
        filter: quality === 'high' ? 'drop-shadow(0 0 10px #db2777)' : 'none',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 0L200 75V150H0V75L100 0Z" fill="#9D174D" stroke="#F9A8D4" strokeWidth="3"/>
        <path d="M20 120H180L100 90L20 120Z" fill="#BE185D"/>
        <circle cx="100" cy="60" r="25" fill="#831843" stroke="#F9A8D4" strokeWidth="2"/>
        <path d="M40 70L0 100" stroke="#F9A8D4" strokeWidth="3"/>
        <path d="M160 70L200 100" stroke="#F9A8D4" strokeWidth="3"/>
      </svg>
    </div>
  );
};