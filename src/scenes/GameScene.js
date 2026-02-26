import Phaser from 'phaser';
import { TetrisLogic } from '../core/TetrisLogic';
import { COLORS } from '../sprites/blocks';
import { initPlayFun, reportScore } from '../playfun';
import { AudioManager } from '../audio/AudioManager';
import { gameState } from '../core/GameState';
import { GAME } from '../core/Constants';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        
        // Calculate centered position
        this.startX = (GAME.WIDTH - (this.cols * this.blockSize)) / 2;
        this.startY = (GAME.HEIGHT - (this.rows * this.blockSize)) / 2;
        
        this.logic = null;
        this.dropTimer = 0;
        
        this.graphics = null;
        this.scoreText = null;
        this.levelText = null;
        this.audioManager = null;
    }

    create() {
        gameState.reset();
        gameState.started = true;
        
        this.logic = new TetrisLogic(this.cols, this.rows);
        
        // Setup graphics
        this.graphics = this.add.graphics();
        
        // Setup inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Audio
        this.audioManager = new AudioManager();
        // Start music on first interaction to comply with browser autoplay policies
        this.input.keyboard.once('keydown', () => {
             this.audioManager.startMusic();
        });
        
        // Input handlers
        this.input.keyboard.on('keydown-LEFT', () => {
            if (this.logic.move(-1)) this.audioManager.playSFX('move');
        });
        
        this.input.keyboard.on('keydown-RIGHT', () => {
            if (this.logic.move(1)) this.audioManager.playSFX('move');
        });
        
        this.input.keyboard.on('keydown-UP', () => {
            this.logic.rotate();
            this.audioManager.playSFX('rotate');
        });
        
        this.input.keyboard.on('keydown-SPACE', () => {
            this.logic.rotate();
            this.audioManager.playSFX('rotate');
        });
        
        this.input.keyboard.on('keydown-DOWN', () => {
            this.logic.drop();
            this.audioManager.playSFX('drop');
            this.dropTimer = 0;
        });

        // UI
        const uiX = this.startX + (this.cols * this.blockSize) + 50;
        this.scoreText = this.add.text(uiX, this.startY, 'Score: 0', { fontSize: '24px', fill: '#fff', fontFamily: 'Courier' });
        this.levelText = this.add.text(uiX, this.startY + 40, 'Level: 1', { fontSize: '24px', fill: '#fff', fontFamily: 'Courier' });
        
        // Init Play.fun
        initPlayFun();
        
        // Cleanup on shutdown
        this.events.on('shutdown', () => {
            if (this.audioManager) {
                this.audioManager.stopMusic();
                this.audioManager = null;
            }
        });
    }

    update(time, delta) {
        if (!gameState.started) return;

        if (this.logic.gameOver) {
            this.gameOver();
            return;
        }

        this.dropTimer += delta;
        const currentSpeed = Math.max(100, 1000 - (this.logic.level - 1) * 100);
        
        if (this.dropTimer > currentSpeed) {
            const locked = this.logic.drop();
            if (locked) {
                this.audioManager.playSFX('drop');
            }
            this.dropTimer = 0;
        }
        
        // Sync score
        if (this.logic.score !== gameState.score) {
            // If score increased, assume lines cleared
            if (this.logic.score > gameState.score) {
                this.audioManager.playSFX('clear');
            }
            gameState.score = this.logic.score;
            if (gameState.score > gameState.bestScore) gameState.bestScore = gameState.score;
        }

        this.render();
    }

    gameOver() {
        gameState.gameOver = true;
        gameState.started = false;
        if (this.audioManager) {
            this.audioManager.playSFX('gameover');
            this.audioManager.stopMusic();
        }
        
        reportScore(gameState.score);
        
        this.scene.start('GameOverScene');
    }

    render() {
        this.graphics.clear();
        
        // Draw Board Background
        this.graphics.fillStyle(0x050505);
        this.graphics.fillRect(this.startX, this.startY, this.cols * this.blockSize, this.rows * this.blockSize);
        
        // Draw Grid Lines
        this.graphics.lineStyle(1, 0x222222);
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
        const ghostY = this.logic.getGhostY();
        this.drawPiece(this.logic.currentPiece.shape, this.logic.currentPiece.x, ghostY, COLORS.GHOST, 0.2);

        // Draw Current Piece
        this.drawPiece(this.logic.currentPiece.shape, this.logic.currentPiece.x, this.logic.currentPiece.y, this.logic.currentPiece.color);
        
        // Update UI
        this.scoreText.setText(`Score: ${gameState.score}`);
        this.levelText.setText(`Level: ${this.logic.level}`);
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
        
        this.graphics.fillStyle(color, alpha);
        this.graphics.fillRect(px + 1, py + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Inner highlight for neon look
        this.graphics.fillStyle(0xffffff, 0.5 * alpha);
        this.graphics.fillRect(px + 4, py + 4, 4, 4);
    }
}
