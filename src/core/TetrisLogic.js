import { TETROMINOS } from '../sprites/blocks.js';

export class TetrisLogic {
    constructor(cols = 10, rows = 20) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.createGrid();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.bag = [];
        this.spawnPiece();
    }

    createGrid() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }

    fillBag() {
        const shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        // Shuffle
        for (let i = shapes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
        }
        this.bag = shapes;
    }

    spawnPiece() {
        if (this.bag.length === 0) {
            this.fillBag();
        }
        
        const type = this.bag.pop();
        const def = TETROMINOS[type];
        
        this.currentPiece = {
            type: type,
            shape: def.shape,
            color: def.color,
            x: Math.floor(this.cols / 2) - Math.ceil(def.shape[0].length / 2),
            y: 0
        };

        // Check for immediate collision (Game Over)
        if (this.checkCollision(0, 0)) {
            this.gameOver = true;
        }
    }

    checkCollision(offsetX, offsetY, shape = this.currentPiece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = this.currentPiece.x + x + offsetX;
                    const newY = this.currentPiece.y + y + offsetY;

                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    rotate() {
        if (this.gameOver) return;
        
        const originalShape = this.currentPiece.shape;
        const newShape = originalShape[0].map((val, index) =>
            originalShape.map(row => row[index]).reverse()
        );
        
        const originalX = this.currentPiece.x;
        let offset = 0;
        
        // Basic wall kick
        if (this.checkCollision(0, 0, newShape)) {
            if (!this.checkCollision(1, 0, newShape)) offset = 1;
            else if (!this.checkCollision(-1, 0, newShape)) offset = -1;
            else if (!this.checkCollision(2, 0, newShape)) offset = 2; // For I piece near wall
            else if (!this.checkCollision(-2, 0, newShape)) offset = -2;
            else return; // Cannot rotate
        }
        
        this.currentPiece.x += offset;
        this.currentPiece.shape = newShape;
    }

    move(dir) {
        if (this.gameOver) return false;
        if (!this.checkCollision(dir, 0)) {
            this.currentPiece.x += dir;
            return true;
        }
        return false;
    }

    drop() {
        if (this.gameOver) return false;
        if (!this.checkCollision(0, 1)) {
            this.currentPiece.y++;
            return false; // Not locked yet
        } else {
            this.lockPiece();
            return true; // Locked
        }
    }
    
    hardDrop() {
        if (this.gameOver) return 0;
        let dropped = 0;
        while (!this.checkCollision(0, 1)) {
            this.currentPiece.y++;
            dropped++;
        }
        this.lockPiece();
        return dropped;
    }

    lockPiece() {
        const { shape, x, y, color } = this.currentPiece;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    if (y + row >= 0) {
                         this.grid[y + row][x + col] = color;
                    }
                }
            }
        }
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // Check same row index again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            // Standard scoring: 100, 300, 500, 800 * level
            const scores = [0, 100, 300, 500, 800];
            this.score += scores[linesCleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
        }
    }
    
    getGhostY() {
        let ghostY = this.currentPiece.y;
        while(!this.checkCollision(0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        return ghostY;
    }
}
