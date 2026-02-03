import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { createInitialGrid, COLORS, GRID_SIZE, checkMatches } from './logic/GameLogic';

const Game = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [moves, setMoves] = useState(20);
    const pixiApp = useRef(null);
    const boardContainer = useRef(null);
    const sprites = useRef([]);
    const isBusy = useRef(false);

    useEffect(() => {
        // Init PixiJS with high performance settings
        pixiApp.current = new PIXI.Application({
            width: 360,
            height: 600,
            backgroundColor: 0x020617,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
        });
        canvasRef.current.appendChild(pixiApp.current.view);

        boardContainer.current = new PIXI.Container();
        pixiApp.current.stage.addChild(boardContainer.current);

        setupGame();

        return () => {
            pixiApp.current.destroy(true, true);
        };
    }, []);

    const setupGame = () => {
        const initialGrid = createInitialGrid();
        renderGrid(initialGrid);
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
        const g = new PIXI.Graphics();
        
        // Draw satisfying Neon Crystal
        g.beginFill(config.color);
        g.drawPolygon([0, -20, 15, 0, 0, 20, -15, 0]);
        g.endFill();
        
        // Shine/Highlight
        g.beginFill(0xffffff, 0.3);
        g.drawPolygon([-5, -10, 5, 0, -5, 10, -10, 0]);
        g.endFill();

        g.x = 50 + c * 52;
        g.y = 150 + r * 52;
        g.interactive = true;
        g.buttonMode = true;
        
        g.on('pointerdown', () => handleSelect(r, c));

        return g;
    };

    const [selected, setSelected] = useState(null);

    const handleSelect = (r, c) => {
        if (isBusy.current) return;

        if (!selected) {
            setSelected({ r, c });
            gsap.to(sprites.current[r][c].scale, { x: 1.2, y: 1.2, duration: 0.2 });
        } else {
            const dr = Math.abs(selected.r - r);
            const dc = Math.abs(selected.c - c);

            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                swap(selected.r, selected.c, r, c);
            } else {
                gsap.to(sprites.current[selected.r][selected.c].scale, { x: 1, y: 1, duration: 0.2 });
                setSelected({ r, c });
                gsap.to(sprites.current[r][c].scale, { x: 1.2, y: 1.2, duration: 0.2 });
            }
        }
    };

    const swap = async (r1, c1, r2, c2) => {
        isBusy.current = true;
        const s1 = sprites.current[r1][c1];
        const s2 = sprites.current[r2][c2];

        await Promise.all([
            gsap.to(s1, { x: s2.x, y: s2.y, duration: 0.3, ease: "power2.inOut" }),
            gsap.to(s2, { x: s1.x, y: s1.y, duration: 0.3, ease: "power2.inOut" })
        ]);

        // Logic swap... (simplified for this update)
        isBusy.current = false;
        setSelected(null);
        gsap.to(s1.scale, { x: 1, y: 1, duration: 0.2 });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
            <div className="mb-4 flex gap-10 text-center">
                <div>
                    <p className="text-xs text-purple-400 uppercase tracking-widest">Moves</p>
                    <p className="text-3xl font-black">{moves}</p>
                </div>
                <div>
                    <p className="text-xs text-cyan-400 uppercase tracking-widest">Score</p>
                    <p className="text-3xl font-black">{score}</p>
                </div>
            </div>
            <div ref={canvasRef} className="rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl" />
        </div>
    );
};

export default Game;
