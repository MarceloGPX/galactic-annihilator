
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 1000;

export const PLAYER_SIZE = { width: 60, height: 75 };
export const PLAYER_INITIAL_SHIELD = 100;
export const PLAYER_INITIAL_HULL = 100;
export const PLAYER_MAX_SHIELD_CAP = 200;
export const PLAYER_MAX_HULL_CAP = 200;
export const PLAYER_INITIAL_LEVEL = 1;

// Base stats for the new skill system
export const PLAYER_BASE_DAMAGE = 5;
export const PLAYER_BASE_MOVESPEED = 8;
export const PLAYER_BASE_FIRE_RATE = 200; // Slower to make upgrades feel better
export const PLAYER_BASE_PROJECTILE_COUNT = 1;

// Upgrade amounts
export const DAMAGE_UPGRADE = 3;
export const MAX_HEALTH_UPGRADE = 25; // Affects hull now
export const DEFENSE_UPGRADE = 0.15; // 15%
export const AGILITY_UPGRADE = 1.2;
export const FIRE_RATE_UPGRADE = -15; // ms reduction
export const MULTISHOT_UPGRADE = 1;
export const REGEN_UPGRADE = 0.5; // shield per second
export const HULL_REGEN_UPGRADE = 0.25; // hull per second

export const PROJECTILE_SIZE = { width: 8, height: 24 };
export const PROJECTILE_SPEED = 15;
export const PROJECTILE_SPREAD_ANGLE = 0.25; // radians for multishot

export const ENEMY_CONTACT_DAMAGE = 5;

// Projectile Damage
export const ENEMY_NORMAL_PROJECTILE_DAMAGE = 5;
export const ENEMY_FAST_PROJECTILE_DAMAGE = 10; // Purple
export const ENEMY_STRONG_PROJECTILE_DAMAGE = 8; // Orange

// Base Fire Rates (ms between shots)
export const ENEMY_NORMAL_FIRE_RATE = 2000;
export const ENEMY_FAST_FIRE_RATE = 1500;
export const ENEMY_STRONG_FIRE_RATE = 2500;

// Enemy Projectiles
export const ENEMY_PROJECTILE_SIZE = { width: 10, height: 10 };
export const ENEMY_PROJECTILE_SPEED = 5;

// Base Enemy Stats
export const ENEMY_NORMAL_SIZE = { width: 50, height: 50 };
export const ENEMY_NORMAL_HEALTH = 10;
export const ENEMY_NORMAL_SPEED = 2;
export const ENEMY_NORMAL_SCORE = 10;

export const ENEMY_FAST_SIZE = { width: 40, height: 40 };
export const ENEMY_FAST_HEALTH = 5;
export const ENEMY_FAST_SPEED = 4;
export const ENEMY_FAST_SCORE = 15;

export const ENEMY_STRONG_SIZE = { width: 70, height: 70 };
export const ENEMY_STRONG_HEALTH = 30;
export const ENEMY_STRONG_SPEED = 1.5;
export const ENEMY_STRONG_SCORE = 30;

// --- Difficulty Scaling ---
// Time-based scaling
export const INITIAL_ENEMY_SPAWN_RATE_MS = 1000;
export const INITIAL_MAX_ENEMIES = 15;
export const TIME_SCALING_INTERVAL_MS = 10000; // Every 10 seconds
export const EARLY_GAME_SCALING_FACTOR = 0.005; // 0.5% increase per interval for the first minute
export const LATE_GAME_SCALING_FACTOR = 0.01;   // 1% increase per interval after the first minute

// Phase-based scaling (per boss killed)
export const PHASE_ENEMY_HEALTH_INCREASE_NORMAL = 5;
export const PHASE_ENEMY_HEALTH_INCREASE_ELITE = 15;
export const PHASE_ENEMY_FIRE_RATE_MULTIPLIER = 0.8; // 20% faster
export const PHASE_ENEMY_SPEED_MULTIPLIER = 0.95;    // 5% slower
export const PHASE_MAX_ENEMIES_MULTIPLIER = 2;
export const ENEMY_DAMAGE_INCREASE_PER_PHASE = 0.1; // 10% (for projectiles)


// Boss
export const BOSS_SIZE = { width: 200, height: 150 };
export const BOSS_INITIAL_HEALTH = 500;
export const BOSS_SPEED = 2;
export const BOSS_SPAWN_INTERVAL_MS = 120000; // 2 minutes
export const BOSS_SCORE_REWARD = 250;
export const BOSS_CONTACT_DAMAGE = 25;
export const BOSS_PROJECTILE_DAMAGE = 30;
export const BOSS_FIRE_RATE = 1200;
export const BOSS_DAMAGE_INCREASE_PER_PHASE = 0.1;
export const BOSS_MAX_DAMAGE_INCREASE = 0.9;


export const LEVEL_UP_BASE_XP = 100;

// Special Abilities
export const BOMB_COOLDOWN = 60000; // 60 seconds
export const POWER_SHOT_COOLDOWN = 45000; // 45 seconds
export const POWER_SHOT_DURATION = 15000; // 15 seconds
export const POWER_SHOT_DAMAGE_MULTIPLIER = 1.3;
export const POWER_SHOT_PROJECTILE_SCALE = 1.5;
export const HELPER_COOLDOWN = 90000; // 90 seconds
export const HELPER_DURATION = 15000; // 15 seconds
export const HELPER_SIZE = { width: 45, height: 56.25 }; // Maintained 4/5 aspect ratio of original SVG
export const HELPER_FIRE_RATE = 500;
export const HELPER_DAMAGE_MULTIPLIER = 1.5;
export const SUPER_SHIELD_COOLDOWN = 120000; // 120 seconds
export const SUPER_SHIELD_DURATION = 15000; // 15 seconds

// --- Settings ---
export const DIFFICULTY_SETTINGS = {
  easy: { health: 0.75, damage: 0.8, xp: 1.25, spawnRate: 1.2 },
  medium: { health: 1.0, damage: 1.0, xp: 1.0, spawnRate: 1.0 },
  hard: { health: 1.5, damage: 1.25, xp: 0.8, spawnRate: 0.8 },
};