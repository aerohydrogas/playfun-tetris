import Phaser from 'phaser';
import { TetrisLogic } from '../core/TetrisLogic';
import { COLORS, GAME, UI, SAFE_ZONE } from '../core/Constants';
import { audioManager } from '../audio/AudioManager';
import { gameState } from '../core/GameState';
import { eventBus, Events } from '../core/EventBus';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        gameState.reset();
        gameState.started = true;
        
        // Calculate adaptive block size
        // We want grid to take up ~80-90% of width
        // and fit vertically within safe area
        const maxW = GAME.WIDTH * 0.9;
        const maxH = GAME.HEIGHT - SAFE_ZONE.TOP - 100; // Leave space at bottom
        
        this.cols = 10;
        this.rows = 20;
        
        this.blockSize = Math.floor(Math.min(maxW / this.cols, maxH / this.rows));
        
        // Center the board
        this.startX = (GAME.WIDTH - (this.cols * this.blockSize)) / 2;
        this.startY = SAFE_ZONE.TOP + (maxH - (this.rows * this.blockSize)) / 2;
        
        this.logic = new TetrisLogic(this.cols, this.rows);
        this.dropTimer = 0;
        this.moveTimer = 0;
        
        this.graphics = this.add.graphics();
        
        // Initialize Audio
        audioManager.init().catch(console.error);
        
        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.input.keyboard.on('keydown-LEFT', () => this.move(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.move(1));
        this.input.keyboard.on('keydown-UP', () => this.rotate());
        this.input.keyboard.on('keydown-SPACE', () => this.rotate());
        this.input.keyboard.on('keydown-DOWN', () => this.softDrop());
        
        // Touch controls
        this.createTouchControls();

        // UI Text
        const uiX = this.startX + (this.cols * this.blockSize) + 20;
        const style = { fontSize: Math.floor(GAME.HEIGHT * 0.03) + 'px', fill: '#fff', fontFamily: UI.FONT };
        
        // Score (top left or above board)
        this.scoreText = this.add.text(GAME.WIDTH / 2, SAFE_ZONE.TOP - 40, '0', {
            fontSize: Math.floor(GAME.HEIGHT * 0.05) + 'px',
            fill: COLORS.SCORE_GOLD,
            fontFamily: UI.FONT,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(GAME.WIDTH / 2, SAFE_ZONE.TOP - 10, 'LVL 1', {
            fontSize: Math.floor(GAME.HEIGHT * 0.02) + 'px',
            fill: COLORS.MUTED_TEXT,
            fontFamily: UI.FONT
        }).setOrigin(0.5);

        eventBus.emit(Events.GAME_START);
    }

    move(dir) {
        if (this.logic.move(dir)) {
            audioManager.playSFX('move');
            this.render();
        }
    }

    rotate() {
        this.logic.rotate();
        audioManager.playSFX('rotate');
        this.render();
    }
    
    softDrop() {
        if (!this.logic.drop()) { // Not locked
            gameState.score += 1; // 1 point per soft drop cell
            this.dropTimer = 0;
            this.render();
        } else {
            // Locked
            this.handleLock();
        }
    }

    update(time, delta) {
        if (!gameState.started || this.logic.gameOver) {
            if (this.logic.gameOver && gameState.started) this.gameOver();
            return;
        }

        // Auto drop
        this.dropTimer += delta;
        // Speed formula: (0.8-((Level-1)*0.007))^(Level-1) seconds per line? 
        // Simple: 1000ms - (level-1)*100, min 100ms
        const speed = Math.max(100, 1000 - (this.logic.level - 1) * 100);
        
        if (this.dropTimer > speed) {
            if (this.logic.drop()) {
                this.handleLock();
            }
            this.dropTimer = 0;
            this.render();
        }
        
        // Continuous movement handling could go here (DAS)
    }

    handleLock() {
        audioManager.playSFX('lock');
        
        // Check lines
        if (this.logic.lines > 0) { // Logic handles line clear internally but we need to know if score changed
             // We can compare snapshot or just check logic state
        }
        
        // Sync score
        if (this.logic.score > gameState.score) {
            const diff = this.logic.score - gameState.score;
            gameState.score = this.logic.score;
            if (gameState.score > gameState.bestScore) gameState.bestScore = gameState.score;
            
            // Emit Play.fun event
            eventBus.emit(Events.SCORE_CHANGED, { score: gameState.score, delta: diff });
            
            audioManager.playSFX('clear');
            this.cameras.main.shake(100, 0.005); // Juice
        }
        
        if (this.logic.gameOver) {
            this.gameOver();
        }
        
        this.render();
        
        // Update UI
        this.scoreText.setText(`${gameState.score}`);
        this.levelText.setText(`LVL ${this.logic.level}`);
    }

    gameOver() {
        gameState.gameOver = true;
        gameState.started = false;
        audioManager.playSFX('gameover');
        
        eventBus.emit(Events.GAME_OVER, { score: gameState.score });
        
        this.scene.start('GameOverScene');
    }
    
    createTouchControls() {
        // Simple touch zones
        const w = GAME.WIDTH;
        const h = GAME.HEIGHT;
        const btnH = h * 0.15;
        
        // Left / Right (Bottom corners)
        const leftZone = this.add.zone(0, h - btnH, w/2, btnH).setOrigin(0).setInteractive();
        const rightZone = this.add.zone(w/2, h - btnH, w/2, btnH).setOrigin(0).setInteractive();
        
        // Rotate (Tap center)
        const centerZone = this.add.zone(0, h/2, w, h/2 - btnH).setOrigin(0).setInteractive();
        
        leftZone.on('pointerdown', () => this.move(-1));
        rightZone.on('pointerdown', () => this.move(1));
        centerZone.on('pointerdown', () => this.rotate());
        
        // Visual hints
        this.add.text(w*0.25, h - btnH/2, '←', { fontSize: '40px' }).setOrigin(0.5).setAlpha(0.5);
        this.add.text(w*0.75, h - btnH/2, '→', { fontSize: '40px' }).setOrigin(0.5).setAlpha(0.5);
        this.add.text(w/2, h*0.75, 'TAP TO ROTATE', { fontSize: '20px' }).setOrigin(0.5).setAlpha(0.3);
    }

    render() {
        this.graphics.clear();
        
        // Draw Board Background
        this.graphics.fillStyle(0x111111);
        this.graphics.fillRect(this.startX, this.startY, this.cols * this.blockSize, this.rows * this.blockSize);
        
        // Draw Grid Lines (faint)
        this.graphics.lineStyle(1, 0x333333, 0.3);
        for (let x = 0; x <= this.cols; x++) {
            this.graphics.moveTo(this.startX + x * this.blockSize, this.startY);
            this.graphics.lineTo(this.startX + x * this.blockSize, this.startY + this.rows * this.blockSize);
        }
        for (let y = 0; y <= this.rows; y++) {
            this.graphics.moveTo(this.startX, this.startY + y * this.blockSize);
            this.graphics.lineTo(this.startX + this.cols * this.blockSize, this.startY + y * this.blockSize);
        }
        this.graphics.strokePath();

        // Draw Locked Blocks
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.logic.grid[y][x]) {
                    this.drawBlock(x, y, this.logic.grid[y][x]);
                }
            }
        }

        // Draw Ghost Piece
        if (this.logic.currentPiece) {
            const ghostY = this.logic.getGhostY();
            this.drawPiece(this.logic.currentPiece.shape, this.logic.currentPiece.x, ghostY, this.logic.currentPiece.color, 0.2);

            // Draw Current Piece
            this.drawPiece(this.logic.currentPiece.shape, this.logic.currentPiece.x, this.logic.currentPiece.y, this.logic.currentPiece.color);
        }
    }

    drawPiece(shape, offsetX, offsetY, color, alpha = 1) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    this.drawBlock(offsetX + x, offsetY + y, color, alpha);
                }
            }
        }
    }

    drawBlock(x, y, color, alpha = 1) {
        const px = this.startX + x * this.blockSize;
        const py = this.startY + y * this.blockSize;
        
        // Neon Glow
        this.graphics.fillStyle(color, alpha);
        this.graphics.fillRect(px + 1, py + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Bright center
        this.graphics.fillStyle(0xffffff, 0.4 * alpha);
        this.graphics.fillRect(px + this.blockSize*0.2, py + this.blockSize*0.2, this.blockSize*0.6, this.blockSize*0.6);
        
        // Border glow
        this.graphics.lineStyle(2, color, 0.8 * alpha);
        this.graphics.strokeRect(px, py, this.blockSize, this.blockSize);
    }
}
