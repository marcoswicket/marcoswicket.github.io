import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

import { Camera } from './src/camera/camera.js';
import { Bird } from './src/character/bird.js';
import { WorldMap } from './src/old/worldmap.js';
import { UI } from './src/ui/ui.js';
import { Clouds } from './src/shaders/clouds/clouds.js';
import { ParallaxBackground } from './src/environment/parallax/parallaxbackground.js'

async function initGame()
{
	const app = new PIXI.Application();
	const worldWidth = 500;
	const worldHeight = 500;

	try
	{
		await app.init({
			background: '#1099bb',
			width: window.innerWidth,
			height: window.innerHeight,
			resolution: window.devicePixelRatio,
			resizeTo: window,
			antialias: true,
			forceFXAA: false,
			powerPreference: "high-performance",
			backgroundColor: 0x1099bb
		});

		document.body.appendChild(app.canvas);
		app.renderer.gl.enable(app.renderer.gl.BLEND);
		app.renderer.gl.blendFunc(
			app.renderer.gl.SRC_ALPHA,
			app.renderer.gl.ONE_MINUS_SRC_ALPHA
		);
		const engine = Matter.Engine.create();
		engine.gravity.y = 0.5;

		const backgroundContainer = new PIXI.Container();
		const gameContainer = new PIXI.Container();
		const mainContainer = new PIXI.Container();

		backgroundContainer.zIndex = 0;
		gameContainer.zIndex = 2;
		mainContainer.zIndex = 4;

		const camera = new Camera(app);
		camera.setBounds(0, 0, worldWidth, worldHeight);

		camera.worldContainer.addChild(backgroundContainer);
		camera.worldContainer.addChild(mainContainer);
		camera.worldContainer.addChild(gameContainer);
		camera.setZoom(0.5, 0);

		// create environment
		const worldmap = new WorldMap(app);
		worldmap.layers.forEach(layer =>
		{
			backgroundContainer.addChild(layer.container);
		});
		worldmap.setCamera(camera);

		const bird = new Bird(app, engine, camera, { x: worldWidth, y: worldHeight });
		bird.setupControls(app);

		const clouds = new Clouds(app, camera, bird, worldWidth, worldHeight);

		gameContainer.addChild(bird.graphics);
		camera.follow(bird);

		const ui = new UI(app, bird);

		Matter.Runner.run(engine);

		app.ticker.add((time) =>
		{
			Matter.Engine.update(engine);
			bird.update();
			camera.update();
			ui.update(time);
			clouds.update(time);
			worldmap.update(bird.getPosition().x);

			if (bird.getPosition().x < 0 || bird.getPosition().x > worldWidth ||
				bird.getPosition().y < 0 || bird.getPosition().y > worldHeight)
			{
				camera.shake();
				bird.setPosition(worldWidth / 2, worldHeight / 2);

				console.log(bird.getPosition());
			}

		});

	} catch (error)
	{
		console.error('Error initializing game:', error);
	}
}

initGame().catch(console.error);
