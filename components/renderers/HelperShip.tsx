
import React from 'react';
import { Helper, Quality } from '../../types';
import * as C from '../../constants';

interface HelperShipProps {
  helper: Helper;
  quality: Quality;
}

export const HelperShip: React.FC<HelperShipProps> = ({ helper, quality }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${(helper.position.x / C.GAME_WIDTH) * 100}%`,
        top: `${(helper.position.y / C.GAME_HEIGHT) * 100}%`,
        width: `${(helper.size.width / C.GAME_WIDTH) * 100}%`,
        height: `${(helper.size.height / C.GAME_HEIGHT) * 100}%`,
        filter: quality !== 'low' ? 'drop-shadow(0 0 8px #4ade80)' : 'none',
      }}
      className={quality !== 'low' ? 'animate-pulse' : ''}
    >
      <svg width="100%" height="100%" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="helper-engine" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop stopColor="#A7F3D0"/>
                <stop offset="1" stopColor="#6EE7B7"/>
            </linearGradient>
            {quality === 'high' && (
              <filter id="helper-glow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            )}
        </defs>
        {/* Engine Glow */}
        <path d="M22 65 L38 65 L30 75 Z" fill="url(#helper-engine)" filter={quality === 'high' ? "url(#helper-glow)" : "none"} />
        {/* Ship Body */}
        <path d="M30 0L55 50L45 60L30 50L15 60L5 50L30 0Z" fill="#047857" stroke="#34D399" strokeWidth="2"/>
        <path d="M30 15L40 45L30 40L20 45L30 15Z" fill="#065F46" />
      </svg>
    </div>
  );
};