export interface Vector2D {
  x: number;
  y: number;
}

export type SkillId = 'damage' | 'maxHealth' | 'defense' | 'agility' | 'fireRate' | 'multishot' | 'regen' | 'hullRegen';

export type SpecialAbilityId = 'bomb' | 'powerShot' | 'helper' | 'superShield';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Quality = 'low' | 'medium' | 'high';
export type ControlMode = 'keyboard' | 'touch';

export interface SpecialAbilityState {
  lastUsed: number;
  cooldown: number;
}

export interface Skill {
  id: SkillId;
  name: string;
  description: string;
  level: number;
  maxLevel?: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  size: {
    width: number;
    height: number;
  };
}

export interface Player extends GameObject {
  shield: number;
  maxShield: number;
  hull: number;
  maxHull: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  // New skill-based stats
  damage: number;
  defense: number; // 0-1 percentage
  moveSpeed: number;
  fireRate: number; // ms between shots
  projectileCount: number;
  shieldRegen: number; // shield per second
  hullRegen: number; // hull per second
  skills: Record<SkillId, number>; // level of each skill
  // Special Abilities
  specialAbilities: Record<SpecialAbilityId, SpecialAbilityState>;
  activeSpecial: { id: SpecialAbilityId; until: number } | null;
}

export interface Enemy extends GameObject {
  health: number;
  type: 'normal' | 'fast' | 'strong';
  velocity: Vector2D;
  contactDamage: number;
  projectileDamage: number;
  lastShotTime: number;
}

export interface Boss extends GameObject {
  health: number;
  maxHealth: number;
  velocity: Vector2D;
  contactDamage: number;
  projectileDamage: number;
  lastShotTime: number;
}

export interface Projectile extends GameObject {
  velocity: Vector2D;
  scale?: number;
}

export interface EnemyProjectile extends Projectile {
    damage: number;
}

export interface Explosion extends GameObject {
  life: number;
  maxLife: number;
}

export interface Helper extends GameObject {
  life: number; // Duration timer
  lastShotTime: number;
}

export interface RankingEntry {
  score: number;
  phase: number;
  gameTime: number;
}