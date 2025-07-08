import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Player, Enemy, Projectile, Boss, Explosion, Vector2D, GameObject, SkillId, Skill, EnemyProjectile, SpecialAbilityId, Helper, Difficulty, Quality, RankingEntry, ControlMode } from '../types';
import * as C from '../constants';
import { HUD } from './HUD';
import { PlayerShip } from './renderers/PlayerShip';
import { EnemyShip } from './renderers/EnemyShip';
import { BossShip } from './renderers/BossShip';
import { ProjectileVisual } from './renderers/ProjectileVisual';
import { ExplosionVisual } from './renderers/ExplosionVisual';
import { SkillsDisplay } from './SkillsDisplay';
import { HelperShip } from './renderers/HelperShip';
import { useTranslation } from '../contexts/LanguageContext';
import Joystick from './Joystick';
import MovementArrows from './MovementArrows';

interface GameProps {
  onGameOver: (stats: RankingEntry) => void;
  onRestart: () => void;
  onGoHome: () => void;
  difficulty: Difficulty;
  quality: Quality;
  controlMode: ControlMode;
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  enemyProjectiles: EnemyProjectile[];
  boss: Boss | null;
  helper: Helper | null;
  explosions: Explosion[];
  score: number;
  phase: number;
  gameTime: number;
  maxEnemies: number;
  enemySpawnRateMultiplier: number;
  enemyFireRateMultiplier: number;
  nextBossSpawnTime: number;
}

interface SkillConfig {
    id: SkillId;
    name: string;
    maxLevel?: number;
    getDescription: (level: number) => string;
}


const LevelUpScreen: React.FC<{ skills: Skill[]; onSelect: (skillId: SkillId) => void; }> = ({ skills, onSelect }) => {
    const { t } = useTranslation();
    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-md p-4">
            <h2 className="text-4xl md:text-6xl font-bold text-yellow-300 mb-2 tracking-widest animate-pulse" style={{ textShadow: '0 0 15px #facc15' }}>{t('level_up')}</h2>
            <p className="text-lg md:text-xl text-cyan-300 mb-8 text-center">{t('level_up_prompt')}</p>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full justify-center">
                {skills.map(skill => (
                    <button key={skill.id} onClick={() => onSelect(skill.id)}
                        className="w-full max-w-xs md:w-64 h-auto md:h-80 p-4 md:p-6 bg-gray-900/80 border-2 border-cyan-400 rounded-lg flex flex-col items-center
                                text-center hover:bg-cyan-900 hover:scale-105 hover:border-yellow-300 transition-all duration-300
                                shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-yellow-400/20">
                        <h3 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-3">{skill.name}</h3>
                        <p className="text-cyan-200 text-base md:text-lg flex-grow">{skill.description}</p>
                        <div className="text-base text-gray-400 mt-4">
                            {skill.maxLevel ? t('skill_level', skill.level, skill.maxLevel) : t('skill_level_no_max', skill.level)}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

const PauseMenu: React.FC<{ onContinue: () => void; onRestart: () => void; onGoHome: () => void; }> = ({ onContinue, onRestart, onGoHome }) => {
    const { t } = useTranslation();
    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <div className="text-center p-8 bg-black/50 rounded-lg shadow-2xl shadow-cyan-500/20 border-2 border-cyan-400 flex flex-col gap-6 w-80">
                <h2 className="text-6xl font-bold text-cyan-400 tracking-widest" style={{ textShadow: '0 0 15px #22d3ee' }}>{t('paused')}</h2>
                <button onClick={onContinue} className="px-10 py-4 bg-cyan-500 text-black font-bold text-xl rounded-md border-2 border-cyan-300 hover:bg-yellow-300 hover:text-black hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(250,204,21,0.8)]">{t('continue')}</button>
                <button onClick={onRestart} className="px-10 py-3 bg-gray-600 text-white font-bold text-xl rounded-md border-2 border-gray-400 hover:bg-cyan-500 hover:text-black hover:scale-105 transition-all duration-300">{t('restart')}</button>
                <button onClick={onGoHome} className="px-10 py-3 bg-gray-600 text-white font-bold text-xl rounded-md border-2 border-gray-400 hover:bg-cyan-500 hover:text-black hover:scale-105 transition-all duration-300">{t('main_menu')}</button>
            </div>
        </div>
    );
};

const Game: React.FC<GameProps> = ({ onGameOver, onRestart, onGoHome, difficulty, quality, controlMode }) => {
  const { t } = useTranslation();

  const SKILLS_CONFIG: Record<SkillId, SkillConfig> = useMemo(() => ({
    damage: { id: 'damage', name: t('skill_damage'), getDescription: () => t('skill_damage_desc', C.DAMAGE_UPGRADE) },
    maxHealth: { id: 'maxHealth', name: t('skill_maxHealth'), maxLevel: 4, getDescription: () => t('skill_maxHealth_desc', C.MAX_HEALTH_UPGRADE) },
    defense: { id: 'defense', name: t('skill_defense'), maxLevel: 5, getDescription: (level: number) => t('skill_defense_desc', ((level - 1) * C.DEFENSE_UPGRADE * 100).toFixed(0)) },
    agility: { id: 'agility', name: t('skill_agility'), getDescription: () => t('skill_agility_desc') },
    fireRate: { id: 'fireRate', name: t('skill_fireRate'), getDescription: () => t('skill_fireRate_desc') },
    multishot: { id: 'multishot', name: t('skill_multishot'), maxLevel: 4, getDescription: () => t('skill_multishot_desc') },
    regen: { id: 'regen', name: t('skill_regen'), getDescription: (level: number) => t('skill_regen_desc', (level * C.REGEN_UPGRADE).toFixed(1)) },
    hullRegen: { id: 'hullRegen', name: t('skill_hullRegen'), maxLevel: 5, getDescription: (level: number) => t('skill_hullRegen_desc', (level * C.HULL_REGEN_UPGRADE).toFixed(1))},
  }), [t]);

  const [gameState, setGameState] = useState<GameState>({
    player: {
      id: 'player',
      position: { x: C.GAME_WIDTH / 2 - C.PLAYER_SIZE.width / 2, y: C.GAME_HEIGHT - C.PLAYER_SIZE.height - 20 },
      size: C.PLAYER_SIZE,
      shield: C.PLAYER_INITIAL_SHIELD,
      maxShield: C.PLAYER_INITIAL_SHIELD,
      hull: C.PLAYER_INITIAL_HULL,
      maxHull: C.PLAYER_INITIAL_HULL,
      level: C.PLAYER_INITIAL_LEVEL,
      xp: 0,
      xpToNextLevel: C.LEVEL_UP_BASE_XP,
      damage: C.PLAYER_BASE_DAMAGE,
      defense: 0,
      moveSpeed: C.PLAYER_BASE_MOVESPEED,
      fireRate: C.PLAYER_BASE_FIRE_RATE,
      projectileCount: C.PLAYER_BASE_PROJECTILE_COUNT,
      shieldRegen: 0,
      hullRegen: 0,
      skills: { damage: 0, maxHealth: 0, defense: 0, agility: 0, fireRate: 0, multishot: 0, regen: 0, hullRegen: 0 },
      specialAbilities: {
        bomb: { lastUsed: -C.BOMB_COOLDOWN, cooldown: C.BOMB_COOLDOWN },
        powerShot: { lastUsed: -C.POWER_SHOT_COOLDOWN, cooldown: C.POWER_SHOT_COOLDOWN },
        helper: { lastUsed: -C.HELPER_COOLDOWN, cooldown: C.HELPER_COOLDOWN },
        superShield: { lastUsed: -C.SUPER_SHIELD_COOLDOWN, cooldown: C.SUPER_SHIELD_COOLDOWN },
      },
      activeSpecial: null,
    },
    enemies: [], projectiles: [], enemyProjectiles: [], boss: null, explosions: [], score: 0, phase: 1,
    gameTime: 0, maxEnemies: C.INITIAL_MAX_ENEMIES, enemySpawnRateMultiplier: 1, enemyFireRateMultiplier: 1, helper: null,
    nextBossSpawnTime: C.BOSS_SPAWN_INTERVAL_MS
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [skillChoices, setSkillChoices] = useState<Skill[]>([]);

  const keysPressed = useRef<Record<string, boolean>>({});
  const mousePosition = useRef<Vector2D>({ x: C.GAME_WIDTH / 2, y: C.GAME_HEIGHT / 2 });
  const moveDirection = useRef(0);
  const shootVector = useRef({ x: 0, y: 0 });
  const lastShotTime = useRef(Date.now());
  const lastEnemySpawnTime = useRef(Date.now());
  const lastShieldRegenTime = useRef(Date.now());
  const lastHullRegenTime = useRef(Date.now());
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTime = useRef(Date.now());
  const bossSpawned = useRef(false);
  const pauseStartTime = useRef<number | null>(null);
  const lastTimeScalingApplied = useRef(0);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const difficultyModifiers = C.DIFFICULTY_SETTINGS[difficulty];

  const handleMoveStart = useCallback((direction: -1 | 1) => { moveDirection.current = direction; }, []);
  const handleMoveEnd = useCallback(() => { moveDirection.current = 0; }, []);
  const handleShootUpdate = useCallback((vector: { x: number; y: number }) => { shootVector.current = vector; }, []);
  const handleShootEnd = useCallback(() => { shootVector.current = { x: 0, y: 0 }; }, []);

  const handleSkillSelect = useCallback((skillId: SkillId) => {
    setGameState(prev => {
        let player = { ...prev.player, skills: {...prev.player.skills} };
        switch(skillId) {
            case 'damage': player.damage += C.DAMAGE_UPGRADE; break;
            case 'maxHealth':
                player.maxHull = Math.min(C.PLAYER_MAX_HULL_CAP, player.maxHull + C.MAX_HEALTH_UPGRADE);
                player.hull = Math.min(player.maxHull, player.hull + C.MAX_HEALTH_UPGRADE);
                break;
            case 'defense': player.defense = Math.min(0.75, player.defense + C.DEFENSE_UPGRADE); break;
            case 'agility': player.moveSpeed += C.AGILITY_UPGRADE; break;
            case 'fireRate': player.fireRate = Math.max(50, player.fireRate + C.FIRE_RATE_UPGRADE); break;
            case 'multishot': player.projectileCount = Math.min(5, player.projectileCount + C.MULTISHOT_UPGRADE); break;
            case 'regen': player.shieldRegen += C.REGEN_UPGRADE; break;
            case 'hullRegen': player.hullRegen += C.HULL_REGEN_UPGRADE; break;
        }
        player.skills[skillId]++;
        return { ...prev, player };
    });
    setIsLevelingUp(false);
  }, []);
  
  const handleActivateSpecial = useCallback((id: SpecialAbilityId) => {
    const now = Date.now();
    setGameState(prev => {
      const { player } = prev;
      const ability = player.specialAbilities[id];

      if (player.activeSpecial || now - ability.lastUsed < ability.cooldown) return prev;
      
      let nextState = {...prev};
      const newPlayerState = { ...player, specialAbilities: { ...player.specialAbilities, [id]: { ...ability, lastUsed: now } } };

      switch (id) {
        case 'bomb':
          let scoreToAdd = 0;
          let xpToAdd = 0;
          nextState.enemies.forEach(e => {
              if (e.type === 'normal') { scoreToAdd += C.ENEMY_NORMAL_SCORE; xpToAdd += C.ENEMY_NORMAL_SCORE; }
              else if (e.type === 'fast') { scoreToAdd += C.ENEMY_FAST_SCORE; xpToAdd += C.ENEMY_FAST_SCORE; }
              else { scoreToAdd += C.ENEMY_STRONG_SCORE; xpToAdd += C.ENEMY_STRONG_SCORE; }
              if (quality !== 'low') nextState.explosions.push({ id: `expl_${e.id}`, position: e.position, size: e.size, life: 0, maxLife: 20 });
          });
          if (nextState.boss) nextState.boss.health -= nextState.boss.maxHealth * 0.30;
          newPlayerState.xp += xpToAdd * difficultyModifiers.xp;
          nextState.score += scoreToAdd;
          nextState.enemies = [];
          nextState.enemyProjectiles = [];
          break;
        case 'powerShot': newPlayerState.activeSpecial = { id, until: now + C.POWER_SHOT_DURATION }; break;
        case 'helper':
          newPlayerState.activeSpecial = { id, until: now + C.HELPER_DURATION };
          nextState.helper = { id: `helper_${now}`, position: { x: player.position.x - C.HELPER_SIZE.width - 10, y: player.position.y }, size: C.HELPER_SIZE, life: now + C.HELPER_DURATION, lastShotTime: now, };
          break;
        case 'superShield': newPlayerState.activeSpecial = { id, until: now + C.SUPER_SHIELD_DURATION }; break;
      }
      nextState.player = newPlayerState;
      return nextState;
    });
  }, [quality, difficultyModifiers]);

  const checkCollision = (objA: GameObject, objB: GameObject) => (
      objA.position.x < objB.position.x + objB.size.width &&
      objA.position.x + objA.size.width > objB.position.x &&
      objA.position.y < objB.position.y + objB.size.height &&
      objA.position.y + objA.size.height > objB.position.y
  );

  const gameLoop = useCallback(() => {
    if (isLevelingUp) { gameLoopRef.current = requestAnimationFrame(gameLoop); return; }

    const now = Date.now();
    const deltaTime = now - lastFrameTime.current;
    lastFrameTime.current = now;

    setGameState(prev => {
      if (prev.player.hull <= 0) return prev;

      let { player, enemies, projectiles, enemyProjectiles, boss, explosions, score, phase, gameTime, maxEnemies, enemySpawnRateMultiplier, enemyFireRateMultiplier, helper, nextBossSpawnTime } = { ...prev };
      player = { ...player, position: { ...player.position } }; enemies = [...enemies]; projectiles = [...projectiles]; enemyProjectiles = [...enemyProjectiles]; explosions = [...explosions];
      boss = boss ? { ...boss, position: { ...boss.position }, velocity: {...boss.velocity} } : null; helper = helper ? { ...helper, position: { ...helper.position } } : null;

      let scoreToAdd = 0, xpToAdd = 0; gameTime += deltaTime;
      
      if (player.activeSpecial && now > player.activeSpecial.until) { if (player.activeSpecial.id === 'helper') helper = null; player.activeSpecial = null; }

      if (gameTime > lastTimeScalingApplied.current + C.TIME_SCALING_INTERVAL_MS) {
          lastTimeScalingApplied.current = gameTime;
          const scalingFactor = gameTime <= 60000 ? C.EARLY_GAME_SCALING_FACTOR : C.LATE_GAME_SCALING_FACTOR;
          enemySpawnRateMultiplier *= (1 - scalingFactor); enemyFireRateMultiplier *= (1 - scalingFactor);
      }

      const createExplosion = (position: Vector2D, size: {width: number, height: number}) => { if (quality !== 'low') explosions.push({ id: `expl_${Date.now()}_${Math.random()}`, position: { x: position.x + size.width / 2, y: position.y + size.height / 2 }, size, life: 0, maxLife: 20 }); };

      if (controlMode === 'keyboard') {
        let newX = player.position.x;
        if (keysPressed.current['a'] || keysPressed.current['A']) newX -= player.moveSpeed;
        if (keysPressed.current['d'] || keysPressed.current['D']) newX += player.moveSpeed;
        player.position.x = Math.max(0, Math.min(C.GAME_WIDTH - player.size.width, newX));
      } else {
        let newX = player.position.x + moveDirection.current * player.moveSpeed;
        player.position.x = Math.max(0, Math.min(C.GAME_WIDTH - player.size.width, newX));
      }

      const isPowerShotActive = player.activeSpecial?.id === 'powerShot';
      const shouldShoot = controlMode === 'touch' ? (Math.abs(shootVector.current.x) > 0.1 || Math.abs(shootVector.current.y) > 0.1) : true;
      if (shouldShoot && now - lastShotTime.current > player.fireRate) {
        lastShotTime.current = now;
        const p_center_x = player.position.x + C.PLAYER_SIZE.width / 2;
        const baseAngle = controlMode === 'touch' ? Math.atan2(shootVector.current.y, shootVector.current.x) : Math.atan2(mousePosition.current.y - player.position.y, mousePosition.current.x - p_center_x);
        const count = isPowerShotActive ? player.projectileCount * 2 : player.projectileCount;
        const totalSpread = (count - 1) * C.PROJECTILE_SPREAD_ANGLE;
        const startAngle = baseAngle - totalSpread / 2;
        for(let i=0; i < count; i++) {
            const angle = count > 1 ? startAngle + i * C.PROJECTILE_SPREAD_ANGLE : baseAngle;
            projectiles.push({ id: `proj_${now}_${i}`, position: { x: p_center_x - C.PROJECTILE_SIZE.width / 2, y: player.position.y }, size: C.PROJECTILE_SIZE, velocity: { x: Math.cos(angle) * C.PROJECTILE_SPEED, y: Math.sin(angle) * C.PROJECTILE_SPEED }, scale: isPowerShotActive ? C.POWER_SHOT_PROJECTILE_SCALE : 1 });
        }
      }

      projectiles = projectiles.map(p => ({ ...p, position: { x: p.position.x + p.velocity.x, y: p.position.y + p.velocity.y } })).filter(p => p.position.y > -p.size.height && p.position.y < C.GAME_HEIGHT && p.position.x > -p.size.width && p.position.x < C.GAME_WIDTH);
      enemyProjectiles = enemyProjectiles.map(p => ({ ...p, position: { x: p.position.x + p.velocity.x, y: p.position.y + p.velocity.y } })).filter(p => p.position.y > -p.size.height && p.position.y < C.GAME_HEIGHT && p.position.x > -p.size.width && p.position.x < C.GAME_WIDTH);
      
      const phaseDamageMultiplier = 1 + (phase - 1) * C.ENEMY_DAMAGE_INCREASE_PER_PHASE, phaseSpeedMultiplier = Math.pow(C.PHASE_ENEMY_SPEED_MULTIPLIER, phase - 1), phaseFireRateMultiplier = Math.pow(C.PHASE_ENEMY_FIRE_RATE_MULTIPLIER, phase - 1);

      if (!boss && enemies.length < maxEnemies && now - lastEnemySpawnTime.current > C.INITIAL_ENEMY_SPAWN_RATE_MS * enemySpawnRateMultiplier * difficultyModifiers.spawnRate) {
        lastEnemySpawnTime.current = now; const r = Math.random(); let newEnemy: Enemy;
        const commonProps = { contactDamage: C.ENEMY_CONTACT_DAMAGE, lastShotTime: now, velocity: { x: 0, y: 0 }, position: { x: 0, y: 0 }, };
        if (r > 0.85) { const health = (C.ENEMY_STRONG_HEALTH + (phase - 1) * C.PHASE_ENEMY_HEALTH_INCREASE_ELITE) * difficultyModifiers.health; const speed = C.ENEMY_STRONG_SPEED * phaseSpeedMultiplier; newEnemy = { ...commonProps, id: `enemy_${now}`, type: 'strong', size: C.ENEMY_STRONG_SIZE, health, velocity: { x: 0, y: speed }, position: { x: Math.random() * (C.GAME_WIDTH - C.ENEMY_STRONG_SIZE.width), y: -C.ENEMY_STRONG_SIZE.height }, projectileDamage: C.ENEMY_STRONG_PROJECTILE_DAMAGE * phaseDamageMultiplier }; } 
        else if (r > 0.6) { const health = (C.ENEMY_FAST_HEALTH + (phase - 1) * C.PHASE_ENEMY_HEALTH_INCREASE_ELITE) * difficultyModifiers.health; const speed = C.ENEMY_FAST_SPEED * phaseSpeedMultiplier; newEnemy = { ...commonProps, id: `enemy_${now}`, type: 'fast', size: C.ENEMY_FAST_SIZE, health, velocity: { x: 0, y: speed }, position: { x: Math.random() * (C.GAME_WIDTH - C.ENEMY_FAST_SIZE.width), y: -C.ENEMY_FAST_SIZE.height }, projectileDamage: C.ENEMY_FAST_PROJECTILE_DAMAGE * phaseDamageMultiplier }; }
        else { const health = (C.ENEMY_NORMAL_HEALTH + (phase - 1) * C.PHASE_ENEMY_HEALTH_INCREASE_NORMAL) * difficultyModifiers.health; const speed = C.ENEMY_NORMAL_SPEED * phaseSpeedMultiplier; newEnemy = { ...commonProps, id: `enemy_${now}`, type: 'normal', size: C.ENEMY_NORMAL_SIZE, health, velocity: { x: 0, y: speed }, position: { x: Math.random() * (C.GAME_WIDTH - C.ENEMY_NORMAL_SIZE.width), y: -C.ENEMY_NORMAL_SIZE.height }, projectileDamage: C.ENEMY_NORMAL_PROJECTILE_DAMAGE * phaseDamageMultiplier }; }
        enemies.push(newEnemy);
      }
      
      enemies.forEach(e => {
          e.position.y += e.velocity.y; const baseFireRate = e.type === 'fast' ? C.ENEMY_FAST_FIRE_RATE : e.type === 'strong' ? C.ENEMY_STRONG_FIRE_RATE : C.ENEMY_NORMAL_FIRE_RATE;
          const currentFireRate = baseFireRate * enemyFireRateMultiplier * phaseFireRateMultiplier;
          if (now - e.lastShotTime > currentFireRate) { e.lastShotTime = now; const angle = Math.atan2(player.position.y - e.position.y, player.position.x - e.position.x); enemyProjectiles.push({ id: `eproj_${e.id}_${now}`, position: { x: e.position.x + e.size.width / 2 - C.ENEMY_PROJECTILE_SIZE.width / 2, y: e.position.y + e.size.height }, size: C.ENEMY_PROJECTILE_SIZE, velocity: { x: Math.cos(angle) * C.ENEMY_PROJECTILE_SPEED, y: Math.sin(angle) * C.ENEMY_PROJECTILE_SPEED }, damage: e.projectileDamage, }); }
      });
      enemies = enemies.filter(e => e.position.y < C.GAME_HEIGHT);

      if (helper) {
        helper.position = { x: player.position.x - C.HELPER_SIZE.width - 10, y: player.position.y };
        if (now - helper.lastShotTime > C.HELPER_FIRE_RATE) {
          helper.lastShotTime = now; if (enemies.length > 0 || boss) { const target = boss || enemies[0]; const angle = Math.atan2(target.position.y - helper.position.y, target.position.x - helper.position.x); projectiles.push({ id: `hproj_${now}`, position: { x: helper.position.x + C.HELPER_SIZE.width / 2, y: helper.position.y }, size: C.PROJECTILE_SIZE, velocity: { x: Math.cos(angle) * C.PROJECTILE_SPEED, y: Math.sin(angle) * C.PROJECTILE_SPEED }, scale: 1.2 }); }
        }
        if (now > helper.life) helper = null;
      }

      const currentDamage = player.damage * (isPowerShotActive ? C.POWER_SHOT_DAMAGE_MULTIPLIER : 1), helperDamage = player.damage * C.HELPER_DAMAGE_MULTIPLIER;
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i]; const pDamage = p.id.startsWith('hproj') ? helperDamage : currentDamage; let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (checkCollision(p, e)) {
            e.health -= pDamage;
            if (e.health <= 0) {
              if (e.type === 'normal') { scoreToAdd += C.ENEMY_NORMAL_SCORE; xpToAdd += C.ENEMY_NORMAL_SCORE; } else if (e.type === 'fast') { scoreToAdd += C.ENEMY_FAST_SCORE; xpToAdd += C.ENEMY_FAST_SCORE; } else { scoreToAdd += C.ENEMY_STRONG_SCORE; xpToAdd += C.ENEMY_STRONG_SCORE; }
              createExplosion(e.position, e.size); enemies.splice(j, 1);
            }
            hit = true; break;
          }
        }
        if (hit) { projectiles.splice(i, 1); continue; }
        if (boss && checkCollision(p, boss)) {
          boss.health -= pDamage; createExplosion({x:p.position.x, y:p.position.y}, {width: 20, height: 20});
          if (boss.health <= 0) { scoreToAdd += C.BOSS_SCORE_REWARD; xpToAdd += C.BOSS_SCORE_REWARD; createExplosion(boss.position, boss.size); boss = null; bossSpawned.current = false; phase++; maxEnemies *= C.PHASE_MAX_ENEMIES_MULTIPLIER; if (phase >= 10) nextBossSpawnTime = gameTime + C.BOSS_SPAWN_INTERVAL_MS; }
          projectiles.splice(i, 1);
        }
      }

      const applyDamage = (damage: number) => { if (player.activeSpecial?.id === 'superShield') return; const shieldDamage = Math.min(player.shield, damage); player.shield -= shieldDamage; const remainingDamage = damage - shieldDamage; if (remainingDamage > 0) player.hull -= remainingDamage; };
      const damageReduction = 1 - player.defense, finalDamageMultiplier = difficultyModifiers.damage;
      for (let i = enemies.length - 1; i >= 0; i--) { const enemy = enemies[i]; if (checkCollision(player, enemy)) { applyDamage(enemy.contactDamage * damageReduction * finalDamageMultiplier); createExplosion(enemy.position, enemy.size); enemies.splice(i, 1); } }
      if (boss && checkCollision(player, boss)) { applyDamage(boss.contactDamage * damageReduction * finalDamageMultiplier); createExplosion(player.position, player.size); }
      for (let i = enemyProjectiles.length-1; i>=0; i--) { const p = enemyProjectiles[i]; if (checkCollision(player, p)) { applyDamage(p.damage * damageReduction * finalDamageMultiplier); createExplosion(p.position, p.size); enemyProjectiles.splice(i, 1); } }
      
      if (boss) {
        boss.position.x += boss.velocity.x; if (boss.position.x <= 0 || boss.position.x >= C.GAME_WIDTH - boss.size.width) boss.velocity.x *= -1;
        if (now - boss.lastShotTime > C.BOSS_FIRE_RATE) { boss.lastShotTime = now; const angle = Math.atan2(player.position.y - boss.position.y, player.position.x - boss.position.x); const angles = [angle - 0.2, angle, angle + 0.2]; angles.forEach(a => { enemyProjectiles.push({ id: `eproj_boss_${now}_${a}`, position: { x: boss.position.x + boss.size.width / 2 - C.ENEMY_PROJECTILE_SIZE.width / 2, y: boss.position.y + boss.size.height }, size: C.ENEMY_PROJECTILE_SIZE, velocity: { x: Math.cos(a) * C.ENEMY_PROJECTILE_SPEED * 1.5, y: Math.sin(a) * C.ENEMY_PROJECTILE_SPEED * 1.5 }, damage: boss.projectileDamage, }); }); }
      }

      if (player.shieldRegen > 0 && now - lastShieldRegenTime.current > 1000) { player.shield = Math.min(player.maxShield, player.shield + player.shieldRegen * ((now - lastShieldRegenTime.current)/1000)); lastShieldRegenTime.current = now; }
      if (player.hullRegen > 0 && now - lastHullRegenTime.current > 1000) { player.hull = Math.min(player.maxHull, player.hull + player.hullRegen * ((now - lastHullRegenTime.current)/1000)); lastHullRegenTime.current = now; }
      
      if (xpToAdd > 0) {
        player.xp += xpToAdd * difficultyModifiers.xp;
        if (player.xp >= player.xpToNextLevel) {
          player.level++; player.xp -= player.xpToNextLevel; player.xpToNextLevel = C.LEVEL_UP_BASE_XP * player.level;
          const availableSkills = (Object.keys(SKILLS_CONFIG) as SkillId[]).filter(id => { const config = SKILLS_CONFIG[id]; return config.maxLevel === undefined || player.skills[id] < config.maxLevel; });
          for (let i = availableSkills.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [availableSkills[i], availableSkills[j]] = [availableSkills[j], availableSkills[i]]; }
          const choices = availableSkills.slice(0, 3).map(skillId => { const config = SKILLS_CONFIG[skillId]; const currentLevel = player.skills[skillId]; return { id: skillId, name: config.name, description: config.getDescription(currentLevel + 1), level: currentLevel + 1, maxLevel: config.maxLevel }; });
          setSkillChoices(choices); setIsLevelingUp(true);
        }
      }
      
      const timeToSpawnBoss = gameTime >= nextBossSpawnTime;
      if (timeToSpawnBoss && !boss && !bossSpawned.current) {
        const bossHealthMultiplier = Math.pow(2, Math.min(phase - 1, 8)), bossHealth = C.BOSS_INITIAL_HEALTH * bossHealthMultiplier * difficultyModifiers.health;
        const bossDamageMultiplier = 1 + Math.min(C.BOSS_MAX_DAMAGE_INCREASE, (phase - 1) * C.BOSS_DAMAGE_INCREASE_PER_PHASE);
        boss = { id: 'boss_1', position: { x: C.GAME_WIDTH / 2 - C.BOSS_SIZE.width / 2, y: 50 }, size: C.BOSS_SIZE, health: bossHealth, maxHealth: bossHealth, velocity: { x: C.BOSS_SPEED, y: 0.5 }, contactDamage: C.BOSS_CONTACT_DAMAGE, projectileDamage: C.BOSS_PROJECTILE_DAMAGE * bossDamageMultiplier, lastShotTime: now, };
        bossSpawned.current = true; if (phase < 10) nextBossSpawnTime += C.BOSS_SPAWN_INTERVAL_MS;
      }

      explosions = explosions.map(ex => ({ ...ex, life: ex.life + 1 })).filter(ex => ex.life < ex.maxLife);
      if (player.hull <= 0) onGameOverRef.current({ score: score + scoreToAdd, phase, gameTime });

      return { ...prev, player, enemies, projectiles, enemyProjectiles, boss, explosions, score: score + scoreToAdd, phase, gameTime, maxEnemies, enemySpawnRateMultiplier, enemyFireRateMultiplier, helper, nextBossSpawnTime };
    });
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isLevelingUp, difficulty, quality, SKILLS_CONFIG, controlMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLevelingUp) { e.preventDefault(); setIsPaused(p => !p); } 
        else if (e.key === '1') handleActivateSpecial('bomb'); else if (e.key === '2') handleActivateSpecial('powerShot');
        else if (e.key === '3') handleActivateSpecial('helper'); else if (e.key === '4') handleActivateSpecial('superShield');
        else if(controlMode === 'keyboard') keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => { if(controlMode === 'keyboard') keysPressed.current[e.key] = false; };
    const handleBlur = () => !isLevelingUp && setIsPaused(true);
    
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    
    const handleMouseMove = (e: MouseEvent) => {
        if (controlMode !== 'keyboard') return;
        const rect = gameArea.getBoundingClientRect();
        // Scale mouse position based on the game area's actual size vs its logical size
        const scaleX = C.GAME_WIDTH / rect.width;
        const scaleY = C.GAME_HEIGHT / rect.height;
        mousePosition.current = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    };
    
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur); 
    gameArea.addEventListener('mousemove', handleMouseMove);

    if (isPaused || isLevelingUp) {
        if (gameLoopRef.current) { cancelAnimationFrame(gameLoopRef.current); gameLoopRef.current = null; }
        if (pauseStartTime.current === null) pauseStartTime.current = Date.now();
    } else {
        lastFrameTime.current = Date.now();
        if (pauseStartTime.current !== null) {
            const pauseDuration = Date.now() - pauseStartTime.current; lastShotTime.current += pauseDuration; lastEnemySpawnTime.current += pauseDuration; lastShieldRegenTime.current += pauseDuration; lastHullRegenTime.current += pauseDuration;
            setGameState(g => ({ ...g, enemies: g.enemies.map(e => ({...e, lastShotTime: e.lastShotTime + pauseDuration})), boss: g.boss ? {...g.boss, lastShotTime: g.boss.lastShotTime + pauseDuration} : null, helper: g.helper ? {...g.helper, lastShotTime: g.helper.lastShotTime + pauseDuration, life: g.helper.life + pauseDuration} : null, player: {...g.player, specialAbilities: {...g.player.specialAbilities, bomb: {...g.player.specialAbilities.bomb, lastUsed: g.player.specialAbilities.bomb.lastUsed+pauseDuration}, powerShot: {...g.player.specialAbilities.powerShot, lastUsed: g.player.specialAbilities.powerShot.lastUsed+pauseDuration}, helper: {...g.player.specialAbilities.helper, lastUsed: g.player.specialAbilities.helper.lastUsed+pauseDuration}, superShield: {...g.player.specialAbilities.superShield, lastUsed: g.player.specialAbilities.superShield.lastUsed+pauseDuration}}, activeSpecial: g.player.activeSpecial ? {...g.player.activeSpecial, until: g.player.activeSpecial.until + pauseDuration} : null }, nextBossSpawnTime: g.nextBossSpawnTime + pauseDuration }));
            pauseStartTime.current = null;
        }
        if (gameLoopRef.current === null) gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur); 
      gameArea.removeEventListener('mousemove', handleMouseMove);
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop, isPaused, isLevelingUp, handleActivateSpecial, controlMode]);

  const { player, enemies, projectiles, enemyProjectiles, boss, explosions, score, gameTime, helper, phase } = gameState;
  const gameViewBox = `0 0 ${C.GAME_WIDTH} ${C.GAME_HEIGHT}`;

  return (
    <div
      id="game-area-wrapper"
      className="w-full h-full flex items-center justify-center"
    >
      <div 
        id="game-area" 
        ref={gameAreaRef} 
        className="relative bg-black border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.5)] cursor-crosshair overflow-hidden w-auto h-full max-w-full aspect-[4/5]"
      >
        {/* SVG for background effects only */}
        <svg viewBox={gameViewBox} className="absolute inset-0 w-full h-full pointer-events-none">
          {quality !== 'low' && <rect width={C.GAME_WIDTH} height={C.GAME_HEIGHT} fill="url(#grid-pattern)" mask="url(#vignette-mask)" />}
          <defs>
            <pattern id="grid-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#0e7490" />
            </pattern>
            <mask id="vignette-mask">
              <rect width={C.GAME_WIDTH} height={C.GAME_HEIGHT} fill="white" />
              <radialGradient id="vignette-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="70%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <rect x="0" y="0" width={C.GAME_WIDTH} height={C.GAME_HEIGHT} fill="url(#vignette-gradient)" />
            </mask>
          </defs>
        </svg>

        {/* Game object renders (HTML divs) go here, as siblings to the SVG */}
        {player.hull > 0 && <PlayerShip player={player} quality={quality} />}
        {helper && <HelperShip helper={helper} quality={quality} />}
        {enemies.map(enemy => <EnemyShip key={enemy.id} enemy={enemy} />)}
        {boss && <BossShip boss={boss} quality={quality} />}
        {projectiles.map(p => <ProjectileVisual key={p.id} projectile={p} quality={quality} />)}
        {enemyProjectiles.map(p => <ProjectileVisual key={p.id} projectile={p} quality={quality} colorClass="bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.9)]" />)}
        {explosions.map(e => <ExplosionVisual key={e.id} explosion={e} quality={quality} />)}

        {/* UI overlays also go here */}
        <HUD 
          player={player}
          score={score}
          bossHealth={boss ? boss.health : null} 
          maxBossHealth={boss ? boss.maxHealth : null} 
          onPauseClick={() => setIsPaused(true)} 
          gameTime={gameTime}
          phase={phase}
          onActivateSpecial={handleActivateSpecial}
          quality={quality}
        />
        
        {player.hull > 0 && <SkillsDisplay player={player} quality={quality} />}

        {isPaused && <PauseMenu onContinue={() => setIsPaused(false)} onRestart={onRestart} onGoHome={onGoHome} />}
        {isLevelingUp && <LevelUpScreen skills={skillChoices} onSelect={handleSkillSelect} />}
        
        {controlMode === 'touch' && (
          <>
            <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-50">
              <MovementArrows onMoveStart={handleMoveStart} onMoveEnd={handleMoveEnd} />
            </div>
            <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 z-50">
              <Joystick onMove={handleShootUpdate} onEnd={handleShootEnd} size={window.innerWidth < 768 ? 100 : 120} handleSize={window.innerWidth < 768 ? 45 : 50} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Game;