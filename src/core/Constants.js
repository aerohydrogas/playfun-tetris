export const DPR = 1;
export const FORCE_PORTRAIT = true;

// Logical design resolution
export const DESIGN_WIDTH = 800;
export const DESIGN_HEIGHT = 1200;

export const GAME = {
  WIDTH: DESIGN_WIDTH,
  HEIGHT: DESIGN_HEIGHT,
  IS_PORTRAIT: true,
};

// Safe Zone for Play.fun widget
export const SAFE_ZONE = {
  TOP: 100,
};

export const TRANSITION = {
  DURATION: 500
};

export const UI = {
  FONT: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  TITLE_RATIO: 0.08,
  HEADING_RATIO: 0.05,
  BODY_RATIO: 0.035,
  SMALL_RATIO: 0.025,
  BTN_W_RATIO: 0.45,
  BTN_H_RATIO: 0.075,
  BTN_RADIUS: 12,
  MIN_TOUCH: 44,
};

export const COLORS = {
  SKY: 0x050510, // Very dark blue/black
  UI_TEXT: '#ffffff',
  UI_SHADOW: '#000000',
  MUTED_TEXT: '#8888aa',
  SCORE_GOLD: '#ffd700',

  // Menu / GameOver gradient backgrounds (Cyberpunk style)
  BG_TOP: 0x0f0c29,
  BG_BOTTOM: 0x302b63, 

  // Buttons
  BTN_PRIMARY: 0x6c63ff,
  BTN_PRIMARY_HOVER: 0x857dff,
  BTN_PRIMARY_PRESS: 0x5a52d5,
  BTN_TEXT: '#ffffff',
};
