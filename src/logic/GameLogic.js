export const GRID_SIZE = 6;
export const TILE_SIZE = 55;
export const COLORS = [
    { id: 0, texture: 'red', name: 'red_bean' },
    { id: 1, texture: 'orange', name: 'orange_lozenge' },
    { id: 2, texture: 'yellow', name: 'yellow_lemon_drop' },
    { id: 3, texture: 'green', name: 'green_gumdrop' },
    { id: 4, texture: 'blue', name: 'blue_lollipop_head' },
    { id: 5, texture: 'purple', name: 'purple_cluster' }
];


export const createInitialGrid = (level) => {
    const grid = [];
    const colorPoolSize = level <= 2 ? 3 : (level <= 4 ? 4 : 5);

    for (let r = 0; r < GRID_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            let type;
            do {
                type = Math.floor(Math.random() * colorPoolSize);
            } while (
                (r >= 2 && grid[r - 1][c] === type && grid[r - 2][c] === type) ||
                (c >= 2 && grid[r][c - 1] === type && grid[r][c - 2] === type)
            );
            grid[r][c] = type;
        }
    }
    return grid;
};

export const findMatches = (gridData) => {
    const matches = new Set();
    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE - 2; c++) {
            const type = gridData[r][c];
            if (type !== null && gridData[r][c + 1] === type && gridData[r][c + 2] === type) {
                matches.add(`${r},${c}`);
                matches.add(`${r},${c + 1}`);
                matches.add(`${r},${c + 2}`);
            }
        }
    }
    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
        for (let r = 0; r < GRID_SIZE - 2; r++) {
            const type = gridData[r][c];
            if (type !== null && gridData[r + 1][c] === type && gridData[r + 2][c] === type) {
                matches.add(`${r},${c}`);
                matches.add(`${r + 1},${c}`);
                matches.add(`${r + 2},${c}`);
            }
        }
    }
    return Array.from(matches).map(s => {
        const [r, c] = s.split(',').map(Number);
        return { r, c };
    });
};
