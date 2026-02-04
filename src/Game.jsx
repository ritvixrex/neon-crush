import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { createInitialGrid, COLORS, GRID_SIZE, TILE_SIZE, findMatches } from './logic/GameLogic';

// Import assets
import redCandy from './assets/candies/red.png';
import orangeCandy from './assets/candies/orange.png';
import yellowCandy from './assets/candies/yellow.png';
import greenCandy from './assets/candies/green.png';
import blueCandy from './assets/candies/blue.png';
import purpleCandy from './assets/candies/purple.png';

const CANDY_IMAGES = {
    red: redCandy,
    orange: orangeCandy,
    yellow: yellowCandy,
    green: greenCandy,
    blue: blueCandy,
    purple: purpleCandy
};

const BOARD_PADDING = 15;
const CANDY_GAP = 4;
const CANDY_SIZE = TILE_SIZE - CANDY_GAP;

const Game = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [moves, setMoves] = useState(20);
    const [targetScore] = useState(1000);
    const gridRef = useRef([]);
    const candyPositions = useRef([]);
    const selected = useRef(null);
    const isProcessing = useRef(false);
    const loadedImages = useRef({});
    const animationFrameRef = useRef(null);

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
                    img.onerror = () => resolve(); // Continue even on error
                    img.src = src;
                });
            });
            await Promise.all(imagePromises);
            console.log("🍬 Candy Crush Engine: Images loaded!");
            startNewLevel(1);
        };
        loadImages();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const startNewLevel = useCallback((lvl) => {
        isProcessing.current = true;
        const newGrid = createInitialGrid(lvl);
        gridRef.current = newGrid;

        // Initialize candy positions with animation
        candyPositions.current = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            candyPositions.current[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                candyPositions.current[r][c] = {
                    x: BOARD_PADDING + c * TILE_SIZE + TILE_SIZE / 2,
                    y: -100 - (GRID_SIZE - r) * TILE_SIZE, // Start above screen
                    targetY: BOARD_PADDING + r * TILE_SIZE + TILE_SIZE / 2,
                    scale: 1,
                    alpha: 1
                };
            }
        }

        // Animate candies falling in
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const pos = candyPositions.current[r][c];
                gsap.to(pos, {
                    y: pos.targetY,
                    duration: 0.6,
                    ease: "bounce.out",
                    delay: c * 0.05 + r * 0.03
                });
            }
        }

        isProcessing.current = false;
        renderLoop();
        console.log("🍬 Candy Crush Engine: Level", lvl, "started!");
    }, []);

    const renderLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw board background
        ctx.fillStyle = 'rgba(88, 28, 135, 0.3)';
        ctx.roundRect(5, 5, canvas.width - 10, canvas.height - 10, 12);
        ctx.fill();

        // Draw grid cells
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const x = BOARD_PADDING + c * TILE_SIZE;
                const y = BOARD_PADDING + r * TILE_SIZE;

                // Cell background
                ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(147, 51, 234, 0.2)' : 'rgba(168, 85, 247, 0.15)';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, 8);
                ctx.fill();
            }
        }

        // Draw candies
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const type = gridRef.current[r]?.[c];
                if (type === null || type === undefined) continue;

                const pos = candyPositions.current[r]?.[c];
                if (!pos) continue;

                const config = COLORS[type];
                const img = loadedImages.current[config.texture];

                if (img) {
                    const size = CANDY_SIZE * pos.scale;
                    const drawX = pos.x - size / 2;
                    const drawY = pos.y - size / 2;

                    ctx.globalAlpha = pos.alpha;

                    // Draw shadow
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 8;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 4;

                    ctx.drawImage(img, drawX, drawY, size, size);

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
                ctx.arc(pos.x, pos.y, CANDY_SIZE / 2 + 5, 0, Math.PI * 2);
                ctx.stroke();

                // Glow effect
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, CANDY_SIZE / 2 + 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        animationFrameRef.current = requestAnimationFrame(renderLoop);
    }, []);

    const handleCanvasClick = useCallback(async (e) => {
        if (isProcessing.current || moves <= 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        // Find clicked candy
        let clickedR = -1, clickedC = -1;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
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
            // Scale up animation
            const pos = candyPositions.current[clickedR][clickedC];
            gsap.to(pos, { scale: 1.15, duration: 0.2, ease: "power2.out" });
        } else {
            const p1 = selected.current;
            const p2 = { r: clickedR, c: clickedC };
            const dr = Math.abs(p1.r - clickedR);
            const dc = Math.abs(p1.c - clickedC);

            // Scale back down
            const pos1 = candyPositions.current[p1.r][p1.c];
            gsap.to(pos1, { scale: 1, duration: 0.2 });

            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                selected.current = null;
                await processSwap(p1.r, p1.c, p2.r, p2.c);
            } else {
                selected.current = { r: clickedR, c: clickedC };
                const pos2 = candyPositions.current[clickedR][clickedC];
                gsap.to(pos2, { scale: 1.15, duration: 0.2, ease: "power2.out" });
            }
        }
    }, [moves]);

    const processSwap = async (r1, c1, r2, c2) => {
        isProcessing.current = true;

        const pos1 = candyPositions.current[r1][c1];
        const pos2 = candyPositions.current[r2][c2];

        const x1 = pos1.x, y1 = pos1.y;
        const x2 = pos2.x, y2 = pos2.y;

        // Animate swap
        await Promise.all([
            gsap.to(pos1, { x: x2, y: y2, duration: 0.3, ease: "power3.inOut" }),
            gsap.to(pos2, { x: x1, y: y1, duration: 0.3, ease: "power3.inOut" })
        ]);

        // Swap in grid
        const tempType = gridRef.current[r1][c1];
        gridRef.current[r1][c1] = gridRef.current[r2][c2];
        gridRef.current[r2][c2] = tempType;

        // Swap positions reference
        candyPositions.current[r1][c1] = pos2;
        candyPositions.current[r2][c2] = pos1;
        pos1.x = x2; pos1.y = y2;
        pos2.x = x1; pos2.y = y1;

        if (findMatches(gridRef.current).length > 0) {
            setMoves(m => m - 1);
            await handleMatches();
        } else {
            // Swap back
            await Promise.all([
                gsap.to(pos1, { x: x1, y: y1, duration: 0.3, ease: "power3.inOut" }),
                gsap.to(pos2, { x: x2, y: y2, duration: 0.3, ease: "power3.inOut" })
            ]);
            gridRef.current[r2][c2] = gridRef.current[r1][c1];
            gridRef.current[r1][c1] = tempType;
            candyPositions.current[r1][c1] = pos1;
            candyPositions.current[r2][c2] = pos2;
            pos1.x = x1; pos1.y = y1;
            pos2.x = x2; pos2.y = y2;
        }

        isProcessing.current = false;
    };

    const handleMatches = async () => {
        let matches = findMatches(gridRef.current);
        if (matches.length === 0) return;

        // Animate matched candies
        const anims = matches.map(m => {
            const pos = candyPositions.current[m.r]?.[m.c];
            if (!pos) return Promise.resolve();
            gridRef.current[m.r][m.c] = null;
            return gsap.to(pos, { scale: 0, alpha: 0, duration: 0.4, ease: "back.in(1.5)" });
        });

        await Promise.all(anims);
        setScore(s => s + matches.length * 20);
        await refillGrid();
        await handleMatches();
    };

    const refillGrid = async () => {
        const dropAnims = [];

        for (let c = 0; c < GRID_SIZE; c++) {
            let emptySlots = 0;
            for (let r = GRID_SIZE - 1; r >= 0; r--) {
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

                    dropAnims.push(gsap.to(pos, { y: targetY, duration: 0.5, ease: "bounce.out" }));
                }
            }

            for (let i = 0; i < emptySlots; i++) {
                const r = emptySlots - 1 - i;
                const type = Math.floor(Math.random() * COLORS.length);
                const targetY = BOARD_PADDING + r * TILE_SIZE + TILE_SIZE / 2;
                const newPos = {
                    x: BOARD_PADDING + c * TILE_SIZE + TILE_SIZE / 2,
                    y: -100 - (i * TILE_SIZE),
                    scale: 1,
                    alpha: 1
                };

                gridRef.current[r][c] = type;
                candyPositions.current[r][c] = newPos;
                dropAnims.push(gsap.to(newPos, { y: targetY, duration: 0.6, ease: "bounce.out", delay: i * 0.1 }));
            }
        }

        await Promise.all(dropAnims);
    };

    const resetGame = () => {
        setScore(0);
        setMoves(20);
        selected.current = null;
        startNewLevel(level);
    };

    const progressPercent = Math.min((score / targetScore) * 100, 100);
    const canvasSize = BOARD_PADDING * 2 + GRID_SIZE * TILE_SIZE;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full star opacity-50"></div>
                <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full star opacity-40" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-40 left-1/4 w-2 h-2 bg-purple-300 rounded-full star opacity-60" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 right-1/4 w-3 h-3 bg-blue-400 rounded-full star opacity-50" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute bottom-20 left-16 w-4 h-4 bg-green-400 rounded-full star opacity-40" style={{ animationDelay: '0.7s' }}></div>
            </div>

            {/* Main Game Container */}
            <div className="w-full max-w-[400px] relative z-10">
                {/* Header Section */}
                <div className="mb-4">
                    {/* Level Badge */}
                    <div className="flex justify-center mb-3">
                        <div className="bg-gradient-to-b from-orange-400 to-orange-600 px-8 py-2 rounded-full shadow-lg border-4 border-orange-300">
                            <span className="text-white font-extrabold text-xl drop-shadow-md">LEVEL {level}</span>
                        </div>
                    </div>

                    {/* Score and Moves Panel */}
                    <div className="flex justify-between items-center gap-3">
                        {/* Score */}
                        <div className="flex-1 bg-gradient-to-b from-purple-500 to-purple-700 rounded-2xl p-3 shadow-lg border-2 border-purple-400">
                            <div className="text-purple-200 text-xs font-bold uppercase tracking-wider text-center">Score</div>
                            <div className="text-white text-3xl font-extrabold text-center drop-shadow-md">{score}</div>
                        </div>

                        {/* Target Progress */}
                        <div className="flex-1 bg-gradient-to-b from-pink-500 to-pink-700 rounded-2xl p-3 shadow-lg border-2 border-pink-400">
                            <div className="text-pink-200 text-xs font-bold uppercase tracking-wider text-center">Target</div>
                            <div className="w-full bg-pink-900/50 rounded-full h-4 mt-1 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <div className="text-white text-sm font-bold text-center mt-1">{targetScore}</div>
                        </div>

                        {/* Moves */}
                        <div className="flex-1 bg-gradient-to-b from-blue-500 to-blue-700 rounded-2xl p-3 shadow-lg border-2 border-blue-400">
                            <div className="text-blue-200 text-xs font-bold uppercase tracking-wider text-center">Moves</div>
                            <div className="text-white text-3xl font-extrabold text-center drop-shadow-md">{moves}</div>
                        </div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="relative">
                    {/* Board Glow */}
                    <div className="absolute -inset-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl blur-xl opacity-40"></div>

                    {/* Board Container */}
                    <div className="relative bg-gradient-to-b from-purple-900/80 to-indigo-900/80 rounded-2xl p-2 border-4 border-purple-400/50 game-board-glow backdrop-blur-sm">
                        <canvas
                            ref={canvasRef}
                            width={canvasSize}
                            height={canvasSize}
                            onClick={handleCanvasClick}
                            className="w-full rounded-xl cursor-pointer"
                            style={{ aspectRatio: '1/1' }}
                        />
                    </div>
                </div>

                {/* Bottom Buttons */}
                <div className="mt-4 flex justify-center gap-4">
                    <button className="candy-btn bg-gradient-to-b from-green-400 to-green-600 text-white text-sm font-extrabold py-3 px-6 rounded-2xl shadow-[0_4px_0_#15803d] hover:shadow-[0_2px_0_#15803d] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]">
                        🎁 Shop
                    </button>
                    <button className="candy-btn bg-gradient-to-b from-amber-400 to-amber-600 text-white text-sm font-extrabold py-3 px-6 rounded-2xl shadow-[0_4px_0_#b45309] hover:shadow-[0_2px_0_#b45309] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]">
                        ⚡ Boost
                    </button>
                    <button
                        onClick={resetGame}
                        className="candy-btn bg-gradient-to-b from-red-400 to-red-600 text-white text-sm font-extrabold py-3 px-6 rounded-2xl shadow-[0_4px_0_#b91c1c] hover:shadow-[0_2px_0_#b91c1c] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]"
                    >
                        🔄 Reset
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-purple-300/60 text-[10px] font-bold uppercase tracking-[0.3em]">
                    Candy Crush • Sweet Engine v2.0
                </p>
            </div>
        </div>
    );
};

export default Game;
