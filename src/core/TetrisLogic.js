import { TETROMINOS } from '../sprites/blocks';

export class TetrisLogic {
    constructor(cols = 10, rows = 20) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.createGrid();
        this.lines = 0;
        this.level = 1;
        this.bag = [];
        this.spawnPiece();
    }

    createGrid() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }

    fillBag() {
        const shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        for (let i = shapes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
        }
        this.bag = shapes;
    }

    spawnPiece() {
        if (this.bag.length === 0) this.fillBag();
        
        const type = this.bag.pop();
        const def = TETROMINOS[type];
        
        this.currentPiece = {
            type,
            shape: def.shape,
            color: def.color,
            x: Math.floor(this.cols / 2) - Math.ceil(def.shape[0].length / 2),
            y: 0
        };

        if (this.checkCollision(0, 0)) {
            return false; // Game Over
        }
        return true;
    }

    checkCollision(offsetX, offsetY, shape = this.currentPiece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = this.currentPiece.x + x + offsetX;
                    const newY = this.currentPiece.y + y + offsetY;
                    if (newX < 0 || newX >= this.cols || newY >= this.rows || (newY >= 0 && this.grid[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    rotate() {
        const originalShape = this.currentPiece.shape;
        const newShape = originalShape[0].map((_, index) =>
            originalShape.map(row => row[index]).reverse()
        );
        
        if (!this.checkCollision(0, 0, newShape)) {
            this.currentPiece.shape = newShape;
            return true;
        }
        return false;
    }

    move(dir) {
        if (!this.checkCollision(dir, 0)) {
            this.currentPiece.x += dir;
            return true;
        }
        return false;
    }

    drop() {
        if (!this.checkCollision(0, 1)) {
            this.currentPiece.y++;
            return false;
        }
        this.lockPiece();
        return true;
    }

    lockPiece() {
        const { shape, x, y, color } = this.currentPiece;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] && y + row >= 0) {
                     this.grid[y + row][x + col] = color;
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        return linesCleared;
    }

    updateScore(linesCleared) {
        const scores = [0, 100, 300, 500, 800];
        const points = scores[linesCleared] * this.level;
        this.lines += linesCleared;
        this.level = Math.floor(this.lines / 10) + 1;
        return { points, level: this.level };
    }
}
