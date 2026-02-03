export const GRID_SIZE = 6;
export const TILE_SIZE = 55;
export const COLORS = [
    { id: 0, color: 0xff4757, name: 'ruby' },
    { id: 1, color: 0x2e86de, name: 'sapphire' },
    { id: 2, color: 0x2ed573, name: 'emerald' },
    { id: 3, color: 0xffa502, name: 'topaz' },
    { id: 4, color: 0x5f27cd, name: 'amethyst' }
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
                (r >= 2 && grid[r-1][c] === type && grid[r-2][c] === type) ||
                (c >= 2 && grid[r][c-1] === type && grid[r][c-2] === type)
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
            if (type !== null && gridData[r][c+1] === type && gridData[r][c+2] === type) {
                matches.add(`${r},${c}`);
                matches.add(`${r},${c+1}`);
                matches.add(`${r},${c+2}`);
            }
        }
    }
    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
        for (let r = 0; r < GRID_SIZE - 2; r++) {
            const type = gridData[r][c];
            if (type !== null && gridData[r+1][c] === type && gridData[r+2][c] === type) {
                matches.add(`${r},${c}`);
                matches.add(`${r+1},${c}`);
                matches.add(`${r+2},${c}`);
            }
        }
    }
    return Array.from(matches).map(s => {
        const [r, c] = s.split(',').map(Number);
        return { r, c };
    });
};
