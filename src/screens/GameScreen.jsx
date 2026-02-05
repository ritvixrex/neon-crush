import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGameState, SCREENS } from '../state/GameStateManager';
import { getLevel, calculateStars, isObjectiveComplete, getObjectiveText, OBJECTIVE_TYPES } from '../levels';
import { SPECIAL_TYPES, detectSpecialCandy, getSpecialCandyEffect, getCombinedEffect, SPECIAL_VISUALS } from '../logic/SpecialCandies';
import LevelComplete from '../components/LevelComplete';
import LevelFailed from '../components/LevelFailed';

// Import candy assets
import redCandy from '../assets/candies/red.png';
import orangeCandy from '../assets/candies/orange.png';
import yellowCandy from '../assets/candies/yellow.png';
import greenCandy from '../assets/candies/green.png';
import blueCandy from '../assets/candies/blue.png';
import purpleCandy from '../assets/candies/purple.png';

const CANDY_IMAGES = {
    red: redCandy,
    orange: orangeCandy,
    yellow: yellowCandy,
    green: greenCandy,
    blue: blueCandy,
    purple: purpleCandy
};

const COLORS = [
    { id: 0, texture: 'red', name: 'red' },
    { id: 1, texture: 'orange', name: 'orange' },
    { id: 2, texture: 'yellow', name: 'yellow' },
    { id: 3, texture: 'green', name: 'green' },
    { id: 4, texture: 'blue', name: 'blue' },
    { id: 5, texture: 'purple', name: 'purple' }
];

const BOARD_PADDING = 10;
const CANDY_GAP = 3;

const GameScreen = () => {
    const {
        currentLevel,
        completeLevel,
        failLevel,
        goToWorldMap,
        showLevelComplete,
        showLevelFailed,
        playerProgress
    } = useGameState();

    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(null); // null indicates not yet initialized
    const [gameState, setGameState] = useState({
        jelliesCleared: 0,
        colorsCaptured: {},
        ingredientsDropped: 0
    });
    const [levelStarted, setLevelStarted] = useState(false); // Track if level is ready
    const [cascadeFeedback, setCascadeFeedback] = useState(null); // For cascade text display
    const [scorePopups, setScorePopups] = useState([]); // For floating score numbers

    const gridRef = useRef([]);
    const boardShapeRef = useRef(null);
    const candyPositions = useRef([]);
    const selected = useRef(null);
    const isProcessing = useRef(false);
    const loadedImages = useRef({});
    const animationFrameRef = useRef(null);
    const levelConfigRef = useRef(null);
    const tileSizeRef = useRef(50);
    const cascadeLevelRef = useRef(0); // Track cascade depth

    // Cascade feedback messages
    const CASCADE_MESSAGES = ['Sweet!', 'Tasty!', 'Divine!', 'Delicious!', 'Sugar Crush!'];

    // Load level configuration
    useEffect(() => {
        const level = getLevel(currentLevel);
        if (level) {
            levelConfigRef.current = level;
            setMoves(level.moveLimit);
            setScore(0);
            setGameState({
                jelliesCleared: 0,
                colorsCaptured: {},
                ingredientsDropped: 0
            });

            // Calculate tile size based on grid
            const canvasSize = Math.min(window.innerWidth - 20, 400);
            const maxDim = Math.max(level.gridSize.rows, level.gridSize.cols);
            tileSizeRef.current = Math.floor((canvasSize - BOARD_PADDING * 2) / maxDim);

            boardShapeRef.current = level.boardShape;
        }
    }, [currentLevel]);

    // Load candy images
    useEffect(() => {
        const loadImages = async () => {
            const imagePromises = Object.entries(CANDY_IMAGES).map(([key, src]) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        loadedImages.current[key] = img;
                        resolve();
                    };
                    img.onerror = () => resolve();
                    img.src = src;
                });
            });
            await Promise.all(imagePromises);
            startNewLevel();
        };
        loadImages();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [currentLevel]);

    const isCellActive = useCallback((r, c) => {
        if (!boardShapeRef.current) return true;
        return boardShapeRef.current[r]?.[c] === 1;
    }, []);

    const createInitialGrid = useCallback(() => {
        const level = levelConfigRef.current;
        if (!level) return [];

        const { rows, cols } = level.gridSize;
        const colorPoolSize = level.candyColors;
        const grid = [];

        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
                if (!isCellActive(r, c)) {
                    grid[r][c] = null;
                    continue;
                }

                let type;
                do {
                    type = Math.floor(Math.random() * colorPoolSize);
                } while (
                    (r >= 2 && grid[r - 1]?.[c]?.color === type && grid[r - 2]?.[c]?.color === type) ||
                    (c >= 2 && grid[r][c - 1]?.color === type && grid[r][c - 2]?.color === type)
                );

                grid[r][c] = { color: type, special: SPECIAL_TYPES.NONE };
            }
        }
        return grid;
    }, [isCellActive]);

    const startNewLevel = useCallback(() => {
        const level = levelConfigRef.current;
        if (!level) return;

        isProcessing.current = true;
        const newGrid = createInitialGrid();
        gridRef.current = newGrid;

        const { rows, cols } = level.gridSize;
        const TILE_SIZE = tileSizeRef.current;

        // Initialize candy positions
        candyPositions.current = [];
        for (let r = 0; r < rows; r++) {
            candyPositions.current[r] = [];
            for (let c = 0; c < cols; c++) {
                if (!isCellActive(r, c)) {
                    candyPositions.current[r][c] = null;
                    continue;
                }
                candyPositions.current[r][c] = {
                    x: BOARD_PADDING + c * TILE_SIZE + TILE_SIZE / 2,
                    y: -100 - (rows - r) * TILE_SIZE,
                    targetY: BOARD_PADDING + r * TILE_SIZE + TILE_SIZE / 2,
                    scale: 1,
                    alpha: 1
                };
            }
        }

        // Animate candies falling in
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const pos = candyPositions.current[r]?.[c];
                if (!pos) continue;
                gsap.to(pos, {
                    y: pos.targetY,
                    duration: 0.5,
                    ease: "bounce.out",
                    delay: c * 0.04 + r * 0.02
                });
            }
        }

        // Mark level as fully started
        setLevelStarted(true);
        isProcessing.current = false;
        renderLoop();
    }, [createInitialGrid, isCellActive]);

    const renderLoop = useCallback(() => {
        const canvas = canvasRef.current;
        const level = levelConfigRef.current;
        if (!canvas || !level) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { rows, cols } = level.gridSize;
        const TILE_SIZE = tileSizeRef.current;
        const CANDY_SIZE = TILE_SIZE - CANDY_GAP * 2;

        // Clear canvas with transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid cells only (background)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!isCellActive(r, c)) continue;

                const x = BOARD_PADDING + c * TILE_SIZE;
                const y = BOARD_PADDING + r * TILE_SIZE;

                // Cell background
                ctx.fillStyle = (r + c) % 2 === 0
                    ? 'rgba(147, 51, 234, 0.25)'
                    : 'rgba(168, 85, 247, 0.2)';
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2, 6);
                ctx.fill();

                // Jelly overlay if applicable
                if (level.jellyPositions?.some(([jr, jc]) => jr === r && jc === c)) {
                    ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
                    ctx.fill();
                }
            }
        }

        // Draw candies - NO BACKGROUND, just the candy images
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = gridRef.current[r]?.[c];
                if (cell === null || cell === undefined) continue;

                const pos = candyPositions.current[r]?.[c];
                if (!pos) continue;

                const colorId = typeof cell === 'object' ? cell.color : cell;
                const specialType = typeof cell === 'object' ? cell.special : SPECIAL_TYPES.NONE;
                const config = COLORS[colorId];
                if (!config) continue;

                const img = loadedImages.current[config.texture];
                if (img) {
                    const size = CANDY_SIZE * pos.scale;
                    const drawX = pos.x - size / 2;
                    const drawY = pos.y - size / 2;

                    ctx.globalAlpha = pos.alpha;

                    // Draw shadow
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
                    ctx.shadowBlur = 6;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 3;

                    // Draw candy image (transparent PNG)
                    ctx.drawImage(img, drawX, drawY, size, size);

                    // Draw special candy overlay
                    if (specialType !== SPECIAL_TYPES.NONE) {
                        drawSpecialOverlay(ctx, specialType, pos.x, pos.y, size);
                    }

                    // Reset shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.globalAlpha = 1;
                }
            }
        }

        // Draw selection highlight
        if (selected.current !== null) {
            const { r, c } = selected.current;
            const pos = candyPositions.current[r]?.[c];
            if (pos) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, CANDY_SIZE / 2 + 4, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, CANDY_SIZE / 2 + 7, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        animationFrameRef.current = requestAnimationFrame(renderLoop);
    }, [isCellActive]);

    const drawSpecialOverlay = (ctx, specialType, x, y, size) => {
        const visual = SPECIAL_VISUALS[specialType];
        if (!visual) return;

        ctx.save();

        if (specialType === SPECIAL_TYPES.STRIPED_H) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(x - size / 2 + 4, y + i * 4);
                ctx.lineTo(x + size / 2 - 4, y + i * 4);
                ctx.stroke();
            }
        } else if (specialType === SPECIAL_TYPES.STRIPED_V) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(x + i * 4, y - size / 2 + 4);
                ctx.lineTo(x + i * 4, y + size / 2 - 4);
                ctx.stroke();
            }
        } else if (specialType === SPECIAL_TYPES.WRAPPED) {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, size / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, size / 3, 0, Math.PI * 2);
            ctx.stroke();
        } else if (specialType === SPECIAL_TYPES.COLOR_BOMB) {
            // Rainbow swirl effect
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 0, 150, 0.4)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    };

    const findMatches = useCallback((gridData) => {
        const level = levelConfigRef.current;
        if (!level) return [];

        const { rows, cols } = level.gridSize;
        const matches = [];
        const visited = new Set();

        // Find horizontal matches
        for (let r = 0; r < rows; r++) {
            let matchStart = 0;
            for (let c = 1; c <= cols; c++) {
                const current = gridData[r]?.[c];
                const prev = gridData[r]?.[c - 1];
                const currentColor = current?.color ?? current;
                const prevColor = prev?.color ?? prev;

                if (c < cols && currentColor !== null && currentColor === prevColor) {
                    continue;
                }

                const matchLength = c - matchStart;
                if (matchLength >= 3 && prevColor !== null) {
                    const matchPositions = [];
                    for (let mc = matchStart; mc < c; mc++) {
                        const key = `${r},${mc}`;
                        if (!visited.has(key)) {
                            visited.add(key);
                            matchPositions.push({ r, c: mc });
                        }
                    }
                    if (matchPositions.length >= 3) {
                        matches.push({ positions: matchPositions, direction: 'horizontal' });
                    }
                }
                matchStart = c;
            }
        }

        // Find vertical matches
        for (let c = 0; c < cols; c++) {
            let matchStart = 0;
            for (let r = 1; r <= rows; r++) {
                const current = gridData[r]?.[c];
                const prev = gridData[r - 1]?.[c];
                const currentColor = current?.color ?? current;
                const prevColor = prev?.color ?? prev;

                if (r < rows && currentColor !== null && currentColor === prevColor) {
                    continue;
                }

                const matchLength = r - matchStart;
                if (matchLength >= 3 && prevColor !== null) {
                    const matchPositions = [];
                    for (let mr = matchStart; mr < r; mr++) {
                        const key = `${mr},${c}`;
                        if (!visited.has(key)) {
                            visited.add(key);
                            matchPositions.push({ r: mr, c });
                        }
                    }
                    if (matchPositions.length > 0) {
                        matches.push({ positions: matchPositions, direction: 'vertical' });
                    }
                }
                matchStart = r;
            }
        }

        return matches;
    }, []);

    const handleCanvasClick = useCallback(async (e) => {
        if (isProcessing.current || !levelStarted || moves === null || moves <= 0) return;

        const canvas = canvasRef.current;
        const level = levelConfigRef.current;
        if (!canvas || !level) return;

        const { rows, cols } = level.gridSize;
        const TILE_SIZE = tileSizeRef.current;
        const CANDY_SIZE = TILE_SIZE - CANDY_GAP * 2;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        let clickedR = -1, clickedC = -1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const pos = candyPositions.current[r]?.[c];
                if (!pos) continue;

                const dist = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
                if (dist < CANDY_SIZE / 2) {
                    clickedR = r;
                    clickedC = c;
                    break;
                }
            }
            if (clickedR !== -1) break;
        }

        if (clickedR === -1) return;

        if (!selected.current) {
            selected.current = { r: clickedR, c: clickedC };
            const pos = candyPositions.current[clickedR][clickedC];
            gsap.to(pos, { scale: 1.12, duration: 0.15, ease: "power2.out" });
        } else {
            const p1 = selected.current;
            const p2 = { r: clickedR, c: clickedC };
            const dr = Math.abs(p1.r - clickedR);
            const dc = Math.abs(p1.c - clickedC);

            const pos1 = candyPositions.current[p1.r][p1.c];
            gsap.to(pos1, { scale: 1, duration: 0.15 });

            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                selected.current = null;
                await processSwap(p1.r, p1.c, p2.r, p2.c);
            } else {
                selected.current = { r: clickedR, c: clickedC };
                const pos2 = candyPositions.current[clickedR][clickedC];
                gsap.to(pos2, { scale: 1.12, duration: 0.15, ease: "power2.out" });
            }
        }
    }, [moves, levelStarted]);

    const processSwap = async (r1, c1, r2, c2) => {
        isProcessing.current = true;
        const TILE_SIZE = tileSizeRef.current;

        const pos1 = candyPositions.current[r1][c1];
        const pos2 = candyPositions.current[r2][c2];
        const x1 = pos1.x, y1 = pos1.y;
        const x2 = pos2.x, y2 = pos2.y;

        await Promise.all([
            gsap.to(pos1, { x: x2, y: y2, duration: 0.25, ease: "power3.inOut" }),
            gsap.to(pos2, { x: x1, y: y1, duration: 0.25, ease: "power3.inOut" })
        ]);

        // Swap in grid
        const temp = gridRef.current[r1][c1];
        gridRef.current[r1][c1] = gridRef.current[r2][c2];
        gridRef.current[r2][c2] = temp;

        candyPositions.current[r1][c1] = pos2;
        candyPositions.current[r2][c2] = pos1;
        pos1.x = x2; pos1.y = y2;
        pos2.x = x1; pos2.y = y1;

        const matches = findMatches(gridRef.current);
        if (matches.length > 0 || hasSpecialCombo(r1, c1, r2, c2)) {
            setMoves(m => {
                const newMoves = m - 1;
                return newMoves;
            });
            await handleMatches();
            checkLevelEnd();
        } else {
            // Swap back
            await Promise.all([
                gsap.to(pos1, { x: x1, y: y1, duration: 0.25, ease: "power3.inOut" }),
                gsap.to(pos2, { x: x2, y: y2, duration: 0.25, ease: "power3.inOut" })
            ]);
            gridRef.current[r2][c2] = gridRef.current[r1][c1];
            gridRef.current[r1][c1] = temp;
            candyPositions.current[r1][c1] = pos1;
            candyPositions.current[r2][c2] = pos2;
            pos1.x = x1; pos1.y = y1;
            pos2.x = x2; pos2.y = y2;
        }

        isProcessing.current = false;
    };

    const hasSpecialCombo = (r1, c1, r2, c2) => {
        const cell1 = gridRef.current[r1]?.[c1];
        const cell2 = gridRef.current[r2]?.[c2];
        const special1 = cell1?.special || SPECIAL_TYPES.NONE;
        const special2 = cell2?.special || SPECIAL_TYPES.NONE;
        return special1 !== SPECIAL_TYPES.NONE || special2 !== SPECIAL_TYPES.NONE;
    };

    const handleMatches = async (isInitialMatch = true) => {
        let matches = findMatches(gridRef.current);
        if (matches.length === 0) {
            // Reset cascade counter at end of chain
            cascadeLevelRef.current = 0;
            return;
        }

        // Increment cascade level for each subsequent match
        if (!isInitialMatch) {
            cascadeLevelRef.current += 1;

            // Show cascade feedback
            const feedbackIndex = Math.min(cascadeLevelRef.current - 1, CASCADE_MESSAGES.length - 1);
            setCascadeFeedback(CASCADE_MESSAGES[feedbackIndex]);
            setTimeout(() => setCascadeFeedback(null), 1000);
        }

        let totalScore = 0;
        const newGameState = { ...gameState };
        const basePoints = 60; // Candy Crush uses 60 points per candy in 3-match
        const cascadeMultiplier = 1 + (cascadeLevelRef.current * 0.5); // Bonus for cascades

        for (const match of matches) {
            const { positions, direction } = match;

            // Calculate match score with Candy Crush formula
            // 3-match = 60pts, 4-match = 120pts (creating special), 5-match = 200pts
            let matchScore = positions.length * basePoints * cascadeMultiplier;

            // Check for special candy creation
            const special = detectSpecialCandy(positions, direction);

            // Animate matched candies
            const anims = positions.map((m, idx) => {
                const pos = candyPositions.current[m.r]?.[m.c];
                if (!pos) return Promise.resolve();

                // Skip the position where special candy will be created
                if (special.type !== SPECIAL_TYPES.NONE &&
                    special.position.r === m.r &&
                    special.position.c === m.c) {
                    return Promise.resolve();
                }

                // Track captured colors
                const cell = gridRef.current[m.r][m.c];
                const colorName = COLORS[cell?.color ?? cell]?.name;
                if (colorName) {
                    newGameState.colorsCaptured[colorName] =
                        (newGameState.colorsCaptured[colorName] || 0) + 1;
                }

                gridRef.current[m.r][m.c] = null;
                return gsap.to(pos, {
                    scale: 0,
                    alpha: 0,
                    duration: 0.25,
                    ease: "back.in(1.5)"
                });
            });

            await Promise.all(anims);
            totalScore += matchScore;

            // Create special candy if applicable with bonus points
            if (special.type !== SPECIAL_TYPES.NONE) {
                const { r, c } = special.position;
                const originalColor = gridRef.current[r]?.[c]?.color ?? gridRef.current[r]?.[c];
                gridRef.current[r][c] = {
                    color: originalColor ?? Math.floor(Math.random() * 6),
                    special: special.type
                };
                // Reset position for the new special candy
                const pos = candyPositions.current[r][c];
                if (pos) {
                    pos.scale = 1;
                    pos.alpha = 1;
                    gsap.from(pos, { scale: 1.5, duration: 0.3, ease: "elastic.out" });
                }

                // Bonus for special candy creation (Candy Crush style)
                if (special.type === SPECIAL_TYPES.STRIPED_H || special.type === SPECIAL_TYPES.STRIPED_V) {
                    totalScore += 120; // Striped candy bonus
                } else if (special.type === SPECIAL_TYPES.WRAPPED) {
                    totalScore += 200; // Wrapped candy bonus
                } else if (special.type === SPECIAL_TYPES.COLOR_BOMB) {
                    totalScore += 200; // Color bomb bonus
                }
            }
        }

        setScore(s => s + Math.round(totalScore));
        setGameState(newGameState);

        await refillGrid();
        await handleMatches(false); // Cascade - mark as not initial
    };

    const refillGrid = async () => {
        const level = levelConfigRef.current;
        if (!level) return;

        const { rows, cols } = level.gridSize;
        const TILE_SIZE = tileSizeRef.current;
        const dropAnims = [];

        for (let c = 0; c < cols; c++) {
            let emptySlots = 0;
            for (let r = rows - 1; r >= 0; r--) {
                if (!isCellActive(r, c)) continue;

                if (gridRef.current[r][c] === null) {
                    emptySlots++;
                } else if (emptySlots > 0) {
                    const newRow = r + emptySlots;
                    const pos = candyPositions.current[r][c];
                    const targetY = BOARD_PADDING + newRow * TILE_SIZE + TILE_SIZE / 2;

                    gridRef.current[newRow][c] = gridRef.current[r][c];
                    gridRef.current[r][c] = null;
                    candyPositions.current[newRow][c] = pos;
                    candyPositions.current[r][c] = null;

                    dropAnims.push(gsap.to(pos, {
                        y: targetY,
                        duration: 0.4,
                        ease: "bounce.out"
                    }));
                }
            }

            // Fill empty slots at top
            let fillRow = 0;
            for (let i = 0; i < emptySlots; i++) {
                while (fillRow < rows && (!isCellActive(fillRow, c) || gridRef.current[fillRow][c] !== null)) {
                    fillRow++;
                }
                if (fillRow >= rows) break;

                const r = fillRow;
                const type = Math.floor(Math.random() * (level.candyColors || 6));
                const targetY = BOARD_PADDING + r * TILE_SIZE + TILE_SIZE / 2;
                const newPos = {
                    x: BOARD_PADDING + c * TILE_SIZE + TILE_SIZE / 2,
                    y: -50 - (i * TILE_SIZE),
                    scale: 1,
                    alpha: 1
                };

                gridRef.current[r][c] = { color: type, special: SPECIAL_TYPES.NONE };
                candyPositions.current[r][c] = newPos;
                dropAnims.push(gsap.to(newPos, {
                    y: targetY,
                    duration: 0.5,
                    ease: "bounce.out",
                    delay: i * 0.08
                }));
                fillRow++;
            }
        }

        await Promise.all(dropAnims);
    };

    const checkLevelEnd = useCallback(() => {
        const level = levelConfigRef.current;
        if (!level) return;

        // Check if objective is complete
        const currentState = { score, ...gameState };
        if (isObjectiveComplete(level, currentState)) {
            const stars = calculateStars(currentLevel, score);
            setTimeout(() => {
                completeLevel(currentLevel, score, stars);
            }, 500);
            return;
        }

        // Check if out of moves
        if (moves <= 1) { // Will be 0 after this move
            setTimeout(() => {
                failLevel(currentLevel, score);
            }, 500);
        }
    }, [score, gameState, moves, currentLevel, completeLevel, failLevel]);

    // Watch for moves running out - only check when level has actually started
    useEffect(() => {
        // Guard: only check when level is fully started and moves is a real number (not null)
        if (!levelStarted || moves === null) return;

        if (moves === 0 && !showLevelComplete && !showLevelFailed) {
            const level = levelConfigRef.current;
            if (level) {
                const currentState = { score, ...gameState };
                if (!isObjectiveComplete(level, currentState)) {
                    failLevel(currentLevel, score);
                }
            }
        }
    }, [moves, score, gameState, currentLevel, failLevel, showLevelComplete, showLevelFailed, levelStarted]);

    const level = levelConfigRef.current;
    if (!level) return <div className="loading">Loading...</div>;

    const { rows, cols } = level.gridSize;
    const TILE_SIZE = tileSizeRef.current;
    const canvasWidth = BOARD_PADDING * 2 + cols * TILE_SIZE;
    const canvasHeight = BOARD_PADDING * 2 + rows * TILE_SIZE;

    // Calculate objective progress
    const getProgressPercent = () => {
        if (level.objective.type === OBJECTIVE_TYPES.SCORE) {
            return Math.min((score / level.objective.target) * 100, 100);
        }
        return 0;
    };

    return (
        <div className="game-screen-premium">
            {/* Premium Header */}
            <div className="premium-game-header">
                <button className="premium-back-btn" onClick={goToWorldMap}>←</button>
                <div className="premium-level-info">
                    <span className="premium-level-label">Level {currentLevel}</span>
                    <span className="premium-level-name">{level.name}</span>
                </div>
                <div className="premium-moves-badge">
                    <span className="moves-num">{moves ?? '-'}</span>
                    <span className="moves-txt">moves</span>
                </div>
            </div>

            {/* Premium Objective & Score Bar */}
            <div className="premium-objective-bar">
                <div className="objective-pouch">
                    <span className="pouch-icon">🎯</span>
                    <span className="obj-txt-premium">{getObjectiveText(level.objective)}</span>
                </div>

                <div className="premium-score-track">
                    <div className="premium-progress-rail">
                        <div
                            className="premium-progress-ink"
                            style={{ width: `${getProgressPercent()}%` }}
                        />
                        {level.stars.map((threshold, idx) => {
                            const percent = (threshold / level.objective.target) * 100;
                            return (
                                <div
                                    key={idx}
                                    className={`star-milestone ${score >= threshold ? 'lit' : 'dim'}`}
                                    style={{ left: `${percent}%` }}
                                >
                                    ⭐
                                </div>
                            );
                        })}
                    </div>
                    <div className="current-score-pouch">
                        <span className="score-val-premium">{score.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Game board area */}
            <div className="canvas-board-area">
                <div className="board-glow" />
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    onClick={handleCanvasClick}
                    className="premium-game-board"
                    style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        aspectRatio: `${cols}/${rows}`
                    }}
                />

                {/* Cascade feedback text */}
                {cascadeFeedback && (
                    <div className="cascade-feedback">
                        <div className="cascade-text" key={cascadeFeedback}>
                            {cascadeFeedback}
                        </div>
                    </div>
                )}
            </div>

            {/* Level Complete popup */}
            {showLevelComplete && <LevelComplete />}

            {/* Level Failed popup */}
            {showLevelFailed && <LevelFailed />}
        </div>
    );
};

export default GameScreen;
