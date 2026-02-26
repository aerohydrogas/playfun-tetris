import Phaser from 'phaser';
import { GAME, COLORS, UI, TRANSITION, SAFE_ZONE } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    // Simple solid background to prevent rendering issues
    this.cameras.main.setBackgroundColor(COLORS.BG_BOTTOM);

    const w = GAME.WIDTH;
    const h = GAME.HEIGHT;
    const cx = w / 2;

    const titleSize = Math.round(h * UI.TITLE_RATIO);
    this.add.text(cx, h * 0.3, 'GAME OVER', {
      fontSize: `${titleSize}px`,
      fontFamily: UI.FONT,
      color: COLORS.UI_TEXT,
    }).setOrigin(0.5);

    const scoreSize = Math.round(h * UI.HEADING_RATIO);
    this.add.text(cx, h * 0.5, `Score: ${gameState.score}`, {
      fontSize: `${scoreSize}px`,
      fontFamily: UI.FONT,
      color: COLORS.SCORE_GOLD,
    }).setOrigin(0.5);

    const restartSize = Math.round(h * UI.BODY_RATIO);
    const restartText = this.add.text(cx, h * 0.7, 'Press SPACE to Play Again', {
      fontSize: `${restartSize}px`,
      fontFamily: UI.FONT,
      color: COLORS.UI_TEXT,
    }).setOrigin(0.5);
    
    // Blinking effect for restart text
    this.tweens.add({
        targets: restartText,
        alpha: 0.2,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });

    this.input.keyboard.once('keydown-SPACE', () => this.restartGame());
    this.input.once('pointerdown', () => this.restartGame());

    this.cameras.main.fadeIn(TRANSITION.DURATION);
  }

  restartGame() {
    this.cameras.main.fadeOut(TRANSITION.DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }
}
