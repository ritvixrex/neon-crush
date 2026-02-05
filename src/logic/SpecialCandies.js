/**
 * Special Candies System
 * Defines special candy types and their effects
 */

// Special candy types
export const SPECIAL_TYPES = {
    NONE: 'none',
    STRIPED_H: 'striped_horizontal',  // Clears entire row
    STRIPED_V: 'striped_vertical',    // Clears entire column
    WRAPPED: 'wrapped',               // 3x3 explosion (twice)
    COLOR_BOMB: 'color_bomb'          // Clears all of one color
};

/**
 * Determine if a match pattern creates a special candy
 * @param {Array} matchedPositions - Array of {r, c} positions in the match
 * @param {string} direction - 'horizontal' or 'vertical' for the primary match direction
 * @returns {Object} - { type, position } of special candy to create
 */
export const detectSpecialCandy = (matchedPositions, direction) => {
    const count = matchedPositions.length;

    if (count >= 5) {
        // 5 in a row = Color Bomb
        const center = matchedPositions[Math.floor(count / 2)];
        return { type: SPECIAL_TYPES.COLOR_BOMB, position: center };
    }

    // Check for L or T shape (wrapped candy)
    if (isLOrTShape(matchedPositions)) {
        const center = findCenterOfShape(matchedPositions);
        return { type: SPECIAL_TYPES.WRAPPED, position: center };
    }

    if (count === 4) {
        // 4 in a row = Striped candy
        const center = matchedPositions[1]; // Second position
        const type = direction === 'horizontal' ? SPECIAL_TYPES.STRIPED_V : SPECIAL_TYPES.STRIPED_H;
        return { type, position: center };
    }

    return { type: SPECIAL_TYPES.NONE, position: null };
};

/**
 * Check if positions form an L or T shape
 */
const isLOrTShape = (positions) => {
    if (positions.length < 5) return false;

    // Get unique rows and columns
    const rows = new Set(positions.map(p => p.r));
    const cols = new Set(positions.map(p => p.c));

    // L or T shape has candies in multiple rows AND multiple columns
    return rows.size >= 2 && cols.size >= 2;
};

/**
 * Find center position of L/T shape
 */
const findCenterOfShape = (positions) => {
    // Find position that shares row with some and column with others
    for (const pos of positions) {
        const sameRow = positions.filter(p => p.r === pos.r).length;
        const sameCol = positions.filter(p => p.c === pos.c).length;
        if (sameRow >= 2 && sameCol >= 2) {
            return pos;
        }
    }
    return positions[Math.floor(positions.length / 2)];
};

/**
 * Get positions affected when a special candy is activated
 * @param {string} specialType - Type of special candy
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @param {Array} grid - Current game grid
 * @param {number} candyColor - Color ID of the candy (for color bomb)
 * @returns {Array} - Array of {r, c} positions to clear
 */
export const getSpecialCandyEffect = (specialType, row, col, grid, candyColor = null) => {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const affected = [];

    switch (specialType) {
        case SPECIAL_TYPES.STRIPED_H:
            // Clear entire row
            for (let c = 0; c < cols; c++) {
                if (grid[row][c] !== null) {
                    affected.push({ r: row, c });
                }
            }
            break;

        case SPECIAL_TYPES.STRIPED_V:
            // Clear entire column
            for (let r = 0; r < rows; r++) {
                if (grid[r][col] !== null) {
                    affected.push({ r, c: col });
                }
            }
            break;

        case SPECIAL_TYPES.WRAPPED:
            // 3x3 explosion
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== null) {
                        affected.push({ r, c });
                    }
                }
            }
            break;

        case SPECIAL_TYPES.COLOR_BOMB:
            // Clear all candies of the target color
            if (candyColor !== null) {
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const cell = grid[r][c];
                        if (cell !== null && getCandyColor(cell) === candyColor) {
                            affected.push({ r, c });
                        }
                    }
                }
            }
            break;
    }

    return affected;
};

/**
 * Get the color from a candy cell (handles both regular and special candies)
 */
const getCandyColor = (cell) => {
    if (typeof cell === 'number') return cell;
    if (typeof cell === 'object' && cell !== null) return cell.color;
    return null;
};

/**
 * Get combined effect of two special candies colliding
 * @param {string} type1 - First special candy type
 * @param {string} type2 - Second special candy type
 * @param {Object} pos1 - Position of first candy
 * @param {Object} pos2 - Position of second candy
 * @param {Array} grid - Current game grid
 * @returns {Array} - Array of {r, c} positions to clear
 */
export const getCombinedEffect = (type1, type2, pos1, pos2, grid) => {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const affected = new Set();

    const addPosition = (r, c) => {
        if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== null) {
            affected.add(`${r},${c}`);
        }
    };

    // Sort types for easier comparison
    const types = [type1, type2].sort();
    const centerR = Math.floor((pos1.r + pos2.r) / 2);
    const centerC = Math.floor((pos1.c + pos2.c) / 2);

    if (types.includes(SPECIAL_TYPES.COLOR_BOMB)) {
        const otherType = types.find(t => t !== SPECIAL_TYPES.COLOR_BOMB);

        if (otherType === SPECIAL_TYPES.COLOR_BOMB) {
            // Color Bomb + Color Bomb = Clear almost everything
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    addPosition(r, c);
                }
            }
        } else if (otherType === SPECIAL_TYPES.STRIPED_H || otherType === SPECIAL_TYPES.STRIPED_V) {
            // Color Bomb + Striped = All candies of that color become striped
            const targetColor = getCandyColor(grid[pos2.r]?.[pos2.c]) ?? getCandyColor(grid[pos1.r]?.[pos1.c]);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (getCandyColor(grid[r][c]) === targetColor) {
                        // Clear row and column for each
                        for (let i = 0; i < cols; i++) addPosition(r, i);
                        for (let i = 0; i < rows; i++) addPosition(i, c);
                    }
                }
            }
        } else if (otherType === SPECIAL_TYPES.WRAPPED) {
            // Color Bomb + Wrapped = All of that color explode
            const targetColor = getCandyColor(grid[pos2.r]?.[pos2.c]) ?? getCandyColor(grid[pos1.r]?.[pos1.c]);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (getCandyColor(grid[r][c]) === targetColor) {
                        // 3x3 for each
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                addPosition(r + dr, c + dc);
                            }
                        }
                    }
                }
            }
        }
    } else if (types[0] === SPECIAL_TYPES.STRIPED_H || types[0] === SPECIAL_TYPES.STRIPED_V) {
        if (types[0] === types[1] || (types.includes(SPECIAL_TYPES.STRIPED_H) && types.includes(SPECIAL_TYPES.STRIPED_V))) {
            // Striped + Striped = Cross (row + column)
            for (let c = 0; c < cols; c++) addPosition(centerR, c);
            for (let r = 0; r < rows; r++) addPosition(r, centerC);
        } else if (types.includes(SPECIAL_TYPES.WRAPPED)) {
            // Striped + Wrapped = Giant cross (3 rows + 3 columns)
            for (let dr = -1; dr <= 1; dr++) {
                for (let c = 0; c < cols; c++) addPosition(centerR + dr, c);
            }
            for (let dc = -1; dc <= 1; dc++) {
                for (let r = 0; r < rows; r++) addPosition(r, centerC + dc);
            }
        }
    } else if (types[0] === SPECIAL_TYPES.WRAPPED && types[1] === SPECIAL_TYPES.WRAPPED) {
        // Wrapped + Wrapped = 5x5 explosion
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                addPosition(centerR + dr, centerC + dc);
            }
        }
    }

    return Array.from(affected).map(s => {
        const [r, c] = s.split(',').map(Number);
        return { r, c };
    });
};

/**
 * Visual data for special candy rendering
 */
export const SPECIAL_VISUALS = {
    [SPECIAL_TYPES.STRIPED_H]: {
        pattern: 'horizontal-lines',
        glowColor: 'rgba(255, 255, 255, 0.6)'
    },
    [SPECIAL_TYPES.STRIPED_V]: {
        pattern: 'vertical-lines',
        glowColor: 'rgba(255, 255, 255, 0.6)'
    },
    [SPECIAL_TYPES.WRAPPED]: {
        pattern: 'wrapper',
        glowColor: 'rgba(255, 215, 0, 0.7)'
    },
    [SPECIAL_TYPES.COLOR_BOMB]: {
        pattern: 'rainbow-swirl',
        glowColor: 'rgba(255, 255, 255, 0.9)'
    }
};
