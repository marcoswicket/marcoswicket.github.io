import * as PIXI from 'pixi.js';

import vertexShader from './background.vert?raw';
import fragmentShader from './background.frag?raw';

export class BackgroundShader
{
	constructor(app, container, worldWidth, worldHeight)
	{
		this.background = new PIXI.Sprite(PIXI.Texture.WHITE);
		this.background.width = worldWidth;
		this.background.height = worldHeight;

		this.filter = new PIXI.Filter({
			glProgram: new PIXI.GlProgram({
				vertex: vertexShader,
				fragment: fragmentShader,
				name: 'background-shader'
			}),
			resources: {
				timeUniforms: {
					uTime: { value: 0.0, type: 'f32' },
					uResolution: { value: [app.screen.width, app.screen.height], type: 'vec2<f32>' },
					uWorldSize: { value: [worldWidth, worldHeight], type: 'vec2<f32>' },
					uOffset: { value: [0.0, 0.0], type: 'vec2<f32>' },
					uPlayerVelocity: { value: [0.0, 0.0], type: 'vec2<f32>' },
					uPlayerPos: { value: [0.0, 0.0], type: 'vec2<f32>' },
					uColor1: { value: [0.1, 0.3, 0.5], type: 'vec3<f32>' },
					uColor2: { value: [0.8, 0.2, 0.3], type: 'vec3<f32>' }
				},
			},
		});

		this.background.filters = [this.filter];

		container.addChild(this.background);
	}

	update(deltaTime)
	{
		this.filter.resources.timeUniforms.uniforms.uTime += 1.0 + deltaTime;

		if (this.camera)
		{
			this.filter.resources.timeUniforms.uniforms.uOffset = [-this.camera.position.x, -this.camera.position.y];
		}
	}

	setCamera(camera)
	{
		this.camera = camera;
	}

	setColors(color1, color2)
	{
		this.filter.resources.timeUniforms.uniforms.uColor1 = color1;
		this.filter.resources.timeUniforms.uniforms.uColor2 = color2;
	}

	setPlayerValues(playerVelocity, playerPos)
	{
		this.filter.resources.timeUniforms.uniforms.uPlayervelocity = playerVelocity;
		this.filter.resources.timeUniforms.uniforms.uPlayerPos = playerPos;
	}
}