
import React from 'react';
import { Projectile, Quality } from '../../types';
import * as C from '../../constants';

interface ProjectileVisualProps {
  projectile: Projectile;
  quality: Quality;
  colorClass?: string;
}

export const ProjectileVisual: React.FC<ProjectileVisualProps> = ({ projectile, quality, colorClass }) => {
  const baseColor = colorClass || "bg-yellow-300";
  const shadow = quality !== 'low' ? (colorClass ? "shadow-[0_0_10px_rgba(239,68,68,0.9)]" : "shadow-[0_0_10px_rgba(250,204,21,0.9)]") : "";
  const finalClass = `${baseColor} ${shadow} rounded-full`;

  const scale = projectile.scale || 1;
  const transformX = scale > 1 ? -((scale - 1) / (scale * 2)) * 100 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${(projectile.position.x / C.GAME_WIDTH) * 100}%`,
        top: `${(projectile.position.y / C.GAME_HEIGHT) * 100}%`,
        width: `${(projectile.size.width * scale / C.GAME_WIDTH) * 100}%`,
        height: `${(projectile.size.height * scale / C.GAME_HEIGHT) * 100}%`,
        transform: `translateX(${transformX}%)`,
      }}
      className={finalClass}
    />
  );
};