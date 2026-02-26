import Phaser from 'phaser';
import { TetrisLogic } from '../core/TetrisLogic';
import { GAME, UI, SAFE_ZONE, COLORS } from '../core/Constants';
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

        const boardWidth = GAME.WIDTH * 0.8;
        this.cols = 10;
        this.rows = 20;
        this.blockSize = Math.floor(boardWidth / this.cols);
        this.startX = (GAME.WIDTH - (this.cols * this.blockSize)) / 2;
        this.startY = SAFE_ZONE.TOP + 50;
        
        this.logic = new TetrisLogic(this.cols, this.rows);
        this.dropTimer = 0;
        
        this.graphics = this.add.graphics();

        // --- Audio Initialization on First Interaction ---
        this.input.keyboard.once('keydown', () => audioManager.init());
        this.input.once('pointerdown', () => audioManager.init());

        // --- Input Handling ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-LEFT', () => this.move(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.move(1));
        this.input.keyboard.on('keydown-SPACE', () => this.rotate());
        this.input.keyboard.on('keydown-DOWN', () => this.softDrop());
        
        // --- UI ---
        this.scoreText = this.add.text(GAME.WIDTH / 2, SAFE_ZONE.TOP, '0', {
            fontSize: `${Math.floor(GAME.HEIGHT * 0.05)}px`,
            fontFamily: UI.FONT,
            color: COLORS.SCORE_GOLD,
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(this.startX, this.startY + (this.rows * this.blockSize) + 20, 'Level 1', {
            fontSize: `${Math.floor(GAME.HEIGHT * 0.03)}px`,
            fontFamily: UI.FONT,
            color: COLORS.MUTED_TEXT,
        }).setOrigin(0, 0);

        eventBus.emit(Events.GAME_START);
        this.render();
    }

    move(dir) {
        if (this.logic.move(dir)) {
            audioManager.playSFX('move');
            this.render();
        }
    }

    rotate() {
        if (this.logic.rotate()) {
           audioManager.playSFX('rotate');
           this.render();
        }
    }
    
    softDrop() {
        if (!this.logic.drop()) {
            gameState.score += 1;
            this.dropTimer = 0;
            this.render();
        } else {
            this.handleLock();
        }
    }

    update(time, delta) {
        if (!gameState.started) return;

        this.dropTimer += delta;
        const speed = Math.max(100, 1000 - (this.logic.level - 1) * 75);
        
        if (this.dropTimer > speed) {
            if (this.logic.drop()) {
                this.handleLock();
            } else {
                this.render();
            }
            this.dropTimer = 0;
        }
    }

    handleLock() {
        const linesCleared = this.logic.clearLines();
        if (linesCleared > 0) {
            const scoreData = this.logic.updateScore(linesCleared);
            gameState.score += scoreData.points;
            if (gameState.score > gameState.bestScore) gameState.bestScore = gameState.score;
            
            eventBus.emit(Events.SCORE_CHANGED, { score: gameState.score, delta: scoreData.points });
            audioManager.playSFX('clear');
            this.cameras.main.shake(100, 0.005);
            
            this.levelText.setText(`Level ${this.logic.level}`);
        }

        audioManager.playSFX('lock');
        
        if (this.logic.spawnPiece()) {
             this.render();
        } else {
            this.gameOver();
        }
    }

    gameOver() {
        if (!gameState.started) return;
        gameState.gameOver = true;
        gameState.started = false;
        audioManager.playSFX('gameover');
        eventBus.emit(Events.GAME_OVER, { score: gameState.score });
        this.scene.start('GameOverScene');
    }

    render() {
        this.graphics.clear();
        this.graphics.fillStyle(0x111111);
        this.graphics.fillRect(this.startX, this.startY, this.cols * this.blockSize, this.rows * this.blockSize);

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.logic.grid[y][x]) {
                    this.drawBlock(x, y, this.logic.grid[y][x]);
                }
            }
        }

        if (this.logic.currentPiece) {
            this.drawPiece(this.logic.currentPiece.shape, this.logic.currentPiece.x, this.logic.currentPiece.y, this.logic.currentPiece.color);
        }
        
        this.scoreText.setText(`${gameState.score}`);
    }

    drawPiece(shape, offsetX, offsetY, color) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    this.drawBlock(offsetX + x, offsetY + y, color);
                }
            }
        }
    }

    drawBlock(x, y, color) {
        const px = this.startX + x * this.blockSize;
        const py = this.startY + y * this.blockSize;
        this.graphics.fillStyle(color);
        this.graphics.fillRect(px + 1, py + 1, this.blockSize - 2, this.blockSize - 2);
    }
}
