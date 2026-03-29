// src/engine/constants.ts

export const CHAR = {
  EMPTY: ' ',
  WALL: '#',
  TARGET: '.',
  BOX: '$',
  PLAYER: '@',
  BOX_ON_TARGET: '*',
  PLAYER_ON_TARGET: '+',
} as const;

export const RENDER_CONFIG = {
  tileSize: 30,
  wallColor: '#4a4a6a',
  floorColor: '#2a2a4a',
  playerColor: '#4fc3f7',
  boxColor: '#ff8a65',
  targetColor: '#81c784',
  boxOnTargetColor: '#66bb6a',
  playerOnTargetColor: '#29b6f6',
};

export const LEVEL_SIZE = {
  width: 16,
  height: 16,
};

export const TOTAL_LEVELS = 18;
