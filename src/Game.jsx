import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { createInitialGrid, COLORS, GRID_SIZE, TILE_SIZE, findMatches } from './logic/GameLogic';

const Game = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [moves, setMoves] = useState(20);
    const [gameState, setGameState] = useState('STARTING'); // STARTING, IDLE, BUSY, GAMEOVER
    
    const pixiApp = useRef(null);
    const boardContainer = useRef(null);
    const gridRef = useRef([]);
    const sprites = useRef([]);
    const selected = useRef(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        pixiApp.current = new PIXI.Application({
            width: 360,
            height: 520,
            backgroundColor: 0x020617,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });
        canvasRef.current.appendChild(pixiApp.current.view);

        boardContainer.current = new PIXI.Container();
        pixiApp.current.stage.addChild(boardContainer.current);

        startNewLevel(1);

        return () => {
            if (pixiApp.current) pixiApp.current.destroy(true, true);
        };
    }, []);

    const startNewLevel = (lvl) => {
        isProcessing.current = true;
        setGameState('STARTING');
        const newGrid = createInitialGrid(lvl);
        gridRef.current = newGrid;
        renderGrid(newGrid);
        isProcessing.current = false;
        setGameState('IDLE');
    };

    const renderGrid = (gridData) => {
        boardContainer.current.removeChildren();
        sprites.current = [];

        for (let r = 0; r < GRID_SIZE; r++) {
            sprites.current[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                const type = gridData[r][c];
                const sprite = createCrystalSprite(type, r, c);
                boardContainer.current.addChild(sprite);
                sprites.current[r][c] = sprite;
            }
        }
    };

    const createCrystalSprite = (type, r, c) => {
        const config = COLORS[type];
        const container = new PIXI.Container();
        
        const glow = new PIXI.Graphics();
        glow.beginFill(config.color, 0.2);
        glow.drawCircle(0, 0, 20);
        glow.endFill();

        const main = new PIXI.Graphics();
        main.beginFill(config.color);
        main.drawPolygon([0, -18, 14, 0, 0, 18, -14, 0]);
        main.endFill();
        
        const highlight = new PIXI.Graphics();
        highlight.beginFill(0xffffff, 0.4);
        highlight.drawPolygon([-4, -8, 4, 0, -4, 8, -8, 0]);
        highlight.endFill();

        container.addChild(glow, main, highlight);
        container.x = 45 + c * TILE_SIZE;
        container.y = 45 + r * TILE_SIZE;
        container.interactive = true;
        container.cursor = 'pointer';
        
        container.on('pointerdown', () => handleSelect(r, c));

        // Entrance animation
        container.scale.set(0);
        gsap.to(container.scale, { x: 1, y: 1, duration: 0.4, ease: "back.out(1.7)", delay: (r * 0.05) + (c * 0.02) });

        return container;
    };

    const handleSelect = async (r, c) => {
        if (isProcessing.current || moves <= 0) return;

        if (!selected.current) {
            selected.current = { r, c };
            gsap.to(sprites.current[r][c].scale, { x: 1.2, y: 1.2, duration: 0.2 });
        } else {
            const p1 = selected.current;
            const p2 = { r, c };
            const dr = Math.abs(p1.r - r);
            const dc = Math.abs(p1.c - c);

            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                setSelected(null);
                selected.current = null;
                await processSwap(p1.r, p1.c, p2.r, p2.c);
            } else {
                gsap.to(sprites.current[p1.r][p1.c].scale, { x: 1, y: 1, duration: 0.2 });
                selected.current = { r, c };
                gsap.to(sprites.current[r][c].scale, { x: 1.2, y: 1.2, duration: 0.2 });
            }
        }
    };

    const processSwap = async (r1, c1, r2, c2) => {
        isProcessing.current = true;
        setGameState('BUSY');
        
        const s1 = sprites.current[r1][c1];
        const s2 = sprites.current[r2][c2];

        // Animate swap
        await Promise.all([
            gsap.to(s1, { x: s2.x, y: s2.y, duration: 0.3, ease: "power2.inOut" }),
            gsap.to(s2, { x: s1.x, y: s1.y, duration: 0.3, ease: "power2.inOut" })
        ]);

        // Logic swap
        const tempType = gridRef.current[r1][c1];
        gridRef.current[r1][c1] = gridRef.current[r2][c2];
        gridRef.current[r2][c2] = tempType;
        
        sprites.current[r1][c1] = s2;
        sprites.current[r2][c2] = s1;

        const matches = findMatches(gridRef.current);
        if (matches.length > 0) {
            setMoves(m => m - 1);
            await handleMatches();
        } else {
            // Swap back
            await Promise.all([
                gsap.to(s1, { x: 45 + c1 * TILE_SIZE, y: 45 + r1 * TILE_SIZE, duration: 0.3, ease: "power2.inOut" }),
                gsap.to(s2, { x: 45 + c2 * TILE_SIZE, y: 45 + r2 * TILE_SIZE, duration: 0.3, ease: "power2.inOut" })
            ]);
            gridRef.current[r2][c2] = gridRef.current[r1][c1];
            gridRef.current[r1][c1] = tempType;
            sprites.current[r1][c1] = s1;
            sprites.current[r2][c2] = s2;
        }

        gsap.to(s1.scale, { x: 1, y: 1, duration: 0.2 });
        isProcessing.current = false;
        setGameState('IDLE');
    };

    const handleMatches = async () => {
        let matches = findMatches(gridRef.current);
        if (matches.length === 0) return;

        // Explode
        const anims = matches.map(m => {
            const s = sprites.current[m.r][m.c];
            gridRef.current[m.r][m.c] = null;
            return gsap.to(s.scale, { x: 0, y: 0, alpha: 0, duration: 0.3, ease: "back.in(2)" });
        });
        await Promise.all(anims);
        setScore(s => s + matches.length * 10);

        // Drop
        await refillGrid();
        await handleMatches(); // Cascade
    };

    const refillGrid = async () => {
        const dropAnims = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            let emptySlots = 0;
            for (let r = GRID_SIZE - 1; r >= 0; r--) {
                if (gridRef.current[r][c] === null) {
                    emptySlots++;
                } else if (emptySlots > 0) {
                    const sprite = sprites.current[r][c];
                    const newRow = r + emptySlots;
                    gridRef.current[newRow][c] = gridRef.current[r][c];
                    gridRef.current[r][c] = null;
                    sprites.current[newRow][c] = sprite;
                    sprites.current[r][c] = null;
                    dropAnims.push(gsap.to(sprite, { y: 45 + newRow * TILE_SIZE, duration: 0.4, ease: "bounce.out" }));
                }
            }
            // Spawn new
            for (let i = 0; i < emptySlots; i++) {
                const r = emptySlots - 1 - i;
                const type = Math.floor(Math.random() * COLORS.length);
                const sprite = createCrystalSprite(type, r, c);
                sprite.y = -100;
                boardContainer.current.addChild(sprite);
                gridRef.current[r][c] = type;
                sprites.current[r][c] = sprite;
                dropAnims.push(gsap.to(sprite, { y: 45 + r * TILE_SIZE, duration: 0.5, ease: "bounce.out", delay: i * 0.1 }));
            }
        }
        await Promise.all(dropAnims);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans p-4">
            <div className="w-full max-w-[360px]">
                <div className="flex justify-between items-end mb-6 px-2">
                    <div className="text-left">
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter">Level {level}</p>
                        <p className="text-4xl font-black text-white leading-none">{score}</p>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-2xl text-center backdrop-blur-md">
                        <p className="text-[10px] text-purple-400 font-bold uppercase">Moves</p>
                        <p className="text-2xl font-black leading-none">{moves}</p>
                    </div>
                </div>
                
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div ref={canvasRef} className="relative rounded-[1.8rem] overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900/50" />
                </div>
                
                <p className="mt-6 text-center text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
                    Neon Crush • Pro Engine v2
                </p>
            </div>
        </div>
    );
};

export default Game;
