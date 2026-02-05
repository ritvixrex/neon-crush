/**
 * Level Configuration System
 * Defines all 15 levels with objectives, board shapes, and difficulty settings
 */

// Objective types
export const OBJECTIVE_TYPES = {
    SCORE: 'score',           // Reach target score
    JELLY: 'jelly',           // Clear all jelly tiles
    INGREDIENT: 'ingredient', // Drop ingredients to bottom
    ORDER: 'order'            // Collect specific candies
};

// Level definitions
const LEVELS = {
    1: {
        id: 1,
        name: "Sweet Start",
        gridSize: { rows: 7, cols: 7 },
        moveLimit: 25,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 1000 },
        stars: [500, 1000, 2000],
        candyColors: 4,
        blockers: [],
        boardShape: null // null = full rectangle
    },
    2: {
        id: 2,
        name: "Candy Lane",
        gridSize: { rows: 7, cols: 7 },
        moveLimit: 25,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 1500 },
        stars: [800, 1500, 2500],
        candyColors: 4,
        blockers: [],
        boardShape: null
    },
    3: {
        id: 3,
        name: "Sugar Rush",
        gridSize: { rows: 8, cols: 7 },
        moveLimit: 25,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 2000 },
        stars: [1000, 2000, 3500],
        candyColors: 5,
        blockers: [],
        boardShape: null
    },
    4: {
        id: 4,
        name: "Jelly Jungle",
        gridSize: { rows: 7, cols: 7 },
        moveLimit: 30,
        objective: { type: OBJECTIVE_TYPES.JELLY, target: 15 },
        stars: [1500, 3000, 5000],
        candyColors: 5,
        blockers: [],
        jellyPositions: [
            [2, 2], [2, 3], [2, 4],
            [3, 2], [3, 3], [3, 4],
            [4, 2], [4, 3], [4, 4],
            [3, 1], [3, 5], [2, 1], [2, 5], [4, 1], [4, 5]
        ],
        boardShape: null
    },
    5: {
        id: 5,
        name: "Chocolate Hills",
        gridSize: { rows: 8, cols: 8 },
        moveLimit: 28,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 2500 },
        stars: [1500, 2500, 4000],
        candyColors: 5,
        blockers: [],
        boardShape: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ]
    },
    6: {
        id: 6,
        name: "Lollipop Lake",
        gridSize: { rows: 8, cols: 8 },
        moveLimit: 30,
        objective: { type: OBJECTIVE_TYPES.ORDER, target: { red: 15, blue: 15 } },
        stars: [2000, 3500, 5500],
        candyColors: 5,
        blockers: [],
        boardShape: null
    },
    7: {
        id: 7,
        name: "Peppermint Palace",
        gridSize: { rows: 8, cols: 8 },
        moveLimit: 25,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 3500 },
        stars: [2000, 3500, 6000],
        candyColors: 5,
        blockers: [],
        boardShape: [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1]
        ]
    },
    8: {
        id: 8,
        name: "Gummy Gardens",
        gridSize: { rows: 9, cols: 7 },
        moveLimit: 30,
        objective: { type: OBJECTIVE_TYPES.JELLY, target: 20 },
        stars: [2500, 4500, 7000],
        candyColors: 5,
        jellyPositions: [
            [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
            [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
            [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
            [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]
        ],
        boardShape: null
    },
    9: {
        id: 9,
        name: "Caramel Cove",
        gridSize: { rows: 8, cols: 8 },
        moveLimit: 28,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 4000 },
        stars: [2500, 4000, 6500],
        candyColors: 6,
        blockers: [],
        boardShape: null
    },
    10: {
        id: 10,
        name: "Minty Mountains",
        gridSize: { rows: 9, cols: 9 },
        moveLimit: 30,
        objective: { type: OBJECTIVE_TYPES.ORDER, target: { green: 20, purple: 20 } },
        stars: [3000, 5000, 8000],
        candyColors: 6,
        blockers: [],
        boardShape: [
            [0, 0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0]
        ]
    },
    11: {
        id: 11,
        name: "Toffee Tower",
        gridSize: { rows: 9, cols: 8 },
        moveLimit: 32,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 5000 },
        stars: [3000, 5000, 8500],
        candyColors: 6,
        blockers: [],
        boardShape: null
    },
    12: {
        id: 12,
        name: "Licorice Labyrinth",
        gridSize: { rows: 8, cols: 8 },
        moveLimit: 28,
        objective: { type: OBJECTIVE_TYPES.JELLY, target: 30 },
        stars: [3500, 6000, 9000],
        candyColors: 6,
        jellyPositions: generateGridPositions(8, 8, [[3, 3], [3, 4], [4, 3], [4, 4]]), // All except center
        boardShape: null
    },
    13: {
        id: 13,
        name: "Cotton Candy Clouds",
        gridSize: { rows: 9, cols: 9 },
        moveLimit: 30,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 6000 },
        stars: [4000, 6000, 10000],
        candyColors: 6,
        blockers: [],
        boardShape: [
            [0, 0, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 0]
        ]
    },
    14: {
        id: 14,
        name: "Butterscotch Bay",
        gridSize: { rows: 9, cols: 9 },
        moveLimit: 32,
        objective: { type: OBJECTIVE_TYPES.ORDER, target: { yellow: 25, orange: 25, red: 15 } },
        stars: [4500, 7000, 11000],
        candyColors: 6,
        blockers: [],
        boardShape: null
    },
    15: {
        id: 15,
        name: "Rainbow Road",
        gridSize: { rows: 9, cols: 9 },
        moveLimit: 35,
        objective: { type: OBJECTIVE_TYPES.SCORE, target: 10000 },
        stars: [6000, 10000, 15000],
        candyColors: 6,
        blockers: [],
        boardShape: null
    }
};

// Helper function to generate jelly positions
function generateGridPositions(rows, cols, exclude = []) {
    const positions = [];
    const excludeSet = new Set(exclude.map(([r, c]) => `${r},${c}`));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!excludeSet.has(`${r},${c}`)) {
                positions.push([r, c]);
            }
        }
    }
    return positions;
}

/**
 * Get level configuration by ID
 */
export const getLevel = (levelId) => {
    return LEVELS[levelId] || null;
};

/**
 * Get all levels
 */
export const getAllLevels = () => {
    return Object.values(LEVELS);
};

/**
 * Get total number of levels
 */
export const getTotalLevels = () => {
    return Object.keys(LEVELS).length;
};

/**
 * Calculate stars earned based on score
 */
export const calculateStars = (levelId, score) => {
    const level = LEVELS[levelId];
    if (!level) return 0;

    if (score >= level.stars[2]) return 3;
    if (score >= level.stars[1]) return 2;
    if (score >= level.stars[0]) return 1;
    return 0;
};

/**
 * Check if objective is completed
 */
export const isObjectiveComplete = (level, gameState) => {
    const { objective } = level;

    switch (objective.type) {
        case OBJECTIVE_TYPES.SCORE:
            return gameState.score >= objective.target;

        case OBJECTIVE_TYPES.JELLY:
            return gameState.jelliesCleared >= objective.target;

        case OBJECTIVE_TYPES.ORDER:
            return Object.entries(objective.target).every(
                ([color, count]) => (gameState.colorsCaptured[color] || 0) >= count
            );

        case OBJECTIVE_TYPES.INGREDIENT:
            return gameState.ingredientsDropped >= objective.target;

        default:
            return false;
    }
};

/**
 * Get objective description text
 */
export const getObjectiveText = (objective) => {
    switch (objective.type) {
        case OBJECTIVE_TYPES.SCORE:
            return `Score ${objective.target.toLocaleString()} points`;

        case OBJECTIVE_TYPES.JELLY:
            return `Clear ${objective.target} jelly squares`;

        case OBJECTIVE_TYPES.ORDER:
            const orders = Object.entries(objective.target)
                .map(([color, count]) => `${count} ${color}`)
                .join(', ');
            return `Collect ${orders} candies`;

        case OBJECTIVE_TYPES.INGREDIENT:
            return `Drop ${objective.target} ingredients`;

        default:
            return 'Complete the level';
    }
};

export default LEVELS;
