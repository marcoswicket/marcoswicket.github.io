import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

import { Camera } from './src/camera/camera.js';
import { Bird } from './src/character/bird.js';
import { WorldMap } from './src/old/worldmap.js';
import { UI } from './src/ui/ui.js';

async function initGame()
{
    const app = new PIXI.Application();
    const worldWidth = 100000;
    const worldHeight = 100000;

    try
    {
        await app.init({
            background: '#1099bb',
            resizeTo: window,
            antialias: true,
            forceFXAA: false,
            powerPreference: "high-performance",
            backgroundColor: 0x1099bb
        });

        console.log('Renderer type:', app.renderer.type);

        document.body.appendChild(app.canvas);

        const engine = Matter.Engine.create();
        const world = engine.world;
        engine.gravity.y = 0.5;

        const gameContainer = new PIXI.Container();
        const backgroundContainer = new PIXI.Container();
        const mainContainer = new PIXI.Container();

        const camera = new Camera(app);
        camera.setBounds(0, 0, worldWidth, worldHeight);

        camera.worldContainer.addChild(backgroundContainer);
        camera.worldContainer.addChild(mainContainer);
        camera.worldContainer.addChild(gameContainer);

        // create environment
        const worldmap = new WorldMap(app);
        worldmap.layers.forEach(layer =>
        {
            backgroundContainer.addChild(layer.container);
        });
        worldmap.setCamera(camera);

        // create player
        const bird = new Bird(app, engine, camera);
        bird.setupControls(app);
        gameContainer.addChild(bird.graphics);

        camera.setZoom(0.5, 10);
        camera.follow(bird);

        const ui = new UI(app, bird);

        Matter.Runner.run(engine);
        app.ticker.add((time) =>
        {
            Matter.Engine.update(engine);
            bird.update();
            camera.update();
            ui.update(time);
        });

    } catch (error)
    {
        console.error('Error initializing game:', error);
    }
}

initGame().catch(console.error);