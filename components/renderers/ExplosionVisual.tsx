

import React from 'react';
import { Explosion, Quality } from '../../types';
import * as C from '../../constants';

interface ExplosionVisualProps {
    explosion: Explosion;
    quality: Quality;
}

export const ExplosionVisual: React.FC<ExplosionVisualProps> = ({ explosion, quality }) => {
    const progress = explosion.life / explosion.maxLife;
    const opacity = 1 - progress;

    if (quality === 'low') {
        return (
             <div
                style={{
                    position: 'absolute',
                    left: `${(explosion.position.x / C.GAME_WIDTH) * 100}%`,
                    top: `${(explosion.position.y / C.GAME_HEIGHT) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: opacity,
                    width: `${(explosion.size.width / 2 / C.GAME_WIDTH) * 100}%`,
                    height: `${(explosion.size.height / 2 / C.GAME_HEIGHT) * 100}%`,
                    borderRadius: '50%',
                    backgroundColor: '#FBBF24', // A simple yellow dot
                }}
            />
        );
    }

    const scale = progress * 2;
    
    if (quality === 'medium') {
        return (
            <div
                style={{
                    position: 'absolute',
                    left: `${(explosion.position.x / C.GAME_WIDTH) * 100}%`,
                    top: `${(explosion.position.y / C.GAME_HEIGHT) * 100}%`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity: opacity,
                    width: `${(explosion.size.width / C.GAME_WIDTH) * 100}%`,
                    height: `${(explosion.size.height / C.GAME_HEIGHT) * 100}%`,
                    borderRadius: '50%',
                    backgroundColor: '#F97316', // Solid orange circle
                }}
            />
        );
    }

    // High Quality
    return (
        <div
            style={{
                position: 'absolute',
                left: `${(explosion.position.x / C.GAME_WIDTH) * 100}%`,
                top: `${(explosion.position.y / C.GAME_HEIGHT) * 100}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: opacity,
                width: `${(explosion.size.width / C.GAME_WIDTH) * 100}%`,
                height: `${(explosion.size.height / C.GAME_HEIGHT) * 100}%`,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,200,50,1) 0%, rgba(255,100,0,0.8) 50%, rgba(200,0,0,0) 70%)',
            }}
        />
    );
};