import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

import { Camera } from './src/camera/camera.js';
import { Bird } from './src/character/bird.js';
import { WorldMap } from './src/old/worldmap.js';
import { UI } from './src/ui/ui.js';
// import { BackgroundShader } from './src/shaders/background/backgroundshader.js';

const app = new PIXI.Application();
const worldWidth = 100000;
const worldHeight = 100000;

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

// const backgroundShader = new BackgroundShader(
//     app,
//     backgroundContainer,
//     worldWidth,
//     worldHeight
// );

// backgroundShader.setCamera(camera);

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
    // worldmap.update(bird.getWorldX());
    camera.update();
    ui.update(time);

    // if (bird.getWorldY() > app.screen.height + 100 || bird.getWorldY() < -100)
    // {
    //     bird.worldY = app.screen.height / 2;
    //     bird.velocity.y = 0;
    //     bird.boostForce = 0; // Reset boost when resetting position
    //     camera.shake(10, 200);
    // }

    // backgroundShader.update(time.deltaTime);
    // backgroundShader.setPlayerValues(bird.getVelocity(), { x: bird.getWorldX, y: bird.getWorldY })
});