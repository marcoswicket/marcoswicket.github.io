import * as PIXI from 'pixi.js';

export class ParallaxBackground
{
	constructor(app, camera)
	{
		this.app = app;
		this.camera = camera;
		this.layers = [];

		this.container = new PIXI.Container();
		this.container.zIndex = 1;
		camera.worldContainer.addChild(this.container);

		// Store screen dimensions for reference
		this.screenWidth = app.screen.width;
		this.screenHeight = app.screen.height;

		// Listen for resize events
		window.addEventListener('resize', () =>
		{
			this.screenWidth = app.screen.width;
			this.screenHeight = app.screen.height;
			this.recreateLayers();
		});
	}

	recreateLayers()
	{
		const oldLayers = [...this.layers];
		this.layers = [];
		this.container.removeChildren();

		oldLayers.forEach(layer =>
		{
			if (layer.type === 'mountains')
			{
				this.addMountainsLayer(layer.config, layer.speed);
			} else if (layer.type === 'buildings')
			{
				this.addBuildingsLayer(layer.config, layer.speed);
			} else if (layer.type === 'nature')
			{
				this.addNatureLayer(layer.config, layer.speed);
			}
		});
	}

	createBaseLayer(speed)
	{
		return {
			container: new PIXI.Container(),
			sprites: [],
			speed: speed
		};
	}

	addMountainsLayer(config, speed)
	{
		const layer = this.createBaseLayer(speed);
		layer.type = 'mountains';
		layer.config = config;
		const mountains = this.createMountains(config);
		layer.container.addChild(mountains);
		layer.sprites.push(mountains);
		this.finalizeLayerCreation(layer);
	}

	addBuildingsLayer(config, speed)
	{
		const layer = this.createBaseLayer(speed);
		layer.type = 'buildings';
		layer.config = config;
		const buildings = this.createBuildings(config);
		layer.container.addChild(buildings);
		layer.sprites.push(buildings);
		this.finalizeLayerCreation(layer);
	}

	addNatureLayer(config, speed)
	{
		const layer = this.createBaseLayer(speed);
		layer.type = 'nature';
		layer.config = config;
		const vegetation = this.createVegetation(config);
		layer.container.addChild(vegetation);
		layer.sprites.push(vegetation);
		this.finalizeLayerCreation(layer);
	}

	createMountains(config)
	{
		const graphics = new PIXI.Graphics();
		const width = this.screenWidth * 1.5;

		graphics.beginFill(config.color);
		graphics.moveTo(0, this.screenHeight);

		const mountainCount = config.mountainCount || Math.ceil(width / 200);
		const segmentWidth = width / mountainCount;

		for (let i = 0; i <= mountainCount; i++)
		{
			const x = i * segmentWidth;
			const height = config.baseHeight + Math.random() * config.heightVariation;

			if (i === 0)
			{
				graphics.moveTo(x, this.screenHeight);
			}
			graphics.lineTo(x, this.screenHeight - height);
			if (i < mountainCount)
			{
				graphics.lineTo(
					x + segmentWidth / 2,
					this.screenHeight - (height * 0.7 + Math.random() * height * 0.3)
				);
			}
		}

		graphics.lineTo(width, this.screenHeight);
		graphics.endFill();

		return graphics;
	}

	createBuildings(config)
	{
		const graphics = new PIXI.Graphics();
		const width = this.screenWidth * 1.5;

		const defaultConfig = {
			color: 0x333333,
			baseHeight: this.screenHeight * 0.4,
			heightVariation: this.screenHeight * 0.2,
			buildingWidth: this.screenWidth * 0.05,
			spacing: this.screenWidth * 0.01,
			windows: true,
			windowColor: 0xFFFF99,
			rows: 1,
			groundHeight: this.screenHeight * 0.1
		};

		const finalConfig = { ...defaultConfig, ...config };

		for (let row = 0; row < finalConfig.rows; row++)
		{
			let x = 0;
			while (x < width)
			{
				const height = finalConfig.baseHeight + Math.random() * finalConfig.heightVariation;
				const y = this.screenHeight - height + (row * (finalConfig.baseHeight / 2));

				graphics.beginFill(finalConfig.color);
				graphics.drawRect(x, y, finalConfig.buildingWidth, height);
				graphics.endFill();

				if (finalConfig.windows)
				{
					this.addBuildingWindows(graphics, x, y, finalConfig.buildingWidth, height, finalConfig.windowColor);
				}

				x += finalConfig.buildingWidth + finalConfig.spacing;
			}
		}

		return graphics;
	}

	addBuildingWindows(graphics, x, y, width, height, windowColor)
	{
		const windowSize = width * 0.15;
		const windowSpacing = width * 0.25;
		const windowMargin = width * 0.2;

		graphics.beginFill(windowColor);
		for (let wx = x + windowMargin; wx < x + width - windowMargin; wx += windowSpacing)
		{
			for (let wy = y + windowMargin; wy < y + height - windowMargin; wy += windowSpacing)
			{
				if (Math.random() > 0.3)
				{
					graphics.drawRect(wx, wy, windowSize, windowSize);
				}
			}
		}
		graphics.endFill();
	}

	createVegetation(config)
	{
		const graphics = new PIXI.Graphics();
		const width = this.screenWidth * 1.5;

		const defaultConfig = {
			color: 0x225522,
			treeCount: Math.ceil(width / 50),
			treeSpacing: this.screenWidth * 0.1,
			baseTreeHeight: this.screenHeight * 0.2,
			treeHeightVariation: this.screenHeight * 0.1,
			trunkColor: 0x663300,
			groundHeight: this.screenHeight * 0.1,
			treeWidth: this.screenWidth * 0.03
		};

		const finalConfig = { ...defaultConfig, ...config };

		for (let i = 0; i < finalConfig.treeCount; i++)
		{
			const x = i * finalConfig.treeSpacing;
			const height = finalConfig.baseTreeHeight + Math.random() * finalConfig.treeHeightVariation;
			const baseY = this.screenHeight - finalConfig.groundHeight;

			// Tree trunk
			graphics.beginFill(finalConfig.trunkColor);
			graphics.drawRect(x, baseY - height / 3, finalConfig.treeWidth * 0.2, height / 3);
			graphics.endFill();

			// Tree top
			graphics.beginFill(finalConfig.color);
			graphics.moveTo(x - finalConfig.treeWidth * 0.4, baseY - height / 3);
			graphics.lineTo(x + finalConfig.treeWidth * 0.1, baseY - height);
			graphics.lineTo(x + finalConfig.treeWidth * 0.6, baseY - height / 3);
			graphics.endFill();
		}

		return graphics;
	}

	update(worldX, worldY)
	{
		const zoom = this.camera.zoom;

		this.layers.forEach(layer =>
		{
			const offsetX = -worldX * layer.speed;
			const offsetY = -worldY * layer.speed * 0.5; // Reduce vertical parallax

			layer.container.position.x = offsetX;
			layer.container.position.y = offsetY;

			// Wrap the layer horizontally if it moves too far
			const layerWidth = layer.sprites[0].width;
			if (Math.abs(offsetX) > layerWidth)
			{
				layer.container.position.x = offsetX % layerWidth;
			}
		});
	}

	finalizeLayerCreation(layer)
	{
		this.container.addChild(layer.container);
		this.layers.push(layer);
	}
}