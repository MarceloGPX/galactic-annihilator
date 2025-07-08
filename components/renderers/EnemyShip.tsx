

import React from 'react';
import { Enemy } from '../../types';
import * as C from '../../constants';

interface EnemyShipProps {
  enemy: Enemy;
}

const NormalEnemy: React.FC<{}> = () => (
    <svg width="100%" height="100%" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 50L0 25L25 0L50 25L25 50Z" fill="#DC2626" stroke="#F87171" strokeWidth="2"/>
        <circle cx="25" cy="25" r="8" fill="#B91C1C"/>
    </svg>
);

const FastEnemy: React.FC<{}> = () => (
    <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0L40 40H0L20 0Z" fill="#9333EA" stroke="#C084FC" strokeWidth="2"/>
        <path d="M20 10L30 30H10L20 10Z" fill="#7E22CE"/>
    </svg>
);

const StrongEnemy: React.FC<{}> = () => (
    <svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 0L60.6218 26.25V70H9.37822V26.25L35 0Z" fill="#D97706" stroke="#FBBF24" strokeWidth="2"/>
        <rect x="25" y="30" width="20" height="20" fill="#B45309"/>
    </svg>
);


export const EnemyShip: React.FC<EnemyShipProps> = ({ enemy }) => {
    const renderShip = () => {
        switch(enemy.type) {
            case 'fast': return <FastEnemy />;
            case 'strong': return <StrongEnemy />;
            case 'normal':
            default: return <NormalEnemy />;
        }
    }
    
  return (
    <div
      style={{
        position: 'absolute',
        left: `${(enemy.position.x / C.GAME_WIDTH) * 100}%`,
        top: `${(enemy.position.y / C.GAME_HEIGHT) * 100}%`,
        width: `${(enemy.size.width / C.GAME_WIDTH) * 100}%`,
        height: `${(enemy.size.height / C.GAME_HEIGHT) * 100}%`,
      }}
    >
      {renderShip()}
    </div>
  );
};