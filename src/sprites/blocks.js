export const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: 0x00ffff // Cyan
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 0x0000ff // Blue
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 0xffa500 // Orange
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: 0xffff00 // Yellow
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: 0x00ff00 // Green
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 0x800080 // Purple
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: 0xff0000 // Red
    }
};

export const COLORS = {
    I: 0x00ffff,
    J: 0x0000ff,
    L: 0xffa500,
    O: 0xffff00,
    S: 0x00ff00,
    T: 0x800080,
    Z: 0xff0000,
    GHOST: 0x333333
};
