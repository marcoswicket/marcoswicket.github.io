import * as PIXI from 'pixi.js';
import vertexShader from './clouds.vert?raw';
import fragmentShader from './clouds.frag?raw';

export class Clouds 
{
    constructor(app, camera, bird, worldWidth, worldHeight)
    {
        this.camera = camera;
        this.bird = bird;

        this.cloudSprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.cloudSprite.width = worldWidth;
        this.cloudSprite.height = worldHeight;
        this.position = { x: 0, y: 0 };
        this.cloudSprite.anchor.set(0.5);

        const geometry = new PIXI.Geometry({
            attributes: {
                aPosition: [
                    0, 0,
                    app.screen.width / camera.zoom, 0,
                    app.screen.width / camera.zoom, app.screen.height / camera.zoom,
                    0, app.screen.height / camera.zoom,
                ],
                aUV:
                    [
                        0, 0,
                        1, 0,
                        1, 1,
                        0, 1
                    ],
            },
            indexBuffer:
                [
                    0, 1,
                    2, 0,
                    2, 3
                ],
        });

        const shader = PIXI.Shader.from({
            gl: {
                vertex: vertexShader,
                fragment: fragmentShader,
            },
            resources: {
                data: {
                    uTime: { type: 'f32', value: 0.0 },
                    uResolution: { type: 'vec2<f32>', value: [1.0, 1.0] },
                    uWorldPosition: { type: 'vec2<f32>', value: [1.0, 1.0] },
                    uPlayerPosition: { type: 'vec2<f32>', value: [0.0, 0.0] },
                },
            },
        });

        this.quad = new PIXI.Mesh({ geometry, shader: shader });
        this.container = new PIXI.Container();
        this.container.zIndex = 0;

        this.container.addChild(this.quad);
        app.stage.addChild(this.container);
    }

    update(time)
    {
        this.quad.shader.resources.data.uniforms.uTime += time.deltaTime * 0.0005;
        this.quad.shader.resources.data.uniforms.uPlayerPosition = this.bird.getPositionNormalized();
        // console.log(this.quad.shader.resources.data.uniforms.uPlayerPosition);
        // this.plane.shader.resources.data.uniforms.uTime += time.deltaTime * 0.0025;
        // this.cloudFilter.resources.timeUniforms.uniforms.worldPosition = [this.position.x - this.camera.position.x / this.camera.zoom, this.position.y - this.camera.position.y / this.camera.zoom];
        // this.cloudSprite.x = this.camera.worldX / this.camera.zoom;
    }

    setPosition(position)
    {
        this.position = position;
    }
}